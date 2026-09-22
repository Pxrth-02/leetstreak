import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ExternalLink, RefreshCw, Flame, Sparkles } from 'lucide-react';
import LinkLeetCode from './LinkLeetCode';

export default function Profile() {
  const { user } = useAuth();
  const [editingHandle, setEditingHandle] = useState(false);

  if (editingHandle) {
    return (
      <LinkLeetCode
        onComplete={() => {
          setEditingHandle(false);
        }}
      />
    );
  }

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
    <div className="w-full max-w-lg">
      <div className="rounded-xl border border-[#333333] bg-[#262626] p-8 space-y-6 shadow-sm">
        {/* Profile Header */}
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-[#ffa116] text-[#1a1a1a] font-bold text-xl flex items-center justify-center shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white tracking-tight">{user?.name}</h2>
            <p className="text-xs text-[#9ca3af]">{user?.email}</p>
            <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 text-[11px]">
              <CheckCircle2 size={12} />
              <span>Google Verified</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#383838] space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#8c8c8c] font-medium">
              Linked LeetCode Handle
            </span>
            <div>
              {user?.leetcodeUsername ? (
                <a
                  href={`https://leetcode.com/u/${user.leetcodeUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-sm font-semibold text-[#ffa116] hover:underline"
                >
                  <span>{user.leetcodeUsername}</span>
                  <ExternalLink size={13} />
                </a>
              ) : (
                <span className="text-xs text-amber-400">Not Linked</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#383838] space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-[#8c8c8c] font-medium">
              Status
            </span>
            <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 size={13} />
              <span>LeetCode Active</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div>
          <button
            onClick={() => setEditingHandle(true)}
            id="change-handle-btn"
            className="w-full h-10 px-4 bg-[#1a1a1a] hover:bg-[#222222] border border-[#383838] hover:border-[#4d4d4d] text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Update LeetCode Handle</span>
          </button>
        </div>

        {/* Module 2 Roadmap Preview */}
        <div className="p-4 rounded-lg bg-[#1f1f1f] border border-[#333333] space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#ffa116]">
            <Sparkles size={14} />
            <span>Coming Next: Module 2 Automation</span>
          </div>
          <p className="text-xs text-[#8c8c8c] leading-relaxed">
            Automated daily scans, Brevo email reminders when you haven't solved a problem, and streak recovery alerts!
          </p>
        </div>
      </div>
    </div>
  );
}
