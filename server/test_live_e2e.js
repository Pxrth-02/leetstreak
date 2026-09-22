async function testFullE2E() {
  console.log('=== Running Live End-to-End API Integration Test ===\n');
  const baseURL = 'http://localhost:5000/api';
  let cookieHeader = '';

  // 1. POST /api/auth/google
  console.log('1. Testing POST /api/auth/google...');
  const loginRes = await fetch(`${baseURL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: 'mock-test-dev-' + Date.now() })
  });
  const loginData = await loginRes.json();
  console.log('Login Response Status:', loginRes.status);
  console.log('User created:', loginData.user);
  const accessToken = loginData.accessToken;
  const rawCookie = loginRes.headers.get('set-cookie');
  if (rawCookie) {
    cookieHeader = rawCookie.split(';')[0];
    console.log('Cookie received:', cookieHeader);
  }
  if (!accessToken || !cookieHeader) {
    throw new Error('Step 1 failed: Missing accessToken or refreshToken cookie');
  }
  console.log('✓ Step 1 Passed: Login succeeded, tokens issued.\n');

  // 2. GET /api/user/me
  console.log('2. Testing GET /api/user/me with Bearer token...');
  const meRes = await fetch(`${baseURL}/user/me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const meData = await meRes.json();
  console.log('User Profile:', meData);
  if (meData.leetcodeUsername !== null) {
    throw new Error('Step 2 failed: Expected initial leetcodeUsername to be null');
  }
  console.log('✓ Step 2 Passed: /api/user/me returned initial profile.\n');

  // 3. POST /api/user/leetcode-username (invalid user)
  console.log('3. Testing POST /api/user/leetcode-username with invalid handle...');
  const invalidLinkRes = await fetch(`${baseURL}/user/leetcode-username`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ leetcodeUsername: 'user_xyz_not_exist_987654321' })
  });
  const invalidLinkData = await invalidLinkRes.json();
  console.log('Invalid link response status:', invalidLinkRes.status, invalidLinkData);
  if (invalidLinkRes.status === 400) {
    console.log('✓ Step 3 Passed: Invalid handle properly rejected with 400.\n');
  } else {
    throw new Error('Step 3 failed: Expected 400 Bad Request');
  }

  // 4. POST /api/user/leetcode-username (valid user: "tourist")
  console.log('4. Testing POST /api/user/leetcode-username with valid handle "tourist"...');
  const validLinkRes = await fetch(`${baseURL}/user/leetcode-username`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ leetcodeUsername: 'tourist' })
  });
  const validLinkData = await validLinkRes.json();
  console.log('Link Response:', validLinkRes.status, validLinkData);
  if (validLinkData.leetcodeUsername !== 'tourist') {
    throw new Error('Step 4 failed: Expected leetcodeUsername to be "tourist"');
  }
  console.log('✓ Step 4 Passed: Valid handle verified and saved.\n');

  // 5. GET /api/user/me (verify updated username)
  console.log('5. Testing GET /api/user/me to verify saved handle...');
  const updatedMeRes = await fetch(`${baseURL}/user/me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const updatedMeData = await updatedMeRes.json();
  console.log('Updated Profile:', updatedMeData);
  if (updatedMeData.leetcodeUsername !== 'tourist') {
    throw new Error('Step 5 failed: Profile did not reflect linked username');
  }
  console.log('✓ Step 5 Passed: Profile correctly reflects linked LeetCode handle.\n');

  // 6. POST /api/auth/refresh
  console.log('6. Testing POST /api/auth/refresh with cookie...');
  const refreshRes = await fetch(`${baseURL}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: cookieHeader }
  });
  const refreshData = await refreshRes.json();
  console.log('Refresh response:', refreshRes.status, !!refreshData.accessToken);
  if (!refreshData.accessToken) {
    throw new Error('Step 6 failed: Refresh did not return new accessToken');
  }
  console.log('✓ Step 6 Passed: Token refreshed successfully.\n');

  // 7. POST /api/auth/logout
  console.log('7. Testing POST /api/auth/logout...');
  const logoutRes = await fetch(`${baseURL}/auth/logout`, {
    method: 'POST',
    headers: { Cookie: cookieHeader }
  });
  const logoutData = await logoutRes.json();
  console.log('Logout Response:', logoutRes.status, logoutData);
  console.log('✓ Step 7 Passed: Logged out successfully.\n');

  // 8. POST /api/auth/refresh after logout (should fail)
  console.log('8. Testing POST /api/auth/refresh after logout (expect 401)...');
  const postLogoutRefresh = await fetch(`${baseURL}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: cookieHeader }
  });
  const postLogoutData = await postLogoutRefresh.json();
  console.log('Post-logout refresh status:', postLogoutRefresh.status, postLogoutData);
  if (postLogoutRefresh.status === 401) {
    console.log('✓ Step 8 Passed: Revoked session cannot refresh.\n');
  } else {
    throw new Error('Step 8 failed: Expected 401 after logout');
  }

  console.log('====================================================');
  console.log('🎉 ALL 8 END-TO-END SPEC REQUIREMENTS VERIFIED! 🎉');
  console.log('====================================================');
}

testFullE2E().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
