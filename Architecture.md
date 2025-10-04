
---

## 📄 `docs/Architecture.md`

```markdown
# Architecture Overview

## 🧱 Components

### 1. Data Pipeline
- **Tech**: Node.js + Puppeteer
- **Function**: Scrapes restaurant availability and opening hours from Swiggy/Zomato
- **Execution**: GitHub Actions every 30 minutes

### 2. Backend API
- **Tech**: Express.js
- **Function**: Serves scraped data to frontend
- **Storage**: Local JSON file or Supabase

### 3. Frontend Dashboard
- **Tech**: React + Tailwind CSS
- **Function**: Displays restaurant status and highlights mismatches

---

## 🔐 Resilience

- Retry logic in scraper
- Timeout and fallback for failed listings
- GitHub Action alerts on failure (optional)

---

## ⏱️ Data Currency at Scale

- Use serverless scraping (e.g., Cloudflare Workers or AWS Lambda)
- Partition restaurants by region/timezone
- Store results in Supabase or Firestore for real-time updates

---

## 🚨 Notification System

- Trigger alerts when `actual !== expected`
- Use Slack webhook or Pushover API
- Optional: email alerts via SendGrid

---

## 💰 Cost Impact (10,000 Restaurants)

| Component | Tech | Cost |
|----------|------|------|
| Scheduler | GitHub Actions | Free |
| Scraper | Cloudflare Workers | <$5/month |
| DB | Supabase | Free tier up to 500 MB |
| Frontend | Vercel | Free |
| Backend | Render | Free |
| Alerts | Slack/Pushover | Free or <$5/month |

---

## 🧠 Design Patterns

- **Factory**: Scraper adapter for different platforms
- **Observer**: Alert system for mismatches
- **Repository**: DB access abstraction
- **Modular**: Clear separation of pipeline, API, and UI

---

## 🧪 Testing & Observability

- Unit tests with Jest
- Logging via console or Supabase logs
- Optional: Sentry for error tracking

---

## 🛠️ Deployment Strategy

- Push to GitHub → GitHub Actions runs scraper
- Frontend hosted on Vercel
- Backend hosted on Render
- Data served via API or Supabase

