import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/authenticate.js';
import {
  fetchUserStats,
  fetchRecentSubmissions,
  fetchSubmissionCalendar,
  fetchPOTD,
  fetchUpcomingContests,
  hasSolvedToday,
  hasSolvedPOTD
} from '../services/leetcode.js';

const router = express.Router();

// All routes require authenticate middleware
router.use(authenticate);

/**
 * GET /api/leetcode/dashboard
 * Aggregates user stats, recent submissions, calendar, POTD, and solve status.
 */
router.get('/dashboard', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.leetcodeUsername) {
      return res.status(400).json({ error: 'No LeetCode account linked' });
    }

    const username = user.leetcodeUsername;

    // Fetch data in parallel
    const [statsResult, recentResult, calendarResult, potdResult] = await Promise.all([
      fetchUserStats(username),
      fetchRecentSubmissions(username),
      fetchSubmissionCalendar(username),
      fetchPOTD()
    ]);

    const submissions = recentResult.success ? recentResult.submissions : [];
    const calendar = calendarResult.success ? calendarResult.calendar : {};
    const potd = potdResult.success ? potdResult.potd : null;

    const { solvedToday, todayCount } = hasSolvedToday(submissions, calendar);
    const solvedPOTD = potd ? hasSolvedPOTD(submissions, potd.titleSlug) : false;

    return res.json({
      username,
      stats: statsResult.success ? statsResult.stats : {
        solved: { easy: 0, medium: 0, hard: 0, total: 0 },
        globalRanking: null,
        contest: {
          rating: null,
          globalRanking: null,
          topPercentage: null,
          attendedContestsCount: null
        }
      },
      recentSubmissions: submissions,
      calendar,
      potd,
      solvedToday,
      solvedPOTD,
      todayCount
    });
  } catch (error) {
    console.error('LeetCode Dashboard Route Error:', error);
    return res.status(500).json({ error: 'Failed to fetch LeetCode dashboard data' });
  }
});

/**
 * GET /api/leetcode/contests
 * Returns upcoming contests
 */
router.get('/contests', async (req, res) => {
  try {
    const result = await fetchUpcomingContests();
    if (!result.success) {
      return res.status(500).json({ error: result.error || 'Failed to fetch contests' });
    }
    return res.json({ contests: result.contests || [] });
  } catch (error) {
    console.error('LeetCode Contests Route Error:', error);
    return res.status(500).json({ error: 'Failed to fetch upcoming contests' });
  }
});

export default router;
