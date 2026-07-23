import express from 'express';
import phishingDetectionService from '../services/phishingDetectionService.js';
import mistralExplanationService from '../services/mistralExplanationService.js';
import urlscanService from '../services/urlscanService.js';

const router = express.Router();

const scans = [];
const MAX_SCANS = 1000;

const BLOCKED_HOSTS = new Set(['127.0.0.1', 'localhost', '0.0.0.0', '::1', '[::1]']);
const BLOCKED_HOST_PARTS = ['10.', '172.16.', '192.168.', '169.254.'];
const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

const ipHits = new Map();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 30;

function rateLimit(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const rec = ipHits.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > rec.resetAt) {
    rec.count = 0;
    rec.resetAt = now + RATE_WINDOW_MS;
  }
  rec.count++;
  ipHits.set(ip, rec);
  if (rec.count > RATE_MAX) {
    return res.status(429).json({ success: false, message: 'Too many requests. Slow down.' });
  }
  next();
}

function isPrivateIPv4(hostname) {
  const m = IPV4_RE.exec(hostname);
  if (!m) return false;
  const octets = m.slice(1).map(Number);
  if (octets.some(o => o > 255)) return false;
  if (octets[0] === 10) return true;
  if (octets[0] === 127) return true;
  if (octets[0] === 0) return true;
  if (octets[0] === 169 && octets[1] === 254) return true;
  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
  if (octets[0] === 192 && octets[1] === 168) return true;
  if (octets[0] >= 224) return true; // multicast/reserved
  return false;
}

function isBlockedHost(hostname) {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (BLOCKED_HOSTS.has(h)) return true;
  if (isPrivateIPv4(h)) return true;
  if (h === '::1' || h.startsWith('fc') || h.startsWith('fd')) return true;
  return false;
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

router.post('/scan', rateLimit, async (req, res) => {
  try {
    const { url } = req.body;

    if (typeof url !== 'string') {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    const cleanUrl = url.trim();
    if (cleanUrl.length === 0) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }
    if (cleanUrl.length > 2048) {
      return res.status(400).json({ success: false, message: 'URL too long' });
    }

    if (!/^https?:\/\//i.test(cleanUrl)) {
      return res.status(400).json({ success: false, message: 'URL must start with http:// or https://' });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(cleanUrl);
      if (!/^[a-z0-9.\-:[\]]+$/i.test(parsedUrl.hostname)) {
        return res.status(400).json({ success: false, message: 'Invalid hostname' });
      }
      if (isBlockedHost(parsedUrl.hostname)) {
        return res.status(400).json({ success: false, message: 'Cannot scan internal addresses' });
      }
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid URL' });
    }

    const detectionResult = await phishingDetectionService.detectPhishing(cleanUrl);

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
    }

    const record = {
      _id: genId(),
      url: cleanUrl,
      result: detectionResult.result,
      confidence_score: detectionResult.confidence_score,
      meta_data: detectionResult.meta_data,
      scan_duration: detectionResult.scan_duration,
      created_at: new Date()
    };
    scans.unshift(record);
    if (scans.length > MAX_SCANS) scans.length = MAX_SCANS;

    res.status(200).json({
      success: true,
      message: 'URL scanned successfully',
      data: { ...record, ai_explanation: aiExplanation }
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ success: false, message: 'Error scanning URL' });
  }
});

router.get('/urlscan/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    if (typeof scanId !== 'string' || scanId.length > 256) {
      return res.status(400).json({ success: false, message: 'Invalid scan ID' });
    }

    const results = await urlscanService.getResults(scanId);

    if (!results.success) {
      return res.status(results.pending ? 202 : 404).json({
        success: false, message: results.error, pending: results.pending || false
      });
    }

    res.status(200).json({ success: true, message: 'URLScan.io results retrieved successfully', data: results });

  } catch (error) {
    console.error('URLScan results error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving URLScan.io results' });
  }
});

router.get('/history', (req, res) => {
  try {
    const { limit = 50, page = 1, result } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));

    let filtered = scans;
    if (result && ['Legit', 'Suspicious', 'Phishing'].includes(result)) {
      filtered = scans.filter(s => s.result === result);
    }

    const total = filtered.length;
    const paged = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      success: true, message: 'Scan history retrieved successfully',
      data: {
        scans: paged,
        pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) || 1 }
      }
    });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving scan history' });
  }
});

router.get('/stats', (req, res) => {
  try {
    const totalScans = scans.length;
    const legit = scans.filter(s => s.result === 'Legit').length;
    const suspicious = scans.filter(s => s.result === 'Suspicious').length;
    const phishing = scans.filter(s => s.result === 'Phishing').length;

    const percentages = {
      legit: totalScans > 0 ? +((legit / totalScans) * 100).toFixed(2) : 0,
      suspicious: totalScans > 0 ? +((suspicious / totalScans) * 100).toFixed(2) : 0,
      phishing: totalScans > 0 ? +((phishing / totalScans) * 100).toFixed(2) : 0
    };

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const recentScans = scans.filter(s => new Date(s.created_at) >= sevenDaysAgo).length;

    const totalDuration = scans.reduce((a, s) => a + (Number(s.scan_duration) || 0), 0);
    const avgScanDuration = totalScans > 0
      ? +(totalDuration / totalScans).toFixed(2)
      : 0;

    const riskFactorCount = {};
    scans.forEach(s => (s.meta_data?.risk_factors || []).forEach(f => { riskFactorCount[f] = (riskFactorCount[f] || 0) + 1; }));
    const topRiskFactors = Object.entries(riskFactorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([factor, count]) => ({ factor, count }));

    res.status(200).json({
      success: true, message: 'Statistics retrieved successfully',
      data: { totalScans, counts: { legit, suspicious, phishing }, percentages, recentScans: { last7Days: recentScans }, avgScanDuration, topRiskFactors }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving statistics' });
  }
});

router.delete('/history/:id', (req, res) => {
  try {
    const { id } = req.params;
    const idx = scans.findIndex(s => s._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Scan record not found' });
    }
    const deleted = scans.splice(idx, 1)[0];
    res.status(200).json({ success: true, message: 'Scan record deleted successfully', data: deleted });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Error deleting scan record' });
  }
});

router.delete('/history', (req, res) => {
  try {
    const deletedCount = scans.length;
    scans.length = 0;
    res.status(200).json({ success: true, message: 'All scan history cleared successfully', data: { deletedCount } });

  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ success: false, message: 'Error clearing scan history' });
  }
});

export default router;