import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await chromium.launch();
const results = [];
try {
  await mkdir('docs/screenshots/overhaul', { recursive: true });
  for (const [width, height] of [
    [1440, 900],
    [1920, 1080],
    [768, 1024],
    [390, 844],
    [320, 700]
  ]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const [name, path] of [
      ['home', '/'],
      ['shop', '/shop'],
      ['product', '/products/geometric-t-shirt'],
      ['bag-empty', '/bag'],
      ['wishlist-empty', '/wishlist'],
      ['compare-empty', '/compare'],
      ['checkout-empty', '/checkout'],
      ['editorial', '/collections'],
      ['studio', '/studio'],
      ['not-found', '/missing']
    ]) {
      const response = await page.goto('http://127.0.0.1:8080' + path);
      await page.evaluate(() => globalThis.document.fonts.ready);
      await page.evaluate(async () => {
        const imgs = Array.from(globalThis.document.images);
        imgs.forEach((i) => (i.loading = 'eager'));
        await Promise.all(imgs.map((i) => i.decode().catch(() => {})));
      });
      await page.screenshot({
        path: `docs/screenshots/overhaul/${name}-${width}.png`,
        fullPage: true
      });
      const audit =
        width === 390 || width === 1440
          ? await new AxeBuilder({ page }).analyze()
          : { violations: [] };
      results.push({
        name,
        width,
        path,
        status: response.status(),
        overflow: await page.evaluate(
          () => globalThis.document.documentElement.scrollWidth > globalThis.innerWidth
        ),
        violations: audit.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => n.target)
        })),
        errors: [...errors]
      });
    }
    await context.close();
  }
  await writeFile('docs/evidence/overhaul-visual-qa.json', JSON.stringify(results, null, 2));
  console.log(
    JSON.stringify(
      {
        screens: results.length,
        overflow: results.filter((r) => r.overflow),
        a11y: results.filter((r) => r.violations.length),
        js: results.filter((r) => r.errors.length)
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
}
