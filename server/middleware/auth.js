import jwt from 'jsonwebtoken';
import { COOKIE_NAME } from '../utils/cookies.js';

export function verifyToken(req, res, next) {
  // Try to get token from cookies first (most secure for httpOnly)
  let token = req.cookies?.[COOKIE_NAME];
  let source = 'cookie';

  // Fallback to Authorization header (for cross-domain scenarios)
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
      source = 'Authorization header';
    }
  }

  if (!token) {
    console.log('❌ No token found:', {
      url: req.originalUrl,
      method: req.method,
      cookies: req.cookies,
      authHeader: req.headers.authorization ? 'present' : 'missing',
    });
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, email: payload.email };
    console.log('✅ Token verified from', source, ':', { userId: payload.id, email: payload.email });
    next();
  } catch (err) {
    console.log('❌ Token verification failed:', { source, error: err.message });
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
