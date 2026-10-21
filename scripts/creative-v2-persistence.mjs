import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const mode = process.argv[2],
  browser = await chromium.launch();
try {
  if (mode === 'prepare') {
    const context = await browser.newContext(),
      page = await context.newPage();
    await page.goto('http://127.0.0.1:8080/studio');
    await page.locator('[data-pick-product="2"]').click();
    await page.getByRole('button', { name: 'Place in composition', exact: true }).click();
    await page.getByRole('button', { name: 'Tops', exact: true }).click();
    await page.locator('[data-pick-product="1"]').click();
    await page.getByRole('button', { name: 'Place in composition', exact: true }).click();
    await page.getByLabel('Look name', { exact: true }).fill('Restart atelier study');
    await page.getByRole('button', { name: 'Save private look' }).click();
    await mkdir('tmp', { recursive: true });
    await context.storageState({ path: 'tmp/creative-studio-session.json' });
    await writeFile('tmp/creative-studio-look.txt', page.url());
    await context.close();
    console.log(
      'Prepared an owned two-piece Studio composition; private token retained only in ignored tmp.'
    );
  } else if (mode === 'verify') {
    const context = await browser.newContext({ storageState: 'tmp/creative-studio-session.json' }),
      page = await context.newPage(),
      url = await readFile('tmp/creative-studio-look.txt', 'utf8');
    const response = await page.goto(url);
    if (
      response.status() !== 200 ||
      (await page.locator('#board-preview figure').count()) !== 2 ||
      !(await page.locator('.saved-look').innerText()).includes('Restart atelier study')
    )
      throw Error('Saved atelier did not survive restart');
    const stranger = await browser.newContext(),
      foreign = await stranger.newPage();
    if ((await foreign.goto(url)).status() !== 404) throw Error('Foreign look ownership failed');
    await stranger.close();
    await context.close();
    console.log(
      'PASS: two-piece photographic composition survives app restart; foreign guest receives404.'
    );
  } else throw Error('Use prepare or verify');
} finally {
  await browser.close();
}
