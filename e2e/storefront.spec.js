import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('completes the demo purchase flow through its saved receipt', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Explore Collection' }).click();
  await expect(page.getByRole('heading', { name: 'Product Catalogue' })).toBeVisible();

  await page.getByRole('button', { name: 'Quick add Geometric T-Shirt to cart' }).click();
  await page.getByRole('button', { name: /View shopping cart, 1 item/ }).click();
  await page.getByRole('button', { name: 'Proceed to Checkout' }).click();

  await page.getByLabel('Full name').fill('Ada Shopper');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Street address').fill('1 Test Street');
  await page.getByLabel('City or suburb').fill('Sydney');
  await page.getByLabel('Postcode').fill('2000');
  await page.getByRole('button', { name: 'Continue to Review' }).click();
  await page.getByRole('button', { name: 'Confirm Demo Order' }).click();

  await expect(page.getByText(/Demo receipt: DEMO-/)).toBeVisible();
  await page.getByRole('link', { name: 'View Demo Receipt' }).click();
  await expect(page.getByRole('heading', { name: 'Demo Order History' })).toBeVisible();
  await expect(page.locator('details[open]')).toContainText(/DEMO-/);

  await page.reload();

  await expect(page.locator('details[open]')).toContainText(
    'Delivery details are only available in the current session.'
  );
});

test('preserves direct catalogue state and moves a wishlisted style into the bag', async ({
  page
}) => {
  await page.goto('/#/products?category=Jackets&q=angular&sort=price-desc&page=2');

  await expect(page.getByLabel('Search Style Ease')).toHaveValue('angular');
  await page.getByRole('button', { name: 'Search' }).click();

  expect(page.url()).toContain('q=angular');
  expect(page.url()).toContain('category=Jackets');
  expect(page.url()).toContain('sort=price-desc');
  expect(page.url()).not.toContain('page=2');

  await page.goto('/#/product/1');
  await page.getByRole('button', { name: 'Add to wishlist' }).click();
  await page.goto('/#/wishlist');
  await page.getByRole('button', { name: 'Move to Bag' }).click();

  await expect(page.getByRole('button', { name: 'View shopping cart, 1 item' })).toBeVisible();
  await expect(page.getByText('Your wishlist is ready for inspiration.')).toBeVisible();
});

test('has no automated accessibility violations on the catalogue', async ({ page }) => {
  await page.goto('/#/products');

  var results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

test('keeps the catalogue within a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/products');

  expect(
    await page.evaluate(function () {
      return document.documentElement.scrollWidth <= window.innerWidth;
    })
  ).toBe(true);
});
