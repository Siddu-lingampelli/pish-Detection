import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth.js';
import { findUserByEmail, findUserById, addUser } from '../store.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set');
  process.exit(1);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function checkLoginRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, firstAt: now };
  if (now - record.firstAt > LOGIN_WINDOW_MS) {
    record.count = 0;
    record.firstAt = now;
  }
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    return false;
  }
  record.count++;
  loginAttempts.set(ip, record);
  return true;
}

function clearLoginAttempts(ip) {
  loginAttempts.delete(ip);
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) return res.status(400).json({ error: 'All fields are required' });
    if (cleanName.length > 100) return res.status(400).json({ error: 'Name too long' });
    if (!EMAIL_RE.test(cleanEmail)) return res.status(400).json({ error: 'Invalid email format' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (password.length > 200) return res.status(400).json({ error: 'Password too long' });

    if (findUserByEmail(cleanEmail)) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      _id: Date.now().toString(36) + Math.random().toString(36).slice(2, 10),
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      createdAt: new Date()
    };
    addUser(user);

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    if (!checkLoginRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
    }

    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length > 200) {
      return res.status(400).json({ error: 'Password too long' });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = findUserByEmail(cleanEmail);
    const dummyHash = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8D8E1Q8vQH8d8jN8qj8vQH8d8jN8qj';
    const isPasswordValid = await bcrypt.compare(password, user ? user.password : dummyHash);
    if (!user || !isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    clearLoginAttempts(ip);
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  try {
    const user = findUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });

  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
