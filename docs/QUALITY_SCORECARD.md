# Quality scorecard

Status: **READY FOR REVIEW**. Merge/production cutover is not authorized. The homepage mobile lab LCP target remains open; no field Web Vitals exist.

Environment: Windows, Go 1.27.3, real PostgreSQL 18.6 (portable baseline work, then fresh Compose volume), Node 22.19 with documented engine warnings, Playwright Chromium; final browser app is the nonroot Linux Go container. CI is configured for Node 24 and Go 1.27.3. Remote CI status is reported separately from local proof.

| Dimension             | Baseline                                                           | Final local evidence                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime/state         | Vue/Vite, browser localStorage                                     | Go/templ/HTMX 4/PostgreSQL; real migrations/seed and durable guest state                                                                                             |
| Reference regressions | 168 unit tests / 23 files; 6 browser cases                         | All 168 tests plus format/lint/build/original budgets PASS; all 6 legacy browser cases PASS                                                                          |
| New browser journeys  | None                                                               | **22/22 PASS**, desktop/mobile, actual Go container + PostgreSQL; black-label-e2e.txt                                                                                |
| Database correctness  | No backend                                                         | Constraints, concurrent shared capacity, atomic wishlist/outfit moves, retry idempotency, forced rollback, receipt snapshots/ownership, archived-state recovery PASS |
| HTTP/security         | Browser-only                                                       | Full/partial/history HTML, CSRF/Origin/Referer, forged prices/options, escaping, expiry, request/rate limits, outages and recovery PASS                              |
| Race/advisories       | None; 10 npm advisories                                            | Go race suite PASS; govulncheck 1.9.0: no vulnerabilities found; npm audit: **zero advisories**                                                                      |
| Persistence/restart   | Same-browser storage                                               | Owned receipt/total survived native Windows process → nonroot Linux container restart on same volume                                                                 |
| Layout/visuals        | 35 real baseline screenshots                                       | 50 final route/viewport captures, 16 filled/dialog/receipt/Studio captures, plus desktop/mobile first folds                                                          |
| Accessibility         | Original suite with earlier axe                                    | Final route/interactive axe, native keyboard/dialog/reduced-motion and no-JS purchase checks PASS; final 50-screen report has no findings/overflow/JS errors         |
| Asset budgets         | Legacy JS 84.47KiB/CSS 6.07KiB gzip, within unchanged 85/7 budgets | New JS **14.68KiB**, CSS **8.94KiB** gzip, below 70/35 budgets; no SPA runtime                                                                                       |
| Container             | Static Pages artifact                                              | Docker build and Compose health PASS; nonroot embedded-assets image, about 10.7MB; persistent local DB                                                               |
| Safety                | Main/Pages live                                                    | Feature branch only; Pages deploy workflow unchanged; no merge/deploy/DNS/service purchase                                                                           |

## Isolated Lighthouse 13.5 mobile lab

| Route             | Performance | Automated accessibility |  LCP |   CLS |
| ----------------- | ----------: | ----------------------: | ---: | ----: |
| Home              |          88 |                     100 | 3.5s |     0 |
| Shop              |          99 |                     100 | 1.8s |     0 |
| Product           |          98 |                     100 | 2.3s | 0.001 |
| Bag (empty guest) |         100 |                     100 | 1.4s |     0 |

These are single synthetic Windows/loopback runs with mobile emulation and simulated throttling, not field performance, INP measurements or a controlled multi-device benchmark. The initial diagnostic homepage run was 80/4s LCP/CLS 0; intermediate reports are retained. Removing LCP photo motion, using responsive sources/gzip/fingerprints and moving route focus improved the measured rendering path. **Homepage LCP still misses the 2.5s target.** No score or budget was altered to conceal that.

Final performance.json records 20 warm complete-response samples per home/shop/product/bag/checkout route. Earlier native measurements and current container measurements have different environments; do not present their difference as an internet speed claim. See PERFORMANCE.md and raw reports.

## Limits

Photographs are explicitly editorial references; all catalogue facts/prices/options are demonstration data. No physical stock, payments, fulfilment, accounts or verified public reviews. Guest data has a 30-day cookie boundary, not cross-device identity. Advanced public Studio sharing/export/drag editing is deferred and unexposed. Manual assistive-technology/real-device testing, production telemetry, hosting, backups and scheduled cleanup are not configured. Earlier failed attempts are preserved alongside final evidence.
