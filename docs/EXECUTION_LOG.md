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

## Final parity and hardening

- Committed verified migration checkpoint faf88933159c41f181975f1b0557e597769e4e25.
- Nonroot Compose app replaced native Windows process; private receipt and immutable total survived with the same PostgreSQL volume. Container image measured 10,721,988 bytes at that checkpoint.
- Restored multi-selection category/size/colour forms, accepting repeated and legacy comma-list keys. Browser test initially tried hidden checkbox assertions, then exposed an overlay covering Apply. Native panels now expand in-flow, and the test waits for HTMX history completion. Four targeted cases passed; cross-tab notifications/refetch passed on both viewports.
- Full expanded new suite: 22/22 PASS (1.6m). Legacy six browser scenarios and 168 unit tests pass; original budgets unchanged. Design detector returned [] with exit 0; full master text hash matches extracted source.
- Added pre-allocation guest issuance cap and its test. CI Node 24, exact govulncheck, asset budgets and build cache prepared; Pages deploy workflow unchanged.
- Isolated Lighthouse checkpoint: 87/99/83/100 performance for home/shop/product/bag; all four automated accessibility 100. Homepage forced-reflow trace identified immediate focus; moved route focus until after initial rendering without stealing active interaction. No field metrics claimed.
- Final archive-state review: preserve unavailable owner references, recovery/removal guidance, no invalid quantity blocking Remove, checkout/outfit gating. Added PostgreSQL and HTTP regression coverage. Final consolidated verification running.

## 2026-10-21 23:25 +11 — delivery refinement

- Parity/recovery/Studio checkpoint 94beeacbf28450c039df78d4046543b5a7c6b83a pushed only to overhaul/black-label-go. Remote main still ae12cd35dbfd8b8f4b0ff985718b502bc81bda01; local main still fecf0cab47eee3a7a123f4d74d3d4ab2090a783d. Deploy workflow has zero diff.
- Saved Studio reopening now restores actual canvas photographs, name, variants and total on server HTML as well as JS; foreign owners 404. Full 22 cases/race passed before delivery changes.
- Found process lifecycle bug: ListenAndServe returned before the shutdown goroutine drained active handlers. Main now waits for bounded shutdown before closing its DB pool. Actual in-flight-request test and Go race/vet gates pass (go-race-lifecycle.txt).
- Built/restarted local nonroot Compose app with the repair and new responsive campaign AVIF; containers healthy. No named volume removal. Selected mobile photo fell from 144,670 to 55,315 bytes with the same composition, 65-quality AVIF and WebP fallback.
- Three isolated Lighthouse 13.5.0 mobile final runs: performance 99/98/98, accessibility 100 each, LCP 2.264/2.325/2.310s, CLS 0.0018 each, TBT 35/9/45.5ms. Local LCP target met; no field claim. Sanitized/gzipped trace and protocol evidence remove bearer-cookie headers before retention.
- Final 22-case browser/screenshot refresh in progress; no new result claimed yet. Next checkpoint will contain results, draft PR and morning report.

## 2026-10-21 23:38 +11 — final local gates passed

- Expanded image-failure regression deliberately holds deferred JS until the campaign picture has failed. Prior container failed both desktop/mobile cases; fixed source removal, accessible unavailable text and pre-execution failure sweep. Both targeted cases pass. Full expanded browser gate: 24/24 PASS in 1.6m.
- Added binary readiness probe for the distroless image: no curl/shell dependency, bounded local request, non-200/redirect/invalid-port rejection tested. App and DB both report healthy. Compose has 15s stop grace for the ten-second active-request drain. Final image 11,365,687 bytes.
- Final Go race/vet pass (21 top-level cases plus subcases), actual PostgreSQL. Repository validate passes format/lint/168 legacy unit tests/build/original 85/7KiB budgets; legacy six browser cases previously passed with unchanged legacy code. New budgets are 14.82KiB JS / 8.94KiB CSS gzip.
- Final 50-screen capture has no overflow, axe findings or JS errors; desktop/mobile first folds refreshed and visually inspected with saved Studio board. Private immutable receipt remains available through final rebuilds. No owner-token headers remain in sanitized retained Lighthouse trace/protocol logs.
- Final code checkpoint/push and draft PR follow. Remaining high-impact verification: manual screen-reader review. No production operations authorized or performed.
- Additional final-runtime Lighthouse after image recovery/readiness/stop settings: 98 performance, 100 accessibility, LCP 2.271s, CLS 0.0018, TBT 0ms. Retained separately; all four post-AVIF home runs meet the local target. CI concurrency now cancels superseded runs on the same feature branch.

## 2026-10-21 23:47 +11 — source checkpoint and remote review proof

- Application checkpoint a3363b47ea42ddcaacd6d718e34832792624ea90 committed/pushed only on overhaul/black-label-go; tree clean at the boundary. Remote main remains ae12cd35dbfd8b8f4b0ff985718b502bc81bda01.
- Created draft PR #34 and attached it to the chat. Did not merge or deploy. Local browser panel requested at http://127.0.0.1:8080.
- Remote CI #68 / 39601570154 and Black Label Go and PostgreSQL #3 / 39601570151 both completed SUCCESS on that application SHA. All Linux job steps passed, including 24-case browser gate and production Docker build. Recorded actual connector results in github-ci-source-checkpoint.json.
- Added the requested eleven-part morning report with gallery, exact code checkpoint, commands, tested boundaries and deferred scope. All 26 local report links checked and present. Report/HANDOFF/README/scorecard updates are documentation only; final delivery SHA is provided in the chat after this envelope is committed.
- Single next action after delivery: manual screen-reader review of purchase and saved Studio; no new production operations authorized.
