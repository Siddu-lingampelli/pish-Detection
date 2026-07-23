// Background service worker for Chrome Extension
let API_URL = 'http://localhost:5000/api';

// Load config
chrome.storage.local.get(['apiUrl'], (result) => {
  if (result.apiUrl) API_URL = result.apiUrl.replace(/\/+$/, '') + '/api';
});

function deriveRiskScore(serverData) {
  const inner = serverData?.data || {};
  const confidence = Number(inner.confidence_score);
  const result = String(inner.result || '').toLowerCase();
  let base;
  if (!isNaN(confidence)) {
    base = result === 'phishing' ? Math.round(confidence * 100)
         : Math.round(confidence * 100);
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

function isScannableUrl(url) {
  if (!url) return false;
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    const u = new URL(url);
    if (!/^[a-z0-9.\-:[\]]+$/i.test(u.hostname)) return false;
    const blocked = ['127.', 'localhost', '0.0.0.0', '::1', '[::1]', '10.', '172.16.', '192.168.', '169.254.'];
    if (blocked.some(b => u.hostname.startsWith(b))) return false;
    return true;
  } catch {
    return false;
  }
}

// Listen for tab updates (when user navigates to new page)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }
    if (!isScannableUrl(tab.url)) {
      return;
    }
    await scanInBackground(tab.url, tabId);
  }
});

async function scanInBackground(url, tabId) {
  try {
    const response = await fetch(`${API_URL}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      console.error('Background scan failed:', response.statusText);
      return;
    }

    const data = await response.json();
    const riskScore = deriveRiskScore(data);
    const threats = deriveThreats(data);

    updateBadge(tabId, riskScore);

    if (riskScore >= 70) {
      chrome.scripting.executeScript({
        target: { tabId },
        func: showWarningOverlay,
        args: [riskScore, threats]
      });

      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '⚠️ Phishing Warning',
        message: `Risk Score: ${riskScore}/100 - This site may be dangerous!`,
        priority: 2
      });
    }

  } catch (error) {
    console.error('Background scan error:', error);
  }
}

// Update extension badge
function updateBadge(tabId, riskScore) {
  let color = '#10b981'; // Green
  let text = '✓';

  if (riskScore >= 70) {
    color = '#ef4444'; // Red
    text = '⚠';
  } else if (riskScore >= 40) {
    color = '#f59e0b'; // Yellow
    text = '!';
  }

  chrome.action.setBadgeBackgroundColor({ color, tabId });
  chrome.action.setBadgeText({ text, tabId });
}

// Function to inject warning overlay (runs in page context)
function showWarningOverlay(riskScore, threats) {
  if (document.getElementById('phishing-shield-overlay')) {
    return;
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  const overlay = document.createElement('div');
  overlay.id = 'phishing-shield-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 999999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  const threatItems = threats.length
    ? threats.map(t => `<li>${esc(t)}</li>`).join('')
    : '<li>Suspicious activity detected</li>';

  overlay.innerHTML = `
    <div style="
      max-width: 500px;
      background: #111;
      border: 2px solid #ef4444;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      color: white;
    ">
      <div style="font-size: 64px; margin-bottom: 16px;">⚠️</div>
      <h1 style="font-size: 28px; margin-bottom: 12px; color: #ef4444;">
        Warning: High Risk Website
      </h1>
      <p style="font-size: 16px; color: #aaa; margin-bottom: 24px;">
        This website has a risk score of <strong style="color: #ef4444;">${riskScore}/100</strong>
      </p>
      <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; margin-bottom: 24px; text-align: left;">
        <strong style="color: #ef4444;">⚠️ Detected Threats:</strong>
        <ul style="margin: 12px 0 0 24px; color: #ccc;">
          ${threatItems}
        </ul>
      </div>
      <div style="display: flex; gap: 12px;">
        <button id="phishing-proceed" style="
          flex: 1;
          padding: 12px 24px;
          background: #333;
          border: 1px solid #555;
          color: white;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 600;
        ">
          Proceed Anyway (Not Recommended)
        </button>
        <button id="phishing-goback" style="
          flex: 1;
          padding: 12px 24px;
          background: white;
          border: none;
          color: black;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 600;
        ">
          🛡️ Go Back to Safety
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Button handlers
  document.getElementById('phishing-proceed').addEventListener('click', () => {
    overlay.remove();
  });

  document.getElementById('phishing-goback').addEventListener('click', () => {
    window.history.back();
  });
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Phishing Shield installed successfully!');
  
  // Set default settings
  chrome.storage.local.set({
    autoScan: true,
    showWarnings: true,
    scanHistory: []
  });
});
