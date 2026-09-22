import { verifyUsername } from './services/leetcode.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

async function runTests() {
  console.log('=== Running Module 1 Verification Tests ===\n');

  // Test 1: LeetCode GraphQL with valid user
  console.log('Test 1: Verifying valid LeetCode user "tourist"...');
  const validResult = await verifyUsername('tourist');
  console.log('Result:', validResult);
  if (!validResult.valid || validResult.username.toLowerCase() !== 'tourist') {
    throw new Error('Test 1 failed: Expected valid user');
  }
  console.log('✓ Test 1 Passed: Valid user verified.\n');

  // Test 2: LeetCode GraphQL with invalid user
  console.log('Test 2: Verifying non-existent LeetCode user "user_xyz_not_exist_987654321"...');
  const invalidResult = await verifyUsername('user_xyz_not_exist_987654321');
  console.log('Result:', invalidResult);
  if (invalidResult.valid) {
    throw new Error('Test 2 failed: Expected invalid user to return valid: false');
  }
  console.log('✓ Test 2 Passed: Non-existent user rejected.\n');

  // Test 3: JWT Access Token creation & verification
  console.log('Test 3: Testing JWT generation and verification...');
  const secret = 'test_secret_key';
  const mockUserId = '654321098765432109876543';
  const token = jwt.sign({ userId: mockUserId }, secret, { expiresIn: '15m' });
  const decoded = jwt.verify(token, secret);
  if (decoded.userId !== mockUserId) {
    throw new Error('Test 3 failed: Decoded userId does not match');
  }
  console.log('✓ Test 3 Passed: JWT generation and verification succeeded.\n');

  // Test 4: Refresh token hashing & bcrypt validation
  console.log('Test 4: Testing Refresh Token hashing and bcrypt comparison...');
  const rawRefreshToken = crypto.randomBytes(64).toString('hex');
  const salt = await bcrypt.genSalt(10);
  const hashedToken = await bcrypt.hash(rawRefreshToken, salt);
  const match = await bcrypt.compare(rawRefreshToken, hashedToken);
  const mismatch = await bcrypt.compare('different_token', hashedToken);
  if (!match || mismatch) {
    throw new Error('Test 4 failed: Bcrypt comparison failed');
  }
  console.log('✓ Test 4 Passed: Refresh token hash and comparison succeeded.\n');

  console.log('=== All Module 1 Backend Tests Passed Successfully! ===');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
