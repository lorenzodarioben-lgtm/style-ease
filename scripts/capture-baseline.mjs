import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

const server = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4174'],
  { windowsHide: true, stdio: 'ignore' }
);
const browser = await chromium.launch();
const evidence = [];
try {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      await fetch('http://127.0.0.1:4174/style-ease/');
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  await mkdir('docs/screenshots/baseline', { recursive: true });
  for (const [width, height] of [
    [1440, 900],
    [1920, 1080],
    [768, 1024],
    [390, 844],
    [320, 700]
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    for (const [name, route] of [
      ['home', '/'],
      ['shop', '/#/products'],
      ['product', '/#/product/1'],
      ['bag-empty', '/#/cart'],
      ['checkout-empty', '/#/checkout'],
      ['wishlist-empty', '/#/wishlist'],
      ['compare-empty', '/#/compare']
    ]) {
      await page.goto('http://127.0.0.1:4174/style-ease' + route);
      await page.locator('h1').first().waitFor();
      await page.evaluate(() => globalThis.document.fonts.ready);
      await page.screenshot({
        path: `docs/screenshots/baseline/${name}-${width}.png`,
        fullPage: true
      });
      evidence.push({
        name,
        width,
        height,
        route,
        overflow: await page.evaluate(
          () => globalThis.document.documentElement.scrollWidth > globalThis.innerWidth
        )
      });
    }
    await page.close();
  }
  await writeFile('docs/evidence/baseline-screens.txt', JSON.stringify(evidence, null, 2));
} finally {
  await browser.close();
  server.kill();
}
