import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LiveClock = () => {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="t-mono">
      {t.toISOString().replace('T', ' ').slice(0, 19)}<span className="blink">_</span> UTC
    </span>
  );
};

const LiveVerdict = () => {
  const samples = [
    { url: 'login.paypa1.com/verify', risk: 92, tag: 'PHISH' },
    { url: 'drive.google.com/file/d/1xK', risk: 4, tag: 'CLEAR' },
    { url: 'support-appleid.com', risk: 88, tag: 'PHISH' },
    { url: 'github.com/anomalyco/opencode', risk: 2, tag: 'CLEAR' },
    { url: 'free-crypto-airdrop.tk', risk: 96, tag: 'PHISH' },
    { url: 'wikipedia.org/wiki/Phishing', risk: 0, tag: 'CLEAR' }
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((i + 1) % samples.length), 2200);
    return () => clearInterval(id);
  }, [i, samples.length]);
  const s = samples[i];
  return (
    <div className="t-mono" style={{ fontSize: 12, lineHeight: 1.7 }}>
      <div style={{ color: 'var(--ink-60)' }}>→ SCAN {s.url}</div>
      <div style={{ display: 'flex', gap: 16, marginTop: 2 }}>
        <span>RISK {String(s.risk).padStart(3, '0')}/100</span>
        <span style={{ color: s.risk >= 70 ? 'var(--signal)' : 'var(--ink-60)' }}>VERDICT {s.tag}</span>
      </div>
    </div>
  );
};

