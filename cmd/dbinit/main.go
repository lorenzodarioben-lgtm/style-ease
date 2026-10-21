// dbinit explicitly creates a LOCAL development database, never on application startup.
package main

import (
	"context"
	"github.com/jackc/pgx/v5"
	"log"
	"net/url"
	"os"
	"time"
)

func main() {
	if os.Getenv("APP_ENV") == "production" {
		log.Fatal("dbinit refused in production")
	}
	raw := os.Getenv("DATABASE_URL")
	if raw == "" {
		raw = "postgres://style:local_demo_only@127.0.0.1:54329/style_ease?sslmode=disable"
	}
	u, e := url.Parse(raw)
	if e != nil {
		log.Fatal(e)
	}
	if u.Hostname() != "127.0.0.1" && u.Hostname() != "localhost" {
		log.Fatal("dbinit is local only")
	}
	u.Path = "/postgres"
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	c, e := pgx.Connect(ctx, u.String())
	if e != nil {
		log.Fatal("local PostgreSQL unavailable")
	}
	defer c.Close(ctx)
	var exists bool
	if e = c.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname='style_ease')`).Scan(&exists); e != nil {
		log.Fatal(e)
	}
	if !exists {
		if _, e = c.Exec(ctx, `CREATE DATABASE style_ease`); e != nil {
			log.Fatal(e)
		}
	}
	log.Println("local style_ease database ready")
}
