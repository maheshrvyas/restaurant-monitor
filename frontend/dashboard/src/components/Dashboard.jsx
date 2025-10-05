import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/db.json')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Failed to load db.json:', err));
  }, []);

  const filtered = data.filter(r => {
    const matchAvailability = filter === 'All' || r.CurrentAvailability === filter;
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    return matchAvailability && matchSearch;
  });

  return (
    <div className="bg-white shadow rounded p-4">
      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="All">All</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>
        <input
          type="text"
          placeholder="Search name or location"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded flex-1 min-w-[200px]"
        />
      </div>
      <table className="w-full table-auto border-collapse text-sm">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Location</th>
            <th className="p-2">Availability</th>
            <th className="p-2">Open Timings</th>
            <th className="p-2">Close Timings</th>
            <th className="p-2">Timestamp (UTC)</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="p-2 font-semibold text-blue-600">
                <a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a>
              </td>
              <td className="p-2">{r.location}</td>
              <td className={`p-2 font-bold ${r.CurrentAvailability === 'Open' ? 'text-green-600' : 'text-red-600'}`}>
                {r.CurrentAvailability}
              </td>
              <td className="p-2">{r.openTimings}</td>
              <td className="p-2">{r.closeTimings}</td>
              <td className="p-2 text-gray-600">{new Date(r.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
