import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [data, setData] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [nameFilter, setNameFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showOnlyMismatch, setShowOnlyMismatch] = useState(false);


  useEffect(() => {
    fetch('/db.json')
      .then(res => res.json())
      .then(grouped => {
        // ✅ Flatten all entries across all restaurants
        const allEntries = Object.entries(grouped).flatMap(([name, entries]) =>
          entries.map(entry => ({ name, ...entry }))
        );
        setData(allEntries);
      })
      .catch(err => console.error('Failed to load db.json:', err));
  }, []);

  const filtered = data.filter(r => {
    const matchAvailability = availabilityFilter === 'All' || r.CurrentAvailability === availabilityFilter;
    const matchName = (r.name || '').toLowerCase().includes(nameFilter.toLowerCase());
    const matchLocation = (r.location || '').toLowerCase().includes(locationFilter.toLowerCase());


    const timestamp = new Date((r.timestamp || '').replace(/ - /, ' '));
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const matchTimestamp =
      (!from || timestamp >= from) &&
      (!to || timestamp <= to);

    const matchMismatch = !showOnlyMismatch || r.CurrentAvailability !== r.expectedAvailability;

    return matchAvailability && matchName && matchLocation && matchTimestamp && matchMismatch;
  });

  return (
    <div className="bg-white shadow rounded p-4 overflow-x-auto">
      <table className="w-full table-auto border-collapse text-sm">
        <thead>
          {/* 🔍 Filter Row */}
          <tr className="bg-white">
            <th className="p-2">
              <input
                type="text"
                placeholder="Filter name"
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
                className="border p-1 rounded w-full"
              />
            </th>
            <th className="p-2">
              <input
                type="text"
                placeholder="Filter location"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="border p-1 rounded w-full"
              />
            </th>
            <th className="p-2">
              <select
                value={availabilityFilter}
                onChange={e => setAvailabilityFilter(e.target.value)}
                className="border p-1 rounded w-full"
              >
                <option value="All">All</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </th>
            <th className="p-2"></th>
            <th className="p-2"></th>
            <th className="p-2 flex gap-1">
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="border p-1 rounded w-full"
              />
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="border p-1 rounded w-full"
              />
            </th>
            <th className="p-2">
  <label className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={showOnlyMismatch}
      onChange={e => setShowOnlyMismatch(e.target.checked)}
    />
    <span className="text-xs">Only mismatches</span>
  </label>
</th>

          </tr>

          {/* 🧭 Header Row */}
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Location</th>
            <th className="p-2">Availability</th>
            <th className="p-2">Expected</th>
            <th className="p-2">Open Timings</th>
            <th className="p-2">Close Timings</th>
            <th className="p-2">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => (
            <tr key={i} className={`border-t ${r.CurrentAvailability !== r.expectedAvailability ? 'bg-red-50' : ''  }`}>
              <td className="p-2 font-semibold text-blue-600">
                <a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a>
              </td>
              <td className="p-2">{r.location}</td>
              <td className={`p-2 font-bold ${r.CurrentAvailability === 'Open' ? 'text-green-600' : 'text-red-600'}`}>
                {r.CurrentAvailability}
              </td>
              <td
                className={`p-2 font-bold ${
                  r.expectedAvailability === 'Open' ? 'text-green-600' : 'text-red-600'
                } cursor-pointer`}
                onClick={() => {
                  if (r.expectedAvailability === 'Closed') {
                    alert(`📧 Notification triggered for ${r.name} — expected to be open`);
                    // You can replace this with actual email logic or webhook trigger
                  }
                }}
              >
                {r.expectedAvailability}
              </td>
             <td className="p-2">{r.openTimings}</td>
              <td className="p-2">{r.closeTimings}</td>
              <td className="p-2 text-gray-600">{r.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
