// ===== SIGKILL AI Service — Powered by Claude Haiku =====
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const MODEL = 'claude-haiku-4-5-20251001';

function getClient() {
  const key = process.env.CLAUDE_API_KEY;
  if (!key) throw new Error('CLAUDE_API_KEY nu e setat');
  return new Anthropic({ apiKey: key });
}

// Retry helper — așteaptă și reîncearcă la 429
async function withRetry(fn, retries = 1, delayMs = 10000) {
  try { return await fn(); }
  catch (error) {
    const is429 = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('rate');
    if (is429 && retries > 0) {
      console.log(`⏳ Rate limit — aștept ${delayMs/1000}s și reîncerc...`);
      await new Promise(r => setTimeout(r, delayMs));
      return withRetry(fn, retries - 1, delayMs * 1.5);
    }
    throw error;
  }
}

// Helper: apel text Claude
async function callClaude(prompt, systemPrompt = '', maxTokens = 2048) {
  const client = getClient();
  const result = await withRetry(() => client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    ...(systemPrompt ? { system: systemPrompt } : {}),
    messages: [{ role: 'user', content: prompt }],
  }));
  return result.content[0].text;
}

// Helper: apel viziune Claude (imagini)
async function callClaudeVision(prompt, base64Image, mimeType = 'image/jpeg', maxTokens = 2048) {
  const client = getClient();
  const result = await withRetry(() => client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64Image } },
        { type: 'text', text: prompt },
      ],
    }],
  }));
  return result.content[0].text;
}

// Helper: parsare JSON din răspuns
function parseJSON(text) {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

// Helper: mime type
function getMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.heic': 'image/heic' }[ext] || 'image/jpeg';
}

// ===== CATEGORII FALLBACK =====
const CATEGORY_KEYWORDS = {
  'Lactate': ['lapte', 'iaurt', 'brânză', 'smântână', 'unt', 'cașcaval', 'mascarpone', 'cremă', 'kefir', 'frișcă'],
  'Fructe': ['mere', 'banane', 'portocale', 'căpșuni', 'kiwi', 'mango', 'pere', 'struguri', 'cireșe', 'piersici', 'lămâi', 'ananas', 'pepene'],
  'Legume': ['roșii', 'cartofi', 'ceapă', 'morcovi', 'ardei', 'castraveți', 'salată', 'varză', 'conopidă', 'broccoli', 'spanac', 'dovlecei', 'vinete', 'usturoi', 'ciuperci'],
  'Carne': ['pui', 'porc', 'vită', 'curcan', 'miel', 'salam', 'șuncă', 'cârnați', 'bacon', 'piept', 'pulpă', 'cotlet', 'carne'],
  'Panificație': ['pâine', 'baghetă', 'covrigi', 'cornuri', 'chifle', 'franzelă', 'tortilla', 'pită'],
  'Băuturi': ['apă', 'suc', 'cola', 'bere', 'vin', 'cafea', 'ceai', 'limonadă', 'energizant', 'smoothie'],
  'Conserve': ['conservă', 'ton', 'mazăre', 'porumb', 'fasole', 'paste', 'sos', 'ketchup', 'maioneză', 'muștar'],
  'Condimente': ['sare', 'piper', 'boia', 'oregano', 'cimbru', 'busuioc', 'chimen', 'scorțișoară', 'curcuma', 'zahăr'],
  'Dulciuri': ['ciocolată', 'biscuiți', 'tort', 'prăjitură', 'napolitane', 'bomboane', 'înghețată', 'gumă', 'croissant'],
};

function detectCategoryFallback(productName) {
  const lower = productName.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) { if (lower.includes(keyword)) return category; }
  }
  return 'Altele';
}

