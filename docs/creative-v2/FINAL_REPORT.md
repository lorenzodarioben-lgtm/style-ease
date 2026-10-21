# Black Label creative rescue — delivery report

## Delivery and verified checkpoints

The second-stage creative implementation is complete on **overhaul/black-label-creative-v2**, based on exact draft #34 head **4329de3b61d851b114d52523fea96d7b0b2f8d46**. Application checkpoint **eba11bf600efe75054669abafe051470dafcaa27** contains the final source, assets, generated views and tests. Later commits package documentation and evidence. Baseline/concepts: 873eafc; integrated creative checkpoint: 6b3ae66. Final delivery HEAD is reproducible with `git rev-parse HEAD`; root HANDOFF records publication status.

Go/templ/HTMX4/PostgreSQL architecture, domain transactions, migrations, seed identities, session/ownership and security middleware are preserved. Original Vue source/tests remain. Main, live deployment, billing and DNS were not modified. No merge or production cutover.

## Completed and observed

- **Identity and art direction:** three actual SVG wordmark concepts and two distinct rendered home compositions compared on desktop/phone. Selected lowercase optical house wordmark, matching favicon and ink/ivory/mineral system. These are licensed type-derived outlines, not a claim of an original typeface. Home varies scale, photographic mounting, merchandise, journal and atelier invitations.
- **Photography:** twenty references plus campaign have true dimensions, full minimum bounds, provenance and typed contexts. Repaired independently cropped 480px derivatives from complete 960px sources. Added measured 640px/AVIF delivery, WebP fallback and accurate mounted sizes. Contextual contain preserves intentional source framing; it cannot invent missing content. The source-monochrome photograph stays monochrome.
- **Signature interaction:** original-colour release from grayscale 1 to 0, 560ms directional CTA fill, keyboard equivalents and explicit touch colour controls. Reduced motion makes nonessential transitions immediate. Native modal navigation restores focus; reading stays available without entrance opacity hiding.
- **Collections and Journal:** independent handlers/templates/content. Collections offers counted database-backed shoppable edits. Journal has three authored, multi-chapter visual essays with different openings, contents links, related real merchandise and distinct metadata. Former editorial collection aliases redirect permanently to corresponding essays.
- **Shop and product:** compact native refinement, existing HTMX/history behaviour, complete product references and native original-image viewer with Escape/focus restoration and an ordinary image-link fallback. Exact variants remain explicit; photographs are never recoloured or presented as fabricated alternate angles.
- **Style Studio:** photographic category discovery, product tiles, exact-variant inspector, composition preview, replace/remove and live preview total. Existing database-backed save/reopen/rename/delete/outfit-to-bag operations remain authoritative. Secondary native selects preserve no-JS tasks. Empty inspiration is clearly unsaved.
- **Task/info surfaces:** bag, wishlist, comparison, checkout, receipts, empty/error states, About and Privacy share the house material system. Comparison has count/scroll cues and working navigation. Checkout puts selection and total before final commitment in DOM and phone composition.
- **Critique and revision:** five documented rounds. Fresh finish reviewer found four material issues; one correction batch resolved all four, followed by a scoped ship verdict. A separate fresh documenter updated DESIGN.md and the machine-readable system. This is not blanket human approval of perfect visuals.

## Verification and measured performance

All final local gates pass: **38 current-app browser cases**, **168 original unit tests across 23 files**, **6 original browser cases**, lint/format/build and both asset budgets. Real PostgreSQL race/integration tests, Go vet, template reproducibility and formatting pass. govulncheck reports no vulnerabilities; npm audit reports 0. An existing owned receipt and new two-piece Studio composition survived app-only restarts with the same volume; foreign guest access returns 404.

Final route matrix: 114 captures at 320/390/768/1024/1440/1920, zero recorded overflow, broken media, axe findings or JS errors. Sixteen filled-state captures/scans also pass. Full pages/axe at 390/1440; remaining route images are first views. Image laboratory: 48 contact sheets and 1,008 source/context checks across six widths/DPR 1/2, all passing. Seven real WebM, 24 direct action stills and 21 frames decoded from actual video streams document motion. An initially stale browser-canvas extraction was rejected and replaced with direct FFmpeg decoding.

