# PhishGuard

AI-powered real-time phishing detection — scan URLs, emails, QR codes, and screenshots for threats.

---

## Features

- **URL Scanner** — detect typosquatting, malicious keywords, suspicious TLDs with AI-driven analysis
- **Email Scanner** — triage phishing emails via link inspection, sender analysis, and keyword heuristics
- **QR Scanner** — decode and scan QR code URLs for threats
- **Screenshot Analyzer** — vision-based page analysis with text extraction and visual phishing scoring
- **AI Assistant** — ask security questions to the built-in Cerebras-powered chatbot
- **Analytics Dashboard** — track scan history, threat trends, and risk distribution via Recharts
- **Chrome Extension** — right-click any link to scan on the fly (`chrome-extension/`)

---

## Architecture

### Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Express.js, Helmet, CORS, Multer |
| AI | Cerebras (gemma-4-31b) |
| Threat Intel | VirusTotal API, URLScan.io |
| Auth | JWT (stored in localStorage, no external DB) |
| Image Processing | Sharp, Jimp, jsQR, Tesseract.js |

### Data Flow

```
Client ── POST /api/scan ──> Express ──> VirusTotal + URLScan.io ──> Scoring Engine ──> Cerebras AI ──> Result
Client ── POST /api/email ──> Express ──> Link Analyzer + Keyword Engine ──> Cerebras AI ──> Risk Assessment
Client ── POST /api/qr ────> Express ──> QR Decode ──> URL Scan Pipeline
Client ── POST /api/screenshot ──> Express ──> OCR + Vision AI ──> Visual/Text Risk Scoring
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### 1. Clone

```bash
git clone https://github.com/your-username/phishguard.git
cd phishguard
```

### 2. Environment

```bash
cp .env.example .env
```

Fill in your API keys in `.env` (all optional — leave blank to disable a service):

| Variable | Required | Source |
|----------|----------|--------|
| `JWT_SECRET` | Yes | Any 32+ char string |
| `VIRUSTOTAL_API_KEY` | No | [VirusTotal](https://www.virustotal.com/gui/) |
| `URLSCAN_API_KEY` | No | [URLScan.io](https://urlscan.io/) |
| `CEREBRAS_API_KEY` | No | [Cerebras](https://cloud.cerebras.ai/) |

### 3. Install & Run

```bash
# Install all dependencies
npm ci --prefix client && npm ci --prefix server

# Start in dev mode (runs both client Vite dev server + Express)
npm run dev --prefix client
```

Open `http://localhost:5173` — the Vite proxy forwards `/api` calls to Express on `:5000`.

### Production Build

```bash
npm run build --prefix client
node server/server.js
```

---

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/api/scan` | POST | URL threat analysis |
| `/api/email/analyze` | POST | Email content analysis |
| `/api/qr/scan` | POST | QR code image analysis |
| `/api/screenshot/analyze` | POST | Screenshot vision analysis |
| `/api/ai-assistant/chat` | POST | AI security Q&A |
| `/api/auth/login` | POST | Local JWT login |
| `/api/auth/register` | POST | Local JWT registration |

---

## Deployment (Render)

```yaml
# render.yaml (included in repo)
services:
  - type: web
    name: phishguard
    runtime: node
    plan: free
    buildCommand: npm ci --prefix client && npm ci --prefix server && npm run build --prefix client
    startCommand: node server/server.js
    healthCheckPath: /health
```

1. Push to GitHub
2. Create a **New Web Service** on [Render](https://dashboard.render.com)
3. Connect your repo, select the `render.yaml` blueprint
4. Set environment variables in the Render dashboard
5. Deploy — your app will be live at `https://your-app.onrender.com`

> **Free tier note:** Render spins down after 15 min of inactivity. First request after idle takes ~30s. Set up a [cron-job.org](https://cron-job.org) ping to `/health` every 10 min to keep it warm.

---

## Project Structure

```
phishguard/
├── client/               # React + Vite frontend
│   └── src/
│       ├── components/   # Reusable UI: RiskGauge, AIAssistant, QRScanner, etc.
│       ├── pages/        # Route pages: Home, History, Analytics, Login, etc.
│       └── services/     # API client, local auth, localStorage helpers
├── server/               # Express backend
│   ├── routes/           # Route handlers: scan, email, qr, screenshot, auth
│   ├── services/         # Business logic: detection, analysis, Cerebras, VT, URLScan
│   └── middleware/       # Auth, rate limiting
├── chrome-extension/     # Browser extension for on-click scanning
├── render.yaml           # Render deployment blueprint
└── .env.example          # Environment template
```

---

## Caveats

- **Not for production use at scale** — see [Concurrency Limits](#concurrency-limits) below
- **Auth is client-side only** — localStorage-based JWT, no server-side session store
- **Free API tiers have strict rate limits** — VirusTotal (4 req/min), URLScan (~10 req/min)

---

## Concurrency Limits

This app runs on Render free tier with a single Node.js process and free API keys. At ~10 concurrent scan requests, external APIs begin throttling and the server may run out of memory. Designed for personal and small-team use.

---

## License

MIT — see [LICENSE](LICENSE).