// ===== PROMPT COMUN =====
const RECEIPT_PROMPT = `Analizează acest bon fiscal românesc și extrage TOATE produsele.
ATENȚIE la formatul românesc: "1.000" pe bon înseamnă 1 bucată (NU o mie). Pe bonurile din România, punctul în cantitate e separator zecimal (1.000 = 1, 2.000 = 2, 0.500 = 0.5 kg).
Returnează DOAR un JSON valid (fără markdown, fără backticks):
{"storeName":"Magazin","totalAmount":123.45,"products":[{"name":"Produs","quantity":1,"unit":"buc","price":12.99,"category":"Lactate"}]}
Categorii: Lactate, Fructe, Legume, Carne, Panificație, Băuturi, Conserve, Condimente, Dulciuri, Altele.
Unități: buc, kg, g, L, ml. Extrage FIECARE produs. Cantitatea trebuie să fie rezonabilă (de obicei 1-10 pentru buc).`;

const PRODUCT_PROMPT = `Analizează acest produs alimentar din imagine.
Returnează DOAR un JSON valid (fără markdown, fără backticks):
{"name":"Produs","category":"Lactate","quantity":1,"unit":"buc","priceEstimate":12.99,"brand":"Marca","description":"Descriere scurtă"}
Categorii: Lactate, Fructe, Legume, Carne, Panificație, Băuturi, Conserve, Condimente, Dulciuri, Altele.
Unități: buc, kg, g, L, ml.`;

const BILL_PROMPT = `Analizează această factură de utilități din România.
Returnează DOAR un JSON valid (fără markdown, fără backticks):
{"provider":"Furnizor","service":"Curent Electric","amount":250.50,"dueDate":"2026-05-15","contractNumber":"Nr contract"}
Dacă nu poți determina o valoare, pune null.`;

// ===== OCR Scanare Bon =====
async function scanReceiptWithAI(imagePath) {
  try {
    const base64 = fs.readFileSync(imagePath).toString('base64');
    const response = await callClaudeVision(RECEIPT_PROMPT, base64, getMime(imagePath));
    const parsed = parseJSON(response);
    return {
      success: true, storeName: parsed.storeName || 'Necunoscut', totalAmount: parsed.totalAmount || 0,
      products: (parsed.products || []).map(p => {
        let qty = p.quantity || 1;
        // Fix Romanian format: 1.000 buc = 1, 2.000 buc = 2
        if (p.unit === 'buc' && qty >= 100) qty = Math.round(qty / 1000) || 1;
        if (p.unit === 'buc' && qty > 50) qty = 1;
        return {
          name: p.name || 'Produs necunoscut', quantity: qty, unit: p.unit || 'buc',
          price: p.price || 0, category: p.category || detectCategoryFallback(p.name || ''),
        };
      }),
    };
  } catch (error) {
    console.error('❌ Eroare Claude Vision:', error.message);
    return { success: false, error: error.message };
  }
}

async function scanReceiptFromBase64(base64Data, mimeType = 'image/jpeg') {
  try {
    const clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const response = await callClaudeVision(RECEIPT_PROMPT, clean, mimeType);
    const parsed = parseJSON(response);
    return {
      success: true, storeName: parsed.storeName || 'Necunoscut', totalAmount: parsed.totalAmount || 0,
      products: (parsed.products || []).map(p => {
        let qty = p.quantity || 1;
        if (p.unit === 'buc' && qty >= 100) qty = Math.round(qty / 1000) || 1;
        if (p.unit === 'buc' && qty > 50) qty = 1;
        return {
          name: p.name || 'Produs necunoscut', quantity: qty, unit: p.unit || 'buc',
          price: p.price || 0, category: p.category || detectCategoryFallback(p.name || ''),
        };
      }),
    };
  } catch (error) {
    console.error('❌ Eroare Claude Vision Base64:', error.message);
    return { success: false, error: error.message };
  }
}

