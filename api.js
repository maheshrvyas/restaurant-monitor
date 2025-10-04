const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/restaurants', (req, res) => {
  const data = fs.readFileSync('./backend/db.json');
  res.json(JSON.parse(data));
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
