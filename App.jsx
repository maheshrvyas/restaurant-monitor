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
        {restaurants.map((r, i) => {
          const isOpen = r.availability === 'Open';
          const localTime = new Date(r.timestamp).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour12: true,
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <li key={i} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <h2>{r.name}</h2>
              <p><strong>Location:</strong> {r.location}</p>
              <p><strong>Expected Hours:</strong> {r.hours}</p>
              <p><strong>Actual Status:</strong> {r.availability}</p>
              <p><strong>Last Checked:</strong> {localTime}</p>
              {!isOpen && <span style={{ color: 'red' }}>⚠️ Mismatch</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
