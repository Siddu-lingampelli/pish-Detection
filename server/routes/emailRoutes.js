import express from 'express';
import emailAnalysisService from '../services/emailAnalysisService.js';

const router = express.Router();

/**
 * POST /api/email/analyze
 * Analyze email for phishing indicators
 */
router.post('/analyze', async (req, res) => {
  try {
    const { emailContent, senderEmail, subject } = req.body;

    if (!emailContent || typeof emailContent !== 'string') {
      return res.status(400).json({
        error: 'Email content is required'
      });
    }

    console.log(`📧 Analyzing email (${emailContent.length} characters)`);

    const analysis = await emailAnalysisService.analyzeEmail(
      emailContent,
      senderEmail,
      subject
    );

    res.json({
      success: true,
      ...analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Email analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze email',
      details: error.message
    });
  }
});

/**
 * GET /api/email/test
 * Health check endpoint
 */
router.get('/test', (req, res) => {
  res.json({
    status: 'Email analysis service is ready',
    powered_by: 'GPT-4o AI'
  });
});

export default router;
