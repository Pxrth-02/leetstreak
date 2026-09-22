import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, CheckCircle2, ExternalLink, RefreshCw, Flame, Shield } from 'lucide-react';
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

  return (
    <div className="card">
      <div className="brand-pill">
        <Shield size={14} />
        <span>Verified Profile</span>
      </div>

      <h2 style={{ marginBottom: '0.5rem' }}>Your Account</h2>
      <p style={{ marginBottom: '1.75rem' }}>
        Profile details verified with Google OAuth & LeetCode.
      </p>

      <div className="profile-stat-box">
        <div className="profile-stat-row">
          <span className="profile-stat-label">Name</span>
          <span className="profile-stat-value">{user?.name}</span>
        </div>
        <div className="profile-stat-row">
          <span className="profile-stat-label">Email</span>
          <span className="profile-stat-value">{user?.email}</span>
        </div>
        <div className="profile-stat-row">
          <span className="profile-stat-label">Account ID</span>
          <span className="profile-stat-value" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {user?.id}
          </span>
        </div>
        <div className="profile-stat-row">
          <span className="profile-stat-label">LeetCode Status</span>
          <div>
            {user?.leetcodeUsername ? (
              <span className="badge badge-success">
                <CheckCircle2 size={12} />
                <span>Linked & Verified</span>
              </span>
            ) : (
              <span className="badge badge-warning">
                <span>Not Linked</span>
              </span>
            )}
          </div>
        </div>
        {user?.leetcodeUsername && (
          <div className="profile-stat-row">
            <span className="profile-stat-label">LeetCode Username</span>
            <a
              href={`https://leetcode.com/u/${user.leetcodeUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-stat-value"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <span>{user.leetcodeUsername}</span>
              <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {user?.leetcodeUsername ? (
          <button
            onClick={() => setEditingHandle(true)}
            className="btn btn-secondary"
            id="change-handle-btn"
          >
            <RefreshCw size={16} />
            <span>Change LeetCode Handle</span>
          </button>
        ) : (
          <button
            onClick={() => setEditingHandle(true)}
            className="btn btn-primary"
            id="link-handle-btn"
          >
            <Flame size={16} />
            <span>Link LeetCode Account</span>
          </button>
        )}
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>Ready for Module 2: Daily email streak reminders via Brevo</span>
      </div>
    </div>
  );
}
