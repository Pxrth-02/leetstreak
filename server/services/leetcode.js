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
