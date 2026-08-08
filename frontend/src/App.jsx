import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/"     element={<LandingPage />} />
        <Route path="/scan" element={<Dashboard />} />
        <Route path="*"     element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;

