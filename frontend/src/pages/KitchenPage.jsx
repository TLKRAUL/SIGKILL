import { useState, useEffect } from 'react';
import {
  ChefHat, Apple, Beef, Milk, Cookie, Wine, Leaf,
  Thermometer, Power, AlertTriangle, Clock, Plus,
  Sparkles, Brain, BarChart3, UtensilsCrossed,
  Egg, Wheat, ShieldAlert, ScanLine, RefreshCw
} from 'lucide-react';
import { getPantryItems, getRecipes } from '../api/apiClient';

const mealTypes = [
  { label: 'Mic Dejun', icon: Egg, active: false },
  { label: 'Prânz', icon: UtensilsCrossed, active: true },
  { label: 'Cină', icon: ChefHat, active: false },
];

const dietOptions = [
  { label: 'Vegan', active: false, icon: Leaf },
  { label: 'Vegetarian', active: true, icon: Apple },
  { label: 'Fără Lactoză', active: false, icon: Milk },
  { label: 'Fără Gluten', active: false, icon: Wheat },
  { label: 'Alergeni', active: false, icon: ShieldAlert },
];

const wasteData = [
  { day: 'Lun', value: 2 }, { day: 'Mar', value: 5 }, { day: 'Mie', value: 1 },
  { day: 'Joi', value: 3 }, { day: 'Vin', value: 7 }, { day: 'Sâm', value: 4 }, { day: 'Dum', value: 2 },
];

