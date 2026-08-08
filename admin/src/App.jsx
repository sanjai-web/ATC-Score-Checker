import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Dynamic wrappers to evaluate authentication state on every route change
const ProtectedRoute = ({ children }) => {
  const authenticated = localStorage.getItem('adminLoggedIn') === 'true';
  return authenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const authenticated = localStorage.getItem('adminLoggedIn') === 'true';
  return !authenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <div className="App bg-light min-vh-100">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}


export default App;
