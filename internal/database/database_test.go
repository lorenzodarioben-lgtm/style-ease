package database_test

import (
	"context"
	"errors"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/database"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/domain"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/testsupport"
	"sync"
	"sync/atomic"
	"testing"
)

var ctx = context.Background()

func guest(t *testing.T, d *database.DB) domain.Session {
	t.Helper()
	s, e := d.CreateSession(ctx, database.Token())
	if e != nil {
		t.Fatal(e)
	}
	return s
}
func catalog(t *testing.T, d *database.DB) []domain.Product {
	t.Helper()
	p, e := d.Catalog(ctx)
	if e != nil {
		t.Fatal(e)
	}
	return p
}
func TestMigrationsSeedConstraints(t *testing.T) {
	d := testsupport.DB(t)
	if e := d.Migrate(ctx); e != nil {
		t.Fatal(e)
	}
	if e := d.Seed(ctx); e != nil {
		t.Fatal(e)
	}
	ps := catalog(t, d)
	if len(ps) != 20 || ps[0].Price != 7500 || ps[18].Name != "Crest Cuff Bracelet" {
		t.Fatal("seed provenance broken")
	}
	for _, p := range ps {
		if len(p.Variants) != len(p.Sizes)*len(p.Colors) {
			t.Fatal(p.Name)
		}
	}
	if _, e := d.Pool.Exec(ctx, `UPDATE products SET price_minor=-1 WHERE id=1`); e == nil {
		t.Fatal("negative price accepted")
	}
	if _, e := d.Pool.Exec(ctx, `INSERT INTO product_variants(product_id,size,color) VALUES(999,'M','Black')`); e == nil {
		t.Fatal("foreign key missing")
	}
	t.Setenv("APP_ENV", "production")
	if e := d.Seed(ctx); e == nil {
		t.Fatal("production seed accepted")
	}
}
func TestConcurrentSharedCapacity(t *testing.T) {
	d := testsupport.DB(t)
	s := guest(t, d)
	p := catalog(t, d)[0]
	var successes atomic.Int32
	var wg sync.WaitGroup
	for i := 0; i < 24; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			e := d.Mutate(ctx, s.Key, "add", p.Variants[i%len(p.Variants)].ID, 1)
			if e == nil {
				successes.Add(1)
			} else if !errors.Is(e, domain.ErrCapacity) {
				t.Error(e)
			}
		}(i)
	}
	wg.Wait()
	snapshot, e := d.Snapshot(ctx, s.Key, catalog(t, d))
	if e != nil {
		t.Fatal(e)
	}
	if successes.Load() != 8 || domain.Quantity(snapshot.Bag) != 8 {
		t.Fatalf("capacity bypass: successes %d quantity %d", successes.Load(), domain.Quantity(snapshot.Bag))
	}
	if e = d.Mutate(ctx, s.Key, "add", -1, 1); !errors.Is(e, domain.ErrInvalid) {
		t.Fatal(e)
	}
}
func TestAtomicWishlistAndBounds(t *testing.T) {
	d := testsupport.DB(t)
	s := guest(t, d)
	ps := catalog(t, d)
	p := ps[0]
	v := p.Variants[0].ID
	other := p.Variants[1].ID
	if e := d.Mutate(ctx, s.Key, "wish", other, 1); e != nil {
		t.Fatal(e)
	}
	if e := d.Mutate(ctx, s.Key, "add", v, 8); e != nil {
		t.Fatal(e)
	}
	if e := d.Mutate(ctx, s.Key, "move", other, 1); !errors.Is(e, domain.ErrCapacity) {
		t.Fatal(e)
	}
	snapshot, _ := d.Snapshot(ctx, s.Key, ps)
	if len(snapshot.Wishlist) != 1 || domain.Quantity(snapshot.Bag) != 8 {
		t.Fatal("failed move lost wishlist or bag")
	}
	if e := d.Mutate(ctx, s.Key, "save", v, 1); e != nil {
		t.Fatal(e)
	}
	snapshot, _ = d.Snapshot(ctx, s.Key, ps)
	if len(snapshot.Wishlist) != 2 || len(snapshot.Bag) != 0 {
		t.Fatal("save not atomic")
	}
	for i := 0; i < 3; i++ {
		if e := d.Mutate(ctx, s.Key, "compare", ps[i].ID, 1); e != nil {
			t.Fatal(e)
		}
	}
	if e := d.Mutate(ctx, s.Key, "compare", ps[3].ID, 1); !errors.Is(e, domain.ErrLimit) {
		t.Fatal(e)
	}
	for i := 0; i < 10; i++ {
		if e := d.Recent(ctx, s.Key, ps[i].ID); e != nil {
			t.Fatal(e)
		}
	}
	snapshot, _ = d.Snapshot(ctx, s.Key, ps)
	if len(snapshot.Recent) != 6 || snapshot.Recent[0].ID != 10 {
		t.Fatal("recent history not bounded")
	}
}
func TestCheckoutIdempotencyOwnershipSnapshots(t *testing.T) {
	d := testsupport.DB(t)
	s := guest(t, d)
	other := guest(t, d)
	ps := catalog(t, d)
	v := ps[0].Variants[0].ID
	if e := d.Mutate(ctx, s.Key, "add", v, 2); e != nil {
		t.Fatal(e)
	}
	idempotency := database.Token()
	codes := make(chan string, 8)
	var wg sync.WaitGroup
	for i := 0; i < 8; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			code, e := d.Checkout(ctx, s.Key, idempotency)
			if e != nil {
				t.Error(e)
			}
			codes <- code
		}()
	}
	wg.Wait()
	close(codes)
	first := ""
	for code := range codes {
		if first == "" {
			first = code
		}
		if code != first {
			t.Fatal("retry duplicated order")
		}
	}
	o, e := d.Order(ctx, s.Key, first)
	if e != nil || o.Total != 15000 || len(o.Lines) != 1 {
		t.Fatal(o, e)
	}
	if _, e = d.Order(ctx, other.Key, first); !errors.Is(e, domain.ErrNotFound) {
		t.Fatal("receipt exposed", e)
	}
	if _, e = d.Pool.Exec(ctx, `UPDATE products SET price_minor=99999 WHERE id=1`); e != nil {
		t.Fatal(e)
	}
	o, e = d.Order(ctx, s.Key, first)
	if e != nil || o.Total != 15000 || o.Lines[0].Price != 7500 {
		t.Fatal("receipt changed with catalogue")
	}
	snapshot, _ := d.Snapshot(ctx, s.Key, catalog(t, d))
	if len(snapshot.Bag) != 0 || len(snapshot.Orders) != 1 {
		t.Fatal("order/cart not atomic")
	}
}
func TestCheckoutRollbackAndInactiveVariant(t *testing.T) {
	d := testsupport.DB(t)
	s := guest(t, d)
	ps := catalog(t, d)
	v := ps[0].Variants[0].ID
	if e := d.Mutate(ctx, s.Key, "add", v, 1); e != nil {
		t.Fatal(e)
	}
	if _, e := d.Pool.Exec(ctx, `CREATE FUNCTION reject_receipt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test failure'; END $$; CREATE TRIGGER reject_receipt BEFORE INSERT ON demo_order_items FOR EACH ROW EXECUTE FUNCTION reject_receipt()`); e != nil {
		t.Fatal(e)
	}
	if _, e := d.Checkout(ctx, s.Key, database.Token()); e == nil {
		t.Fatal("expected forced transaction failure")
	}
	snapshot, e := d.Snapshot(ctx, s.Key, ps)
	if e != nil || len(snapshot.Orders) != 0 || len(snapshot.Bag) != 1 {
		t.Fatal("rollback lost state", e)
	}
	if _, e = d.Pool.Exec(ctx, `DROP TRIGGER reject_receipt ON demo_order_items`); e != nil {
		t.Fatal(e)
	}
	if _, e = d.Pool.Exec(ctx, `UPDATE product_variants SET active=false WHERE id=$1`, v); e != nil {
		t.Fatal(e)
	}
	if _, e = d.Checkout(ctx, s.Key, database.Token()); !errors.Is(e, domain.ErrInvalid) {
		t.Fatal("inactive checkout accepted", e)
	}
}
func TestSavedLooksOwnershipAndAtomicBag(t *testing.T) {
	d := testsupport.DB(t)
	s := guest(t, d)
	other := guest(t, d)
	ps := catalog(t, d)
	vs := []int{ps[0].Variants[0].ID, ps[1].Variants[0].ID}
	if e := d.SaveLook(ctx, s.Key, "My composition", vs); e != nil {
		t.Fatal(e)
	}
	snapshot, e := d.Snapshot(ctx, s.Key, ps)
	if e != nil || len(snapshot.Looks) != 1 || snapshot.Looks[0].Total != 29500 {
		t.Fatal(snapshot.Looks, e)
	}
	id := snapshot.Looks[0].ID
	if e = d.LookAction(ctx, other.Key, id, "bag", ""); !errors.Is(e, domain.ErrNotFound) {
		t.Fatal("look exposed", e)
	}
	if e = d.LookAction(ctx, s.Key, id, "bag", ""); e != nil {
		t.Fatal(e)
	}
	if e = d.Mutate(ctx, s.Key, "update", vs[0], 8); e != nil {
		t.Fatal(e)
	}
	if e = d.LookAction(ctx, s.Key, id, "bag", ""); !errors.Is(e, domain.ErrCapacity) {
		t.Fatal(e)
	}
	snapshot, _ = d.Snapshot(ctx, s.Key, ps)
	if domain.Quantity(snapshot.Bag) != 9 {
		t.Fatal("outfit failure partly changed bag")
	}
	if e = d.SaveLook(ctx, s.Key, "Duplicate", []int{vs[0], vs[0]}); !errors.Is(e, domain.ErrInvalid) {
		t.Fatal(e)
	}
	snapshot, _ = d.Snapshot(ctx, s.Key, ps)
	if len(snapshot.Looks) != 1 {
		t.Fatal("invalid look didn't roll back")
	}
	if e = d.LookAction(ctx, s.Key, id, "rename", "New name"); e != nil {
		t.Fatal(e)
	}
	if e = d.LookAction(ctx, s.Key, id, "delete", ""); e != nil {
		t.Fatal(e)
	}
}
func TestReviewScopeAndSessionCleanup(t *testing.T) {
	d := testsupport.DB(t)
	s := guest(t, d)
	other := guest(t, d)
	if e := d.Review(ctx, s.Key, 9999, 4, "No such product"); !errors.Is(e, domain.ErrInvalid) {
		t.Fatal("missing product review accepted", e)
	}
	if e := d.Mutate(ctx, s.Key, "compare", 9999, 1); !errors.Is(e, domain.ErrInvalid) {
		t.Fatal("missing product comparison accepted", e)
	}
	if e := d.Review(ctx, s.Key, 1, 5, "<script>alert(1)</script>"); e != nil {
		t.Fatal(e)
	}
	rs, e := d.Reviews(ctx, other.Key, 1, "")
	if e != nil || len(rs) != 0 {
		t.Fatal("review leaked")
	}
	if e = d.Review(ctx, s.Key, 1, 6, "bad"); !errors.Is(e, domain.ErrInvalid) {
		t.Fatal(e)
	}
	if e = d.Clear(ctx, s.Key); e != nil {
		t.Fatal(e)
	}
	rs, e = d.Reviews(ctx, s.Key, 1, "")
	if e != nil || len(rs) != 0 {
		t.Fatal("cleanup missed reviews")
	}
	if _, e = d.Session(ctx, s.Key); e == nil {
		t.Fatal("session retained")
	}
}
