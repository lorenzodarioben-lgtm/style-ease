package main

import (
	"context"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestHealthcheckUsesReadiness(t *testing.T) {
	for _, status := range []int{http.StatusOK, http.StatusServiceUnavailable, http.StatusFound} {
		t.Run(http.StatusText(status), func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.URL.Path != "/readyz" {
					t.Errorf("unexpected probe path: %s", r.URL.Path)
				}
				w.Header().Set("Location", "/healthz")
				w.WriteHeader(status)
			}))
			defer server.Close()
			_, port, _ := net.SplitHostPort(server.Listener.Addr().String())
			if err := healthcheck(port); (err == nil) != (status == http.StatusOK) {
				t.Fatalf("readiness status %d: %v", status, err)
			}
		})
	}
	for _, port := range []string{"0", "65536", "8080@invalid.example", "wrong"} {
		if err := healthcheck(port); err == nil {
			t.Fatalf("accepted invalid port %q", port)
		}
	}
}

func TestServeDrainsActiveRequests(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	address := make(chan string, 1)
	entered := make(chan struct{})
	release := make(chan struct{})
	defer func() {
		select {
		case <-release:
		default:
			close(release)
		}
	}()
	server := &http.Server{
		Addr: "127.0.0.1:0",
		BaseContext: func(listener net.Listener) context.Context {
			address <- listener.Addr().String()
			return context.Background()
		},
		Handler: http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			close(entered)
			<-release
			_, _ = io.WriteString(w, "request completed")
		}),
	}
	done := make(chan error, 1)
	go func() { done <- serve(ctx, server) }()
	var addr string
	select {
	case addr = <-address:
	case err := <-done:
		t.Fatalf("server stopped before listening: %v", err)
	case <-time.After(5 * time.Second):
		t.Fatal("server did not listen")
	}
	response := make(chan error, 1)
	go func() {
		client := &http.Client{Timeout: 5 * time.Second}
		res, err := client.Get("http://" + addr)
		if err == nil {
			defer res.Body.Close()
			var body []byte
			body, err = io.ReadAll(res.Body)
			if err == nil && string(body) != "request completed" {
				err = io.ErrUnexpectedEOF
			}
		}
		response <- err
	}()
	select {
	case <-entered:
	case <-time.After(5 * time.Second):
		t.Fatal("request did not enter handler")
	}
	cancel()
	select {
	case err := <-done:
		t.Fatalf("shutdown returned before active request completed: %v", err)
	case <-time.After(50 * time.Millisecond):
	}
	close(release)
	select {
	case err := <-response:
		if err != nil {
			t.Fatalf("active response was interrupted: %v", err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("active response did not finish")
	}
	select {
	case err := <-done:
		if err != nil {
			t.Fatalf("graceful shutdown failed: %v", err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("server did not finish after handler drained")
	}
}
