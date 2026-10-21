package web

import (
	"context"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"errors"
	"fmt"
	"io/fs"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/a-h/templ"
	"github.com/jackc/pgx/v5"
	styleease "github.com/lorenzodarioben-lgtm/style-ease"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/database"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/domain"
	"github.com/lorenzodarioben-lgtm/style-ease/views"
)

type Server struct {
	DB         *database.DB
	Origin     string
	Production bool
	mu         sync.Mutex
	limits     map[string]bucket
}
type bucket struct {
	Start time.Time
	Count int
}

var errSessionRate = errors.New("Too many new guest sessions. Wait one minute and try again.")

func New(db *database.DB, origin string, production bool) (*Server, error) {
	u, e := url.Parse(origin)
	if e != nil || u.Host == "" || u.Path != "" || u.User != nil || u.RawQuery != "" || u.Fragment != "" {
		return nil, fmt.Errorf("invalid APP_ORIGIN")
	}
	if production && u.Scheme != "https" {
		return nil, fmt.Errorf("HTTPS APP_ORIGIN required in production")
	}
	if !production {
		host := u.Hostname()
		ip := net.ParseIP(host)
		if u.Scheme != "http" || !(host == "localhost" || (ip != nil && ip.IsLoopback())) {
			return nil, fmt.Errorf("development origin must be HTTP loopback")
		}
	}
	return &Server{DB: db, Origin: origin, Production: production, limits: map[string]bucket{}}, nil
}
func Hash(token string) string { h := sha256.Sum256([]byte(token)); return hex.EncodeToString(h[:]) }
func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	static, _ := fs.Sub(styleease.Resources, "assets")
	mux.Handle("GET /assets/", http.StripPrefix("/assets/", http.FileServer(http.FS(static))))
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		fmt.Fprintln(w, "ok")
	})
	mux.HandleFunc("GET /readyz", func(w http.ResponseWriter, r *http.Request) {
		var seeded bool
		if e := s.DB.Pool.QueryRow(r.Context(), `SELECT EXISTS(SELECT 1 FROM products WHERE active)`).Scan(&seeded); e != nil || !seeded {
			http.Error(w, "database unavailable", 503)
			return
		}
		fmt.Fprintln(w, "ready")
	})
	mux.HandleFunc("/", s.handle)
	return compress(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := database.Token()[:16]
		w.Header().Set("X-Request-ID", id)
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")
		w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'")
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("Vary", "Cookie, HX-Request-Type")
		if s.Production {
			w.Header().Set("Strict-Transport-Security", "max-age=31536000")
		}
		ctx, cancel := context.WithTimeout(r.Context(), 12*time.Second)
		defer cancel()
		r = r.WithContext(ctx)
		defer func() {
			if p := recover(); p != nil {
				slog.Error("request panic", "request_id", id)
				http.Error(w, "The studio is temporarily unavailable. Please try again.", 500)
			}
		}()
		if strings.HasPrefix(r.URL.Path, "/assets/") {
			w.Header().Set("Cache-Control", "public, max-age=3600")
			if r.URL.Query().Get("v") != "" || r.URL.Path == "/assets/js/htmx-4.0.0.min.js" {
				w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
			}
		}
		mux.ServeHTTP(w, r)
	}))
}
func (s *Server) session(w http.ResponseWriter, r *http.Request) (domain.Session, error) {
	if c, e := r.Cookie("style_guest"); e == nil && len(c.Value) == 64 {
		if _, e = hex.DecodeString(c.Value); e == nil {
			session, e := s.DB.Session(r.Context(), Hash(c.Value))
			if e == nil {
				return session, nil
			}
			if !errors.Is(e, pgx.ErrNoRows) {
				return session, e
			}
		}
	}
	host, _, _ := net.SplitHostPort(r.RemoteAddr)
	if !s.allowed("issue:" + host) {
		return domain.Session{}, errSessionRate
	}
	token := database.Token()
	session, e := s.DB.CreateSession(r.Context(), Hash(token))
	if e != nil {
		return session, e
	}
	http.SetCookie(w, &http.Cookie{Name: "style_guest", Value: token, Path: "/", HttpOnly: true, Secure: s.Production, SameSite: http.SameSiteLaxMode, Expires: session.Expires, MaxAge: 30 * 86400})
	return session, nil
}
func (s *Server) allowed(key string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	b := s.limits[key]
	if now.Sub(b.Start) > time.Minute {
		b = bucket{Start: now}
	}
	b.Count++
	if len(s.limits) > 10000 {
		for k, v := range s.limits {
			if now.Sub(v.Start) > time.Minute {
				delete(s.limits, k)
			}
		}
		if len(s.limits) > 10000 {
			return false
		}
	}
	s.limits[key] = b
	return b.Count <= 90
}
func (s *Server) csrf(w http.ResponseWriter, r *http.Request, session domain.Session) bool {
	if r.Header.Get("Sec-Fetch-Site") == "cross-site" {
		s.problem(w, r, 403, "Request not accepted", "Return to the shop and try again.")
		return false
	}
	if origin := r.Header.Get("Origin"); origin != "" && origin != s.Origin {
		s.problem(w, r, 403, "Request not accepted", "Use the original shop tab to continue.")
		return false
	}
	if r.Header.Get("Origin") == "" && r.Referer() != "" {
		u, e := url.Parse(r.Referer())
		if e != nil || u.Scheme+"://"+u.Host != s.Origin {
			s.problem(w, r, 403, "Request not accepted", "Return to the original shop tab.")
			return false
		}
	}
	r.Body = http.MaxBytesReader(w, r.Body, 16*1024)
	if e := r.ParseForm(); e != nil {
		s.problem(w, r, 413, "Form too large", "Use a shorter form and try again.")
		return false
	}
	if subtle.ConstantTimeCompare([]byte(r.PostForm.Get("csrf")), []byte(session.CSRF)) != 1 {
		s.problem(w, r, 403, "This form has expired", "Reload the page and try again.")
		return false
	}
	if !s.allowed(session.Key) {
		w.Header().Set("Retry-After", "60")
		s.problem(w, r, 429, "A moment, please", "Too many changes. Wait one minute and try again.")
		return false
	}
	return true
}
func (s *Server) render(w http.ResponseWriter, r *http.Request, status int, c templ.Component) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(status)
	if e := c.Render(r.Context(), w); e != nil {
		slog.Error("render failed", "request_id", w.Header().Get("X-Request-ID"))
	}
}
func (s *Server) problem(w http.ResponseWriter, r *http.Request, status int, title, message string) {
	if r.Header.Get("HX-Request-Type") == "partial" {
		s.render(w, r, status, views.FragmentProblem(title, message, status, r.Header.Get("HX-Target") == "section#shop-results"))
		return
	}
	s.render(w, r, status, views.Problem(title, message, status))
}
func (s *Server) failure(w http.ResponseWriter, r *http.Request, e error) {
	if errors.Is(e, errSessionRate) {
		w.Header().Set("Retry-After", "60")
		s.problem(w, r, 429, "A moment, please", e.Error())
		return
	}
	if errors.Is(e, domain.ErrInvalid) || errors.Is(e, domain.ErrCapacity) || errors.Is(e, domain.ErrLimit) {
		s.problem(w, r, 422, "Let's adjust that selection", e.Error())
		return
	}
	if errors.Is(e, domain.ErrNotFound) {
		s.problem(w, r, 404, "Piece not found", "Browse the collection to find something else.")
		return
	}
	slog.Error("database operation failed", "request_id", w.Header().Get("X-Request-ID"))
	s.problem(w, r, 503, "The studio is taking a moment", "Your changes were not confirmed. Please retry when the database is available.")
}
func safeReturn(v string) string {
	u, e := url.Parse(v)
	if e != nil || u.IsAbs() || u.Host != "" || !strings.HasPrefix(u.Path, "/") || strings.HasPrefix(v, "//") || strings.ContainsAny(v, "\\\r\n") || len(v) > 800 {
		return "/bag"
	}
	return u.String()
}
func (s *Server) redirect(w http.ResponseWriter, r *http.Request, path, message string) {
	u, _ := url.Parse(safeReturn(path))
	q := u.Query()
	if message != "" {
		q.Set("notice", message)
	}
	u.RawQuery = q.Encode()
	http.Redirect(w, r, u.String(), http.StatusSeeOther)
}
func find(products []domain.Product, slug string) (domain.Product, bool) {
	for _, p := range products {
		if p.Slug == slug {
			return p, true
		}
	}
	return domain.Product{}, false
}
func (s *Server) handle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodPost {
		w.Header().Set("Allow", "GET, POST")
		s.problem(w, r, 405, "Method not supported", "Use the shop links or forms to continue.")
		return
	}
	session, e := s.session(w, r)
	if e != nil {
		s.failure(w, r, e)
		return
	}
	if r.Method == http.MethodPost && !s.csrf(w, r, session) {
		return
	}
	products, e := s.DB.Catalog(r.Context())
	if e != nil {
		s.failure(w, r, e)
		return
	}
	if r.Method == http.MethodPost {
		s.post(w, r, session, products)
		return
	}
	if strings.HasPrefix(r.URL.Path, "/product/") {
		id, _ := strconv.Atoi(strings.TrimPrefix(r.URL.Path, "/product/"))
		for _, p := range products {
			if p.ID == id {
				http.Redirect(w, r, "/products/"+p.Slug, 301)
				return
			}
		}
		s.problem(w, r, 404, "Piece not found", "This legacy product number is not in the collection.")
		return
	}
	if r.URL.Path == "/cart" {
		http.Redirect(w, r, "/bag", 301)
		return
	}
	if r.URL.Path == "/products" {
		http.Redirect(w, r, "/shop?"+r.URL.RawQuery, 301)
		return
	}
	if strings.HasPrefix(r.URL.Path, "/products/") {
		if p, ok := find(products, strings.TrimPrefix(r.URL.Path, "/products/")); ok {
			if e = s.DB.Recent(r.Context(), session.Key, p.ID); e != nil {
				s.failure(w, r, e)
				return
			}
		}
	}
	state, e := s.DB.Snapshot(r.Context(), session.Key, products)
	if e != nil {
		s.failure(w, r, e)
		return
	}
	vm := views.Model{Session: session, State: state, Products: products, Path: r.URL.Path, Return: r.URL.RequestURI(), Notice: r.URL.Query().Get("notice"), Query: domain.ParseQuery(r.URL.Query()), OrderKey: database.Token()}
	vm.Collections, e = s.DB.Collections(r.Context())
	if e != nil {
		s.failure(w, r, e)
		return
	}
	if len(vm.Notice) > 180 {
		vm.Notice = ""
	}
	switch {
	case r.URL.Path == "/":
		vm.Title = "Considered by design"
		s.render(w, r, 200, views.Page(vm, views.Home(vm)))
	case r.URL.Path == "/shop":
		vm.Title = "Shop the collection"
		vm.Results = domain.Filter(products, vm.Query)
		vm.Count = len(vm.Results)
		vm.Pages = max(1, (vm.Count+7)/8)
		vm.Query.Page = min(vm.Query.Page, vm.Pages)
		start := (vm.Query.Page - 1) * 8
		vm.Results = vm.Results[start:min(start+8, vm.Count)]
		if r.Header.Get("HX-Request-Type") == "partial" {
			s.render(w, r, 200, views.ShopResults(vm))
			return
		}
		s.render(w, r, 200, views.Page(vm, views.Shop(vm)))
	case strings.HasPrefix(r.URL.Path, "/products/") || strings.HasPrefix(r.URL.Path, "/quick/"):
		slug := strings.TrimPrefix(strings.TrimPrefix(r.URL.Path, "/products/"), "/quick/")
		p, ok := find(products, slug)
		if !ok {
			s.problem(w, r, 404, "Piece not found", "Browse the collection for another piece.")
			return
		}
		vm.Product = p
		if strings.HasPrefix(r.URL.Path, "/quick/") {
			vm.Return = "/products/" + p.Slug
		}
		vm.Title = p.Name
		vm.Reviews, e = s.DB.Reviews(r.Context(), session.Key, p.ID, r.URL.Query().Get("reviews"))
		if e != nil {
			s.failure(w, r, e)
			return
		}
		if strings.HasPrefix(r.URL.Path, "/quick/") && r.Header.Get("HX-Request-Type") == "partial" {
			s.render(w, r, 200, views.Quick(vm))
			return
		}
		s.render(w, r, 200, views.Page(vm, views.Product(vm)))
	case r.URL.Path == "/bag":
		vm.Title = "Your bag"
		s.render(w, r, 200, views.Page(vm, views.Bag(vm)))
	case r.URL.Path == "/wishlist":
		vm.Title = "Your wishlist"
		s.render(w, r, 200, views.Page(vm, views.Wishlist(vm)))
	case r.URL.Path == "/compare":
		vm.Title = "Compare pieces"
		s.render(w, r, 200, views.Page(vm, views.Compare(vm)))
	case r.URL.Path == "/checkout":
		vm.Title = "Demo checkout"
		s.render(w, r, 200, views.Page(vm, views.Checkout(vm, false)))
	case r.URL.Path == "/orders":
		vm.Title = "Demo receipts"
		s.render(w, r, 200, views.Page(vm, views.Orders(vm)))
	case strings.HasPrefix(r.URL.Path, "/orders/"):
		vm.Order, e = s.DB.Order(r.Context(), session.Key, strings.TrimPrefix(r.URL.Path, "/orders/"))
		if e != nil {
			s.failure(w, r, e)
			return
		}
		vm.Title = "Demo receipt"
		s.render(w, r, 200, views.Page(vm, views.Receipt(vm)))
	case r.URL.Path == "/collections" || r.URL.Path == "/editorial":
		vm.Title = "Collection stories"
		s.render(w, r, 200, views.Page(vm, views.Collections(vm)))
	case strings.HasPrefix(r.URL.Path, "/collections/") || strings.HasPrefix(r.URL.Path, "/editorial/"):
		slug := strings.TrimPrefix(strings.TrimPrefix(r.URL.Path, "/collections/"), "/editorial/")
		found := false
		for _, c := range vm.Collections {
			if c.Slug == slug {
				found = true
				vm.Title = c.Title
				vm.CollectionSummary = c.Summary
			}
		}
		if !found {
			s.problem(w, r, 404, "Story not found", "Explore the collection stories.")
			return
		}
		vm.Query.Collection = slug
		vm.Results = domain.Filter(products, vm.Query)
		if len(vm.Results) == 0 {
			s.problem(w, r, 404, "This edit is between chapters", "Explore the full collection while new pieces are selected.")
			return
		}
		s.render(w, r, 200, views.Page(vm, views.Story(vm)))
	case r.URL.Path == "/about" || r.URL.Path == "/privacy":
		vm.Title = "About the project"
		s.render(w, r, 200, views.Page(vm, views.About(vm)))
	case r.URL.Path == "/studio":
		if wanted := r.URL.Query().Get("look"); wanted != "" {
			for _, look := range vm.State.Looks {
				if look.ID == wanted {
					vm.ActiveLook = look
				}
			}
			if vm.ActiveLook.ID == "" {
				s.problem(w, r, 404, "Composition not found", "Open one of your saved compositions from Style Studio.")
				return
			}
		}
		vm.Title = "Style Studio"
		s.render(w, r, 200, views.Page(vm, views.Studio(vm)))
	default:
		s.problem(w, r, 404, "A different direction", "This page isn't here. The collection is a good place to start.")
	}
}
func (s *Server) post(w http.ResponseWriter, r *http.Request, session domain.Session, products []domain.Product) {
	ctx := r.Context()
	path := r.URL.Path
	f := r.PostForm
	if path == "/session/clear" {
		if f.Get("confirm") != "clear" {
			s.problem(w, r, 422, "Confirm before clearing", "Select the confirmation checkbox to clear your demo data.")
			return
		}
		if e := s.DB.Clear(ctx, session.Key); e != nil {
			s.failure(w, r, e)
			return
		}
		http.SetCookie(w, &http.Cookie{Name: "style_guest", Value: "", Path: "/", MaxAge: -1, HttpOnly: true, Secure: s.Production, SameSite: http.SameSiteLaxMode})
		s.redirect(w, r, "/", "Demo data cleared.")
		return
	}
	if path == "/checkout/review" {
		state, e := s.DB.Snapshot(ctx, session.Key, products)
		if e != nil {
			s.failure(w, r, e)
			return
		}
		if len(state.Bag) == 0 {
			s.redirect(w, r, "/bag", "Your bag is empty.")
			return
		}
		if f.Get("scenario") != "sample-delivery" && f.Get("scenario") != "studio-pickup" {
			s.problem(w, r, 422, "Choose a demo scenario", "Return to checkout and select a sample delivery option.")
			return
		}
		vm := views.Model{Title: "Review your demo order", Session: session, State: state, Products: products, Path: "/checkout", OrderKey: f.Get("key"), Scenario: f.Get("scenario")}
		s.render(w, r, 200, views.Page(vm, views.Checkout(vm, true)))
		return
	}
	if path == "/checkout" {
		if f.Get("confirm") != "demo" {
			s.problem(w, r, 422, "Confirm the demo order", "Review your bag and select the demo confirmation.")
			return
		}
		code, e := s.DB.Checkout(ctx, session.Key, f.Get("key"))
		if e != nil {
			s.failure(w, r, e)
			return
		}
		s.redirect(w, r, "/orders/"+code, "Demo order recorded. No payment taken.")
		return
	}
	if path == "/reviews" {
		id, _ := strconv.Atoi(f.Get("product"))
		rating, _ := strconv.Atoi(f.Get("rating"))
		if e := s.DB.Review(ctx, session.Key, id, rating, f.Get("comment")); e != nil {
			s.failure(w, r, e)
			return
		}
		s.redirect(w, r, f.Get("return"), "Your private, unverified demo review was saved.")
		return
	}
	if strings.HasPrefix(path, "/studio/") {
		destination, e := s.studioPost(ctx, session.Key, path, f)
		if e != nil {
			s.failure(w, r, e)
			return
		}
		message := "Look updated."
		if path == "/studio/bag" {
			message = "Outfit added to your bag."
		}
		s.redirect(w, r, destination, message)
		return
	}
	if path != "/actions" {
		s.problem(w, r, 404, "Action not found", "Return to the shop to continue.")
		return
	}
	action := f.Get("action")
	qty, e := strconv.Atoi(f.Get("quantity"))
	if e != nil {
		qty = 1
	}
	variant, _ := strconv.Atoi(f.Get("variant"))
	if action == "add" || action == "wish" {
		p, ok := find(products, f.Get("slug"))
		if !ok {
			s.failure(w, r, domain.ErrInvalid)
			return
		}
		v, e := p.Variant(f.Get("size"), f.Get("color"))
		if e != nil {
			s.failure(w, r, e)
			return
		}
		variant = v.ID
	}
	if action == "compare" || action == "uncompare" {
		variant, _ = strconv.Atoi(f.Get("product"))
	}
	if e = s.DB.Mutate(ctx, session.Key, action, variant, qty); e != nil {
		s.failure(w, r, e)
		return
	}
	messages := map[string]string{"add": "Added to your bag.", "update": "Quantity updated.", "remove": "Piece removed. You can restore it below.", "save": "Saved to your wishlist.", "wish": "Variant saved to your wishlist.", "move": "Moved to your bag.", "unwish": "Removed from your wishlist.", "compare": "Added to comparison.", "uncompare": "Removed from comparison."}
	ret := f.Get("return")
	if action == "remove" {
		u, _ := url.Parse(safeReturn(ret))
		q := u.Query()
		q.Set("restore", strconv.Itoa(variant))
		q.Set("qty", strconv.Itoa(max(1, min(qty, 99))))
		u.RawQuery = q.Encode()
		ret = u.String()
	}
	s.redirect(w, r, ret, messages[action])
}

// Environment stays explicit: application startup never migrates or seeds data.
func Env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
