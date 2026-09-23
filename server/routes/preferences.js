import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/user/preferences
 * Returns notification preferences for current user
 */
router.get('/preferences', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user.notificationPreferences || {
      email: null,
      dailyReminderEnabled: true,
      potdReminderEnabled: true,
      contestAlertEnabled: true,
      reminderTime: '19:00',
      timezone: 'Asia/Kolkata'
    });
  } catch (error) {
    console.error('Get Preferences Error:', error);
    return res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

/**
 * PATCH /api/user/preferences
 * Updates notification preferences
 */
router.patch('/preferences', async (req, res) => {
  try {
    const { reminderTime } = req.body;

    // Validate reminderTime if provided: HH 00-23, MM 00 or 30 only
    if (reminderTime !== undefined) {
      const timeRegex = /^([01]\d|2[0-3]):(00|30)$/;
      if (typeof reminderTime !== 'string' || !timeRegex.test(reminderTime)) {
        return res.status(400).json({
          error: 'Invalid reminderTime. Must be HH:MM in 24hr format with minute 00 or 30 (e.g. 19:00, 19:30).'
        });
      }
    }

    const allowedFields = [
      'email',
      'dailyReminderEnabled',
      'potdReminderEnabled',
      'contestAlertEnabled',
      'reminderTime',
      'timezone'
    ];

    const updateFields = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateFields[`notificationPreferences.${field}`] = req.body[field];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(updatedUser.notificationPreferences);
  } catch (error) {
    console.error('Update Preferences Error:', error);
    return res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;
