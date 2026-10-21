import { chromium } from '@playwright/test';
const browser = await chromium.launch();
try {
  for (const [width, height] of [
    [1440, 900],
    [390, 844]
  ]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8080');
    await page.evaluate(async () => {
      await globalThis.document.fonts.ready;
      await Promise.all(
        Array.from(globalThis.document.images)
          .filter((i) => i.fetchPriority === 'high')
          .map((i) => i.decode().catch(() => {}))
      );
    });
    await page.screenshot({
      path: `docs/screenshots/overhaul/home-${width}-first-fold.png`,
      animations: 'disabled'
    });
    await context.close();
  }
} finally {
  await browser.close();
}
