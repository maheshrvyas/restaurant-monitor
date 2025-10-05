const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { restaurants } = require('./config');

function formatISTTimestamp(date) {
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false
  }).replace(',', '').replace(/\//g, '-').replace(' ', ' - ');
}

async function scrapeRestaurant(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await page.waitForTimeout(3000); // wait for dynamic content

  const isDineout = url.includes('/dineout');

  const data = await page.evaluate((ctx) => {
    const { isDineout, url } = ctx;

    const name = document.querySelector('h1')?.innerText || 'Unknown';

    let location = 'Unknown';
    let CurrentAvailability = 'Unknown';
    let openTimings = 'Not Mentioned';
    let closeTimings = 'Not Mentioned';

    if (isDineout) {
      // ✅ Availability from status element
      const statusEl = document.querySelector('[data-testid="rdp_serviceability_timing_status"]');
      const statusText = statusEl?.innerText.trim() || '';

      if (/Open now/i.test(statusText)) {
        CurrentAvailability = 'Open';
      } else if (/Closed/i.test(statusText)) {
        CurrentAvailability = 'Closed';
      }

      // ✅ Location from dedicated location content block
      const locationEl = document.querySelector('[data-testid="rdp_location_text_content"]');
      location = locationEl?.innerText.trim() || 'Unknown';

      // ✅ Timings from serviceability message
      const timingEl = document.querySelector('[data-testid="rdp_serviceability_status_message"]');
      const timingText = timingEl?.innerText.trim() || '';

      if (/CLOSED, OPENS AT/i.test(timingText)) {
        const match = timingText.match(/OPENS AT\s+([0-9:]+[APMapm]+)/);
        openTimings = match ? match[1] : 'Not Mentioned';
      } else if (/OPEN TILL/i.test(timingText)) {
        const match = timingText.match(/OPEN TILL\s+([0-9:]+[APMapm]+)/);
        closeTimings = match ? match[1] : 'Not Mentioned';
      }
    } else {
      location = document.querySelector('[data-testid="restaurant-address"]')?.innerText || 'Unknown';
      const statusEl = document.querySelector('[data-testid="restaurant-status"]');
      const statusText = statusEl?.innerText.trim() || '';

      if (/Accepting Orders/i.test(statusText)) {
        CurrentAvailability = 'Open';
      } else if (/Closed/i.test(statusText)) {
        CurrentAvailability = 'Closed';
      }

      // For delivery pages, timings not available
      openTimings = 'Not Mentioned';
      closeTimings = 'Not Mentioned';
    }

    console.log(`✅ Scraped ${name}`);
    console.log(`→ URL: ${url}`);
    console.log(`→ Location: ${location}`);
    console.log(`→ CurrentAvailability: ${CurrentAvailability}`);
    console.log(`→ openTimings: ${openTimings}`);
    console.log(`→ closeTimings: ${closeTimings}`);

    return { name, location, CurrentAvailability, openTimings, closeTimings };
  }, { isDineout, url });

  await browser.close();
  return data;
}


(async () => {
  const results = [];
  for (const r of restaurants) {
    try {
      const info = await scrapeRestaurant(r.url);
      const timestamp = new Date();
      results.push({ ...r, ...info, timestamp });
    } catch (err) {
      console.error(`❌ Error scraping ${r.url}: ${err.message}`);
      results.push({ ...r, error: err.message });
    }
  }

  const backendDir = path.join(__dirname, '../backend');
  if (!fs.existsSync(backendDir)) {
    fs.mkdirSync(backendDir);
  }

  fs.writeFileSync(path.join(backendDir, 'db.json'), JSON.stringify(results, null, 2));
})();
