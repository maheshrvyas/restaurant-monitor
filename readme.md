Restaurant Availability Monitor

This is a full-stack web application that tracks the live availability of restaurant listings on third-party food delivery platforms like Swiggy or Zomato. It helps operations teams identify mismatches between expected business hours and actual availability on the platform.

Features

- Scrapes availability and opening hours for 5+ restaurant listings
- Compares expected vs actual status
- Displays mismatches in a dashboard
- Scheduled scraping via GitHub Actions (free tier)
- Backend API to serve scraped data
- Frontend dashboard built with React

How run manually

1. Goal : Scape information from predefined Resturants into local database
   Steps
   1. npx playwright install
   2. sudo npx playwright install-deps
   3. Go to folder  /workspaces/restaurant-monitor (main)
   4. npm run scrape
   5. it will update the db.json in backend folder
   6. Run mv backend/db.json frontend/dashboard/public/db.json (Front end picks file from public folder)

2. Goal : Launch Dashboard
   1. Go to folder /workspaces/restaurant-monitor/frontend/dashboard
   2. npm install for installing pending dependencies, if any
   3. npm run dev
   4. Open browser from link
   5. Various filters are available