// ===== Chat AI =====
async function askGemini(userMessage, pantryItems = []) {
  try {
    if (!process.env.CLAUDE_API_KEY) return generateLocalResponse(userMessage, pantryItems);
    console.log('🤖 Trimit la Claude:', userMessage.substring(0, 50) + '...');

    const pantryContext = pantryItems.length > 0
      ? `\n\nProdusele din cămara utilizatorului (cu ID-urile lor):\n${pantryItems.map(item => {
          const days = item.expiryDate ? Math.ceil((new Date(item.expiryDate) - new Date()) / 86400000) : null;
          return `- [ID:${item._id}] ${item.name} (${item.category}, ${item.quantity} ${item.unit}${days !== null ? `, expiră în ${days} zile` : ''})`;
        }).join('\n')}`
      : '\n\nCămara utilizatorului este goală.';

    const systemPrompt = `Ești un asistent AI inteligent pentru managementul casei, numit SIGKILL AI. 
Răspunzi DOAR în limba română. Expert în rețete, managementul alimentelor, reducerea risipei, planificarea meselor, bugetare.
Reguli: Răspunde concis (max 300 cuvinte). Folosește emoji-uri. Formatează cu **bold** pentru titluri.

IMPORTANT — Poți EXECUTA acțiuni pe cămară:
Dacă utilizatorul îți cere să adaugi sau să ștergi produse, returnează EXACT acest format JSON (fără markdown):
{"answer":"Mesajul tău de confirmare","actions":[{"type":"add","name":"Produs","category":"Lactate","quantity":1,"unit":"buc"},{"type":"delete","id":"ID_PRODUS"}]}

Acțiuni disponibile:
- type: "add" — adaugă produs nou (name, category, quantity, unit obligatorii)
- type: "delete" — șterge produs (id obligatoriu, folosește ID-ul din lista de produse)

Categorii valide: Lactate, Fructe, Legume, Carne, Panificație, Băuturi, Conserve, Condimente, Dulciuri, Altele
Unități valide: buc, kg, g, L, ml

Dacă NU e nicio acțiune de executat, răspunde normal ca text simplu (NU JSON).
Dacă utilizatorul cere să ștergi un produs, caută-l după nume în lista de ID-uri și folosește ID-ul corect.
Dacă utilizatorul cere să ștergi ceva ce nu există, spune-i că nu e în cămară.
${pantryContext}`;

    const response = await callClaude(userMessage, systemPrompt, 1024);
    console.log('✅ Claude a răspuns:', response.substring(0, 80) + '...');
    
    // Verifică dacă răspunsul e JSON cu acțiuni
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      if (cleaned.startsWith('{') && cleaned.includes('"actions"')) {
        const parsed = JSON.parse(cleaned);
        if (parsed.actions && Array.isArray(parsed.actions)) {
          return { answer: parsed.answer || 'Gata!', actions: parsed.actions };
        }
      }
    } catch {}
    
    return { answer: response };
  } catch (error) {
    console.error('❌ Eroare Claude Chat:', error.message);
    return generateLocalResponse(userMessage, pantryItems);
  }
}

// ===== Rețete =====
async function getRecipesFromGemini(pantryItems = []) {
  try {
    if (!process.env.CLAUDE_API_KEY || pantryItems.length === 0) return generateLocalRecipes(pantryItems);
    const ingredients = pantryItems.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
    const prompt = `Ingrediente disponibile: ${ingredients}
Sugerează exact 3 rețete. Returnează DOAR JSON valid (fără markdown, fără backticks):
[{
  "name": "Numele rețetei",
  "description": "Descriere scurtă pe o linie",
  "time": 30,
  "difficulty": "Ușor",
  "servings": 2,
  "calories": 450,
  "ingredients": [
    {"name": "Piept de pui", "quantity": "200", "unit": "g"},
    {"name": "Ulei de măsline", "quantity": "2", "unit": "linguri"}
  ],
  "steps": [
    {"step": 1, "instruction": "Tăiați pieptul de pui cubulețe de 2cm.", "time": 5},
    {"step": 2, "instruction": "Încălziți uleiul într-o tigaie la foc mediu.", "time": 2}
  ],
  "tips": "Sfat util pentru rețetă",
  "matchedIngredients": ["Piept de pui"]
}]

Reguli:
- Ingredientele TREBUIE să aibă cantități exacte (grame, ml, bucăți, linguri)
- Pașii trebuie să fie detaliați și clari, cu timp estimat per pas
- Include și ingrediente de bază (sare, piper, ulei) chiar dacă nu sunt în cămară
- Prioritizează ingredientele care expiră curând
- Rețete românești sau internaționale simple`;
    const response = await callClaude(prompt, '', 2048);
    return parseJSON(response);
  } catch (error) {
    console.error('❌ Eroare Claude Recipes:', error.message);
    return generateLocalRecipes(pantryItems);
  }
}

