const puppeteer = require('puppeteer');
const fs = require('fs');
const { restaurants } = require('./config');

async function scrapeRestaurant(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  await page.waitForTimeout(3000); // wait for dynamic content

  const data = await page.evaluate(() => {
    const name = document.querySelector('h1')?.innerText || 'Unknown';
    const location = document.querySelector('[data-testid="restaurant-address"]')?.innerText || 'Unknown';
    const availability = document.querySelector('[data-testid="restaurant-status"]')?.innerText || 'Unknown';
    const hours = document.querySelector('[data-testid="restaurant-timings"]')?.innerText || 'Not found';
    return { name, location, availability, hours };
  });

  await browser.close();
  return data;
}

(async () => {
  const results = [];
  for (const r of restaurants) {
    try {
      const info = await scrapeRestaurant(r.url);
      results.push({ ...r, ...info, timestamp: new Date().toISOString() });
    } catch (err) {
      results.push({ ...r, error: err.message });
    }
  }
  fs.writeFileSync('./backend/db.json', JSON.stringify(results, null, 2));
})();
