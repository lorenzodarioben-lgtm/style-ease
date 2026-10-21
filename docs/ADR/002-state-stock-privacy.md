# ADR 002 — guest state, capacity and retention

Accepted. Issue a cryptographic 256-bit random cookie; store its SHA256 digest and an independent CSRF secret in PostgreSQL. HttpOnly/SameSite=Lax cookies expire after 30 days; Secure is required in production. Data is owned by the digest, not by knowing a receipt/look identifier.

Preserve the original shared demo stock capacity per product across all size/colour lines in a guest's bag. Session SELECT FOR UPDATE serializes that guest; active product/variant rows are locked through mutations and checkout. Different guests have independent demo capacities. This is not warehouse stock, a reservation or a real sale.

Checkout locks the guest, checks an owner-scoped unique idempotency key before reading the bag, validates active variants/capacity, snapshots names/variants/prices, writes the order and clears the bag atomically. Retrying a successful key returns the same owned receipt. No delivery details are persisted or collected; two explicit sample delivery scenarios replace the old real-address-shaped demo form.

The old origin's localStorage and hash routes are not silently imported. They remain usable on unchanged GitHub Pages. New server guests start clean. Private server reviews replace browser-local demo reviews; no ratings are seeded or presented as verified social proof.

Clear-data deletes the session and cascades its rows. Expired guests cannot authorize reads; `go run ./cmd/web cleanup` removes expired rows. Schedule cleanup only on a future approved host; no claim that hosting/cleanup is currently configured.
