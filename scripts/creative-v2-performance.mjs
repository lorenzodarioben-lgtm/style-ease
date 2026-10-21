import { chromium } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const cli = process.argv[2] || process.env.LIGHTHOUSE_CLI;
if (!cli) throw Error('Pass the installed Lighthouse13.5 CLI path, or set LIGHTHOUSE_CLI.');
const root = 'docs/creative-v2/evidence/performance';
await mkdir(root, { recursive: true });
const results = [];
// Run in isolation after browser/capture jobs finish. Default Lighthouse mobile
// throttling; loopback lab measurements are not field Core Web Vitals.
for (const [name, url] of [
  ['home-1', '/'],
  ['home-2', '/'],
  ['home-3', '/'],
  ['shop', '/shop'],
  ['product', '/products/geometric-t-shirt'],
  ['studio', '/studio'],
  ['editorial', '/editorial']
]) {
  const file = `${root}/${name}.json`;
  const run = spawnSync(
    process.execPath,
    [
      cli,
      `http://127.0.0.1:8080${url}`,
      '--quiet',
      '--chrome-flags=--headless --no-sandbox --disable-gpu',
      '--only-categories=performance,accessibility',
      '--output=json',
      `--output-path=${file}`
    ],
    {
      encoding: 'utf8',
      env: { ...process.env, CHROME_PATH: chromium.executablePath() },
      timeout: 180000
    }
  );
  if (run.status !== 0) throw Error(`${name}: ${run.stderr}`);
  const report = JSON.parse(await readFile(file));
  const metric = (id) => report.audits[id]?.numericValue;
  results.push({
    name,
    url,
    performance: Math.round(report.categories.performance.score * 100),
    accessibility: Math.round(report.categories.accessibility.score * 100),
    LCPms: metric('largest-contentful-paint'),
    CLS: metric('cumulative-layout-shift'),
    TBTms: metric('total-blocking-time'),
    version: report.lighthouseVersion,
    environment: report.environment,
    fetchTime: report.fetchTime
  });
  await writeFile(`${root}/summary.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results.at(-1)));
}
