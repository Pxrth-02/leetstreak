import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function Login() {
  const { loginWithGoogle, authError } = useAuth();
  const googleBtnRef = useRef(null);
  const [devLoading, setDevLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    // Initialize Google Identity Services if script is loaded and client ID exists
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

  // Quick Dev Sign-In for instant local testing without setting up Google Cloud Console credentials
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

      <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Welcome to LeetStreak</h1>
      <p style={{ marginBottom: '2rem' }}>
        Track your daily problem streak, verify your account, and stay accountable.
      </p>

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
              <strong>Google Client ID not configured</strong>
              <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>client/.env</code> to enable live Google OAuth.
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="divider">
        <span>or</span>
      </div>

      {/* Quick Developer Login */}
      <button
        onClick={handleDevLogin}
        disabled={devLoading}
        className="btn btn-secondary"
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

      <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>Security: Protected by JWT (15-min access) & httpOnly refresh cookie (30-day session)</span>
      </div>
    </div>
  );
}
