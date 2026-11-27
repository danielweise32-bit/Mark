const test = require('node:test');
const assert = require('node:assert');
require('../grile/data-en.js');
require('../grile/data-bac.js');

const G = globalThis.GRILE;

test('ambele examene sunt definite', () => {
  assert.ok(G.en && G.bac);
  assert.deepEqual(G.en.subjects.map((s) => s.id), ['en-romana', 'en-mate']);
  assert.ok(G.bac.subjects.length >= 10);
});

test('fiecare întrebare are 4 variante distincte și un răspuns valid', () => {
  const ids = new Set();
  for (const ex of [G.en, G.bac]) {
    for (const s of ex.subjects) {
      assert.ok(!ids.has(s.id), 'id duplicat ' + s.id); ids.add(s.id);
      assert.ok(s.questions.length >= 10, s.name + ' are prea puține întrebări');
      const stems = new Set();
      for (const q of s.questions) {
        const where = `${s.name}: ${q.q}`;
        assert.equal(typeof q.q, 'string', where);
        assert.ok(!stems.has(q.q), 'enunț duplicat: ' + where); stems.add(q.q);
        assert.equal(q.o.length, 4, where);
        assert.equal(new Set(q.o).size, 4, 'variante duplicate: ' + where);
        assert.ok(Number.isInteger(q.a) && q.a >= 0 && q.a < 4, where);
        assert.ok(q.e && q.e.length > 5, 'lipsește explicația: ' + where);
      }
    }
  }
});

require('../grile/data-hard.js');

test('întrebările Hard sunt valide și aparțin unor materii existente', () => {
  const ids = new Set([...G.en.subjects, ...G.bac.subjects].map((s) => s.id));
  const H = G.hard;
  assert.ok(H['en-mate'].length >= 10 && H['bac-mate'].length >= 10);
  for (const [sid, list] of Object.entries(H)) {
    assert.ok(ids.has(sid), 'materie necunoscută: ' + sid);
    const normal = new Set([...G.en.subjects, ...G.bac.subjects].find((s) => s.id === sid).questions.map((q) => q.q));
    const stems = new Set();
    for (const q of list) {
      const where = `${sid}: ${q.q}`;
      assert.ok(!stems.has(q.q) && !normal.has(q.q), 'enunț duplicat: ' + where); stems.add(q.q);
      assert.equal(q.o.length, 4, where);
      assert.equal(new Set(q.o).size, 4, 'variante duplicate: ' + where);
      assert.ok(Number.isInteger(q.a) && q.a >= 0 && q.a < 4, where);
      assert.ok(q.e && q.e.length > 5, 'lipsește explicația: ' + where);
    }
  }
});
