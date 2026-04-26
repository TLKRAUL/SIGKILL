import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Trash2 } from 'lucide-react';
import { askAI, getBills, getReceipts } from '../api/apiClient';

const quickActionCards = [
  { label: 'Rețete din ce ai', emoji: '🍳' },
  { label: 'Ce expiră curând', emoji: '⏰' },
  { label: 'Liste de cumpărături', emoji: '🛒' },
  { label: 'Sfaturi de buget', emoji: '💰' },
];

const quickPills = [
  { label: 'Ce pot găti azi?', emoji: '🔍' },
  { label: 'Lista de cumpărături', emoji: '🛒' },
  { label: 'Ce expiră curând?', emoji: '⏰' },
  { label: 'Sfaturi', emoji: '💡' },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Salut! 👋 Sunt asistentul tău Home AI.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [recentScans, setRecentScans] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    Promise.all([
      getReceipts().catch(() => []),
      getBills().catch(() => []),
    ]).then(([receipts, bills]) => {
      const receiptItems = (receipts || []).map(r => ({
        type: 'Bon',
        date: r.scanDate ? new Date(r.scanDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }) : '—',
        amount: `${r.totalAmount?.toFixed(2) || '0.00'} RON`,
        desc: r.storeName || 'Necunoscut',
        icon: '🧾',
      }));
      const billItems = (bills || []).map(b => ({
        type: b.service || 'Factură',
        date: b.dueDate ? new Date(b.dueDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }) : '—',
        amount: `${b.amount?.toFixed(2) || '0.00'} RON`,
        desc: b.provider || 'Necunoscut',
        icon: '📄',
      }));
      setRecentScans([...receiptItems, ...billItems].slice(0, 6));
    });
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMessage = text.trim();
    setInput('');
    setShowQuickActions(false);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      const response = await askAI(userMessage);
      let content = response.answer || response.message || 'Hmm, nu am un răspuns acum.';
      if (response.pantryChanged && response.actions) {
        const actionSummary = response.actions.map(a => {
          if (a.type === 'add' && a.success) return `✅ Adăugat: **${a.product?.name}**`;
          if (a.type === 'delete' && a.success) return `🗑️ Șters: **${a.name}**`;
          if (!a.success) return `❌ Eroare: ${a.error}`;
          return '';
        }).filter(Boolean).join('\n');
        if (actionSummary) content += '\n\n---\n' + actionSummary;
      }
      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Scuze, eroare. ${err?.response?.data?.details || ''} 🔧` }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };
  const clearChat = () => { setMessages([{ role: 'assistant', content: 'Chat șters. Cu ce te pot ajuta? 😊' }]); setShowQuickActions(true); };

  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={j} style={{ fontWeight: 600, color: '#1a1a1a' }}>{part.slice(2, -2)}</strong>;
        return part;
      });
      if (line.trim() === '') return <br key={i} />;
      if (/^[•\-☐]\s/.test(line.trim()))
        return <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginLeft: 4, margin: '2px 0' }}><span style={{ color: '#4dd0c8' }}>•</span><span>{parts}</span></div>;
      return <div key={i}>{parts}</div>;
    });
  };

  return (
    <div id="assistant-page" style={{
      position: 'fixed', inset: 0, zIndex: 10,
      fontFamily: "'Inter',-apple-system,sans-serif",
      background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 25%, #e0f7fa 50%, #b2dfdb 75%, #e0f2f1 100%)',
    }}>
      {/* Orbs */}
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(77,208,200,0.12) 0%,transparent 70%)', top:'-10%', right:'-5%', animation:'asstFloat1 10s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,0.06) 0%,transparent 70%)', bottom:'5%', left:'-5%', animation:'asstFloat2 12s ease-in-out infinite', pointerEvents:'none' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 72 }}>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, padding: '0 32px 24px', overflow: 'hidden' }}>

          {/* ===== LEFT: Chat ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 14,
                  background: 'rgba(77,208,200,0.12)', border: '1px solid rgba(77,208,200,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ color: '#0d9488', fontSize: 16, fontWeight: 800 }}>H</span>
                </div>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em' }}>Home AI Assistant</span>
              </div>
              <button onClick={clearChat} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 50,
                background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.6)',
                color: '#888', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                backdropFilter: 'blur(12px)', fontFamily: 'Inter, sans-serif'
              }}>
                <Trash2 size={12} /> Clear
              </button>
            </div>

            {/* Chat area */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
              background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(30px) saturate(140%)',
              border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24,
              boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
              overflow: 'hidden'
            }}>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 16px' }} id="chat-messages">
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    {msg.role === 'assistant' && (
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, flexShrink: 0, marginTop: 2,
                        background: 'rgba(77,208,200,0.15)', border: '1px solid rgba(77,208,200,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
                      }}>🤖</div>
                    )}
                    <div style={{
                      maxWidth: '75%', padding: '10px 16px', fontSize: 14, lineHeight: 1.6,
                      borderRadius: msg.role === 'user' ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                      background: msg.role === 'user' ? '#1a1a1a' : 'rgba(255,255,255,0.7)',
                      color: msg.role === 'user' ? 'white' : '#333',
                      fontWeight: msg.role === 'user' ? 500 : 400,
                      boxShadow: msg.role === 'user' ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                    }}>
                      {renderContent(msg.content)}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(77,208,200,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
                    }}>🤖</div>
                    <div style={{ padding: '10px 16px', borderRadius: '18px 18px 18px 6px', background: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Loader2 size={14} className="animate-spin" style={{ color: '#0d9488' }} />
                      <span style={{ fontSize: 12, color: '#999' }}>thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick action cards */}
              {showQuickActions && messages.length <= 2 && (
                <div style={{ padding: '0 24px 12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    {quickActionCards.map((a, i) => (
                      <button key={i} onClick={() => sendMessage(a.label)} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 14,
                        background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'left', fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'white'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}>
                        <span style={{ fontSize: 18 }}>{a.emoji}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{a.label}</span>
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: '#999' }}>Scrie orice mai jos 👇</p>
                </div>
              )}

              {/* Quick pills */}
              <div style={{ padding: '8px 24px', borderTop: '1px solid rgba(0,0,0,0.04)', overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {quickPills.map((p, i) => (
                    <button key={i} onClick={() => sendMessage(p.label)} style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 50,
                      background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)',
                      color: '#777', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                      whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = '#1a1a1a'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.color = '#777'; }}>
                      <span>{p.emoji}</span> {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div style={{ padding: '12px 24px 16px', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, borderRadius: 18,
                  background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.06)',
                  padding: '4px 4px 4px 18px'
                }}>
                  <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown} placeholder="Întreabă orice..." disabled={loading}
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      fontSize: 14, color: '#1a1a1a', padding: '10px 0', fontFamily: 'Inter, sans-serif'
                    }} />
                  <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} style={{
                    width: 38, height: 38, borderRadius: 14, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                    background: input.trim() && !loading ? '#1a1a1a' : 'rgba(0,0,0,0.04)',
                    color: input.trim() && !loading ? 'white' : '#ccc'
                  }}>
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ===== RIGHT: Recent Scans ===== */}
          <div style={{ overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(30px) saturate(140%)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24, padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', marginBottom: 16 }}>Ultimele Achiziții</p>
              {recentScans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>📋</span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 4 }}>Nu sunt achiziții</p>
                  <p style={{ fontSize: 12, color: '#999' }}>Scanează o factură</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recentScans.map((scan, i) => (
                    <div key={i} style={{
                      background: 'rgba(0,0,0,0.02)', borderRadius: 14, padding: '14px 16px',
                      border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{scan.type}</p>
                          <p style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{scan.icon} {scan.date}</p>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0d9488' }}>{scan.amount}</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#777' }}>{scan.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Capabilities */}
            <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(30px) saturate(140%)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24, padding: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>✨ Ce poate face AI</p>
              {[
                { emoji: '🍳', text: 'Sugerează rețete din ingredientele tale' },
                { emoji: '📊', text: 'Analizează cheltuielile și bugetul' },
                { emoji: '🗓️', text: 'Planifică mese pe toată săptămâna' },
                { emoji: '🚨', text: 'Alertă produse care expiră' },
                { emoji: '📝', text: 'Creează liste de cumpărături smart' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                  <span style={{ fontSize: 16 }}>{c.emoji}</span>
                  <span style={{ fontSize: 12, color: '#555' }}>{c.text}</span>
                </div>
              ))}
            </div>

            {/* Status */}
            <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(30px) saturate(140%)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24, padding: '20px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 8px rgba(22,163,74,0.4)', animation: 'pulse-soft 2.5s ease-in-out infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>Claude AI Online</span>
              </div>
              <p style={{ fontSize: 11, color: '#999' }}>Model: Claude 3.5 Sonnet · Latency: ~2s</p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes asstFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-12px,10px)} }
        @keyframes asstFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,-12px)} }
      `}</style>
    </div>
  );
}
