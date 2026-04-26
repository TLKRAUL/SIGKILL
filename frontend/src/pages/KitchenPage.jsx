import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Search, RefreshCw, X, Clock, Sparkles, Brain, Trash2, CalendarDays, Check, ChefHat, Flame, Users, Lightbulb
} from 'lucide-react';
import { getPantryItems, addItem, deleteItem, updateItem, getRecipes, useRecipe, getUserData, setUserData } from '../api/apiClient';

const categories = ['Toate', 'Lactate', 'Fructe', 'Legume', 'Carne', 'Panificație', 'Băuturi', 'Conserve', 'Condimente', 'Dulciuri', 'Altele'];
const units = ['buc', 'kg', 'g', 'L', 'ml'];

const mealTypes = [
  { label: 'Mic Dejun', emoji: '🌅' },
  { label: 'Prânz', emoji: '🍽️' },
  { label: 'Cină', emoji: '🌙' },
];

const dietOptions = [
  { label: 'Vegan', emoji: '🌱' },
  { label: 'Vegetarian', emoji: '🥬' },
  { label: 'Fără Lactoză', emoji: '🥛' },
  { label: 'Fără Gluten', emoji: '🌾' },
  { label: 'Alergeni', emoji: '⚠️' },
];

const wasteData = [
  { day: 'L', v: 0 }, { day: 'M', v: 0 }, { day: 'Mi', v: 0 },
  { day: 'J', v: 0 }, { day: 'V', v: 0 }, { day: 'S', v: 0 }, { day: 'D', v: 0 },
];

