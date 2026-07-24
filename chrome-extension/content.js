// Content script - Runs on every page
// (silent — no console log to avoid fingerprinting)

const PROTOCOL = window.location.protocol;
if (PROTOCOL === 'http:' || PROTOCOL === 'https:') {
  const style = document.createElement('style');
  style.textContent = `@keyframes phishShieldFade {0%,100%{opacity:0}50%{opacity:.6}}`;
  document.head.appendChild(style);

  const indicator = document.createElement('div');
  indicator.id = 'phishing-shield-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  indicator.style.cssText = `position:fixed;bottom:20px;right:20px;width:12px;height:12px;background:#10b981;border-radius:50%;z-index:999999;box-shadow:0 0 10px rgba(16,185,129,.5);pointer-events:none;opacity:0;animation:phishShieldFade 2s ease-in-out`;
  if (document.body) document.body.appendChild(indicator);
  setTimeout(() => indicator.remove(), 2000);
}

function checkPageIndicators() {
  const indicators = { suspiciousForms: 0, hiddenIframes: 0 };

  try {
    if (document.querySelectorAll('input[type="password"]').length > 0) {
      indicators.suspiciousForms++;
    }
    document.querySelectorAll('iframe').forEach(iframe => {
      const style = iframe.getAttribute('style') || '';
      if (/(?:^|;)\s*display\s*:\s*none/i.test(style) ||
          /(?:^|;)\s*visibility\s*:\s*hidden/i.test(style)) {
        indicators.hiddenIframes++;
      }
    });
  } catch {}
  return indicators;
}

window.addEventListener('load', () => {
  const indicators = checkPageIndicators();
  try {
    chrome.runtime.sendMessage({ action: 'pageAnalysis', indicators });
  } catch {}
});
