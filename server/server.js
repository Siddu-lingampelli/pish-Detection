import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import helmet from 'helmet';
import scanRoutes from './routes/scanRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import screenshotRoutes from './routes/screenshotRoutes.js';
import aiAssistantRoutes from './routes/aiAssistantRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { loadStore } from './store.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET is missing or too short (need at least 32 chars)');
  process.exit(1);
}

loadStore();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.disable('etag');
app.set('trust proxy', 1);

const isProd = process.env.NODE_ENV === 'production';
const allowedOrigin = isProd 
  ? (process.env.CLIENT_URL || true) 
  : [/^http:\/\/localhost:\d+$/, process.env.CLIENT_URL].filter(Boolean);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api', scanRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/screenshot', screenshotRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist, { etag: false, maxAge: '1h' }));

app.get(/^(?!\/api).*/, (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body too large' });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }
  console.error('Unhandled error:', err?.name || 'Error');
  if (err?.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Services: ${[
    process.env.GOOGLE_SAFE_BROWSING_API_KEY && 'GSB',
    process.env.VIRUSTOTAL_API_KEY && 'VT',
    process.env.URLSCAN_API_KEY && 'URLScan',
    process.env.CEREBRAS_API_KEY && 'Cerebras'
  ].filter(Boolean).join(', ') || 'none'}`);
});

const shutdown = (sig) => () => {
  console.log(`\n${sig} received, closing server...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));

export default app;