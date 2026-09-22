import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ShieldCheck, Flame, Trophy, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const { loginWithGoogle, authError } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [gsiStatus, setGsiStatus] = useState('loading'); // 'loading' | 'ready' | 'no-client-id'

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const hasRealClientId = googleClientId && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID';

  useEffect(() => {
    if (!hasRealClientId) {
      setGsiStatus('no-client-id');
      return;
    }

    async function handleCredentialResponse(response) {
      try {
        setErrorMessage(null);
        setGoogleLoading(true);
        await loginWithGoogle(response.credential);
      } catch (err) {
        setErrorMessage(err.message || 'Google authentication failed');
      } finally {
        setGoogleLoading(false);
      }
    }

    function initGsi() {
      const container = document.getElementById('g-signin-container');
      if (!container || !window.google?.accounts?.id) return false;

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Clear any previous render
        container.innerHTML = '';

        window.google.accounts.id.renderButton(container, {
          theme: 'filled_black',
          size: 'large',
          width: 384,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });

        setGsiStatus('ready');
        return true;
      } catch (err) {
        console.error('GSI init error:', err);
        setErrorMessage('Failed to initialize Google Sign-In');
        return false;
      }
    }

    // Try immediately, then poll
    if (!initGsi()) {
      const interval = setInterval(() => {
        if (initGsi()) clearInterval(interval);
      }, 200);

      // Give up after 8s
      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (gsiStatus === 'loading') {
          setGsiStatus('no-client-id');
          setErrorMessage('Google Sign-In SDK failed to load. You can use the developer sign-in below.');
        }
      }, 8000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [googleClientId]);

  const handleDevLogin = async () => {
    try {
      setGoogleLoading(true);
      setErrorMessage(null);
      await loginWithGoogle('mock-dev-token-' + Date.now());
    } catch (err) {
      setErrorMessage(err.message || 'Developer sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const displayError = errorMessage || authError;

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center p-6 bg-[#181818] overflow-y-auto relative"
      data-purpose="workbench-view"
    >
      {/* Subtle background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ffa116]/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

      <div className="w-full max-w-lg z-10 flex flex-col items-center space-y-7 my-auto py-6">
        {/* Brand & Tagline Section Above Sign-In Dashboard */}
        <div className="text-center space-y-4 flex flex-col items-center">
          {/* Logo with Glowing Ambient Ring */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#ffa116] via-[#ff7a00] to-[#ff4500] rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-[#252525] to-[#1c1c1c] border border-[#ffa116]/30 shadow-2xl flex items-center justify-center">
              <svg
                className="w-11 h-11 text-[#ffa116] drop-shadow-[0_4px_12px_rgba(255,161,22,0.45)]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.48 13.03A4.001 4.001 0 0 0 17 6.13a6.994 6.994 0 0 0-4.05-4.07 1 1 0 0 0-1.28 1.13c.27 1.48-.05 3.01-.89 4.22-.84 1.2-2.14 1.99-3.6 2.19a4.015 4.015 0 0 0-3.32 3.16 7.978 7.978 0 0 0 2.22 7.74 8.01 8.01 0 0 0 11.36 0 7.96 7.96 0 0 0 2.04-7.47zm-7.48 7.02c-2.76 0-5-2.24-5-5 0-1.84 1.01-3.44 2.5-4.29.21.68.58 1.3 1.08 1.8 1.41 1.41 3.42 1.83 5.22 1.25-.43 3.56-3.44 6.24-3.8 6.24z"></path>
              </svg>
            </div>
          </div>

          {/* Brand Name */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Leet<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffa116] via-[#ffb03a] to-[#ff7a00]">Streak</span>
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-base sm:text-lg text-[#b3b3b3] max-w-md font-medium leading-relaxed">
            Never miss your LeetCode daily streaks, contests, and submissions.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffa116]/10 border border-[#ffa116]/25 text-[#ffa116] text-xs font-semibold shadow-sm">
              <Flame size={13} className="text-[#ffa116]" />
              Daily Streaks
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/25 text-[#60a5fa] text-xs font-semibold shadow-sm">
              <Trophy size={13} className="text-[#60a5fa]" />
              Weekly Contests
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 text-[#34d399] text-xs font-semibold shadow-sm">
              <CheckCircle2 size={13} className="text-[#34d399]" />
              Submissions
            </span>
          </div>
        </div>

        {/* Sign In Dashboard Card */}
        <div className="w-full max-w-md rounded-2xl border border-[#333333] bg-[#242424]/90 backdrop-blur-xl p-8 space-y-6 shadow-2xl">
          {/* Card Header */}
          <div className="space-y-1.5 text-center">
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-xs text-[#9ca3af]">
              Authenticate securely to start tracking your LeetCode journey.
            </p>
          </div>

          {/* Error alert */}
          {displayError && (
            <div
              id="login-error-alert"
              className="flex items-center space-x-2.5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs"
            >
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{displayError}</span>
            </div>
          )}

          <div className="space-y-4 pt-1">
            {/* Loading overlay when signing in */}
            {googleLoading && (
              <div className="w-full h-11 bg-[#1a1a1a] border border-[#383838] rounded-lg flex items-center justify-center space-x-2 text-white text-sm">
                <div className="spinner"></div>
                <span>Signing in...</span>
              </div>
            )}

            {/* SDK loading placeholder */}
            {!googleLoading && gsiStatus === 'loading' && (
              <div className="w-full h-11 bg-[#1a1a1a] border border-[#383838] rounded-lg flex items-center justify-center space-x-2 text-[#8c8c8c] text-sm">
                <div className="spinner"></div>
                <span>Loading Google Sign-In...</span>
              </div>
            )}

            {/*
              Google Identity Services renders its iframe button INTO this div.
              CRITICAL: No React children allowed here — React reconciliation
              would wipe out Google's injected DOM on every re-render.
            */}
            <div
              id="g-signin-container"
              className={`w-full flex justify-center ${googleLoading || gsiStatus === 'loading' ? 'hidden' : ''}`}
              style={{ minHeight: '44px' }}
            ></div>

            {/* Divider — only show when dev login is available */}
            {gsiStatus === 'no-client-id' && (
              <>
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[#383838]"></div>
                  <span className="flex-shrink mx-3 text-xs text-[#71717a]">developer mode</span>
                  <div className="flex-grow border-t border-[#383838]"></div>
                </div>

                <button
                  id="dev-login-btn"
                  type="button"
                  onClick={handleDevLogin}
                  disabled={googleLoading}
                  className="w-full h-11 px-4 bg-[#1a1a1a] hover:bg-[#222222] border border-[#383838] hover:border-[#4d4d4d] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2.5 cursor-pointer select-none disabled:opacity-50"
                >
                  <ShieldCheck size={16} className="text-[#ffa116]" />
                  <span>Sign in as Test Developer</span>
                </button>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#333333] text-center space-y-2">
            <p className="text-xs text-[#8c8c8c] leading-relaxed">
              We authenticate securely with Google. After sign-in, you'll link your LeetCode handle.
            </p>
            <p className="text-xs text-[#666]">
              By continuing, you agree to the{' '}
              <a className="underline hover:text-[#9ca3af] transition-colors" href="#">
                Terms of Service
              </a>{' '}
              and{' '}
              <a className="underline hover:text-[#9ca3af] transition-colors" href="#">
                Privacy Policy
              </a>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
