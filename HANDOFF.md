# BLACK LABEL — creative rescue v2 handoff

Current branch: `overhaul/black-label-creative-v2`. Parent: `4329de3b61d851b114d52523fea96d7b0b2f8d46`, exact open draft PR #34. Verified baseline/concept checkpoint: `873eafc`. Creative implementation is currently uncommitted pending the combined browser gate. Main/Pages/deployment unchanged. Commerce/database/security implementation is preserved.

Authoritative second-stage brief read completely: 306 lines, exact copy `docs/creative-v2/MASTER_SPEC.txt`, SHA256 `c44634223ece94cf46130dc9f81889446b1139b4df0fb371ca83268ef2d29199`.

Milestones: M0 fresh baseline/tests/screens/motion → M1 three rendered identities/two homepage compositions/signature motion → M2 contextual image manifest/crop laboratory → M3 independent Collections/Editorial/stories → M4 home/nav/footer → M5 shop/product/all commerce states → M6 visual Studio → M7 five critique rounds/regression/performance/evidence/report. User explicitly authorizes independent creative choices and requires five critiques; these override generic skill confirmation/two-round limits.

Current iteration: M1 integrated, regression repair in progress. Verified M0 checkpoint `873eafc`: fresh real-PostgreSQL Go race tests and 24 browser cases PASS; 96 baseline captures plus DPR2 and actual baseline video saved. Baseline found About/Privacy overflow at 768/1024. Three actual SVG identity alternatives and two homepage alternatives were rendered at desktop/mobile and inspected; A selected (outlined Bodoni house signature, complete campaign, quieter two-line headline). Full original handoff is preserved in `docs/creative-v2/PARENT_HANDOFF.md`.

Uncommitted M1–M6: full-source responsive derivatives and contextual manifest/helper; new home/nav/footer/logo; complete grayscale-to-colour with explicit touch control; sliding-fill buttons; separate shoppable Collections and authored Journal (three substantial stories/three opening layouts, independent metadata, legacy editorial redirects); compact initial catalogue filters; native full-image viewer with focus restoration; image-led Studio category discovery, exact-variant inspector, live photographic board with removal/replacement, existing native save form and no-JS reopening; refined task/info/error routes and source register. No schema/transaction/security changes. Real PostgreSQL Go race suite PASS at M3. Current budget: JS17.25KiB/CSS17.92KiB gzip before generated focal stylesheet, under45/30 limits.

Failures retained honestly in evidence: M1 18/28 then28/30; M3 28/32; M6 28/32 then34/36. Repairs address button/link accessible names, text fade contrast, source article length, narrow-screen min-content and recovery-page contrast. **Latest complete suite:36/36 PASS(1.7m)** in `evidence/after/checkpoint-browser.txt`, original24 cases untouched. New visual Studio/gallery/actual-touch/journal cases pass. Checkpoint real-PG race rerun is in progress. Single next action: commit this verified slice after the Go rerun, then capture six-width routes/image contexts and inspect actual motion before final review/performance/legacy gates.

## Archived stage-one verification (parent checkpoint)

Status: **READY FOR REVIEW**. All 24 browser cases and local gates PASS. Both remote CI workflows PASS at the verified application checkpoint. Four final homepage lab runs meet LCP. [Draft PR #34](https://github.com/lorenzodarioben-lgtm/style-ease/pull/34) is open/attached; no merge or live deployment authorized. See [the morning report](docs/MORNING_REPORT.md).

## Git and recovery

- Branch: `overhaul/black-label-go`.
- Verified application checkpoint: `a3363b47ea42ddcaacd6d718e34832792624ea90`, committed/pushed with a clean tree. This report envelope follows it with documentation/evidence only; no application changes remain uncommitted. Final delivery HEAD is recorded in the chat and reproducible with `git rev-parse HEAD` / `git status --short`.
- Source CI: [legacy CI #68](https://github.com/lorenzodarioben-lgtm/style-ease/actions/runs/39601570154) and [Go/PostgreSQL #3](https://github.com/lorenzodarioben-lgtm/style-ease/actions/runs/39601570151) completed SUCCESS. Linux verifies generation/gofmt/vet/race/vulns/migrate/seed/build/npm audit/all browser cases/container build; docs-only envelope checks run separately after push.
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
- New browser: **24/24 PASS** on container/PostgreSQL on the final build, including reopen/owner rejection/no-JS board and missing-picture recovery before deferred script load. The new image test reproduced two failures against the prior build, then both passed after repair. See black-label-e2e.txt, studio-reopen.txt and image-recovery*.txt.
- Complete Go integration/race/vet PASS (21 top-level tests plus subcases after lifecycle/readiness repairs); real PostgreSQL constraints/concurrency/rollback/idempotency/snapshots/ownership/archived recovery, HTTP limits/CSRF/outage and official HTMX integrity covered. Shutdown waits for active handlers before closing the DB pool; an actual slow-request regression passes. Readiness tests cover success, unavailable DB response, redirect rejection and invalid ports. See go-race-lifecycle.txt.
- npm audit: **10 advisories → zero**. Installed npm 10 updater errored; compatible updates via npm 11.21.1 succeeded. Go govulncheck 1.9.0: no production vulnerabilities. Node host 22.19 emitted engine warnings; CI uses Node 24.
- Fresh Compose database bootstrap and Docker build PASS. Private receipt survived Windows-process→Linux-container restart and final rebuilds. Final nonroot image measured 11,365,687 bytes. Both containers report healthy; app health uses actual /readyz through its own binary. No fake persistence fallback.
- **35 baseline + 50 final route/viewport + 16 filled/dialog/Studio + 2 first-fold screenshots**. Final 50-screen sweep: zero overflow, axe findings or JS errors; real 320–1920 browser matrix and no-JS purchase pass. Design detector: [] / exit 0. Manual AT/real-device checks NOT RUN.
- Lighthouse 13.5.0 isolated mobile lab: home final three runs **99/98/98 performance, LCP 2.264/2.325/2.310s, CLS 0.0018 each**, accessibility 100; shop **99 / 1.8s / 0**; product **98 / 2.3s / 0.001**; empty bag **100 / 1.4s / 0**, accessibility 100 each. Responsive AVIF lowered the tested campaign resource from 144,670 to 55,315 bytes, with WebP fallback. All measured routes meet the local LCP target. These are lab data, not field Web Vitals.
- New JS **14.82KiB gzip**, CSS **8.94KiB gzip**; budgets 70/35. Latest container loopback warm complete-response medians ~6.6–10.8ms over 20 samples/route; not internet TTFB/cold-start evidence.
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

NEXT ACTION: Finish M0 baseline capture/tests, inspect the image contact sheet, then render three identity concepts and two substantially different first folds before choosing the v2 composition.
