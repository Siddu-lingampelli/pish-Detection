import express from 'express';
import multer from 'multer';
import screenshotAnalysisService from '../services/screenshotAnalysisService.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

/**
 * POST /api/screenshot/analyze
 * Analyze a screenshot for phishing indicators
 */
router.post('/analyze', upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No screenshot file provided'
      });
    }

    console.log(`📸 Analyzing screenshot: ${req.file.originalname} (${req.file.size} bytes)`);

    // Perform analysis
    const result = await screenshotAnalysisService.analyzeScreenshot(req.file.buffer);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Analysis failed'
      });
    }

    // Return analysis results
    res.json({
      success: true,
      data: {
        filename: req.file.originalname,
        fileSize: req.file.size,
        analysis: result.analysis,
        duration: result.duration,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Screenshot analysis route error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze screenshot'
    });
  }
});

/**
 * GET /api/screenshot/test
 * Test endpoint
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Screenshot analysis API is running',
    endpoints: {
      analyze: 'POST /api/screenshot/analyze'
    }
  });
});

export default router;
