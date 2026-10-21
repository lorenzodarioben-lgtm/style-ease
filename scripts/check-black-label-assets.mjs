import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const js = (
  await Promise.all(
    [
      'assets/js/htmx-4.0.0.min.js',
      'assets/js/storefront.js',
      'assets/js/creative.js',
      'assets/js/atelier.js'
    ].map((p) => readFile(p))
  )
).reduce((n, b) => n + gzipSync(b).length, 0);
const css = (
  await Promise.all(
    [
      'assets/css/black-label.css',
      'assets/css/creative-pages.css',
      'assets/css/atelier.css',
      'assets/css/commerce-finish.css',
      'assets/css/art-direction.css'
    ].map((p) => readFile(p))
  )
).reduce((n, b) => n + gzipSync(b).length, 0);
console.log(
  `Black Label JS: ${(js / 1024).toFixed(2)} KiB gzip / 45 KiB; CSS: ${(css / 1024).toFixed(2)} KiB gzip / 30 KiB`
);
if (js > 45 * 1024 || css > 30 * 1024) throw Error('Black Label route asset budget exceeded');
