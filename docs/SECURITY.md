# Security boundaries

This is a demonstration, not a trading retailer. No payment processing, customer email, address storage, login or admin surface is present. Server state belongs to a random-cookie guest with a 30-day lifetime.

All mutations require a valid session CSRF secret and reject inconsistent Origin/Referer or cross-site Fetch-Site. Mutations use POST/Redirect/GET; HTMX is used only for GET discovery/quick-shop enhancements. Pricing, variants, stock, totals and receipt snapshots come from PostgreSQL. Per-owner locking prevents concurrent capacity bypass. Unavailable/inactive variants fail both additions and checkout.

The HTML policy permits local scripts/styles/images/fonts/connect only; no unsafe-inline or unsafe-eval. Frame ancestors, objects and base URIs are denied. nosniff, restrictive Permissions-Policy, Referrer-Policy, no-store guest HTML and production HSTS/Secure cookies are set. Errors show a correlation ID header without exposing SQL/connection strings. Logs omit forms, queries, cookies and tokens.

Production requires APP_ENV=production and an HTTPS APP_ORIGIN. Local safe defaults bind only 127.0.0.1. Container uses nonroot and explicitly binds 0.0.0.0 for the hosting ingress. Do not expose a development server on the public internet or trust arbitrary X-Forwarded-For; the app does not use it for authorization or rate limits.

Run `go run ./cmd/web cleanup` periodically after a future host is approved. It deletes expired guest sessions and cascades owned state. It is not an already configured scheduler. Backups/TLS/secrets must be actually configured on the approved hosting service before cutover.

See THREAT_MODEL.md and evidence logs for checks and remaining boundaries. The old Vue toolchain is excluded from the production binary/container but kept for regression reference; its dependency audit is reported separately, not hidden.