// ===== Scanare Produs =====
async function scanProductWithAI(imagePath) {
  try {
    const base64 = fs.readFileSync(imagePath).toString('base64');
    const response = await callClaudeVision(PRODUCT_PROMPT, base64, getMime(imagePath));
    const p = parseJSON(response);
    return { success: true, product: { name: p.name || 'Produs necunoscut', category: p.category || detectCategoryFallback(p.name || ''), quantity: p.quantity || 1, unit: p.unit || 'buc', price: p.priceEstimate || 0, brand: p.brand || '', description: p.description || '' } };
  } catch (error) {
    console.error('❌ Eroare scanare produs:', error.message);
    return { success: false, error: error.message };
  }
}

async function scanProductFromBase64(base64Data, mimeType = 'image/jpeg') {
  try {
    const clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const response = await callClaudeVision(PRODUCT_PROMPT, clean, mimeType);
    const p = parseJSON(response);
    return { success: true, product: { name: p.name || 'Produs necunoscut', category: p.category || detectCategoryFallback(p.name || ''), quantity: p.quantity || 1, unit: p.unit || 'buc', price: p.priceEstimate || 0, brand: p.brand || '', description: p.description || '' } };
  } catch (error) {
    console.error('❌ Eroare scanare produs base64:', error.message);
    return { success: false, error: error.message };
  }
}

// ===== Scanare Factură =====
async function scanBillWithAI(imagePath) {
  try {
    const base64 = fs.readFileSync(imagePath).toString('base64');
    const response = await callClaudeVision(BILL_PROMPT, base64, getMime(imagePath));
    const p = parseJSON(response);
    return { success: true, provider: p.provider || 'Necunoscut', service: p.service || 'Necunoscut', amount: p.amount || 0, dueDate: p.dueDate || null, contractNumber: p.contractNumber || '' };
  } catch (error) {
    console.error('❌ Eroare scanare factură:', error.message);
    return { success: false, error: error.message };
  }
}

async function scanBillFromBase64(base64Data, mimeType = 'image/jpeg') {
  try {
    const clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const response = await callClaudeVision(BILL_PROMPT, clean, mimeType);
    const p = parseJSON(response);
    return { success: true, provider: p.provider || 'Necunoscut', service: p.service || 'Necunoscut', amount: p.amount || 0, dueDate: p.dueDate || null, contractNumber: p.contractNumber || '' };
  } catch (error) {
    console.error('❌ Eroare scanare factură base64:', error.message);
    return { success: false, error: error.message };
  }
}

// ===== AI Furnizor Mai Bun =====
async function findBetterSupplierAI(service, currentProvider, currentAmount) {
  try {
    if (!process.env.CLAUDE_API_KEY) return { analysis: `Pentru ${service} cu ${currentProvider} la ${currentAmount} RON/lună, compară ofertele pe ANRE.ro.`, alternatives: [], tip: '' };
    const prompt = `Sunt din România și plătesc ${currentAmount} RON/lună pentru ${service} la ${currentProvider}.
Sugerează 3 furnizori alternativi mai ieftini. Returnează DOAR JSON valid (fără markdown):
{"analysis":"Analiză scurtă","alternatives":[{"provider":"Nume","estimatedPrice":200,"savings":50,"details":"De ce e mai bun"}],"tip":"Sfat economisire"}
Fii realist cu prețurile din România.`;
    const response = await callClaude(prompt, '', 1024);
    const p = parseJSON(response);
    return { analysis: p.analysis || '', alternatives: p.alternatives || [], tip: p.tip || '' };
  } catch (error) {
    console.error('❌ Eroare AI furnizor:', error.message);
    return { analysis: 'Nu am putut analiza. Verifică manual pe ANRE.ro.', alternatives: [], tip: 'Compară ofertele pe piața liberă.' };
  }
}

