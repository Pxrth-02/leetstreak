import cron from 'node-cron';
import User from '../models/User.js';
import {
  fetchRecentSubmissions,
  fetchPOTD,
  fetchUpcomingContests,
  hasSolvedToday,
  hasSolvedPOTD
} from './leetcode.js';
import {
  sendDailyReminderEmail,
  sendContestAlertEmail
} from './email.js';

/**
 * Computes the current IST (UTC+5:30) time formatted as HH:MM snapped to :00 or :30.
 */
export function getCurrentISTTime() {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);

  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const snappedMinutes = minutes >= 15 && minutes < 45 ? '30' : '00';
  let snappedHours = hours;
  if (minutes >= 45) {
    snappedHours = (hours + 1) % 24;
  }

  return `${String(snappedHours).padStart(2, '0')}:${snappedMinutes}`;
}

/**
 * Executes a reminder check for all active users whose reminderTime matches current IST.
 */
export async function checkDailyReminders() {
  try {
    const currentIST = getCurrentISTTime();
    const users = await User.find({
      'notificationPreferences.reminderTime': currentIST,
      isActive: true,
      leetcodeUsername: { $ne: null }
    });

    console.log(`Scheduler: checking IST ${currentIST} — found ${users.length} users`);

    for (const user of users) {
      try {
        const prefs = user.notificationPreferences || {};
        const dailyReminderEnabled = prefs.dailyReminderEnabled !== false;
        const potdReminderEnabled = prefs.potdReminderEnabled !== false;

        // Skip if neither reminder is enabled
        if (!dailyReminderEnabled && !potdReminderEnabled) {
          continue;
        }

        const [recentRes, potdRes] = await Promise.all([
          fetchRecentSubmissions(user.leetcodeUsername),
          fetchPOTD()
        ]);

        const submissions = recentRes.success ? recentRes.submissions : [];
        const potd = potdRes.success ? potdRes.potd : null;

        const { solvedToday } = hasSolvedToday(submissions);
        const solvedPOTD = potd ? hasSolvedPOTD(submissions, potd.titleSlug) : false;

        // Trigger reminder if daily is enabled & not solved today, OR potd is enabled & not solved potd
        const shouldRemind = (!solvedToday && dailyReminderEnabled) || (potdReminderEnabled && !solvedPOTD);

        if (shouldRemind) {
          const recipientEmail = prefs.email || user.email;
          const result = await sendDailyReminderEmail({
            to: recipientEmail,
            name: user.name,
            username: user.leetcodeUsername,
            solvedToday,
            solvedPOTD,
            potd
          });
          console.log(`Scheduler: sent reminder to ${user.leetcodeUsername} (${recipientEmail}) — success: ${result.success}`);
        }
      } catch (userErr) {
        console.error(`Scheduler: error processing reminder for user ${user._id}:`, userErr.message || userErr);
      }
    }
  } catch (err) {
    console.error('Scheduler: error in checkDailyReminders:', err.message || err);
  }
}

/**
 * Executes contest alerts for contests starting within the next 24 hours.
 */
export async function checkContestAlerts() {
  try {
    const contestsRes = await fetchUpcomingContests();
    if (!contestsRes.success || !Array.isArray(contestsRes.contests)) {
      console.log('Scheduler: Unable to fetch upcoming contests for alert check.');
      return;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const in24HoursSec = nowSec + 24 * 3600;

    const upcomingIn24h = contestsRes.contests.filter((c) => {
      return c.startTime >= nowSec && c.startTime <= in24HoursSec;
    });

    if (upcomingIn24h.length === 0) {
      console.log('Scheduler: No contests starting within the next 24 hours.');
      return;
    }

    const users = await User.find({
      'notificationPreferences.contestAlertEnabled': true,
      isActive: true,
      leetcodeUsername: { $ne: null }
    });

    console.log(`Scheduler: sending contest alert for ${upcomingIn24h.length} contest(s) to ${users.length} users`);

    for (const user of users) {
      try {
        const recipientEmail = user.notificationPreferences?.email || user.email;
        const result = await sendContestAlertEmail({
          to: recipientEmail,
          name: user.name,
          contests: upcomingIn24h
        });
        console.log(`Scheduler: sent contest alert to ${user.leetcodeUsername} (${recipientEmail}) — success: ${result.success}`);
      } catch (userErr) {
        console.error(`Scheduler: error sending contest alert to user ${user._id}:`, userErr.message || userErr);
      }
    }
  } catch (err) {
    console.error('Scheduler: error in checkContestAlerts:', err.message || err);
  }
}

/**
 * Initializes all cron schedules.
 */
export function startScheduler() {
  console.log('Scheduler: initializing cron jobs...');

  // Half-hour reminders: at :00 and :30 of every hour (48 slots per day)
  cron.schedule('0 * * * *', () => {
    checkDailyReminders();
  });

  cron.schedule('30 * * * *', () => {
    checkDailyReminders();
  });

  // Contest alert cron: once daily at UTC 01:30 (= 7:00 AM IST)
  cron.schedule('30 1 * * *', () => {
    checkContestAlerts();
  });

  console.log('Scheduler: reminder and contest crons registered successfully.');
}
