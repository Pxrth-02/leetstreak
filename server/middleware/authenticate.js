import 'dotenv/config';
import jwt from 'jsonwebtoken';

/**
 * Express middleware to verify JWT in Authorization header.
 * Attaches req.userId on success.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header with Bearer token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'leetstreak_dev_jwt_secret_module1';
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
}
