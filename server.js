const express = require('express');
const path = require('path');
const app = express();

// Serve frontend build
app.use(express.static(path.join(__dirname, 'frontend/dashboard/dist')));

// Serve db.json from backend
app.get('/db.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'backend/db.json'));
});

app.listen(3000, () => {
  console.log('✅ Monitoring Dashboard running at http://localhost:3000');
});
