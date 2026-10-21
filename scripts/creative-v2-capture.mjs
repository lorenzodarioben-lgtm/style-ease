import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const phase = process.argv[2] || 'before';
if (!['before', 'after'].includes(phase)) throw Error('Use before or after');
const base = `docs/creative-v2/evidence/${phase}`;
await mkdir(base, { recursive: true });
const browser = await chromium.launch();
const results = [];
const routes = [
  ['home', '/'],
  ['collections', '/collections'],
  ['collection', '/collections/structure'],
  ['editorial', '/editorial'],
  ['story', phase === 'before' ? '/editorial/structure' : '/editorial/the-space-between'],
  ['shop', '/shop'],
  ['product', '/products/geometric-t-shirt'],
  ['studio', '/studio'],
  ['bag-empty', '/bag'],
  ['wishlist-empty', '/wishlist'],
  ['compare-empty', '/compare'],
  ['checkout-empty', '/checkout'],
  ['receipts-empty', '/orders'],
  ['about', '/about'],
  ['privacy', '/privacy'],
  ['404', '/missing']
];
if (phase === 'after')
  routes.push(
    ['story-colour', '/editorial/colour-when-it-counts'],
    ['story-objects', '/editorial/a-small-point-of-difference'],
    ['collection-objects', '/collections/objects']
  );
try {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    const context = await browser.newContext({
      viewport: { width, height: width < 600 ? 844 : 1000 }
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const [name, path] of routes) {
      const response = await page.goto(`http://127.0.0.1:8080${path}`);
      await page.evaluate(async () => {
        await globalThis.document.fonts.ready;
        const images = Array.from(globalThis.document.images);
        images.forEach((img) => {
          img.loading = 'eager';
        });
        await Promise.all(images.map((img) => img.decode().catch(() => {})));
        globalThis.document
          .querySelectorAll('[data-reveal]')
          .forEach((el) => el.classList.add('is-visible'));
      });
      await page.screenshot({
        path: `${base}/${name}-${width}.jpg`,
        fullPage: width === 390 || width === 1440,
        type: 'jpeg',
        quality: 78,
        animations: 'disabled'
      });
      const audit =
        width === 390 || width === 1440
          ? await new AxeBuilder({ page }).analyze()
          : { violations: [] };
      results.push({
        name,
        path,
        width,
        status: response.status(),
        screenshot: `${name}-${width}.jpg`,
        overflow: await page.evaluate(
          () => globalThis.document.documentElement.scrollWidth > globalThis.innerWidth
        ),
        brokenImages: await page
          .locator('img')
          .evaluateAll((imgs) =>
            imgs.filter((i) => i.complete && !i.naturalWidth).map((i) => i.getAttribute('src'))
          ),
        violations: audit.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          targets: v.nodes.map((n) => n.target)
        })),
        errors: [...errors]
      });
    }
    await context.close();
  }
  for (const [name, path] of routes.slice(0, 8)) {
    if (!['home', 'collections', 'editorial', 'product'].includes(name)) continue;
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2
    });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:8080${path}`);
    await page.evaluate(() => globalThis.document.fonts.ready);
    await page.screenshot({
      path: `${base}/${name}-390-dpr2.jpg`,
      quality: 82,
      animations: 'disabled'
    });
    await context.close();
  }
  const videoContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: `${base}/motion`, size: { width: 1440, height: 900 } }
  });
  const videoPage = await videoContext.newPage();
  await videoPage.goto('http://127.0.0.1:8080/');
  await videoPage
    .getByRole('link', { name: 'Explore the collection', exact: true })
    .hover()
    .catch(() => {});
  await videoPage.waitForTimeout(1100);
  await videoPage.goto('http://127.0.0.1:8080/shop');
  await videoPage.locator('.product-card').first().hover();
  await videoPage.waitForTimeout(1100);
  await videoPage.locator('.product-card h3 a').first().focus();
  await videoPage.waitForTimeout(1000);
  await videoPage.goto('http://127.0.0.1:8080/studio');
  await videoPage.waitForTimeout(1000);
  const video = videoPage.video();
  await videoContext.close();
  await video.saveAs(`${base}/signature-${phase}.webm`);
} finally {
  await browser.close();
}
await writeFile(`${base}/qa.json`, JSON.stringify(results, null, 2));
console.log(
  JSON.stringify(
    {
      phase,
      screens: results.length,
      overflow: results.filter((r) => r.overflow).map((r) => [r.name, r.width]),
      broken: results.filter((r) => r.brokenImages.length),
      axe: results
        .filter((r) => r.violations.length)
        .map((r) => ({ name: r.name, width: r.width, violations: r.violations })),
      errors: results.filter((r) => r.errors.length)
    },
    null,
    2
  )
);
