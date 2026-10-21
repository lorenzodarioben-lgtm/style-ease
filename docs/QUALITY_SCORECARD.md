# Quality scorecard

Status: **READY FOR REVIEW**. Merge/production cutover is not authorized. All measured routes meet the local mobile lab LCP target; no field Web Vitals exist.

Environment: Windows, Go 1.27.3, real PostgreSQL 18.6 (portable baseline work, then fresh Compose volume), Node 22.19 with documented engine warnings, Playwright Chromium; final browser app is the nonroot Linux Go container. CI is configured for Node 24 and Go 1.27.3. Remote CI status is reported separately from local proof.

| Dimension             | Baseline                                                           | Final local evidence                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime/state         | Vue/Vite, browser localStorage                                     | Go/templ/HTMX 4/PostgreSQL; real migrations/seed and durable guest state                                                                                             |
| Reference regressions | 168 unit tests / 23 files; 6 browser cases                         | All 168 tests plus format/lint/build/original budgets PASS; all 6 legacy browser cases PASS                                                                          |
| New browser journeys  | None                                                               | **24/24 PASS**, desktop/mobile, actual Go container + PostgreSQL; black-label-e2e.txt                                                                                |
| Database correctness  | No backend                                                         | Constraints, concurrent shared capacity, atomic wishlist/outfit moves, retry idempotency, forced rollback, receipt snapshots/ownership, archived-state recovery PASS |
| HTTP/security         | Browser-only                                                       | Full/partial/history HTML, CSRF/Origin/Referer, forged prices/options, escaping, expiry, request/rate limits, outages and recovery PASS                              |
| Race/advisories       | None; 10 npm advisories                                            | Go race suite PASS; govulncheck 1.9.0: no vulnerabilities found; npm audit: **zero advisories**                                                                      |
| Persistence/restart   | Same-browser storage                                               | Owned receipt/total survived native Windows process → nonroot Linux container restart on same volume                                                                 |
| Layout/visuals        | 35 real baseline screenshots                                       | 50 final route/viewport captures, 16 filled/dialog/receipt/Studio captures, plus desktop/mobile first folds                                                          |
| Accessibility         | Original suite with earlier axe                                    | Final route/interactive axe, native keyboard/dialog/reduced-motion and no-JS purchase checks PASS; final 50-screen report has no findings/overflow/JS errors         |
| Asset budgets         | Legacy JS 84.47KiB/CSS 6.07KiB gzip, within unchanged 85/7 budgets | New JS **14.82KiB**, CSS **8.94KiB** gzip, below 70/35 budgets; no SPA runtime                                                                                       |
| Container             | Static Pages artifact                                              | Docker build and actual readiness health PASS; nonroot image 11,365,687 bytes; persistent local DB, tested active-request drain                                      |
| Safety                | Main/Pages live                                                    | Feature branch only; Pages deploy workflow unchanged; no merge/deploy/DNS/service purchase                                                                           |

## Isolated Lighthouse 13.5 mobile lab

| Route               | Performance | Automated accessibility |   LCP |   CLS |
| ------------------- | ----------: | ----------------------: | ----: | ----: |
| Home (3-run median) |          98 |                     100 | 2.31s | 0.002 |
| Shop                |          99 |                     100 |  1.8s |     0 |
| Product             |          98 |                     100 |  2.3s | 0.001 |
| Bag (empty guest)   |         100 |                     100 |  1.4s |     0 |

These are synthetic Windows/loopback runs with mobile emulation and simulated throttling, not field performance, INP measurements or a controlled multi-device benchmark. Home has three isolated final runs: performance 99/98/98, LCP 2.264/2.325/2.310s, CLS 0.0018 each and TBT 35/9/45.5ms; the other routes have one final run each. The initial diagnostic homepage run was 80/4s LCP/CLS 0; intermediate reports are retained. Responsive AVIF delivery reduced the selected mobile campaign resource from 144,670 to 55,315 bytes while preserving composition and WebP fallback. **All three final homepage runs meet the 2.5s local lab target.** No field-performance result is implied.

Final performance.json records 20 warm complete-response samples per home/shop/product/bag/checkout route. Earlier native measurements and current container measurements have different environments; do not present their difference as an internet speed claim. See PERFORMANCE.md and raw reports.

An additional measurement with all final image-recovery/readiness fixes and Compose stop settings present scored 98 performance / 100 accessibility / LCP 2.271s / CLS 0.0018 / TBT 0ms. See lighthouse-home-runtime-final.json. This fourth measurement corroborates the three-run delivery sample without replacing it with a selected score.

## Remote CI

Remote verification of application checkpoint `a3363b47ea42ddcaacd6d718e34832792624ea90`: [legacy CI #68](https://github.com/lorenzodarioben-lgtm/style-ease/actions/runs/39601570154) and [Go/PostgreSQL #3](https://github.com/lorenzodarioben-lgtm/style-ease/actions/runs/39601570151) completed SUCCESS. The Linux run includes reproducible generation, format/vet/race, vulnerability scan, actual migrations/seed, binary, npm audit, full browser journeys and Docker build. Evidence is retained in github-ci-source-checkpoint.json; later documentation-envelope checks are separate.

## Limits

Photographs are explicitly editorial references; all catalogue facts/prices/options are demonstration data. No physical stock, payments, fulfilment, accounts or verified public reviews. Guest data has a 30-day cookie boundary, not cross-device identity. Advanced public Studio sharing/export/drag editing is deferred and unexposed. Manual assistive-technology/real-device testing, production telemetry, hosting, backups and scheduled cleanup are not configured. Earlier failed attempts are preserved alongside final evidence.
