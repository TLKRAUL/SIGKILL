// ===== SIGKILL AI Service — Powered by Google Gemini =====
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Inițializare Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model pentru text
function getTextModel() {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
}

// Model pentru viziune (imagini)
function getVisionModel() {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
}

// ===== CATEGORII FALLBACK (când Gemini nu e disponibil) =====
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
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return category;
    }
  }
  return 'Altele';
}

// ===== OCR cu Gemini Vision — Scanare Bon =====
async function scanReceiptWithAI(imagePath) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY nu e setat');
    }

    const model = getVisionModel();
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    
    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.heic': 'image/heic' };
    const mimeType = mimeMap[ext] || 'image/jpeg';

    const prompt = `Analizează acest bon fiscal românesc și extrage TOATE produsele.

Returnează DOAR un JSON valid (fără markdown, fără backticks, fără text suplimentar) cu această structură:
{
  "storeName": "Numele magazinului",
  "totalAmount": 123.45,
  "products": [
    {
      "name": "Numele produsului",
      "quantity": 1,
      "unit": "buc",
      "price": 12.99,
      "category": "Lactate"
    }
  ]
}

Categoriile posibile sunt: Lactate, Fructe, Legume, Carne, Panificație, Băuturi, Conserve, Condimente, Dulciuri, Altele.
Unitățile posibile sunt: buc, kg, g, L, ml.

Extrage FIECARE produs de pe bon. Fii precis cu prețurile și cantitățile.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
    ]);

    const response = result.response.text();
    
    // Curăță răspunsul de markdown code blocks dacă există
    const cleaned = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    return {
      success: true,
      storeName: parsed.storeName || 'Necunoscut',
      totalAmount: parsed.totalAmount || 0,
      products: (parsed.products || []).map(p => ({
        name: p.name || 'Produs necunoscut',
        quantity: p.quantity || 1,
        unit: p.unit || 'buc',
        price: p.price || 0,
        category: p.category || detectCategoryFallback(p.name || ''),
      })),
    };
  } catch (error) {
    console.error('❌ Eroare Gemini Vision:', error.message);
    return { success: false, error: error.message };
  }
}

// ===== Scanare bon din Base64 (direct din frontend) =====
async function scanReceiptFromBase64(base64Data, mimeType = 'image/jpeg') {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY nu e setat');
    }

    const model = getVisionModel();
    
    // Elimină prefixul data:image/...;base64, dacă există
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `Analizează acest bon fiscal românesc și extrage TOATE produsele.

Returnează DOAR un JSON valid (fără markdown, fără backticks, fără text suplimentar) cu această structură:
{
  "storeName": "Numele magazinului",
  "totalAmount": 123.45,
  "products": [
    {
      "name": "Numele produsului",
      "quantity": 1,
      "unit": "buc",
      "price": 12.99,
      "category": "Lactate"
    }
  ]
}

Categoriile posibile sunt: Lactate, Fructe, Legume, Carne, Panificație, Băuturi, Conserve, Condimente, Dulciuri, Altele.
Unitățile posibile sunt: buc, kg, g, L, ml.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      },
    ]);

    const response = result.response.text();
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      storeName: parsed.storeName || 'Necunoscut',
      totalAmount: parsed.totalAmount || 0,
      products: (parsed.products || []).map(p => ({
        name: p.name || 'Produs necunoscut',
        quantity: p.quantity || 1,
        unit: p.unit || 'buc',
        price: p.price || 0,
        category: p.category || detectCategoryFallback(p.name || ''),
      })),
    };
  } catch (error) {
    console.error('❌ Eroare Gemini Vision Base64:', error.message);
    return { success: false, error: error.message };
  }
}

