import https from 'node:https';

/**
 * Verifies if a LeetCode username exists using LeetCode's public GraphQL API.
 * @param {string} username - LeetCode username to verify
 * @returns {Promise<{ valid: boolean, username?: string, error?: string }>}
 */
export function verifyUsername(username) {
  return new Promise((resolve) => {
    if (!username || typeof username !== 'string' || !username.trim()) {
      return resolve({ valid: false, error: 'Username is required' });
    }

    const trimmedUsername = username.trim();
    const data = JSON.stringify({
      query: `query userPublicProfile($username: String!) {
        matchedUser(username: $username) { username }
      }`,
      variables: { username: trimmedUsername }
    });

    const options = {
      hostname: 'leetcode.com',
      port: 443,
      path: '/graphql',
      method: 'POST',
      family: 4, // Enforce IPv4 to avoid hanging on networks with misconfigured IPv6
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.data && parsed.data.matchedUser && parsed.data.matchedUser.username) {
            resolve({ valid: true, username: parsed.data.matchedUser.username });
          } else {
            resolve({ valid: false, error: 'LeetCode user not found' });
          }
        } catch (err) {
          resolve({ valid: false, error: 'Failed to parse response from LeetCode API' });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ valid: false, error: `Failed to connect to LeetCode: ${err.message}` });
    });

    // 10s timeout
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ valid: false, error: 'Connection to LeetCode timed out' });
    });

    req.write(data);
    req.end();
  });
}

/**
 * Common helper for LeetCode GraphQL requests adhering to IPv4, 10s timeout, resolve-never-reject pattern.
 */
function executeLeetCodeGraphQL(query, variables = {}) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ query, variables });
    const options = {
      hostname: 'leetcode.com',
      port: 443,
      path: '/graphql',
      method: 'POST',
      family: 4,
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ success: true, data: parsed.data, errors: parsed.errors });
        } catch (err) {
          resolve({ success: false, error: 'Failed to parse response from LeetCode API' });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: `Failed to connect to LeetCode: ${err.message}` });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ success: false, error: 'Connection to LeetCode timed out' });
    });

    req.write(data);
    req.end();
  });
}

/**
 * Fetches solved problem breakdown and contest ranking for a user.
 */
export async function fetchUserStats(username) {
  if (!username || typeof username !== 'string' || !username.trim()) {
    return { success: false, error: 'Username is required' };
  }

  const query = `query userStats($username: String!) {
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
      profile {
        ranking
      }
    }
    userContestRanking(username: $username) {
      rating
      globalRanking
      totalParticipants
      topPercentage
      attendedContestsCount
    }
  }`;

  const res = await executeLeetCodeGraphQL(query, { username: username.trim() });
  if (!res.success) return res;

  const matchedUser = res.data?.matchedUser;
  if (!matchedUser) {
    return { success: false, error: 'LeetCode user not found' };
  }

  const acSubmissionNum = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
  let easy = 0, medium = 0, hard = 0, total = 0;
  for (const item of acSubmissionNum) {
    const diff = (item.difficulty || '').toLowerCase();
    if (diff === 'easy') easy = item.count;
    else if (diff === 'medium') medium = item.count;
    else if (diff === 'hard') hard = item.count;
    else if (diff === 'all') total = item.count;
  }
  if (!total) total = easy + medium + hard;

  const globalRanking = matchedUser.profile?.ranking ?? null;
  const contestData = res.data?.userContestRanking;
  const contest = contestData ? {
    rating: contestData.rating !== undefined && contestData.rating !== null ? Math.round(contestData.rating) : null,
    globalRanking: contestData.globalRanking ?? null,
    topPercentage: contestData.topPercentage ?? null,
    attendedContestsCount: contestData.attendedContestsCount ?? null
  } : {
    rating: null,
    globalRanking: null,
    topPercentage: null,
    attendedContestsCount: null
  };

  return {
    success: true,
    stats: {
      solved: { easy, medium, hard, total },
      globalRanking,
      contest
    }
  };
}

