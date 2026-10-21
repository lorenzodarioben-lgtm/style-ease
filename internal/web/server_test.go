package web

import (
	"bytes"
	"compress/gzip"
	"context"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/database"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/testsupport"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"regexp"
	"strings"
	"testing"
	"time"
)

func TestGuestIssuanceCapBeforeDatabase(t *testing.T) {
	s, _ := New(nil, "http://127.0.0.1:8080", false)
	s.limits["issue:192.0.2.1"] = bucket{Start: time.Now(), Count: 90}
	w := httptest.NewRecorder()
	s.Handler().ServeHTTP(w, httptest.NewRequest("GET", "http://127.0.0.1:8080/shop", nil))
	if w.Code != 429 || len(w.Result().Cookies()) != 0 {
		t.Fatal("new guest rate cap did not apply before DB allocation", w.Code)
	}
}

func TestCompressionAndQuality(t *testing.T) {
	for value, want := range map[string]bool{"gzip": true, "br, gzip;q=0.5": true, "gzip;q=0": false, "br": false} {
		if acceptsGzip(value) != want {
			t.Fatal(value)
		}
	}
	h := compress(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Header().Set("Content-Length", "1000")
		w.Write([]byte("<h1>Actual server HTML</h1>"))
	}))
	r := httptest.NewRequest("GET", "/shop", nil)
	r.Header.Set("Accept-Encoding", "gzip")
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	if w.Header().Get("Content-Encoding") != "gzip" || w.Header().Get("Content-Length") != "" {
		t.Fatal(w.Header())
	}
	reader, e := gzip.NewReader(bytes.NewReader(w.Body.Bytes()))
	if e != nil {
		t.Fatal(e)
	}
	body, e := io.ReadAll(reader)
	if e != nil || !strings.Contains(string(body), "Actual server HTML") {
		t.Fatal(e, string(body))
	}
}

