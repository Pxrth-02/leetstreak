import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/authenticate.js';
import { verifyUsername } from '../services/leetcode.js';

const router = express.Router();

// Apply authenticate middleware to all user routes
router.use(authenticate);

/**
 * GET /api/user/me
 * Returns current user's profile
 */
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      leetcodeUsername: user.leetcodeUsername
    });
  } catch (error) {
    console.error('Get /me Error:', error);
    return res.status(500).json({ error: 'Internal server error fetching user profile' });
  }
});

/**
 * POST /api/user/leetcode-username
 * Body: { leetcodeUsername: string }
 * Verifies with LeetCode GraphQL and saves if valid
 */
router.post('/leetcode-username', async (req, res) => {
  try {
    const { leetcodeUsername } = req.body;
    if (!leetcodeUsername || typeof leetcodeUsername !== 'string' || !leetcodeUsername.trim()) {
      return res.status(400).json({ error: 'Valid LeetCode username is required' });
    }

    const trimmed = leetcodeUsername.trim();

    // Verify against LeetCode GraphQL
    const verification = await verifyUsername(trimmed);
    if (!verification.valid) {
      return res.status(400).json({
        error: verification.error || `LeetCode user '${trimmed}' does not exist.`
      });
    }

    // Save leetcodeUsername on user
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { leetcodeUsername: verification.username || trimmed },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      leetcodeUsername: updatedUser.leetcodeUsername
    });
  } catch (error) {
    console.error('Update LeetCode Username Error:', error);
    return res.status(500).json({ error: 'Failed to update LeetCode username' });
  }
});

export default router;
