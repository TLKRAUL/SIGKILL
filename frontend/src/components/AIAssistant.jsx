import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, User, Loader2 } from 'lucide-react';
import { askAI } from '../api/apiClient';

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Salut! 👋 Sunt asistentul tău AI. Te pot ajuta cu rețete, planificarea meselor, sau orice întrebare. Cu ce te pot ajuta?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await askAI(userMessage);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.answer || response.message || 'Hmm, nu am un răspuns acum. Încearcă din nou!' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Scuze, am întâmpinat o eroare. Backend-ul nu răspunde momentan. 😅' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        id="ai-assistant-toggle"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl ${
          open
            ? 'bg-dark-700 border border-neon-cyan/20 rotate-90 scale-90'
            : 'bg-gradient-to-br from-neon-cyan/80 to-neon-blue/60 hover:scale-110 shadow-[0_0_30px_rgba(0,217,255,0.25)]'
        }`}
      >
        {open ? <X size={22} className="text-dark-200" /> : <Bot size={24} className="text-white" />}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] hud-panel shadow-2xl shadow-black/40 flex flex-col overflow-hidden animate-scale-in"
          id="ai-chat-panel"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[rgba(0,217,255,0.1)] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
              <Sparkles size={18} className="text-neon-cyan" />
            </div>
            <div>
              <h4 className="text-sm font-hud font-bold text-white tracking-wider">AI ASISTENT</h4>
              <p className="text-[10px] text-neon-cyan/50">Powered by Gemini</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[280px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={14} className="text-neon-cyan" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-neon-cyan/20 text-white rounded-br-md border border-neon-cyan/15'
                      : 'bg-[rgba(0,217,255,0.03)] text-dark-100 rounded-bl-md border border-[rgba(0,217,255,0.08)]'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-neon-green/10 border border-neon-green/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={14} className="text-neon-green" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 animate-fade-in">
                <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-neon-cyan" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[rgba(0,217,255,0.03)] border border-[rgba(0,217,255,0.08)]">
                  <Loader2 size={16} className="animate-spin text-neon-cyan" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-[rgba(0,217,255,0.1)]">
            <div className="flex items-center gap-2 bg-[rgba(0,217,255,0.03)] border border-[rgba(0,217,255,0.1)] rounded-xl px-3 py-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Întreabă-mă orice..."
                className="flex-1 bg-transparent text-sm text-white placeholder-dark-400 py-2.5 outline-none"
                id="ai-chat-input"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  input.trim() && !loading
                    ? 'bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 border border-neon-cyan/30'
                    : 'bg-dark-600 text-dark-400'
                }`}
                id="ai-chat-send"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