func TestOriginConfigAndReturnSafety(t *testing.T) {
	for _, raw := range []string{"https://evil.example", "http://example.com", "javascript:alert(1)", "http://127.0.0.1/path"} {
		if _, e := New(nil, raw, false); e == nil {
			t.Fatal("unsafe development origin", raw)
		}
	}
	if _, e := New(nil, "http://localhost:8080", true); e == nil {
		t.Fatal("insecure production origin")
	}
	for _, raw := range []string{"//evil.example", "https://evil.example", "/\\evil", "/\nLocation: bad"} {
		if safeReturn(raw) != "/bag" {
			t.Fatal(raw)
		}
	}
	if safeReturn("/shop?q=shirt") != "/shop?q=shirt" {
		t.Fatal("safe return lost")
	}
}
func TestHTTPIntegration(t *testing.T) {
	db := testsupport.DB(t)
	s, e := New(db, "http://127.0.0.1:8080", false)
	if e != nil {
		t.Fatal(e)
	}
	handler := s.Handler()
	var cookie *http.Cookie
	csrf := ""
	request := func(method, path string, form url.Values, headers map[string]string) *httptest.ResponseRecorder {
		t.Helper()
		var body io.Reader
		if form != nil {
			body = strings.NewReader(form.Encode())
		}
		r := httptest.NewRequest(method, "http://127.0.0.1:8080"+path, body)
		if form != nil {
			r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		}
		if cookie != nil {
			r.AddCookie(cookie)
		}
		for k, v := range headers {
			r.Header.Set(k, v)
		}
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, r)
		if cookies := w.Result().Cookies(); len(cookies) > 0 {
			cookie = cookies[0]
		}
		return w
	}
	w := request("GET", "/products/geometric-t-shirt", nil, nil)
	if w.Code != 200 {
		t.Fatal(w.Code, w.Body.String())
	}
	re := regexp.MustCompile(`name="csrf" value="([a-f0-9]+)"`)
	matches := re.FindStringSubmatch(w.Body.String())
	if len(matches) != 2 {
		t.Fatal("CSRF input missing")
	}
	csrf = matches[1]
	if !cookie.HttpOnly || cookie.SameSite != http.SameSiteLaxMode || cookie.Secure {
		t.Fatal("wrong development cookie flags", cookie)
	}
	t.Run("representations", func(t *testing.T) {
		for _, tc := range []struct {
			headers map[string]string
			full    bool
		}{{nil, true}, {map[string]string{"HX-Request-Type": "partial"}, false}, {map[string]string{"HX-Request-Type": "full"}, true}, {map[string]string{"HX-Request": "true"}, true}} {
			w := request("GET", "/shop?q=cotton", nil, tc.headers)
			if w.Code != 200 || strings.Contains(w.Body.String(), "<!doctype html>") != tc.full {
				t.Fatal("representation mismatch", tc, w.Code)
			}
			if !strings.Contains(w.Header().Get("Vary"), "HX-Request-Type") {
				t.Fatal("missing Vary")
			}
		}
	})
	t.Run("csrf", func(t *testing.T) {
		for _, tc := range []struct {
			token   string
			headers map[string]string
		}{{"", nil}, {"forged", nil}, {csrf, map[string]string{"Origin": "https://evil.example"}}, {csrf, map[string]string{"Sec-Fetch-Site": "cross-site"}}, {csrf, map[string]string{"Referer": "https://evil.example/"}}} {
			w := request("POST", "/actions", url.Values{"csrf": {tc.token}, "action": {"add"}}, tc.headers)
			if w.Code != 403 {
				t.Fatal("CSRF accepted", w.Code)
			}
		}
	})
	t.Run("trusted totals and idempotency", func(t *testing.T) {
		w := request("POST", "/actions", url.Values{"csrf": {csrf}, "action": {"add"}, "slug": {"geometric-t-shirt"}, "size": {"M"}, "color": {"Black"}, "quantity": {"1"}, "price": {"1"}, "return": {"/bag"}}, nil)
		if w.Code != 303 {
			t.Fatal(w.Code, w.Body.String())
		}
		key := database.Token()
		form := url.Values{"csrf": {csrf}, "confirm": {"demo"}, "key": {key}, "total": {"1"}}
		first := request("POST", "/checkout", form, nil)
		second := request("POST", "/checkout", form, nil)
		if first.Code != 303 || first.Header().Get("Location") != second.Header().Get("Location") {
			t.Fatal("checkout retry failed", first.Code, second.Code)
		}
		receipt := request("GET", strings.Split(first.Header().Get("Location"), "?")[0], nil, nil)
		if receipt.Code != 200 || !strings.Contains(receipt.Body.String(), "$75.00") {
			t.Fatal("forged price honored", receipt.Code)
		}
		owner := cookie
		cookie = nil
		other := request("GET", strings.Split(first.Header().Get("Location"), "?")[0], nil, nil)
		if other.Code != 404 {
			t.Fatal("receipt enumeration", other.Code)
		}
		cookie = owner
	})
	t.Run("escaping and route sweep", func(t *testing.T) {
		w := request("POST", "/reviews", url.Values{"csrf": {csrf}, "product": {"1"}, "rating": {"4"}, "comment": {"<script>alert(1)</script>"}, "return": {"/products/geometric-t-shirt"}}, nil)
		if w.Code != 303 {
			t.Fatal(w.Code)
		}
		w = request("GET", "/products/geometric-t-shirt", nil, nil)
		if strings.Contains(w.Body.String(), "<script>alert(1)</script>") || !strings.Contains(w.Body.String(), "&lt;script&gt;") {
			t.Fatal("stored HTML injection")
		}
		for path, status := range map[string]int{"/": 200, "/collections": 200, "/editorial": 200, "/collections/structure": 200, "/studio": 200, "/wishlist": 200, "/compare": 200, "/orders": 200, "/bag": 200, "/checkout": 200, "/about": 200, "/privacy": 200, "/quick/geometric-t-shirt": 200, "/missing": 404, "/products/none": 404, "/product/1": 301, "/products": 301, "/cart": 301, "/healthz": 200, "/readyz": 200} {
			w = request("GET", path, nil, nil)
			if w.Code != status {
				t.Errorf("%s: got %d want %d", path, w.Code, status)
			}
		}
		w = request("GET", "/bag", nil, nil)
		if w.Header().Get("Cache-Control") != "no-store" || strings.Contains(w.Header().Get("Content-Security-Policy"), "unsafe-") {
			t.Fatal("privacy/CSP headers")
		}
	})
	t.Run("invalid payload and methods", func(t *testing.T) {
		w := request("POST", "/actions", url.Values{"csrf": {csrf}, "action": {"add"}, "slug": {"geometric-t-shirt"}, "size": {"forged"}, "color": {"Black"}}, nil)
		if w.Code != 422 {
			t.Fatal(w.Code)
		}
		w = request("DELETE", "/bag", nil, nil)
		if w.Code != 405 {
			t.Fatal(w.Code)
		}
		w = request("POST", "/reviews", url.Values{"csrf": {csrf}, "comment": {strings.Repeat("x", 20000)}}, nil)
		if w.Code != 413 {
			t.Fatal(w.Code)
		}
	})
	t.Run("rate limit", func(t *testing.T) {
		last := 0
		for i := 0; i < 95; i++ {
			last = request("POST", "/actions", url.Values{"csrf": {csrf}, "action": {"invalid"}}, nil).Code
		}
		if last != 429 {
			t.Fatal("mutation cap absent", last)
		}
	})
	t.Run("expired cookie becomes new guest", func(t *testing.T) {
		key := Hash(cookie.Value)
		if _, e := db.Pool.Exec(context.Background(), `UPDATE guest_sessions SET expires_at=now()-interval '1 second' WHERE token_hash=$1`, key); e != nil {
			t.Fatal(e)
		}
		old := cookie.Value
		w := request("GET", "/orders", nil, nil)
		if w.Code != 200 || cookie.Value == old || strings.Contains(w.Body.String(), "DEMO-") {
			t.Fatal("expired session inherited data")
		}
	})
}
func TestDatabaseOutage(t *testing.T) {
	db := testsupport.DB(t)
	s, _ := New(db, "http://127.0.0.1:8080", false)
	db.Pool.Close()
	for _, path := range []string{"/", "/readyz", "/healthz"} {
		w := httptest.NewRecorder()
		s.Handler().ServeHTTP(w, httptest.NewRequest("GET", path, nil))
		want := 503
		if path == "/healthz" {
			want = 200
		}
		if w.Code != want {
			t.Fatal(path, w.Code)
		}
		if strings.Contains(w.Body.String(), "postgres://") {
			t.Fatal("secret in error")
		}
	}
}
func TestArchivedSelectionRecoveryHTTP(t *testing.T) {
	db := testsupport.DB(t)
	token := database.Token()
	session, e := db.CreateSession(context.Background(), Hash(token))
	if e != nil {
		t.Fatal(e)
	}
	ps, e := db.Catalog(context.Background())
	if e != nil {
		t.Fatal(e)
	}
	variant := ps[0].Variants[0].ID
	if e = db.Mutate(context.Background(), session.Key, "add", variant, 1); e != nil {
		t.Fatal(e)
	}
	if _, e = db.Pool.Exec(context.Background(), `UPDATE products SET active=false WHERE id=1`); e != nil {
		t.Fatal(e)
	}
	s, _ := New(db, "http://127.0.0.1:8080", false)
	h := s.Handler()
	for _, path := range []string{"/bag", "/checkout"} {
		r := httptest.NewRequest("GET", path, nil)
		r.AddCookie(&http.Cookie{Name: "style_guest", Value: token})
		w := httptest.NewRecorder()
		h.ServeHTTP(w, r)
		if w.Code != 200 || !strings.Contains(strings.ToLower(w.Body.String()), "selection needs attention") {
			t.Fatal(path, w.Code, "missing recovery guidance")
		}
		if path == "/bag" && !strings.Contains(w.Body.String(), `value="remove" formnovalidate`) {
			t.Fatal("inactive selection has no validation-independent remove action")
		}
	}
}
