# Deploy to Render (24/7 free tier)

## One-time setup

1. Go to https://render.com → Sign up with GitHub
2. Click **New +** → **Blueprint**
3. Connect your repo: `Siddu-lingampelli/pish-Detection`
4. Render reads `render.yaml` automatically. Click **Apply**.
5. Wait for first build (~5–8 min: installs client + server, builds React, builds Node).

## Set the API keys (optional but recommended)

After deploy, dashboard → your service → **Environment** → add:

- `MISTRAL_API_KEY` — https://console.mistral.ai/
- `OPENROUTER_API_KEY` — https://openrouter.ai/keys
- `GOOGLE_SAFE_BROWSING_API_KEY` — Google Cloud Console
- `VIRUSTOTAL_API_KEY` — https://www.virustotal.com/
- `URLSCAN_API_KEY` — https://urlscan.io/user/profile

Without keys, the relevant features degrade gracefully (heuristics only).

`JWT_SECRET` is auto-generated. `CLIENT_URL` is auto-set to your Render URL.

## 24/7 caveat

Free plan sleeps after **15 min of no traffic**. First request after sleep = ~30s cold start.

**To stay awake 24/7 for free**: use a cron pinger:
- https://cron-job.org (free)
- Create a job that hits `https://your-app.onrender.com/health` every 14 minutes

This is the standard Render free-tier workaround. The app itself doesn't sleep while being pinged.

## Where data lives

Users and scan history persist to `server/data/store.json` (file-based).
**Render free tier disk is ephemeral** — data survives restarts but not full redeploys. For multi-day survival, upgrade to Render's persistent disk ($1/mo) or use external DB.

## Custom domain

Dashboard → Settings → Custom Domain → add `phish.yourdomain.com` → update DNS per Render instructions.
