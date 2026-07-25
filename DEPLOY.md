# Deploy to Render (24/7 free tier)

## One-time setup

1. Go to https://render.com → Sign up with GitHub
2. Click **New +** → **Blueprint**
3. Connect your repo: `Siddu-lingampelli/pish-Detection`
4. Render reads `render.yaml` automatically. Click **Apply**.
5. Wait for first build (~5–8 min: installs client + server, builds React, builds Node).
6. Note your URL: `https://phishguard.onrender.com` (or whatever Render assigns).

## Set the API keys (optional but recommended)

After deploy, dashboard → your service → **Environment** → add:

- `CEREBRAS_API_KEY` — https://cloud.cerebras.ai/ (free tier; powers all AI features using gpt-oss-120b + gemma-4-31b)
- `GOOGLE_SAFE_BROWSING_API_KEY` — Google Cloud Console
- `VIRUSTOTAL_API_KEY` — https://www.virustotal.com/
- `URLSCAN_API_KEY` — https://urlscan.io/user/profile

Without keys, the relevant features degrade gracefully (heuristics only).

`JWT_SECRET` is auto-generated.

## Keep alive 24/7 (free)

Render free plan sleeps after **15 min of no traffic**. First request after sleep = ~30s cold start.

### Option A — cron-job.org (primary, ~3 min)

1. Go to https://cron-job.org → sign up (free)
2. **Create cronjob**:
   - **Title:** `phishguard-keepalive`
   - **URL:** `https://phishguard.onrender.com/health` (use your actual URL)
   - **Execution schedule:** Every 14 minutes
3. Save. Test it once → should return `200 OK` with `{"status":"OK",...}`.

### Option B — GitHub Actions (backup, included in this repo)

This repo already includes `.github/workflows/keep-alive.yml` that pings every 14 minutes via GitHub's free cron (2000 min/month free).

1. (Optional) Set the `RENDER_URL` repo secret for a custom URL:
   - Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - Name: `RENDER_URL`  Value: `https://phishguard.onrender.com`
2. Done. Action runs on schedule automatically.

You can use **both A and B** for redundancy.

## Where data lives

**No server database needed.** All user auth, sessions, and scan history are stored in the browser's `localStorage`. This means:
- **No persistent disk required** — Render free tier works perfectly
- **No external DB** — everything is client-side
- **Data is private per-device** — clearing browser cache resets it
- **Works offline** after initial page load

The server only handles URL scan requests via the `/api/scan` endpoint (uses VirusTotal, URLScan.io, Cerebras APIs).

## Custom domain

Dashboard → Settings → Custom Domain → add `phish.yourdomain.com` → update DNS per Render instructions.