export default function KitchenPage() {
  const [items, setItems] = useState([]);
  const [recipe, setRecipe] = useState(() => {
    try { return getUserData('recipe', null); } catch { return null; }
  });
  const [allRecipes, setAllRecipes] = useState(() => {
    try { return getUserData('all_recipes', []); } catch { return []; }
  });
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [activeMeal, setActiveMeal] = useState(1);
  const [activeDiets, setActiveDiets] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Toate');
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'Altele', quantity: 1, unit: 'buc', expiryDate: '' });
  const [adding, setAdding] = useState(false);
  const [usingRecipe, setUsingRecipe] = useState(false);
  const [recipeMsg, setRecipeMsg] = useState(null);
  const maxW = Math.max(...wasteData.map(w => w.v));

  useEffect(() => { loadItems(); if (!recipe) loadRecipe(); }, []);

  const loadItems = async () => {
    try {
      const data = await getPantryItems();
      if (data) setItems(data);
    } catch {}
  };

  const loadRecipe = async () => {
    setLoadingRecipe(true);
    try {
      const data = await getRecipes();
      if (Array.isArray(data) && data.length > 0) {
        setRecipe(data[0]);
        setAllRecipes(data);
        setUserData('recipe', data[0]);
        setUserData('all_recipes', data);
      }
    } catch {}
    setLoadingRecipe(false);
  };

  const switchRecipe = (r) => {
    setRecipe(r);
    setUserData('recipe', r);
    setRecipeMsg(null);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    setAdding(true);
    try {
      const saved = await addItem({
        ...newItem,
        expiryDate: newItem.expiryDate || null,
      });
      setItems(prev => [saved, ...prev]);
      setNewItem({ name: '', category: 'Altele', quantity: 1, unit: 'buc', expiryDate: '' });
      setShowAdd(false);
    } catch {}
    setAdding(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setItems(prev => prev.filter(i => (i._id || i.id) !== id));
    } catch {}
  };

  const [editingExpiry, setEditingExpiry] = useState(null);
  const [editDate, setEditDate] = useState('');

  const handleUpdateExpiry = async (id) => {
    if (!editDate) return;
    try {
      const updated = await updateItem(id, { expiryDate: editDate });
      setItems(prev => prev.map(i => (i._id || i.id) === id ? { ...i, expiryDate: editDate } : i));
    } catch {}
    setEditingExpiry(null);
    setEditDate('');
  };

  const getDays = (d) => {
    if (!d) return null;
    return Math.ceil((new Date(d) - new Date()) / 86400000);
  };

  const filtered = items.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== 'Toate' && i.category !== filterCat) return false;
    return true;
  });

  return (
    <>
    <div style={{ fontFamily: "'Inter',-apple-system,sans-serif", position: 'relative', overflow: 'hidden' }} id="kitchen-page">

      {/* Orbs */}
      <div style={{ position:'absolute', width:450, height:450, borderRadius:'50%', background:'radial-gradient(circle,rgba(77,208,200,0.1) 0%,transparent 70%)', top:'-10%', right:'-5%', animation:'kitchenFloat1 10s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)', bottom:'5%', left:'-5%', animation:'kitchenFloat2 12s ease-in-out infinite', pointerEvents:'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, position: 'relative', zIndex: 2, animation: 'kitFadeUp 0.7s cubic-bezier(.22,1,.36,1) both' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0d9488', marginBottom: 8 }}>🍳 Bucătărie & Rețete</p>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.1, letterSpacing: '-0.03em' }}>Ce ai prin frigider?</h1>
        </div>
        <button onClick={() => setShowAdd(true)} id="add-product-btn" style={{
          padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 700,
          background: '#1a1a1a', color: 'white', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transition: 'all 0.25s',
        }}>
          <Plus size={14} /> Adaugă produs
        </button>
      </div>

      {/* Add Product Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-text-primary">Adaugă produs nou</h3>
              <button onClick={() => setShowAdd(false)} className="btn btn-ghost !p-2"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Nume produs *</label>
                <input value={newItem.name} onChange={e => setNewItem(p => ({...p, name: e.target.value}))}
                  placeholder="ex: Lapte Zuzu 1L" className="input" required id="add-name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Categorie</label>
                  <select value={newItem.category} onChange={e => setNewItem(p => ({...p, category: e.target.value}))}
                    className="input" id="add-category">
                    {categories.filter(c => c !== 'Toate').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Unitate</label>
                  <select value={newItem.unit} onChange={e => setNewItem(p => ({...p, unit: e.target.value}))}
                    className="input" id="add-unit">
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Cantitate</label>
                  <input type="number" min="0" step="any" value={newItem.quantity}
                    onChange={e => setNewItem(p => ({...p, quantity: Number(e.target.value)}))}
                    className="input" id="add-quantity" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">📅 Data expirare</label>
                  <input type="date" value={newItem.expiryDate}
                    onChange={e => setNewItem(p => ({...p, expiryDate: e.target.value}))}
                    className="input" id="add-expiry" />
                </div>
              </div>
              <button type="submit" disabled={adding} className="btn btn-primary w-full btn-lg" id="add-submit">
                {adding ? <RefreshCw size={16} className="animate-spin" /> : <>Adaugă în cămară</>}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard-charts-grid" style={{ display: 'grid', gridTemplateColumns: '4fr 3fr 5fr', gap: 16, position: 'relative', zIndex: 2 }}>
        {/* Inventar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(30px) saturate(140%)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.04)', padding: '24px', animation: 'kitFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.1s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.01em' }}>📦 Cămară ({filtered.length})</h3>
            </div>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Caută..." value={search}
                onChange={e => setSearch(e.target.value)} className="input text-xs !pl-9 !py-2" />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {['Toate', 'Lactate', 'Fructe', 'Carne', 'Legume'].map(c => (
                <button key={c} onClick={() => setFilterCat(c)}
                  style={{
                    fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 50,
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                    background: filterCat === c ? 'rgba(77,208,200,0.15)' : 'rgba(0,0,0,0.03)',
                    color: filterCat === c ? '#0d9488' : '#888',
                  }}>{c}</button>
              ))}
            </div>
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto">
              {filtered.slice(0, 15).map((item, i) => {
                const days = getDays(item.expiryDate);
                return (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-bg-surface border border-border hover:border-border-hover transition-all group">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-text-primary truncate">{item.name}</p>
                      <p className="text-[10px] text-text-muted">{item.quantity} {item.unit} · {item.category}</p>
                      {editingExpiry === (item._id || item.id) && (
                        <div className="flex items-center gap-1.5 mt-1.5 animate-fade-in">
                          <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
                            className="text-[10px] px-2 py-1 rounded-md border border-border bg-bg-base text-text-primary outline-none focus:border-accent-solid/40 w-28" />
                          <button onClick={() => handleUpdateExpiry(item._id || item.id)}
                            className="w-5 h-5 rounded-md bg-success-muted flex items-center justify-center text-success"><Check size={10} /></button>
                          <button onClick={() => setEditingExpiry(null)}
                            className="w-5 h-5 rounded-md bg-danger-muted flex items-center justify-center text-danger"><X size={10} /></button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${days === null ? 'badge-neutral' : days < 0 ? 'badge-danger' : days <= 3 ? 'badge-warning' : days <= 7 ? 'badge-info' : 'badge-success'}`}>
                        {days !== null ? (days < 0 ? 'expirat' : `${days}z`) : '—'}
                      </span>
                      <button onClick={() => { setEditingExpiry(item._id || item.id); setEditDate(item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-accent text-text-muted hover:text-accent-solid" title="Schimbă expirarea">
                        <CalendarDays size={12} />
                      </button>
                      <button onClick={() => handleDelete(item._id || item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-danger-muted text-text-muted hover:text-danger">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && <p className="text-sm text-text-muted text-center py-6">Niciun produs găsit</p>}
            </div>
          </div>
        </div>

        {/* Preferinte */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(30px) saturate(140%)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.04)', padding: '24px', animation: 'kitFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.15s both' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 16, textAlign: 'center', letterSpacing: '-0.01em' }}>🍽️ Tip masă</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {mealTypes.map((m, i) => (
                <button key={i} onClick={() => setActiveMeal(i)}
                  className={`toggle-btn flex-col gap-1 !py-3 justify-center ${i === activeMeal ? 'active' : ''}`}>
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-[10px]">{m.label}</span>
                </button>
              ))}
            </div>
            <hr className="divider mb-4" />
            <h4 className="section-label mb-2 text-center">diete</h4>
            <div className="space-y-1.5">
              {dietOptions.map((d, i) => (
                <button key={i} onClick={() => setActiveDiets(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])}
                  className={`toggle-btn w-full justify-start ${activeDiets.includes(i) ? 'active' : ''}`}>
                  <span>{d.emoji}</span>
                  <span className="flex-1 text-left text-xs">{d.label}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${activeDiets.includes(i) ? 'border-accent-solid bg-accent-solid' : 'border-text-muted'}`}>
                    {activeDiets.includes(i) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reteta + Risipa */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(30px) saturate(140%)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.04)', padding: '28px', animation: 'kitFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.2s both', flex: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.01em' }}>✨ Rețetă sugerată</h3>
              <button onClick={loadRecipe} disabled={loadingRecipe} className="btn btn-ghost btn-sm">
                <RefreshCw size={12} className={loadingRecipe ? 'animate-spin' : ''} /> generează noi
              </button>
            </div>
            {/* Recipe tabs */}
            {allRecipes.length > 1 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {allRecipes.map((r, i) => (
                  <button key={i} onClick={() => switchRecipe(r)}
                    style={{
                      padding: '6px 14px', borderRadius: 50, fontSize: 11, fontWeight: 600,
                      border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                      background: recipe?.name === r.name ? '#1a1a1a' : 'rgba(0,0,0,0.03)',
                      color: recipe?.name === r.name ? 'white' : '#888',
                    }}>{i+1}. {r.name?.split(' ').slice(0,2).join(' ')}</button>
                ))}
              </div>
            )}
            {recipe ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h4 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em' }}>{recipe.name}</h4>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{recipe.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {[
                    { icon: <Clock size={12} />, text: `${recipe.time} min` },
                    { icon: null, text: `👨‍🍳 ${recipe.difficulty}` },
                    recipe.servings && { icon: <Users size={12} />, text: `${recipe.servings} porții` },
                    recipe.calories && { icon: <Flame size={12} />, text: `${recipe.calories} kcal` },
                  ].filter(Boolean).map((item, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                      borderRadius: 50, background: 'rgba(0,0,0,0.03)', fontSize: 11, fontWeight: 500, color: '#777',
                    }}>{item.icon}{item.text}</span>
                  ))}
                </div>
                {/* Ingredients */}
                {recipe.ingredients && (
                  <div style={{ marginTop: 4 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: 6 }}>ingrediente</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                      {recipe.ingredients.slice(0, 6).map((ing, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#555', padding: '5px 8px', borderRadius: 8, background: 'rgba(0,0,0,0.02)' }}>
                          <span style={{ color: '#0d9488', fontWeight: 700 }}>•</span>
                          {typeof ing === 'object' 
                            ? <span><strong>{ing.quantity} {ing.unit}</strong> {ing.name}</span>
                            : <span>{ing}</span>
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 12 }}>
                  <button onClick={() => setShowRecipeModal(true)}
                    style={{
                      width: '100%', padding: '12px 0', borderRadius: 50, border: 'none',
                      background: '#1a1a1a', color: 'white', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      transition: 'all 0.2s',
                    }}>
                    <ChefHat size={14} /> Vezi rețeta completă
                  </button>
                </div>
                {recipeMsg && (
                  <div style={{ fontSize: 12, marginTop: 4, padding: '8px 12px', borderRadius: 10, background: recipeMsg.type === 'success' ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)', color: recipeMsg.type === 'success' ? '#16a34a' : '#dc2626' }}>
                    {recipeMsg.text}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#999', fontSize: 13 }}>
                {loadingRecipe ? <><RefreshCw size={14} className="animate-spin" style={{ display: 'inline', marginRight: 4 }} /> AI generează rețete...</> : 'Apasă „generează noi" pentru rețete'}
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(30px) saturate(140%)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.04)', padding: '24px', animation: 'kitFadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.25s both' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 12, letterSpacing: '-0.01em' }}>📊 Risipă săptămânală</h3>
            <div className="flex items-end gap-2 h-24">
              {wasteData.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md transition-all" style={{
                    height: `${(w.v / maxW) * 100}%`,
                    background: w.v > 5 ? 'rgba(220,38,38,0.15)' : 'rgba(37,99,235,0.12)',
                  }} />
                  <span className="text-[9px] text-text-muted">{w.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes kitFadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes kitchenFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-12px,10px)} }
        @keyframes kitchenFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,-12px)} }
      `}</style>

    </div>

    {showRecipeModal && recipe && createPortal(
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          onClick={() => setShowRecipeModal(false)} />
        
        {/* Modal Card */}
        <div style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth: 640, maxHeight: '85vh',
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(40px) saturate(180%)',
          borderRadius: 24, display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.7)',
          animation: 'slideUp 0.3s ease', overflow: 'hidden',
        }} onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{recipe.name}</h2>
                <p style={{ fontSize: 13, color: '#777', marginTop: 6 }}>{recipe.description}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 50, fontSize: 11, fontWeight: 600, background: 'rgba(77,208,200,0.12)', color: '#0d9488' }}>
                    <Clock size={10} /> {recipe.time} min
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 50, fontSize: 11, fontWeight: 600, background: 'rgba(77,208,200,0.12)', color: '#0d9488' }}>
                    👨‍🍳 {recipe.difficulty}
                  </span>
                  {recipe.servings && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: 'rgba(249,115,22,0.08)', color: '#ea580c' }}><Users size={10} /> {recipe.servings} porții</span>}
                  {recipe.calories && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500, background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}><Flame size={10} /> {recipe.calories} kcal</span>}
                </div>
              </div>
              <button onClick={() => setShowRecipeModal(false)}
                style={{ width: 36, height: 36, borderRadius: 50, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(0,0,0,0.03)', color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <X size={16} />
              </button>
            </div>
          </div>
          
          {/* Scrollable Content */}
          <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1, minHeight: 0 }}>
            {/* Ingredients */}
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 14 }}>Ingrediente</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 24 }}>
              {recipe.ingredients?.map((ing, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 14, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', fontSize: 13 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d9488', flexShrink: 0 }} />
                  {typeof ing === 'object' ? (
                    <span style={{ color: '#555' }}><strong style={{ color: '#1a1a1a' }}>{ing.quantity} {ing.unit}</strong> {ing.name}</span>
                  ) : (
                    <span style={{ color: '#555' }}>{ing}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Steps */}
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 14 }}>Pași de preparare</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {recipe.steps?.map((s, i) => {
                const step = typeof s === 'object' ? s : { instruction: s, time: null };
                return (
                  <div key={i} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 50, background: '#1a1a1a', color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {step.step || i + 1}
                    </div>
                    <div style={{ flex: 1, paddingTop: 4 }}>
                      <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>{step.instruction || s}</p>
                      {step.time && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 11, padding: '2px 8px', borderRadius: 50, background: 'rgba(77,208,200,0.1)', color: '#0d9488' }}><Clock size={9} /> {step.time} min</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tips */}
            {recipe.tips && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px', borderRadius: 16, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                <Lightbulb size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>{recipe.tips}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '20px 32px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <button onClick={async () => {
              if (!recipe.ingredients?.length) return;
              setUsingRecipe(true); setRecipeMsg(null);
              try {
                const ingNames = recipe.ingredients.map(ing => typeof ing === 'object' ? `${ing.name} ${ing.quantity}${ing.unit}` : ing);
                const result = await useRecipe(ingNames);
                const updated = result.results?.filter(r => r.action !== 'not_found').length || 0;
                setRecipeMsg({ type: 'success', text: `✅ ${updated} ingrediente scăzute din cămară!` });
                loadItems();
              } catch { setRecipeMsg({ type: 'error', text: '❌ Eroare la actualizare.' }); }
              setUsingRecipe(false);
            }} disabled={usingRecipe}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 50, border: 'none', fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
                fontFamily: 'inherit',
                background: usingRecipe ? 'rgba(0,0,0,0.04)' : '#1a1a1a',
                color: usingRecipe ? '#999' : 'white',
                boxShadow: usingRecipe ? 'none' : '0 4px 20px rgba(0,0,0,0.15)',
                transition: 'all 0.2s',
              }}>
              {usingRecipe ? <><RefreshCw size={14} className="animate-spin" /> Se actualizează...</> : <><ChefHat size={15} /> Folosesc rețeta — scade ingredientele</>}
            </button>
            {recipeMsg && (
              <div style={{ fontSize: 12, marginTop: 8, padding: '8px 12px', borderRadius: 8, textAlign: 'center', fontWeight: 500, color: recipeMsg.type === 'success' ? '#16a34a' : '#ef4444', background: recipeMsg.type === 'success' ? '#f0fdf4' : '#fef2f2' }}>
                {recipeMsg.text}
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body
    )}

    </>
  );
}
