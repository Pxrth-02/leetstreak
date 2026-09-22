import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShieldCheck, Zap, Lock, Flame, AlertCircle } from 'lucide-react';

export default function Login() {
  const { loginWithGoogle, authError } = useAuth();
  const googleBtnRef = useRef(null);
  const [devLoading, setDevLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    const initializeGsi = () => {
      if (window.google?.accounts?.id && googleClientId && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID') {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleResponse,
          });

          if (googleBtnRef.current) {
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'filled_black',
              size: 'large',
              width: 320,
              text: 'continue_with',
              shape: 'rectangular',
            });
          }
        } catch (e) {
          console.error('Google Sign-In initialization error:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initializeGsi();
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [googleClientId]);

  const handleGoogleResponse = async (response) => {
    try {
      setLocalError(null);
      await loginWithGoogle(response.credential);
    } catch (err) {
      setLocalError(err.message || 'Google authentication failed');
    }
  };

  const handleDevLogin = async () => {
    try {
      setDevLoading(true);
      setLocalError(null);
      await loginWithGoogle('mock-dev-token-' + Date.now());
    } catch (err) {
      setLocalError(err.message || 'Development sign-in failed');
    } finally {
      setDevLoading(false);
    }
  };

  const errorMessage = localError || authError;

  return (
    <div className="card">
      <div className="brand-pill">
        <Sparkles size={14} />
        <span>Module 1 · Auth & Verification</span>
      </div>

      <h1>
        Never break your <span className="text-gradient">streak</span>.
      </h1>
      <p className="hero-subtitle">
        Sign in to link your LeetCode handle. We verify your profile directly with LeetCode's public GraphQL API.
      </p>

      <div className="feature-chips">
        <div className="feature-chip">
          <Zap size={14} color="#ffa116" />
          <span>Instant Verification</span>
        </div>
        <div className="feature-chip">
          <Lock size={14} color="#00f2fe" />
          <span>Zero Password Stored</span>
        </div>
        <div className="feature-chip">
          <Flame size={14} color="#ff5e3a" />
          <span>Daily Habit Tracker</span>
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Official Google Identity Services Button */}
      <div className="google-btn-container" ref={googleBtnRef}>
        {(!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID') && (
          <div className="alert alert-info" style={{ width: '100%', textAlign: 'left' }}>
            <div>
              <strong>Google Identity Ready</strong>
              <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Add your <code>VITE_GOOGLE_CLIENT_ID</code> in <code>client/.env</code> for live Google OAuth, or use the 1-click Test Sign-In below!
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="divider">
        <span>Instant Developer Access</span>
      </div>

      {/* Quick Developer Login Button */}
      <button
        onClick={handleDevLogin}
        disabled={devLoading}
        className="btn btn-dev"
        id="dev-login-btn"
      >
        {devLoading ? (
          <div className="spinner"></div>
        ) : (
          <>
            <ShieldCheck size={18} />
            <span>Sign in as Test Developer</span>
          </>
        )}
      </button>

      <div style={{ marginTop: '2rem', fontSize: '0.78rem', color: 'var(--text-dark)' }}>
        <span>Security: Protected by JWT (15-min access) & httpOnly refresh cookie (30-day session)</span>
      </div>
    </div>
  );
}
