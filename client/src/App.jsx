import React from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import LinkLeetCode from './pages/LinkLeetCode';
import Profile from './pages/Profile';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', borderWidth: '3px' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Checking session...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {!user ? (
          <Login />
        ) : !user.leetcodeUsername ? (
          <LinkLeetCode />
        ) : (
          <Profile />
        )}
      </main>
    </div>
  );
}
