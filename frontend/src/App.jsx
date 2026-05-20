import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import { account } from './appwrite';

function App() {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    account.get()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <span className="spinner spinner-accent" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div className="App">
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/signup"    element={!user ? <Signup setUser={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user  ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
