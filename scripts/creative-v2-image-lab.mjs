import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
const base = 'docs/creative-v2/evidence/image-lab';
await mkdir(base, { recursive: true });
for (let i = 1; i <= 20; i++)
  await writeFile(
    `docs/creative-v2/evidence/before/source-p${i}-480.webp`,
    execFileSync('git', ['show', `873eafc:assets/images/p${i}-480.webp`], {
      maxBuffer: 5 * 1024 * 1024
    })
  );
const browser = await chromium.launch();
const results = [];
for (const width of [320, 390, 768, 1024, 1440, 1920])
  for (const scale of [1, 2]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      deviceScaleFactor: scale
    });
    for (const context of ['card', 'detail', 'studio', 'line']) {
      await page.goto(`http://127.0.0.1:4174/docs/creative-v2/image-lab.html?context=${context}`);
      await page.waitForSelector('body[data-ready]');
      await page.evaluate(async () => {
        await globalThis.document.fonts.ready;
        await Promise.all([...globalThis.document.images].map((image) => image.decode()));
      });
      const check = await page.locator('.lab-row').evaluateAll(async (rows) =>
        Promise.all(
          rows.map(async (row) => {
            const images = [...row.querySelectorAll('img')];
            // A srcset image's natural dimensions are density-corrected and rounded.
            // Decode the selected resource without srcset for physical-pixel proof.
            const selected = new globalThis.Image();
            selected.src = images[1].currentSrc;
            await selected.decode();
            return {
              id: row.querySelector('h2').textContent,
              sourceRatio: images[2].naturalWidth / images[2].naturalHeight,
              repairedRatio: selected.naturalWidth / selected.naturalHeight,
              selectedSource: images[1].currentSrc,
              allContained: images.every(
                (image) => globalThis.getComputedStyle(image).objectFit === 'contain'
              ),
              broken: images.some((image) => !image.naturalWidth)
            };
          })
        )
      );
      results.push({ width, scale, context, images: check });
      await page.screenshot({
        path: `${base}/${context}-${width}-dpr${scale}.jpg`,
        fullPage: true,
        type: 'jpeg',
        quality: 72
      });
    }
    await page.close();
  }
await browser.close();
await writeFile(`${base}/qa.json`, JSON.stringify(results, null, 2));
const failures = results.flatMap((result) =>
  result.images
    .filter(
      (image) =>
        image.broken ||
        !image.allContained ||
        Math.abs(image.sourceRatio - image.repairedRatio) > 0.003
    )
    .map((image) => ({ ...result, images: undefined, image }))
);
console.log(
  JSON.stringify(
    { sheets: results.length, sourceContextChecks: results.length * 21, failures },
    null,
    2
  )
);
if (failures.length) process.exitCode = 1;
