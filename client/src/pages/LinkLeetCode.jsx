import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Code2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LinkLeetCode({ onComplete }) {
  const { user, updateLeetCodeUsername, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sampleHandles = ['tourist', 'neal_wu', 'yep'];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Please enter your LeetCode username');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const verifiedHandle = await updateLeetCodeUsername(trimmed);
      setSuccess(true);
      setTimeout(() => {
        if (onComplete) onComplete(verifiedHandle);
      }, 600);
    } catch (err) {
      setError(err.message || 'Failed to verify LeetCode account.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (handle) => {
    setUsername(handle);
    setError(null);
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-[#333333] bg-[#262626] p-8 space-y-6 shadow-sm">
        <div className="space-y-1.5 text-center">
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/20 text-xs font-medium mb-1">
            <span>Step 2 · Link Account</span>
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            Link Your LeetCode
          </h2>
          <p className="text-sm text-[#9ca3af]">
            {user?.name ? (
              <>Welcome <span className="text-white font-medium">{user.name}</span>! </>
            ) : null}
            Enter your LeetCode username to verify your profile and track your daily streak.
          </p>
        </div>

        {error && (
          <div
            id="link-error-alert"
            className="flex items-center space-x-2.5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs"
          >
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            <span>LeetCode handle verified and linked successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="leetcode-username-input"
                className="block text-xs font-medium text-[#d1d5db]"
              >
                LeetCode Username
              </label>
              <span className="text-[11px] text-[#6b7280]">Public profile</span>
            </div>

            <div className="relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6b7280]">
                <Code2 size={16} />
              </div>
              <input
                id="leetcode-username-input"
                type="text"
                autoComplete="username"
                autoFocus
                disabled={loading || success}
                placeholder="e.g. tourist, neal_wu"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3.5 py-2.5 bg-[#1a1a1a] border border-[#383838] focus:border-[#ffa116] focus:ring-1 focus:ring-[#ffa116] rounded-lg text-sm text-[#eff1f6] placeholder-[#555] transition-colors outline-none disabled:opacity-50"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1 text-xs text-[#8c8c8c]">
              <span>Quick test handles:</span>
              <div className="flex items-center space-x-1.5">
                {sampleHandles.map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    onClick={() => handleSelectSample(handle)}
                    className="px-2 py-0.5 rounded bg-[#1a1a1a] hover:bg-[#333333] border border-[#383838] text-[11px] text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
                  >
                    {handle}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            id="submit-leetcode-btn"
            disabled={loading || success || !username.trim()}
            className="w-full h-11 px-4 bg-[#ffa116] hover:bg-[#e08e13] text-[#1a1a1a] text-sm font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="spinner !border-[#1a1a1a]/30 !border-t-[#1a1a1a]"></div>
                <span>Verifying with LeetCode API...</span>
              </div>
            ) : (
              <>
                <span>Verify & Link Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#333333] text-center space-y-2">
          <p className="text-xs text-[#8c8c8c] leading-relaxed">
            We only query your public handle. No passwords or credentials are ever requested.
          </p>
          <div>
            <button
              onClick={logout}
              className="text-xs text-[#6b7280] hover:text-[#9ca3af] transition-colors cursor-pointer"
            >
              Sign out and return to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
