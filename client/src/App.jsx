import React from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import LinkLeetCode from './pages/LinkLeetCode';
import Profile from './pages/Profile';

export default function App() {
  const { user, loading } = useAuth();

  return (
    <div className="h-full bg-[#181818] text-[#d1d5db] font-sans flex flex-col antialiased selection:bg-[#ffa116]/20 selection:text-[#ffa116]">
      <Navbar />
      {loading ? (
        <main className="flex-1 flex items-center justify-center p-6 bg-[#1a1a1a]">
          <div className="flex flex-col items-center gap-3">
            <div className="spinner !w-8 !h-8 !border-2 !border-white/20 !border-t-[#ffa116]"></div>
            <p className="text-xs text-[#9ca3af]">Checking session...</p>
          </div>
        </main>
      ) : !user ? (
        <Login />
      ) : !user.leetcodeUsername ? (
        <main className="flex-1 flex items-center justify-center p-6 bg-[#1a1a1a] overflow-y-auto">
          <LinkLeetCode />
        </main>
      ) : (
        <main className="flex-1 flex items-center justify-center p-6 bg-[#1a1a1a] overflow-y-auto">
          <Profile />
        </main>
      )}
    </div>
  );
}
