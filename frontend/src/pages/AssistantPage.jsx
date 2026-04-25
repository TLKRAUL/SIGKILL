import { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Sparkles, User, Loader2,
  ChefHat, Lightbulb, ShoppingCart, Leaf, Trash2, Zap
} from 'lucide-react';
import { askAI } from '../api/apiClient';

const quickActions = [
  { label: 'Ce pot găti azi?', icon: ChefHat, color: 'text-neon-orange' },
  { label: 'Ce expiră curând?', icon: Lightbulb, color: 'text-neon-yellow' },
  { label: 'Generează lista de cumpărături', icon: ShoppingCart, color: 'text-neon-blue' },
  { label: 'Sfaturi anti-risipă', icon: Leaf, color: 'text-neon-green' },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Salut! 👋 Sunt asistentul tău AI pentru management-ul casei, powered by **Google Gemini**.\n\nPot să te ajut cu orice — nu doar cu cămara! Întreabă-mă:\n\n🍳 Rețete și gătit\n⏰ Ce expiră curând\n🛒 Liste de cumpărături\n🌿 Sfaturi anti-risipă\n💡 Sau orice altceva!\n\nScrie orice întrebare mai jos 👇',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMessage = text.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await askAI(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer || response.message || 'Hmm, nu am un răspuns acum. Încearcă altceva!',
        },
      ]);
    } catch (err) {
      const errorMsg = err?.response?.data?.details || err?.message || '';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Scuze, am întâmpinat o eroare. ${errorMsg ? `Detalii: ${errorMsg}` : 'Serverul nu răspunde.'} 🔧`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat-ul a fost șters. Întreabă-mă orice! 😊',
      },
    ]);
  };

  // Render markdown-like content (bold, bullet points, numbered lists, emojis)
  const renderContent = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Render bold text within each line
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // Empty line = spacing
      if (line.trim() === '') {
        return <br key={lineIdx} />;
      }

      // Bullet points
      if (line.trim().startsWith('• ') || line.trim().startsWith('- ') || line.trim().startsWith('☐ ')) {
        return (
          <div key={lineIdx} className="flex items-start gap-2 ml-1 my-0.5">
            <span className="text-accent-400 mt-0.5">•</span>
            <span>{rendered.map((r, i) => typeof r === 'string' ? r.replace(/^[•\-☐]\s*/, '') : r)}</span>
          </div>
        );
      }

      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const num = line.trim().match(/^(\d+)\./)?.[1];
        return (
          <div key={lineIdx} className="flex items-start gap-2 ml-1 my-0.5">
            <span className="text-accent-400 font-mono text-xs mt-0.5 min-w-[16px]">{num}.</span>
            <span>{rendered.map((r, i) => typeof r === 'string' ? r.replace(/^\d+\.\s*/, '') : r)}</span>
          </div>
        );
      }

      return <div key={lineIdx}>{rendered}</div>;
    });
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-6 pb-6 pt-24 page-enter" id="assistant-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-neon-blue flex items-center justify-center animate-float">
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">AI Asistent</h1>
            <div className="flex items-center gap-1.5">
              <Zap size={10} className="text-neon-green" />
              <p className="text-xs text-dark-400">Powered by Google Gemini • Întreabă orice</p>
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="btn-secondary flex items-center gap-2 text-xs py-2 px-3"
          id="clear-chat-btn"
        >
          <Trash2 size={12} />
          Șterge chat
        </button>
      </div>

      {/* Chat Container */}
      <div className="card overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 340px)' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4" id="chat-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-500/30 to-neon-blue/20 flex items-center justify-center flex-shrink-0 mt-1 border border-accent-500/20">
                  <Bot size={16} className="text-accent-400" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent-500 text-white rounded-br-md'
                    : 'bg-dark-700/60 text-dark-100 rounded-bl-md border border-glass-border'
                }`}
              >
                {renderContent(msg.content)}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-neon-green/20 flex items-center justify-center flex-shrink-0 mt-1 border border-neon-green/20">
                  <User size={16} className="text-neon-green" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-accent-500/20 flex items-center justify-center flex-shrink-0 border border-accent-500/20">
                <Bot size={16} className="text-accent-400" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-dark-700/60 border border-glass-border flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-accent-400" />
                <span className="text-xs text-dark-400">Gemini se gândește...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions — doar la început */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3">
            <p className="text-[10px] text-dark-500 uppercase tracking-wider mb-2 font-medium">Sugestii rapide</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={() => sendMessage(action.label)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-dark-700/40 border border-glass-border text-xs text-dark-200 hover:bg-dark-700/80 hover:text-white hover:border-accent-500/20 transition-all text-left"
                    id={`quick-action-${i}`}
                  >
                    <Icon size={14} className={action.color} />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input — always visible, always free-form */}
        <div className="px-4 py-4 border-t border-glass-border">
          <div className="flex items-center gap-3 bg-dark-700/50 rounded-xl px-4 py-1 border border-glass-border focus-within:border-accent-500/30 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Întreabă-mă orice... (rețete, sfaturi, planificare, etc.)"
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-white placeholder-dark-400 py-3 outline-none disabled:opacity-50"
              id="assistant-input"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !loading
                  ? 'bg-accent-500 text-white hover:bg-accent-600 scale-100'
                  : 'bg-dark-600 text-dark-500 scale-95'
              }`}
              id="assistant-send"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
