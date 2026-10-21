package web

import (
	"compress/gzip"
	"net/http"
	"strconv"
	"strings"
)

type gzipResponse struct {
	http.ResponseWriter
	gzip  *gzip.Writer
	wrote bool
}

func (w *gzipResponse) WriteHeader(status int) {
	if w.wrote {
		return
	}
	w.wrote = true
	if status != 204 && status != 304 && status >= 200 {
		w.Header().Del("Content-Length")
		w.Header().Set("Content-Encoding", "gzip")
		w.Header().Add("Vary", "Accept-Encoding")
		w.gzip = gzip.NewWriter(w.ResponseWriter)
	}
	w.ResponseWriter.WriteHeader(status)
}
func (w *gzipResponse) Write(p []byte) (int, error) {
	if !w.wrote {
		w.WriteHeader(200)
	}
	if w.gzip != nil {
		return w.gzip.Write(p)
	}
	return w.ResponseWriter.Write(p)
}
func acceptsGzip(value string) bool {
	for _, part := range strings.Split(value, ",") {
		bits := strings.Split(strings.TrimSpace(part), ";")
		if bits[0] != "gzip" {
			continue
		}
		q := 1.0
		for _, param := range bits[1:] {
			k, v, ok := strings.Cut(strings.TrimSpace(param), "=")
			if ok && k == "q" {
				n, e := strconv.ParseFloat(v, 64)
				if e != nil {
					q = 0
				} else {
					q = n
				}
			}
		}
		return q > 0
	}
	return false
}
func compress(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if !acceptsGzip(r.Header.Get("Accept-Encoding")) || r.Method == "HEAD" || r.Header.Get("Range") != "" || strings.HasPrefix(path, "/assets/") && !(strings.HasSuffix(path, ".css") || strings.HasSuffix(path, ".js")) {
			next.ServeHTTP(w, r)
			return
		}
		wrapped := &gzipResponse{ResponseWriter: w}
		defer func() {
			if wrapped.gzip != nil {
				wrapped.gzip.Close()
			}
		}()
		next.ServeHTTP(wrapped, r)
	})
}
