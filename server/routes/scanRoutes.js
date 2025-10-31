import express from 'express';
import URLScan from '../models/URLScan.js';
import phishingDetectionService from '../services/phishingDetectionService.js';
import mistralExplanationService from '../services/mistralExplanationService.js';
import urlscanService from '../services/urlscanService.js';

const router = express.Router();

/**
 * POST /api/scan
 * Scan a URL for phishing detection
 */
router.post('/scan', async (req, res) => {
  try {
    const { url } = req.body;

    // Validate input
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    // Trim and validate URL
    const cleanUrl = url.trim();
    
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        message: 'URL must start with http:// or https://'
      });
    }

    console.log(`🔍 Scanning URL: ${cleanUrl}`);

    // Run phishing detection
    const detectionResult = await phishingDetectionService.detectPhishing(cleanUrl);

    // Generate AI explanation (async, doesn't block response)
    let aiExplanation = null;
    try {
      const explanationData = await mistralExplanationService.generateExplanation(cleanUrl, detectionResult);
      aiExplanation = {
        text: explanationData.explanation,
        generated_by: explanationData.generated_by || 'System',
        safety_tips: mistralExplanationService.generateSafetyTips(detectionResult.result)
      };
    } catch (error) {
      console.error('AI explanation error:', error.message);
      // Continue without explanation
    }

    // Save to database
    const urlScan = new URLScan({
      url: cleanUrl,
      result: detectionResult.result,
      confidence_score: detectionResult.confidence_score,
      meta_data: detectionResult.meta_data,
      scan_duration: detectionResult.scan_duration
    });

    await urlScan.save();

    console.log(`✅ Scan complete: ${detectionResult.result} (${(detectionResult.confidence_score * 100).toFixed(1)}%)`);

    // Return result
    res.status(200).json({
      success: true,
      message: 'URL scanned successfully',
      data: {
        _id: urlScan._id,
        url: urlScan.url,
        result: urlScan.result,
        confidence_score: urlScan.confidence_score,
        meta_data: urlScan.meta_data,
        scan_duration: urlScan.scan_duration,
        created_at: urlScan.created_at,
        ai_explanation: aiExplanation
      }
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error scanning URL',
      error: error.message
    });
  }
});

/**
 * GET /api/urlscan/:scanId
 * Get URLScan.io results for a specific scan
 */
router.get('/urlscan/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;

    console.log(`📊 Retrieving URLScan.io results for: ${scanId}`);

    const results = await urlscanService.getResults(scanId);

    if (!results.success) {
      return res.status(results.pending ? 202 : 404).json({
        success: false,
        message: results.error,
        pending: results.pending || false
      });
    }

    res.status(200).json({
      success: true,
      message: 'URLScan.io results retrieved successfully',
      data: results
    });

  } catch (error) {
    console.error('URLScan results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving URLScan.io results',
      error: error.message
    });
  }
});

/**
 * GET /api/history
 * Get all previous scans
 */
router.get('/history', async (req, res) => {
  try {
    const { limit = 50, page = 1, result } = req.query;

    // Build query
    const query = {};
    if (result && ['Legit', 'Suspicious', 'Phishing'].includes(result)) {
      query.result = result;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get scans with pagination
    const scans = await URLScan.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    // Get total count
    const totalCount = await URLScan.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Scan history retrieved successfully',
      data: {
        scans,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving scan history',
      error: error.message
    });
  }
});

/**
 * GET /api/stats
 * Get analytics and statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Get total scans
    const totalScans = await URLScan.countDocuments();

    // Get counts by result type
    const legitCount = await URLScan.countDocuments({ result: 'Legit' });
    const suspiciousCount = await URLScan.countDocuments({ result: 'Suspicious' });
    const phishingCount = await URLScan.countDocuments({ result: 'Phishing' });

    // Calculate percentages
    const percentages = {
      legit: totalScans > 0 ? ((legitCount / totalScans) * 100).toFixed(2) : 0,
      suspicious: totalScans > 0 ? ((suspiciousCount / totalScans) * 100).toFixed(2) : 0,
      phishing: totalScans > 0 ? ((phishingCount / totalScans) * 100).toFixed(2) : 0
    };

    // Get recent scans (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentScans = await URLScan.countDocuments({
      created_at: { $gte: sevenDaysAgo }
    });

    // Get average scan duration
    const avgScanResult = await URLScan.aggregate([
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$scan_duration' }
        }
      }
    ]);

    const avgScanDuration = avgScanResult.length > 0 
      ? avgScanResult[0].avgDuration.toFixed(2) 
      : 0;

    // Get most common risk factors
    const riskFactorsResult = await URLScan.aggregate([
      { $unwind: '$meta_data.risk_factors' },
      { 
        $group: { 
          _id: '$meta_data.risk_factors', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        totalScans,
        counts: {
          legit: legitCount,
          suspicious: suspiciousCount,
          phishing: phishingCount
        },
        percentages,
        recentScans: {
          last7Days: recentScans
        },
        avgScanDuration: parseFloat(avgScanDuration),
        topRiskFactors: riskFactorsResult.map(item => ({
          factor: item._id,
          count: item.count
        }))
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving statistics',
      error: error.message
    });
  }
});

/**
 * DELETE /api/history/:id
 * Delete a specific scan record
 */
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedScan = await URLScan.findByIdAndDelete(id);

    if (!deletedScan) {
      return res.status(404).json({
        success: false,
        message: 'Scan record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Scan record deleted successfully',
      data: deletedScan
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting scan record',
      error: error.message
    });
  }
});

/**
 * DELETE /api/history
 * Clear all scan history
 */
router.delete('/history', async (req, res) => {
  try {
    const result = await URLScan.deleteMany({});

    res.status(200).json({
      success: true,
      message: 'All scan history cleared successfully',
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing scan history',
      error: error.message
    });
  }
});

export default router;
