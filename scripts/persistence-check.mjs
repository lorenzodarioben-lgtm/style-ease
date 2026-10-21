import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const mode = process.argv[2];
const b = await chromium.launch();
try {
  if (mode === 'prepare') {
    const context = await b.newContext();
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8080/products/geometric-t-shirt');
    await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
    await page.goto('http://127.0.0.1:8080/bag');
    await page.getByRole('link', { name: 'Continue to demo checkout' }).click();
    await page.getByRole('button', { name: 'Continue to review' }).click();
    await page.getByRole('checkbox', { name: /I understand/ }).check();
    await page.getByRole('button', { name: 'Confirm demo order' }).click();
    await mkdir('tmp', { recursive: true });
    await context.storageState({ path: 'tmp/restart-session.json' });
    await writeFile('tmp/restart-order.txt', page.url());
    console.log(
      'Prepared a private demo receipt and browser session for restart. Token stays in ignored tmp/.'
    );
    await context.close();
  } else if (mode === 'verify') {
    const context = await b.newContext({ storageState: 'tmp/restart-session.json' });
    const page = await context.newPage();
    const url = await readFile('tmp/restart-order.txt', 'utf8');
    const response = await page.goto(url);
    if (
      response.status() !== 200 ||
      !(await page
        .locator('.receipt-total')
        .textContent()
        .then((t) => t.includes('$75.00')))
    )
      throw Error('receipt persistence failed');
    await page.goto('http://127.0.0.1:8080/orders');
    if ((await page.locator('.receipt-list>a').count()) !== 1)
      throw Error('owned receipt history failed after restart');
    console.log(
      'PASS: owned receipt and immutable total survived web runtime restart with the same PostgreSQL volume.'
    );
    await context.close();
  } else throw Error('Use prepare or verify');
} finally {
  await b.close();
}
