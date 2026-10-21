# Creative-v2 verification matrix

Final application checkpoint **eba11bf600efe75054669abafe051470dafcaa27** passes all local gates below, after the final image delivery changes. Original Vue source and all original tests remain intact.

| Gate                                                  | Evidence / command                                                                       | Observed status                                                 |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Protected branch / actual parent                      | `git rev-parse`, actual open draft #34 head4329de3                                       | Creative successor; no main/merge/deploy                        |
| Three identities / two compositions                   | `evidence/concepts`, `concepts.html`                                                     | Rendered and inspected1440/390; A selected/refined              |
| Source/frame laboratory                               | `scripts/creative-v2-image-lab.mjs`, `evidence/image-lab/qa.json`                        | 48 sheets, 1,008 checks; zero failures                          |
| Six-width routes                                      | `scripts/creative-v2-capture.mjs after`, `evidence/after/qa.json`                        | 114 captures; zero overflow/broken/axe/JS findings              |
| DPR2                                                  | Route extras plus full image lab                                                         | All six widths tested at DPR2 in lab                            |
| Filled task surfaces                                  | `scripts/creative-v2-scenarios.mjs`, `after/states/qa.json`                              | 16 screenshots/scans; zero axe/overflow findings                |
| Existing + creative browser journeys                  | `playwright.black-label.config.js`                                                       | **38/38 PASS**, 1.2m; original 24 untouched                     |
| Original unit/lint/format/build/budgets               | `npm run validate`, `after/legacy-validate.txt`                                          | PASS; 168 tests/23 files                                        |
| Original browser                                      | `playwright.config.js`, `after/legacy-browser.txt`                                       | **6/6 PASS**, 14.7s                                             |
| Real database / race / CSRF / ownership / idempotency | `go test -race -count=1 ./cmd/... ./internal/... ./views/...`, `after/final-go-race.txt` | PASS with local PostgreSQL 18.6                                 |
| Go vet                                                | `go vet ./cmd/... ./internal/... ./views/...`                                            | PASS                                                            |
| Go vulnerability scan                                 | govulncheck1.9.0, `after/govulncheck.txt`                                                | No vulnerabilities found                                        |
| npm advisories                                        | `npm audit --audit-level=high`, `after/npm-audit.txt`                                    | 0 vulnerabilities                                               |
| Reference/Studio persistence across app restart       | `persistence-check.mjs`, `creative-v2-persistence.mjs`                                   | PASS; old receipt/new two-piece look retained; foreign guest404 |
| Motion / focus / touch / reduced motion               | Seven WebM +24 direct frames +21 FFmpeg-decoded frames                                   | Actual images/actions inspected; computed end states tested     |
| Fresh creative review                                 | `FINISH_REVIEW.md`                                                                       | Four material fixes resolved; scoped ship                       |
| Design documentation                                  | DESIGN.md + `.impeccable/design.json`                                                    | Fresh documenter complete; YAML/JSON/source checked             |
| New budgets 45/ 30 KiB gzip                           | `scripts/check-black-label-assets.mjs`                                                   | **JS 17.52 KiB / CSS 19.65 KiB**, PASS                          |
| Mobile Lighthouse                                     | `scripts/creative-v2-performance.mjs`                                                    | Seven runs; LCP1.957–2.416s; accessibility100; CLS 0–0.010814   |

Route sweep: Home, Collections, Structure edit, Journal, all three essays, Shop, Product, Studio, empty bag/wishlist/compare/checkout/receipts, About, Privacy,404, Objects edit. Widths320/390/768/1024/1440/1920. Full pages at 390/1440; other route captures are first views. Axe scans at 390/1440, not every screenshot. Filled scans: quick shop, bag, checkout scenario/review, receipt, wishlist, compare, saved Studio at both widths.

Browser environment: Windows, Chromium supplied by Playwright1.62.1, Node22.19; CI uses Node24. App and PostgreSQL run in local Docker, bound to loopback 8080/54329. Performance reports are isolated mobile labs, not field Web Vitals or internet TTFB. No claims of physical-device, Safari/Firefox or manual assistive-technology certification.

Final template generation produced 0 updates, generated diff was clean, and gofmt output empty. Nonroot Docker image14,576,032 bytes; app/database healthy. Remote publication/CI status is recorded in FINAL_REPORT.md and HANDOFF.md.

Remote Linux legacy CI #70 and Go/PostgreSQL #6 both PASS at source/evidence90a18e4; URLs and exact SHAs are recorded in evidence/remote-ci.json. Subsequent delivery changes only reports/evidence.
