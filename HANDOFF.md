# PROJECT BLACK LABEL — morning handoff

Status: **READY FOR LOCAL REVIEW**; final saved-Studio reopening regression gates PASS. No merge or live deployment authorized. Homepage synthetic mobile LCP remains an open performance target.

## Git and recovery

- Branch: `overhaul/black-label-go`.
- Last committed migration: `faf88933159c41f181975f1b0557e597769e4e25`; final hardening/docs/evidence currently dirty awaiting the checkpoint.
- Baseline: `ae12cd35dbfd8b8f4b0ff985718b502bc81bda01`, local tag `black-label-baseline-2026-10-21`.
- Original checkout was clean on revert/pr30-ui-redesign at df89d53. Local main remains fecf0cab47eee3a7a123f4d74d3d4ab2090a783d. No main writes, merge, rebase, force-push, Pages/DNS change, deployment or paid service creation.
- Master read completely (599 lines). `docs/PROJECT_BLACK_LABEL_MASTER.txt` is byte-identical to extracted source; SHA256 49d3b1c855545183cbe12d022be26856cc03feb47b8643f932bab9ab596e187b.

## Completed product

- Real Go 1.27.3 + templ 0.3.1070 + locally vendored HTMX 4.0.0 + pgx 5.11.0 / PostgreSQL 18.6. Typed HTML, normal form fallback, no new SPA. Original Vue source/tests retained outside the production image.
- All 20 original IDs/prices/options seeded, USD sample currency explicit, stable slugs, database collections/membership, attribute discovery, repeated/comma-list filters, sorting/pagination, active-filter removal.
- Required variants, quick shop, owned bag/wishlist/compare/recent state, shared product capacity, quantity/save/move/remove/undo. Archived owned selections stay visible/removable instead of silently blocking checkout.
- Two-stage demo scenario/review/confirm, server totals, transactional/idempotent placement, immutable owned receipts/history/print. No cards, email, real addresses, shipment or physical inventory claims.
- Private bounded unverified reviews; Style Studio board with exact variants, save/reopen (including no-JS), private version creation, rename/delete and atomic outfit-to-bag. Private look URLs require their owner cookie.
- Architectural monochrome identity, self-hosted licensed fonts/responsive images, finished empty/error/form/receipt/mobile states, keyboard/native dialogs, reduced motion, cross-tab refresh and clear-data control.
- Random 256-bit tokens hashed at rest, CSRF/Origin/Referer, expiry/ownership, bounded bodies/collections/rates (including session issuance), CSP/security headers/no-store, gzip, fingerprinted authored CSS/JS, health/readiness and nonroot container.

## Verification

- Reference: **168 unit tests / 23 files**, format/lint/build/original budgets PASS; **6/6 legacy browser cases PASS**. Updated axe found a redundant legacy Compare aria-label conflict; removed the attribute without changing tests.
- New browser: **22/22 PASS** on container/PostgreSQL on the final build, including reopen/owner rejection/no-JS board. Targeted reopening tests also PASS. See black-label-e2e.txt and studio-reopen.txt.
- Complete Go module integration/race/vet PASS (19 top-level tests plus subcases); real PostgreSQL constraints/concurrency/rollback/idempotency/snapshots/ownership/archived recovery, HTTP limits/CSRF/outage and official HTMX integrity covered. Latest saved-look changes are included in the passing final race gate.
- npm audit: **10 advisories → zero**. Installed npm 10 updater errored; compatible updates via npm 11.21.1 succeeded. Go govulncheck 1.9.0: no production vulnerabilities. Node host 22.19 emitted engine warnings; CI uses Node 24.
- Fresh Compose database bootstrap and Docker build PASS. Private receipt survived Windows-process→Linux-container restart. Nonroot image last measured 10,727,916 bytes. No fake persistence fallback.
- **35 baseline + 50 final route/viewport + 16 filled/dialog/Studio + 2 first-fold screenshots**. Final 50-screen sweep: zero overflow, axe findings or JS errors; real 320–1920 browser matrix and no-JS purchase pass. Design detector: [] / exit 0. Manual AT/real-device checks NOT RUN.
- Lighthouse 13.5.0 isolated mobile lab: home **88 / LCP 3.5s / CLS 0**; shop **99 / 1.8s / 0**; product **98 / 2.3s / 0.001**; empty bag **100 / 1.4s / 0**. Automated accessibility 100 on each. These are lab data, not field Web Vitals. Homepage target ≤2.5s is NOT MET.
- New JS **14.68KiB gzip**, CSS **8.94KiB gzip**; budgets 70/35. Container loopback warm complete-response medians ~8.6–12.9ms over 20 samples/route; not internet TTFB/cold-start evidence.
- Earlier failed attempts and before-focus/performance reports remain in docs/evidence. QUALITY_SCORECARD.md, FEATURE_PARITY.md and REVIEW_READINESS.md describe boundaries.

## Running and resuming

Local app: **http://127.0.0.1:8080**. Compose project `styleease-blacklabel`; app/db containers healthy, ports loopback only. Named DB volume persists. Never remove the volume as routine cleanup.

```powershell
docker compose -p styleease-blacklabel --profile app up -d --build --wait
$env:PATH="C:\Users\lorenzodario\Documents\PersonalProjects\_blacklabel_tools\go\bin;"+$env:PATH
$env:DATABASE_URL='postgres://style:local_demo_only@127.0.0.1:54329/style_ease?sslmode=disable'
$env:TEST_DATABASE_URL=$env:DATABASE_URL
go test -race ./...
npx playwright test --config=playwright.black-label.config.js
```

Fresh setup: start DB with `docker compose -p styleease-blacklabel up -d --wait db`, then `go run ./cmd/web migrate`, `go run ./cmd/web seed`, `go run ./cmd/web`. Normal startup never seeds/migrates. See README/OPERATIONS for generic setup. Portable Go is outside the repo; initial portable PG cluster `_blacklabel_tools/pgdata` is stopped and preserved. Do not start both DBs on 54329. Test session token exists only in ignored tmp/.

## Limits / decisions

Licensed photographs are editorial references, not verified garment images; sample facts/options are labelled. No invented brands, discounts, ratings or delivery promises. Old origin-local data/hash URLs are not silently migrated; old Pages stays live. Advanced drag/reorder/export/public Studio sharing, accounts/admin/uploads, real payment/delivery integrations are deferred and unexposed. Hosting/secrets/backups/scheduled retention/field telemetry require a separately approved preview/cutover; none was provisioned.

NEXT ACTION: Reduce homepage simulated mobile LCP from 3.5s to ≤2.5s using the saved final trace, preserving campaign image quality and all passing journeys.
