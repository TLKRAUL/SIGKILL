import { useState, useEffect, useRef } from 'react';
import {
  FileText, CheckCircle2, XCircle, Clock, Loader2, X,
  Camera, Upload, Search, Trash2, TrendingUp, ScanLine, Plus
} from 'lucide-react';
import { getBills, scanBill, updateBill, deleteBill, findBetterSupplier, getUserData, setUserData } from '../api/apiClient';

const statusConfig = {
  paid: { label: 'Plătit', color: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
  unpaid: { label: 'Scadent', color: '#dc2626', bg: 'rgba(220,38,38,0.12)' },
  pending: { label: 'Nepreparat', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

const serviceEmojis = {
  'Curent Electric': '⚡', 'Gaz Natural': '🔥', 'Apă': '💧', 'Internet': '📡',
  'TV': '📺', 'Chirie': '🏠', 'Telefon': '📱',
};

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScan, setShowScan] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanFile, setScanFile] = useState(null);
  const [scanPreview, setScanPreview] = useState(null);
  const [scanError, setScanError] = useState('');
  const [supplierModal, setSupplierModal] = useState(null);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplierResult, setSupplierResult] = useState(null);
  const [showAddRecurring, setShowAddRecurring] = useState(false);
  const [newRecurring, setNewRecurring] = useState({ name: '', amount: '', emoji: '💳', cycle: 'lunar' });
  const [recurring, setRecurringState] = useState(() => {
    try { return getUserData('recurring', []); } catch { return []; }
  });
  const setRecurring = (val) => {
    const data = typeof val === 'function' ? val(recurring) : val;
    setRecurringState(data);
    setUserData('recurring', data);
    return data;
  };
  const fileRef = useRef(null);

  useEffect(() => { loadBills(); }, []);

  const loadBills = async () => {
    setLoading(true);
    try { const data = await getBills(); setBills(data || []); } catch {}
    setLoading(false);
  };

  const handlePay = async (id) => {
    try {
      const bill = bills.find(b => b._id === id);
      const updated = await updateBill(id, { status: 'paid' });
      setBills(prev => prev.map(b => b._id === id ? updated : b));
      // Adaugă suma facturii la cheltuielile din buget
      if (bill?.amount) {
        const currentSpent = getUserData('spent', 0);
        setUserData('spent', currentSpent + bill.amount);
      }
    } catch {}
  };

  const handleDelete = async (id) => {
    try { await deleteBill(id); setBills(prev => prev.filter(b => b._id !== id)); } catch {}
  };

  const handleScanFile = (file) => {
    if (!file) return;
    setScanFile(file); setScanError('');
    const reader = new FileReader();
    reader.onloadend = () => setScanPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleScanSubmit = async () => {
    if (!scanFile) return;
    setScanning(true); setScanError('');
    try {
      const data = await scanBill(scanFile);
      if (data?.bill) { setBills(prev => [data.bill, ...prev]); setShowScan(false); setScanFile(null); setScanPreview(null); }
    } catch (err) { setScanError(err?.response?.data?.error || 'Nu am putut scana factura'); }
    setScanning(false);
  };

  const handleFindBetter = async (bill) => {
    setSupplierModal(bill); setSupplierResult(null); setSupplierLoading(true);
    try { const data = await findBetterSupplier(bill.service, bill.provider, bill.amount); setSupplierResult(data); }
    catch { setSupplierResult({ analysis: 'Nu am putut analiza.', alternatives: [], tip: '' }); }
    setSupplierLoading(false);
  };

  const totalDue = bills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);
  const unpaidCount = bills.filter(b => b.status !== 'paid').length;
  const paidCount = bills.filter(b => b.status === 'paid').length;

  const getEmoji = (service) => {
    for (const [k, v] of Object.entries(serviceEmojis)) {
      if (service?.toLowerCase().includes(k.toLowerCase())) return v;
    }
    return '📄';
  };

  const glass = { background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(30px) saturate(140%)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' };

  return (
    <div id="bills-page" style={{
      position: 'fixed', inset: 0, zIndex: 10,
      fontFamily: "'Inter',-apple-system,sans-serif",
      background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 25%, #e0f7fa 50%, #b2dfdb 75%, #e0f2f1 100%)',
    }}>
      {/* Orbs */}
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(77,208,200,0.12) 0%,transparent 70%)', top:'-10%', right:'-5%', animation:'billFloat1 10s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,0.06) 0%,transparent 70%)', bottom:'5%', left:'-5%', animation:'billFloat2 12s ease-in-out infinite', pointerEvents:'none' }} />

      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 100, overflow: 'auto' }}>
        <div style={{ maxWidth: 960, width: '100%', margin: '0 auto', padding: '0 32px 40px' }}>

          {/* Header */}
          <div style={{ marginBottom: 28, animation: 'billFadeUp 0.7s cubic-bezier(.22,1,.36,1) both' }}>
            <h1 style={{ fontSize: 42, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.1, letterSpacing: '-0.03em' }}>Facturi & <span className="gradient-text">Utilități</span></h1>
            <p style={{ fontSize: 14, color: '#777', marginTop: 6 }}>Gestionează facturile tale cu AI-ul nostru inteligent.</p>
          </div>

          {/* Stat Cards */}
          <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Facturi Scadente', val: unpaidCount, sub: 'Necesită acțiune', icon: <FileText size={18} style={{ color: '#dc2626' }} />, valColor: '#dc2626' },
              { label: 'Sumă Totală', val: `${totalDue.toLocaleString()} RON`, sub: 'Valoare totală estimată', icon: <TrendingUp size={18} style={{ color: '#f59e0b' }} />, valColor: '#1a1a1a' },
              { label: 'Plătite Luna Asta', val: paidCount, sub: 'Din totalul lunii', icon: <CheckCircle2 size={18} style={{ color: '#16a34a' }} />, valColor: '#16a34a' },
            ].map((s, i) => (
              <div key={i} style={{
                ...glass, padding: '24px 28px',
                animation: `billFadeUp 0.7s cubic-bezier(.22,1,.36,1) ${0.1 + i * 0.05}s both`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
                  {s.icon}
                </div>
                <p style={{ fontSize: 32, fontWeight: 800, color: s.valColor, lineHeight: 1, marginBottom: 6 }}>{s.val}</p>
                <p style={{ fontSize: 11, color: '#999' }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Scan button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={() => setShowScan(true)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 50,
              background: '#1a1a1a', color: 'white', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
            }}>
              <ScanLine size={14} /> Scanează o factură nouă
            </button>
          </div>

          {/* Table */}
          <div style={{
            ...glass, overflow: 'hidden', padding: 0,
            animation: 'billFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.25s both'
          }}>
           <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '48px 1fr 1fr 120px 120px 80px', minWidth: 600,
              padding: '14px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)',
              fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              <span></span>
              <span>Furnizor</span>
              <span>Dată Scadență</span>
              <span>Suma</span>
              <span>Stare</span>
              <span></span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <Loader2 size={24} className="animate-spin" style={{ color: '#0d9488', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: '#888' }}>Se încarcă facturile...</p>
              </div>
            ) : bills.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>📄</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4 }}>Nicio factură încă</p>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Scanează prima factură</p>
                <button onClick={() => setShowScan(true)} style={{
                  padding: '10px 24px', borderRadius: 50, background: '#1a1a1a', color: 'white',
                  border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter'
                }}>
                  <Camera size={14} /> Scanează
                </button>
              </div>
            ) : (
              bills.map((bill) => {
                const st = statusConfig[bill.status] || statusConfig.unpaid;
                return (
                  <div key={bill._id} className="group" style={{
                    display: 'grid', gridTemplateColumns: '48px 1fr 1fr 120px 120px 80px', minWidth: 600,
                    padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.04)',
                    alignItems: 'center', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ fontSize: 16 }}>{getEmoji(bill.service)}</span>
                    <div>
                      <a href="#" style={{ fontSize: 14, fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}
                        onClick={e => { e.preventDefault(); if (bill.status !== 'paid') handleFindBetter(bill); }}>
                        {bill.provider || 'Furnizor'}
                      </a>
                      <p style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{bill.service}</p>
                    </div>
                    <span style={{ fontSize: 14, color: '#333' }}>
                      {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('ro-RO') : '—'}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{bill.amount} RON</span>
                    <div>
                      <span style={{
                        display: 'inline-flex', padding: '4px 12px', borderRadius: 50,
                        fontSize: 11, fontWeight: 600, background: st.bg, color: st.color
                      }}>{st.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      {bill.status !== 'paid' && (
                        <button onClick={() => handlePay(bill._id)} style={{
                          padding: '6px 12px', borderRadius: 8, background: '#1a1a1a', color: 'white',
                          border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter'
                        }}>Plătește</button>
                      )}
                      <button onClick={() => handleDelete(bill._id)} className="opacity-0 group-hover:opacity-100" style={{
                        padding: 6, borderRadius: 8, background: 'transparent', border: 'none',
                        color: '#999', cursor: 'pointer', transition: 'all 0.15s'
                      }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          </div>

          {/* Recurring Payments */}
          <div style={{ marginTop: 24, animation: 'billFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.3s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em' }}>🔁 Plăți Recurente</h2>
                <p style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Abonamente și plăți lunare automate</p>
              </div>
              <button onClick={() => setShowAddRecurring(true)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 50,
                background: '#1a1a1a', color: 'white', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                boxShadow: '0 2px 12px rgba(0,0,0,0.12)', transition: 'all 0.2s',
              }}>
                <Plus size={13} /> Adaugă
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
              {recurring.map((sub) => (
                <div key={sub.id} style={{
                  ...glass, padding: '20px', position: 'relative',
                  transition: 'all 0.25s', cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${sub.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {sub.emoji}
                    </div>
                    <button onClick={() => setRecurring(prev => prev.filter(r => r.id !== sub.id))} style={{
                      width: 24, height: 24, borderRadius: 50, border: 'none', background: 'rgba(0,0,0,0.03)',
                      color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s', fontSize: 12,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = 'rgba(220,38,38,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}>
                      <X size={11} />
                    </button>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>{sub.name}</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: sub.color }}>{sub.amount} <span style={{ fontSize: 11, fontWeight: 500, color: '#999' }}>RON/{sub.cycle === 'lunar' ? 'lună' : 'an'}</span></p>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                    <span style={{ fontSize: 10, color: '#999' }}>Activ</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total recurring */}
            <div style={{ ...glass, padding: '16px 24px', marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Total plăți recurente / lună</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>{recurring.reduce((s, r) => s + r.amount, 0).toFixed(2)} RON</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Recurring Modal */}
      {showAddRecurring && (
        <div className="modal-overlay" onClick={() => setShowAddRecurring(false)}>
          <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(40px) saturate(180%)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 420, animation: 'scaleIn 0.2s ease', boxShadow: '0 24px 48px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>Adaugă plată recurentă</h3>
              <button onClick={() => setShowAddRecurring(false)} style={{ width: 32, height: 32, borderRadius: 50, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.03)', color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            {/* Emoji picker */}
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 6 }}>Emoji</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {['💳', '🎥', '▶️', '🎵', '🏠', '💪', '🎮', '☁️', '📱', '🚗', '🎓', '📦'].map(e => (
              <button key={e} onClick={() => setNewRecurring(p => ({ ...p, emoji: e }))} style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 18,
                background: newRecurring.emoji === e ? 'rgba(77,208,200,0.12)' : 'rgba(0,0,0,0.02)',
                outline: newRecurring.emoji === e ? '2px solid #0d9488' : 'none',
              }}>{e}</button>
            ))}
            </div>

            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 6 }}>Nume</p>
            <input type="text" placeholder="ex: Disney+" value={newRecurring.name}
              onChange={e => setNewRecurring(p => ({ ...p, name: e.target.value }))}
              className="input" style={{ marginBottom: 12 }} />

            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 6 }}>Sumă (RON)</p>
            <input type="number" placeholder="29.99" value={newRecurring.amount}
              onChange={e => setNewRecurring(p => ({ ...p, amount: e.target.value }))}
              className="input" style={{ marginBottom: 12 }} />

            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 6 }}>Ciclu</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['lunar', 'anual'].map(c => (
                <button key={c} onClick={() => setNewRecurring(p => ({ ...p, cycle: c }))}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 50, border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                    background: newRecurring.cycle === c ? 'rgba(77,208,200,0.12)' : 'rgba(0,0,0,0.02)',
                    color: newRecurring.cycle === c ? '#0d9488' : '#888',
                  }}>
                  {c === 'lunar' ? '📅 Lunar' : '📆 Anual'}
                </button>
              ))}
            </div>

            <button onClick={() => {
              if (!newRecurring.name || !newRecurring.amount) return;
              const colors = ['#e50914', '#ff0000', '#1db954', '#6366f1', '#f59e0b', '#0d9488', '#8b5cf6', '#ec4899'];
              const amount = parseFloat(newRecurring.amount);
              setRecurring(prev => [...prev, { ...newRecurring, id: Date.now(), amount, color: colors[Math.floor(Math.random() * colors.length)] }]);
              // Adaugă la cheltuielile din buget
              const currentSpent = getUserData('spent', 0);
              setUserData('spent', currentSpent + amount);
              setNewRecurring({ name: '', amount: '', emoji: '💳', cycle: 'lunar' });
              setShowAddRecurring(false);
            }} disabled={!newRecurring.name || !newRecurring.amount}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 50, border: 'none',
                background: !newRecurring.name || !newRecurring.amount ? 'rgba(0,0,0,0.04)' : '#1a1a1a',
                color: !newRecurring.name || !newRecurring.amount ? '#999' : 'white',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: !newRecurring.name || !newRecurring.amount ? 'none' : '0 4px 20px rgba(0,0,0,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
              <Plus size={15} /> Adaugă plată
            </button>
          </div>
        </div>
      )}

      {/* Scan Modal */}
      {showScan && (
        <div className="modal-overlay" onClick={() => setShowScan(false)}>
          <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(40px) saturate(180%)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', animation: 'scaleIn 0.2s ease', boxShadow: '0 24px 48px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>Scanează o factură</h3>
              <button onClick={() => setShowScan(false)} style={{ width: 32, height: 32, borderRadius: 50, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.03)', color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>
            <div onClick={() => fileRef.current?.click()}
              style={{
                cursor: 'pointer', borderRadius: 16, border: '2px dashed rgba(0,0,0,0.1)',
                padding: scanPreview ? 12 : 40, transition: 'all 0.2s', textAlign: 'center'
              }}>
              <input ref={fileRef} type="file" accept="image/*" capture="environment"
                onChange={e => e.target.files?.[0] && handleScanFile(e.target.files[0])} className="hidden" />
              {scanPreview ? (
                <img src={scanPreview} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12 }} />
              ) : (
                <><Camera size={28} style={{ color: '#bbb', margin: '0 auto 12px' }} /><p style={{ fontSize: 14, color: '#999' }}>Click sau trage imaginea</p></>
              )}
            </div>
            {scanError && <p style={{ fontSize: 13, color: '#dc2626', marginTop: 12 }}>❌ {scanError}</p>}
            <button onClick={handleScanSubmit} disabled={!scanFile || scanning}
              style={{
                marginTop: 16, width: '100%', padding: '14px 0', borderRadius: 50,
                background: !scanFile || scanning ? 'rgba(0,0,0,0.04)' : '#1a1a1a',
                color: !scanFile || scanning ? '#999' : 'white',
                border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: !scanFile || scanning ? 'none' : '0 4px 20px rgba(0,0,0,0.15)',
              }}>
              {scanning ? <><Loader2 size={16} className="animate-spin" /> Se analizează...</> : <><Upload size={16} /> Scanează cu AI</>}
            </button>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {supplierModal && (
        <div className="modal-overlay" onClick={() => setSupplierModal(null)}>
          <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(40px) saturate(180%)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', animation: 'scaleIn 0.2s ease', boxShadow: '0 24px 48px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>🔍 Furnizor mai bun?</h3>
              <button onClick={() => setSupplierModal(null)} style={{ width: 32, height: 32, borderRadius: 50, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.03)', color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>
            <div style={{ padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: '#999' }}>Acum plătești:</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{supplierModal.provider} — {supplierModal.amount} RON/lună</p>
              <p style={{ fontSize: 11, color: '#999' }}>{supplierModal.service}</p>
            </div>
            {supplierLoading ? (
              <div style={{ textAlign: 'center', padding: 32 }}>
                <Loader2 size={24} className="animate-spin" style={{ color: '#0d9488', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: '#999' }}>AI caută alternative...</p>
              </div>
            ) : supplierResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 14, color: '#555' }}>{supplierResult.analysis}</p>
                {supplierResult.alternatives?.map((alt, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 14, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div><p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{alt.provider}</p><p style={{ fontSize: 11, color: '#999' }}>{alt.details}</p></div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0d9488' }}>~{alt.estimatedPrice} RON</p>
                      {alt.savings > 0 && <p style={{ fontSize: 10, fontWeight: 600, color: '#16a34a' }}>economie {alt.savings} RON</p>}
                    </div>
                  </div>
                ))}
                {supplierResult.tip && <p style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>💡 {supplierResult.tip}</p>}
              </div>
            ) : null}
          </div>
        </div>
      )}
      <style>{`
        @keyframes billFadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes billFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-12px,10px)} }
        @keyframes billFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,-12px)} }
      `}</style>
    </div>
  );
}
