import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ExternalLink, RefreshCw, Flame, Shield, Bell, Sparkles, Mail } from 'lucide-react';
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
    <div className="card">
      <div className="brand-pill">
        <Shield size={14} />
        <span>Verified Profile</span>
      </div>

      <div className="profile-hero">
        <div className="profile-avatar-large">
          {getInitials(user?.name)}
        </div>
        <div className="profile-info-block">
          <div className="profile-name-text">{user?.name}</div>
          <div className="profile-email-text">{user?.email}</div>
          <div style={{ marginTop: '0.4rem' }}>
            <span className="badge badge-success">
              <CheckCircle2 size={12} />
              <span>Google Verified</span>
            </span>
          </div>
        </div>
      </div>

      <div className="profile-details-grid">
        <div className="profile-card-item">
          <span className="profile-card-label">Linked Handle</span>
          {user?.leetcodeUsername ? (
            <a
              href={`https://leetcode.com/u/${user.leetcodeUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-card-value"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--amber-primary)' }}
            >
              <span>{user.leetcodeUsername}</span>
              <ExternalLink size={14} />
            </a>
          ) : (
            <span className="badge badge-warning">Not Linked</span>
          )}
        </div>

        <div className="profile-card-item">
          <span className="profile-card-label">Verification Status</span>
          <span className="badge badge-success">
            <CheckCircle2 size={12} />
            <span>LeetCode Active</span>
          </span>
        </div>

        <div className="profile-card-item">
          <span className="profile-card-label">Account ID</span>
          <span className="profile-card-value" style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>
            {user?.id ? user.id.substring(0, 12) + '...' : '—'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {user?.leetcodeUsername ? (
          <button
            onClick={() => setEditingHandle(true)}
            className="btn btn-secondary"
            id="change-handle-btn"
          >
            <RefreshCw size={16} />
            <span>Update LeetCode Handle</span>
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

      {/* Module 2 Roadmap Preview */}
      <div className="coming-soon-box">
        <div className="coming-soon-title">
          <Sparkles size={16} />
          <span>Next: Module 2 Automation</span>
        </div>
        <div className="coming-soon-desc">
          Automated daily scans, Brevo email reminders when you haven't solved a problem, and streak recovery alerts!
        </div>
      </div>
    </div>
  );
}
