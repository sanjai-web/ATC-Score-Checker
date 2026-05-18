import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [isAdmin] = useState(() => localStorage.getItem('adminLoggedIn') === 'true');

  return (
    <div className="App bg-light min-vh-100">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={!isAdmin ? <AdminLogin /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
