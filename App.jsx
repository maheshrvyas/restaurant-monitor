import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    fetch('/api/restaurants')
      .then(res => res.json())
      .then(data => setRestaurants(data));
  }, []);

  return (
    <div className="App">
      <h1>Restaurant Availability Dashboard</h1>
      <ul>
        {restaurants.map((r, i) => (
          <li key={i} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h2>{r.name}</h2>
            <p><strong>Location:</strong> {r.location}</p>
            <p><strong>Expected Hours:</strong> {r.hours}</p>
            <p><strong>Actual Status:</strong> {r.availability}</p>
            <p><strong>Last Checked:</strong> {r.timestamp}</p>
            {r.availability !== 'Accepting Orders' && <span style={{ color: 'red' }}>⚠️ Mismatch</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
