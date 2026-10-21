import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch();
async function capture(page, name, width) {
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
    const images = Array.from(globalThis.document.images);
    images.forEach((i) => (i.loading = 'eager'));
    await Promise.all(images.map((i) => i.decode().catch(() => {})));
  });
  await page.screenshot({ path: `docs/screenshots/overhaul/${name}-${width}.png`, fullPage: true });
}
try {
  await mkdir('docs/screenshots/overhaul', { recursive: true });
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 1440 ? 900 : 844 }
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8080/shop');
    await page.getByRole('link', { name: 'Quick shop' }).first().click();
    await page.getByRole('dialog', { name: 'Quick shop', exact: true }).waitFor();
    await capture(page, 'quick-shop', width);
    await page.keyboard.press('Escape');
    await page.goto('http://127.0.0.1:8080/products/geometric-t-shirt');
    await page.getByRole('radio', { name: 'L', exact: true }).check();
    await page.getByRole('radio', { name: 'White', exact: true }).check();
    await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
    await page.goto('http://127.0.0.1:8080/bag');
    await capture(page, 'bag-filled', width);
    await page.getByRole('link', { name: 'Continue to demo checkout' }).click();
    await capture(page, 'checkout-scenario', width);
    await page.getByRole('button', { name: 'Continue to review' }).click();
    await capture(page, 'checkout-review', width);
    await page.getByRole('checkbox', { name: /I understand/ }).check();
    await page.getByRole('button', { name: 'Confirm demo order' }).click();
    await capture(page, 'receipt', width);
    for (const slug of ['angular-jacket', 'precision-jeans']) {
      await page.goto('http://127.0.0.1:8080/products/' + slug);
      await page.getByRole('button', { name: 'Save this variant' }).click();
      await page.getByRole('button', { name: 'Compare this piece' }).click();
    }
    await page.goto('http://127.0.0.1:8080/wishlist');
    await capture(page, 'wishlist-filled', width);
    await page.goto('http://127.0.0.1:8080/compare');
    await capture(page, 'compare-filled', width);
    await page.goto('http://127.0.0.1:8080/studio');
    await page.locator('select[data-category="Jackets"]').selectOption({ index: 1 });
    await page.locator('select[data-category="Tops"]').selectOption({ index: 1 });
    await page.getByLabel('Look name', { exact: true }).fill('The Structure Study');
    await page.getByRole('button', { name: 'Save private look' }).click();
    await capture(page, 'studio-saved', width);
    await context.close();
  }
} finally {
  await browser.close();
}
