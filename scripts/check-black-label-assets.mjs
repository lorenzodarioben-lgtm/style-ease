import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const js = (
  await Promise.all(
    ['assets/js/htmx-4.0.0.min.js', 'assets/js/storefront.js'].map((p) => readFile(p))
  )
).reduce((n, b) => n + gzipSync(b).length, 0);
const css = gzipSync(await readFile('assets/css/black-label.css')).length;
console.log(
  `Black Label JS: ${(js / 1024).toFixed(2)} KiB gzip / 70 KiB; CSS: ${(css / 1024).toFixed(2)} KiB gzip / 35 KiB`
);
if (js > 70 * 1024 || css > 35 * 1024) throw Error('Black Label route asset budget exceeded');
