# Performance evidence

Targets: field LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at p75. No production audience/telemetry is configured, so this session measures only local synthetic behavior.

The initial Lighthouse mobile run (Lighthouse 13, installed Playwright Chromium, Windows loopback, simulated mobile throttling) scored 80 performance, with 4.0s LCP, 310ms total blocking time and CLS 0. See evidence/lighthouse-home-before.json. The LCP breakdown implicated photograph animation/render delay; image delivery and compression also offered savings. This was measured, not accepted as a final target result.

Repairs: removed animation from the LCP photo, shortened nonblocking headline motion, added a 400px campaign source, compressed the 800/1600 WebP variants, negotiated gzip for HTML/CSS/JS, and fingerprinted authored CSS/JS for immutable caching. HTMX has a versioned filename and official SRI. Images/fonts bypass redundant compression. Guest HTML stays no-store.

The first size measurement was roughly 14.4KiB gzip combined JS (HTMX 13,097 bytes + authored JS 1,637), CSS 8,247 bytes gzip, DM Sans 36,932 bytes, Bodoni 25,884 bytes. The campaign changed from 511,944 bytes (1600) / 168,652 (800) to 463,216 / 144,670 plus a 48,850-byte 400 source. Final authored-source measurements are in evidence/performance.json, produced by scripts/measure-performance.mjs.

Initial full-response loopback warm medians were approximately 2–3.5ms over 20 samples/route; the first homepage request was 72ms. These are local complete-response measurements with a warm database, not internet TTFB, cold database results or user-facing latency promises. Final figures, route conditions and Lighthouse results are summarized in QUALITY_SCORECARD.md.

After moving route focus off initial rendering, home measured 88 performance / 100 automated accessibility / LCP 3.5s / CLS 0. The next measured issue was an oversized mobile campaign resource. Added AVIF 400/640/960/1600-width sources while retaining WebP fallback and the same source composition/CSS treatment; the tested mobile resource is now 55,315 instead of 144,670 bytes. Intrinsic dimensions now match the source. The offline Pillow generation script is retained.

Final isolated Lighthouse 13.5.0 mobile home runs scored 99/98/98 performance, all 100 automated accessibility. LCP was 2.264/2.325/2.310s (median 2.310), CLS 0.0018 each, TBT 35/9/45.5ms. All three meet the local 2.5s LCP target. Shop/product/empty-bag single final runs are 99/98/100 performance, LCP 1.8/2.3/1.4s, CLS 0/0.001/0 and accessibility 100 each. Reports retain settings and benchmark index. Earlier runs had different local workloads and are diagnostic evidence, not a controlled causal comparison. No field target is claimed passed.

Sanitized final trace/protocol logs are stored as gzip JSON; cookie/authorization headers are removed by scripts/sanitize-lighthouse-trace.mjs before retention. Use `--save-assets` with Lighthouse for a new trace, then run that sanitizer before committing any protocol evidence.

The post-hardening runtime measurement (image recovery, readiness healthcheck and final Compose stop settings present) scored 98/100, LCP 2.271s, CLS 0.0018 and TBT 0ms. It is retained separately in lighthouse-home-runtime-final.json rather than overwriting the three-run sample.

Final authored-source budgets: JavaScript 14.82KiB gzip; CSS 8.94KiB gzip. `scripts/check-black-label-assets.mjs` enforces 70/35KiB respectively in CI. Font/image sizes and 20-sample warm route measurements are in performance.json. Both budgets include real shipped code, not blank-page substitutes.

Run Lighthouse using the installed Chromium path as CHROME_PATH. Do not run heavy browser suites concurrently if comparing lab timing. A single run is variable; retained reports show environment and actual scores. No fabricated perfect score, disabled imagery or field-performance claim.
