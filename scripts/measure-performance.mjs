import { readFile, writeFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const files = [
  'assets/js/htmx-4.0.0.min.js',
  'assets/js/storefront.js',
  'assets/css/black-label.css',
  'assets/fonts/dm-sans.woff2',
  'assets/fonts/bodoni-moda.woff2',
  'assets/images/campaign-1600.webp'
];
const assets = [];
for (const path of files) {
  const bytes = await readFile(path);
  assets.push({ path, bytes: (await stat(path)).size, gzip: gzipSync(bytes).length });
}
const routes = [];
for (const path of ['/', '/shop', '/products/geometric-t-shirt', '/bag', '/checkout']) {
  const times = [];
  let cookie = '';
  for (let i = 0; i < 21; i++) {
    const start = performance.now();
    const response = await fetch('http://127.0.0.1:8080' + path, {
      headers: cookie ? { Cookie: cookie } : {}
    });
    await response.text();
    times.push(performance.now() - start);
    cookie = response.headers.get('set-cookie')?.split(';')[0] || cookie;
  }
  const warm = times.slice(1).sort((a, b) => a - b);
  routes.push({
    path,
    firstRequestMs: times[0],
    warmMedianMs: warm[10],
    warmP95Ms: warm[18],
    samples: 20
  });
}
const result = {
  environment:
    'Windows, local Go/PostgreSQL 18.6, loopback, synthetic full-response measurements; not field Web Vitals or database cold-start evidence',
  assets,
  routes
};
await writeFile('docs/evidence/performance.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
