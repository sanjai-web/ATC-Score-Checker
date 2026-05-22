import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Read localStorage directly on every render — useState would capture a stale snapshot
const isAdmin = () => localStorage.getItem('adminLoggedIn') === 'true';

function App() {
  return (
    <div className="App bg-light min-vh-100">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={!isAdmin() ? <AdminLogin /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAdmin() ? <AdminDashboard /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
