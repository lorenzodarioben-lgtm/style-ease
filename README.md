# STYLE EASE

**Project Black Label. A considered wardrobe.**

An editorial fashion concept store by **Lorenzo Ben**, rebuilt as a Go + templ + HTMX 4 + PostgreSQL application. Explore 20 sample pieces, compare their details, keep exact variants, compose an outfit and complete a private demo order.

![Black Label desktop homepage](docs/screenshots/overhaul/home-1440.png)

This feature branch is a separate application. The [existing GitHub Pages storefront](https://lorenzodarioben-lgtm.github.io/style-ease/) and its deployment remain unchanged. Current verification and remaining boundaries are in [Review readiness](docs/REVIEW_READINESS.md) and [HANDOFF.md](HANDOFF.md).

## Explore

- An architectural monochrome identity, cinematic campaign, self-hosted DM Sans/Bodoni typography, responsive local WebP imagery and coherent shopping/receipt/error layouts.
- Database-backed catalogue, original numeric IDs, stable product slugs, search over attributes, shareable filters, sorting, pagination and real collection relationships.
- Required size/colour choices, quick shop, shared per-product demo capacity, exact-variant wishlist, save for later, undo removal and comparison of up to three pieces.
- Guest-owned PostgreSQL state, private demo reviews, recently viewed history and immutable receipts. Checkout is transactional, server-priced and idempotent.
- **Style Studio:** compose a photographic outfit board, choose valid variants, save/rename/delete private looks and add an entire outfit atomically.
- Ordinary HTML forms, a complete no-JavaScript purchase path, keyboard-operable dialogs, visible focus, reduced motion and ink-friendly receipt printing.

This is a **demonstration**. No payments, real addresses, emails or shipment are collected/processed. Prices, materials, sizes and colours are sample catalogue data; unchanged original dollar values are explicitly designated USD. Unsplash photographs are editorial references, not exact product/variant photographs or brand affiliations. Reviews are private, unverified guest records, not customer testimonials.

## Run locally

Requirements: Go **1.27.3**, Docker with Compose. Node **24.15+** is recommended only for browser tests and the retained legacy reference.

```sh
docker compose -p styleease-blacklabel up -d --wait db
go tool templ generate
go run ./cmd/web migrate
go run ./cmd/web seed
go run ./cmd/web
```

Open **http://127.0.0.1:8080**. Default database: `style_ease` on loopback port `54329`, user `style`, local-only demo password `local_demo_only`. Override with DATABASE_URL; `.env.example` documents configuration. Go does not automatically read .env.

For the full container application, bootstrap as above, stop the local Go process, then:

```sh
docker compose -p styleease-blacklabel --profile app up -d --build app
```

PowerShell test configuration:

```powershell
$env:DATABASE_URL='postgres://style:local_demo_only@127.0.0.1:54329/style_ease?sslmode=disable'
$env:TEST_DATABASE_URL=$env:DATABASE_URL
go test -count=1 ./cmd/... ./internal/... ./views/...
```

The named database volume survives process/container restarts. Do not remove it as part of normal startup. Migrations/seeding are explicit and never run on ordinary application startup. Seed refuses production. Production needs separate approved hosting, HTTPS origin, secret database connection and actual cleanup/backup configuration.

## Verify

```sh
go vet ./cmd/... ./internal/... ./views/...
go test -count=1 ./cmd/... ./internal/... ./views/...
go test -race ./internal/...
go run golang.org/x/vuln/cmd/govulncheck@v1.9.0 ./cmd/web
npm ci
npx playwright install chromium
npx playwright test --config=playwright.black-label.config.js
docker build -t style-ease-black-label:local .
```

Integration tests require TEST_DATABASE_URL and create/drop isolated test schemas. The browser suite runs against the actual Go server and PostgreSQL, covering shopping, ownership, HTMX history, no-JS checkout, Studio, accessibility and 320–1920px layouts. Raw reports, screenshots, measured budgets and limitations are linked from the [quality scorecard](docs/QUALITY_SCORECARD.md). No field-performance or WCAG certification claims are made.

The old Vue reference and its unchanged tests remain runnable with `npm run validate` and `npm run test:e2e`; they are excluded from the Go image. Retrieve the original baseline at `ae12cd35dbfd8b8f4b0ff985718b502bc81bda01`. Old origin-local browser storage does not automatically transfer; old hash links remain intact on Pages. New server aliases cover `/product/1`, `/products` and `/cart` path URLs.

## Review in a few minutes

Home → Shop → search/filter → quick shop → choose a variant → save or add → Bag → sample checkout scenario → Review → demo receipt. Then compare a few pieces and open Style Studio to save and add a composition. Repeat at a phone width and use Tab/Escape; checkout also works without JavaScript.

## Engineering notes

The production image runs a nonroot Go binary with embedded assets. PostgreSQL transactions, owner-scoped reads, 256-bit guest tokens hashed at rest, session CSRF, Origin/Referer checks, request limits, a restrictive local-only CSP, gzip and content-fingerprinted CSS/JS form the core. There is no SPA, admin, payment gateway, external tracking or fictional recommendation service.

[Architecture](docs/ARCHITECTURE.md) · [Data model](docs/DATA_MODEL.md) · [Feature parity](docs/FEATURE_PARITY.md) · [Design system](docs/DESIGN_SYSTEM.md) · [Art direction](docs/ART_DIRECTION.md) · [Threat model](docs/THREAT_MODEL.md) · [Testing](docs/TESTING.md) · [Performance](docs/PERFORMANCE.md) · [Operations](docs/OPERATIONS.md)

MIT license. Original [Style Ease design](https://codepen.io/Lorenzo-Ben/pen/OPPaqxx) and development by Lorenzo Ben. Font licenses ship in `assets/fonts`; image sources and terms are recorded in [asset provenance](docs/ASSET_PROVENANCE.md).
