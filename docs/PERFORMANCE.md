# Performance evidence

Targets: field LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at p75. No production audience/telemetry is configured, so this session measures only local synthetic behavior.

The initial Lighthouse mobile run (Lighthouse 13, installed Playwright Chromium, Windows loopback, simulated mobile throttling) scored 80 performance, with 4.0s LCP, 310ms total blocking time and CLS 0. See evidence/lighthouse-home-before.json. The LCP breakdown implicated photograph animation/render delay; image delivery and compression also offered savings. This was measured, not accepted as a final target result.

Repairs: removed animation from the LCP photo, shortened nonblocking headline motion, added a 400px campaign source, compressed the 800/1600 WebP variants, negotiated gzip for HTML/CSS/JS, and fingerprinted authored CSS/JS for immutable caching. HTMX has a versioned filename and official SRI. Images/fonts bypass redundant compression. Guest HTML stays no-store.

The first size measurement was roughly 14.4KiB gzip combined JS (HTMX 13,097 bytes + authored JS 1,637), CSS 8,247 bytes gzip, DM Sans 36,932 bytes, Bodoni 25,884 bytes. The campaign changed from 511,944 bytes (1600) / 168,652 (800) to 463,216 / 144,670 plus a 48,850-byte 400 source. Final authored-source measurements are in evidence/performance.json, produced by scripts/measure-performance.mjs.

Initial full-response loopback warm medians were approximately 2–3.5ms over 20 samples/route; the first homepage request was 72ms. These are local complete-response measurements with a warm database, not internet TTFB, cold database results or user-facing latency promises. Final figures, route conditions and Lighthouse results are summarized in QUALITY_SCORECARD.md.

Run Lighthouse using the installed Chromium path as CHROME_PATH. Do not run heavy browser suites concurrently if comparing lab timing. A single run is variable; retained reports show environment and actual scores. No fabricated perfect score, disabled imagery or field-performance claim.
