import { BrevoClient } from '@getbrevo/brevo';

/**
 * Helper to get the configured Brevo client instance.
 */
function getBrevoClient() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || apiKey === 'your_brevo_api_key_here') {
    return null;
  }
  return new BrevoClient({ apiKey });
}

const SENDER = {
  name: 'LeetStreak',
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@leetstreak.com'
};

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

/**
 * Sends daily reminder email to a user.
 * Never throws — catches all errors and returns { success, error }.
 */
export async function sendDailyReminderEmail({ to, name, username, solvedToday, solvedPOTD, potd }) {
  try {
    if (!to) {
      return { success: false, error: 'Recipient email is required' };
    }

    const client = getBrevoClient();
    if (!client) {
      console.warn('sendDailyReminderEmail: BREVO_API_KEY is not configured.');
      return { success: false, error: 'BREVO_API_KEY is not configured' };
    }

    let statusHeading = '';
    let statusMessage = '';

    if (!solvedToday) {
      statusHeading = '⚠️ Streak At Risk!';
      statusMessage = "You haven't solved any problem today yet. Don't let your streak reset to zero!";
    } else if (solvedToday && !solvedPOTD) {
      statusHeading = '⚡ Daily Challenge Incomplete';
      statusMessage = "You solved a problem today, but haven't completed the Daily Challenge yet.";
    } else {
      statusHeading = '🎉 Keep Up The Great Work!';
      statusMessage = "You're doing awesome today! Ready for another challenge?";
    }

    const potdTitle = potd?.title || 'Today\'s Daily Coding Challenge';
    const potdDifficulty = potd?.difficulty || 'Medium';
    const potdLink = potd?.link ? (potd.link.startsWith('http') ? potd.link : `https://leetcode.com${potd.link}`) : 'https://leetcode.com/problemset/all/';

    let diffBadgeColor = '#FFC01E';
    if (potdDifficulty.toLowerCase() === 'easy') diffBadgeColor = '#00B8A3';
    if (potdDifficulty.toLowerCase() === 'hard') diffBadgeColor = '#FF375F';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LeetStreak Reminder</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121212; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #d1d5db;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121212; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" style="max-width: 560px; background-color: #1e1e1e; border: 1px solid #333333; border-radius: 12px; overflow: hidden; padding: 28px 24px;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 20px; border-bottom: 1px solid #2e2e2e;">
              <table width="100%">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      Leet<span style="color: #ffa116;">Streak</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 12px; color: #8c8c8c; background: #262626; border: 1px solid #383838; padding: 4px 8px; border-radius: 6px;">
                      ${username ? `@${username}` : 'Streak Reminder'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding-top: 24px;">
              <h2 style="margin: 0 0 10px; font-size: 18px; color: #ffffff;">Hi ${name || 'Coder'},</h2>
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #e5e7eb;">
                <strong>${statusHeading}</strong><br />
                ${statusMessage}
              </p>
            </td>
          </tr>

          <!-- POTD Card -->
          <tr>
            <td style="padding: 16px 0;">
              <div style="background-color: #161616; border: 1px solid #333333; border-radius: 8px; padding: 18px;">
                <div style="font-size: 11px; text-transform: uppercase; color: #8c8c8c; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 8px;">
                  Problem of the Day
                </div>
                <div style="font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 8px;">
                  ${potdTitle}
                </div>
                <div style="margin-bottom: 16px;">
                  <span style="display: inline-block; font-size: 11px; font-weight: 600; color: ${diffBadgeColor}; background-color: rgba(255, 255, 255, 0.05); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    ${potdDifficulty}
                  </span>
                </div>
                <div>
                  <a href="${potdLink}" target="_blank" style="display: inline-block; background-color: #ffa116; color: #1a1a1a; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 6px;">
                    Solve Challenge &rarr;
                  </a>
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 20px; border-top: 1px solid #2e2e2e; font-size: 12px; color: #71717a; line-height: 1.5;">
              You're receiving this because you enabled reminders on LeetStreak.
              Update preferences at <a href="${APP_URL}" style="color: #ffa116; text-decoration: underline;">${APP_URL}</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await client.transactionalEmails.sendTransacEmail({
      subject: "LeetStreak: Don't break your streak! 🔥",
      htmlContent,
      sender: SENDER,
      to: [{ email: to, name: name || 'Coder' }]
    });

    return { success: true };
  } catch (err) {
    console.error('sendDailyReminderEmail error:', err.message || err);
    return { success: false, error: err.message || 'Failed to send email' };
  }
}

/**
 * Sends contest alert email to a user.
 * Never throws — catches all errors and returns { success, error }.
 */
export async function sendContestAlertEmail({ to, name, contests = [] }) {
  try {
    if (!to) {
      return { success: false, error: 'Recipient email is required' };
    }

    const client = getBrevoClient();
    if (!client) {
      console.warn('sendContestAlertEmail: BREVO_API_KEY is not configured.');
      return { success: false, error: 'BREVO_API_KEY is not configured' };
    }

    const contestRows = contests.map((c) => {
      const startTimeIST = new Date(c.startTime * 1000).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      const durationHours = (c.duration / 3600).toFixed(1).replace('.0', '');
      const contestUrl = `https://leetcode.com/contest/${c.titleSlug}`;

      return `
        <div style="background-color: #161616; border: 1px solid #333333; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          <table width="100%">
            <tr>
              <td>
                <h3 style="margin: 0 0 6px; font-size: 15px; color: #ffffff; font-weight: 600;">${c.title}</h3>
                <div style="font-size: 13px; color: #9ca3af; margin-bottom: 12px;">
                  🗓️ <strong>${startTimeIST} (IST)</strong> &bull; ⏳ Duration: ${durationHours} hours
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <a href="${contestUrl}" target="_blank" style="display: inline-block; background-color: #ffa116; color: #1a1a1a; font-size: 12px; font-weight: 600; text-decoration: none; padding: 8px 16px; border-radius: 6px;">
                  Register / Enter Contest &rarr;
                </a>
              </td>
            </tr>
          </table>
        </div>
      `;
    }).join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LeetStreak Contest Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #121212; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #d1d5db;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #121212; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" style="max-width: 560px; background-color: #1e1e1e; border: 1px solid #333333; border-radius: 12px; overflow: hidden; padding: 28px 24px;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 20px; border-bottom: 1px solid #2e2e2e;">
              <span style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                Leet<span style="color: #ffa116;">Streak</span>
              </span>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding-top: 24px; padding-bottom: 16px;">
              <h2 style="margin: 0 0 8px; font-size: 18px; color: #ffffff;">Hi ${name || 'Coder'},</h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #e5e7eb;">
                You have upcoming LeetCode contests starting in the next 24 hours! Get ready to test your problem-solving skills.
              </p>
            </td>
          </tr>

          <!-- Contests List -->
          <tr>
            <td>
              ${contestRows || '<p style="color: #9ca3af; font-size: 13px;">No contests scheduled.</p>'}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 20px; border-top: 1px solid #2e2e2e; font-size: 12px; color: #71717a; line-height: 1.5;">
              You're receiving this because you enabled reminders on LeetStreak.
              Update preferences at <a href="${APP_URL}" style="color: #ffa116; text-decoration: underline;">${APP_URL}</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await client.transactionalEmails.sendTransacEmail({
      subject: 'LeetStreak: Contest starting soon! 🏆',
      htmlContent,
      sender: SENDER,
      to: [{ email: to, name: name || 'Coder' }]
    });

    return { success: true };
  } catch (err) {
    console.error('sendContestAlertEmail error:', err.message || err);
    return { success: false, error: err.message || 'Failed to send contest email' };
  }
}
