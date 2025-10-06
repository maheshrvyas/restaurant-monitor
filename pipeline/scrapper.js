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

function parseTimeToIST(timeStr) {
  if (!timeStr || timeStr === 'Not Mentioned') return null;
  const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) return null;

  let [_, hour, minute, period] = match;
  hour = parseInt(hour, 10);
  minute = parseInt(minute || '0', 10);

  if (period.toUpperCase() === 'PM' && hour < 12) hour += 12;
  if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;

  const now = new Date();
  const istTime = new Date(now);
  istTime.setHours(hour, minute, 0, 0);
  return istTime;
}

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


async function scrapeRestaurant(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const isDineout = url.includes('/dineout');

  const data = await page.evaluate((ctx) => {
    const { isDineout, url } = ctx;

    const name = document.querySelector('h1')?.innerText || 'Unknown';

    let location = 'Unknown';
    let CurrentAvailability = 'Unknown';
    let openTimings = 'Not Mentioned';
    let closeTimings = 'Not Mentioned';

    if (isDineout) {
      const statusEl = document.querySelector('[data-testid="rdp_serviceability_timing_status"]');
      const statusText = statusEl?.innerText.trim() || '';
      if (/Open now/i.test(statusText)) CurrentAvailability = 'Open';
      else if (/Closed/i.test(statusText)) CurrentAvailability = 'Closed';

      const locationEl = document.querySelector('[data-testid="rdp_location_text_content"]');
      location = locationEl?.innerText.trim() || 'Unknown';

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
      if (/Accepting Orders/i.test(statusText)) CurrentAvailability = 'Open';
      else if (/Closed/i.test(statusText)) CurrentAvailability = 'Closed';
    }

    return { name, location, CurrentAvailability, openTimings, closeTimings };
  }, { isDineout, url });

  await browser.close();
  return data;
}

(async () => {
  const backendDir = path.join(__dirname, '../backend');
  if (!fs.existsSync(backendDir)) fs.mkdirSync(backendDir);

  const dbPath = path.join(backendDir, 'db.json');
  let existing = {};
console.log('📁 Writing to db.json:', dbPath);
  if (fs.existsSync(dbPath)) {
    const raw = fs.readFileSync(dbPath, 'utf-8');
    try {
      existing = raw.trim() ? JSON.parse(raw) : {};
    } catch (err) {
      console.warn('⚠️ db.json is corrupted or invalid. Starting fresh.');
      existing = {};
    }
  }
  console.log('Scraping started...');
  for (const r of restaurants) {
    try {
      const info = await scrapeRestaurant(r.url);
      const timestamp = formatISTTimestamp(new Date());

      const openTime = parseTimeToIST(info.openTimings);
      const closeTime = parseTimeToIST(info.closeTimings);
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

      let expectedAvailability = 'Unknown';
      if (openTime && !closeTime) {
        expectedAvailability = now >= openTime ? 'Open' : 'Closed';
      } else if (!openTime && closeTime) {
        expectedAvailability = now <= closeTime ? 'Open' : 'Closed';
      } else if (openTime && closeTime) {
        expectedAvailability = now >= openTime && now <= closeTime ? 'Open' : 'Closed';
      } else {
        expectedAvailability = 'Unknown';
      }

      const entry = {
        location: info.location,
        CurrentAvailability: info.CurrentAvailability,
        expectedAvailability,
        openTimings: info.openTimings,
        closeTimings: info.closeTimings,
        timestamp,
        url: r.url
      };

      const shouldAlert = expectedAvailability === 'Open' && info.CurrentAvailability === 'Closed';

      if (shouldAlert) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.ALERT_RECIPIENT,
          subject: `🚨 ALERT: ${r.name} is CLOSED but expected to be OPEN`,
          text: `Restaurant: ${r.name}\nLocation: ${info.location}\nExpected: ${expectedAvailability}\nActual: ${info.CurrentAvailability}\nTime: ${timestamp}\nLink: ${r.url}`
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`📧 Email alert sent for ${r.name}`);
        } catch (err) {
          console.error(`❌ Failed to send email for ${r.name}: ${err.message}`);
        }
      }

      if (!existing[r.name]) existing[r.name] = [];
      existing[r.name].push(entry);

      console.log(`✅ Scraped ${r.name} at ${timestamp}: ${info.CurrentAvailability}`);
    } catch (err) {
      console.error(`❌ Error scraping ${r.name}: ${err.message}`);
      const errorEntry = {
        error: err.message,
        timestamp: new Date(),
        url: r.url
      };
      if (!existing[r.name]) existing[r.name] = [];
      existing[r.name].push(errorEntry);
    }
  }

  console.log('Scraping Completed');
  console.log(existing);
  console.log(dbPath);

  try {
  fs.writeFileSync(dbPath, JSON.stringify(existing, null, 2));
  console.log(`📦 Updated db.json with all timestamped entries`);
} catch (err) {
  console.error(`❌ Failed to write db.json: ${err.message}`);
}

})();
