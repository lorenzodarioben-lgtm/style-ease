import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('collections shop real edits while the journal has independent stories and metadata', async ({
  page
}) => {
  await page.goto('/collections');
  await expect(page.locator('h1')).toContainText('point of view');
  await expect(page.getByRole('link', { name: 'Shop this edit', exact: true })).toHaveCount(3);
  await page.goto('/collections/structure');
  await expect(page.locator('.product-card').first()).toBeVisible();
  await expect(page.locator('.desktop-nav a[href="/collections"]')).toHaveAttribute(
    'aria-current',
    'page'
  );
  await page.getByLabel('Find within this edit').fill('not-a-sample-piece');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A little more space.' })).toBeVisible();
  for (const [slug, kind] of [
    ['the-space-between', 'proportion'],
    ['colour-when-it-counts', 'colour'],
    ['a-small-point-of-difference', 'objects']
  ]) {
    await page.goto('/editorial/' + slug);
    await expect(page.locator('.essay-' + kind)).toBeVisible();
    await expect(page.locator('.essay-chapter')).toHaveCount(3);
    expect((await page.locator('.essay-body').innerText()).split(/\s+/).length).toBeGreaterThan(
      300
    );
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toContain(
      'visual essay'
    );
    await expect(page.locator('.desktop-nav a[href="/editorial"]')).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.goto('/editorial/structure');
  await expect(page).toHaveURL(/\/editorial\/the-space-between$/);
  await page.goto('/editorial');
  await expect(page.locator('h1')).toContainText('Ways of');
  await expect(page.getByRole('link', { name: 'Read the story', exact: true })).toHaveCount(3);
});