// ===== FALLBACK LOCAL =====
function generateLocalResponse(message, pantryItems = []) {
  const lower = message.toLowerCase();
  if (lower.match(/^(salut|buna|hey|hello|hi|hei|servus|bună)/)) return { answer: `Salut! 👋 Sunt **SIGKILL AI**, asistentul tău.\n\nAi **${pantryItems.length}** produse în cămară. Cu ce te pot ajuta?\n\n🍳 Rețete\n📦 Inventar\n🛒 Liste cumpărături\n🌿 Anti-risipă\n💰 Buget` };
  if (lower.match(/(cine ești|cum te cheam|ce ești)/)) return { answer: `🤖 Sunt **SIGKILL AI** — asistentul inteligent pentru casa ta!\n\n• 📸 Scanez bonuri\n• 🍳 Sugerez rețete\n• ⏰ Alertez expirări\n• 🛒 Liste cumpărături\n• 💰 Buget\n\nPowered by **Claude AI** 🚀` };
  if (lower.match(/(mulțumesc|mersi|multumesc|thanks)/)) return { answer: 'Cu plăcere! 😊 Sunt aici oricând ai nevoie!' };
  if (lower.match(/(rețet|gati|gătesc|mâncare|cook)/)) {
    if (pantryItems.length === 0) return { answer: '🍳 Nu ai produse în cămară. Scanează un bon! 🛒' };
    const recipes = generateLocalRecipes(pantryItems);
    return { answer: `🍳 **Sugestii:**\n\n${recipes.map((r, i) => `**${i+1}. ${r.name}**\n${r.description}\n⏱ ${r.time} min | 👨‍🍳 ${r.difficulty}`).join('\n\n')}\n\nVrei detalii?` };
  }
  if (lower.match(/(expir|stric|vechi)/)) {
    const expiring = pantryItems.filter(i => i.expiryDate && Math.ceil((new Date(i.expiryDate) - new Date()) / 86400000) <= 3 && Math.ceil((new Date(i.expiryDate) - new Date()) / 86400000) >= 0);
    if (pantryItems.length === 0) return { answer: '📦 Cămara goală. Adaugă produse! 🛒' };
    if (expiring.length === 0) return { answer: '🎉 Nu ai produse care expiră curând! ✨' };
    return { answer: `⚠️ **${expiring.length} produse** expiră:\n\n${expiring.map(p => { const d = Math.ceil((new Date(p.expiryDate) - new Date()) / 86400000); return `• **${p.name}** — ${d <= 0 ? '❌ EXPIRAT' : `${d}z rămase`}`; }).join('\n')}\n\nVrei rețete? 🍳` };
  }
  if (lower.match(/(cumpăr|cumpar|lista|shopping)/)) {
    const essentials = ['Pâine', 'Lapte', 'Ouă', 'Unt', 'Roșii', 'Cartofi', 'Piept de pui', 'Brânză', 'Ulei', 'Zahăr', 'Orez', 'Paste'];
    const existing = pantryItems.map(i => i.name.toLowerCase());
    const needed = essentials.filter(e => !existing.some(ex => ex.includes(e.toLowerCase())));
    return { answer: `🛒 **Lista sugerată:**\n\n${needed.map(n => `☐ ${n}`).join('\n')}\n\n📦 Ai ${pantryItems.length} produse.` };
  }
  return { answer: `Sunt **SIGKILL AI** 😊\n\n🍳 „Ce pot găti?"\n📦 „Ce produse am?"\n⏰ „Ce expiră?"\n🛒 „Lista cumpărături"\n💰 „Sfaturi buget"\n\nÎntreabă orice! 🏠` };
}

