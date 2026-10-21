# Project Black Label — morning report

Recorded 21 October 2026, Australia/Sydney. **Ready for review; not approved for merge or production cutover.**

## 1. The transformation

Style Ease now has an integrated Go commerce application and a distinct editorial identity: architectural monochrome, a cinematic responsive campaign, a geometric house mark, self-hosted DM Sans/Bodoni typography, photographic collection stories and consistent shopping, Studio, form, empty/error and printable receipt layouts. The catalogue and guest journeys use actual PostgreSQL persistence. The original Vue application remains available as the regression reference.

![Black Label, desktop 1440 × 900](screenshots/overhaul/home-1440-first-fold.png)

## 2. Branch, checkpoint and Git state

- Branch: `overhaul/black-label-go`.
- Verified application checkpoint: `a3363b47ea42ddcaacd6d718e34832792624ea90`, pushed to the same remote branch with a clean tree before this report was written.
- Earlier checkpoints: `faf88933159c41f181975f1b0557e597769e4e25` (transactional commerce), `94beeacbf28450c039df78d4046543b5a7c6b83a` (parity, recovery and saved Studio).
- [Draft PR #34](https://github.com/lorenzodarioben-lgtm/style-ease/pull/34). Created as draft, unmerged, attached to this Codex chat. Both remote workflows completed SUCCESS for the application checkpoint: [CI #68](https://github.com/lorenzodarioben-lgtm/style-ease/actions/runs/39601570154) and [Go/PostgreSQL #3](https://github.com/lorenzodarioben-lgtm/style-ease/actions/runs/39601570151). Documentation-only envelope checks run separately after its push.
- This report/HANDOFF update is a subsequent documentation-only commit. The final chat records its exact delivery HEAD; `git log -1 --format=fuller` and `git status --short` reproduce the current envelope state. No application changes are waiting outside the verified checkpoint.
- Remote main remains `ae12cd35dbfd8b8f4b0ff985718b502bc81bda01`; local main remains `fecf0cab47eee3a7a123f4d74d3d4ab2090a783d`. Baseline tag: `black-label-baseline-2026-10-21`.

## 3. Feature status

| Scope                                                                                                            | Status                      | Evidence                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Original 20 IDs/prices/options, canonical routes, attribute discovery, multiple filters/sort/pagination          | COMPLETE                    | Seed/constraint/domain/HTTP tests; browser history/filter/reload journey                                     |
| Exact variants, quick shop/size guide, bag quantity/save/move/remove/undo, wishlist, compare cap, recent history | COMPLETE                    | Real SQL concurrency/atomicity tests; desktop/mobile shopping cases                                          |
| Two-stage demo checkout, authoritative totals, retry-safe placement, immutable private receipts/history/print    | COMPLETE                    | Concurrent idempotency/forced rollback/ownership/snapshot tests; browser/no-JS purchase; restart persistence |
| Collection stories/editorial, truthful sample specifications, private unverified reviews                         | COMPLETE                    | Database relationships, bounded escaped reviews, route/axe sweep                                             |
| Private Style Studio: exact variant board, save/reopen/rename/delete, whole-outfit addition                      | COMPLETE minimum            | Exact selections/photos/name/total restore, foreign-owner 404 and no-JS reopening; atomic outfit tests       |
| Responsive/keyboard/dialog/reduced-motion/no-JS behavior and image recovery                                      | COMPLETE automated gates    | 24 browser cases, 320–1920px matrix, real route and interactive axe scans                                    |
| Local performance targets                                                                                        | COMPLETE measured lab gates | Four final homepage LCP measurements 2.26–2.33s; all four measured routes ≤2.5s                              |
| Accessibility certification, manual screen-reader/physical-device review; field Web Vitals                       | PARTIAL / NOT RUN           | Automated checks pass; these additional environments were not observed                                       |
| Advanced Studio drag/reorder/export/public sharing; accounts/admin/uploads; real payments/delivery               | DEFERRED                    | Unexposed; no unfinished or deceptive controls                                                               |
| Hosted preview, backups/retention scheduling, production cutover/old-origin data import                          | DEFERRED                    | Operations plan only; requires separate approval and real host configuration                                 |

No outstanding local build/test blocker. Full journey details and deliberate changes are in [FEATURE_PARITY.md](FEATURE_PARITY.md).

## 4. Architecture and database

Go **1.27.3**, templ **0.3.1070**, exact locally served HTMX **4.0.0**, pgx **5.11.0**, PostgreSQL **18.6**, custom CSS and small progressive enhancements. Generated typed templates and assets are embedded in a nonroot distroless binary. Normal HTML forms complete a purchase without JavaScript; HTMX enhances discovery/quick shop.

Versioned migrations and non-destructive, explicit sample seeding establish products/variants/media/collections and owned sessions, bag/wishlist/comparison/history/reviews/looks/orders. Session-row locks serialize mutations; checkout revalidates variants/capacity and writes immutable snapshots in one transaction, with a unique owner/idempotency key. Integer USD money and server-owned totals resist forged requests. Guest cookie tokens have 256 bits of randomness and are hashed at rest; ownership, expiry, CSRF/Origin/Referer checks, bounded inputs/state/rates, local-only CSP and private no-store HTML protect the demo boundary.

The server drains active requests before closing the pool. The image's own readiness command checks `/readyz`; both containers are healthy. Compose allows 15s before force-kill for a ten-second drain. See [ARCHITECTURE.md](ARCHITECTURE.md), [DATA_MODEL.md](DATA_MODEL.md) and [THREAT_MODEL.md](THREAT_MODEL.md).

## 5. Design gallery

All images are actual browser captures, including below-fold decoded photographs. There are 35 baseline and 68 overhaul screenshots (50 route/viewport, 16 populated/dialog/receipt/Studio, two first folds).

| Working route / viewport               | Before                                                                 | After                                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `/`, 1440px                            | [Baseline home](screenshots/baseline/home-1440.png)                    | [Home](screenshots/overhaul/home-1440.png)                                                                |
| `/`, 390px                             | [Baseline phone](screenshots/baseline/home-390.png)                    | [Phone first fold](screenshots/overhaul/home-390-first-fold.png)                                          |
| `/shop`, 1440px                        | [Baseline catalogue](screenshots/baseline/shop-1440.png)               | [Catalogue](screenshots/overhaul/shop-1440.png)                                                           |
| `/products/geometric-t-shirt`, 390px   | [Baseline product](screenshots/baseline/product-390.png)               | [Product](screenshots/overhaul/product-390.png)                                                           |
| `/bag`, 1440px                         | [Baseline empty bag](screenshots/baseline/bag-empty-1440.png)          | [Populated bag](screenshots/overhaul/bag-filled-1440.png)                                                 |
| `/checkout`, 390px                     | [Baseline empty checkout](screenshots/baseline/checkout-empty-390.png) | [Review step](screenshots/overhaul/checkout-review-390.png)                                               |
| `/orders`, owned receipt, 1440px       | No server receipt                                                      | [Printable demo receipt](screenshots/overhaul/receipt-1440.png)                                           |
| `/studio`, saved board, 1440px / 390px | No Studio                                                              | [Desktop](screenshots/overhaul/studio-saved-1440.png), [phone](screenshots/overhaul/studio-saved-390.png) |

The new receipt/look URLs require the owning cookie; gallery files show captured states without publishing that bearer token. [ART_DIRECTION.md](ART_DIRECTION.md) records the critique/repair loops.

## 6. Quality checks

| Check                                                                     | Actual outcome                                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `npm run validate`                                                        | PASS: format, lint, 168 tests / 23 files, production reference build and original bundle budgets |
| `npm run test:e2e`                                                        | PASS: 6 retained legacy browser cases; no test assertions weakened                               |
| `go test -race -count=1 -v ./cmd/... ./internal/... ./views/...`          | PASS: 21 top-level cases plus subcases, actual PostgreSQL                                        |
| `go vet ./cmd/... ./internal/... ./views/...`                             | PASS                                                                                             |
| `go run golang.org/x/vuln/cmd/govulncheck@v1.9.0 ./cmd/web`               | No vulnerabilities found in the production dependency surface                                    |
| `npm audit --audit-level=high`                                            | Zero advisories; initial ten repaired with compatible lockfile updates                           |
| `npx playwright test --config=playwright.black-label.config.js`           | PASS: 24/24 in 1.6m on the real Go container/PostgreSQL                                          |
| Capture/axe sweep                                                         | 50 screens; zero recorded overflow, axe findings or JS errors                                    |
| Fresh database bootstrap, Docker builds and private receipt restart check | PASS; receipt/immutable total survived Windows process → Linux container and final rebuilds      |
| `node scripts/check-black-label-assets.mjs`                               | PASS: JS 14.82KiB gzip / 70KiB; CSS 8.94KiB / 35KiB                                              |
| Impeccable deterministic detector                                         | `[]`, exit 0                                                                                     |

Lighthouse **13.5.0**, Windows loopback, installed Chromium, mobile emulation with simulated network/CPU throttling: homepage delivery runs **99/98/98**, LCP **2.264/2.325/2.310s**, automated accessibility **100** each, CLS **0.0018**. Additional final-runtime run: **98/100**, **2.271s**, CLS **0.0018**, TBT **0ms**. Shop/product/empty bag single runs: performance **99/98/100**, LCP **1.8/2.3/1.4s**, accessibility **100** each. This is local lab evidence, not production field data, INP or accessibility certification.

Warm complete-response medians over 20 loopback samples per route are 6.6–10.8ms, not internet TTFB/cold-start claims. The final nonroot image is 11,365,687 bytes. Host Node 22.19 emitted engine warnings; CI is configured for Node 24.15+ compatibility. Early failed attempts are retained: intrinsic-height/overflow/landmark issues, HTMX v4 event handling, filter overlay, redundant legacy Compare aria-label, archive recovery, saved-board restoration and missing-picture recovery were repaired and retested. See [QUALITY_SCORECARD.md](QUALITY_SCORECARD.md), [TESTING.md](TESTING.md) and [evidence](evidence).

## 7. Known limitations

Photographs are licensed editorial references, not verified exact garment/colour imagery; catalogue facts and prices are sample data. No real payment, address, email, shipment or physical inventory reservation exists. Reviews are private/unverified. Guest-cookie access lasts 30 days and does not provide accounts or cross-device recovery. Old origin-local data and hash fragments do not automatically migrate; unchanged Pages remains available. Public sharing/export and the other deferred surfaces above are unexposed. Manual assistive-technology/real-device checks, field telemetry, actual hosted backups and retention scheduling were not performed or provisioned.

## 8. Run locally

The app is already running at **http://127.0.0.1:8080**. Current setup needs Docker Desktop; restart without deleting the named volume:

```powershell
Set-Location 'C:\Users\lorenzodario\Documents\PersonalProjects\style-ease'
docker compose -p styleease-blacklabel --profile app up -d --wait app
```

Fresh developer setup requires Go 1.27.3 plus Docker:

```powershell
docker compose -p styleease-blacklabel up -d --wait db
go tool templ generate
go run ./cmd/web migrate
go run ./cmd/web seed
go run ./cmd/web
```

Stop the existing app container first if using the native Go alternative on the same port. The portable session Go executable is in sibling `_blacklabel_tools/go/bin`; add it to PATH if needed. Sample development configuration: `APP_ENV=development`, `APP_ORIGIN=http://127.0.0.1:8080`, `DATABASE_URL=postgres://style:local_demo_only@127.0.0.1:54329/style_ease?sslmode=disable`. This is a local-only demo credential, not a production secret. Go does not autoload `.env`. Tests also need `TEST_DATABASE_URL` pointing to this local DB; Node 24.15+ is recommended for tooling. [README](../README.md) and [OPERATIONS](OPERATIONS.md) cover bootstrap, explicit seed, health and future hosting requirements.

## 9. Review in 5–10 minutes

1. Compare home at 1440px and 390px with the baseline gallery; scroll through the full editorial composition.
2. Open Shop, search attributes, choose several filter values, apply/remove them, sort and test back/forward/reload.
3. Open quick shop, choose exact options, use Tab/Escape, then inspect the product/sample photography labels.
4. Save a variant, move it to Bag, change quantity, save/remove/undo; compare up to three pieces.
5. Continue to checkout, select a sample scenario, review, acknowledge DEMO and confirm. Reload/print the private receipt and visit history.
6. Open Studio, choose variants, save, reopen the populated board, rename it and add the whole outfit. Reopen without JavaScript; a new guest cannot read its private URL.
7. Check mobile Menu, reduced motion, empty/error/privacy states and a complete no-JS purchase. Inspect SQL/security/evidence docs beside the experience.

## 10. Safety and readiness

Only the feature branch was pushed. No merge, main update, Pages deployment/workflow alteration, DNS/domain operation, paid resource, real transaction or production database operation was performed. The master file was read fully and its checked-in exact copy hash verified. Existing authorship/history and baseline are preserved. **Draft review is ready. Production merge/cutover is not approved.** No external hosting was provisioned.

## 11. Single next action

**Perform a manual screen-reader review of the purchase and saved-Studio journeys, record focus/announcement/validation findings, and repair failures.** This closes the most important remaining verification gap after the automated, transactional and local performance gates.
