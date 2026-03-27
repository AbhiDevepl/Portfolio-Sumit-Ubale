const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.text().startsWith('renderGallery:')) {
      console.log(msg.text());
    }
  });

  await page.goto('http://localhost:8000/pages/gallery.html?category=all');

  // Wait a bit for rendering to complete
  await page.waitForTimeout(2000);

  await browser.close();
})();
