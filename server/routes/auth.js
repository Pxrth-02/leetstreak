import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'leetstreak_dev_jwt_secret_module1';
const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * POST /api/auth/google
 * Body: { idToken: string }
 */
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    let googleId;
    let email;
    let name;

    const clientId = process.env.GOOGLE_CLIENT_ID;

    // Handle mock token for local developer testing when Google OAuth credentials are not yet configured
    if (idToken.startsWith('mock-') || !clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
      googleId = 'google_mock_' + (idToken.replace('mock-', '') || 'test_user');
      email = `${googleId}@example.com`;
      name = 'Test Developer';
    } else {
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(401).json({ error: 'Invalid Google ID token payload' });
      }
      googleId = payload.sub;
      email = payload.email;
      name = payload.name || payload.email;
    }

    // Find or create user
    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({
        googleId,
        email,
        name,
      });
    } else {
      user.name = name;
      user.email = email;
    }

    // Issue 15-minute access token
    const accessToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Issue random 64-byte refresh token
    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(rawRefreshToken, salt);

    user.refreshTokenHash = hashedRefreshToken;
    await user.save();

    // Set raw refresh token in httpOnly cookie
    // Store as userId:rawRefreshToken for fast O(1) user lookup while retaining raw token security
    const cookieValue = `${user._id}:${rawRefreshToken}`;

    res.cookie(REFRESH_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: REFRESH_MAX_AGE,
      path: '/'
    });

    return res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        leetcodeUsername: user.leetcodeUsername
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(401).json({ error: 'Google authentication failed: ' + (error.message || 'Unknown error') });
  }
});

/**
 * POST /api/auth/refresh
 * Reads refreshToken from httpOnly cookie, verifies it, and issues a new access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const cookieValue = req.cookies[REFRESH_COOKIE_NAME];
    if (!cookieValue) {
      return res.status(401).json({ error: 'Refresh token cookie missing' });
    }

    let user = null;
    let rawToken = cookieValue;

    if (cookieValue.includes(':')) {
      const [userId, tokenPart] = cookieValue.split(':');
      rawToken = tokenPart;
      user = await User.findById(userId);
    } else {
      // Fallback if raw token was stored without userId prefix
      const users = await User.find({ refreshTokenHash: { $ne: null }, isActive: true });
      for (const u of users) {
        const isMatch = await bcrypt.compare(cookieValue, u.refreshTokenHash);
        if (isMatch) {
          user = u;
          break;
        }
      }
    }

    if (!user || !user.refreshTokenHash || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Compare raw token against bcrypt hash
    const isValid = await bcrypt.compare(rawToken, user.refreshTokenHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Issue new 15-minute access token
    const accessToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({ accessToken });
  } catch (error) {
    console.error('Refresh Error:', error);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * POST /api/auth/logout
 * Clears refresh cookie and removes refreshTokenHash in DB
 */
router.post('/logout', async (req, res) => {
  try {
    const cookieValue = req.cookies[REFRESH_COOKIE_NAME];

    if (cookieValue) {
      if (cookieValue.includes(':')) {
        const [userId] = cookieValue.split(':');
        await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
      } else {
        const users = await User.find({ refreshTokenHash: { $ne: null } });
        for (const u of users) {
          const isMatch = await bcrypt.compare(cookieValue, u.refreshTokenHash);
          if (isMatch) {
            u.refreshTokenHash = null;
            await u.save();
            break;
          }
        }
      }
    }

    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({ error: 'Failed to log out' });
  }
});

export default router;
