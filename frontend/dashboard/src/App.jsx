import React from 'react';
import Dashboard from './components/Dashboard';
import HistoryTimeline from './components/HistoryTimeline';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Restaurant Monitoring Dashboard</h1>
      <Dashboard />
    </div>
  );
}

export default App;
