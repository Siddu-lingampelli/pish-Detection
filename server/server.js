import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import scanRoutes from './routes/scanRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import screenshotRoutes from './routes/screenshotRoutes.js';
import aiAssistantRoutes from './routes/aiAssistantRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { loadStore } from './store.js';

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET is missing or too short (need at least 32 chars)');
  process.exit(1);
}

loadStore();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : (process.env.CLIENT_URL || 'http://localhost:3000'),
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api', scanRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/screenshot', screenshotRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Phishing Detection API is running',
    timestamp: new Date().toISOString(),
    apis: {
      googleSafeBrowsing: !!process.env.GOOGLE_SAFE_BROWSING_API_KEY,
      virusTotal: !!process.env.VIRUSTOTAL_API_KEY,
      urlScan: !!process.env.URLSCAN_API_KEY,
      mistral: !!process.env.MISTRAL_API_KEY,
      openRouter: !!process.env.OPENROUTER_API_KEY
    }
  });
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (req.path.startsWith('/api')) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
  res.status(500).send('Internal server error');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('API keys configured:');
  console.log(`  Google Safe Browsing: ${process.env.GOOGLE_SAFE_BROWSING_API_KEY ? 'YES' : 'NO'}`);
  console.log(`  VirusTotal:           ${process.env.VIRUSTOTAL_API_KEY ? 'YES' : 'NO'}`);
  console.log(`  URLScan.io:           ${process.env.URLSCAN_API_KEY ? 'YES' : 'NO'}`);
  console.log(`  Mistral AI:           ${process.env.MISTRAL_API_KEY ? 'YES' : 'NO'}`);
  console.log(`  OpenRouter:           ${process.env.OPENROUTER_API_KEY ? 'YES' : 'NO'}`);
});

export default app;