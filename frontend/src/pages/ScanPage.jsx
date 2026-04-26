import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera, Upload, Loader2, CheckCircle2, X, Image as ImageIcon,
  Package, RefreshCw, FileText, ShoppingBag, ScanLine, Settings, Copy
} from 'lucide-react';
import { uploadReceipt, scanProduct, getBills, getReceipts } from '../api/apiClient';

const tabs = [
  { id: 'receipt', label: 'Bon fiscal', emoji: '🧾' },
  { id: 'product', label: 'Produs', emoji: '📦' },
];

const tips = {
  receipt: [
    { emoji: '💡', text: 'Bonul trebuie să fie bine iluminat' },
    { emoji: '🔍', text: 'Textul să fie vizibil, fără cute' },
    { emoji: '🏪', text: 'Suportă bonuri de la orice magazin din RO' },
  ],
  product: [
    { emoji: '📸', text: 'Fotografiază eticheta cu numele vizibil' },
    { emoji: '🏷️', text: 'Prețul și marca vor fi detectate automat' },
    { emoji: '📅', text: 'Poți seta data expirare manual' },
  ],
};

const categories = [
  { name: 'Groceries', emoji: '🛒' },
  { name: 'Utilities', emoji: '⚡' },
  { name: 'Health', emoji: '💊' },
];

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState('receipt');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [recentScans, setRecentScans] = useState([]);
  const [scanStats, setScanStats] = useState({ receipts: 0, products: 0, total: 0 });
  const fileInputRef = useRef(null);

  useEffect(() => {
    Promise.all([
      getReceipts().catch(() => []),
      getBills().catch(() => []),
    ]).then(([receipts, bills]) => {
      const receiptItems = (receipts || []).map(r => ({
        date: r.scanDate ? new Date(r.scanDate).toLocaleDateString('ro-RO') : '—',
        store: r.storeName || 'Necunoscut',
        amount: `-${r.totalAmount?.toFixed(2) || '0.00'}`,
      }));
      const billItems = (bills || []).map(b => ({
        date: b.dueDate ? new Date(b.dueDate).toLocaleDateString('ro-RO') : '—',
        store: b.provider || 'Necunoscut',
        amount: `-${b.amount?.toFixed(2) || '0.00'}`,
      }));
      setRecentScans([...receiptItems, ...billItems].slice(0, 8));
      const totalProducts = (receipts || []).reduce((s, r) => s + (r.items?.length || 0), 0);
      const totalAmount = (receipts || []).reduce((s, r) => s + (r.totalAmount || 0), 0);
      setScanStats({ receipts: (receipts || []).length, products: totalProducts, total: totalAmount });
    });
  }, [result]);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Încarcă o imagine (JPG, PNG, WebP)'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Max 10MB'); return; }
    setError(null); setResult(null); setFileName(file.name); setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleScan = async () => {
    if (!selectedFile) return;
    setLoading(true); setError(null);
    try {
      let data;
      if (activeTab === 'receipt') {
        setProgress('AI analizează bonul...');
        data = await uploadReceipt(selectedFile);
      } else {
        setProgress('AI identifică produsul...');
        data = await scanProduct(selectedFile, expiryDate || null);
      }
      setResult(data); setProgress('');
      // Adaugă suma bonului la cheltuielile din buget
      const totalAmount = data?.receipt?.totalAmount || data?.product?.price || 0;
      if (totalAmount > 0) {
        const currentSpent = Number(localStorage.getItem('sigkill_spent')) || 0;
        localStorage.setItem('sigkill_spent', currentSpent + totalAmount);
      }
    } catch (err) {
      const serverError = err?.response?.data;
      const status = err?.response?.status;
      let errorMsg = serverError?.error || serverError?.details || 'Nu am putut procesa imaginea';
      if (status === 429 || errorMsg.includes('quota') || errorMsg.includes('Prea multe')) {
        errorMsg = 'Limita AI atinsă. Așteaptă 30-60s.';
      }
      if (serverError?.hint) errorMsg += ` (${serverError.hint})`;
      setError(errorMsg); setProgress('');
    } finally { setLoading(false); }
  };

  const reset = () => {
    setPreview(null); setSelectedFile(null); setFileName(''); setResult(null);
    setError(null); setProgress(''); setExpiryDate('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const switchTab = (id) => { setActiveTab(id); reset(); };

  const glass = { background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(30px) saturate(140%)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' };

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", position: 'relative', overflow: 'hidden' }} id="scan-page">
      {/* Orbs */}
      <div style={{ position:'absolute', width:450, height:450, borderRadius:'50%', background:'radial-gradient(circle,rgba(77,208,200,0.1) 0%,transparent 70%)', top:'-10%', right:'-5%', animation:'scanFloat1 10s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,0.06) 0%,transparent 70%)', bottom:'5%', left:'-5%', animation:'scanFloat2 12s ease-in-out infinite', pointerEvents:'none' }} />

      <div className="dashboard-charts-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 6fr 4fr', gap: 16, position: 'relative', zIndex: 2 }}>

        {/* ===== LEFT COLUMN ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...glass, padding: '20px', animation: 'scanFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.1s both' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#999', marginBottom: 12 }}>Glimpse de Cămară</p>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <span style={{ fontSize: 24, display: 'block', marginBottom: 6 }}>📦</span>
              <p style={{ fontSize: 11, color: '#999' }}>Scanează produse pentru a popula cămara</p>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ ...glass, padding: '20px', animation: 'scanFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.15s both' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#999', marginBottom: 12 }}>📊 Statistici Scan</p>
            {[
              { label: 'Bonuri scanate', val: `${scanStats.receipts}`, color: '#0d9488' },
              { label: 'Produse adăugate', val: `${scanStats.products}`, color: '#2563eb' },
              { label: 'Total scanat', val: `${scanStats.total.toFixed(2)} RON`, color: '#16a34a' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                <span style={{ fontSize: 11, color: '#777' }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== CENTER COLUMN ===== */}
        <div>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 24, animation: 'scanFadeUp 0.7s cubic-bezier(.22,1,.36,1) both' }}>
            <h1 style={{ fontSize: 42, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Scanează cu <span className="gradient-text">Claude AI</span>
            </h1>

            {/* Tabs */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: 4, borderRadius: 50, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.6)' }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => switchTab(tab.id)} id={`tab-${tab.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 50,
                    fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    background: activeTab === tab.id ? '#1a1a1a' : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#888',
                  }}>
                  <span>{tab.emoji}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Status */}
          {loading && (
            <div style={{ marginBottom: 16, animation: 'scanFadeUp 0.3s ease both' }}>
              <div style={{ ...glass, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Loader2 size={12} style={{ animation: 'spin 1s linear infinite', color: '#0d9488' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0d9488' }}>AI Scanning:</span>
                <span style={{ fontSize: 11, color: '#555' }}>{progress || 'Se procesează...'}</span>
              </div>
            </div>
          )}

          {/* Scanner Card */}
          <div style={{ ...glass, padding: '28px', animation: 'scanFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.15s both' }}>
            {result ? (
              <div className="animate-scale-in">
                <div className="flex items-center gap-2 text-success mb-4">
                  <CheckCircle2 size={18} />
                  <span className="font-semibold text-sm">{result.message || 'Procesat cu succes!'}</span>
                </div>

                {/* Receipt result */}
                {activeTab === 'receipt' && result.products && (
                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {result.products.map((p, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/6 border border-white/10">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Package size={13} className="text-accent-solid flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-sm text-text-primary truncate block">{p.name}</span>
                            <span className="text-[10px] text-text-muted">{p.category} · {Number(p.quantity || 1).toLocaleString('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} {p.unit}</span>
                          </div>
                        </div>
                        {p.price > 0 && <span className="text-xs font-mono text-success ml-2">{p.price.toFixed(2)} lei</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Product result */}
                {activeTab === 'product' && result.product && (
                  <div className="px-4 py-4 rounded-xl bg-white/6 border border-white/10 mb-4">
                    <p className="text-base font-bold text-text-primary">{result.product.name}</p>
                    {result.product.brand && <p className="text-xs text-text-muted mt-0.5">{result.product.brand}</p>}
                    <p className="text-xs text-text-secondary mt-1">{result.product.category} · {Number(result.product.quantity || 1).toLocaleString('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} {result.product.unit}</p>
                    {result.product.description && <p className="text-xs text-text-muted mt-2 italic">{result.product.description}</p>}
                  </div>
                )}


                <button onClick={reset} className="btn btn-secondary w-full">
                  <RefreshCw size={14} /> Scanează altceva
                </button>
              </div>
            ) : (
              <>
                {/* Drop Zone */}
                <div
                  onDragEnter={handleDrag} onDragLeave={handleDrag}
                  onDragOver={handleDrag} onDrop={handleDrop}
                  onClick={() => !loading && fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all ${
                    loading ? 'border-accent-solid/30 bg-accent-muted pointer-events-none'
                      : dragActive ? 'border-success bg-success-muted scale-[1.01]'
                      : preview ? 'border-border-active bg-white/5' : 'border-white/15 hover:border-white/30 hover:bg-white/5'
                  } ${preview ? 'p-3' : 'p-10'}`}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />

                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="Preview" className={`w-full h-48 object-cover rounded-xl ${loading ? 'opacity-50' : ''}`} />
                      {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-xl backdrop-blur-sm">
                          <Loader2 size={28} className="animate-spin text-accent-solid mb-2" />
                          <span className="text-xs text-text-secondary">{progress}</span>
                        </div>
                      )}
                      {!loading && (
                        <button onClick={e => { e.stopPropagation(); reset(); }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white border border-white/15">
                          <X size={16} />
                        </button>
                      )}
                      {!loading && <div className="mt-3 flex items-center gap-2 text-xs text-text-muted"><ImageIcon size={14} /><span className="truncate">{fileName}</span></div>}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/8 border border-white/15 flex items-center justify-center">
                        <Camera size={28} className="text-text-muted" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-text-primary mb-1">Trage imaginea aici sau click pentru upload</p>
                        <p className="text-[11px] text-text-muted">JPG, PNG, WebP · Max 10MB · Pe telefon poți face poză direct</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expiry for product */}
                {activeTab === 'product' && preview && !loading && (
                  <div className="mt-4 animate-slide-down">
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">📅 Data expirare (opțional)</label>
                    <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="input" />
                  </div>
                )}

                {error && (
                  <div className="mt-3 px-4 py-3 rounded-xl bg-danger-muted text-danger text-xs font-medium animate-scale-in">
                    ❌ {error}
                  </div>
                )}

                <button onClick={handleScan} disabled={!preview || loading}
                  className={`mt-5 w-full btn btn-primary btn-lg ${!preview || loading ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  {loading ? <><Loader2 size={18} className="animate-spin" /> {progress || 'Se procesează...'}</>
                    : <><Upload size={18} /> Scanează cu AI</>}
                </button>
              </>
            )}
          </div>

          {/* Tips */}
          <div style={{ ...glass, padding: '24px', marginTop: 16, animation: 'scanFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.25s both' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', marginBottom: 16 }}>Sfaturi pentru Scanare Rapidă</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tips[activeTab].map((tip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#555' }}>
                  <span style={{ fontSize: 16 }}>{tip.emoji}</span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recent scans */}
          <div style={{ ...glass, padding: '24px', animation: 'scanFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.2s both' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', marginBottom: 16 }}>Ultimele Scanări</p>
            {recentScans.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: 30, display: 'block', marginBottom: 8 }}>📋</span>
                <p style={{ fontSize: 12, color: '#999' }}>Nu sunt scanări momentan</p>
                <p style={{ fontSize: 10, color: '#bbb', marginTop: 4 }}>Scanează un bon sau produs</p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', padding: '4px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999' }}>
                  <span style={{ flex: 1 }}>Dată</span>
                  <span style={{ flex: 1 }}>Furnizor</span>
                  <span style={{ width: 64, textAlign: 'right' }}>Sumă</span>
                </div>
                {recentScans.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '8px', borderRadius: 10, transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ flex: 1, fontSize: 11, color: '#555' }}>{s.date}</span>
                    <span style={{ flex: 1, fontSize: 11, color: '#1a1a1a', fontWeight: 500 }}>{s.store}</span>
                    <span style={{ width: 64, fontSize: 11, fontFamily: 'monospace', color: '#dc2626', textAlign: 'right' }}>{s.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div style={{ ...glass, padding: '24px', animation: 'scanFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.25s both' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>Categorii</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {categories.map((c, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {c.emoji}
                  </div>
                  <span style={{ fontSize: 10, color: '#999' }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...glass, padding: '24px', animation: 'scanFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.3s both' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>🧠 AI Insights</p>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <span style={{ fontSize: 24, display: 'block', marginBottom: 6 }}>✨</span>
              <p style={{ fontSize: 11, color: '#999' }}>Scanează bonuri pentru a primi insights personalizate</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanFadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes scanFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-12px,10px)} }
        @keyframes scanFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,-12px)} }
      `}</style>
    </div>
  );
}
