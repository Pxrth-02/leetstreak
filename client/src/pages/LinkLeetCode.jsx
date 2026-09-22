import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Code2, ArrowRight, AlertCircle, CheckCircle2, Flame } from 'lucide-react';

export default function LinkLeetCode({ onComplete }) {
  const { user, updateLeetCodeUsername } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your LeetCode username');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const verifiedHandle = await updateLeetCodeUsername(username.trim());
      setSuccess(true);
      setTimeout(() => {
        if (onComplete) onComplete(verifiedHandle);
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to verify LeetCode account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="brand-pill">
        <Flame size={14} />
        <span>Link Account</span>
      </div>

      <h2 style={{ marginBottom: '0.5rem' }}>Link Your LeetCode</h2>
      <p style={{ marginBottom: '1.75rem' }}>
        We verify your username directly with LeetCode's public GraphQL API to track your daily streak.
      </p>

      {error && (
        <div className="alert alert-error" id="link-error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>LeetCode handle verified and linked successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="leetcode-username-input">
            LeetCode Username
          </label>
          <div className="input-wrapper">
            <Code2 size={18} className="input-icon" />
            <input
              id="leetcode-username-input"
              type="text"
              className="form-input"
              placeholder="e.g. tourist, neal_wu"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading || success}
              autoFocus
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          id="submit-leetcode-btn"
          disabled={loading || success || !username.trim()}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Verifying with LeetCode...</span>
            </>
          ) : (
            <>
              <span>Verify & Link Account</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: '1.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>Note: We only access your public profile data. No password or session cookies are ever requested.</span>
      </div>
    </div>
  );
}