// ===== Chat AI cu Gemini =====
async function askGemini(userMessage, pantryItems = []) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log('⚠️ GEMINI_API_KEY nu e setat, folosesc fallback local');
      return generateLocalResponse(userMessage, pantryItems);
    }

    console.log('🤖 Trimit la Gemini:', userMessage.substring(0, 50) + '...');
    const model = getTextModel();

    // Construiește contextul cu produsele din cămară
    const pantryContext = pantryItems.length > 0
      ? `\n\nProdusele din cămara utilizatorului:\n${pantryItems.map(item => {
          const days = item.expiryDate 
            ? Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
            : null;
          return `- ${item.name} (${item.category}, ${item.quantity} ${item.unit}${days !== null ? `, expiră în ${days} zile` : ''})`;
        }).join('\n')}`
      : '\n\nCămara utilizatorului este goală.';

    const systemPrompt = `Ești un asistent AI inteligent pentru managementul casei, numit SIGKILL AI. 
Răspunzi DOAR în limba română.
Ești expert în:
- Rețete de gătit bazate pe ingredientele disponibile
- Managementul alimentelor și reducerea risipei
- Planificarea meselor și liste de cumpărături
- Sfaturi nutriționale și de stocare a alimentelor
- Bugetare pentru cumpărături alimentare
- Orice altceva legat de gospodărie

Regulile tale:
1. Răspunde concis dar util (max 300 cuvinte)
2. Folosește emoji-uri pentru a face răspunsurile mai prietenoase
3. Când sugerezi rețete, folosește ingredientele din cămara utilizatorului
4. Alertează pentru produsele care expiră curând (sub 3 zile)
5. Formatează cu **bold** pentru titluri și elemente importante
6. Fii proactiv — sugerează acțiuni concrete
7. Dacă întrebarea nu e legată de casă, răspunde oricum politicos
${pantryContext}`;

    const result = await model.generateContent(systemPrompt + '\n\nÎntrebarea utilizatorului: ' + userMessage);

    const response = typeof result.response.text === 'function' 
      ? result.response.text() 
      : result.response.text;
    
    console.log('✅ Gemini a răspuns:', response.substring(0, 80) + '...');
    return { answer: response };
  } catch (error) {
    console.error('❌ Eroare Gemini Chat:', error.message);
    // Fallback la logica locală
    return generateLocalResponse(userMessage, pantryItems);
  }
}

