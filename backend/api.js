const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend (optional, if built)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Root route
app.get('/', (req, res) => {
  res.send('Restaurant Monitor API is running. Visit /api/restaurants for data.');
});

// API route
app.get('/api/restaurants', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'db.json'));
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read data file.' });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
