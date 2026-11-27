(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const video = $('video'), scanner = $('scanner'), statusEl = $('status'), resultEl = $('result');
  const API = 'https://world.openfoodfacts.org/api/v2/product/';
  const FIELDS = [
    'code', 'product_name', 'product_name_ro', 'brands', 'quantity', 'image_front_small_url', 'image_front_url',
    'nutriscore_grade', 'nutriscore_score', 'nova_group', 'nutriments', 'categories_tags', 'additives_tags',
    'allergens_tags', 'ingredients_text_ro', 'ingredients_text', 'ingredients_analysis_tags',
  ].join(',');
  const HISTORY_KEY = 'nutriscan-history';

  let stream = null, scanning = false, zxingReader = null;

  // ---------- utilitare ----------
  function el(tag, attrs = {}, ...children) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null) continue;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else e.setAttribute(k, v);
    }
    for (const c of children) if (c != null && c !== false) e.append(c);
    return e;
  }
  const svgEl = (tag, attrs) => {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  };
  function setStatus(msg, error = false) { statusEl.textContent = msg; statusEl.classList.toggle('error', error); }
  const fmt = (v) => (v == null || isNaN(v) ? '—' : (Math.round(v * 10) / 10).toString().replace('.', ','));
  const tagName = (t) => t.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ');
  const toneVar = (tone) => `var(--${tone || 'none'})`;

  // ---------- scanare ----------
  async function startScan() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('Browserul nu permite accesul la cameră. Introdu codul manual.', true); return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
      });
    } catch (e) {
      setStatus('Nu am primit acces la cameră. Verifică permisiunile sau introdu codul manual.', true);
      return;
    }
    scanner.hidden = false;
    document.body.style.overflow = 'hidden';
    video.srcObject = stream;
    await video.play().catch(() => {});
    scanning = true;
    setStatus('');

    if ('BarcodeDetector' in window) {
      let formats = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
      try {
        const supported = await BarcodeDetector.getSupportedFormats();
        formats = formats.filter((f) => supported.includes(f));
      } catch (_) {}
      if (formats.length) return nativeLoop(new BarcodeDetector({ formats }));
    }
    zxingLoop();
  }

  async function nativeLoop(detector) {
    while (scanning) {
      try {
        const codes = await detector.detect(video);
        if (codes.length) return onCode(codes[0].rawValue);
      } catch (_) {}
      await new Promise((r) => setTimeout(r, 120));
    }
  }

  function zxingLoop() {
    if (!window.ZXing) { stopScan(); setStatus('Scanerul nu s-a încărcat. Introdu codul manual.', true); return; }
    const hints = new Map();
    hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [
      ZXing.BarcodeFormat.EAN_13, ZXing.BarcodeFormat.EAN_8, ZXing.BarcodeFormat.UPC_A, ZXing.BarcodeFormat.UPC_E,
    ]);
    zxingReader = new ZXing.BrowserMultiFormatReader(hints, 150);
    zxingReader.decodeFromStream(stream, video, (res) => { if (res && scanning) onCode(res.getText()); });
  }

  function stopScan() {
    scanning = false;
    if (zxingReader) { try { zxingReader.reset(); } catch (_) {} zxingReader = null; }
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
    scanner.hidden = true;
    document.body.style.overflow = '';
  }

  function onCode(code) {
    stopScan();
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    $('code-input').value = code;
    lookup(code);
  }

  // ---------- căutare produs ----------
  function showSkeleton() {
    resultEl.replaceChildren(el('div', { class: 'skeleton' },
      el('div', { style: 'display:flex;gap:16px;align-items:center' },
        el('div', { class: 'sk', style: 'width:96px;height:96px;border-radius:18px' }),
        el('div', { style: 'flex:1' },
          el('div', { class: 'sk', style: 'height:20px;width:80%' }),
          el('div', { class: 'sk', style: 'height:14px;width:50%;margin-top:10px' }))),
      el('div', { class: 'sk', style: 'height:116px;margin-top:18px;border-radius:18px' })));
    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function lookup(code) {
    code = String(code).replace(/\D/g, '');
    if (code.length < 6) { setStatus('Codul de bare trebuie să aibă cel puțin 6 cifre.', true); return; }
    setStatus('');
    showSkeleton();
    try {
      const res = await fetch(`${API}${code}.json?fields=${FIELDS}&lc=ro`);
      const data = await res.json();
      if (data.status !== 1 || !data.product) { renderNotFound(code); return; }
      const view = render(data.product, code);
      saveHistory({ code, name: view.name, score: view.score, tone: view.tone, img: data.product.image_front_small_url || '' });
    } catch (e) {
      resultEl.hidden = true;
      setStatus('Eroare de rețea. Verifică conexiunea la internet.', true);
    }
  }

  function renderNotFound(code) {
    resultEl.replaceChildren(el('div', { class: 'panel', style: 'text-align:center' },
      el('div', { style: 'font-size:3rem', text: '🔍' }),
      el('h2', { text: 'Produs negăsit' }),
      el('p', { class: 'meta', text: `Codul ${code} nu există încă în baza de date Open Food Facts.` }),
      el('div', { class: 'actions' },
        el('a', { class: 'btn primary', href: `https://world.openfoodfacts.org/cgi/product.pl?type=search_or_add&action=process&code=${code}`, target: '_blank', rel: 'noopener', text: 'Adaugă produsul' }),
        el('button', { class: 'btn secondary', text: 'Scanează altul', id: 'again-nf' }))));
    $('again-nf').addEventListener('click', startScan);
  }

  // ---------- afișare ----------
  const NOVA = { 1: 'Neprocesat', 2: 'Ingredient culinar', 3: 'Procesat', 4: 'Ultra-procesat' };
  const NOVA_TONE = { 1: 'a', 2: 'b', 3: 'd', 4: 'e' };
  const GRADE_TEXT = { a: 'Calitate nutrițională foarte bună', b: 'Calitate nutrițională bună', c: 'Calitate nutrițională medie', d: 'Calitate nutrițională slabă', e: 'Calitate nutrițională foarte slabă' };
  const LEVELS = { fat: [3, 17.5], satFat: [1.5, 5], sugars: [5, 22.5], salt: [0.3, 1.5] };
  const LEVELS_DRINK = { fat: [1.5, 8.75], satFat: [0.75, 2.5], sugars: [2.5, 5], salt: [0.3, 0.75] };

  function gauge(score, tone) {
    const r = 50, c = 2 * Math.PI * r;
    const svg = svgEl('svg', { width: 116, height: 116, viewBox: '0 0 116 116' });
    svg.append(svgEl('circle', { class: 'track', cx: 58, cy: 58, r, fill: 'none', 'stroke-width': 11 }));
    const bar = svgEl('circle', {
      class: 'bar', cx: 58, cy: 58, r, fill: 'none', 'stroke-width': 11, 'stroke-linecap': 'round',
      stroke: toneVar(tone), 'stroke-dasharray': c, 'stroke-dashoffset': c,
    });
    svg.append(bar);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      bar.setAttribute('stroke-dashoffset', c * (1 - (score ?? 0) / 100));
    }));
    return el('div', { class: 'gauge' }, svg,
      el('div', { class: 'gauge-num' }, el('b', { text: score ?? '?' }), el('small', { text: 'din 100' })));
  }

  function nutriScoreBadge(grade) {
    const wrap = el('div', { class: 'ns', 'aria-label': grade ? `Nutri-Score ${grade.toUpperCase()}` : 'Nutri-Score indisponibil' });
    for (const g of 'abcde') wrap.append(el('span', { class: `g-${g}${g === grade ? ' on' : ''}`, text: g }));
    return wrap;
  }

  function prosCons(kind, items) {
    const isPro = kind === 'pros';
    const list = el('ul');
    for (const it of items) {
      list.append(el('li', {}, el('div', { class: 'ico', text: it.icon }),
        el('div', {}, el('b', { text: it.title }), el('span', { text: it.detail }))));
    }
    return el('div', { class: `panel pc ${kind}` },
      el('h3', {}, isPro ? '👍 Avantaje' : '👎 Dezavantaje', el('span', { class: 'count', text: items.length })),
      items.length ? list : el('p', { class: 'empty', text: isPro ? 'Nu am găsit avantaje nutriționale notabile.' : 'Nu am găsit dezavantaje notabile. 🎉' }));
  }

  function nutrientsPanel(a, m) {
    const L = a.drink ? LEVELS_DRINK : LEVELS;
    const RI = Insights.RI;
    const n = a.nutrients;
    const rows = [
      { name: 'Energie', v: a.kcal, unit: 'kcal', ri: RI.kcal },
      { name: 'Grăsimi', v: a.fat, unit: 'g', ri: RI.fat, lvl: L.fat },
      { name: 'din care saturate', v: n.satFat, unit: 'g', ri: RI.satFat, lvl: L.satFat, sub: true },
      { name: 'Glucide', v: m.carbohydrates_100g != null ? +m.carbohydrates_100g : null, unit: 'g', ri: 260 },
      { name: 'din care zaharuri', v: n.sugars, unit: 'g', ri: RI.sugars, lvl: L.sugars, sub: true },
      { name: 'Fibre', v: n.fibre, unit: 'g', ri: RI.fibre },
      { name: 'Proteine', v: n.protein, unit: 'g', ri: RI.protein },
      { name: 'Sare', v: n.salt, unit: 'g', ri: RI.salt, lvl: L.salt },
    ];
    const box = el('div', { class: 'nutr' });
    for (const r of rows) {
      const has = r.v != null && !isNaN(r.v);
      let lvl = 'none';
      if (r.lvl && has) lvl = r.v <= r.lvl[0] ? 'low' : r.v > r.lvl[1] ? 'high' : 'moderate';
      const pct = has ? Math.round((r.v / r.ri) * 100) : 0;
      const bar = el('i', { class: `lvl-${lvl}` });
      requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = Math.min(100, pct) + '%'; }));
      box.append(el('div', { class: 'nutr-row' },
        el('div', { class: 'top' },
          el('span', { class: 'name' + (r.sub ? ' sub' : ''), text: r.name }),
          el('span', { class: 'val' }, has ? `${r.unit === 'kcal' ? Math.round(r.v) : fmt(r.v)} ${r.unit}` : '—',
            has ? el('small', { text: `${pct}% DZR` }) : null)),
        el('div', { class: 'meter' }, bar)));
    }
    return el('div', { class: 'panel' },
      el('div', { class: 'panel-head' }, el('h2', { text: `Valori nutriționale` }), el('span', { class: 'meta', text: `per ${a.unit}` })),
      box,
      el('p', { class: 'note', text: 'DZR = doza zilnică de referință pentru un adult (2000 kcal). Culoarea barei: verde = scăzut, galben = moderat, roșu = ridicat.' }));
  }

  function render(p, code) {
    const name = p.product_name_ro || p.product_name || 'Produs fără nume';
    const a = Insights.analyze(p);
    const tone = a.verdict.tone;
    const m = p.nutriments || {};

    const img = el('div', { class: 'product-img' },
      p.image_front_small_url ? el('img', { src: p.image_front_url || p.image_front_small_url, alt: name, loading: 'lazy' }) : '🛒');

    const nova = Number(p.nova_group);
    const chips = el('div', { class: 'chips' });
    if (NOVA[nova]) chips.append(el('span', { class: 'chip' }, el('span', { class: 'dot', style: `background:${toneVar(NOVA_TONE[nova])}` }), `NOVA ${nova} · ${NOVA[nova]}`));
    const addN = (p.additives_tags || []).length;
    chips.append(el('span', { class: 'chip' }, '🧪 ', addN ? `${addN} aditiv${addN === 1 ? '' : 'i'}` : 'Fără aditivi'));
    if (a.drink) chips.append(el('span', { class: 'chip', text: '🥤 Băutură' }));

    const card = el('article', { class: 'product-card' },
      el('div', { class: 'product-top' }, img,
        el('div', {},
          el('h2', { text: name }),
          el('div', { class: 'meta', text: [p.brands, p.quantity].filter(Boolean).join(' · ') || `Cod ${code}` }))),
      el('div', { class: 'score-row' },
        gauge(a.score, tone),
        el('div', {},
          el('div', { class: 'verdict-title', style: `color:${toneVar(tone)}`, text: a.verdict.text }),
          el('div', { class: 'verdict-sub', text: a.grade ? GRADE_TEXT[a.grade] : 'Date nutriționale insuficiente' }),
          el('div', { class: 'ns-label', text: a.official ? 'Nutri-Score' : 'Nutri-Score estimat' }),
          nutriScoreBadge(a.grade))),
      chips);

    const extra = [];
    const allergens = (p.allergens_tags || []).map(tagName);
    if (allergens.length) {
      const tags = el('div', { class: 'tags' });
      allergens.forEach((t) => tags.append(el('span', { class: 'tag', text: t })));
      extra.push(el('div', { class: 'panel' }, el('h2', { text: '⚠️ Alergeni', style: 'margin-bottom:10px' }), tags));
    }
    const ingredients = p.ingredients_text_ro || p.ingredients_text;
    if (ingredients) extra.push(el('div', { class: 'panel' }, el('details', {}, el('summary', { text: 'Ingrediente' }), el('p', { text: ingredients }))));

    const again = el('button', { class: 'btn primary', text: '📷 Scanează din nou' });
    again.addEventListener('click', startScan);

    resultEl.replaceChildren(card,
      el('div', { class: 'pc-grid' }, prosCons('pros', a.pros), prosCons('cons', a.cons)),
      nutrientsPanel(a, m), ...extra,
      el('div', { class: 'actions' }, again,
        el('a', { class: 'btn secondary', href: `https://world.openfoodfacts.org/product/${code}`, target: '_blank', rel: 'noopener', text: 'Detalii ↗' })));
    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return { name, score: a.score, tone };
  }

  // ---------- istoric ----------
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch (_) { return []; }
  }
  function saveHistory(item) {
    const list = [item, ...loadHistory().filter((h) => h.code !== item.code)].slice(0, 30);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch (_) {}
    renderHistory();
  }
  function renderHistory() {
    const list = loadHistory(), ul = $('history');
    ul.replaceChildren();
    $('history-card').hidden = !list.length;
    for (const h of list) {
      const thumb = el('div', { class: 'thumb' }, h.img && /^https:\/\//.test(h.img) ? el('img', { src: h.img, alt: '', loading: 'lazy' }) : '🛒');
      const score = el('span', { class: 'h-score', text: h.score ?? '?' });
      score.style.background = toneVar(h.tone);
      const li = el('li', {}, thumb, el('span', { class: 'h-name', text: h.name }), score);
      li.addEventListener('click', () => { $('code-input').value = h.code; lookup(h.code); });
      ul.append(li);
    }
  }

  // ---------- evenimente ----------
  $('scan-btn').addEventListener('click', startScan);
  $('stop-btn').addEventListener('click', stopScan);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && scanning) stopScan(); });
  $('manual').addEventListener('submit', (e) => { e.preventDefault(); lookup($('code-input').value); });
  $('clear-history').addEventListener('click', () => {
    try { localStorage.removeItem(HISTORY_KEY); } catch (_) {}
    renderHistory();
  });
  renderHistory();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
