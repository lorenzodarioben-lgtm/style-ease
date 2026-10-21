# Local operations and future hosting

Default URL: http://127.0.0.1:8080. DATABASE_URL defaults to the private Compose database on 127.0.0.1:54329. BIND_ADDR defaults to loopback, PORT to 8080, APP_ENV to development and APP_ORIGIN to the local URL. Go does not autoload .env; export shell values. Unknown APP_ENV fails startup. Production requires explicit DATABASE_URL and an HTTPS APP_ORIGIN; cookies then use Secure.

## Bootstrap and stop

Run `docker compose -p styleease-blacklabel up -d --wait db`, then `go run ./cmd/web migrate`, `go run ./cmd/web seed`, `go run ./cmd/web`. Seed is explicit, refuses production and never runs on ordinary startup. Migrations are versioned and serialized. Seed is repeatable and never deletes records or overwrites catalogue edits. For containers, use `docker compose -p styleease-blacklabel --profile app up -d --build app` after bootstrap. The image is nonroot and embeds all assets.

The named volume preserves state when web processes/containers restart. Stop services without removing volumes. Do not use `docker compose down -v` routinely: that destroys local records. `/healthz` checks the process; `/readyz` requires schema plus active catalogue data. Request/server timeouts and a 10-second graceful shutdown are configured. Error logs omit form values, cookies, queries and connection strings.

`go run ./cmd/web cleanup` deletes expired guest sessions and cascades private state. A future approved host must actually schedule it; no scheduler is provisioned. The clear-data UI deletes only the current guest. Backups require actual pg_dump/pg_restore or provider configuration and restore testing. No backups or monitoring service were provisioned. No automatic down migration is provided; review schema compatibility and restore strategy before upgrading or rolling back.

## Future Render cutover — preparation only

No services, plans, previews, domains or secrets have been created. Use the Docker image on a separate preview origin after approval. Configure PORT, HTTPS APP_ORIGIN, host-secret DATABASE_URL, readiness, explicit migrations, a reviewed initial catalogue import, cleanup and tested backups. Keep manual deploy control and the exact reviewed feature branch.

[Render's current free-instance documentation](https://render.com/docs/free) states free web services idle after 15 minutes; free PostgreSQL expires after 30 days and has no backups. No paid plan is selected. Review current pricing, preview eligibility and spending limits before approval.

Cutover requires explicit human signoff after TLS/secrets, persistence/ownership, restore and browser checks on the separate host. Preserve Pages as rollback. Fragments never reach Go; any compatibility script on the old origin requires a separately approved Pages change. Roll back traffic to unchanged Pages and preserve the new database for diagnosis.

## Session tools

Portable, SHA256-verified Go is in sibling _blacklabel_tools/go/bin. The initial portable PostgreSQL 18.6 data directory _blacklabel_tools/pgdata was stopped and preserved when Docker became available. Current verification uses Compose. Never start both databases on 54329. These runtimes/data directories are not committed.

The distroless image uses its own healthcheck command to probe /readyz without a shell or curl. Compose --wait now checks actual seeded application readiness. On SIGTERM, active requests drain for up to ten seconds before the database pool closes; Compose stop_grace_period is 15s. Allow at least 15 seconds for direct docker stop or a future platform termination window. Liveness (/healthz) alone does not establish database readiness.