export default function KitchenPage() {
  const [pantryItems, setPantryItems] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [activeMeal, setActiveMeal] = useState(1);
  const [diets, setDiets] = useState(dietOptions);
  const maxWaste = Math.max(...wasteData.map(w => w.value));

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPantryItems();
        if (data && data.length > 0) setPantryItems(data);
      } catch {}
    };
    load();
  }, []);

  const loadRecipe = async () => {
    setLoadingRecipe(true);
    try {
      const data = await getRecipes();
      if (Array.isArray(data) && data.length > 0) setRecipe(data[0]);
    } catch {}
    setLoadingRecipe(false);
  };

  useEffect(() => { loadRecipe(); }, []);

  const toggleDiet = (idx) => {
    setDiets(prev => prev.map((d, i) => i === idx ? { ...d, active: !d.active } : d));
  };

  const getExpiryDays = (date) => {
    if (!date) return null;
    return Math.ceil((new Date(date) - new Date()) / 86400000);
  };

  const getExpiryColor = (days) => {
    if (days === null) return 'text-dark-400';
    if (days < 0) return 'text-neon-pink';
    if (days <= 3) return 'text-neon-orange';
    if (days <= 7) return 'text-neon-yellow';
    return 'text-neon-green';
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-6 pb-6 pt-24 page-enter" id="kitchen-page">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <ChefHat size={14} className="text-neon-cyan" />
          <span className="text-[10px] font-hud text-neon-cyan/60 tracking-[0.2em] uppercase">Panou Bucătărie AI</span>
        </div>
        <h1 className="text-3xl font-hud font-bold text-white tracking-wider">
          BUCĂTĂRIE <span className="gradient-text">INTELIGENTĂ</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT — Inventar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="hud-panel p-5 animate-scale-in stagger-1">
            <h3 className="text-[10px] font-hud text-neon-cyan/60 tracking-wider uppercase mb-4 flex items-center gap-2">
              <Apple size={14} />
              Inventar Alimentar
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(pantryItems.length > 0 ? pantryItems : [
                { name: 'Mere', quantity: 8, unit: 'buc', expiryDate: new Date(Date.now() + 5*86400000).toISOString(), category: 'Fructe' },
                { name: 'Lapte', quantity: 1, unit: 'L', expiryDate: new Date(Date.now() + 2*86400000).toISOString(), category: 'Lactate' },
                { name: 'Ouă', quantity: 12, unit: 'buc', expiryDate: new Date(Date.now() + 1*86400000).toISOString(), category: 'Altele' },
                { name: 'Brânză', quantity: 500, unit: 'g', expiryDate: new Date(Date.now() + 4*86400000).toISOString(), category: 'Lactate' },
              ]).slice(0, 8).map((item, i) => {
                const days = getExpiryDays(item.expiryDate);
                return (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[rgba(0,217,255,0.03)] border border-[rgba(0,217,255,0.08)] hover:border-[rgba(0,217,255,0.2)] transition-all">
                    <div>
                      <p className="text-xs text-white font-medium">{item.name}</p>
                      <p className="text-[10px] text-dark-400">{item.quantity} {item.unit}</p>
                    </div>
                    <span className={`text-[10px] font-mono ${getExpiryColor(days)}`}>
                      {days !== null ? (days < 0 ? 'EXPIRAT' : `${days}z`) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
            <button className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs text-neon-cyan bg-neon-cyan/5 border border-neon-cyan/15 hover:bg-neon-cyan/10 transition-all">
              <Plus size={14} /> Adaugă / Scanare
            </button>
          </div>
        </div>

        {/* CENTER — Preferințe + Diete */}
        <div className="lg:col-span-4 space-y-4">
          {/* Meal Types */}
          <div className="hud-panel p-5 animate-scale-in stagger-2">
            <h3 className="text-[10px] font-hud text-neon-cyan/60 tracking-wider uppercase mb-4 text-center">
              Preferințe Dietetice & Tip Masă
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {mealTypes.map((meal, i) => {
                const Icon = meal.icon;
                const isActive = i === activeMeal;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveMeal(i)}
                    className={`flex flex-col items-center gap-2 py-3 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 shadow-[0_0_15px_rgba(0,217,255,0.1)]'
                        : 'bg-[rgba(0,217,255,0.03)] text-dark-300 border border-transparent hover:border-[rgba(0,217,255,0.1)]'
                    }`}
                  >
                    <Icon size={20} />
                    {meal.label}
                  </button>
                );
              })}
            </div>

            <h4 className="text-[10px] font-hud text-neon-cyan/60 tracking-wider uppercase mb-3 text-center">
              Diete & Alergeni
            </h4>
            <div className="space-y-2">
              {diets.map((diet, i) => {
                const Icon = diet.icon;
                return (
                  <button
                    key={i}
                    onClick={() => toggleDiet(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
                      diet.active
                        ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                        : 'bg-[rgba(0,217,255,0.02)] text-dark-300 border border-transparent hover:border-[rgba(0,217,255,0.1)]'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="flex-1 text-left">{diet.label}</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      diet.active ? 'border-neon-green bg-neon-green/30' : 'border-dark-400'
                    }`}>
                      {diet.active && <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT — Recipe + Waste */}
        <div className="lg:col-span-5 space-y-4">
          {/* Recipe Suggestion */}
          <div className="hud-panel p-5 animate-scale-in stagger-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-hud text-neon-cyan/60 tracking-wider uppercase flex items-center gap-2">
                <Sparkles size={14} />
                Rețetă Recomandată
              </h3>
              <button
                onClick={loadRecipe}
                disabled={loadingRecipe}
                className="flex items-center gap-1 text-[10px] text-neon-cyan hover:text-white transition-colors"
              >
                <RefreshCw size={12} className={loadingRecipe ? 'animate-spin' : ''} />
                Nouă
              </button>
            </div>

            {recipe ? (
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-white">{recipe.name}</h4>
                <p className="text-xs text-dark-300">{recipe.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-dark-400">
                  <span className="flex items-center gap-1"><Clock size={12} /> {recipe.time} min</span>
                  <span>👨‍🍳 {recipe.difficulty}</span>
                </div>

                {recipe.steps && (
                  <div className="space-y-1.5 mt-3">
                    <p className="text-[10px] font-hud text-neon-cyan/50 tracking-wider uppercase">Pași:</p>
                    {recipe.steps.slice(0, 4).map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-dark-200">
                        <span className="text-neon-cyan font-mono text-[10px] mt-0.5">{i + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                {recipe.ingredients && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {recipe.ingredients.slice(0, 6).map((ing, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg text-[10px] bg-neon-cyan/5 border border-neon-cyan/10 text-dark-300">
                        {ing}
                      </span>
                    ))}
                  </div>
                )}

                <button className="mt-3 w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2">
                  <span><Brain size={14} /> Generează Rețete Noi</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-dark-400 text-xs">
                {loadingRecipe ? 'Se generează rețetă cu AI...' : 'Click pe "Nouă" pentru o rețetă'}
              </div>
            )}
          </div>

          {/* Waste Report */}
          <div className="hud-panel p-5 animate-scale-in stagger-4">
            <h3 className="text-[10px] font-hud text-neon-cyan/60 tracking-wider uppercase mb-4 flex items-center gap-2">
              <BarChart3 size={14} />
              Raport Risipă Săptămânală
            </h3>
            <div className="flex items-end gap-2 h-24">
              {wasteData.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md transition-all duration-700"
                    style={{
                      height: `${(w.value / maxWaste) * 100}%`,
                      background: w.value > 5 ? 'linear-gradient(to top, rgba(247,37,133,0.4), rgba(255,107,53,0.6))' : 'linear-gradient(to top, rgba(0,217,255,0.2), rgba(0,245,160,0.4))',
                    }}
                  />
                  <span className="text-[8px] text-dark-500">{w.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom — Smart Appliances */}
      <div className="mt-6 hud-panel p-5 animate-scale-in stagger-5">
        <h3 className="text-[10px] font-hud text-neon-cyan/60 tracking-wider uppercase mb-4 flex items-center gap-2">
          <Thermometer size={14} />
          Monitorizare Electrocasnice & Rapoarte
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[rgba(0,217,255,0.03)] border border-[rgba(0,217,255,0.08)]">
            <Thermometer size={20} className="text-neon-blue" />
            <div>
              <p className="text-xs text-dark-300">Frigider T°</p>
              <p className="text-lg font-hud font-bold text-white">3°C</p>
            </div>
            <div className="ml-auto w-16 h-8 rounded bg-dark-700/50 flex items-center justify-center">
              <div className="w-12 h-1 bg-gradient-to-r from-neon-blue to-neon-cyan rounded-full animate-pulse-soft" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[rgba(0,217,255,0.03)] border border-[rgba(0,217,255,0.08)]">
            <Thermometer size={20} className="text-neon-cyan" />
            <div>
              <p className="text-xs text-dark-300">Congelator T°</p>
              <p className="text-lg font-hud font-bold text-white">-18°C</p>
            </div>
            <div className="ml-auto w-16 h-8 rounded bg-dark-700/50 flex items-center justify-center">
              <div className="w-12 h-1 bg-gradient-to-r from-neon-cyan to-neon-green rounded-full animate-pulse-soft" />
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[rgba(0,217,255,0.03)] border border-[rgba(0,217,255,0.08)]">
            <Power size={20} className="text-dark-400" />
            <div>
              <p className="text-xs text-dark-300">Cuptor Status</p>
              <p className="text-lg font-hud font-bold text-dark-400">Oprit</p>
            </div>
            <button className="ml-auto px-3 py-1.5 rounded-lg text-[10px] bg-dark-700 text-dark-300 border border-dark-500 hover:border-neon-green/30 hover:text-neon-green transition-all">
              Oprit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
