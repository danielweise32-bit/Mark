(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const video = $('video'), videoWrap = $('video-wrap'), statusEl = $('status');
  const scanBtn = $('scan-btn'), stopBtn = $('stop-btn'), resultEl = $('result');
  const API = 'https://world.openfoodfacts.org/api/v2/product/';
  const FIELDS = [
    'code', 'product_name', 'product_name_ro', 'brands', 'quantity', 'image_front_small_url',
    'nutriscore_grade', 'nutriscore_score', 'nova_group', 'ecoscore_grade', 'nutriments',
    'categories_tags', 'additives_tags', 'allergens_tags', 'ingredients_text_ro', 'ingredients_text',
  ].join(',');
  const HISTORY_KEY = 'nutriscan-history';

  let stream = null, scanning = false, zxingReader = null;

  // ---------- utilitare ----------
  function el(tag, attrs = {}, ...children) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else e.setAttribute(k, v);
    }
    for (const c of children) if (c != null) e.append(c);
    return e;
  }
  function setStatus(msg, error = false) { statusEl.textContent = msg; statusEl.classList.toggle('error', error); }
  const fmt = (v, unit) => (v == null || isNaN(v) ? '—' : `${(+v).toFixed(v < 10 ? 1 : 0).replace('.', ',')} ${unit}`);
  const tagName = (t) => t.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ');

  // ---------- scanare ----------
  async function startScan() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('Browserul nu permite acces la cameră. Introdu codul manual.', true); return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    } catch (e) {
      setStatus('Nu am primit acces la cameră (' + e.name + '). Verifică permisiunile sau introdu codul manual.', true);
      return;
    }
    video.srcObject = stream;
    await video.play();
    videoWrap.hidden = false; stopBtn.hidden = false; scanBtn.hidden = true;
    scanning = true;
    setStatus('Îndreaptă camera spre codul de bare…');

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
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  function zxingLoop() {
    if (!window.ZXing) { setStatus('Scanerul nu s-a încărcat. Introdu codul manual.', true); return; }
    const hints = new Map();
    hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [
      ZXing.BarcodeFormat.EAN_13, ZXing.BarcodeFormat.EAN_8, ZXing.BarcodeFormat.UPC_A, ZXing.BarcodeFormat.UPC_E,
    ]);
    zxingReader = new ZXing.BrowserMultiFormatReader(hints, 200);
    zxingReader.decodeFromStream(stream, video, (res) => { if (res && scanning) onCode(res.getText()); });
  }

  function stopScan() {
    scanning = false;
    if (zxingReader) { try { zxingReader.reset(); } catch (_) {} zxingReader = null; }
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
    videoWrap.hidden = true; stopBtn.hidden = true; scanBtn.hidden = false;
  }

  function onCode(code) {
    stopScan();
    if (navigator.vibrate) navigator.vibrate(80);
    $('code-input').value = code;
    lookup(code);
  }

  // ---------- căutare produs ----------
  async function lookup(code) {
    code = String(code).replace(/\D/g, '');
    if (code.length < 6) { setStatus('Cod invalid.', true); return; }
    setStatus('Caut produsul ' + code + '…');
    resultEl.hidden = true;
    try {
      const res = await fetch(`${API}${code}.json?fields=${FIELDS}&lc=ro`);
      const data = await res.json();
      if (data.status !== 1 || !data.product) {
        setStatus('Produsul ' + code + ' nu există în baza Open Food Facts. Îl poți adăuga pe openfoodfacts.org.', true);
        return;
      }
      setStatus('');
      const view = render(data.product, code);
      saveHistory({ code, name: view.name, grade: view.grade });
    } catch (e) {
      setStatus('Eroare de rețea. Verifică conexiunea la internet.', true);
    }
  }

  // ---------- afișare ----------
  const VERDICT = {
    a: 'Calitate nutrițională foarte bună', b: 'Calitate nutrițională bună', c: 'Calitate nutrițională medie',
    d: 'Calitate nutrițională slabă', e: 'Calitate nutrițională foarte slabă',
  };
  const NOVA = {
    1: 'Alimente neprocesate sau minim procesate', 2: 'Ingrediente culinare procesate',
    3: 'Alimente procesate', 4: 'Alimente ultra-procesate',
  };
  // praguri per 100 g (semafor nutrițional)
  const LEVELS = {
    fat: [3, 17.5], 'saturated-fat': [1.5, 5], sugars: [5, 22.5], salt: [0.3, 1.5],
  };
  function level(key, v) {
    const t = LEVELS[key];
    if (!t || v == null || isNaN(v)) return 'none';
    return v <= t[0] ? 'low' : v > t[1] ? 'high' : 'moderate';
  }

  function render(p, code) {
    const name = p.product_name_ro || p.product_name || 'Produs fără nume';
    let grade = (p.nutriscore_grade || '').toLowerCase();
    let computed = false, scoreInfo = null;
    if (!'abcde'.includes(grade) || !grade) {
      const { nutrients, opts } = NutriScore.fromOff(p);
      scoreInfo = NutriScore.compute(nutrients, opts);
      grade = scoreInfo ? scoreInfo.grade : '';
      computed = !!scoreInfo;
    }

    resultEl.replaceChildren();
    const img = p.image_front_small_url ? el('img', { src: p.image_front_small_url, alt: '' }) : null;
    resultEl.append(el('div', { class: 'product' }, img,
      el('div', {},
        el('h2', { text: name }),
        el('p', { class: 'muted', text: [p.brands, p.quantity].filter(Boolean).join(' · ') }),
        el('p', { class: 'muted', text: 'Cod: ' + code }))));

    if (grade) {
      const bar = el('div', { class: 'ns', 'aria-label': 'Nutri-Score ' + grade.toUpperCase() });
      for (const g of 'abcde') bar.append(el('span', { class: g + (g === grade ? ' on' : ''), text: g }));
      resultEl.append(el('h2', { text: 'Nutri-Score' }), bar,
        el('p', { class: 'verdict', text: VERDICT[grade] }),
        el('p', { class: 'muted', text: computed
          ? `Scor estimat de aplicație din valorile nutriționale (${scoreInfo.score} puncte).`
          : `Scor oficial Open Food Facts${p.nutriscore_score != null ? ` (${p.nutriscore_score} puncte)` : ''}.` }));
    } else {
      resultEl.append(el('p', { class: 'verdict', text: 'Nutri-Score indisponibil — lipsesc valorile nutriționale.' }));
    }

    const badges = el('div', { class: 'badges' });
    if (p.nova_group) badges.append(el('span', { class: 'badge', text: `NOVA ${p.nova_group}: ${NOVA[p.nova_group] || ''}` }));
    const addN = (p.additives_tags || []).length;
    badges.append(el('span', { class: 'badge', text: addN ? `${addN} aditiv${addN > 1 ? 'i' : ''}` : 'Fără aditivi declarați' }));
    if (badges.childNodes.length) resultEl.append(badges);

    const m = p.nutriments || {};
    let kcal = m['energy-kcal_100g'];
    if (kcal == null && m['energy-kj_100g'] != null) kcal = m['energy-kj_100g'] / 4.184;
    const rows = [
      ['Energie', kcal, 'kcal', null],
      ['Grăsimi', m.fat_100g, 'g', 'fat'],
      ['  din care saturate', m['saturated-fat_100g'], 'g', 'saturated-fat'],
      ['Glucide', m.carbohydrates_100g, 'g', null],
      ['  din care zaharuri', m.sugars_100g, 'g', 'sugars'],
      ['Fibre', m.fiber_100g, 'g', null],
      ['Proteine', m.proteins_100g, 'g', null],
      ['Sare', m.salt_100g ?? (m.sodium_100g != null ? m.sodium_100g * 2.5 : null), 'g', 'salt'],
    ];
    const tbody = el('tbody');
    for (const [label, v, unit, key] of rows) {
      const first = el('td');
      if (key) first.append(el('span', { class: 'dot ' + level(key, v) }));
      first.append(label.trim());
      if (label.startsWith('  ')) first.style.paddingLeft = '20px';
      tbody.append(el('tr', {}, first, el('td', { text: fmt(v, unit) })));
    }
    resultEl.append(el('h2', { text: 'Valori nutriționale / 100 g' }), el('table', {}, tbody),
      el('p', { class: 'muted', text: '🟢 scăzut · 🟡 moderat · 🔴 ridicat' }));

    const allergens = (p.allergens_tags || []).map(tagName);
    if (allergens.length) resultEl.append(el('p', {}, el('strong', { text: 'Alergeni: ' }), allergens.join(', ')));
    const ingredients = p.ingredients_text_ro || p.ingredients_text;
    if (ingredients) resultEl.append(el('details', {}, el('summary', { text: 'Ingrediente' }), el('p', { text: ingredients })));
    resultEl.append(el('p', {}, el('a', {
      href: `https://world.openfoodfacts.org/product/${code}`, target: '_blank', rel: 'noopener', text: 'Vezi pe Open Food Facts ↗',
    })));

    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return { name, grade };
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
      const g = h.grade || '';
      const mini = el('span', { class: 'mini', text: g || '?' });
      mini.style.background = g ? `var(--${g})` : 'var(--border)';
      const li = el('li', {}, mini, el('span', { text: h.name }));
      li.addEventListener('click', () => { $('code-input').value = h.code; lookup(h.code); });
      ul.append(li);
    }
  }

  // ---------- evenimente ----------
  scanBtn.addEventListener('click', startScan);
  stopBtn.addEventListener('click', () => { stopScan(); setStatus(''); });
  $('manual').addEventListener('submit', (e) => { e.preventDefault(); stopScan(); lookup($('code-input').value); });
  $('clear-history').addEventListener('click', () => {
    try { localStorage.removeItem(HISTORY_KEY); } catch (_) {}
    renderHistory();
  });
  renderHistory();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
