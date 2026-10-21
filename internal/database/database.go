package database

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	styleease "github.com/lorenzodarioben-lgtm/style-ease"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/domain"
)

type DB struct{ Pool *pgxpool.Pool }

func Open(ctx context.Context, url string) (*DB, error) {
	c, e := pgxpool.ParseConfig(url)
	if e != nil {
		return nil, e
	}
	c.MaxConns = 10
	c.MinConns = 1
	c.MaxConnLifetime = time.Hour
	c.ConnConfig.ConnectTimeout = 5 * time.Second
	p, e := pgxpool.NewWithConfig(ctx, c)
	if e != nil {
		return nil, e
	}
	if e = p.Ping(ctx); e != nil {
		p.Close()
		return nil, e
	}
	return &DB{p}, nil
}
func Token() string {
	b := make([]byte, 32)
	if _, e := rand.Read(b); e != nil {
		panic(e)
	}
	return hex.EncodeToString(b)
}
func (d *DB) Migrate(ctx context.Context) error {
	tx, e := d.Pool.Begin(ctx)
	if e != nil {
		return e
	}
	defer tx.Rollback(ctx)
	if _, e = tx.Exec(ctx, `SELECT pg_advisory_xact_lock(12445278)`); e != nil {
		return e
	}
	if _, e = tx.Exec(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations(version integer PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())`); e != nil {
		return e
	}
	var exists bool
	if e = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version=1)`).Scan(&exists); e != nil {
		return e
	}
	if !exists {
		b, e := styleease.Resources.ReadFile("migrations/001_initial.sql")
		if e != nil {
			return e
		}
		if _, e = tx.Exec(ctx, string(b)); e != nil {
			return e
		}
		if _, e = tx.Exec(ctx, `INSERT INTO schema_migrations(version) VALUES(1)`); e != nil {
			return e
		}
	}
	return tx.Commit(ctx)
}
func (d *DB) Seed(ctx context.Context) error {
	if os.Getenv("APP_ENV") == "production" {
		return fmt.Errorf("seed refused in production")
	}
	b, e := styleease.Resources.ReadFile("seeds/catalogue.json")
	if e != nil {
		return e
	}
	var products []domain.Product
	if e = json.Unmarshal(b, &products); e != nil {
		return e
	}
	tx, e := d.Pool.Begin(ctx)
	if e != nil {
		return e
	}
	defer tx.Rollback(ctx)
	for _, p := range products {
		if _, e = tx.Exec(ctx, `INSERT INTO categories VALUES($1) ON CONFLICT DO NOTHING`, p.Category); e != nil {
			return e
		}
		if _, e = tx.Exec(ctx, `INSERT INTO products(id,slug,name,category,description,material,price_minor,demo_stock) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(id) DO NOTHING`, p.ID, p.Slug, p.Name, p.Category, p.Description, p.Material, p.Price, p.Stock); e != nil {
			return e
		}
		if _, e = tx.Exec(ctx, `INSERT INTO product_media(product_id,path,alt,source) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING`, p.ID, p.Image, "Editorial reference for "+p.Category+"; not the exact demo product", p.Source); e != nil {
			return e
		}
		for _, s := range p.Sizes {
			for _, c := range p.Colors {
				if _, e = tx.Exec(ctx, `INSERT INTO product_variants(product_id,size,color) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`, p.ID, s, c); e != nil {
					return e
				}
			}
		}
	}
	for _, c := range [][3]string{{"structure", "The Structure Edit", "Tailoring, proportion and a precise silhouette."}, {"everyday", "Everyday, reconsidered", "Tops and knitwear for a considered wardrobe."}, {"objects", "Objects of interest", "The finishing pieces: footwear and accessories."}} {
		if _, e = tx.Exec(ctx, `INSERT INTO collections VALUES($1,$2,$3) ON CONFLICT DO NOTHING`, c[0], c[1], c[2]); e != nil {
			return e
		}
		for _, p := range domain.Filter(products, domain.Query{Collection: c[0]}) {
			if _, e = tx.Exec(ctx, `INSERT INTO collection_products VALUES($1,$2) ON CONFLICT DO NOTHING`, c[0], p.ID); e != nil {
				return e
			}
		}
	}
	return tx.Commit(ctx)
}
func (d *DB) Catalog(ctx context.Context) ([]domain.Product, error) {
	rows, e := d.Pool.Query(ctx, `SELECT p.id,p.slug,p.name,p.category,p.description,p.material,p.price_minor,p.demo_stock,m.path,m.source FROM products p JOIN product_media m ON m.product_id=p.id WHERE p.active ORDER BY p.id`)
	if e != nil {
		return nil, e
	}
	defer rows.Close()
	products := []domain.Product{}
	for rows.Next() {
		var p domain.Product
		if e = rows.Scan(&p.ID, &p.Slug, &p.Name, &p.Category, &p.Description, &p.Material, &p.Price, &p.Stock, &p.Image, &p.Source); e != nil {
			return nil, e
		}
		products = append(products, p)
	}
	if e = rows.Err(); e != nil {
		return nil, e
	}
	rows.Close()
	vr, e := d.Pool.Query(ctx, `SELECT v.id,v.product_id,v.size,v.color,v.active FROM product_variants v JOIN products p ON p.id=v.product_id WHERE p.active ORDER BY v.id`)
	if e != nil {
		return nil, e
	}
	defer vr.Close()
	for vr.Next() {
		var v domain.Variant
		if e = vr.Scan(&v.ID, &v.ProductID, &v.Size, &v.Color, &v.Active); e != nil {
			return nil, e
		}
		for i := range products {
			p := &products[i]
			if p.ID == v.ProductID {
				p.Variants = append(p.Variants, v)
				if !contains(p.Sizes, v.Size) {
					p.Sizes = append(p.Sizes, v.Size)
				}
				if !contains(p.Colors, v.Color) {
					p.Colors = append(p.Colors, v.Color)
				}
			}
		}
	}
	if e = vr.Err(); e != nil {
		return nil, e
	}
	vr.Close()
	cr, e := d.Pool.Query(ctx, `SELECT collection_slug,product_id FROM collection_products ORDER BY collection_slug,product_id`)
	if e != nil {
		return nil, e
	}
	defer cr.Close()
	for cr.Next() {
		var slug string
		var id int
		if e = cr.Scan(&slug, &id); e != nil {
			return nil, e
		}
		for i := range products {
			if products[i].ID == id {
				products[i].Collections = append(products[i].Collections, slug)
			}
		}
	}
	return products, cr.Err()
}
func (d *DB) Collections(ctx context.Context) ([]domain.Collection, error) {
	rows, e := d.Pool.Query(ctx, `SELECT slug,title,summary FROM collections ORDER BY CASE slug WHEN 'structure' THEN 0 WHEN 'everyday' THEN 1 ELSE 2 END,slug`)
	if e != nil {
		return nil, e
	}
	defer rows.Close()
	out := []domain.Collection{}
	for rows.Next() {
		var c domain.Collection
		if e = rows.Scan(&c.Slug, &c.Title, &c.Summary); e != nil {
			return nil, e
		}
		out = append(out, c)
	}
	return out, rows.Err()
}
func contains(a []string, v string) bool {
	for _, s := range a {
		if s == v {
			return true
		}
	}
	return false
}
func (d *DB) Session(ctx context.Context, key string) (domain.Session, error) {
	var s domain.Session
	e := d.Pool.QueryRow(ctx, `SELECT token_hash,csrf,expires_at FROM guest_sessions WHERE token_hash=$1 AND expires_at>now()`, key).Scan(&s.Key, &s.CSRF, &s.Expires)
	return s, e
}
func (d *DB) CreateSession(ctx context.Context, key string) (domain.Session, error) {
	s := domain.Session{Key: key, CSRF: Token(), Expires: time.Now().Add(30 * 24 * time.Hour)}
	_, e := d.Pool.Exec(ctx, `INSERT INTO guest_sessions(token_hash,csrf,expires_at) VALUES($1,$2,$3)`, s.Key, s.CSRF, s.Expires)
	return s, e
}
func (d *DB) Snapshot(ctx context.Context, key string, products []domain.Product) (domain.Snapshot, error) {
	s := domain.Snapshot{}
	byVariant := map[int]domain.Line{}
	byProduct := map[int]domain.Product{}
	for _, p := range products {
		byProduct[p.ID] = p
		for _, v := range p.Variants {
			byVariant[v.ID] = domain.Line{Product: p, Variant: v, Quantity: 1}
		}
	}
	// Keep owned inactive references visible so the guest can remove them.
	private, e := d.Pool.Query(ctx, `SELECT v.id,v.product_id,v.size,v.color,(v.active AND p.active),p.slug,p.name,p.category,p.price_minor,p.demo_stock,coalesce(m.path,'/assets/image-unavailable.svg') FROM product_variants v JOIN products p ON p.id=v.product_id LEFT JOIN product_media m ON m.product_id=p.id WHERE (NOT v.active OR NOT p.active) AND v.id IN (SELECT variant_id FROM cart_items WHERE session_id=$1 UNION SELECT variant_id FROM wishlist_items WHERE session_id=$1 UNION SELECT i.variant_id FROM saved_look_items i JOIN saved_looks l ON l.id=i.look_id WHERE l.session_id=$1)`, key)
	if e != nil {
		return s, e
	}
	for private.Next() {
		var l domain.Line
		l.Quantity = 1
		if e = private.Scan(&l.Variant.ID, &l.Variant.ProductID, &l.Variant.Size, &l.Variant.Color, &l.Variant.Active, &l.Product.Slug, &l.Product.Name, &l.Product.Category, &l.Product.Price, &l.Product.Stock, &l.Product.Image); e != nil {
			private.Close()
			return s, e
		}
		l.Product.ID = l.Variant.ProductID
		byVariant[l.Variant.ID] = l
	}
	e = private.Err()
	private.Close()
	if e != nil {
		return s, e
	}
	rows, e := d.Pool.Query(ctx, `SELECT 'bag',variant_id,quantity FROM cart_items WHERE session_id=$1 UNION ALL SELECT 'wishlist',variant_id,1 FROM wishlist_items WHERE session_id=$1`, key)
	if e != nil {
		return s, e
	}
	for rows.Next() {
		var kind string
		var id, n int
		if e = rows.Scan(&kind, &id, &n); e != nil {
			rows.Close()
			return s, e
		}
		if l, ok := byVariant[id]; ok {
			l.Quantity = n
			if kind == "bag" {
				s.Bag = append(s.Bag, l)
			} else {
				s.Wishlist = append(s.Wishlist, l)
			}
		}
	}
	e = rows.Err()
	rows.Close()
	if e != nil {
		return s, e
	}
	sort.Slice(s.Bag, func(i, j int) bool { return s.Bag[i].Variant.ID < s.Bag[j].Variant.ID })
	sort.Slice(s.Wishlist, func(i, j int) bool { return s.Wishlist[i].Variant.ID < s.Wishlist[j].Variant.ID })
	rows, e = d.Pool.Query(ctx, `SELECT 'compare',product_id,created_at FROM comparison_items WHERE session_id=$1 UNION ALL SELECT 'recent',product_id,viewed_at FROM recently_viewed WHERE session_id=$1 ORDER BY 3 DESC`, key)
	if e != nil {
		return s, e
	}
	for rows.Next() {
		var kind string
		var id int
		var at time.Time
		if e = rows.Scan(&kind, &id, &at); e != nil {
			rows.Close()
			return s, e
		}
		if p, ok := byProduct[id]; ok {
			if kind == "compare" {
				s.Compare = append(s.Compare, p)
			} else {
				s.Recent = append(s.Recent, p)
			}
		}
	}
	e = rows.Err()
	rows.Close()
	if e != nil {
		return s, e
	}
	rows, e = d.Pool.Query(ctx, `SELECT code,total_minor,to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI') FROM demo_orders WHERE session_id=$1 ORDER BY created_at DESC LIMIT 50`, key)
	if e != nil {
		return s, e
	}
	for rows.Next() {
		var o domain.Order
		if e = rows.Scan(&o.Code, &o.Total, &o.Created); e != nil {
			rows.Close()
			return s, e
		}
		s.Orders = append(s.Orders, o)
	}
	e = rows.Err()
	rows.Close()
	if e != nil {
		return s, e
	}
	rows, e = d.Pool.Query(ctx, `SELECT l.id,l.name,i.variant_id FROM saved_looks l LEFT JOIN saved_look_items i ON i.look_id=l.id WHERE l.session_id=$1 ORDER BY l.created_at DESC,i.ordinal`, key)
	if e != nil {
		return s, e
	}
	for rows.Next() {
		var id, name string
		var variant *int
		if e = rows.Scan(&id, &name, &variant); e != nil {
			rows.Close()
			return s, e
		}
		idx := -1
		for i := range s.Looks {
			if s.Looks[i].ID == id {
				idx = i
			}
		}
		if idx < 0 {
			s.Looks = append(s.Looks, domain.Look{ID: id, Name: name})
			idx = len(s.Looks) - 1
		}
		if variant != nil {
			if l, ok := byVariant[*variant]; ok {
				s.Looks[idx].Lines = append(s.Looks[idx].Lines, l)
				s.Looks[idx].Total += l.Product.Price
			}
		}
	}
	e = rows.Err()
	rows.Close()
	return s, e
}
func (d *DB) locked(ctx context.Context, key string, fn func(pgx.Tx) error) error {
	tx, e := d.Pool.Begin(ctx)
	if e != nil {
		return e
	}
	defer tx.Rollback(ctx)
	var k string
	if e = tx.QueryRow(ctx, `SELECT token_hash FROM guest_sessions WHERE token_hash=$1 AND expires_at>now() FOR UPDATE`, key).Scan(&k); e != nil {
		return e
	}
	if e = fn(tx); e != nil {
		return e
	}
	return tx.Commit(ctx)
}
func add(ctx context.Context, tx pgx.Tx, key string, variant, qty int, set bool) error {
	var product, stock int
	var active bool
	e := tx.QueryRow(ctx, `SELECT p.id,p.demo_stock,(p.active AND v.active) FROM product_variants v JOIN products p ON p.id=v.product_id WHERE v.id=$1 FOR SHARE OF p,v`, variant).Scan(&product, &stock, &active)
	if e != nil || !active {
		return domain.ErrInvalid
	}
	var existing int
	q := `SELECT coalesce(sum(c.quantity),0) FROM cart_items c JOIN product_variants v ON v.id=c.variant_id WHERE c.session_id=$1 AND v.product_id=$2`
	if set {
		q += ` AND c.variant_id<>$3`
		e = tx.QueryRow(ctx, q, key, product, variant).Scan(&existing)
	} else {
		e = tx.QueryRow(ctx, q, key, product).Scan(&existing)
	}
	if e != nil {
		return e
	}
	if e = domain.ValidateQuantity(stock, existing, qty); e != nil {
		return e
	}
	q = `INSERT INTO cart_items VALUES($1,$2,$3) ON CONFLICT(session_id,variant_id) DO UPDATE SET quantity=cart_items.quantity+excluded.quantity`
	if set {
		q = `INSERT INTO cart_items VALUES($1,$2,$3) ON CONFLICT(session_id,variant_id) DO UPDATE SET quantity=excluded.quantity`
	}
	_, e = tx.Exec(ctx, q, key, variant, qty)
	return e
}
func (d *DB) Mutate(ctx context.Context, key, action string, variant, qty int) error {
	return d.locked(ctx, key, func(tx pgx.Tx) error {
		switch action {
		case "add", "update", "move", "restore":
			if e := add(ctx, tx, key, variant, qty, action == "update"); e != nil {
				return e
			}
			if action == "move" {
				_, e := tx.Exec(ctx, `DELETE FROM wishlist_items WHERE session_id=$1 AND variant_id=$2`, key, variant)
				return e
			}
			return nil
		case "remove":
			_, e := tx.Exec(ctx, `DELETE FROM cart_items WHERE session_id=$1 AND variant_id=$2`, key, variant)
			return e
		case "save", "wish":
			var valid bool
			if e := tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM product_variants v JOIN products p ON p.id=v.product_id WHERE v.id=$1 AND v.active AND p.active)`, variant).Scan(&valid); e != nil {
				return e
			}
			if !valid {
				return domain.ErrInvalid
			}
			var count int
			if e := tx.QueryRow(ctx, `SELECT count(*) FROM wishlist_items WHERE session_id=$1`, key).Scan(&count); e != nil {
				return e
			}
			if count >= 60 {
				return domain.ErrLimit
			}
			if _, e := tx.Exec(ctx, `INSERT INTO wishlist_items(session_id,variant_id) VALUES($1,$2) ON CONFLICT DO NOTHING`, key, variant); e != nil {
				return e
			}
			if action == "save" {
				_, e := tx.Exec(ctx, `DELETE FROM cart_items WHERE session_id=$1 AND variant_id=$2`, key, variant)
				return e
			}
			return nil
		case "unwish":
			_, e := tx.Exec(ctx, `DELETE FROM wishlist_items WHERE session_id=$1 AND variant_id=$2`, key, variant)
			return e
		case "compare":
			var valid, existing bool
			if e := tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM products WHERE id=$2 AND active),EXISTS(SELECT 1 FROM comparison_items WHERE session_id=$1 AND product_id=$2)`, key, variant).Scan(&valid, &existing); e != nil {
				return e
			}
			if !valid {
				return domain.ErrInvalid
			}
			if existing {
				return nil
			}
			var count int
			if e := tx.QueryRow(ctx, `SELECT count(*) FROM comparison_items WHERE session_id=$1`, key).Scan(&count); e != nil {
				return e
			}
			if count >= 3 {
				return domain.ErrLimit
			}
			_, e := tx.Exec(ctx, `INSERT INTO comparison_items(session_id,product_id) SELECT $1,id FROM products WHERE id=$2 AND active ON CONFLICT DO NOTHING`, key, variant)
			return e
		case "uncompare":
			_, e := tx.Exec(ctx, `DELETE FROM comparison_items WHERE session_id=$1 AND product_id=$2`, key, variant)
			return e
		default:
			return domain.ErrInvalid
		}
	})
}
func (d *DB) Recent(ctx context.Context, key string, id int) error {
	return d.locked(ctx, key, func(tx pgx.Tx) error {
		if _, e := tx.Exec(ctx, `INSERT INTO recently_viewed VALUES($1,$2,now()) ON CONFLICT(session_id,product_id) DO UPDATE SET viewed_at=now()`, key, id); e != nil {
			return e
		}
		_, e := tx.Exec(ctx, `DELETE FROM recently_viewed WHERE session_id=$1 AND product_id NOT IN(SELECT product_id FROM recently_viewed WHERE session_id=$1 ORDER BY viewed_at DESC LIMIT 6)`, key)
		return e
	})
}
func (d *DB) Checkout(ctx context.Context, key, idempotency string) (string, error) {
	code := ""
	if len(idempotency) != 64 {
		return "", domain.ErrInvalid
	}
	e := d.locked(ctx, key, func(tx pgx.Tx) error {
		e := tx.QueryRow(ctx, `SELECT code FROM demo_orders WHERE session_id=$1 AND idempotency_key=$2`, key, idempotency).Scan(&code)
		if e == nil {
			return nil
		}
		if e != pgx.ErrNoRows {
			return e
		}
		rows, e := tx.Query(ctx, `SELECT p.id,p.name,p.slug,p.price_minor,p.demo_stock,v.size,v.color,v.active,p.active,c.quantity FROM cart_items c JOIN product_variants v ON v.id=c.variant_id JOIN products p ON p.id=v.product_id WHERE c.session_id=$1 ORDER BY v.id FOR SHARE OF p,v`, key)
		if e != nil {
			return e
		}
		lines := []domain.ReceiptLine{}
		totals := map[int]int{}
		stock := map[int]int{}
		total := 0
		for rows.Next() {
			var l domain.ReceiptLine
			var id, cap int
			var va, pa bool
			if e = rows.Scan(&id, &l.Name, &l.Slug, &l.Price, &cap, &l.Size, &l.Color, &va, &pa, &l.Quantity); e != nil {
				rows.Close()
				return e
			}
			if !va || !pa {
				rows.Close()
				return domain.ErrInvalid
			}
			l.ProductID = id
			totals[id] += l.Quantity
			stock[id] = cap
			total += l.Price * l.Quantity
			lines = append(lines, l)
		}
		e = rows.Err()
		rows.Close()
		if e != nil {
			return e
		}
		if len(lines) == 0 {
			return domain.ErrInvalid
		}
		for id, n := range totals {
			if n > stock[id] {
				return domain.ErrCapacity
			}
		}
		code = "DEMO-" + Token()[:20]
		if _, e = tx.Exec(ctx, `INSERT INTO demo_orders(code,session_id,idempotency_key,total_minor) VALUES($1,$2,$3,$4)`, code, key, idempotency, total); e != nil {
			return e
		}
		for i, l := range lines {
			if _, e = tx.Exec(ctx, `INSERT INTO demo_order_items VALUES($1,$2,$9,$3,$4,$5,$6,$7,$8)`, code, i, l.Name, l.Slug, l.Size, l.Color, l.Price, l.Quantity, l.ProductID); e != nil {
				return e
			}
		}
		_, e = tx.Exec(ctx, `DELETE FROM cart_items WHERE session_id=$1`, key)
		return e
	})
	return code, e
}
func (d *DB) Order(ctx context.Context, key, code string) (domain.Order, error) {
	o := domain.Order{}
	e := d.Pool.QueryRow(ctx, `SELECT code,total_minor,to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI') FROM demo_orders WHERE session_id=$1 AND code=$2`, key, code).Scan(&o.Code, &o.Total, &o.Created)
	if e == pgx.ErrNoRows {
		return o, domain.ErrNotFound
	}
	if e != nil {
		return o, e
	}
	rows, e := d.Pool.Query(ctx, `SELECT snapshot_title,snapshot_slug,snapshot_size,snapshot_color,snapshot_price_minor,quantity FROM demo_order_items WHERE order_code=$1 ORDER BY ordinal`, code)
	if e != nil {
		return o, e
	}
	defer rows.Close()
	for rows.Next() {
		var l domain.ReceiptLine
		if e = rows.Scan(&l.Name, &l.Slug, &l.Size, &l.Color, &l.Price, &l.Quantity); e != nil {
			return o, e
		}
		o.Lines = append(o.Lines, l)
	}
	return o, rows.Err()
}
func (d *DB) Clear(ctx context.Context, key string) error {
	_, e := d.Pool.Exec(ctx, `DELETE FROM guest_sessions WHERE token_hash=$1`, key)
	return e
}
