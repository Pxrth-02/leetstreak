import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, LogOut, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-logo">
          <Flame size={22} />
        </div>
        <span>LeetStreak</span>
        <span className="nav-tag">Module 1</span>
      </div>

      {user && (
        <div className="nav-user">
          <div className="nav-user-pill">
            <div className="nav-avatar">{getInitials(user.name)}</div>
            <div className="nav-user-name">{user.name}</div>
          </div>
          <button
            onClick={logout}
            className="btn-logout"
            id="logout-btn"
            title="Log out of session"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
