import express from 'express';
import crypto from 'crypto';
import phishingDetectionService from '../services/phishingDetectionService.js';
import aiExplanationService from '../services/aiExplanationService.js';
import urlscanService from '../services/urlscanService.js';
import { requireAuth } from '../middleware/auth.js';
import { getScans, addScan, clearScans, deleteScanById } from '../store.js';

const router = express.Router();
const BLOCKED_HOSTS = new Set(['127.0.0.1', 'localhost', '0.0.0.0', '::1', '[::1]']);
const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const HOSTNAME_RE = /^[a-z0-9.\-:[\]]+$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ipHits = new Map();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 30;
const CLEANUP_INTERVAL = 5 * 60 * 1000;
const MAP_MAX_SIZE = 10000;

setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of ipHits) {
    if (now > rec.resetAt + RATE_WINDOW_MS) ipHits.delete(ip);
  }
  // Prevent unbounded memory growth from many unique IPs
  if (ipHits.size > MAP_MAX_SIZE) {
    const entries = [...ipHits.entries()];
    const sorted = entries.sort((a, b) => a[1].resetAt - b[1].resetAt);
    const toDelete = sorted.slice(0, sorted.length - MAP_MAX_SIZE / 2);
    for (const [ip] of toDelete) ipHits.delete(ip);
  }
}, CLEANUP_INTERVAL).unref();

function rateLimit(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  let rec = ipHits.get(ip);
  if (!rec || now > rec.resetAt) {
    rec = { count: 0, resetAt: now + RATE_WINDOW_MS };
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
  if (octets[0] >= 224) return true;
  return false;
}

function isBlockedHost(hostname) {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (BLOCKED_HOSTS.has(h)) return true;
  if (isPrivateIPv4(h)) return true;
  if (h === '::1' || /^fc[0-9a-f]{2}:/i.test(h) || /^fd[0-9a-f]{2}:/i.test(h) || h === 'fe80:') return true;
  return false;
}

function genId() {
  return crypto.randomUUID();
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
      if (!HOSTNAME_RE.test(parsedUrl.hostname)) {
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
      const explanationData = await aiExplanationService.generateExplanation(cleanUrl, detectionResult);
      aiExplanation = {
        text: String(explanationData.explanation || '').slice(0, 4000),
        generated_by: String(explanationData.generated_by || 'System').slice(0, 100),
        safety_tips: aiExplanationService.generateSafetyTips(detectionResult.result)
      };
    } catch (error) {
      console.error('AI explanation error:', error?.message || 'unknown');
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
    addScan(record);

    res.status(200).json({
      success: true,
      message: 'URL scanned successfully',
      data: { ...record, ai_explanation: aiExplanation }
    });

  } catch (error) {
    console.error('Scan error:', error?.message || 'unknown');
    res.status(500).json({ success: false, message: 'Error scanning URL' });
  }
});

router.get('/urlscan/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    if (typeof scanId !== 'string' || !UUID_RE.test(scanId)) {
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
    console.error('URLScan results error:', error?.message || 'unknown');
    res.status(500).json({ success: false, message: 'Error retrieving URLScan.io results' });
  }
});

router.get('/history', requireAuth, (req, res) => {
  try {
    const scans = getScans();
    const { limit, page, result } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));

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
    console.error('History error:', error?.message || 'unknown');
    res.status(500).json({ success: false, message: 'Error retrieving scan history' });
  }
});

router.get('/stats', requireAuth, (req, res) => {
  try {
    const scans = getScans();
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
    const recentScans = scans.filter(s => {
      const t = new Date(s.created_at).getTime();
      return !Number.isNaN(t) && t >= sevenDaysAgo.getTime();
    }).length;

    const totalDuration = scans.reduce((a, s) => a + (Number(s.scan_duration) || 0), 0);
    const avgScanDuration = totalScans > 0 ? +(totalDuration / totalScans).toFixed(2) : 0;

    const riskFactorCount = Object.create(null);
    scans.forEach(s => (s.meta_data?.risk_factors || []).forEach(f => {
      if (typeof f === 'string' && f.length <= 200) {
        riskFactorCount[f] = (riskFactorCount[f] || 0) + 1;
      }
    }));
    const topRiskFactors = Object.entries(riskFactorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([factor, count]) => ({ factor, count }));

    res.status(200).json({
      success: true, message: 'Statistics retrieved successfully',
      data: { totalScans, counts: { legit, suspicious, phishing }, percentages, recentScans: { last7Days: recentScans }, avgScanDuration, topRiskFactors }
    });

  } catch (error) {
    console.error('Stats error:', error?.message || 'unknown');
    res.status(500).json({ success: false, message: 'Error retrieving statistics' });
  }
});

router.delete('/history/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string' || id.length > 64 || !/^[a-z0-9]+$/i.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }
    const deleted = deleteScanById(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Scan record not found' });
    }
    res.status(200).json({ success: true, message: 'Scan record deleted successfully', data: deleted });

  } catch (error) {
    console.error('Delete error:', error?.message || 'unknown');
    res.status(500).json({ success: false, message: 'Error deleting scan record' });
  }
});

router.delete('/history', requireAuth, (req, res) => {
  try {
    const deletedCount = clearScans();
    res.status(200).json({ success: true, message: 'All scan history cleared successfully', data: { deletedCount } });

  } catch (error) {
    console.error('Clear history error:', error?.message || 'unknown');
    res.status(500).json({ success: false, message: 'Error clearing scan history' });
  }
});

export default router;