function generateLocalRecipes(pantryItems) {
  const names = pantryItems.map(i => i.name.toLowerCase());
  const all = [
    { name: 'Omletă cu legume', needs: ['ouă', 'roșii', 'ardei'], description: 'Omletă pufoasă cu legume.', time: 15, difficulty: 'Ușor', ingredients: ['3 ouă', 'roșii', 'ardei'], steps: ['Bate ouăle', 'Taie legumele', 'Prăjește 3-4 min'] },
    { name: 'Piept de pui la tigaie', needs: ['pui', 'piept'], description: 'Piept suculent cu condimente.', time: 25, difficulty: 'Ușor', ingredients: ['piept pui', 'usturoi', 'boia'], steps: ['Condimentează', 'Prăjește 6 min/parte'] },
    { name: 'Paste Carbonara', needs: ['past', 'ou', 'bacon'], description: 'Paste cremoase italiene.', time: 30, difficulty: 'Mediu', ingredients: ['paste', 'ouă', 'bacon'], steps: ['Fierbe pastele', 'Prăjește bacon', 'Combină'] },
    { name: 'Supă cremă legume', needs: ['cartof', 'morco', 'ceap'], description: 'Supă caldă hrănitoare.', time: 40, difficulty: 'Mediu', ingredients: ['cartofi', 'morcovi', 'ceapă'], steps: ['Fierbe 25 min', 'Pasează'] },
    { name: 'Cartofi la cuptor', needs: ['cartof'], description: 'Cartofi aurii crocanți.', time: 45, difficulty: 'Ușor', ingredients: ['cartofi', 'ulei', 'rozmarin'], steps: ['Taie', 'Cuptor 180°C, 40 min'] },
    { name: 'Sandviș cu brânză', needs: ['pâine', 'brânz'], description: 'Sandviș rapid.', time: 10, difficulty: 'Ușor', ingredients: ['pâine', 'brânză', 'roșii'], steps: ['Asamblează'] },
  ];
  const matched = all.map(r => ({ ...r, matchCount: r.needs.filter(n => names.some(nm => nm.includes(n))).length })).filter(r => r.matchCount > 0).sort((a, b) => b.matchCount - a.matchCount);
  return (matched.length > 0 ? matched : all).slice(0, 3);
}

