import jwt from 'jsonwebtoken';
import { COOKIE_NAME } from '../utils/cookies.js';

export function verifyToken(req, res, next) {
  // Try to get token from cookies first (most secure for httpOnly)
  let token = req.cookies?.[COOKIE_NAME];

  // Fallback to Authorization header (for cross-domain scenarios)
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
