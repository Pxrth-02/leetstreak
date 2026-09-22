import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Code2, ArrowRight, AlertCircle, CheckCircle2, Flame, Sparkles } from 'lucide-react';

export default function LinkLeetCode({ onComplete }) {
  const { updateLeetCodeUsername } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sampleHandles = ['tourist', 'neal_wu', 'yep'];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
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
      }, 700);
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
    <div className="card">
      <div className="brand-pill">
        <Flame size={14} />
        <span>Step 2 · Link Account</span>
      </div>

      <h2>Link Your LeetCode</h2>
      <p className="hero-subtitle">
        We verify your username directly with LeetCode's public GraphQL API before saving.
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
          <div className="form-label">
            <span>LeetCode Username</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>Public profile</span>
          </div>
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

          <div className="quick-handles">
            <span>Quick test handles:</span>
            {sampleHandles.map((handle) => (
              <button
                key={handle}
                type="button"
                className="handle-pill"
                onClick={() => handleSelectSample(handle)}
              >
                {handle}
              </button>
            ))}
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
              <span>Verifying with LeetCode API...</span>
            </>
          ) : (
            <>
              <span>Verify & Link Account</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: '1.75rem', fontSize: '0.78rem', color: 'var(--text-dark)' }}>
        <span>We only query your public handle. No passwords or credentials are ever requested.</span>
      </div>
    </div>
  );
}
