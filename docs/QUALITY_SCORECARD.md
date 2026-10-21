# Quality scorecard — checkpoint

This file distinguishes verified evidence from pending final checks. Raw logs live in docs/evidence. Environment: Windows, Go 1.27.3, PostgreSQL 18.6 (initial portable instance, then a fresh Docker Compose volume), installed Node 22.19 with engine warnings, Playwright Chromium.

| Dimension                  | Baseline                                           | Black Label checkpoint                                                                                                                      |
| -------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime                    | Vue/Vite browser-only demo                         | Go/templ/HTMX 4/PostgreSQL, compiled and integration tested                                                                                 |
| Persistent commerce        | Browser localStorage                               | Owned guest rows, transactional bag/checkout, immutable private receipts                                                                    |
| Original tests             | 168 unit tests / 23 files; 6 browser scenarios     | Unit/build/lint/bundle validate passed after compatible security updates; latest legacy browser a11y repair pending rerun                   |
| New domain/DB/HTTP/assets  | None                                               | Real PostgreSQL constraints, concurrency, rollback, idempotency, ownership, CSRF, outage, integrity/gzip tests PASS; go-tests.txt           |
| New desktop/mobile browser | None                                               | 20/20 PASS; black-label-e2e.txt                                                                                                             |
| Responsive layouts         | 35 baseline captures                               | 50 new route/viewport screens plus 16 filled/dialog/receipt/Studio captures                                                                 |
| Accessibility              | Original axe suite passed with old dependencies    | New route/interactive axe and keyboard/reduced-motion/no-JS tests pass; menu label fixed after newer axe reported it                        |
| Security audit             | 10 npm advisories (3 moderate, 6 high, 1 critical) | Compatible lockfile update: zero npm advisories; Go production scan: no vulnerabilities found                                               |
| Race checks                | None                                               | Go race tests pass; rerun after final performance changes pending                                                                           |
| Production image           | Static Pages artifact                              | Nonroot image build passed; final Compose restart/persistence verification running                                                          |
| Synthetic performance      | Legacy initial bundle 82–85KiB gzip range          | Initial new JS ~14.4KiB / CSS ~8.1KiB gzip; compression/fingerprints added. Lighthouse before: 80, 4s LCP, CLS 0. Final measurement pending |
| Safety                     | Main/Pages live                                    | Feature branch only; main and deploy.yml unchanged; no live operations                                                                      |

Known boundaries: editorial-reference imagery, sample product facts, no physical stock/payments/delivery, private guest reviews and 30-day session state. No automatic cross-origin localStorage migration. Advanced public outfit sharing/export, accounts/admin and real integrations remain deliberately unexposed.

Readiness at this checkpoint: remaining work is consolidated final container/performance verification and handoff publication; no merge or deployment authorized.
