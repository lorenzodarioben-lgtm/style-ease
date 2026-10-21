# Execution log

## 2026-10-21 — initialization (Australia/Sydney)

- Read full attached master spec; local repository was clean at df89d53.
- Fetched origin/main; verified ae12cd35dbfd8b8f4b0ff985718b502bc81bda01, PR #32 rollback.
- Created overhaul/black-label-go, fast-forwarded only that branch to current origin/main.
- Started baseline dependency install and portable official Go download; Docker Desktop startup requested.
- Inspected catalogue, routing, query contracts, architecture, six CSS layer structure and deploy workflow.
- PR #30 modified CSS/header extensively; #32 restores prior storefront. Lesson: replace composition/engine coherently, preserve behavior, avoid another superficial CSS overlay.
- Baseline site and production deployment configuration preserved.

## Commerce and first visual verification

- Existing suite measured 168 tests / 23 files; six legacy browser tests passed. Captured 35 baseline screenshots.
- Downloaded SHA256-verified Go 1.27.3; pinned templ 0.3.1070, pgx 5.11.0, locally served HTMX 4.0.0. Read current HTMX 4 headers/history/events docs.
- Docker startup did not yield a working engine. Installed portable real PostgreSQL 18.6 from Zonky's Maven binary distribution; initialized private loopback cluster at 54329. No production DB touched.
- Generated deterministic 20-product seed from original IDs/prices/options, with unsupported claims removed and inherited photographs designated editorial references. Self-hosted responsive WebP files and OFL fonts.
- Implemented commerce/session/database transactions, full HTML forms, HTMX filter and quick-shop fragments, private reviews, editorial collections and saved outfit board.
- First template generation failed due compact control-block syntax; corrected and formatted with templ. Compilation/migration/seed succeeded.
- Integration harness initially refused its own cleanup schema due incorrect prefix length; corrected. One rollback test incorrectly batched parameterized statements; split it. Real PostgreSQL/domain/HTTP suites then passed; retained evidence.
- Captured 50 overhaul screens. First review found intrinsic-height distortion, early lazy-image capture, four overflows and moderate region/heading findings. Fixed image heights, capture decoding, grid min-width, narrow display type and landmarks/headings.
- Desktop/mobile commerce browser suite and second visual capture running. Compatible legacy npm advisory remediation follows capture; final result pending.

## Verified product checkpoint

- HTMX browser inspection showed detail.ctx.target/sourceElement; repaired quick-shop opening and per-dialog focus maps. The four targeted failing scenarios then passed.
- New full browser suite: 20/20 PASS, including no-JS checkout, saved Studio looks, private receipts, 320–1920px matrix and axe scans.
- Updated axe exposed menu label-content mismatch; fixed in new UI. Legacy product Compare had redundant conflicting aria-label; removed that attribute without changing tests. Legacy browser suite then passed 6/6.
- Legacy validate passed 168 unit tests/23 files plus format, lint, production build and original bundle budgets. npm 10 update/fix errored; npm 11.21.1 compatible updates succeeded and audit reports zero advisories.
- Go race tests passed and govulncheck 1.9.0 reported no production vulnerabilities. Docker engine became available; initial nonroot production image build passed.
- Initialized a fresh Compose PostgreSQL 18.6 volume and reran migrations/seed/integration checks. Portable DB stopped; data directory preserved.
- First Lighthouse mobile lab: performance 80, LCP 4s, CLS 0. Removed LCP photo animation, added 400px image, compressed campaign sources, added gzip and content fingerprints. Before report retained; final rerun pending.
- Sixteen additional filled-state/dialog/receipt/Studio screenshots captured. Preparing Windows-process→Linux-container persistence check with cookie state in ignored tmp/ only.
