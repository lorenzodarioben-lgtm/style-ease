package main

import (
	"context"
	"errors"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/database"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/web"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	if e := run(); e != nil {
		slog.Error("application stopped", "error", e)
		os.Exit(1)
	}
}
func run() error {
	environment := web.Env("APP_ENV", "development")
	if environment != "development" && environment != "test" && environment != "production" {
		return errors.New("APP_ENV must be development, test or production")
	}
	if environment == "production" && os.Getenv("DATABASE_URL") == "" {
		return errors.New("production requires an explicit DATABASE_URL")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	db, e := database.Open(ctx, web.Env("DATABASE_URL", "postgres://style:local_demo_only@127.0.0.1:54329/style_ease?sslmode=disable"))
	if e != nil {
		return errors.New("database connection unavailable; check DATABASE_URL and PostgreSQL")
	}
	defer db.Pool.Close()
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "migrate":
			return db.Migrate(ctx)
		case "seed":
			return db.Seed(ctx)
		case "cleanup":
			_, e = db.Pool.Exec(ctx, `DELETE FROM guest_sessions WHERE expires_at<now()`)
			return e
		default:
			return errors.New("expected migrate, seed, cleanup or no argument")
		}
	}
	srv, e := web.New(db, web.Env("APP_ORIGIN", "http://127.0.0.1:8080"), os.Getenv("APP_ENV") == "production")
	if e != nil {
		return e
	}
	server := &http.Server{Addr: web.Env("BIND_ADDR", "127.0.0.1") + ":" + web.Env("PORT", "8080"), Handler: srv.Handler(), ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 15 * time.Second, WriteTimeout: 20 * time.Second, IdleTimeout: 60 * time.Second, MaxHeaderBytes: 16 * 1024}
	stop, done := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer done()
	go func() {
		<-stop.Done()
		shutdown, c := context.WithTimeout(context.Background(), 10*time.Second)
		defer c()
		server.Shutdown(shutdown)
	}()
	slog.Info("Style Ease listening", "address", server.Addr, "demo", true)
	e = server.ListenAndServe()
	if errors.Is(e, http.ErrServerClosed) {
		return nil
	}
	return e
}
