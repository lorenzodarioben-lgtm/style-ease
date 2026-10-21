# PROJECT BLACK LABEL — active handoff

Status: IN PROGRESS / NOT READY FOR MERGE. Main and live Pages are untouched.

Branch: `overhaul/black-label-go`, created from fetched `origin/main`.
Baseline / HEAD at initialization: `ae12cd35dbfd8b8f4b0ff985718b502bc81bda01`.
Original checkout was clean on `revert/pr30-ui-redesign` at `df89d53`.
Master specification read completely (599 lines); preserved byte-for-byte in `docs/PROJECT_BLACK_LABEL_MASTER.txt`.

## Ordered execution

1. Record old app tests, screenshots, contracts and content defects.
2. Build secure Go/templ/PostgreSQL browse → bag → demo receipt slice.
3. Complete variant wishlist, comparison, query discovery and other parity.
4. Rebuild the visual world, inspect real desktop/mobile screens and refine.
5. Add finished editorial/studio slices only after commerce works.
6. Verify, document actual evidence, commit recoverable checkpoints.

## Decisions

- Architectural monochrome fashion editorial, original STYLE EASE identity.
- Preserve all 20 legacy IDs/prices/options; remove unsupported marketing claims and artificial ratings in new runtime. USD explicitly labels unchanged dollar values; no conversion.
- Preserve shared product capacity across variants per guest. Demo stock is not physical reserved inventory.
- No live payments, email, admin, customer data, hosting purchases, deployment or main changes.
- Keep legacy Vue toolchain runnable during migration; clean start for new-origin guest sessions.

## Evidence and blockers

- Git remote verified; network fetch succeeded after sandbox network retry.
- Baseline: 168 unit tests / 23 files and all 6 original Playwright scenarios passed. 35 real baseline screenshots captured. Initial format/lint failures from new session artifacts recorded and repaired; full legacy validate still to rerun.
- Go 1.27.3 installed and official SHA256 verified in sibling `_blacklabel_tools/go/bin`. Go/templ compile and migration/seed succeeded.
- Docker is now running. Fresh PostgreSQL 18.6 Compose volume is current on loopback port 54329; the initial portable cluster was stopped and its data preserved in sibling `_blacklabel_tools/pgdata`.
- New engine: seeded catalogue and variants, hashed-token guests, session CSRF/origin protection, shared capacity, wishlist/compare/recent history, idempotent transactional checkout, immutable private receipts, guest-owned reviews and saved looks.
- Real database/HTTP tests PASS: 7 PostgreSQL integration scenarios, 4 domain scenarios (plus 6 filter cases), 3 HTTP/config/outage scenarios (plus 7 subcases). See docs/evidence/go-tests.txt.
- New visual system and all main pages implemented. First 50-screen review found four overflow cases plus landmark/heading findings; fixed. Second sweep: 50 screens, zero overflow, zero axe/JS findings with its recorded scanner. Updated axe later found visible Menu/accessibility-name mismatch; repaired. Full new browser suite: 20/20 PASS (2.1m).
- Runtime http://127.0.0.1:8080 currently served by local bin/style-ease-next.exe. Server process is session-local. No hosting or deployment operations.
- Legacy audit: 10 advisories → zero with compatible lockfile updates via npm 11.21.1 (installed npm 10 updater errored). Legacy validate PASS: 168 tests/23 files, lint/format/build/budgets. Legacy browser 6/6 PASS after removing a redundant conflicting aria-label from the reference Compare button; no tests weakened.
- New Go race checks PASS; govulncheck 1.9.0 reports no production vulnerabilities. Docker image build PASS, final Compose app/restart verification in progress.
- Lighthouse before: 80 performance, 4s simulated mobile LCP, CLS 0. Measured fixes shipped: no LCP photo animation, 400px campaign source, gzip and fingerprinted authored CSS/JS. Final lab rerun pending; before report preserved.
- Captured 16 additional real filled-bag/checkout/receipt/wishlist/comparison/quick-shop/Studio screens. Private restart session token lives only in ignored tmp/.
- Files are uncommitted pending browser verification. Main/Pages workflow unchanged.

NEXT ACTION: Complete Compose restart/persistence verification, then finish multi-value filter UI parity and consolidated final measurements.
