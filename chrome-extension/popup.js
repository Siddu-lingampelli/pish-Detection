// API Configuration (defaults; can be overridden via chrome.storage)
let API_URL = 'http://localhost:5000/api';
let WEB_APP_URL = 'http://localhost:3000';

function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiUrl', 'webAppUrl'], (result) => {
      if (result.apiUrl) API_URL = result.apiUrl.replace(/\/+$/, '') + '/api';
      if (result.webAppUrl) WEB_APP_URL = result.webAppUrl;
      resolve();
    });
  });
}

const isScannableUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    const u = new URL(url);
    const h = u.hostname;
    if (!/^[a-z0-9.\-:[\]]+$/i.test(h)) return false;
    if (/^(localhost|0\.0\.0\.0|::1|\[::1\]|127\.0\.0\.1)$/i.test(h)) return false;
    const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
    if (m) {
      const o = m.slice(1).map(Number);
      if (o.some(x => x > 255)) return false;
      if (o[0] === 10 || o[0] === 127 || o[0] === 0) return false;
      if (o[0] === 172 && o[1] >= 16 && o[1] <= 31) return false;
      if (o[0] === 192 && o[1] === 168) return false;
    }
    return true;
  } catch {
    return false;
  }
};

async function fetchWithTimeout(url, opts = {}, timeout = 10000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

function deriveRiskScore(serverData) {
  const inner = serverData?.data || {};
  const confidence = Number(inner.confidence_score);
  const result = String(inner.result || '').toLowerCase();
  let base;
  if (!isNaN(confidence)) {
    base = (result === 'phishing' || result === 'suspicious')
      ? Math.round(confidence * 100)
      : Math.round((1 - confidence) * 100);
  } else {
    base = 0;
  }
  const factorBoost = Math.min(20, (inner.meta_data?.risk_factors?.length || 0) * 5);
  return Math.max(0, Math.min(100, base + factorBoost));
}

function deriveThreats(serverData) {
  const inner = serverData?.data || {};
  return Array.isArray(inner.meta_data?.risk_factors) ? inner.meta_data.risk_factors : [];
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url;
    document.getElementById('currentUrl').textContent = url || 'No URL';

    if (!isScannableUrl(url)) {
      showError('This page cannot be scanned');
      return;
    }
    await scanURL(url);
  } catch (error) {
    showError('Failed to scan page. Please try again.');
  }
});

async function scanURL(url) {
  const loadingDiv = document.getElementById('loading');
  const resultsDiv = document.getElementById('results');

  try {
    const response = await fetchWithTimeout(`${API_URL}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error('Scan failed');
    }

    const data = await response.json();
    loadingDiv.classList.add('hidden');
    resultsDiv.classList.remove('hidden');

    const riskScore = deriveRiskScore(data);
    const threats = deriveThreats(data);
    const displayData = { riskScore, threats };

    updateUI(displayData, url);
    await saveToHistory(url, displayData);

    if (riskScore >= 70) {
      try {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.svg',
          title: '⚠️ High Risk Website Detected!',
          message: `This website has a risk score of ${riskScore}/100. Be cautious!`,
          priority: 2
        });
      } catch {}
    }
  } catch (error) {
    loadingDiv.classList.add('hidden');
    resultsDiv.classList.remove('hidden');
    showError(error.name === 'AbortError' ? 'Scan timed out' : 'Unable to scan. Make sure the backend server is running.');
  }
}

function updateUI(data, url) {
  const statusIcon = document.getElementById('statusIcon');
  const statusTitle = document.getElementById('statusTitle');
  const statusSubtitle = document.getElementById('statusSubtitle');
  const riskLevel = document.getElementById('riskLevel');
  const riskScore = document.getElementById('riskScore');
  const httpsStatus = document.getElementById('httpsStatus');

  let level = 'LOW';
  let statusClass = 'safe';
  let icon = '✓';
  let title = 'Safe Website';
  let subtitle = 'No threats detected';

  if (data.riskScore >= 70) {
    level = 'HIGH';
    statusClass = 'danger';
    icon = '⚠';
    title = 'High Risk Detected';
    subtitle = 'This website may be dangerous';
  } else if (data.riskScore >= 40) {
    level = 'MEDIUM';
    statusClass = 'warning';
    icon = '!';
    title = 'Proceed with Caution';
    subtitle = 'Some suspicious elements found';
  }

  statusIcon.className = `status-icon ${statusClass}`;
  statusIcon.textContent = icon;
  statusTitle.textContent = title;
  statusSubtitle.textContent = subtitle;
  riskLevel.textContent = level;
  riskLevel.className = `detail-value ${statusClass}`;
  riskScore.textContent = `${data.riskScore}/100`;

  const isHttps = /^https:\/\//i.test(url);
  httpsStatus.textContent = isHttps ? '✓' : '✗';
  httpsStatus.className = `detail-value ${isHttps ? 'safe' : 'danger'}`;
}

function showError(message) {
  const statusIcon = document.getElementById('statusIcon');
  const statusTitle = document.getElementById('statusTitle');
  const statusSubtitle = document.getElementById('statusSubtitle');
  const loadingDiv = document.getElementById('loading');
  const resultsDiv = document.getElementById('results');

  statusIcon.className = 'status-icon warning';
  statusIcon.textContent = '!';
  statusTitle.textContent = 'Scan Error';
  statusSubtitle.textContent = message;
  document.getElementById('riskLevel').textContent = 'UNKNOWN';
  document.getElementById('riskScore').textContent = '-/100';
  if (loadingDiv) loadingDiv.classList.add('hidden');
  if (resultsDiv) resultsDiv.classList.remove('hidden');
}

async function saveToHistory(url, data) {
  const result = await chrome.storage.local.get(['scanHistory']);
  const history = Array.isArray(result.scanHistory) ? result.scanHistory : [];
  history.unshift({
    url,
    riskScore: data.riskScore,
    timestamp: new Date().toISOString(),
    threats: Array.isArray(data.threats) ? data.threats : []
  });
  if (history.length > 100) history.length = 100;
  await chrome.storage.local.set({ scanHistory: history });
}

document.getElementById('scanAgain').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('results').classList.add('hidden');
  if (isScannableUrl(tab?.url)) {
    await scanURL(tab.url);
  } else {
    showError('This page cannot be scanned');
  }
});

document.getElementById('viewDetails').addEventListener('click', () => {
  try {
    const u = new URL(WEB_APP_URL);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return;
    chrome.tabs.create({ url: `${WEB_APP_URL}/scanner` });
  } catch {}
});
