import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';
import { verifyToken } from '../middleware/auth.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies.js';

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitizeUser(row) {
  const { password_hash, ...user } = row;
  return user;
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    console.log('📝 Register attempt:', { name, email });

    if (!name?.trim() || !email?.trim() || !password) {
      console.log('❌ Missing registration fields');
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      console.log('❌ Password too short:', { email });
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, avatar_url, created_at`,
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const user = result.rows[0];
    const token = signToken(user);
    setAuthCookie(res, token);

    console.log('✅ Registration successful:', { userId: user.id, email: user.email });

    // Return both token and user for cross-domain auth fallback
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === '23505') {
      console.log('❌ Email already registered:', { email: req.body.email });
      return res.status(409).json({ message: 'Email already registered' });
    }
    console.error('❌ Register error:', err);
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('📝 Login attempt:', { email });

    if (!email?.trim() || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, name, email, avatar_url, password_hash, created_at FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    const row = result.rows[0];
    if (!row) {
      console.log('❌ User not found:', { email });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      console.log('❌ Invalid password:', { email });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = sanitizeUser(row);
    const token = signToken(user);
    setAuthCookie(res, token);

    console.log('✅ Login successful:', { userId: user.id, email: user.email, tokenLength: token.length });

    // Return both token and user for cross-domain auth fallback
    res.json({ user, token });
  } catch (err) {
    console.error('❌ Login error:', err);
    next(err);
  }
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', verifyToken, async (req, res, next) => {
  try {
    console.log('📝 Fetching user info:', { userId: req.user.id });
    const result = await pool.query(
      'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = result.rows[0];
    if (!user) {
      console.log('❌ User not found:', { userId: req.user.id });
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User info fetched:', { userId: user.id, email: user.email });
    res.json({ user });
  } catch (err) {
    console.error('❌ Fetch user error:', err);
    next(err);
  }
});

export default router;
