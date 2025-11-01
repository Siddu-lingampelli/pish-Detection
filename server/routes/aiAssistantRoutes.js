import express from 'express';
import aiAssistantService from '../services/aiAssistantService.js';

const router = express.Router();

/**
 * POST /api/ai-assistant/chat
 * Chat with AI security assistant
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required and must be a string' 
      });
    }

    console.log(`💬 AI Assistant query: "${message.substring(0, 50)}..."`);

    const reply = await aiAssistantService.chat(message, conversationHistory || []);

    res.json({
      success: true,
      reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI Assistant error:', error.message);
    res.status(500).json({ 
      error: 'Failed to process your question. Please try again.',
      details: error.message 
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
    powered_by: 'Mistral AI'
  });
});

export default router;
