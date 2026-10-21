CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE categories (name text PRIMARY KEY);
CREATE TABLE collections (slug text PRIMARY KEY, title text NOT NULL, summary text NOT NULL);
CREATE TABLE products (
 id integer PRIMARY KEY, slug text NOT NULL UNIQUE, name text NOT NULL,
 category text NOT NULL REFERENCES categories(name), description text NOT NULL, material text NOT NULL,
 price_minor integer NOT NULL CHECK(price_minor>=0), currency text NOT NULL DEFAULT 'USD' CHECK(currency='USD'),
 demo_stock integer NOT NULL CHECK(demo_stock BETWEEN 0 AND 99), active boolean NOT NULL DEFAULT true
);
CREATE TABLE product_variants (id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY, product_id integer NOT NULL REFERENCES products(id), size text NOT NULL, color text NOT NULL, active boolean NOT NULL DEFAULT true, UNIQUE(product_id,size,color));
CREATE INDEX product_variants_product ON product_variants(product_id);
CREATE TABLE product_media (product_id integer PRIMARY KEY REFERENCES products(id), path text NOT NULL, alt text NOT NULL, source text NOT NULL, license text NOT NULL DEFAULT 'Unsplash License; editorial reference, not exact demo product');
CREATE TABLE collection_products (collection_slug text REFERENCES collections(slug), product_id integer REFERENCES products(id), PRIMARY KEY(collection_slug,product_id));
CREATE TABLE guest_sessions (token_hash text PRIMARY KEY, csrf text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL);
CREATE INDEX guest_sessions_expiry ON guest_sessions(expires_at);
CREATE TABLE cart_items (session_id text REFERENCES guest_sessions(token_hash) ON DELETE CASCADE, variant_id integer REFERENCES product_variants(id), quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 99), PRIMARY KEY(session_id,variant_id));
CREATE TABLE wishlist_items (session_id text REFERENCES guest_sessions(token_hash) ON DELETE CASCADE, variant_id integer REFERENCES product_variants(id), created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(session_id,variant_id));
CREATE TABLE comparison_items (session_id text REFERENCES guest_sessions(token_hash) ON DELETE CASCADE, product_id integer REFERENCES products(id), created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(session_id,product_id));
CREATE TABLE recently_viewed (session_id text REFERENCES guest_sessions(token_hash) ON DELETE CASCADE, product_id integer REFERENCES products(id), viewed_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(session_id,product_id));
CREATE TABLE demo_orders (code text PRIMARY KEY, session_id text NOT NULL REFERENCES guest_sessions(token_hash) ON DELETE CASCADE, idempotency_key text NOT NULL, total_minor integer NOT NULL CHECK(total_minor>=0), currency text NOT NULL DEFAULT 'USD', created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(session_id,idempotency_key));
CREATE INDEX demo_orders_owner ON demo_orders(session_id,created_at DESC);
CREATE TABLE demo_order_items (order_code text REFERENCES demo_orders(code) ON DELETE CASCADE, ordinal integer NOT NULL, product_id integer NOT NULL, snapshot_title text NOT NULL, snapshot_slug text NOT NULL, snapshot_size text NOT NULL, snapshot_color text NOT NULL, snapshot_price_minor integer NOT NULL CHECK(snapshot_price_minor>=0), quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 99), PRIMARY KEY(order_code,ordinal));
CREATE TABLE demo_reviews (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, session_id text REFERENCES guest_sessions(token_hash) ON DELETE CASCADE, product_id integer REFERENCES products(id), rating integer NOT NULL CHECK(rating BETWEEN 1 AND 5), comment text NOT NULL CHECK(length(comment) BETWEEN 1 AND 500), created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX demo_reviews_owner ON demo_reviews(session_id,product_id,created_at DESC);
CREATE TABLE saved_looks (id text PRIMARY KEY, session_id text REFERENCES guest_sessions(token_hash) ON DELETE CASCADE, name text NOT NULL CHECK(length(name) BETWEEN 1 AND 60), created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX saved_looks_owner ON saved_looks(session_id);
CREATE TABLE saved_look_items (look_id text REFERENCES saved_looks(id) ON DELETE CASCADE, variant_id integer REFERENCES product_variants(id), ordinal integer NOT NULL CHECK(ordinal BETWEEN 0 AND 7), PRIMARY KEY(look_id,variant_id), UNIQUE(look_id,ordinal));
