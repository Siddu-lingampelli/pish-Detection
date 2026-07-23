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
    if (emailContent.length > 100000) {
      return res.status(400).json({ error: 'Email content too large' });
    }
    if (senderEmail && typeof senderEmail !== 'string') {
      return res.status(400).json({ error: 'Invalid sender email' });
    }
    if (senderEmail && senderEmail.length > 254) {
      return res.status(400).json({ error: 'Sender email too long' });
    }
    if (subject && typeof subject !== 'string') {
      return res.status(400).json({ error: 'Invalid subject' });
    }
    if (subject && subject.length > 500) {
      return res.status(400).json({ error: 'Subject too long' });
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
      error: 'Failed to analyze email'
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
    powered_by: 'Cerebras AI (gpt-oss-120b)'
  });
});

export default router;
