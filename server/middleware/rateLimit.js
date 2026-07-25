/**
 * Shared per-IP rate limiter middleware factory
 * Use: router.get('/path', rateLimit({ windowMs: 60000, max: 30 }), handler)
 */

const hits = new Map();
const CLEANUP_INTERVAL = 5 * 60 * 1000;
const MAP_MAX_SIZE = 10000;

setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of hits) {
    if (now > rec.resetAt) hits.delete(key);
  }
  if (hits.size > MAP_MAX_SIZE) {
    const entries = [...hits.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
    for (const [key] of entries.slice(0, entries.length - MAP_MAX_SIZE / 2)) hits.delete(key);
  }
}, CLEANUP_INTERVAL).unref();

export function rateLimit({ windowMs = 60 * 1000, max = 30, message = 'Too many requests. Slow down.' } = {}) {
  return (req, res, next) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    let rec = hits.get(ip);
    if (!rec || now > rec.resetAt) {
      rec = { count: 0, resetAt: now + windowMs };
    }
    rec.count++;
    hits.set(ip, rec);
    if (rec.count > max) {
      return res.status(429).json({ success: false, error: message });
    }
    next();
  };
}
