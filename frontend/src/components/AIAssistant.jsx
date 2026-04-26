import { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, Bot } from 'lucide-react';
import { askAI } from '../api/apiClient';

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Salut! 👋 Cu ce te pot ajuta?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      const response = await askAI(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response.answer || 'Hmm...' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Eroare. Încearcă din nou. 😅' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)} id="ai-assistant-toggle"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 22px', borderRadius: 50, border: 'none', cursor: 'pointer',
          fontFamily: "'Inter',-apple-system,sans-serif", fontSize: 13, fontWeight: 700,
          transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
          background: open ? 'rgba(255,255,255,0.6)' : '#1a1a1a',
          color: open ? '#888' : 'white',
          backdropFilter: open ? 'blur(20px)' : 'none',
          boxShadow: open ? '0 4px 20px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.2)',
          animation: 'aiFabEntry 0.5s cubic-bezier(.22,1,.36,1) both',
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.25)'; }}}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = open ? '0 4px 20px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.2)'; }}>
        {open ? <><X size={15} /> Închide</> : <><Bot size={15} /> ASK HOME AI</>}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 80, right: 24, zIndex: 50,
          width: 380, maxWidth: 'calc(100vw - 48px)', maxHeight: 500,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.7)', borderRadius: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
          animation: 'aiPanelIn 0.3s cubic-bezier(.22,1,.36,1) both',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(77,208,200,0.12)', border: '1px solid rgba(77,208,200,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14 }}>🤖</span>
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Home AI</h4>
              <p style={{ fontSize: 9, color: '#999', margin: 0 }}>Powered by Claude</p>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 260 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && <span style={{ fontSize: 14, marginTop: 4 }}>🤖</span>}
                <div style={{
                  maxWidth: '78%', padding: '10px 14px', borderRadius: 18, fontSize: 13, lineHeight: 1.5,
                  ...(msg.role === 'user'
                    ? { background: '#1a1a1a', color: 'white', fontWeight: 500, borderBottomRightRadius: 6 }
                    : { background: 'rgba(0,0,0,0.04)', color: '#555', borderBottomLeftRadius: 6, border: '1px solid rgba(0,0,0,0.06)' }
                  ),
                }}>{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 6 }}><span style={{ fontSize: 14 }}>🤖</span>
                <div style={{ padding: '12px 16px', borderRadius: 18, borderBottomLeftRadius: 6, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <Loader2 size={13} style={{ animation: 'spin 1s linear infinite', color: '#0d9488' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '2px 4px 2px 14px' }}>
              <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                placeholder="Întreabă ceva..."
                style={{ flex: 1, background: 'transparent', fontSize: 13, color: '#1a1a1a', padding: '10px 0', outline: 'none', border: 'none', fontFamily: 'inherit' }} />
              <button onClick={handleSend} disabled={!input.trim() || loading} style={{
                width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: input.trim() && !loading ? '#1a1a1a' : 'rgba(0,0,0,0.04)',
                color: input.trim() && !loading ? 'white' : '#ccc',
              }}>
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes aiFabEntry { from { opacity:0; transform:translateY(16px) scale(0.9) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes aiPanelIn { from { opacity:0; transform:translateY(8px) scale(0.96) } to { opacity:1; transform:translateY(0) scale(1) } }
      `}</style>
    </>
  );
}
