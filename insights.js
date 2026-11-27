// Analiză produs: scor general 0–100, avantaje și dezavantaje.
(function (root) {
  const NS = typeof module !== 'undefined' && module.exports ? require('./nutriscore.js') : root.NutriScore;

  // Doze zilnice de referință pentru un adult (Regulamentul UE 1169/2011)
  const RI = { kcal: 2000, fat: 70, satFat: 20, sugars: 90, salt: 6, protein: 50, fibre: 25 };
  const has = (v) => v != null && !isNaN(v);
  const num = (v) => (v === undefined || v === null || v === '' ? null : Number(v));
  const f1 = (v) => (Math.round(v * 10) / 10).toString().replace('.', ',');
  const pctRI = (v, ri) => Math.round((v / ri) * 100);

  const BANDS = { a: [80, 100], b: [62, 79], c: [45, 61], d: [25, 44], e: [0, 24] };
  const POINT_RANGES = { a: [-15, 0], b: [1, 2], c: [3, 10], d: [11, 18], e: [19, 35] };

  function overallScore(grade, points, drink, nova, additives) {
    if (!grade || !BANDS[grade]) return null;
    const [lo, hi] = BANDS[grade];
    let s = (lo + hi) / 2;
    if (!drink && has(points)) {
      const [pLo, pHi] = POINT_RANGES[grade];
      const t = Math.min(1, Math.max(0, (points - pLo) / (pHi - pLo || 1)));
      s = hi - t * (hi - lo);
    }
    if (nova === 4) s -= 10;
    else if (nova === 1) s += 5;
    s -= Math.min(10, Math.max(0, additives - 2) * 2);
    return Math.round(Math.max(0, Math.min(100, s)));
  }

  function label(score) {
    if (score == null) return { text: 'Necunoscut', tone: 'none' };
    if (score >= 75) return { text: 'Excelent', tone: 'a' };
    if (score >= 50) return { text: 'Bun', tone: 'b' };
    if (score >= 25) return { text: 'Mediocru', tone: 'd' };
    return { text: 'Slab', tone: 'e' };
  }

  function analyze(p) {
    const { nutrients: n, opts } = NS.fromOff(p);
    const m = p.nutriments || {};
    const fat = num(m.fat_100g);
    const kcal = has(n.energyKj) ? n.energyKj / 4.184 : null;
    const drink = opts.drink || opts.water;
    const unit = drink ? '100 ml' : '100 g';
    const nova = num(p.nova_group);
    const additives = p.additives_tags || [];
    const analysis = p.ingredients_analysis_tags || [];

    let grade = String(p.nutriscore_grade || '').toLowerCase();
    let points = num(p.nutriscore_score);
    let official = true;
    if (!/^[a-e]$/.test(grade)) {
      const r = NS.compute(n, opts);
      official = false;
      grade = r ? r.grade : null;
      points = r ? r.score : null;
    }

    const T = drink
      ? { sugarLow: 2.5, sugarHigh: 5, fatLow: 1.5, fatHigh: 8.75, satLow: 0.75, satHigh: 2.5, saltLow: 0.3, saltHigh: 0.75, kcalLow: 20, kcalHigh: 70 }
      : { sugarLow: 5, sugarHigh: 22.5, fatLow: 3, fatHigh: 17.5, satLow: 1.5, satHigh: 5, saltLow: 0.3, saltHigh: 1.5, kcalLow: 40, kcalHigh: 400 };

    const pros = [], cons = [];
    const pro = (icon, title, detail) => pros.push({ icon, title, detail });
    const con = (icon, title, detail) => cons.push({ icon, title, detail });

    if (opts.water) pro('💧', 'Hidratare fără calorii', 'Apa este cea mai bună alegere pentru hidratare.');

    // Zahăr
    if (has(n.sugars)) {
      if (n.sugars <= 0.5) pro('🍬', 'Fără zahăr', `${f1(n.sugars)} g zahăr / ${unit}`);
      else if (n.sugars <= T.sugarLow) pro('🍬', 'Puțin zahăr', `${f1(n.sugars)} g zahăr / ${unit}`);
      else if (n.sugars > T.sugarHigh) con('🍬', 'Mult zahăr', `${f1(n.sugars)} g / ${unit} ≈ ${Math.round(n.sugars / 4)} lingurițe de zahăr (${pctRI(n.sugars, RI.sugars)}% din doza zilnică)`);
    }
    // Grăsimi saturate
    if (has(n.satFat)) {
      if (n.satFat <= T.satLow) pro('🧈', 'Puține grăsimi saturate', `${f1(n.satFat)} g / ${unit}`);
      else if (n.satFat > T.satHigh) con('🧈', 'Multe grăsimi saturate', `${f1(n.satFat)} g / ${unit} — ${pctRI(n.satFat, RI.satFat)}% din doza zilnică`);
    }
    // Grăsimi totale
    if (has(fat)) {
      if (fat <= T.fatLow) pro('🫒', 'Sărac în grăsimi', `${f1(fat)} g / ${unit}`);
      else if (fat > T.fatHigh) con('🫒', 'Bogat în grăsimi', `${f1(fat)} g / ${unit} — ${pctRI(fat, RI.fat)}% din doza zilnică`);
    }
    // Sare
    if (has(n.salt)) {
      if (n.salt <= 0.04) pro('🧂', 'Practic fără sare', `${f1(n.salt)} g / ${unit}`);
      else if (n.salt <= T.saltLow) pro('🧂', 'Puțină sare', `${f1(n.salt)} g / ${unit}`);
      else if (n.salt > T.saltHigh) con('🧂', 'Multă sare', `${f1(n.salt)} g / ${unit} — ${pctRI(n.salt, RI.salt)}% din doza zilnică`);
    }
    // Calorii
    if (has(kcal) && !opts.water) {
      if (kcal <= T.kcalLow) pro('🔥', 'Puține calorii', `${Math.round(kcal)} kcal / ${unit}`);
      else if (kcal > T.kcalHigh) con('🔥', 'Foarte caloric', `${Math.round(kcal)} kcal / ${unit} — ${pctRI(kcal, RI.kcal)}% din necesarul zilnic`);
    }
    // Fibre
    if (has(n.fibre) && !drink) {
      if (n.fibre >= 6) pro('🌾', 'Bogat în fibre', `${f1(n.fibre)} g / ${unit} — ajută digestia și sațietatea`);
      else if (n.fibre >= 3) pro('🌾', 'Sursă de fibre', `${f1(n.fibre)} g / ${unit}`);
    }
    // Proteine (procent din energie)
    if (has(n.protein) && has(kcal) && kcal > 0) {
      const share = (n.protein * 4 * 100) / kcal;
      if (share >= 20) pro('💪', 'Bogat în proteine', `${f1(n.protein)} g / ${unit} — ${Math.round(share)}% din calorii vin din proteine`);
      else if (share >= 12) pro('💪', 'Sursă de proteine', `${f1(n.protein)} g / ${unit}`);
    }
    // Fructe și legume
    if (has(n.fruitPct) && n.fruitPct >= 40) pro('🥦', 'Bogat în fructe și legume', `aprox. ${Math.round(n.fruitPct)}% fructe, legume sau leguminoase`);

    // Procesare
    if (nova === 1) pro('🌿', 'Neprocesat', 'Aliment natural sau minim procesat (NOVA 1).');
    if (nova === 4) con('🏭', 'Ultra-procesat', 'NOVA 4 — consumul frecvent este asociat cu riscuri pentru sănătate.');

    // Aditivi
    const ingredientsKnown = !!(p.ingredients_text || p.ingredients_text_ro) || additives.length > 0;
    if (ingredientsKnown && additives.length === 0) pro('✨', 'Fără aditivi', 'Nu conține aditivi alimentari declarați.');
    if (additives.length >= 5) {
      const codes = additives.slice(0, 5).map((a) => a.replace(/^[a-z]{2}:/, '').toUpperCase()).join(', ');
      con('🧪', 'Mulți aditivi', `${additives.length} aditivi (${codes}${additives.length > 5 ? '…' : ''})`);
    }
    if (n.sweeteners) con('🧪', 'Conține îndulcitori', 'Îndulcitori artificiali (ex. aspartam, sucraloză).');
    if (analysis.includes('en:palm-oil')) con('🌴', 'Conține ulei de palmier', 'Bogat în grăsimi saturate, impact asupra mediului.');
    if (analysis.includes('en:vegan')) pro('🌱', 'Vegan', 'Nu conține ingrediente de origine animală.');

    const score = overallScore(grade, points, drink, nova, additives.length);
    return { grade, points, official, score, verdict: label(score), pros, cons, drink, unit, kcal, fat, nutrients: n };
  }

  const api = { analyze, overallScore, label, RI };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Insights = api;
})(typeof self !== 'undefined' ? self : this);
