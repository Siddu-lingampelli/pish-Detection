import { useState, useRef, useEffect } from 'react';
import { FiX, FiSend } from 'react-icons/fi';
import { aiChat } from '../services/api';

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Security operator online. Ask about phishing, scams, or any URL you want explained.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input;
    setInput('');
    setLoading(true);

    setMessages(prev => {
      const updated = [...prev, { role: 'user', content: text }];
      const history = updated.slice(-7, -1);
      (async () => {
        try {
          const r = await aiChat(text, history);
          setMessages(curr => [...curr, { role: 'assistant', content: r?.reply || 'No response.' }]);
        } catch (err) {
          setMessages(curr => [...curr, { role: 'assistant', content: err.response?.data?.error || 'Connection error.' }]);
        } finally { setLoading(false); }
      })();
      return updated;
    });
  };

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="focus-ring aibot-launcher"
      style={{
        position: 'fixed', bottom: 24, right: 24,
        background: 'var(--ink)', color: 'var(--bone)',
        border: '1px solid var(--ink)',
        padding: '12px 16px',
        fontFamily: 'var(--type-display)', fontWeight: 600, fontSize: 12,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        zIndex: 100, display: 'flex', alignItems: 'center', gap: 8
      }}
    >
      <span className="blink" style={{ color: 'var(--signal)' }}>●</span> ASK OPERATOR
    </button>
  );

  return (
    <div className="aibot-shell" style={{
      position: 'fixed', bottom: 24, right: 24,
      width: 400, height: 560,
      background: 'var(--bone)', border: '1px solid var(--ink)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--ink)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div className="t-mono" style={{ fontSize: 10, letterSpacing: '0.15em' }}>
          <span className="blink" style={{ color: 'var(--signal)' }}>●</span> OPERATOR ONLINE
        </div>
        <button onClick={() => setOpen(false)} className="t-mono" style={{ fontSize: 11 }}><FiX /></button>
      </div>

      <div className="scroll-y" style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            padding: '10px 14px',
            background: m.role === 'user' ? 'var(--ink)' : 'transparent',
            color: m.role === 'user' ? 'var(--bone)' : 'var(--ink)',
            border: m.role === 'user' ? '1px solid var(--ink)' : '1px solid var(--ink-16)',
            fontSize: 13, lineHeight: 1.5
          }}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', padding: '10px 14px', border: '1px solid var(--ink-16)' }}>
            <span className="t-mono" style={{ fontSize: 11 }}><span className="blink">●</span> THINKING</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ borderTop: '1px solid var(--ink)', padding: 12, display: 'flex', gap: 8 }} className="input-group">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask..."
          className="field-sm"
          disabled={loading}
          style={{ fontFamily: 'var(--type-mono)', fontSize: 12 }}
        />
        <button onClick={send} disabled={loading || !input.trim()} className="btn-primary" style={{ padding: '0 16px' }}>
          <FiSend size={12} />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
