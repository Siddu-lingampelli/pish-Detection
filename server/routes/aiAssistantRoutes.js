import express from 'express';
import aiAssistantService from '../services/aiAssistantService.js';

// Per-IP rate limiter for AI assistant to prevent API credit drain
const aiHits = new Map();
const AI_RATE_WINDOW_MS = 60 * 1000;
const AI_RATE_MAX = 10;
const AI_MAP_MAX_SIZE = 5000;

setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of aiHits) {
    if (now > rec.resetAt) aiHits.delete(ip);
  }
  if (aiHits.size > AI_MAP_MAX_SIZE) {
    const entries = [...aiHits.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
    for (const [ip] of entries.slice(0, entries.length - AI_MAP_MAX_SIZE / 2)) aiHits.delete(ip);
  }
}, 5 * 60 * 1000).unref();

function aiRateLimit(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  let rec = aiHits.get(ip);
  if (!rec || now > rec.resetAt) rec = { count: 0, resetAt: now + AI_RATE_WINDOW_MS };
  rec.count++;
  aiHits.set(ip, rec);
  if (rec.count > AI_RATE_MAX) {
    return res.status(429).json({ success: false, error: 'Rate limit: max 10 AI queries per minute' });
  }
  next();
}

const router = express.Router();

/**
 * POST /api/ai-assistant/chat
 * Chat with AI security assistant
 */
router.post('/chat', aiRateLimit, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }
    if (message.length > 4000) {
      return res.status(400).json({ error: 'Message too long (max 4000 chars)' });
    }
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return res.status(400).json({ error: 'conversationHistory must be an array' });
    }

    console.log('AI Assistant query: ' + message.length + ' chars');

    const reply = await aiAssistantService.chat(message, conversationHistory || []);

    res.json({
      success: true,
      reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Assistant error:', error?.message || 'unknown');
    res.status(500).json({
      error: 'Failed to process your question. Please try again.'
    });
  }
});

/**
 * GET /api/ai-assistant/test
 * Health check endpoint
 */
router.get('/test', (req, res) => {
  res.json({
    status: 'AI Assistant is ready',
    powered_by: 'Cerebras AI (gpt-oss-120b)'
  });
});

export default router;
