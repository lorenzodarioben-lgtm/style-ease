import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('visual atelier places, replaces, removes, saves and reopens exact variants', async ({
  page
}) => {
  await page.goto('/studio');
  await expect(page.locator('.studio-inspiration')).toContainText('not a saved personal look');
  await page.locator('[data-pick-product="2"]').click();
  await expect(page.locator('#atelier-inspector')).toBeVisible();
  await expect
    .poll(() =>
      page.locator('#active-studio-variant').evaluate((el) => {
        const box = el.getBoundingClientRect();
        return box.top >= 0 && box.bottom <= globalThis.innerHeight;
      })
    )
    .toBe(true);
  await page.getByRole('button', { name: 'Place in composition', exact: true }).click();
  await expect(page.locator('#board-preview figure')).toHaveCount(1);
  await expect(page.locator('.studio-inspiration')).toBeHidden();
  await page.getByRole('button', { name: 'Tops', exact: true }).click();
  await page.locator('[data-pick-product="1"]').click();
  await page.getByRole('button', { name: 'Place in composition', exact: true }).click();
  await expect(page.locator('#board-preview figure')).toHaveCount(2);
  await page.getByRole('button', { name: 'Remove Geometric T-Shirt', exact: true }).click();
  await expect(page.locator('#board-preview figure')).toHaveCount(1);
  await page.getByRole('button', { name: 'Replace Angular Jacket', exact: true }).click();
  await page.locator('#active-studio-variant').selectOption({ index: 1 });
  const exact = await page.locator('#active-studio-variant').inputValue();
  await page.getByRole('button', { name: 'Replace this category', exact: true }).click();
  expect(await page.locator('.studio-select[data-category="Jackets"]').inputValue()).toBe(exact);
  await page.getByLabel('Look name', { exact: true }).fill('Atelier study');
  await page.getByRole('button', { name: 'Save private look' }).click();
  await expect(page.locator('.saved-look')).toContainText('Atelier study');
  await page.reload();
  await expect(page.locator('#board-preview figure')).toHaveCount(1);
  expect(await page.locator('.studio-select[data-category="Jackets"]').inputValue()).toBe(exact);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('single reference gallery preserves focus and the full original photograph', async ({
  page
}) => {
  await page.goto('/products/geometric-t-shirt');
  const opener = page.getByRole('link', { name: 'Open full editorial reference image' });
  await opener.click();
  await expect(page.getByRole('dialog', { name: 'The original reference' })).toBeVisible();
  expect(
    await page
      .locator('#image-viewer-photo')
      .evaluate((el) => globalThis.getComputedStyle(el).objectFit)
  ).toBe('contain');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
});
