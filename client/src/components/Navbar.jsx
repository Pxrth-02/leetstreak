import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

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
    <header
      className="h-12 border-b border-[#282828] bg-[#1a1a1a] px-6 flex items-center justify-between text-sm select-none shrink-0"
      data-purpose="global-navigation"
    >
      <div className="flex items-center">
        <a
          className="flex items-center space-x-2 text-white font-medium group transition-opacity hover:opacity-90"
          href="#"
          title="LeetStreak Home"
        >
          <svg className="w-5 h-5 text-[#ffa116]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.48 13.03A4.001 4.001 0 0 0 17 6.13a6.994 6.994 0 0 0-4.05-4.07 1 1 0 0 0-1.28 1.13c.27 1.48-.05 3.01-.89 4.22-.84 1.2-2.14 1.99-3.6 2.19a4.015 4.015 0 0 0-3.32 3.16 7.978 7.978 0 0 0 2.22 7.74 8.01 8.01 0 0 0 11.36 0 7.96 7.96 0 0 0 2.04-7.47zm-7.48 7.02c-2.76 0-5-2.24-5-5 0-1.84 1.01-3.44 2.5-4.29.21.68.58 1.3 1.08 1.8 1.41 1.41 3.42 1.83 5.22 1.25-.43 3.56-3.44 6.24-3.8 6.24z"></path>
          </svg>
          <span className="font-semibold text-white tracking-tight">
            Leet<span className="text-[#ffa116]">Streak</span>
          </span>
        </a>
      </div>

      {user ? (
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#262626] border border-[#383838] text-white">
            <div className="w-5 h-5 rounded-full bg-[#ffa116] text-[#1a1a1a] flex items-center justify-center font-bold text-[10px]">
              {getInitials(user.name)}
            </div>
            <span className="text-[#eff1f6] font-medium max-w-[120px] truncate">{user.name}</span>
          </div>

          <button
            onClick={logout}
            id="logout-btn"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#262626] hover:bg-[#333333] text-[#9ca3af] hover:text-white border border-[#383838] transition-colors cursor-pointer"
            title="Log out"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      ) : null}
    </header>
  );
}
