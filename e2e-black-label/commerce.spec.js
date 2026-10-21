import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const product = '/products/geometric-t-shirt';
async function select(page, size = 'M', colour = 'Black') {
  await page.getByRole('radio', { name: size, exact: true }).check();
  await page.getByRole('radio', { name: colour, exact: true }).check();
}
async function axe(page) {
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations).toEqual([]);
}
test('variant to bag to persistent private receipt, including forged owner access', async ({
  page,
  browser
}) => {
  await page.goto(product);
  await select(page, 'L', 'White');
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await expect(page.getByRole('status').first()).toContainText('Added');
  await page.goto('/bag');
  await expect(page.locator('.shopping-line')).toContainText('L / White');
  await page.locator('.shopping-line').getByLabel('Quantity').fill('2');
  await page.getByRole('button', { name: 'Update', exact: true }).click();
  await expect(page.locator('.summary-total')).toContainText('$150.00');
  await axe(page);
  await page.getByRole('link', { name: 'Continue to demo checkout' }).click();
  await page.getByRole('button', { name: 'Continue to review' }).click();
  await axe(page);
  await page.getByRole('checkbox', { name: /I understand/ }).check();
  await page.getByRole('button', { name: 'Confirm demo order' }).click();
  await expect(page.locator('h1')).toContainText('recorded');
  await expect(page.locator('.receipt-total')).toContainText('$150.00');
  const receipt = page.url();
  await page.reload();
  await expect(page.locator('.receipt-meta')).toContainText('DEMO-');
  await axe(page);
  const other = await browser.newContext();
  const stranger = await other.newPage();
  const response = await stranger.goto(receipt);
  expect(response.status()).toBe(404);
  await other.close();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.footer')).toBeHidden();
  await expect(page.locator('.receipt-heading')).toContainText('DEMO RECEIPT');
});
test('quick shop uses HTMX 4 and restores keyboard focus', async ({ page }) => {
  await page.goto('/shop');
  const trigger = page.getByRole('link', { name: 'Quick shop' }).first();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Quick shop', exact: true });
  await expect(dialog).toBeVisible();
  await axe(page);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole('radio', { name: 'L', exact: true }).check();
  await dialog.getByRole('radio', { name: 'White', exact: true }).check();
  await dialog.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await page.goto('/bag');
  await expect(page.locator('.shopping-line')).toContainText('L / White');
});
test('wishlist exact variants, save for later, move, remove and undo', async ({ page }) => {
  await page.goto(product);
  await select(page, 'S', 'Gray');
  await page.getByRole('button', { name: 'Save this variant' }).click();
  await page.goto('/wishlist');
  await expect(page.locator('.shopping-line')).toContainText('S / Gray');
  await page.getByRole('button', { name: 'Move to bag' }).click();
  await page.goto('/bag');
  await page.getByRole('button', { name: 'Save for later' }).click();
  await expect(page.locator('.shopping-line')).toHaveCount(0);
  await page.goto('/wishlist');
  await page.getByRole('button', { name: 'Move to bag' }).click();
  await page.goto('/bag');
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.locator('.shopping-line')).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo removal' }).click();
  await expect(page.locator('.shopping-line')).toContainText('S / Gray');
});
test('query filters, HTMX partial, back/forward and reload', async ({ page }) => {
  const headers = [];
  page.on('request', (r) => {
    if (r.url().includes('/shop?')) headers.push(r.headers()['hx-request-type']);
  });
  await page.goto('/shop');
  await page.getByLabel('Search the collection').fill('cotton');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page).toHaveURL(/q=cotton/);
  await expect(page.locator('#shop-results')).toContainText('pieces found');
  expect(headers).toContain('partial');
  await page.locator('details[data-filter="category"] summary').click();
  await page.getByRole('checkbox', { name: 'Tops', exact: true }).check();
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect(page).toHaveURL(/category=Tops/);
  await page.reload();
  await page.locator('details[data-filter="category"] summary').click();
  await expect(page.getByRole('checkbox', { name: 'Tops', exact: true })).toBeChecked();
  await page.goBack();
  await expect(page).toHaveURL(/q=cotton/);
  await page.goForward();
  await expect(page).toHaveURL(/category=Tops/);
  await page.locator('details[data-filter="category"] summary').click();
  await page.getByRole('checkbox', { name: 'Jackets', exact: true }).check();
  await page.getByRole('button', { name: 'Apply filters' }).click();
  await expect
    .poll(() => new URL(page.url()).searchParams.getAll('category'))
    .toEqual(['Tops', 'Jackets']);
  await page.reload();
  await page.locator('details[data-filter="category"] summary').click();
  await expect(page.getByRole('checkbox', { name: 'Tops', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Jackets', exact: true })).toBeChecked();
  await axe(page);
  await page.goto('/shop?q=impossible-piece');
  await expect(
    page.getByRole('heading', { name: 'Nothing in this composition yet.' })
  ).toBeVisible();
});
test('guest changes synchronize between tabs after a committed mutation', async ({
  context,
  page
}) => {
  await page.goto('/bag');
  const other = await context.newPage();
  await other.goto('http://127.0.0.1:8080/products/geometric-t-shirt');
  await other.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await expect(other.getByRole('status').first()).toContainText('Added');
  await page.bringToFront();
  await page.evaluate(() => globalThis.dispatchEvent(new Event('focus')));
  await expect(page.locator('.shopping-line')).toHaveCount(1);
  await other.close();
});
test('comparison attributes, bounded membership and mobile scrolling', async ({ page }) => {
  for (const slug of ['geometric-t-shirt', 'angular-jacket', 'precision-jeans']) {
    await page.goto('/products/' + slug);
    await page.getByRole('button', { name: 'Compare this piece' }).click();
  }
  await page.goto('/compare');
  await expect(page.locator('thead th')).toHaveCount(4);
  await expect(page.getByRole('cell', { name: '100% Cotton', exact: true })).toBeVisible();
  await axe(page);
  await page.goto('/products/architectural-boots');
  await page.getByRole('button', { name: 'Compare this piece' }).click();
  await expect(page.locator('h1')).toContainText('adjust');
  await page.goto('/compare');
  await expect(page.locator('thead th')).toHaveCount(4);
  await page.getByRole('button', { name: 'Remove Angular Jacket' }).click();
  await expect(page.locator('thead th')).toHaveCount(3);
});
test('studio saves, renames, reloads and transactionally adds an outfit', async ({
  page,
  browser
}) => {
  await page.goto('/studio');
  const jacket = page.locator('select[data-category="Jackets"]');
  const top = page.locator('select[data-category="Tops"]');
  await jacket.selectOption({ index: 1 });
  await top.selectOption({ index: 1 });
  await expect(page.locator('#board-preview figure')).toHaveCount(2);
  await page.getByLabel('Look name', { exact: true }).fill('Monochrome composition');
  await page.getByRole('button', { name: 'Save private look' }).click();
  await expect(page.locator('.saved-look')).toContainText('Monochrome composition');
  await expect(page.locator('.saved-look')).toContainText('$295.00');
  await page.reload();
  await expect(page.locator('#board-preview figure')).toHaveCount(2);
  const savedURL = page.url();
  const noJS = await browser.newContext({
    javaScriptEnabled: false,
    storageState: await page.context().storageState()
  });
  const staticPage = await noJS.newPage();
  await staticPage.goto(savedURL);
  await expect(staticPage.locator('#board-preview figure')).toHaveCount(2);
  await noJS.close();
  const stranger = await browser.newContext();
  const strangerPage = await stranger.newPage();
  expect((await strangerPage.goto(savedURL)).status()).toBe(404);
  await stranger.close();
  await page.getByLabel('Rename look').fill('Reconsidered');
  await page.getByRole('button', { name: 'Save name' }).click();
  await expect(page.locator('.saved-look h3')).toHaveText('Reconsidered');
  await axe(page);
  await page.getByRole('button', { name: 'Add outfit to bag' }).click();
  await page.goto('/bag');
  await expect(page.locator('.shopping-line')).toHaveCount(2);
  await expect(page.locator('.summary-total')).toContainText('$295.00');
});
test('private demo reviews are escaped and sortable', async ({ page }) => {
  await page.goto(product);
  await page.getByRole('radio', { name: '4 / 5', exact: true }).check();
  await page.getByLabel('Your demo review').fill('<script>demo only</script>');
  await page.getByRole('button', { name: 'Save private demo review' }).click();
  await expect(page.locator('.review').first()).toContainText('<script>demo only</script>');
  await page.getByLabel('Order reviews').selectOption('highest');
  await page.getByRole('button', { name: 'Update order' }).click();
  await expect(page.locator('.review')).toHaveCount(1);
  await axe(page);
});
test('mobile navigation, size dialog and reduced motion keyboard behavior', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  if (page.viewportSize().width < 850) {
    const trigger = page.getByRole('button', { name: 'Open navigation' });
    await trigger.click();
    const nav = page.getByRole('dialog', { name: 'STYLE EASE' });
    await expect(nav).toBeVisible();
    await axe(page);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  }
  await page.goto(product);
  await page.getByRole('button', { name: 'Size guidance' }).click();
  const dialog = page.getByRole('dialog', { name: 'Size guidance' });
  await expect(dialog).toBeVisible();
  await axe(page);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Size guidance' })).toBeFocused();
});
test('ordinary forms complete checkout with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8080' + product);
  await select(page);
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await page.goto('http://127.0.0.1:8080/bag');
  await page.getByRole('link', { name: 'Continue to demo checkout' }).click();
  await page.getByRole('button', { name: 'Continue to review' }).click();
  await page.getByRole('checkbox', { name: /I understand/ }).check();
  await page.getByRole('button', { name: 'Confirm demo order' }).click();
  await expect(page.locator('.receipt-total')).toContainText('$75.00');
  await context.close();
});
test('missing picture assets recover even before enhancement script loads', async ({ page }) => {
  let resume;
  let requested;
  const releaseScript = new Promise((resolve) => {
    resume = resolve;
  });
  const scriptRequested = new Promise((resolve) => {
    requested = resolve;
  });
  await page.route('**/assets/js/storefront.js*', async (route) => {
    requested();
    await releaseScript;
    await route.continue();
  });
  await page.route('**/assets/images/campaign-*', (route) =>
    route.fulfill({ status: 404, contentType: 'text/plain', body: 'Test image unavailable' })
  );
  try {
    await page.goto('/', { waitUntil: 'commit' });
    await scriptRequested;
    const photo = page.locator('.campaign-image img');
    await expect
      .poll(() => photo.evaluate((img) => img.complete && img.naturalWidth === 0))
      .toBe(true);
    resume();
    await page.waitForLoadState('load');
    await expect(photo).toHaveAttribute('src', '/assets/image-unavailable.svg');
    await expect(photo).toHaveAttribute('alt', /^Image unavailable\./);
    await expect
      .poll(() =>
        photo.evaluate(
          (img) =>
            img.complete &&
            img.naturalWidth > 0 &&
            img.currentSrc.endsWith('/assets/image-unavailable.svg')
        )
      )
      .toBe(true);
    await axe(page);
  } finally {
    resume();
  }
});

test('viewport matrix has no overflow and primary routes pass axe', async ({ page }) => {
  // This scenario deliberately visits 54 route/viewport combinations and runs 12 axe scans.
  test.setTimeout(90000);
  for (const width of [320, 360, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      '/',
      '/shop',
      '/products/geometric-t-shirt',
      '/bag',
      '/studio',
      '/collections'
    ]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth
        ),
        `${path} at ${width}`
      ).toBe(true);
    }
  }
  for (const path of [
    '/',
    '/shop',
    '/products/geometric-t-shirt',
    '/bag',
    '/wishlist',
    '/compare',
    '/checkout',
    '/orders',
    '/collections',
    '/studio',
    '/about',
    '/missing'
  ]) {
    await page.goto(path);
    await axe(page);
  }
});
