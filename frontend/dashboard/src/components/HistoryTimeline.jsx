import React, { useEffect, useState } from 'react';

function HistoryTimeline() {
  const [data, setData] = useState({});

  useEffect(() => {
    fetch('/db.json')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Failed to load history:', err));
  }, []);

  return (
    <div className="bg-white shadow rounded p-4 mt-8">
      <h2 className="text-xl font-bold mb-4">Availability History</h2>
      {Object.entries(data).map(([name, entries]) => (
        <div key={name} className="mb-6">
          <h3 className="font-semibold text-blue-600 mb-2">{name}</h3>
          <div className="flex gap-2 flex-wrap">
            {entries.map((e, i) => (
              <span
                key={i}
                title={`${e.timestamp} — ${e.location}`}
                className={`px-2 py-1 rounded text-xs ${
                  e.CurrentAvailability === 'Open' ? 'bg-green-200' : 'bg-red-200'
                }`}
              >
                {e.CurrentAvailability} @ {e.timestamp}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HistoryTimeline;