// ===== Rețete cu Gemini =====
async function getRecipesFromGemini(pantryItems = []) {
  try {
    if (!process.env.GEMINI_API_KEY || pantryItems.length === 0) {
      return generateLocalRecipes(pantryItems);
    }

    const model = getTextModel();

    const ingredients = pantryItems.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
    
    const prompt = `Pe baza acestor ingrediente disponibile: ${ingredients}

Sugerează exact 3 rețete pe care le pot face. Pentru fiecare rețetă, returnează DOAR un JSON valid:
[
  {
    "name": "Numele reteței",
    "description": "Descriere scurtă (1 propoziție)",
    "time": 30,
    "difficulty": "Ușor",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "steps": ["pas 1", "pas 2", "pas 3"],
    "matchedIngredients": ["ingrediente din lista mea folosite"]
  }
]

Prioritizează ingredientele care expiră curând. Rețete românești sau internaționale simple.
Returnează DOAR JSON-ul, fără text suplimentar sau backticks.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('❌ Eroare Gemini Recipes:', error.message);
    return generateLocalRecipes(pantryItems);
  }
}

// ===== FALLBACK — Logica locală (când Gemini nu e disponibil) =====

function generateLocalResponse(message, pantryItems = []) {
  const lower = message.toLowerCase();

  // Salutări
  if (lower.match(/^(salut|buna|hey|hello|hi|hei|servus|bună)/)) {
    return {
      answer: `Salut! 👋 Sunt **SIGKILL AI**, asistentul tău inteligent pentru managementul casei.\n\nAi **${pantryItems.length}** produse în cămară. Cu ce te pot ajuta?\n\n🍳 Rețete și gătit\n📦 Inventar cămară\n🛒 Liste de cumpărături\n🌿 Sfaturi anti-risipă\n💰 Buget și economii`
    };
  }

  // Cine ești / cum te cheamă
  if (lower.match(/(cine ești|cum te cheam|ce ești|despre tine|prezint)/)) {
    return {
      answer: `🤖 Sunt **SIGKILL AI** — asistentul inteligent pentru managementul casei tale!\n\n**Ce pot face:**\n• 📸 Scanez bonuri fiscal și extrag produsele automat\n• 🍳 Sugerez rețete pe baza alimentelor din cămară\n• ⏰ Te alertez când expiră produsele\n• 🛒 Generez liste de cumpărături inteligente\n• 💰 Te ajut cu bugetul și economisirea\n• 🌿 Reduc risipa alimentară\n\nSunt powered by **Google Gemini AI** 🚀`
    };
  }

  // Mulțumiri
  if (lower.match(/(mulțumesc|mersi|multumesc|thanks|ms|mulțam)/)) {
    return { answer: 'Cu plăcere! 😊 Sunt aici oricând ai nevoie de ajutor. Nu ezita să mă întrebi orice!' };
  }

  // Ajutor
  if (lower.match(/(ajut|help|ce poti|ce faci|ce stii)/)) {
    return {
      answer: `🏠 **SIGKILL AI — Ce pot face pentru tine:**\n\n🍳 **„Ce pot găti azi?"** — Rețete bazate pe ingredientele tale\n📦 **„Ce produse am?"** — Vezi inventarul complet\n⏰ **„Ce expiră curând?"** — Alerte de expirare\n🛒 **„Generează lista de cumpărături"** — Shopping list inteligent\n🌿 **„Sfaturi anti-risipă"** — Economisește alimente\n📊 **„Statistici cămară"** — Rapoarte despre consum\n\n💡 **Tip:** Scanează un bon fiscal pentru a adăuga produse automat!`
    };
  }

  // Rețete / gătit
  if (lower.match(/(rețet|gati|gătesc|mâncare|gatesc|mancare|cook|recipe|meniu)/)) {
    if (pantryItems.length === 0) {
      return { answer: '🍳 Nu ai produse în cămară momentan. Scanează un bon ca să adaugi alimente și să-ți sugerez rețete personalizate! 🛒' };
    }
    const recipes = generateLocalRecipes(pantryItems);
    return {
      answer: `🍳 **Sugestii de rețete:**\n\n${recipes.map((r, i) => 
        `**${i + 1}. ${r.name}**\n${r.description}\n⏱ ${r.time} min | 👨‍🍳 ${r.difficulty}`
      ).join('\n\n')}\n\nVrei detalii despre vreo rețetă? 🤔`
    };
  }

  // Expirare
  if (lower.match(/(expir|stric|vechi|proaspăt|proaspat)/)) {
    const expiring = pantryItems.filter(item => {
      if (!item.expiryDate) return false;
      const days = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 3;
    });

    if (pantryItems.length === 0) return { answer: '📦 Cămara ta este goală. Adaugă produse pentru a primi alerte de expirare! 🛒' };
    if (expiring.length === 0) return { answer: '🎉 Nu ai produse care expiră în următoarele 3 zile! Totul e proaspăt. ✨' };

    return {
      answer: `⚠️ **${expiring.length} produse** expiră curând:\n\n${expiring.map(p => {
        const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return `• **${p.name}** — ${days <= 0 ? '❌ EXPIRAT' : `${days} zile rămase`}`;
      }).join('\n')}\n\nFolosește-le azi! Vrei rețete cu aceste ingrediente? 🍳`
    };
  }

  // Cumpărături
  if (lower.match(/(cumpăr|cumpar|lista|shopping|magazine|magazin)/)) {
    const essentials = ['Pâine', 'Lapte', 'Ouă', 'Unt', 'Roșii', 'Cartofi', 'Piept de pui', 'Brânză', 'Ulei', 'Zahăr', 'Orez', 'Paste'];
    const existing = pantryItems.map(i => i.name.toLowerCase());
    const needed = essentials.filter(e => !existing.some(ex => ex.includes(e.toLowerCase())));
    return {
      answer: `🛒 **Lista de cumpărături sugerată:**\n\n${needed.map(n => `☐ ${n}`).join('\n')}\n\n📦 Ai ${pantryItems.length} produse în cămară.\n💡 Scanează bonul după cumpărături pentru a actualiza automat inventarul!`
    };
  }

  // Risipă
  if (lower.match(/(risip|waste|economis|food waste|arunc)/)) {
    return {
      answer: `🌿 **Sfaturi anti-risipă alimentară:**\n\n1. 🔄 **FIFO** — Primul intrat, primul ieșit\n2. ❄️ **Congelează** ce nu poți consuma la timp\n3. 📏 **Porții corecte** — Gătește cât mănânci\n4. 🥤 **Smoothie-uri** din fructe moi\n5. 🍲 **Supe** din legume ofilite\n6. 📅 **Planifică** mesele pe o săptămână\n7. 🏷️ **Etichetează** alimentele cu data deschiderii\n\n📊 Poți reduce risipa cu până la **60%** urmând aceste sfaturi!`
    };
  }

  // Statistici
  if (lower.match(/(statistic|raport|consum|analiz|summary|rezumat)/)) {
    if (pantryItems.length === 0) return { answer: '📊 Nu ai produse în cămară pentru statistici. Scanează un bon pentru a începe! 🛒' };
    const categories = [...new Set(pantryItems.map(i => i.category))];
    const totalValue = pantryItems.reduce((s, i) => s + (i.price || 0), 0);
    return {
      answer: `📊 **Statistici Cămară:**\n\n• 📦 Total produse: **${pantryItems.length}**\n• 🏷️ Categorii: **${categories.length}** (${categories.join(', ')})\n• 💰 Valoare totală: **${totalValue.toFixed(2)} RON**\n• ⚠️ Expiră curând: **${pantryItems.filter(i => i.expiryDate && Math.ceil((new Date(i.expiryDate) - new Date()) / 86400000) <= 3).length}** produse`
    };
  }

  // Ce produse am / inventar
  if (lower.match(/(produs|camara|cămara|inventar|am in|stoc|ce am|frigider)/)) {
    if (pantryItems.length === 0) {
      return { answer: '📦 Cămara ta este goală momentan. Scanează un bon sau adaugă produse manual! 🛒' };
    }

    const grouped = {};
    pantryItems.forEach(item => {
      const cat = item.category || 'Altele';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    let response = `📦 **Ai ${pantryItems.length} produse în cămară:**\n\n`;
    for (const [cat, items] of Object.entries(grouped)) {
      response += `**${cat}:**\n`;
      items.forEach(item => {
        const days = item.expiryDate ? Math.ceil((new Date(item.expiryDate) - new Date()) / 86400000) : null;
        const warn = days !== null && days <= 3 ? ' ⚠️' : '';
        response += `• ${item.name} — ${item.quantity} ${item.unit}${warn}\n`;
      });
      response += '\n';
    }

    return { answer: response.trim() };
  }

  // Buget
  if (lower.match(/(buget|bani|cheltuial|economis|pret|preț|scump|ieftin)/)) {
    return {
      answer: `💰 **Sfaturi pentru bugetul alimentar:**\n\n1. 📋 **Fă o listă** înainte de cumpărături\n2. 🏷️ **Compară prețurile** între magazine\n3. 🥫 **Cumpără la ofertă** conserve și produse uscate\n4. 🌾 **Gătește acasă** — economisești până la 70%\n5. 📦 **Evită risipa** — mănâncă ce ai înainte să cumperi\n\n💡 **Tip:** Folosește scanner-ul de bonuri pentru a-ți urmări cheltuielile automat!`
    };
  }

  // Fallback conversational
  return {
    answer: `Mulțumesc pentru întrebare! 😊\n\nSunt **SIGKILL AI** — specializat în managementul casei. Iată ce pot face:\n\n🍳 **„Ce pot găti azi?"** — Rețete personalizate\n📦 **„Ce produse am?"** — Inventar complet\n⏰ **„Ce expiră curând?"** — Alerte expirare\n🛒 **„Lista de cumpărături"** — Shopping inteligent\n🌿 **„Sfaturi anti-risipă"** — Economisește alimente\n💰 **„Sfaturi buget"** — Managementul banilor\n\nÎntreabă-mă orice legat de casa ta! 🏠`
  };
}

function generateLocalRecipes(pantryItems) {
  const names = pantryItems.map(i => i.name.toLowerCase());
  const allRecipes = [
    { name: 'Omletă cu legume', needs: ['ouă', 'roșii', 'ardei'], description: 'Omletă pufoasă cu legume proaspete.', time: 15, difficulty: 'Ușor', ingredients: ['3 ouă', 'roșii', 'ardei', 'ceapă'], steps: ['Bate ouăle', 'Taie legumele', 'Prăjește 3-4 min pe parte'] },
    { name: 'Piept de pui la tigaie', needs: ['pui', 'piept'], description: 'Piept de pui suculent cu condimente.', time: 25, difficulty: 'Ușor', ingredients: ['piept de pui', 'usturoi', 'boia'], steps: ['Condimentează', 'Prăjește 6 min pe parte'] },
    { name: 'Salată Caesar', needs: ['salat', 'pui'], description: 'Salată clasică cu pui grătar.', time: 20, difficulty: 'Ușor', ingredients: ['salată', 'pui', 'parmezan'], steps: ['Grătar pieptul', 'Amestecă totul'] },
    { name: 'Paste Carbonara', needs: ['past', 'ou', 'bacon'], description: 'Paste cremoase italiene.', time: 30, difficulty: 'Mediu', ingredients: ['paste', 'ouă', 'bacon'], steps: ['Fierbe pastele', 'Prăjește bacon', 'Combină'] },
    { name: 'Smoothie de fructe', needs: ['banan', 'iaurt', 'lapte'], description: 'Smoothie energizant.', time: 5, difficulty: 'Ușor', ingredients: ['banane', 'iaurt', 'lapte'], steps: ['Mixează totul'] },
    { name: 'Supă cremă de legume', needs: ['cartof', 'morco', 'ceap'], description: 'Supă caldă hrănitoare.', time: 40, difficulty: 'Mediu', ingredients: ['cartofi', 'morcovi', 'ceapă'], steps: ['Fierbe 25 min', 'Pasează'] },
    { name: 'Cartofi la cuptor', needs: ['cartof'], description: 'Cartofi aurii crocanți.', time: 45, difficulty: 'Ușor', ingredients: ['cartofi', 'ulei', 'rozmarin'], steps: ['Taie', 'Cuptor 180°C, 40 min'] },
    { name: 'Sandviș cu brânză', needs: ['pâine', 'brânz'], description: 'Sandviș rapid și gustos.', time: 10, difficulty: 'Ușor', ingredients: ['pâine', 'brânză', 'roșii'], steps: ['Asamblează ingredientele'] },
  ];

  const matched = allRecipes
    .map(r => ({ ...r, matchCount: r.needs.filter(n => names.some(name => name.includes(n))).length }))
    .filter(r => r.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount);

  return (matched.length > 0 ? matched : allRecipes).slice(0, 3);
}

// ===== EXPORTS =====
module.exports = {
  scanReceiptWithAI,
  scanReceiptFromBase64,
  askGemini,
  getRecipesFromGemini,
  detectCategoryFallback,
  generateLocalResponse,
  generateLocalRecipes,
};