Lighthouse 13.5.0, isolated sequential local mobile labs, Chrome 156 on Windows, simulated Moto G Power 412×823/DPR 1.75, CPU 4×, 150ms RTT, 1638.4kbps nominal throughput. Three home repetitions and one of each other listed route:

| Route/run | Performance | Accessibility | LCP seconds |      CLS |
| --------- | ----------: | ------------: | ----------: | -------: |
| Home 1    |          98 |           100 |       2.364 |        0 |
| Home 2    |          99 |           100 |       2.129 |        0 |
| Home 3    |          98 |           100 |       2.120 |        0 |
| Shop      |          97 |           100 |       1.957 |        0 |
| Product   |          99 |           100 |       2.265 | 0.000729 |
| Studio    |          97 |           100 |       2.356 | 0.010814 |
| Journal   |          98 |           100 |       2.416 |        0 |

All measured routes meet 2.5s local LCP / 0.1 CLS targets. Host benchmark varied 711–2202: environment-specific lab observations, not field Core Web Vitals. Earlier product 3.466s/Journal 3.635s regressions remain preserved in pre-640 evidence. Complete-source 640/AVIF delivery and accurate slot sizes repaired them without removing creative content. Assets: **17.52 KiB gzip JS / 45 KiB budget**, **19.65 KiB CSS / 30 KiB budget**. Nonroot container: 14,576,032 bytes.

Reproducible commands/evidence: [matrix](QA_MATRIX.md), [before/after](BEFORE_AFTER.md), [image audit](IMAGE_AUDIT.md), [motion](MOTION_SPEC.md), [five critiques](CRITIQUE_LOG.md), [fresh review](FINISH_REVIEW.md), [performance summary](evidence/performance/summary.json). Earlier failures are retained. Private restart session cookies remain only in ignored tmp.

## Implemented but not visually verified

No known completed core route is being handed over without a corresponding screenshot/task check. Engineering covers variant, no-JS, ownership and recovery combinations beyond the photographed examples; each possible database selection was not individually photographed. Safari/Firefox, physical devices and manual screen-reader testing were not run. The independent reviewer inspected its documented subset, not every contact sheet or continuous video. Automated 100 accessibility scores do not establish exhaustive accessibility.

## Deferred

Public deployment/cutover, real payments/fulfilment, accounts/admin/uploads and public sharing remain outside this creative rescue. Multi-angle galleries require actual licensed alternate photographs; the viewer exposes the available original. Browser-native zoom remains available; no custom deep-zoom engine, drag/reorder/export or pretend persisted Studio feature was introduced. No tracking, paid service or animation framework was added.

## Blocked

No implementation or test blocker remains. [Stacked draft PR #35](https://github.com/lorenzodarioben-lgtm/style-ease/pull/35) is open and attached. Linux [legacy CI #70](https://github.com/lorenzodarioben-lgtm/style-ease/actions/runs/39642833906) and [Go/PostgreSQL #6](https://github.com/lorenzodarioben-lgtm/style-ease/actions/runs/39642834268) both PASS at source/evidence envelope90a18e46501c74dbc1a2e0907ad8faf4853c4d38. The following final envelope records reports/CI evidence only. Human creative preference remains a review decision, not an automated score.

## Running and recovery

Preview: **http://127.0.0.1:8080/**. Compose project styleease-blacklabel; healthy app/PostgreSQL 18.6 use loopback 8080/54329 and existing named database volume. Do not remove that volume for routine cleanup.

```powershell
docker compose -p styleease-blacklabel --profile app up -d --build --wait app
$env:PATH='C:\Users\lorenzodario\Documents\PersonalProjects\_blacklabel_tools\go\bin;'+$env:PATH
$env:TEST_DATABASE_URL='postgres://style:local_demo_only@127.0.0.1:54329/style_ease?sslmode=disable'
go test -race -count=1 ./cmd/... ./internal/... ./views/...
npx playwright test --config=playwright.black-label.config.js
```

Normal startup does not migrate/seed. Fresh-database setup is in README/OPERATIONS; current data need no reset. Optional concept/image-lab helper: `node scripts/creative-v2-preview.mjs`, loopback 4174. Its support pages are not production routes.

**Single next action:** review the creative draft PR against the running preview and before/after evidence; no merge or deployment has been authorized.
