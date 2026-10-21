package testsupport

import (
	"context"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/database"
	"os"
	"strings"
	"testing"
	"time"
)

// DB uses a fresh random schema inside the explicitly selected integration DB.
// It never resets application tables or a pre-existing schema.
func DB(t *testing.T) *database.DB {
	t.Helper()
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("real PostgreSQL integration: set TEST_DATABASE_URL")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	admin, e := pgx.Connect(ctx, dsn)
	if e != nil {
		t.Fatal(e)
	}
	schema := "blacklabel_test_" + database.Token()[:16]
	quoted := pgx.Identifier{schema}.Sanitize()
	if _, e = admin.Exec(ctx, "CREATE SCHEMA "+quoted); e != nil {
		t.Fatal(e)
	}
	config, e := pgxpool.ParseConfig(dsn)
	if e != nil {
		t.Fatal(e)
	}
	config.ConnConfig.RuntimeParams["search_path"] = schema
	config.MaxConns = 12
	pool, e := pgxpool.NewWithConfig(ctx, config)
	if e != nil {
		t.Fatal(e)
	}
	db := &database.DB{Pool: pool}
	t.Cleanup(func() {
		pool.Close()
		if !strings.HasPrefix(schema, "blacklabel_test_") || len(schema) != len("blacklabel_test_")+16 {
			t.Fatal("refusing unexpected cleanup schema")
		}
		cleanup, c := context.WithTimeout(context.Background(), 10*time.Second)
		defer c()
		if _, e := admin.Exec(cleanup, "DROP SCHEMA "+quoted+" CASCADE"); e != nil {
			t.Error(e)
		}
		admin.Close(cleanup)
	})
	if e = db.Migrate(ctx); e != nil {
		t.Fatal(e)
	}
	if e = db.Seed(ctx); e != nil {
		t.Fatal(e)
	}
	return db
}
