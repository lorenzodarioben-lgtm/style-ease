# Verification and reproducibility

Use Go 1.27.3, Docker with Compose, and Node 24.15+ for browser/legacy test tools. The session host had Node 22.19 and emitted engine warnings; recorded checks retain that limitation. Production needs the Go binary and PostgreSQL, not Node.

```sh
docker compose -p styleease-blacklabel up -d --wait db
go tool templ generate
go vet ./cmd/... ./internal/... ./views/...
# Set TEST_DATABASE_URL to the same local PostgreSQL URL as DATABASE_URL.
go test -count=1 -v ./cmd/... ./internal/... ./views/...
go test -race ./cmd/... ./internal/... ./views/...
go run golang.org/x/vuln/cmd/govulncheck@v1.9.0 ./cmd/web
go run ./cmd/web migrate
go run ./cmd/web seed
go run ./cmd/web
```

In another terminal:

```sh
npm ci
npx playwright install chromium
npx playwright test --config=playwright.black-label.config.js
npm run validate
npm run test:e2e
docker build -t style-ease-black-label:local .
```

PowerShell environment syntax:

```powershell
$env:DATABASE_URL='postgres://style:local_demo_only@127.0.0.1:54329/style_ease?sslmode=disable'
$env:TEST_DATABASE_URL=$env:DATABASE_URL
```

The integration harness creates random blacklabel_test_ schemas inside the explicitly selected test DB and drops only its own checked namespace. It never truncates application tables. Without TEST_DATABASE_URL integration tests skip explicitly; CI sets it, and recorded session runs used real PostgreSQL.

Coverage includes query/money/variant rules, seed integrity/constraints, concurrency, failed wishlist moves, bounded comparison/history, parallel idempotent checkout, forced rollback, immutable owned receipts, inactive variants, reviews, saved looks and atomic outfit addition. HTTP verifies full/partial/history representations, forged values, CSRF/Origin/Referer, methods/body/rate limits, expiry, escaping, headers, routes and outages. Asset tests verify actual embedded files and official HTMX SRI. Gzip is decoded in a test.

The browser suite has 12 scenarios × desktop/mobile: purchase/receipt ownership/print; quick-shop focus; wishlist/save/undo; HTMX filters/history and cross-tab state; comparison caps; Studio save/rename/add; saved Studio reopening/ownership/no-JS board; reviews; reduced-motion/navigation/dialogs; no-JS purchase; missing picture-source recovery before deferred JS; responsive/axe sweeps. The matrix scenario allows 90 seconds for 54 navigations and 12 axe scans. Assertions and axe rules remain enabled. Earlier failures are retained in evidence.

The process lifecycle test holds an actual HTTP request open while cancellation starts shutdown, verifies the server does not return early, then releases the handler and verifies its complete response. This protects the database pool from closing before active work drains; the bounded shutdown closes remaining connections after ten seconds.

The binary's healthcheck mode probes `/readyz` with a bounded local-only request and rejects redirects/non-200 responses. Tests distinguish ready/unavailable/redirect responses and reject invalid port values. The Docker image uses that command, so `compose --wait` waits for seeded database readiness. Compose allows 15 seconds before force-kill, longer than the application's ten-second drain bound.

Capture scripts record old/new apps at five device classes. Full-page captures decode lazy images. See QUALITY_SCORECARD.md for final command outcomes. No screen-reader certification, real-device lab or field Web Vitals is claimed.
