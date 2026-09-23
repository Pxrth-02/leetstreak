import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Bell,
  X,
  Mail,
  Clock,
  AlertCircle
} from 'lucide-react';
import LinkLeetCode from './LinkLeetCode';
import LeetCodeDashboard from '../components/LeetCodeDashboard';
import { getPreferences, updatePreferences } from '../api/leetcode';

const TIME_SLOTS = [];
for (let h = 0; h < 24; h++) {
  const hh = String(h).padStart(2, '0');
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const h12Str = String(h12).padStart(2, '0');

  TIME_SLOTS.push({
    value: `${hh}:00`,
    label: `${hh}:00 (${h12Str}:00 ${period} IST)`
  });
  TIME_SLOTS.push({
    value: `${hh}:30`,
    label: `${hh}:30 (${h12Str}:30 ${period} IST)`
  });
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const [editingHandle, setEditingHandle] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  // Preference form state
  const [prefEmail, setPrefEmail] = useState('');
  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [potdEnabled, setPotdEnabled] = useState(true);
  const [contestEnabled, setContestEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);
  const [prefError, setPrefError] = useState(null);

  // Load preferences whenever modal opens
  const openPreferencesModal = async () => {
    setPrefSuccess(false);
    setPrefError(null);
    setPrefsOpen(true);

    try {
      const data = await getPreferences();
      setPrefEmail(data.email || user?.email || '');
      setDailyEnabled(data.dailyReminderEnabled !== undefined ? data.dailyReminderEnabled : true);
      setPotdEnabled(data.potdReminderEnabled !== undefined ? data.potdReminderEnabled : true);
      setContestEnabled(data.contestAlertEnabled !== undefined ? data.contestAlertEnabled : true);
      setReminderTime(data.reminderTime || '19:00');
    } catch {
      // Fallback to existing user object
      const prefs = user?.notificationPreferences || {};
      setPrefEmail(prefs.email || user?.email || '');
      setDailyEnabled(prefs.dailyReminderEnabled !== false);
      setPotdEnabled(prefs.potdReminderEnabled !== false);
      setContestEnabled(prefs.contestAlertEnabled !== false);
      setReminderTime(prefs.reminderTime || '19:00');
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefError(null);

    try {
      const updated = await updatePreferences({
        email: prefEmail.trim() || null,
        dailyReminderEnabled: dailyEnabled,
        potdReminderEnabled: potdEnabled,
        contestAlertEnabled: contestEnabled,
        reminderTime,
        timezone: 'Asia/Kolkata'
      });

      if (setUser) {
        setUser((prev) => (prev ? { ...prev, notificationPreferences: updated } : null));
      }

      setPrefSuccess(true);
      setTimeout(() => {
        setPrefSuccess(false);
        setPrefsOpen(false);
      }, 1200);
    } catch (err) {
      setPrefError(err.response?.data?.error || 'Failed to update preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

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
    <div className="w-full max-w-3xl space-y-6 my-auto py-6">
      {/* Profile Header & Info Card */}
      <div className="rounded-xl border border-[#333333] bg-[#262626] p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Profile User Info */}
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

          {/* Top Actions: Notification Preferences Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={openPreferencesModal}
              id="notification-prefs-btn"
              className="px-3.5 py-2 bg-[#1a1a1a] hover:bg-[#222222] border border-[#383838] hover:border-[#ffa116] text-white text-xs font-medium rounded-lg transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
              title="Configure Email Reminders"
            >
              <Bell size={14} className="text-[#ffa116]" />
              <span>Notification Preferences</span>
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
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

        {/* Actions Div */}
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

        {/* SECTION — LeetCode Dashboard Data */}
        <LeetCodeDashboard />
      </div>

      {/* Notification Preferences Modal */}
      {prefsOpen && (
        <div
          id="preferences-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !savingPrefs && setPrefsOpen(false)}
        >
          <div
            id="preferences-modal"
            className="w-full max-w-md rounded-xl border border-[#383838] bg-[#222222] p-6 space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#333333] pb-3">
              <div className="flex items-center space-x-2">
                <Bell size={18} className="text-[#ffa116]" />
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Notification Preferences
                </h3>
              </div>
              <button
                onClick={() => setPrefsOpen(false)}
                disabled={savingPrefs}
                className="text-[#9ca3af] hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-[#333333]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Success Feedback */}
            {prefSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>Preferences saved successfully!</span>
              </div>
            )}

            {/* Error Feedback */}
            {prefError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center space-x-2">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <span>{prefError}</span>
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="space-y-4">
              {/* Notification Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="pref-email-input"
                  className="block text-xs font-medium text-[#d1d5db]"
                >
                  Notification Email
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6b7280]">
                    <Mail size={15} />
                  </div>
                  <input
                    id="pref-email-input"
                    type="email"
                    value={prefEmail}
                    onChange={(e) => setPrefEmail(e.target.value)}
                    placeholder={user?.email || 'name@example.com'}
                    className="block w-full pl-9 pr-3 py-2 bg-[#1a1a1a] border border-[#383838] focus:border-[#ffa116] focus:ring-1 focus:ring-[#ffa116] rounded-lg text-xs text-white placeholder-[#555] transition-colors outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#8c8c8c]">
                  Defaults to your Google account email if not specified.
                </p>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-1">
                {/* Toggle: Daily Reminder */}
                <label className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] border border-[#333333] cursor-pointer hover:border-[#444444] transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-white block">
                      Daily Streak Reminder
                    </span>
                    <span className="text-[11px] text-[#8c8c8c] block">
                      Alert if you haven't solved any problem today
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={dailyEnabled}
                    onChange={(e) => setDailyEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#ffa116] rounded cursor-pointer"
                  />
                </label>

                {/* Toggle: POTD Reminder */}
                <label className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] border border-[#333333] cursor-pointer hover:border-[#444444] transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-white block">
                      Daily Challenge (POTD) Alert
                    </span>
                    <span className="text-[11px] text-[#8c8c8c] block">
                      Alert if today's Problem of the Day remains unsolved
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={potdEnabled}
                    onChange={(e) => setPotdEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#ffa116] rounded cursor-pointer"
                  />
                </label>

                {/* Toggle: Contest Alerts */}
                <label className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] border border-[#333333] cursor-pointer hover:border-[#444444] transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-white block">
                      Contest Alerts
                    </span>
                    <span className="text-[11px] text-[#8c8c8c] block">
                      Receive morning alerts 24 hours before upcoming contests
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={contestEnabled}
                    onChange={(e) => setContestEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#ffa116] rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Time Picker Dropdown */}
              <div className="space-y-1.5 pt-1">
                <label
                  htmlFor="reminder-time-select"
                  className="block text-xs font-medium text-[#d1d5db]"
                >
                  Reminder Delivery Time
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6b7280]">
                    <Clock size={15} />
                  </div>
                  <select
                    id="reminder-time-select"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-[#1a1a1a] border border-[#383838] focus:border-[#ffa116] focus:ring-1 focus:ring-[#ffa116] rounded-lg text-xs text-white transition-colors outline-none cursor-pointer"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-[#8c8c8c]">
                  Times are evaluated in Indian Standard Time (IST, UTC+5:30).
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setPrefsOpen(false)}
                  disabled={savingPrefs}
                  className="px-3 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#2b2b2b] border border-[#383838] text-xs text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-preferences-btn"
                  disabled={savingPrefs}
                  className="px-4 py-2 rounded-lg bg-[#ffa116] hover:bg-[#e08e13] text-[#1a1a1a] text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingPrefs ? (
                    <>
                      <div className="spinner !w-3 !h-3 !border-zinc-800/30 !border-t-zinc-900" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Preferences</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
