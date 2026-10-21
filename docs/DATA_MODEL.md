# Data model

Migration 001 creates categories, collections, products, product_variants, product_media, collection_products, guest_sessions, cart_items, wishlist_items, comparison_items, recently_viewed, demo_orders, demo_order_items, demo_reviews, saved_looks and saved_look_items. schema_migrations records applied versions, guarded by a transaction advisory lock.

Products keep numeric legacy IDs and stable slugs. Each original size×colour combination has one unique variant; inactive records are revalidated on writes. Prices are integer USD minor units; unchanged legacy dollar amounts are explicitly designated USD sample prices. No currency conversion or tax/fulfilment simulation is implied.

Cart/wishlist uniqueness is owner+variant. Compare uniqueness is owner+product, capped at 3 through a serialized mutation. Recently viewed uses owner+product and retains 6. Reviews are private to owner+product, rating 1–5, comment 1–500 characters, capped at 50. Saved looks cap at 12 per guest, 8 unique variant slots per look; the public interface picks one per each of 6 categories.

Orders have high-entropy codes but still require ownership. The unique (session_id,idempotency_key) constraint supports retries. Order lines store immutable title, slug, size, colour, unit price, quantity and legacy product identity; snapshot fields survive future catalogue edits. Deleted guests cascade their private state. No shipping address/email or card fields exist.

All SQL values are bound parameters. Dynamic SQL is restricted to fixed internal allowlisted query shapes; integration test schema identifiers use pgx.Identifier and generated namespace checks. FK, unique and CHECK constraints complement application bounds. The seed is repeatable INSERT ON CONFLICT DO NOTHING and refuses APP_ENV=production; application startup never migrates/seeds. Never invoke seed against a production database by changing that environment guard.

The collection seed stores validated product relationships; current public discovery uses deterministic category rules corresponding to those relationships. No behavioral analytics or AI ranking is claimed.