const Landing = () => {
  return (
    <div style={{ background: 'var(--bone)', minHeight: '100vh', color: 'var(--ink)' }}>
      {/* TOP STATUS BAR */}
      <header style={{
        borderBottom: '1px solid var(--ink)',
        padding: '10px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 11
      }}>
        <div className="t-mono" style={{ display: 'flex', gap: 24, letterSpacing: '0.1em' }}>
          <span>PG//02</span>
          <span style={{ color: 'var(--ink-60)' }}>PHISHGUARD CONSOLE</span>
        </div>
        <div className="t-mono" style={{ display: 'flex', gap: 24, letterSpacing: '0.05em' }}>
          <span style={{ color: 'var(--ink-60)' }}>v2.4.0</span>
          <span><span className="blink" style={{ color: 'var(--signal)' }}>●</span> ALL SYSTEMS NOMINAL</span>
          <LiveClock />
        </div>
      </header>

      {/* HERO */}
      <section style={{ padding: '80px 32px 64px', borderBottom: '1px solid var(--ink)', position: 'relative' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'start' }}>
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 24, height: 1, background: 'var(--ink)' }} />
                CYBER THREAT INTELLIGENCE / EST. 2024
              </div>
              <h1 className="h-display" style={{ fontSize: 'clamp(56px, 8vw, 112px)', margin: 0 }}>
                Stop phishing<br />
                <span style={{ color: 'var(--signal)' }}>before</span> it starts.
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.5, color: 'var(--ink-60)', maxWidth: 540, marginTop: 28 }}>
                Seven-layer threat analysis on every URL, QR code, screenshot, and email that lands in your team's queue. Verdicts in under 800ms. Explainable AI. Zero data retention.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
                <Link to="/scanner"><button className="btn-primary">Open console →</button></Link>
                <Link to="/register"><button className="btn-ghost">Request access</button></Link>
              </div>
              <div style={{ display: 'flex', gap: 32, marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--ink-08)' }}>
                <div className="stat">
                  <div className="stat-num">0.8<span style={{ fontSize: 16, color: 'var(--ink-60)', fontWeight: 500 }}>s</span></div>
                  <div className="stat-label">Median verdict</div>
                </div>
                <div className="stat">
                  <div className="stat-num">94<span style={{ fontSize: 16, color: 'var(--ink-60)', fontWeight: 500 }}>%</span></div>
                  <div className="stat-label">Detection rate</div>
                </div>
                <div className="stat">
                  <div className="stat-num">7</div>
                  <div className="stat-label">Detection layers</div>
                </div>
                <div className="stat">
                  <div className="stat-num">0</div>
                  <div className="stat-label">Data retained</div>
                </div>
              </div>
            </div>

            {/* LIVE CONSOLE PANEL */}
            <div className="panel" style={{ padding: 0, background: 'var(--ink)', color: 'var(--bone)', overflow: 'hidden' }}>
              <div style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--bone-08)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                letterSpacing: '0.15em'
              }} className="t-mono">
                <span style={{ color: 'var(--bone-60)' }}>STREAM://live.scans</span>
                <span><span className="blink" style={{ color: 'var(--signal)' }}>●</span> REC</span>
              </div>
              <div style={{ padding: 24, minHeight: 220 }}>
                <LiveVerdict />
              </div>
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--bone-08)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11
              }} className="t-mono">
                <span style={{ color: 'var(--bone-60)' }}>Last 6 verdicts</span>
                <span>↑ live</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section style={{ padding: '96px 32px', borderBottom: '1px solid var(--ink)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64 }}>
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 16 }}>§01 — CAPABILITIES</div>
              <h2 className="h-display-2" style={{ fontSize: 'clamp(32px, 4vw, 56px)', margin: 0 }}>
                Four surfaces.<br />One verdict engine.
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid var(--ink)' }}>
              {[
                { code: '01', title: 'URL scanner', body: 'Heuristics, keyword intel, SSL validation, Google Safe Browsing, VirusTotal, URLScan.io, and AI reasoning on every submit.' },
                { code: '02', title: 'QR decoder', body: 'Detects UPI scams, payment fraud, and embedded phishing URLs in image-based lures common in India and SEA.' },
                { code: '03', title: 'Screenshot analysis', body: 'OCR plus vision models extract text, brand cues, and login-form signals from pasted screenshots.' },
                { code: '04', title: 'Email triage', body: 'Paste a suspicious email. Get a risk score, indicator list, and AI-generated explainer in seconds.' }
              ].map((c, i) => (
                <div key={i} style={{
                  padding: 32,
                  borderRight: i % 2 === 0 ? '1px solid var(--ink)' : 0,
                  borderBottom: i < 2 ? '1px solid var(--ink)' : 0
                }}>
                  <div className="t-mono" style={{ fontSize: 11, color: 'var(--ink-60)', marginBottom: 12 }}>§{c.code}</div>
                  <h3 className="h-display-2" style={{ fontSize: 24, margin: 0 }}>{c.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-60)', lineHeight: 1.5, marginTop: 12 }}>{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — REAL PROCESS, NOT NUMBERED FOR SHOW */}
      <section style={{ padding: '96px 32px', borderBottom: '1px solid var(--ink)', background: 'var(--ink)', color: 'var(--bone)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="t-eyebrow" style={{ marginBottom: 16, color: 'var(--bone-60)' }}>§02 — DETECTION PIPELINE</div>
          <h2 className="h-display-2" style={{ fontSize: 'clamp(32px, 4vw, 56px)', margin: 0, maxWidth: 800 }}>
            Every submit runs through seven independent layers. The verdict is whichever layer fires first.
          </h2>

          <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, border: '1px solid var(--bone-08)' }}>
            {[
              { n: '01', t: 'URL parse', s: '0.2ms' },
              { n: '02', t: 'Heuristics', s: '0.4ms' },
              { n: '03', t: 'Keyword intel', s: '0.6ms' },
              { n: '04', t: 'SSL check', s: '12ms' },
              { n: '05', t: 'GSB lookup', s: '180ms' },
              { n: '06', t: 'VT / URLScan', s: '420ms' },
              { n: '07', t: 'AI reasoning', s: '780ms' }
            ].map((l, i) => (
              <div key={i} style={{
                padding: 24,
                borderRight: i < 6 ? '1px solid var(--bone-08)' : 0
              }}>
                <div className="t-mono" style={{ fontSize: 10, color: 'var(--bone-60)', letterSpacing: '0.15em' }}>{l.n}</div>
                <div style={{ fontFamily: 'var(--type-display)', fontWeight: 600, fontSize: 16, marginTop: 8 }}>{l.t}</div>
                <div className="t-mono" style={{ fontSize: 11, color: 'var(--bone-60)', marginTop: 8 }}>{l.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <div className="t-eyebrow" style={{ marginBottom: 24 }}>§03 — DEPLOY</div>
          <h2 className="h-display" style={{ fontSize: 'clamp(48px, 6vw, 88px)', margin: 0, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
            <span style={{ color: 'var(--signal)' }}>Ship a phishing link</span> to your team right now.
          </h2>
          <p style={{ fontSize: 18, color: 'var(--ink-60)', maxWidth: 600, margin: '24px auto 0' }}>
            No credit card. No email gate. Open the console and submit a URL.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 40, justifyContent: 'center' }}>
            <Link to="/scanner"><button className="btn-signal">Open console →</button></Link>
            <Link to="/register"><button className="btn-ghost">Create account</button></Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--ink)', padding: '32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }} className="t-mono">
          <span>PHISHGUARD © 2024 — DEFEND AT THE EDGE</span>
          <span style={{ color: 'var(--ink-60)' }}>PG//02 — CONSOLE BUILD</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