// ===== AI Plan Alimentar / Dietă =====
async function generateMealPlan({ weight, height, age, gender, goal, budget, allergies, pantryItems }) {
  const budgetLabel = { low: 'buget redus (sub 150 RON/săptămână)', medium: 'buget mediu (150-300 RON/săptămână)', high: 'buget generos (300+ RON/săptămână)' }[budget] || 'buget mediu';
  const goalLabel = { lose: 'slăbire / deficit caloric', gain: 'masă musculară / surplus caloric', maintain: 'menținere greutate' }[goal] || 'menținere';
  const pantryList = pantryItems?.length ? `\nProduse deja disponibile: ${pantryItems.map(p => p.name).join(', ')}` : '';

  const prompt = `Ești un nutriționist expert. Creează un plan alimentar personalizat pe 7 zile.

Date utilizator:
- Greutate: ${weight} kg
- Înălțime: ${height} cm
- Vârstă: ${age} ani
- Gen: ${gender === 'f' ? 'feminin' : 'masculin'}
- Obiectiv: ${goalLabel}
- Buget: ${budgetLabel}
${allergies ? `- Alergii/Restricții: ${allergies}` : ''}${pantryList}

Returnează DOAR un JSON valid (fără markdown, fără backticks):
{
  "dailyCalories": 2000,
  "macros": {"protein": 150, "carbs": 200, "fat": 70},
  "bmi": 24.5,
  "bmiCategory": "Normal",
  "tip": "Sfat personalizat scurt",
  "days": [
    {
      "day": "Luni",
      "meals": [
        {"type": "Mic dejun", "name": "Omletă cu legume", "calories": 350, "description": "3 ouă, roșii, ardei", "prepTime": 15},
        {"type": "Prânz", "name": "Piept pui cu orez", "calories": 550, "description": "200g piept, 100g orez, salată", "prepTime": 30},
        {"type": "Gustare", "name": "Iaurt cu fructe", "calories": 200, "description": "150g iaurt, banană", "prepTime": 5},
        {"type": "Cină", "name": "Salată caesar", "calories": 400, "description": "Salată, pui, parmezan", "prepTime": 20}
      ]
    }
  ],
  "shoppingList": [
    {"item": "Piept de pui 1kg", "price": 32, "category": "Carne"},
    {"item": "Orez 1kg", "price": 8, "category": "Conserve"}
  ],
  "weeklyBudget": 250,
  "estimatedSavings": "Poți economisi ~50 RON folosind produsele din cămară"
}

Reguli:
- Calculează BMI corect (greutate / (înălțime/100)²)
- Caloriile zilnice adaptate la obiectiv
- Include 7 zile complete (Luni-Duminică) cu 4 mese/zi
- Lista de cumpărături cu prețuri realiste din România (RON)
- Folosește produsele deja disponibile dacă se potrivesc
- Bugetul total pe săptămână`;

  if (!process.env.CLAUDE_API_KEY) {
    return { error: 'Claude API key nu e configurată' };
  }

  try {
    const response = await callClaude(prompt, '', 4096);
    return parseJSON(response);
  } catch (error) {
    console.error('❌ Eroare AI meal plan:', error.message);
    throw error;
  }
}

const EXPIRY_FALLBACK = {
  'Lactate': 5, 'Carne': 3, 'Fructe': 7, 'Legume': 7, 'Panificație': 3,
  'Băuturi': 30, 'Conserve': 365, 'Condimente': 180, 'Dulciuri': 60, 'Altele': 14,
};

async function estimateExpiryDays(products) {
  // products = [{ name, category }]
  if (!process.env.CLAUDE_API_KEY || !products?.length) {
    return products.map(p => ({ name: p.name, days: EXPIRY_FALLBACK[p.category] || 14 }));
  }

  try {
    const list = products.map(p => `${p.name} (${p.category})`).join(', ');
    const prompt = `Estimează câte zile rămân până la expirare pentru aceste produse alimentare cumpărate ACUM din supermarket (produse proaspete, neambalate sau cu dată de expirare scurtă).

Produse: ${list}

Returnează DOAR un JSON valid (fără markdown, fără backticks):
[{"name":"Produs","days":5}]

Reguli:
- Piept de pui proaspăt: 2-3 zile
- Lapte proaspăt: 4-5 zile  
- Pâine feliată: 3-5 zile
- Roșii proaspete: 5-7 zile
- Conserve: 365+ zile
- Fii realist, nu optimist`;

    const response = await callClaude(prompt, '', 512);
    const parsed = parseJSON(response);
    return parsed;
  } catch (error) {
    console.error('❌ Eroare estimare expirare:', error.message);
    return products.map(p => ({ name: p.name, days: EXPIRY_FALLBACK[p.category] || 14 }));
  }
}

// ===== EXPORTS =====
module.exports = {
  scanReceiptWithAI, scanReceiptFromBase64,
  scanProductWithAI, scanProductFromBase64,
  scanBillWithAI, scanBillFromBase64,
  findBetterSupplierAI, askGemini, getRecipesFromGemini,
  detectCategoryFallback, generateLocalResponse, generateLocalRecipes,
  estimateExpiryDays, generateMealPlan,
};
