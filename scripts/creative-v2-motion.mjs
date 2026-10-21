import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const root = 'docs/creative-v2/evidence/motion';
await mkdir(root, { recursive: true });
const browser = await chromium.launch();
const clips = [];
async function ready(page, url) {
  await page.goto(url);
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
    globalThis.document.querySelectorAll('img').forEach((image) => (image.loading = 'eager'));
    await Promise.all(
      [...globalThis.document.images].map((image) => image.decode().catch(() => {}))
    );
  });
  await page.waitForTimeout(700);
}
async function clip(name, width, run) {
  const context = await browser.newContext({
    viewport: { width, height: width < 600 ? 844 : 900 },
    recordVideo: { dir: `${root}/raw`, size: { width, height: width < 600 ? 844 : 900 } }
  });
  const page = await context.newPage();
  const frames = [];
  async function frame(label) {
    await page.screenshot({ path: `${root}/${name}-${label}.jpg`, type: 'jpeg', quality: 85 });
    frames.push(`${name}-${label}.jpg`);
  }
  await run(page, frame);
  await page.waitForTimeout(700);
  const video = page.video();
  await context.close();
  await video.saveAs(`${root}/${name}.webm`);
  clips.push({ name, width, frames });
}
await clip('cta-fill', 1440, async (p, frame) => {
  await ready(p, 'http://127.0.0.1:8080/');
  await p.evaluate(() => globalThis.document.fonts.ready);
  await p.mouse.move(0, 0);
  await frame('before');
  await p.locator('.campaign .button').hover();
  await p.waitForTimeout(180);
  await frame('during');
  await p.waitForTimeout(650);
  await frame('after');
  await p.mouse.move(0, 0);
  await p.waitForTimeout(700);
});
await clip('photographic-colour', 1440, async (p, frame) => {
  await ready(p, 'http://127.0.0.1:8080/shop');
  await p.mouse.move(0, 0);
  await frame('before');
  await p.locator('.product-card').first().hover();
  await p.waitForTimeout(250);
  await frame('during');
  await p.waitForTimeout(850);
  await frame('after');
});
await clip('mobile-navigation', 390, async (p, frame) => {
  await ready(p, 'http://127.0.0.1:8080/');
  await p.getByRole('button', { name: 'Open navigation menu' }).click();
  await p.waitForTimeout(100);
  await frame('during');
  await p.waitForTimeout(650);
  await frame('open');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  await frame('closed');
});
await clip('editorial-entrance', 1440, async (p, frame) => {
  await ready(p, 'http://127.0.0.1:8080/editorial/the-space-between');
  await frame('top');
  await p.mouse.wheel(0, 900);
  await p.waitForTimeout(170);
  await frame('during');
  await p.waitForTimeout(700);
  await frame('settled');
  await p.mouse.wheel(0, 600);
  await p.waitForTimeout(750);
});
await clip('product-reference-viewer', 1440, async (p, frame) => {
  await ready(p, 'http://127.0.0.1:8080/products/geometric-t-shirt');
  await p.locator('[data-image-zoom]').click();
  await p.waitForTimeout(700);
  await frame('open');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  await frame('restored');
});
for (const width of [390, 1440])
  await clip(`atelier-selection-${width}`, width, async (p, frame) => {
    await ready(p, 'http://127.0.0.1:8080/studio');
    await frame('empty');
    await p.locator('[data-pick-product="2"]').click();
    await p.waitForTimeout(450);
    await frame('inspector');
    await p.getByRole('button', { name: 'Place in composition', exact: true }).click();
    await p.waitForTimeout(400);
    await p.locator('.composition-board').scrollIntoViewIfNeeded();
    await frame('piece');
    await p.getByRole('button', { name: 'Tops', exact: true }).click();
    await p.locator('[data-pick-product="1"]').click();
    await p.getByRole('button', { name: 'Place in composition', exact: true }).click();
    await p.getByLabel('Look name', { exact: true }).fill('Recorded atelier study');
    await p.getByRole('button', { name: 'Save private look' }).click();
    await p.waitForTimeout(650);
    await frame('saved');
    await p.locator('.saved-look').first().scrollIntoViewIfNeeded();
    await p.waitForTimeout(550);
    await frame('reopen');
  });
await browser.close();
await writeFile(`${root}/clips.json`, JSON.stringify(clips, null, 2));
console.log(
  `${clips.length} actual interaction recordings and ${clips.reduce((n, c) => n + c.frames.length, 0)} inspection frames saved.`
);
