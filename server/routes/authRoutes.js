import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set');
  process.exit(1);
}

const users = new Map();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    if (users.has(cleanEmail)) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      _id: Date.now().toString(36) + Math.random().toString(36).slice(2, 10),
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      createdAt: new Date()
    };
    users.set(cleanEmail, user);

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    console.log('New user registered:', cleanEmail);

    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = users.get(cleanEmail);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  try {
    const user = [...users.values()].find(u => u._id === req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });

  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;