/**
 * Fetches up to 20 recent AC submissions for a user.
 */
export async function fetchRecentSubmissions(username) {
  if (!username || typeof username !== 'string' || !username.trim()) {
    return { success: false, error: 'Username is required' };
  }

  const query = `query recentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
      lang
    }
  }`;

  const res = await executeLeetCodeGraphQL(query, { username: username.trim(), limit: 20 });
  if (!res.success) return res;

  return {
    success: true,
    submissions: res.data?.recentAcSubmissionList || []
  };
}

/**
 * Fetches submission calendar JSON for a user.
 */
export async function fetchSubmissionCalendar(username) {
  if (!username || typeof username !== 'string' || !username.trim()) {
    return { success: false, error: 'Username is required' };
  }

  const query = `query submissionCalendar($username: String!) {
    matchedUser(username: $username) {
      submissionCalendar
    }
  }`;

  const res = await executeLeetCodeGraphQL(query, { username: username.trim() });
  if (!res.success) return res;

  const rawCalendar = res.data?.matchedUser?.submissionCalendar;
  let calendar = {};
  if (rawCalendar) {
    try {
      calendar = typeof rawCalendar === 'string' ? JSON.parse(rawCalendar) : rawCalendar;
    } catch {
      calendar = {};
    }
  }

  return {
    success: true,
    calendar
  };
}

/**
 * Fetches Problem of the Day (POTD).
 */
export async function fetchPOTD() {
  const query = `query potd {
    activeDailyCodingChallengeQuestion {
      date
      link
      question {
        title
        titleSlug
        difficulty
      }
    }
  }`;

  const res = await executeLeetCodeGraphQL(query);
  if (!res.success) return res;

  const challenge = res.data?.activeDailyCodingChallengeQuestion;
  if (!challenge || !challenge.question) {
    return { success: false, error: 'Failed to retrieve active daily challenge' };
  }

  return {
    success: true,
    potd: {
      date: challenge.date,
      link: challenge.link,
      title: challenge.question.title,
      titleSlug: challenge.question.titleSlug,
      difficulty: challenge.question.difficulty
    }
  };
}

/**
 * Fetches upcoming contests.
 */
export async function fetchUpcomingContests() {
  const query = `query upcomingContests {
    upcomingContests {
      title
      titleSlug
      startTime
      duration
    }
  }`;

  const res = await executeLeetCodeGraphQL(query);
  if (!res.success) return res;

  return {
    success: true,
    contests: res.data?.upcomingContests || []
  };
}

/**
 * Helper — not an HTTP call, takes a submissions array and calendar object.
 * Returns { solvedToday: boolean, todayCount: number }
 */
export function hasSolvedToday(submissions = [], calendar = {}) {
  const now = new Date();
  const startOfDayUtc = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0) / 1000);
  const endOfDayUtc = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59) / 1000);

  let todayCount = 0;
  if (Array.isArray(submissions)) {
    for (const sub of submissions) {
      const ts = parseInt(sub.timestamp, 10);
      if (ts >= startOfDayUtc && ts <= endOfDayUtc) {
        todayCount++;
      }
    }
  }

  if (calendar && typeof calendar === 'object') {
    for (const [key, count] of Object.entries(calendar)) {
      const ts = parseInt(key, 10);
      if (ts >= startOfDayUtc && ts <= endOfDayUtc) {
        todayCount = Math.max(todayCount, Number(count) || 0);
      }
    }
  }

  return {
    solvedToday: todayCount > 0,
    todayCount
  };
}

/**
 * Helper — checks if any submission in submissions array matches potdTitleSlug.
 * Returns boolean.
 */
export function hasSolvedPOTD(submissions = [], potdTitleSlug) {
  if (!potdTitleSlug || !Array.isArray(submissions)) return false;
  return submissions.some((sub) => sub.titleSlug === potdTitleSlug);
}
