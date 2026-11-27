/* Grila Mea – teste grilă pentru Evaluarea Națională și Bacalaureat.
   Fără build: totul rulează în browser, datele elevului se păstrează în localStorage. */
(function () {
  'use strict';

  // ---------- Stocare ----------
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem('grila.' + key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('grila.' + key, JSON.stringify(value)); } catch (e) { /* stocare indisponibilă */ }
    },
  };

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DEFAULTS = {
    name: '', avatar: '🦊', theme: 'cream', accent: '#5b8def', font: 'nunito', fontSize: 17,
    radius: 18, density: 'comfy', animations: !reduceMotion, shuffle: true, confetti: true, sounds: false,
    defaultCount: 10, defaultMode: 'practice',
  };
  let settings = Object.assign({}, DEFAULTS, store.get('settings', {}));
  let stats = Object.assign({ attempts: [], mistakes: {} }, store.get('stats', {}));
  let custom = Object.assign({ subjects: [] }, store.get('custom', {}));
  let quiz = null;          // testul în desfășurare
  let lastResult = null;    // ultimul test terminat
  let timerId = null;
  const view = { quizId: 0, cur: -1, dir: 1, justAnswered: false, lostLife: false };

  const HARD_LIVES = 3;
  const HARD_SECONDS = 60;

  const saveSettings = () => store.set('settings', settings);
  const saveStats = () => store.set('stats', stats);
  const saveCustom = () => store.set('custom', custom);
  const saveQuiz = () => { try { sessionStorage.setItem('grila.quiz', JSON.stringify(quiz)); } catch (e) {} };

  // ---------- Utilitare ----------
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  const qKey = (sid, q) => sid + ':' + hash(q.q);
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const fmtTime = (sec) => { sec = Math.max(0, Math.round(sec)); const m = Math.floor(sec / 60), s = sec % 60; return m + ':' + String(s).padStart(2, '0'); };
  const fmtDate = (t) => new Date(t).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const grade = (correct, total) => (total ? 1 + (9 * correct) / total : 1);
  const chipClass = (p) => (p >= 80 ? 'hi' : p >= 50 ? 'mid' : 'lo');
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : (n % 100 >= 20 || n % 100 === 0) && n !== 0 ? 'de ' + many : many);
  const animOn = () => settings.animations;
  const feedbackMode = (q) => q.mode !== 'exam';

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ---------- Efecte: sunete ----------
  const sfx = {
    ctx: null,
    play(type) {
      if (!settings.sounds) return;
      try {
        this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
        const c = this.ctx;
        const seq = { ok: [660, 880], bad: [233, 175], win: [523, 659, 784, 1047], lose: [330, 262, 196, 131], tick: [1320], click: [520], combo: [784, 988, 1175] }[type] || [440];
        const harsh = type === 'bad' || type === 'lose';
        seq.forEach((f, i) => {
          const o = c.createOscillator(), g = c.createGain();
          o.type = harsh ? 'triangle' : 'sine';
          o.frequency.value = f;
          const t = c.currentTime + i * (type === 'tick' ? 0 : 0.085);
          const vol = type === 'tick' ? 0.05 : 0.13;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
          g.gain.exponentialRampToValueAtTime(0.0001, t + (harsh ? 0.28 : 0.2));
          o.connect(g).connect(c.destination);
          o.start(t); o.stop(t + 0.3);
        });
      } catch (e) { /* audio indisponibil */ }
    },
  };

  // ---------- Efecte vizuale ----------
  const fx = {
    center(el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; },
    burst(x, y, colors) {
      if (!animOn()) return;
      const box = document.createElement('div'); box.className = 'burst'; box.style.left = x + 'px'; box.style.top = y + 'px';
      for (let i = 0; i < 18; i++) {
        const s = document.createElement('i');
        const ang = (Math.PI * 2 * i) / 18 + Math.random() * 0.4;
        const dist = 50 + Math.random() * 70;
        s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
        s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
        s.style.background = colors[i % colors.length];
        s.style.animationDelay = Math.random() * 60 + 'ms';
        box.appendChild(s);
      }
      document.body.appendChild(box); setTimeout(() => box.remove(), 900);
    },
    float(text, x, y, cls = '') {
      if (!animOn()) return;
      const el = document.createElement('div'); el.className = 'floater ' + cls; el.textContent = text;
      el.style.left = x + 'px'; el.style.top = y + 'px';
      document.body.appendChild(el); setTimeout(() => el.remove(), 1300);
    },
    combo(n) {
      if (!animOn() || n < 2) return;
      const old = $('.combo-pop'); if (old) old.remove();
      const el = document.createElement('div'); el.className = 'combo-pop';
      el.innerHTML = `<span>🔥</span> Combo <b>x${n}</b>`;
      document.body.appendChild(el); setTimeout(() => el.remove(), 1400);
    },
    shake(el) { if (!animOn() || !el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); },
    countUp(root = document) {
      $$('[data-count]', root).forEach((el) => {
        const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suf || '';
        const fmt = (v) => v.toFixed(dec).replace('.', ',') + suf;
        if (!animOn()) { el.textContent = fmt(to); return; }
        const t0 = performance.now(), dur = 1100;
        const step = (t) => { const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      });
    },
    stagger(root) {
      if (!animOn()) return;
      let i = 0;
      const els = [...root.children].flatMap((c) => (c.matches('.grid, .stack, .kpis, .pills') ? [...c.children] : [c]));
      els.forEach((el) => { el.classList.add('rise'); el.style.setProperty('--i', Math.min(i++, 14)); });
    },
    confetti() {
      if (!animOn() || !settings.confetti) return;
      const cv = document.createElement('canvas'); cv.className = 'confetti-canvas';
      document.body.appendChild(cv);
      const ctx = cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
      const W = innerWidth, H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
      const colors = [settings.accent, '#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#f78c6b', '#c77dff'];
      const ps = [];
      [[0, 1], [W, -1]].forEach(([x0, dir]) => {
        for (let i = 0; i < 90; i++) ps.push({ x: x0, y: H * 0.75, vx: dir * (6 + Math.random() * 12), vy: -(10 + Math.random() * 14), w: 6 + Math.random() * 6, h: 9 + Math.random() * 9, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.35, c: colors[(Math.random() * colors.length) | 0], shape: Math.random() < 0.3 });
      });
      const t0 = performance.now(); let last = t0;
      const frame = (t) => {
        const dt = Math.min(2, (t - last) / 16.7); last = t;
        ctx.clearRect(0, 0, W, H);
        ps.forEach((p) => {
          p.vy += 0.38 * dt; p.vx *= Math.pow(0.985, dt); p.vy *= Math.pow(0.985, dt);
          p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, Math.cos(p.r * 1.7));
          ctx.fillStyle = p.c;
          if (p.shape) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });
        if (t - t0 < 5000) requestAnimationFrame(frame); else cv.remove();
      };
      requestAnimationFrame(frame);
    },
  };

  // Scântei care urcă în fundal, doar în modul Hard.
  const embers = {
    cv: null, raf: 0, ps: [],
    start() {
      if (this.cv || !animOn()) return;
      const cv = (this.cv = document.createElement('canvas')); cv.className = 'embers';
      document.body.prepend(cv);
      const ctx = cv.getContext('2d');
      const size = () => { const d = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
      size(); this.onResize = size; addEventListener('resize', size);
      const spawn = () => ({ x: Math.random() * innerWidth, y: innerHeight + 10, r: 1 + Math.random() * 2.6, vy: 0.4 + Math.random() * 1.3, vx: (Math.random() - 0.5) * 0.4, life: 0, max: 280 + Math.random() * 260, hue: 15 + Math.random() * 30 });
      this.ps = Array.from({ length: 70 }, () => { const p = spawn(); p.y = Math.random() * innerHeight; return p; });
      const loop = () => {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        this.ps.forEach((p, i) => {
          p.life++; p.y -= p.vy; p.x += p.vx + Math.sin((p.life + i * 13) / 30) * 0.3;
          const a = Math.max(0, 1 - p.life / p.max);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${a * 0.9})`;
          ctx.shadowColor = `hsla(${p.hue}, 100%, 55%, ${a})`; ctx.shadowBlur = 10;
          ctx.fill();
          if (p.life > p.max || p.y < -10) this.ps[i] = spawn();
        });
        this.raf = requestAnimationFrame(loop);
      };
      loop();
    },
    stop() {
      if (!this.cv) return;
      cancelAnimationFrame(this.raf); removeEventListener('resize', this.onResize);
      this.cv.remove(); this.cv = null;
    },
  };

  // Undă la apăsare pe butoane și variante.
  document.addEventListener('pointerdown', (e) => {
    if (!animOn()) return;
    const el = e.target.closest('.btn, .opt, .dot, .swatch, .choice span');
    if (!el || el.disabled) return;
    const r = el.getBoundingClientRect();
    const s = document.createElement('span'); s.className = 'ripple';
    const d = Math.max(r.width, r.height) * 2;
    s.style.width = s.style.height = d + 'px';
    s.style.left = e.clientX - r.left - d / 2 + 'px'; s.style.top = e.clientY - r.top - d / 2 + 'px';
    el.appendChild(s); setTimeout(() => s.remove(), 650);
  });

  // Înclinare 3D a cardurilor după cursor.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest('.tilt');
      if (fx._tilt && fx._tilt !== el) { fx._tilt.style.removeProperty('--rx'); fx._tilt.style.removeProperty('--ry'); }
      fx._tilt = el;
      if (!el || !animOn()) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', ((0.5 - py) * 8).toFixed(2) + 'deg');
      el.style.setProperty('--ry', ((px - 0.5) * 10).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });
  }

  // ---------- Date ----------
  function exams() {
    const list = [window.GRILE.en, window.GRILE.bac];
    list.push({ id: 'custom', name: 'Grilele mele', short: 'EU', subtitle: 'Întrebări create de tine', icon: '✏️', subjects: custom.subjects });
    return list;
  }
  function findSubject(sid) {
    for (const ex of exams()) for (const s of ex.subjects) if (s.id === sid) return { exam: ex, subject: s };
    return null;
  }
  const hardPool = (sid) => ((window.GRILE.hard || {})[sid] || []).map((q) => ({ sid, q, hard: true }));
  const subjectPool = (sid) => { const f = findSubject(sid); return f ? f.subject.questions.map((q) => ({ sid, q })) : []; };
  const examHardCount = (ex) => ex.subjects.reduce((s, x) => s + hardPool(x.id).length, 0);
  function subjectStats(sid) {
    const list = stats.attempts.filter((a) => a.sid === sid && !a.hard);
    if (!list.length) return null;
    const best = Math.max(...list.map((a) => pct(a.correct, a.total)));
    const avg = Math.round(list.reduce((s, a) => s + pct(a.correct, a.total), 0) / list.length);
    return { count: list.length, best, avg };
  }
  const hardBest = (sid) => stats.attempts.filter((a) => a.hard && (!sid || a.sid === sid)).reduce((m, a) => Math.max(m, a.points || 0), 0);

  // ---------- Personalizare ----------
  const THEMES = [
    { id: 'cream', name: 'Crem', bg: '#f7f1e8' },
    { id: 'light', name: 'Luminos', bg: '#f4f6fb' },
    { id: 'mint', name: 'Mentă', bg: '#eef6f1' },
    { id: 'lavender', name: 'Lavandă', bg: '#f3f0fa' },
    { id: 'dark', name: 'Întunecat', bg: '#1c1a18' },
    { id: 'night', name: 'Noapte', bg: '#111827' },
    { id: 'auto', name: 'Automat', bg: 'linear-gradient(90deg,#f7f1e8 50%,#1c1a18 50%)' },
  ];
  const ACCENTS = ['#5b8def', '#e07a5f', '#2a9d8f', '#9c6ade', '#e9a23b', '#d16ba5', '#43aa8b', '#264653'];
  const FONTS = {
    nunito: { name: 'Nunito (rotunjit)', css: "'Nunito', system-ui, sans-serif" },
    atkinson: { name: 'Atkinson (ușor de citit)', css: "'Atkinson Hyperlegible', system-ui, sans-serif" },
    lora: { name: 'Lora (clasic, cu serife)', css: "'Lora', Georgia, serif" },
    system: { name: 'Fontul sistemului', css: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' },
  };
  const AVATARS = ['🦊', '🐼', '🦉', '🐱', '🐶', '🐸', '🦄', '🐧', '🐝', '🌻', '🚀', '⭐', '📚', '🎧', '⚽', '🎨'];

  function readableOn(hex) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || '');
    if (!m) return '#fff';
    const [r, g, b] = m.slice(1).map((x) => parseInt(x, 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return L > 0.4 ? '#1f1a14' : '#ffffff';
  }

  function applySettings() {
    const root = document.documentElement;
    let theme = settings.theme;
    if (theme === 'auto') theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'cream';
    root.dataset.theme = theme;
    root.dataset.density = settings.density;
    root.dataset.anim = settings.animations ? 'on' : 'off';
    root.style.setProperty('--accent', settings.accent);
    root.style.setProperty('--on-accent', readableOn(settings.accent));
    root.style.setProperty('--font', (FONTS[settings.font] || FONTS.nunito).css);
    root.style.setProperty('--fs', settings.fontSize + 'px');
    root.style.setProperty('--radius', settings.radius + 'px');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue('--bg').trim() || '#f7f1e8';
  }
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => settings.theme === 'auto' && applySettings());

  // Schimbare cu efect de „cerc care se extinde” din punctul apăsat (unde browserul permite).
  function reveal(evt, change) {
    if (!document.startViewTransition || !animOn()) return change();
    const r = evt && evt.target && evt.target.getBoundingClientRect ? evt.target.getBoundingClientRect() : null;
    const x = r ? r.left + r.width / 2 : innerWidth / 2, y = r ? r.top + r.height / 2 : innerHeight / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.documentElement.classList.add('vt-reveal');
    const t = document.startViewTransition(change);
    t.ready.then(() => {
      document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(() => {});
    t.finished.catch(() => {}).finally(() => document.documentElement.classList.remove('vt-reveal'));
    t.updateCallbackDone.catch(() => {});
  }

  // ---------- Router ----------
  const app = $('#app');
  function go(h) { if (location.hash === h) render(); else location.hash = h; }
  window.addEventListener('hashchange', render);

  function render() {
    if (document.startViewTransition && animOn() && render.ready) {
      const t = document.startViewTransition(renderNow);
      // Tranziția poate fi întreruptă (ex.: se rotește telefonul); conținutul se afișează oricum.
      [t.ready, t.finished, t.updateCallbackDone].forEach((pr) => pr.catch(() => {}));
    } else renderNow();
    render.ready = true;
  }

  function renderNow() {
    clearInterval(timerId);
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/');
    const route = parts[0] || 'home';
    $$('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.nav === route || ((route === 'exam' || route === 'subject') && a.dataset.nav === 'home')));
    const views = { home: viewHome, exam: () => viewExam(parts[1]), subject: () => viewSubject(parts[1]), quiz: viewQuiz, results: viewResults, mistakes: viewMistakes, stats: viewStats, settings: viewSettings, custom: viewCustom };
    if (route !== 'quiz') { document.body.classList.remove('hard-mode'); embers.stop(); view.cur = -1; }
    (views[route] || viewHome)();
    if (route !== 'quiz') { window.scrollTo(0, 0); fx.stagger(app); fx.countUp(app); }
  }

  // ---------- Acasă ----------
  function greeting() {
    const h = new Date().getHours();
    const part = h < 5 ? 'Noapte bună' : h < 11 ? 'Bună dimineața' : h < 18 ? 'Bună ziua' : 'Bună seara';
    return part + (settings.name ? ', ' + settings.name : '') + '!';
  }
  function streak() {
    const days = new Set(stats.attempts.map((a) => new Date(a.date).toDateString()));
    let n = 0; const d = new Date();
    if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
    while (days.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  function viewHome() {
    const total = stats.attempts.length;
    const answered = stats.attempts.reduce((s, a) => s + a.total, 0);
    const correct = stats.attempts.reduce((s, a) => s + a.correct, 0);
    const mistakes = Object.keys(stats.mistakes).length;
    const st = streak();
    const best = hardBest();
    const examCards = exams().map((ex) => {
      const qn = ex.subjects.reduce((s, x) => s + x.questions.length, 0);
      return `<a class="card exam-card tilt" href="#/exam/${ex.id}">
        <span class="tag">${esc(ex.short)}</span>
        <span class="emoji" aria-hidden="true">${ex.icon}</span>
        <h2>${esc(ex.name)}</h2>
        <p class="muted">${esc(ex.subtitle)}</p>
        <p class="small muted" style="margin:0">${plural(ex.subjects.length, 'materie', 'materii')} · ${plural(qn, 'întrebare', 'întrebări')}</p>
      </a>`;
    }).join('');
    app.innerHTML = `
      <section class="hero">
        <div class="avatar" aria-hidden="true">${esc(settings.avatar)}</div>
        <div class="hero-text">
          <h1><span class="wave-text">${esc(greeting())}</span></h1>
          <p>Alege examenul și exersează în ritmul tău. Fără grabă, fără stres.</p>
        </div>
      </section>
      <div class="pills">
        <span class="pill">🔥 Serie: <b>${plural(st, 'zi', 'zile')}</b></span>
        <span class="pill">📝 Teste: <b>${total}</b></span>
        <span class="pill">🎯 Corecte: <b>${answered ? pct(correct, answered) + '%' : '–'}</b></span>
        ${best ? `<span class="pill">🏆 Record Hard: <b>${best}</b></span>` : ''}
        ${mistakes ? `<a class="pill" href="#/mistakes" style="text-decoration:none">🔁 De recapitulat: <b>${mistakes}</b></a>` : ''}
      </div>
      <div class="grid">${examCards}</div>
      <section class="card hard-card">
        <div class="hard-glow" aria-hidden="true"></div>
        <div class="row" style="position:relative">
          <div style="flex:1;min-width:230px">
            <h2 style="margin:0 0 4px">🔥 Mod Hard</h2>
            <p style="margin:0;opacity:.9">Întrebări grele, în stilul subiectelor de examen. <b>3 vieți</b>, <b>${HARD_SECONDS} de secunde</b> pe întrebare, puncte bonus pentru combo și viteză.</p>
          </div>
          <button class="btn hard-btn" data-hard="en">EN · Hard</button>
          <button class="btn hard-btn" data-hard="bac">BAC · Hard</button>
        </div>
      </section>
      <section class="card">
        <div class="row">
          <div style="flex:1;min-width:220px">
            <h3>⚡ Test rapid</h3>
            <p class="muted" style="margin:0">10 întrebări amestecate din toate materiile unui examen.</p>
          </div>
          <button class="btn soft" data-mix="en">Evaluare Națională</button>
          <button class="btn soft" data-mix="bac">Bacalaureat</button>
        </div>
      </section>`;
    $$('[data-mix]', app).forEach((b) => b.addEventListener('click', () => launch({ type: 'mix', examId: b.dataset.mix })));
    $$('[data-hard]', app).forEach((b) => b.addEventListener('click', () => launch({ type: 'mix', examId: b.dataset.hard, hard: true })));
  }

  // ---------- Pornirea unui test ----------
  function launch(desc) {
    if (desc.type === 'subject') {
      const f = findSubject(desc.sid);
      if (!f) return go('#/');
      const hard = desc.mode === 'hard';
      startQuiz({ desc, sid: desc.sid, title: f.subject.name + (hard ? ' · Hard' : ''), icon: hard ? '🔥' : f.subject.icon,
        pool: hard ? hardPool(desc.sid) : subjectPool(desc.sid), count: desc.count, mode: desc.mode, timer: desc.timer });
    } else if (desc.type === 'mix') {
      const ex = exams().find((e) => e.id === desc.examId);
      const pool = [];
      ex.subjects.forEach((s) => pool.push(...(desc.hard ? hardPool(s.id) : s.questions.map((q) => ({ sid: s.id, q })))));
      startQuiz({ desc, sid: 'mix-' + ex.id + (desc.hard ? '-hard' : ''), title: (desc.hard ? 'Hard · ' : 'Test rapid · ') + ex.name, icon: desc.hard ? '🔥' : '⚡',
        pool, count: 10, mode: desc.hard ? 'hard' : 'practice', timer: false });
    } else if (desc.type === 'mistakes') {
      const list = Object.values(stats.mistakes).filter((m) => !desc.sid || m.sid === desc.sid);
      if (!list.length) return toast('Nu ai greșeli de recapitulat. Bravo! 🎉');
      const f = desc.sid && findSubject(desc.sid);
      startQuiz({ desc, sid: desc.sid || 'mistakes', title: f ? f.subject.name + ' · greșeli' : 'Recapitulare greșeli', icon: '🔁',
        pool: list.map((m) => ({ sid: m.sid, q: m.q })), count: list.length, mode: 'practice', timer: false });
    } else if (desc.type === 'redo') {
      startQuiz({ desc: { type: 'mistakes' }, sid: desc.sid, title: desc.title, icon: '🔁', pool: desc.pool, count: desc.pool.length, mode: 'practice', timer: false });
    }
  }

  function startQuiz({ desc, sid, title, icon, pool, count, mode, timer }) {
    if (!pool.length) return toast('Nu există întrebări pentru acest test.');
    const picked = shuffle(pool).slice(0, Math.min(count, pool.length));
    const items = picked.map(({ sid: qs, q, hard }) => {
      const idx = q.o.map((_, i) => i);
      const order = settings.shuffle || hard ? shuffle(idx) : idx;
      return { key: qKey(qs, q), sid: qs, q: q.q, o: order.map((i) => q.o[i]), a: order.indexOf(q.a), e: q.e || '' };
    });
    quiz = {
      id: Date.now(), desc, sid, title, icon, mode, items, answers: items.map(() => null), flags: [], cur: 0,
      start: Date.now(), limit: timer && mode === 'exam' ? items.length * 60 : 0,
      combo: 0, maxCombo: 0, points: 0, lives: mode === 'hard' ? HARD_LIVES : 0, qStart: Date.now(),
    };
    saveQuiz();
    view.dir = 1;
    go('#/quiz');
  }

  // ---------- Listă materii ----------
  function viewExam(id) {
    const ex = exams().find((e) => e.id === id);
    if (!ex) return go('#/');
    const cards = ex.subjects.map((s) => {
      const st = subjectStats(s.id);
      const hn = hardPool(s.id).length;
      return `<a class="card subject tilt" href="#/subject/${esc(s.id)}" style="--c:${esc(s.color)}">
        <span class="ico" aria-hidden="true">${esc(s.icon)}</span>
        <div style="flex:1;min-width:0">
          <h3>${esc(s.name)}</h3>
          <div class="meta">${plural(s.questions.length, 'întrebare', 'întrebări')}${hn ? ` · <span class="hard-tag">🔥 ${hn} hard</span>` : ''}${st ? ' · cel mai bun: ' + st.best + '%' : ''}</div>
          <div class="bar"><i style="width:${st ? st.best : 0}%"></i></div>
        </div>
      </a>`;
    }).join('');
    app.innerHTML = `
      <div class="crumbs"><a href="#/">Acasă</a> › ${esc(ex.name)}</div>
      <h1>${ex.icon} ${esc(ex.name)}</h1>
      <p class="muted">${esc(ex.subtitle)} · alege materia</p>
      ${ex.subjects.length ? `<div class="grid two">${cards}</div>` : `
        <div class="card empty"><span class="big">✏️</span><p>Nu ai creat încă nicio materie proprie.</p>
        <a class="btn" href="#/custom">Creează primele grile</a></div>`}`;
  }

  // ---------- Configurare test ----------
  function viewSubject(sid) {
    const found = findSubject(sid);
    if (!found) return go('#/');
    const { exam, subject } = found;
    const n = subject.questions.length;
    if (!n) {
      app.innerHTML = `<div class="crumbs"><a href="#/">Acasă</a> › <a href="#/exam/${exam.id}">${esc(exam.name)}</a></div>
        <div class="card empty"><span class="big">🫙</span><p>Materia „${esc(subject.name)}” nu are încă întrebări.</p><a class="btn" href="#/custom">Adaugă întrebări</a></div>`;
      return;
    }
    const hn = hardPool(sid).length;
    const st = subjectStats(sid);
    const hb = hardBest(sid);
    const mist = Object.values(stats.mistakes).filter((m) => m.sid === sid).length;
    let mode = settings.defaultMode === 'hard' && !hn ? 'practice' : settings.defaultMode;
    const countsFor = (total) => [5, 10, 20].filter((c) => c < total).concat([total]);
    app.innerHTML = `
      <div class="crumbs"><a href="#/">Acasă</a> › <a href="#/exam/${exam.id}">${esc(exam.name)}</a> › ${esc(subject.name)}</div>
      <div class="row" style="margin-bottom:20px;gap:14px">
        <span class="subject" style="--c:${esc(subject.color)}"><span class="ico" aria-hidden="true">${esc(subject.icon)}</span></span>
        <div><h1 style="margin:0">${esc(subject.name)}</h1>
        <p class="muted" style="margin:0">${esc(exam.name)} · ${plural(n, 'întrebare', 'întrebări')}${hn ? ` + ${hn} hard` : ''}${st ? ` · ${plural(st.count, 'test dat', 'teste date')}, media ${st.avg}%` : ''}${hb ? ` · record Hard: ${hb}` : ''}</p></div>
      </div>
      <form class="card" id="setup">
        <div class="field"><span class="lbl">Cum vrei să lucrezi?</span>
          <div class="grid modes">
            <label class="mode-card"><input type="radio" name="mode" value="practice" ${mode === 'practice' ? 'checked' : ''}>
              <div class="card"><h3>🌱 Antrenament</h3><p class="muted small" style="margin:0">Vezi imediat dacă ai răspuns corect, cu explicație. Fără cronometru.</p></div></label>
            <label class="mode-card"><input type="radio" name="mode" value="exam" ${mode === 'exam' ? 'checked' : ''}>
              <div class="card"><h3>⏱️ Simulare</h3><p class="muted small" style="margin:0">Răspunzi la tot, poți reveni la întrebări, afli nota la final.</p></div></label>
            ${hn ? `<label class="mode-card hard"><input type="radio" name="mode" value="hard" ${mode === 'hard' ? 'checked' : ''}>
              <div class="card"><h3>🔥 Hard</h3><p class="small" style="margin:0;opacity:.85">Întrebări grele · 3 vieți · ${HARD_SECONDS} s pe întrebare · combo și puncte.</p></div></label>` : ''}
          </div>
        </div>
        <div class="field"><span class="lbl">Număr de întrebări</span><div class="choice" id="counts"></div></div>
        <label class="switch" id="timer-row"><input type="checkbox" name="timer"> <span>Cronometru (1 minut pe întrebare)</span></label>
        <div class="row" style="margin-top:8px">
          <button class="btn" type="submit" id="start-btn">Începe testul →</button>
          ${mist ? `<button class="btn ghost" type="button" id="practice-mistakes">🔁 Doar greșelile (${mist})</button>` : ''}
        </div>
      </form>`;
    const form = $('#setup');
    const sync = () => {
      mode = form.mode.value;
      const total = mode === 'hard' ? hn : n;
      const counts = countsFor(total);
      const prev = form.count ? +form.count.value : settings.defaultCount;
      const def = counts.includes(prev) ? prev : counts[Math.min(1, counts.length - 1)];
      $('#counts').innerHTML = counts.map((c) => `<label><input type="radio" name="count" value="${c}" ${c === def ? 'checked' : ''}><span>${c === total && c > 20 ? 'Toate (' + c + ')' : c}</span></label>`).join('');
      $('#timer-row').hidden = mode !== 'exam';
      form.timer.checked = mode === 'exam';
      $('#start-btn').textContent = mode === 'hard' ? 'Intră în arenă 🔥' : 'Începe testul →';
      $('#start-btn').classList.toggle('hard-btn', mode === 'hard');
    };
    sync();
    form.addEventListener('change', (e) => { if (e.target.name === 'mode') sync(); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const count = +form.count.value;
      settings.defaultMode = mode; settings.defaultCount = count; saveSettings();
      launch({ type: 'subject', sid, mode, count, timer: form.timer.checked });
    });
    const pm = $('#practice-mistakes');
    if (pm) pm.addEventListener('click', () => launch({ type: 'mistakes', sid }));
  }

  // ---------- Test ----------
  function viewQuiz() {
    if (!quiz) { try { quiz = JSON.parse(sessionStorage.getItem('grila.quiz')); } catch (e) {} }
    if (!quiz) return go('#/');
    const hard = quiz.mode === 'hard';
    document.body.classList.toggle('hard-mode', hard);
    if (hard) embers.start(); else embers.stop();

    const it = quiz.items[quiz.cur];
    const ans = quiz.answers[quiz.cur];
    const fb = feedbackMode(quiz);
    const locked = fb && ans !== null;
    const done = quiz.answers.filter((a) => a !== null).length;
    const flagged = quiz.flags.includes(quiz.cur);
    const enter = view.quizId !== quiz.id || view.cur !== quiz.cur;
    view.quizId = quiz.id; view.cur = quiz.cur;
    const ja = view.justAnswered; view.justAnswered = false;
    const lost = view.lostLife; view.lostLife = false;
    const gameOver = hard && quiz.lives <= 0;

    const opts = it.o.map((text, i) => {
      let cls = '';
      if (locked) { if (i === it.a) cls = 'correct' + (ja ? ' pop' : ''); else if (i === ans) cls = 'wrong' + (ja ? ' shake' : ''); else cls = 'dim'; }
      else if (i === ans) cls = 'selected';
      const mark = locked && i === it.a ? '✓' : locked && i === ans ? '✗' : '';
      return `<button class="opt ${cls}" data-i="${i}" ${locked ? 'disabled' : ''} aria-pressed="${i === ans}" style="--i:${i}">
        <span class="letter">${LETTERS[i]}</span><span class="txt">${esc(text)}</span>${mark ? `<span class="mark" aria-hidden="true">${mark}</span>` : ''}</button>`;
    }).join('');
    const last = quiz.cur === quiz.items.length - 1;
    let explain = '';
    if (locked) {
      const ok = ans === it.a;
      const head = ok ? '✅ Corect!' : ans === -1 ? '⏰ Timpul a expirat! Răspunsul corect: ' + LETTERS[it.a] : '❌ Răspunsul corect: ' + LETTERS[it.a];
      explain = `<div class="explain ${ok ? 'ok' : 'ko'} ${ja ? 'reveal' : ''}" role="status"><b>${head}</b>${it.e ? `<br>${esc(it.e)}` : ''}</div>`;
    }
    const dots = quiz.items.map((x, i) => {
      const a = quiz.answers[i];
      let c = a === null ? '' : fb ? (a === x.a ? 'ok' : 'ko') : 'done';
      if (i === quiz.cur) c += ' cur';
      if (quiz.flags.includes(i)) c += ' flag';
      return `<button class="dot ${c}" data-go="${i}" aria-label="Întrebarea ${i + 1}" ${hard ? 'disabled' : ''}>${i + 1}</button>`;
    }).join('');
    const hearts = hard ? Array.from({ length: HARD_LIVES }, (_, i) => `<span class="heart ${i < quiz.lives ? '' : 'gone'} ${lost && i === quiz.lives ? 'break' : ''}" aria-hidden="true">❤️</span>`).join('') : '';
    const elapsed = (Date.now() - quiz.qStart) / 1000;
    const qtimer = hard && !locked ? `<div class="qtimer" id="qtimer" aria-label="Timp rămas">
        <svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" class="trk"/><circle cx="22" cy="22" r="19" class="fill" style="animation-duration:${HARD_SECONDS}s;animation-delay:-${elapsed.toFixed(2)}s"/></svg>
        <b id="qtimer-n">${Math.max(0, Math.ceil(HARD_SECONDS - elapsed))}</b></div>` : '';
    const nextLabel = gameOver ? 'Vezi rezultatul 💀' : last ? 'Vezi rezultatul' : 'Următoarea →';

    app.innerHTML = `
      <div class="quiz-top">
        <div class="title"><span aria-hidden="true">${esc(quiz.icon)}</span> ${esc(quiz.title)}</div>
        <span class="spacer"></span>
        ${hard ? `<div class="hearts" aria-label="${quiz.lives} vieți rămase">${hearts}</div><div class="score-box">⭐ <b id="pts">${quiz.points}</b></div>` : ''}
        ${quiz.combo >= 2 && fb ? `<span class="combo-chip">🔥 x${quiz.combo}</span>` : ''}
        ${quiz.limit ? `<span class="timer" id="timer">⏱ –</span>` : ''}
        <button class="btn ghost sm" id="quit">Ieși</button>
      </div>
      <div class="progress" aria-hidden="true"><i style="width:${pct(done, quiz.items.length)}%"></i></div>
      <section class="question ${enter ? 'enter ' + (view.dir > 0 ? 'from-r' : 'from-l') : ''}">
        <div class="qcard">
          <div class="num">Întrebarea ${quiz.cur + 1} din ${quiz.items.length}
            <span class="spacer"></span>
            ${qtimer}
            ${quiz.mode === 'exam' ? `<button class="btn ghost sm flag-btn ${flagged ? 'on' : ''}" id="flag" aria-pressed="${flagged}">⚑ ${flagged ? 'Marcată' : 'Revin mai târziu'}</button>` : ''}
          </div>
          <div class="stem">${esc(it.q)}</div>
          <div class="options">${opts}</div>
          ${explain}
        </div>
        <div class="quiz-nav">
          ${hard ? '' : `<button class="btn ghost" id="prev" ${quiz.cur === 0 ? 'disabled' : ''}>← Înapoi</button>`}
          <span class="spacer"></span>
          ${fb
            ? `<button class="btn ${gameOver ? 'hard-btn' : ''}" id="next" ${locked ? '' : 'disabled'}>${nextLabel}</button>`
            : `${last ? '' : `<button class="btn ghost" id="next">Următoarea →</button>`}<button class="btn" id="finish">Finalizează (${done}/${quiz.items.length})</button>`}
        </div>
        <div class="dots">${dots}</div>
        <p class="kbd-hint">Scurtături: <kbd>1</kbd>–<kbd>4</kbd> sau <kbd>A</kbd>–<kbd>D</kbd> pentru răspuns · <kbd>Enter</kbd> mai departe${hard ? '' : ' · <kbd>←</kbd> <kbd>→</kbd> navigare'}</p>
      </section>`;

    $$('.opt', app).forEach((b) => b.addEventListener('click', () => choose(+b.dataset.i)));
    $$('.dot', app).forEach((b) => b.addEventListener('click', () => { if (fb && quiz.answers[quiz.cur] === null && +b.dataset.go > quiz.cur) return; moveTo(+b.dataset.go); }));
    const prev = $('#prev'); if (prev) prev.addEventListener('click', () => moveTo(quiz.cur - 1));
    const next = $('#next'); if (next) next.addEventListener('click', advance);
    const fin = $('#finish'); if (fin) fin.addEventListener('click', () => finish(false));
    const flag = $('#flag'); if (flag) flag.addEventListener('click', toggleFlag);
    $('#quit').addEventListener('click', () => {
      if (confirm('Sigur vrei să ieși? Progresul acestui test se pierde.')) { quiz = null; sessionStorage.removeItem('grila.quiz'); go('#/'); }
    });
    if (enter) window.scrollTo({ top: 0, behavior: animOn() ? 'smooth' : 'auto' });
    clearInterval(timerId);
    if (quiz.limit) startTimer();
    else if (hard && !locked) startQuestionTimer();
  }

  function startTimer() {
    const el = $('#timer');
    const tick = () => {
      if (!quiz) return clearInterval(timerId);
      const left = quiz.limit - (Date.now() - quiz.start) / 1000;
      if (!el.isConnected) return clearInterval(timerId);
      el.textContent = '⏱ ' + fmtTime(left);
      el.classList.toggle('low', left < 60);
      if (left <= 0) { clearInterval(timerId); toast('Timpul a expirat!'); finish(true); }
    };
    tick(); timerId = setInterval(tick, 1000);
  }

  function startQuestionTimer() {
    const box = $('#qtimer'), num = $('#qtimer-n');
    let lastSec = -1;
    const tick = () => {
      if (!quiz || !box.isConnected) return clearInterval(timerId);
      const left = HARD_SECONDS - (Date.now() - quiz.qStart) / 1000;
      const sec = Math.max(0, Math.ceil(left));
      if (sec !== lastSec) {
        num.textContent = sec;
        if (sec <= 10 && sec > 0) { box.classList.add('low'); if (lastSec !== -1) sfx.play('tick'); }
        lastSec = sec;
      }
      if (left <= 0) { clearInterval(timerId); answer(-1); }
    };
    tick(); timerId = setInterval(tick, 200);
  }

  function choose(i) {
    if (!quiz) return;
    const it = quiz.items[quiz.cur];
    if (i >= it.o.length) return;
    if (feedbackMode(quiz) && quiz.answers[quiz.cur] !== null) return;
    if (!feedbackMode(quiz)) { quiz.answers[quiz.cur] = i; sfx.play('click'); saveQuiz(); viewQuiz(); return; }
    answer(i);
  }

  // Înregistrează un răspuns în modurile cu corectare imediată (antrenament / hard). i = -1 înseamnă timp expirat.
  function answer(i) {
    const it = quiz.items[quiz.cur];
    const optEl = i >= 0 ? $(`.opt[data-i="${i}"]`, app) : null;
    const from = optEl ? fx.center(optEl) : { x: innerWidth / 2, y: innerHeight / 2 };
    quiz.answers[quiz.cur] = i;
    clearInterval(timerId);
    const ok = i === it.a;
    let gained = 0;
    if (ok) {
      quiz.combo++; quiz.maxCombo = Math.max(quiz.maxCombo, quiz.combo);
      if (quiz.mode === 'hard') {
        const left = Math.max(0, HARD_SECONDS - (Date.now() - quiz.qStart) / 1000);
        gained = 100 + Math.min(quiz.combo - 1, 4) * 25 + Math.round(left);
        quiz.points += gained;
      }
    } else {
      quiz.combo = 0;
      if (quiz.mode === 'hard') { quiz.lives = Math.max(0, quiz.lives - 1); view.lostLife = true; }
    }
    view.justAnswered = true;
    saveQuiz();
    viewQuiz();
    if (ok) {
      sfx.play(quiz.combo >= 3 ? 'combo' : 'ok');
      const c = $(`.opt[data-i="${it.a}"]`, app);
      const p = c ? fx.center(c) : from;
      fx.burst(p.x, p.y, ['#2f9461', '#5cc28d', '#ffd166', getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()]);
      fx.float(quiz.mode === 'hard' ? '+' + gained : '+1', p.x, p.y - 20, 'good');
      fx.combo(quiz.combo);
    } else {
      sfx.play(quiz.mode === 'hard' && quiz.lives === 0 ? 'lose' : 'bad');
      fx.shake($('.qcard', app));
      if (navigator.vibrate && animOn()) navigator.vibrate(quiz.mode === 'hard' ? [60, 40, 60] : 50);
      if (quiz.mode === 'hard') {
        document.body.classList.remove('hit'); void document.body.offsetWidth; document.body.classList.add('hit');
        fx.float(i === -1 ? '⏰' : '💔', from.x, from.y - 20, 'bad');
        if (quiz.lives === 0) toast('Game over! Ai rămas fără vieți 💀');
      }
    }
    const n = $('#next'); if (n) n.focus({ preventScroll: true });
  }

  function moveTo(i) {
    if (i < 0 || i >= quiz.items.length) return;
    view.dir = i >= quiz.cur ? 1 : -1;
    quiz.cur = i;
    if (quiz.mode === 'hard' && quiz.answers[i] === null) quiz.qStart = Date.now();
    saveQuiz(); viewQuiz();
  }
  function advance() {
    if (feedbackMode(quiz) && quiz.answers[quiz.cur] === null) return;
    if (quiz.mode === 'hard' && quiz.lives <= 0) return finish(true);
    if (quiz.cur < quiz.items.length - 1) moveTo(quiz.cur + 1); else finish(false);
  }
  function toggleFlag() {
    const i = quiz.flags.indexOf(quiz.cur);
    if (i >= 0) quiz.flags.splice(i, 1); else quiz.flags.push(quiz.cur);
    saveQuiz(); viewQuiz();
  }

  function finish(forced) {
    if (!quiz) return;
    const unanswered = quiz.answers.filter((a) => a === null).length;
    if (!forced && quiz.mode === 'exam' && unanswered && !confirm(`Mai ai ${plural(unanswered, 'întrebare', 'întrebări')} fără răspuns. Finalizezi testul?`)) return;
    clearInterval(timerId);
    const correct = quiz.items.filter((it, i) => quiz.answers[i] === it.a).length;
    const total = quiz.items.length;
    const seconds = Math.round((Date.now() - quiz.start) / 1000);
    const hard = quiz.mode === 'hard';
    const prevBest = hard ? hardBest(quiz.sid) : 0;
    // Lista de greșeli: greșit → adăugat, corect → scos. Întrebările nevăzute (game over) nu contează.
    quiz.items.forEach((it, i) => {
      const a = quiz.answers[i];
      if (a === it.a) delete stats.mistakes[it.key];
      else if (a !== null || !hard) {
        const prev = stats.mistakes[it.key];
        stats.mistakes[it.key] = { sid: it.sid, q: { q: it.q, o: it.o.slice(), a: it.a, e: it.e }, count: (prev ? prev.count : 0) + 1, date: Date.now() };
      }
    });
    const attempt = { sid: quiz.sid, title: quiz.title, icon: quiz.icon, mode: quiz.mode, correct, total, seconds, date: Date.now() };
    if (hard) Object.assign(attempt, { hard: true, points: quiz.points, maxCombo: quiz.maxCombo, lives: quiz.lives });
    stats.attempts.push(attempt);
    if (stats.attempts.length > 500) stats.attempts = stats.attempts.slice(-500);
    saveStats();
    lastResult = Object.assign({}, quiz, { correct, total, seconds, record: hard && quiz.points > prevBest && quiz.points > 0, celebrated: false });
    try { sessionStorage.setItem('grila.result', JSON.stringify(lastResult)); } catch (e) {}
    quiz = null; sessionStorage.removeItem('grila.quiz');
    go('#/results');
  }

  // ---------- Rezultate ----------
  function viewResults() {
    if (!lastResult) { try { lastResult = JSON.parse(sessionStorage.getItem('grila.result')); } catch (e) {} }
    const r = lastResult;
    if (!r) return go('#/');
    const hard = r.mode === 'hard';
    const p = pct(r.correct, r.total);
    const nota = grade(r.correct, r.total);
    const wrong = r.items.filter((it, i) => r.answers[i] !== null && r.answers[i] !== it.a).length;
    const skipped = r.answers.filter((a) => a === null).length;
    let msg;
    if (hard) msg = r.lives <= 0 ? '💀 Game over! Dar fiecare rundă te face mai puternic.' : r.lives === HARD_LIVES ? '👑 Fără nicio greșeală în modul Hard. Legendar!' : '🔥 Ai supraviețuit modului Hard!';
    else msg = p === 100 ? 'Perfect! Ești pregătit(ă)! 🏆' : p >= 80 ? 'Foarte bine! Mai e puțin până la perfect. 🌟' : p >= 50 ? 'Bun început! Recapitulează greșelile și încearcă din nou. 💪' : 'Nu-i nimic – fiecare greșeală te învață ceva. Hai încă o dată! 🌱';
    const ringColor = p >= 80 ? 'var(--good)' : p >= 50 ? 'var(--warn)' : 'var(--bad)';
    const review = r.items.map((it, i) => {
      const a = r.answers[i];
      const cls = a === null ? 'skip' : a === it.a ? 'ok' : 'ko';
      const label = cls === 'ok' ? '✅ corect' : a === -1 ? '⏰ timp expirat' : cls === 'ko' ? '❌ greșit' : '⏭ fără răspuns';
      return `<div class="card review-item ${cls}" data-kind="${cls}">
        <div class="small muted">Întrebarea ${i + 1} · ${label}</div>
        <p style="font-weight:700;margin:4px 0 8px;white-space:pre-line">${esc(it.q)}</p>
        ${a !== null && a >= 0 && a !== it.a ? `<div class="ans bad">${LETTERS[a]}. ${esc(it.o[a])}</div>` : ''}
        <div class="ans good">${LETTERS[it.a]}. ${esc(it.o[it.a])}</div>
        ${it.e ? `<p class="small muted" style="margin:8px 0 0">💡 ${esc(it.e)}</p>` : ''}
      </div>`;
    }).join('');
    const backHref = r.desc && r.desc.type === 'subject' ? '#/subject/' + esc(r.desc.sid) : '#/';
    app.innerHTML = `
      <section class="card result-hero ${hard ? 'hard-result' : ''}">
        ${r.record ? '<div class="record">🏆 Record nou!</div>' : ''}
        <div class="ring" style="--ring:${ringColor}" data-p="${p}"><div><div><strong data-count="${p}" data-suf="%">0%</strong><small>${r.correct} din ${r.total}</small></div></div></div>
        <h2>${msg}</h2>
        <div class="stats-row">
          ${hard ? `<div><b data-count="${r.points}">0</b><span>puncte</span></div><div><b>🔥 ${r.maxCombo}</b><span>combo maxim</span></div><div><b>${'❤️'.repeat(r.lives) || '💔'}</b><span>vieți rămase</span></div>`
            : `<div><b data-count="${nota.toFixed(2)}" data-dec="2">0</b><span>nota estimată*</span></div>`}
          <div><b style="color:var(--good)" data-count="${r.correct}">0</b><span>corecte</span></div>
          <div><b style="color:var(--bad)" data-count="${wrong}">0</b><span>greșite</span></div>
          ${skipped ? `<div><b style="color:var(--warn)">${skipped}</b><span>${hard ? 'nevăzute' : 'fără răspuns'}</span></div>` : ''}
          <div><b>${fmtTime(r.seconds)}</b><span>timp</span></div>
        </div>
        <div class="row" style="justify-content:center">
          <button class="btn ${hard ? 'hard-btn' : ''}" id="again">↻ ${hard ? 'Încă o rundă' : 'Încă un test'}</button>
          ${wrong ? `<button class="btn soft" id="redo">🔁 Refă greșelile</button>` : ''}
          <a class="btn ghost" href="${backHref}">Înapoi</a>
        </div>
        ${hard ? '<p class="small muted" style="margin:16px 0 0">Punctaj: 100 pe răspuns corect + bonus de combo (până la +100) + secundele rămase.</p>' : '<p class="small muted" style="margin:16px 0 0">* Nota: 1 punct din oficiu + 9 puncte proporțional cu răspunsurile corecte.</p>'}
      </section>
      <div class="row" style="margin:26px 0 12px">
        <h2 style="margin:0">Corectare</h2><span class="spacer"></span>
        <div class="choice" id="filter">
          <label><input type="radio" name="f" value="all" checked><span>Toate</span></label>
          <label><input type="radio" name="f" value="bad"><span>Doar greșite</span></label>
        </div>
      </div>
      <div class="stack" id="review">${review}</div>`;
    const ring = $('.ring', app);
    requestAnimationFrame(() => requestAnimationFrame(() => ring.style.setProperty('--p', p)));
    if (!r.celebrated) {
      r.celebrated = true;
      if (p >= 90 || r.record) { setTimeout(() => fx.confetti(), 350); sfx.play('win'); }
      else if (hard && r.lives <= 0) sfx.play('lose');
    }
    $('#again').addEventListener('click', () => launch(r.desc && r.desc.type !== 'redo' ? r.desc : { type: 'mix', examId: 'bac' }));
    const redo = $('#redo');
    if (redo) redo.addEventListener('click', () => {
      const pool = r.items.filter((it, i) => r.answers[i] !== null && r.answers[i] !== it.a).map((it) => ({ sid: it.sid, q: { q: it.q, o: it.o, a: it.a, e: it.e } }));
      launch({ type: 'redo', sid: r.sid, title: r.title + ' · greșeli', pool });
    });
    $('#filter').addEventListener('change', (e) => {
      $$('#review .review-item').forEach((el) => { el.hidden = e.target.value === 'bad' && el.dataset.kind === 'ok'; });
    });
  }

  // ---------- Greșeli ----------
  function viewMistakes() {
    const list = Object.entries(stats.mistakes);
    if (!list.length) {
      app.innerHTML = `<h1>🔁 Greșelile mele</h1><div class="card empty"><span class="big float-y">🌈</span>
        <p>Nicio greșeală de recapitulat. Întrebările greșite apar aici automat și dispar când le rezolvi corect.</p>
        <a class="btn" href="#/">Fă un test</a></div>`;
      return;
    }
    const groups = {};
    list.forEach(([k, m]) => { (groups[m.sid] = groups[m.sid] || []).push([k, m]); });
    const html = Object.entries(groups).map(([sid, items]) => {
      const f = findSubject(sid);
      const name = f ? f.subject.name : 'Altele';
      const icon = f ? f.subject.icon : '📌';
      return `<section class="card">
        <div class="row"><h3 style="margin:0">${esc(icon)} ${esc(name)} <span class="muted small">(${items.length})</span></h3><span class="spacer"></span>
          <button class="btn soft sm" data-practice="${esc(sid)}">Exersează</button></div>
        ${items.map(([k, m]) => `<div class="q-edit"><p style="margin:0 0 4px;font-weight:700">${esc(m.q.q)}</p>
          <div class="small"><span style="color:var(--good);font-weight:700">✓ ${esc(m.q.o[m.q.a])}</span>
          <span class="muted"> · greșită de ${m.count} ${m.count === 1 ? 'dată' : 'ori'}</span>
          <button class="btn ghost sm" style="margin-left:8px" data-del="${esc(k)}">Am învățat-o</button></div></div>`).join('')}
      </section>`;
    }).join('');
    app.innerHTML = `
      <div class="row" style="margin-bottom:18px"><div style="flex:1;min-width:220px"><h1 style="margin:0">🔁 Greșelile mele</h1>
        <p class="muted" style="margin:0">${plural(list.length, 'întrebare', 'întrebări')} de recapitulat. Când răspunzi corect, întrebarea dispare din listă.</p></div>
        <button class="btn" id="all">Exersează toate</button></div>
      <div class="stack">${html}</div>`;
    $('#all').addEventListener('click', () => launch({ type: 'mistakes' }));
    $$('[data-practice]', app).forEach((b) => b.addEventListener('click', () => launch({ type: 'mistakes', sid: b.dataset.practice })));
    $$('[data-del]', app).forEach((b) => b.addEventListener('click', () => {
      const card = b.closest('.q-edit');
      const done = () => { delete stats.mistakes[b.dataset.del]; saveStats(); renderNow(); };
      if (animOn()) { card.classList.add('leave'); setTimeout(done, 320); } else done();
    }));
  }

  // ---------- Progres ----------
  function viewStats() {
    const at = stats.attempts;
    if (!at.length) {
      app.innerHTML = `<h1>📊 Progresul meu</h1><div class="card empty"><span class="big float-y">🌱</span><p>Încă nu ai dat niciun test. Statisticile apar aici după primul test.</p><a class="btn" href="#/">Începe acum</a></div>`;
      return;
    }
    const answered = at.reduce((s, a) => s + a.total, 0);
    const correct = at.reduce((s, a) => s + a.correct, 0);
    const time = at.reduce((s, a) => s + (a.seconds || 0), 0);
    const best = hardBest();
    const bySubject = {};
    at.forEach((a) => { const b = (bySubject[a.sid] = bySubject[a.sid] || { c: 0, t: 0, n: 0, title: a.title, icon: a.icon }); b.c += a.correct; b.t += a.total; b.n++; });
    const bars = Object.entries(bySubject).sort((x, y) => pct(y[1].c, y[1].t) - pct(x[1].c, x[1].t)).map(([sid, b]) => {
      const f = findSubject(sid); const p = pct(b.c, b.t);
      return `<div class="hbar"><span>${esc(f ? f.subject.icon : b.icon)} ${esc(f ? f.subject.name : b.title)}</span>
        <div class="bar" style="--c:${esc(f ? f.subject.color : 'var(--accent)')}"><i class="grow" style="width:${p}%"></i></div><span class="v">${p}%</span></div>`;
    }).join('');
    const hist = at.slice(-15).reverse().map((a) => {
      const p = pct(a.correct, a.total);
      return `<li><span aria-hidden="true">${esc(a.icon || '📝')}</span><span style="flex:1;min-width:0">${esc(a.title)}<br><span class="small muted">${fmtDate(a.date)} · ${a.hard ? '🔥 hard · ' + a.points + ' pct' : a.mode === 'exam' ? 'simulare' : 'antrenament'} · ${fmtTime(a.seconds || 0)}</span></span>
        <span class="score-chip ${chipClass(p)}">${a.correct}/${a.total}</span></li>`;
    }).join('');
    app.innerHTML = `
      <h1>📊 Progresul meu</h1>
      <div class="kpis">
        <div class="card kpi"><b data-count="${at.length}">0</b><span>teste date</span></div>
        <div class="card kpi"><b data-count="${answered}">0</b><span>întrebări rezolvate</span></div>
        <div class="card kpi"><b data-count="${pct(correct, answered)}" data-suf="%">0</b><span>răspunsuri corecte</span></div>
        <div class="card kpi"><b data-count="${Math.round(time / 60)}" data-suf=" min">0</b><span>timp de studiu</span></div>
        <div class="card kpi"><b>🔥 ${streak()}</b><span>zile la rând</span></div>
        ${best ? `<div class="card kpi"><b data-count="${best}">0</b><span>🏆 record Hard</span></div>` : ''}
      </div>
      <div class="grid two">
        <section class="card"><h2>Pe materii</h2>${bars}</section>
        <section class="card"><h2>Ultimele teste</h2><ul class="history">${hist}</ul></section>
      </div>`;
  }

  // ---------- Personalizare ----------
  function viewSettings() {
    app.innerHTML = `
      <h1>🎨 Personalizare</h1>
      <p class="muted">Fă site-ul al tău. Modificările se aplică imediat și se salvează automat.</p>
      <div class="grid two">
        <section class="card">
          <h2>Despre tine</h2>
          <label class="field"><span class="lbl">Cum să te salut?</span>
            <input class="input" id="s-name" maxlength="30" placeholder="Numele sau porecla ta" value="${esc(settings.name)}"></label>
          <div class="field"><span class="lbl">Avatar</span>
            <div class="emoji-pick" id="s-avatar">${AVATARS.map((a) => `<button type="button" class="${a === settings.avatar ? 'on' : ''}" data-v="${a}" aria-label="Avatar ${a}">${a}</button>`).join('')}</div></div>
        </section>
        <section class="card">
          <h2>Temă</h2>
          <div class="themes" id="s-theme">${THEMES.map((t) => `<label class="theme-opt"><input type="radio" name="theme" value="${t.id}" ${settings.theme === t.id ? 'checked' : ''}>
            <span class="sw"><i style="background:${t.bg};box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)"></i>${t.name}</span></label>`).join('')}</div>
        </section>
        <section class="card">
          <h2>Culoare de accent</h2>
          <div class="swatches" id="s-accent">${ACCENTS.map((c) => `<button type="button" class="swatch ${c === settings.accent ? 'on' : ''}" style="background:${c}" data-v="${c}" aria-label="Culoarea ${c}"></button>`).join('')}
            <label title="Alege orice culoare" class="row" style="gap:6px"><input type="color" class="color-input" id="s-color" value="${esc(settings.accent)}"><span class="small muted">altă culoare</span></label></div>
          <div class="row" style="margin-top:18px"><button class="btn" type="button">Buton exemplu</button><button class="btn soft" type="button">Secundar</button></div>
        </section>
        <section class="card">
          <h2>Text și aspect</h2>
          <label class="field"><span class="lbl">Font</span>
            <select class="input" id="s-font">${Object.entries(FONTS).map(([k, f]) => `<option value="${k}" ${settings.font === k ? 'selected' : ''}>${f.name}</option>`).join('')}</select></label>
          <label class="field"><span class="lbl">Mărimea textului: <span id="fs-v">${settings.fontSize}px</span></span>
            <input type="range" id="s-fs" min="14" max="22" step="1" value="${settings.fontSize}"></label>
          <label class="field"><span class="lbl">Colțuri rotunjite: <span id="r-v">${settings.radius}px</span></span>
            <input type="range" id="s-radius" min="4" max="28" step="1" value="${settings.radius}"></label>
          <div class="field"><span class="lbl">Spațiere</span>
            <div class="choice" id="s-density">
              <label><input type="radio" name="density" value="comfy" ${settings.density === 'comfy' ? 'checked' : ''}><span>Aerisită</span></label>
              <label><input type="radio" name="density" value="compact" ${settings.density === 'compact' ? 'checked' : ''}><span>Compactă</span></label>
            </div></div>
        </section>
        <section class="card">
          <h2>Efecte</h2>
          <label class="switch"><input type="checkbox" id="s-anim" ${settings.animations ? 'checked' : ''}><span>Animații (tranziții, particule, combo)</span></label>
          <label class="switch"><input type="checkbox" id="s-confetti" ${settings.confetti ? 'checked' : ''}><span>Confetti la rezultate de peste 90% și la recorduri</span></label>
          <label class="switch"><input type="checkbox" id="s-sounds" ${settings.sounds ? 'checked' : ''}><span>Sunete la răspunsuri</span></label>
          <label class="switch"><input type="checkbox" id="s-shuffle" ${settings.shuffle ? 'checked' : ''}><span>Amestecă ordinea variantelor de răspuns</span></label>
          <button class="btn soft sm" type="button" id="try-fx">✨ Încearcă efectele</button>
        </section>
        <section class="card">
          <h2>Datele mele</h2>
          <p class="muted small">Totul se salvează doar în acest browser. Fă o copie de siguranță ca să-ți muți progresul pe alt dispozitiv.</p>
          <div class="row">
            <button class="btn ghost" id="backup">⬇ Salvează copie</button>
            <label class="btn ghost" style="cursor:pointer">⬆ Restaurează<input type="file" id="restore" accept="application/json,.json" hidden></label>
          </div>
          <div class="row" style="margin-top:12px">
            <button class="btn danger sm" id="reset-look">Aspect implicit</button>
            <button class="btn danger sm" id="reset-stats">Șterge progresul</button>
          </div>
        </section>
      </div>`;

    const upd = (patch) => { Object.assign(settings, patch); saveSettings(); applySettings(); };
    $('#s-name').addEventListener('input', (e) => upd({ name: e.target.value.trim() }));
    $('#s-avatar').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      upd({ avatar: b.dataset.v }); $$('#s-avatar button').forEach((x) => x.classList.toggle('on', x === b));
      b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing');
    });
    $('#s-theme').addEventListener('click', (e) => {
      const lbl = e.target.closest('.theme-opt'); if (!lbl) return;
      e.preventDefault();
      const input = $('input', lbl);
      if (settings.theme === input.value) return;
      reveal(e, () => { input.checked = true; upd({ theme: input.value }); });
    });
    const setAccent = (c) => { upd({ accent: c }); $$('#s-accent .swatch').forEach((x) => x.classList.toggle('on', x.dataset.v === c)); $('#s-color').value = c; };
    $('#s-accent').addEventListener('click', (e) => { const b = e.target.closest('.swatch'); if (b) reveal(e, () => setAccent(b.dataset.v)); });
    $('#s-color').addEventListener('input', (e) => setAccent(e.target.value));
    $('#s-font').addEventListener('change', (e) => upd({ font: e.target.value }));
    $('#s-fs').addEventListener('input', (e) => { upd({ fontSize: +e.target.value }); $('#fs-v').textContent = e.target.value + 'px'; });
    $('#s-radius').addEventListener('input', (e) => { upd({ radius: +e.target.value }); $('#r-v').textContent = e.target.value + 'px'; });
    $('#s-density').addEventListener('change', (e) => upd({ density: e.target.value }));
    $('#s-shuffle').addEventListener('change', (e) => upd({ shuffle: e.target.checked }));
    $('#s-anim').addEventListener('change', (e) => upd({ animations: e.target.checked }));
    $('#s-confetti').addEventListener('change', (e) => upd({ confetti: e.target.checked }));
    $('#s-sounds').addEventListener('change', (e) => { upd({ sounds: e.target.checked }); sfx.play('ok'); });
    $('#try-fx').addEventListener('click', (e) => {
      const p = fx.center(e.target);
      fx.burst(p.x, p.y, [settings.accent, '#ffd166', '#06d6a0']); fx.float('+125', p.x, p.y - 20, 'good'); fx.combo(3);
      sfx.play('win'); setTimeout(() => fx.confetti(), 250);
    });
    $('#backup').addEventListener('click', () => download('grila-mea-backup.json', { app: 'grila-mea', version: 1, settings, stats, custom }));
    $('#restore').addEventListener('change', (e) => readJson(e.target.files[0], (data) => {
      if (!data || data.app !== 'grila-mea') return toast('Fișierul nu este o copie Grila Mea.');
      if (data.settings) settings = Object.assign({}, DEFAULTS, data.settings);
      if (data.stats) stats = Object.assign({ attempts: [], mistakes: {} }, data.stats);
      if (data.custom) custom = Object.assign({ subjects: [] }, data.custom);
      saveSettings(); saveStats(); saveCustom(); applySettings(); renderNow(); toast('Datele au fost restaurate ✔');
    }));
    $('#reset-look').addEventListener('click', (e) => {
      const keep = { name: settings.name, avatar: settings.avatar };
      reveal(e, () => { settings = Object.assign({}, DEFAULTS, keep); saveSettings(); applySettings(); renderNow(); });
      toast('Aspectul a revenit la implicit');
    });
    $('#reset-stats').addEventListener('click', () => {
      if (!confirm('Ștergi toate testele date și lista de greșeli? Grilele create de tine rămân.')) return;
      stats = { attempts: [], mistakes: {} }; saveStats(); toast('Progresul a fost șters');
    });
  }

  function download(name, obj) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function readJson(file, cb) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => { let d; try { d = JSON.parse(r.result); } catch (e) { return toast('Fișier JSON invalid.'); } cb(d); };
    r.readAsText(file);
  }

  // ---------- Grilele mele ----------
  function validQuestion(q) {
    return q && typeof q.q === 'string' && q.q.trim() && Array.isArray(q.o) && q.o.length >= 2 && q.o.length <= 6 &&
      q.o.every((x) => typeof x === 'string' && x.trim()) && Number.isInteger(q.a) && q.a >= 0 && q.a < q.o.length;
  }

  function viewCustom() {
    const subs = custom.subjects;
    app.innerHTML = `
      <div class="row" style="margin-bottom:18px"><div style="flex:1;min-width:220px"><h1 style="margin:0">✏️ Grilele mele</h1>
        <p class="muted" style="margin:0">Creează-ți propriile materii și întrebări, de exemplu din lecțiile de la clasă.</p></div>
        <a class="btn ghost" href="#/exam/custom">Rezolvă-le →</a></div>
      <div class="grid two">
        <form class="card" id="new-sub">
          <h2>Materie nouă</h2>
          <label class="field"><span class="lbl">Nume</span><input class="input" name="name" required maxlength="60" placeholder="ex.: Comentarii literare"></label>
          <div class="row">
            <label class="field" style="flex:1"><span class="lbl">Emoji</span><input class="input" name="icon" maxlength="4" value="📘"></label>
            <label class="field"><span class="lbl">Culoare</span><input type="color" class="color-input" name="color" value="${esc(settings.accent)}"></label>
          </div>
          <button class="btn" type="submit">+ Creează materia</button>
        </form>
        <section class="card">
          <h2>Import / export</h2>
          <p class="small muted">Poți face schimb de grile cu colegii printr-un fișier JSON.</p>
          <div class="row">
            <button class="btn ghost" id="exp" ${subs.length ? '' : 'disabled'}>⬇ Exportă grilele</button>
            <label class="btn ghost" style="cursor:pointer">⬆ Importă<input type="file" id="imp" accept="application/json,.json" hidden></label>
          </div>
          <details style="margin-top:14px"><summary class="small">Formatul fișierului</summary>
            <pre class="small" style="white-space:pre-wrap;background:var(--surface-2);padding:10px;border-radius:10px;overflow:auto">{ "subjects": [ { "name": "Materia", "icon": "📘",
  "questions": [ { "q": "Enunț?", "o": ["A", "B", "C", "D"],
    "a": 0, "e": "Explicație" } ] } ] }</pre>
            <p class="small muted">„a” este indexul variantei corecte (0 = prima).</p></details>
        </section>
      </div>
      <div class="stack" style="margin-top:20px" id="subs">${subs.map(subjectEditor).join('') || ''}</div>`;

    $('#new-sub').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      custom.subjects.push({ id: 'c-' + Date.now().toString(36), name: f.elements['name'].value.trim(), icon: f.elements['icon'].value.trim() || '📘', color: f.elements['color'].value, questions: [] });
      saveCustom(); renderNow(); toast('Materia a fost creată');
    });
    const exp = $('#exp'); if (exp) exp.addEventListener('click', () => download('grilele-mele.json', { subjects: custom.subjects.map(({ name, icon, color, questions }) => ({ name, icon, color, questions })) }));
    $('#imp').addEventListener('change', (e) => readJson(e.target.files[0], (d) => {
      const list = Array.isArray(d) ? d : d && d.subjects;
      if (!Array.isArray(list)) return toast('Format necunoscut.');
      let qn = 0;
      list.forEach((s, i) => {
        const qs = (s.questions || []).filter(validQuestion).map((q) => ({ q: q.q, o: q.o, a: q.a, e: q.e || '' }));
        qn += qs.length;
        custom.subjects.push({ id: 'c-' + Date.now().toString(36) + i, name: String(s.name || 'Import').slice(0, 60), icon: String(s.icon || '📘').slice(0, 4), color: /^#[\da-f]{6}$/i.test(s.color) ? s.color : settings.accent, questions: qs });
      });
      saveCustom(); renderNow(); toast(`Importat: ${plural(list.length, 'materie', 'materii')}, ${plural(qn, 'întrebare', 'întrebări')}`);
    }));

    $$('.sub-editor', app).forEach((box) => {
      const s = custom.subjects.find((x) => x.id === box.dataset.id);
      $('[data-act="del-sub"]', box).addEventListener('click', () => {
        if (!confirm(`Ștergi materia „${s.name}” cu toate întrebările ei?`)) return;
        custom.subjects = custom.subjects.filter((x) => x !== s); saveCustom(); renderNow();
      });
      $$('[data-delq]', box).forEach((b) => b.addEventListener('click', () => { s.questions.splice(+b.dataset.delq, 1); saveCustom(); renderNow(); }));
      $('form', box).addEventListener('submit', (e) => {
        e.preventDefault();
        const f = e.target;
        const o = $$('input[name="opt"]', f).map((x) => x.value.trim());
        const a = +((f.querySelector('input[name="correct"]:checked') || {}).value ?? -1);
        const filled = o.map((x, i) => ({ x, i })).filter((v) => v.x);
        if (filled.length < 2) return toast('Scrie cel puțin două variante.');
        if (!o[a]) return toast('Bifează varianta corectă.');
        const q = { q: f.q.value.trim(), o: filled.map((v) => v.x), a: filled.findIndex((v) => v.i === a), e: f.e.value.trim() };
        if (!validQuestion(q)) return toast('Completează enunțul.');
        s.questions.push(q); saveCustom(); renderNow(); toast('Întrebarea a fost adăugată ✔');
        const nb = $(`.sub-editor[data-id="${s.id}"] details`); if (nb) { nb.open = true; nb.querySelector('textarea').focus(); }
      });
    });
  }

  function subjectEditor(s) {
    return `<section class="card sub-editor" data-id="${esc(s.id)}" style="--c:${esc(s.color)}">
      <div class="row"><span class="subject"><span class="ico" aria-hidden="true">${esc(s.icon)}</span></span>
        <div style="flex:1"><h2 style="margin:0">${esc(s.name)}</h2><span class="small muted">${plural(s.questions.length, 'întrebare', 'întrebări')}</span></div>
        ${s.questions.length ? `<a class="btn soft sm" href="#/subject/${esc(s.id)}">Rezolvă</a>` : ''}
        <button class="btn danger sm" data-act="del-sub">Șterge</button></div>
      ${s.questions.map((q, i) => `<div class="q-edit row" style="align-items:flex-start"><div style="flex:1;min-width:0">
        <b>${i + 1}. ${esc(q.q)}</b><div class="small" style="color:var(--good)">✓ ${esc(q.o[q.a])}</div></div>
        <button class="btn ghost sm" data-delq="${i}" aria-label="Șterge întrebarea ${i + 1}">✕</button></div>`).join('')}
      <details class="q-edit" ${s.questions.length ? '' : 'open'}><summary>+ Adaugă o întrebare</summary>
        <form style="margin-top:12px">
          <label class="field"><span class="lbl">Enunț</span><textarea class="input" name="q" required maxlength="600"></textarea></label>
          <span class="lbl" style="font-weight:700;display:block;margin-bottom:8px">Variante (bifează răspunsul corect)</span>
          ${[0, 1, 2, 3].map((i) => `<div class="opt-edit"><input type="radio" name="correct" value="${i}" ${i === 0 ? 'checked' : ''} aria-label="Varianta ${LETTERS[i]} este corectă">
            <input class="input" name="opt" maxlength="200" placeholder="Varianta ${LETTERS[i]}${i > 1 ? ' (opțional)' : ''}"></div>`).join('')}
          <label class="field" style="margin-top:12px"><span class="lbl">Explicație (opțional)</span><input class="input" name="e" maxlength="400"></label>
          <button class="btn" type="submit">Salvează întrebarea</button>
        </form></details>
    </section>`;
  }

  // ---------- Tastatură ----------
  document.addEventListener('keydown', (e) => {
    if (!quiz || !location.hash.startsWith('#/quiz')) return;
    if (e.target.closest('input, textarea, select') || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    const idx = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
    if (idx >= 0) { e.preventDefault(); choose(idx); }
    else if (k === 'enter' && !e.target.closest('button')) { e.preventDefault(); advance(); }
    else if (quiz.mode === 'hard') return;
    else if (k === 'arrowright') { if (quiz.mode === 'exam' || quiz.answers[quiz.cur] !== null) moveTo(quiz.cur + 1); }
    else if (k === 'arrowleft') moveTo(quiz.cur - 1);
  });

  applySettings();
  render();
})();
