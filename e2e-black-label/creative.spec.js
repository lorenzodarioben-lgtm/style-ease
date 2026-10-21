import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('task surfaces disclose the mobile total and comparison navigation before commitment', async ({
  page
}) => {
  await page.goto('/products/geometric-t-shirt');
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Continue to review', exact: true }).click();
  const summary = page.locator('.order-summary');
  const confirm = page.getByRole('button', { name: 'Confirm demo order', exact: true });
  if (page.viewportSize().width < 600) {
    const first = await summary.boundingBox(),
      last = await confirm.boundingBox();
    expect(first.y + first.height).toBeLessThan(last.y);
  }
  for (const slug of ['angular-jacket', 'precision-jeans']) {
    await page.goto('/products/' + slug);
    await page.getByRole('button', { name: 'Compare this piece', exact: true }).click();
  }
  await page.goto('/compare');
  await expect(page.locator('.comparison-guide')).toContainText('2 pieces selected');
  if (page.viewportSize().width < 600) {
    await page.getByRole('button', { name: 'Next comparison columns' }).click();
    await expect
      .poll(() => page.locator('.comparison-scroll').evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(0);
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('touch colour choice remains explicit and accessibly labelled', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8080/shop');
  const button = page.locator('.product-card [data-colour-toggle]').first();
  await button.tap();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(button).toHaveAccessibleName(/^Keep monochrome:/);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await button.tap();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await context.close();
});

test('signature fill and complete colour reveal support pointer and focus', async ({ page }) => {
  await page.goto('/');
  const cta = page.locator('.campaign .button');
  const fill = () =>
    cta.evaluate((el) => new DOMMatrix(globalThis.getComputedStyle(el, '::before').transform).m41);
  expect(await fill()).toBeLessThan(-100);
  await cta.hover();
  await expect.poll(fill).toBeCloseTo(0, 0);
  await page.mouse.move(0, 0);
  await page.keyboard.press('Tab');
  await cta.focus();
  await expect.poll(fill).toBeCloseTo(0, 0);
  await page.goto('/shop');
  const card = page.locator('.product-card').first();
  const image = card.locator('img');
  await expect
    .poll(() => image.evaluate((el) => globalThis.getComputedStyle(el).filter))
    .toBe('grayscale(1)');
  await card.hover();
  await expect
    .poll(() => image.evaluate((el) => globalThis.getComputedStyle(el).filter))
    .toBe('grayscale(0)');
  await page.mouse.move(0, 0);
  await card.locator('h3 a').focus();
  await expect
    .poll(() => image.evaluate((el) => globalThis.getComputedStyle(el).filter))
    .toBe('grayscale(0)');
  expect(await image.evaluate((el) => globalThis.getComputedStyle(el).objectFit)).toBe('contain');
});

test('reduced motion retains instant colour choice and visible editorial content', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const button = page.locator('.campaign-image [data-colour-toggle]');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  const photo = page.locator('.campaign-image img');
  expect(await photo.evaluate((el) => globalThis.getComputedStyle(el).filter)).toBe('grayscale(0)');
  expect(await photo.evaluate((el) => globalThis.getComputedStyle(el).transitionDuration)).toBe(
    '0s'
  );
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  expect(await photo.evaluate((el) => globalThis.getComputedStyle(el).filter)).toBe('grayscale(1)');
  expect(
    await page
      .locator('[data-reveal]')
      .evaluateAll((els) => els.every((el) => globalThis.getComputedStyle(el).opacity === '1'))
  ).toBe(true);
});
