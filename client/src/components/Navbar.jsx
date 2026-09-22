import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-logo">
          <Flame size={20} />
        </div>
        <span>LeetStreak</span>
      </div>

      {user && (
        <div className="nav-user">
          <div className="nav-user-info">
            <div className="nav-user-name">{user.name}</div>
            <div className="nav-user-email">{user.email}</div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-logout"
            id="logout-btn"
            title="Log out"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
