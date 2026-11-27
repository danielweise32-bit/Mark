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

  const DEFAULTS = {
    name: '', avatar: '🦊', theme: 'cream', accent: '#5b8def', font: 'nunito', fontSize: 17,
    radius: 18, density: 'comfy', animations: true, shuffle: true, confetti: true,
    defaultCount: 10, defaultMode: 'practice',
  };
  let settings = Object.assign({}, DEFAULTS, store.get('settings', {}));
  let stats = Object.assign({ attempts: [], mistakes: {} }, store.get('stats', {}));
  let custom = Object.assign({ subjects: [] }, store.get('custom', {}));
  let quiz = null;          // testul în desfășurare
  let lastResult = null;    // ultimul test terminat
  let timerId = null;

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

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
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
  function subjectStats(sid) {
    const list = stats.attempts.filter((a) => a.sid === sid);
    if (!list.length) return null;
    const best = Math.max(...list.map((a) => pct(a.correct, a.total)));
    const avg = Math.round(list.reduce((s, a) => s + pct(a.correct, a.total), 0) / list.length);
    return { count: list.length, best, avg };
  }

  // ---------- Personalizare ----------
  const THEMES = [
    { id: 'cream', name: 'Crem', bg: '#f7f1e8', fg: '#fffaf3' },
    { id: 'light', name: 'Luminos', bg: '#f4f6fb', fg: '#ffffff' },
    { id: 'mint', name: 'Mentă', bg: '#eef6f1', fg: '#fbfefc' },
    { id: 'lavender', name: 'Lavandă', bg: '#f3f0fa', fg: '#fdfcff' },
    { id: 'dark', name: 'Întunecat', bg: '#1c1a18', fg: '#262320' },
    { id: 'night', name: 'Noapte', bg: '#111827', fg: '#1a2335' },
    { id: 'auto', name: 'Automat', bg: 'linear-gradient(90deg,#f7f1e8 50%,#1c1a18 50%)', fg: 'transparent' },
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

  // ---------- Router ----------
  const app = $('#app');
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
  window.addEventListener('hashchange', render);

  function render() {
    clearInterval(timerId);
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/');
    const route = parts[0] || 'home';
    $$('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.nav === route || (route === 'exam' || route === 'subject') && a.dataset.nav === 'home'));
    const views = { home: viewHome, exam: () => viewExam(parts[1]), subject: () => viewSubject(parts[1]), quiz: viewQuiz, results: viewResults, mistakes: viewMistakes, stats: viewStats, settings: viewSettings, custom: viewCustom };
    (views[route] || viewHome)();
    if (route !== 'quiz') window.scrollTo(0, 0);
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
    const examCards = exams().map((ex) => {
      const qn = ex.subjects.reduce((s, x) => s + x.questions.length, 0);
      return `<a class="card exam-card" href="#/exam/${ex.id}">
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
          <h1>${esc(greeting())}</h1>
          <p>Alege examenul și exersează în ritmul tău. Fără grabă, fără stres.</p>
        </div>
      </section>
      <div class="pills" style="margin-bottom:24px">
        <span class="pill">🔥 Serie: <b>${plural(st, 'zi', 'zile')}</b></span>
        <span class="pill">📝 Teste: <b>${total}</b></span>
        <span class="pill">🎯 Corecte: <b>${answered ? pct(correct, answered) + '%' : '–'}</b></span>
        ${mistakes ? `<a class="pill" href="#/mistakes" style="text-decoration:none">🔁 De recapitulat: <b>${mistakes}</b></a>` : ''}
      </div>
      <div class="grid">${examCards}</div>
      <section class="card" style="margin-top:24px">
        <div class="row">
          <div style="flex:1;min-width:220px">
            <h3>⚡ Test rapid</h3>
            <p class="muted" style="margin:0">10 întrebări amestecate din toate materiile unui examen.</p>
          </div>
          <button class="btn soft" data-mix="en">Evaluare Națională</button>
          <button class="btn soft" data-mix="bac">Bacalaureat</button>
        </div>
      </section>`;
    $$('[data-mix]', app).forEach((b) => b.addEventListener('click', () => startMix(b.dataset.mix)));
  }

  function startMix(examId) {
    const ex = exams().find((e) => e.id === examId);
    const pool = [];
    ex.subjects.forEach((s) => s.questions.forEach((q) => pool.push({ sid: s.id, q })));
    startQuiz({ sid: 'mix-' + examId, title: 'Test rapid · ' + ex.name, icon: '⚡', color: settings.accent, pool, count: 10, mode: 'practice', timer: false, examId });
  }

  // ---------- Listă materii ----------
  function viewExam(id) {
    const ex = exams().find((e) => e.id === id);
    if (!ex) return go('#/');
    const cards = ex.subjects.map((s) => {
      const st = subjectStats(s.id);
      return `<a class="card subject" href="#/subject/${esc(s.id)}" style="--c:${esc(s.color)}">
        <span class="ico" aria-hidden="true">${esc(s.icon)}</span>
        <div style="flex:1;min-width:0">
          <h3>${esc(s.name)}</h3>
          <div class="meta">${plural(s.questions.length, 'întrebare', 'întrebări')}${st ? ' · cel mai bun: ' + st.best + '%' : ''}</div>
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
    const counts = [5, 10, 20].filter((c) => c < n).concat([n]);
    const def = counts.includes(settings.defaultCount) ? settings.defaultCount : counts[Math.min(1, counts.length - 1)];
    const st = subjectStats(sid);
    const mist = Object.values(stats.mistakes).filter((m) => m.sid === sid).length;
    app.innerHTML = `
      <div class="crumbs"><a href="#/">Acasă</a> › <a href="#/exam/${exam.id}">${esc(exam.name)}</a> › ${esc(subject.name)}</div>
      <div class="row" style="margin-bottom:20px;gap:14px">
        <span class="subject" style="--c:${esc(subject.color)}"><span class="ico" aria-hidden="true">${esc(subject.icon)}</span></span>
        <div><h1 style="margin:0">${esc(subject.name)}</h1>
        <p class="muted" style="margin:0">${esc(exam.name)} · ${plural(n, 'întrebare', 'întrebări')}${st ? ` · ${plural(st.count, 'test dat', 'teste date')}, media ${st.avg}%` : ''}</p></div>
      </div>
      <form class="card" id="setup">
        <div class="field"><span class="lbl">Cum vrei să lucrezi?</span>
          <div class="grid two">
            <label class="mode-card"><input type="radio" name="mode" value="practice" ${settings.defaultMode === 'practice' ? 'checked' : ''}>
              <div class="card"><h3>🌱 Antrenament</h3><p class="muted small" style="margin:0">Vezi imediat dacă ai răspuns corect, cu explicație. Fără cronometru.</p></div></label>
            <label class="mode-card"><input type="radio" name="mode" value="exam" ${settings.defaultMode === 'exam' ? 'checked' : ''}>
              <div class="card"><h3>⏱️ Simulare de examen</h3><p class="muted small" style="margin:0">Răspunzi la tot, poți reveni la întrebări, afli nota la final.</p></div></label>
          </div>
        </div>
        <div class="field"><span class="lbl">Număr de întrebări</span>
          <div class="choice">${counts.map((c) => `<label><input type="radio" name="count" value="${c}" ${c === def ? 'checked' : ''}><span>${c === n && c > 20 ? 'Toate (' + c + ')' : c}</span></label>`).join('')}</div>
        </div>
        <label class="switch"><input type="checkbox" name="timer" ${settings.defaultMode === 'exam' ? 'checked' : ''}> <span>Cronometru (1 minut pe întrebare)</span></label>
        <div class="row" style="margin-top:8px">
          <button class="btn" type="submit">Începe testul →</button>
          ${mist ? `<button class="btn ghost" type="button" id="practice-mistakes">🔁 Doar greșelile (${mist})</button>` : ''}
        </div>
      </form>`;
    const form = $('#setup');
    form.addEventListener('change', (e) => { if (e.target.name === 'mode') form.timer.checked = e.target.value === 'exam'; });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const mode = form.mode.value, count = +form.count.value;
      settings.defaultMode = mode; settings.defaultCount = count; saveSettings();
      startQuiz({ sid, title: subject.name, icon: subject.icon, color: subject.color, pool: subject.questions.map((q) => ({ sid, q })), count, mode, timer: form.timer.checked, examId: exam.id });
    });
    const pm = $('#practice-mistakes');
    if (pm) pm.addEventListener('click', () => startMistakes(sid));
  }

  // ---------- Test ----------
  function startQuiz({ sid, title, icon, color, pool, count, mode, timer, examId }) {
    const picked = shuffle(pool).slice(0, Math.min(count, pool.length));
    const items = picked.map(({ sid: qs, q }) => {
      const order = settings.shuffle ? shuffle(q.o.map((_, i) => i)) : q.o.map((_, i) => i);
      return { key: qKey(qs, q), sid: qs, q: q.q, o: order.map((i) => q.o[i]), a: order.indexOf(q.a), e: q.e || '' };
    });
    quiz = { sid, title, icon, color, examId, mode, items, answers: items.map(() => null), flags: [], cur: 0,
      start: Date.now(), limit: timer ? items.length * 60 : 0 };
    saveQuiz();
    go('#/quiz');
  }

  function viewQuiz() {
    if (!quiz) { try { quiz = JSON.parse(sessionStorage.getItem('grila.quiz')); } catch (e) {} }
    if (!quiz) return go('#/');
    const it = quiz.items[quiz.cur];
    const ans = quiz.answers[quiz.cur];
    const practice = quiz.mode === 'practice';
    const locked = practice && ans !== null;
    const done = quiz.answers.filter((a) => a !== null).length;
    const flagged = quiz.flags.includes(quiz.cur);
    const opts = it.o.map((text, i) => {
      let cls = '';
      if (locked) { if (i === it.a) cls = 'correct'; else if (i === ans) cls = 'wrong'; }
      else if (i === ans) cls = 'selected';
      const mark = locked && i === it.a ? '✓' : locked && i === ans ? '✗' : '';
      return `<button class="opt ${cls}" data-i="${i}" ${locked ? 'disabled' : ''} aria-pressed="${i === ans}">
        <span class="letter">${LETTERS[i]}</span><span>${esc(text)}</span>${mark ? `<span class="mark" aria-hidden="true">${mark}</span>` : ''}</button>`;
    }).join('');
    const last = quiz.cur === quiz.items.length - 1;
    let explain = '';
    if (locked) {
      const ok = ans === it.a;
      explain = `<div class="explain ${ok ? 'ok' : 'ko'}" role="status"><b>${ok ? '✅ Corect!' : '❌ Răspunsul corect: ' + LETTERS[it.a]}</b>${it.e ? `<br>${esc(it.e)}` : ''}</div>`;
    }
    const dots = quiz.items.map((x, i) => {
      const a = quiz.answers[i];
      let c = a === null ? '' : practice ? (a === x.a ? 'ok' : 'ko') : 'done';
      if (i === quiz.cur) c += ' cur';
      if (quiz.flags.includes(i)) c += ' flag';
      return `<button class="dot ${c}" data-go="${i}" aria-label="Întrebarea ${i + 1}">${i + 1}</button>`;
    }).join('');
    app.innerHTML = `
      <div class="quiz-top">
        <div class="title"><span aria-hidden="true">${esc(quiz.icon)}</span> ${esc(quiz.title)}</div>
        <span class="spacer"></span>
        ${quiz.limit ? `<span class="timer" id="timer">⏱ –</span>` : ''}
        <button class="btn ghost sm" id="quit">Ieși</button>
      </div>
      <div class="progress" aria-hidden="true"><i style="width:${pct(done, quiz.items.length)}%"></i></div>
      <section class="question">
        <div class="num">Întrebarea ${quiz.cur + 1} din ${quiz.items.length}
          <span class="spacer"></span>
          ${!practice ? `<button class="btn ghost sm flag-btn ${flagged ? 'on' : ''}" id="flag" aria-pressed="${flagged}">⚑ ${flagged ? 'Marcată' : 'Revin mai târziu'}</button>` : ''}
        </div>
        <div class="stem">${esc(it.q)}</div>
        <div class="options">${opts}</div>
        ${explain}
        <div class="quiz-nav">
          <button class="btn ghost" id="prev" ${quiz.cur === 0 ? 'disabled' : ''}>← Înapoi</button>
          <span class="spacer"></span>
          ${practice
            ? `<button class="btn" id="next" ${locked ? '' : 'disabled'}>${last ? 'Vezi rezultatul' : 'Următoarea →'}</button>`
            : `${last ? '' : `<button class="btn ghost" id="next">Următoarea →</button>`}<button class="btn" id="finish">Finalizează (${done}/${quiz.items.length})</button>`}
        </div>
        <div class="dots">${dots}</div>
        <p class="kbd-hint">Scurtături: <kbd>1</kbd>–<kbd>4</kbd> sau <kbd>A</kbd>–<kbd>D</kbd> pentru răspuns · <kbd>Enter</kbd> mai departe · <kbd>←</kbd> <kbd>→</kbd> navigare</p>
      </section>`;

    $$('.opt', app).forEach((b) => b.addEventListener('click', () => choose(+b.dataset.i)));
    $$('.dot', app).forEach((b) => b.addEventListener('click', () => { if (practice && quiz.answers[quiz.cur] === null && +b.dataset.go > quiz.cur) return; moveTo(+b.dataset.go); }));
    $('#prev').addEventListener('click', () => moveTo(quiz.cur - 1));
    const next = $('#next'); if (next) next.addEventListener('click', advance);
    const fin = $('#finish'); if (fin) fin.addEventListener('click', () => finish(false));
    const flag = $('#flag'); if (flag) flag.addEventListener('click', toggleFlag);
    $('#quit').addEventListener('click', () => {
      if (confirm('Sigur vrei să ieși? Progresul acestui test se pierde.')) { quiz = null; sessionStorage.removeItem('grila.quiz'); go('#/'); }
    });
    if (quiz.limit) startTimer();
  }

  function startTimer() {
    clearInterval(timerId);
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

  function choose(i) {
    if (!quiz) return;
    const it = quiz.items[quiz.cur];
    if (i >= it.o.length) return;
    if (quiz.mode === 'practice' && quiz.answers[quiz.cur] !== null) return;
    quiz.answers[quiz.cur] = i;
    saveQuiz();
    viewQuiz();
    if (quiz.mode === 'practice') { const n = $('#next'); if (n) n.focus({ preventScroll: true }); }
  }
  function moveTo(i) { if (i < 0 || i >= quiz.items.length) return; quiz.cur = i; saveQuiz(); viewQuiz(); }
  function advance() {
    if (quiz.mode === 'practice' && quiz.answers[quiz.cur] === null) return;
    if (quiz.cur < quiz.items.length - 1) moveTo(quiz.cur + 1); else finish(false);
  }
  function toggleFlag() {
    const i = quiz.flags.indexOf(quiz.cur);
    if (i >= 0) quiz.flags.splice(i, 1); else quiz.flags.push(quiz.cur);
    saveQuiz(); viewQuiz();
  }

  function finish(timeUp) {
    if (!quiz) return;
    const unanswered = quiz.answers.filter((a) => a === null).length;
    if (!timeUp && quiz.mode === 'exam' && unanswered && !confirm(`Mai ai ${plural(unanswered, 'întrebare', 'întrebări')} fără răspuns. Finalizezi testul?`)) return;
    clearInterval(timerId);
    const correct = quiz.items.filter((it, i) => quiz.answers[i] === it.a).length;
    const total = quiz.items.length;
    const seconds = Math.round((Date.now() - quiz.start) / 1000);
    // Actualizează lista de greșeli: greșit → adăugat, corect → scos.
    quiz.items.forEach((it, i) => {
      const a = quiz.answers[i];
      if (a === it.a) delete stats.mistakes[it.key];
      else {
        const prev = stats.mistakes[it.key];
        const o = it.o.slice(); // păstrăm întrebarea cu varianta corectă marcată
        stats.mistakes[it.key] = { sid: it.sid, q: { q: it.q, o, a: it.a, e: it.e }, count: (prev ? prev.count : 0) + 1, date: Date.now() };
      }
    });
    stats.attempts.push({ sid: quiz.sid, title: quiz.title, icon: quiz.icon, mode: quiz.mode, correct, total, seconds, date: Date.now() });
    if (stats.attempts.length > 500) stats.attempts = stats.attempts.slice(-500);
    saveStats();
    lastResult = Object.assign({}, quiz, { correct, total, seconds });
    try { sessionStorage.setItem('grila.result', JSON.stringify(lastResult)); } catch (e) {}
    quiz = null; sessionStorage.removeItem('grila.quiz');
    go('#/results');
  }

  // ---------- Rezultate ----------
  function viewResults() {
    if (!lastResult) { try { lastResult = JSON.parse(sessionStorage.getItem('grila.result')); } catch (e) {} }
    const r = lastResult;
    if (!r) return go('#/');
    const p = pct(r.correct, r.total);
    const nota = grade(r.correct, r.total);
    const wrong = r.items.filter((it, i) => r.answers[i] !== null && r.answers[i] !== it.a).length;
    const skipped = r.answers.filter((a) => a === null).length;
    const msg = p === 100 ? 'Perfect! Ești pregătit(ă)! 🏆' : p >= 80 ? 'Foarte bine! Mai e puțin până la perfect. 🌟' : p >= 50 ? 'Bun început! Recapitulează greșelile și încearcă din nou. 💪' : 'Nu-i nimic – fiecare greșeală te învață ceva. Hai încă o dată! 🌱';
    const ringColor = p >= 80 ? 'var(--good)' : p >= 50 ? 'var(--warn)' : 'var(--bad)';
    const review = r.items.map((it, i) => {
      const a = r.answers[i];
      const cls = a === null ? 'skip' : a === it.a ? 'ok' : 'ko';
      return `<div class="card review-item ${cls}" data-kind="${cls}">
        <div class="small muted">Întrebarea ${i + 1} · ${cls === 'ok' ? '✅ corect' : cls === 'ko' ? '❌ greșit' : '⏭ fără răspuns'}</div>
        <p style="font-weight:700;margin:4px 0 8px;white-space:pre-line">${esc(it.q)}</p>
        ${a !== null && a !== it.a ? `<div class="ans bad">${LETTERS[a]}. ${esc(it.o[a])}</div>` : ''}
        <div class="ans good">${LETTERS[it.a]}. ${esc(it.o[it.a])}</div>
        ${it.e ? `<p class="small muted" style="margin:8px 0 0">💡 ${esc(it.e)}</p>` : ''}
      </div>`;
    }).join('');
    app.innerHTML = `
      <section class="card result-hero">
        <div class="ring" style="--p:${p};--ring:${ringColor}"><div><div><strong>${p}%</strong><small>${r.correct} din ${r.total}</small></div></div></div>
        <h2>${msg}</h2>
        <div class="stats-row">
          <div><b>${nota.toFixed(2).replace('.', ',')}</b><span>nota estimată*</span></div>
          <div><b style="color:var(--good)">${r.correct}</b><span>corecte</span></div>
          <div><b style="color:var(--bad)">${wrong}</b><span>greșite</span></div>
          ${skipped ? `<div><b style="color:var(--warn)">${skipped}</b><span>fără răspuns</span></div>` : ''}
          <div><b>${fmtTime(r.seconds)}</b><span>timp</span></div>
        </div>
        <div class="row" style="justify-content:center">
          <button class="btn" id="again">↻ Încă un test</button>
          ${wrong + skipped ? `<button class="btn soft" id="redo">🔁 Refă greșelile</button>` : ''}
          <a class="btn ghost" href="${r.sid.startsWith('mix-') ? '#/' : '#/subject/' + esc(r.sid)}">Înapoi</a>
        </div>
        <p class="small muted" style="margin:16px 0 0">* Nota: 1 punct din oficiu + 9 puncte proporțional cu răspunsurile corecte.</p>
      </section>
      <div class="row" style="margin:26px 0 12px">
        <h2 style="margin:0">Corectare</h2><span class="spacer"></span>
        <div class="choice" id="filter">
          <label><input type="radio" name="f" value="all" checked><span>Toate</span></label>
          <label><input type="radio" name="f" value="bad"><span>Doar greșite</span></label>
        </div>
      </div>
      <div class="stack" id="review">${review}</div>`;
    if (p >= 90 && settings.confetti && settings.animations && !r.celebrated) { confetti(); r.celebrated = true; }
    $('#again').addEventListener('click', () => {
      if (r.sid.startsWith('mix-')) return startMix(r.sid.slice(4));
      if (r.sid === 'mistakes') return startMistakes();
      const f = findSubject(r.sid);
      if (f) startQuiz({ sid: r.sid, title: f.subject.name, icon: f.subject.icon, color: f.subject.color, pool: f.subject.questions.map((q) => ({ sid: r.sid, q })), count: r.total, mode: r.mode, timer: !!r.limit, examId: f.exam.id });
      else go('#/');
    });
    const redo = $('#redo');
    if (redo) redo.addEventListener('click', () => {
      const pool = r.items.filter((it, i) => r.answers[i] !== it.a).map((it) => ({ sid: it.sid, q: { q: it.q, o: it.o, a: it.a, e: it.e } }));
      startQuiz({ sid: r.sid, title: r.title + ' · greșeli', icon: '🔁', color: r.color, pool, count: pool.length, mode: 'practice', timer: false, examId: r.examId });
    });
    $('#filter').addEventListener('change', (e) => {
      $$('#review .review-item').forEach((el) => { el.hidden = e.target.value === 'bad' && el.dataset.kind === 'ok'; });
    });
  }

  function confetti() {
    const box = document.createElement('div'); box.className = 'confetti';
    const bits = ['🎉', '⭐', '✨', '🎊', '💫'];
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('i');
      s.textContent = bits[i % bits.length];
      s.style.left = Math.random() * 100 + 'vw';
      s.style.animationDuration = 2 + Math.random() * 2.5 + 's';
      s.style.animationDelay = Math.random() * 0.8 + 's';
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 5500);
  }

  // ---------- Greșeli ----------
  function startMistakes(sid) {
    const list = Object.values(stats.mistakes).filter((m) => !sid || m.sid === sid);
    if (!list.length) return toast('Nu ai greșeli de recapitulat. Bravo! 🎉');
    startQuiz({ sid: sid || 'mistakes', title: sid ? (findSubject(sid) || { subject: { name: 'Greșeli' } }).subject.name + ' · greșeli' : 'Recapitulare greșeli', icon: '🔁', color: settings.accent,
      pool: list.map((m) => ({ sid: m.sid, q: m.q })), count: list.length, mode: 'practice', timer: false, examId: '' });
  }

  function viewMistakes() {
    const list = Object.entries(stats.mistakes);
    if (!list.length) {
      app.innerHTML = `<h1>🔁 Greșelile mele</h1><div class="card empty"><span class="big">🌈</span>
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
    $('#all').addEventListener('click', () => startMistakes());
    $$('[data-practice]', app).forEach((b) => b.addEventListener('click', () => startMistakes(b.dataset.practice)));
    $$('[data-del]', app).forEach((b) => b.addEventListener('click', () => { delete stats.mistakes[b.dataset.del]; saveStats(); viewMistakes(); }));
  }

  // ---------- Progres ----------
  function viewStats() {
    const at = stats.attempts;
    if (!at.length) {
      app.innerHTML = `<h1>📊 Progresul meu</h1><div class="card empty"><span class="big">🌱</span><p>Încă nu ai dat niciun test. Statisticile apar aici după primul test.</p><a class="btn" href="#/">Începe acum</a></div>`;
      return;
    }
    const answered = at.reduce((s, a) => s + a.total, 0);
    const correct = at.reduce((s, a) => s + a.correct, 0);
    const time = at.reduce((s, a) => s + (a.seconds || 0), 0);
    const bySubject = {};
    at.forEach((a) => { const b = (bySubject[a.sid] = bySubject[a.sid] || { c: 0, t: 0, n: 0, title: a.title, icon: a.icon }); b.c += a.correct; b.t += a.total; b.n++; });
    const bars = Object.entries(bySubject).sort((x, y) => pct(y[1].c, y[1].t) - pct(x[1].c, x[1].t)).map(([sid, b]) => {
      const f = findSubject(sid); const p = pct(b.c, b.t);
      return `<div class="hbar"><span>${esc(f ? f.subject.icon : b.icon)} ${esc(f ? f.subject.name : b.title)}</span>
        <div class="bar" style="--c:${esc(f ? f.subject.color : 'var(--accent)')}"><i style="width:${p}%"></i></div><span class="v">${p}%</span></div>`;
    }).join('');
    const hist = at.slice(-15).reverse().map((a) => {
      const p = pct(a.correct, a.total);
      return `<li><span aria-hidden="true">${esc(a.icon || '📝')}</span><span style="flex:1;min-width:0">${esc(a.title)}<br><span class="small muted">${fmtDate(a.date)} · ${a.mode === 'exam' ? 'simulare' : 'antrenament'} · ${fmtTime(a.seconds || 0)}</span></span>
        <span class="score-chip ${chipClass(p)}">${a.correct}/${a.total}</span></li>`;
    }).join('');
    app.innerHTML = `
      <h1>📊 Progresul meu</h1>
      <div class="kpis">
        <div class="card kpi"><b>${at.length}</b><span>teste date</span></div>
        <div class="card kpi"><b>${answered}</b><span>întrebări rezolvate</span></div>
        <div class="card kpi"><b>${pct(correct, answered)}%</b><span>răspunsuri corecte</span></div>
        <div class="card kpi"><b>${Math.round(time / 60)} min</b><span>timp de studiu</span></div>
        <div class="card kpi"><b>🔥 ${streak()}</b><span>zile la rând</span></div>
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
          <div class="row" style="margin-top:18px"><button class="btn">Buton exemplu</button><button class="btn soft">Secundar</button></div>
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
          <h2>Teste</h2>
          <label class="switch"><input type="checkbox" id="s-shuffle" ${settings.shuffle ? 'checked' : ''}><span>Amestecă ordinea variantelor de răspuns</span></label>
          <label class="switch"><input type="checkbox" id="s-anim" ${settings.animations ? 'checked' : ''}><span>Animații</span></label>
          <label class="switch"><input type="checkbox" id="s-confetti" ${settings.confetti ? 'checked' : ''}><span>Confetti la rezultate de peste 90%</span></label>
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
    $('#s-avatar').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; upd({ avatar: b.dataset.v }); $$('#s-avatar button').forEach((x) => x.classList.toggle('on', x === b)); });
    $('#s-theme').addEventListener('change', (e) => upd({ theme: e.target.value }));
    const setAccent = (c) => { upd({ accent: c }); $$('#s-accent .swatch').forEach((x) => x.classList.toggle('on', x.dataset.v === c)); $('#s-color').value = c; };
    $('#s-accent').addEventListener('click', (e) => { const b = e.target.closest('.swatch'); if (b) setAccent(b.dataset.v); });
    $('#s-color').addEventListener('input', (e) => setAccent(e.target.value));
    $('#s-font').addEventListener('change', (e) => upd({ font: e.target.value }));
    $('#s-fs').addEventListener('input', (e) => { upd({ fontSize: +e.target.value }); $('#fs-v').textContent = e.target.value + 'px'; });
    $('#s-radius').addEventListener('input', (e) => { upd({ radius: +e.target.value }); $('#r-v').textContent = e.target.value + 'px'; });
    $('#s-density').addEventListener('change', (e) => upd({ density: e.target.value }));
    $('#s-shuffle').addEventListener('change', (e) => upd({ shuffle: e.target.checked }));
    $('#s-anim').addEventListener('change', (e) => upd({ animations: e.target.checked }));
    $('#s-confetti').addEventListener('change', (e) => upd({ confetti: e.target.checked }));
    $('#backup').addEventListener('click', () => download('grila-mea-backup.json', { app: 'grila-mea', version: 1, settings, stats, custom }));
    $('#restore').addEventListener('change', (e) => readJson(e.target.files[0], (data) => {
      if (!data || data.app !== 'grila-mea') return toast('Fișierul nu este o copie Grila Mea.');
      if (data.settings) settings = Object.assign({}, DEFAULTS, data.settings);
      if (data.stats) stats = Object.assign({ attempts: [], mistakes: {} }, data.stats);
      if (data.custom) custom = Object.assign({ subjects: [] }, data.custom);
      saveSettings(); saveStats(); saveCustom(); applySettings(); viewSettings(); toast('Datele au fost restaurate ✔');
    }));
    $('#reset-look').addEventListener('click', () => {
      const keep = { name: settings.name, avatar: settings.avatar };
      settings = Object.assign({}, DEFAULTS, keep); saveSettings(); applySettings(); viewSettings(); toast('Aspectul a revenit la implicit');
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
      saveCustom(); viewCustom(); toast('Materia a fost creată');
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
      saveCustom(); viewCustom(); toast(`Importat: ${plural(list.length, 'materie', 'materii')}, ${plural(qn, 'întrebare', 'întrebări')}`);
    }));

    $$('.sub-editor', app).forEach((box) => {
      const s = custom.subjects.find((x) => x.id === box.dataset.id);
      $('[data-act="del-sub"]', box).addEventListener('click', () => {
        if (!confirm(`Ștergi materia „${s.name}” cu toate întrebările ei?`)) return;
        custom.subjects = custom.subjects.filter((x) => x !== s); saveCustom(); viewCustom();
      });
      $$('[data-delq]', box).forEach((b) => b.addEventListener('click', () => { s.questions.splice(+b.dataset.delq, 1); saveCustom(); viewCustom(); }));
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
        s.questions.push(q); saveCustom(); viewCustom(); toast('Întrebarea a fost adăugată ✔');
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
    else if (k === 'arrowright') { if (quiz.mode === 'exam' || quiz.answers[quiz.cur] !== null) moveTo(quiz.cur + 1); }
    else if (k === 'arrowleft') moveTo(quiz.cur - 1);
  });

  applySettings();
  render();
})();
