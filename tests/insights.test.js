const test = require('node:test');
const assert = require('node:assert');
const { analyze, overallScore } = require('../insights.js');

const titles = (list) => list.map((x) => x.title);

test('cola: dezavantaje zahăr și ultra-procesat, scor slab', () => {
  const r = analyze({
    nova_group: 4, categories_tags: ['en:beverages', 'en:sodas'], additives_tags: ['en:e150d', 'en:e338'],
    nutriments: { 'energy-kcal_100g': 42, sugars_100g: 10.6, 'saturated-fat_100g': 0, fat_100g: 0, salt_100g: 0, proteins_100g: 0 },
    ingredients_text: 'apă, zahăr',
  });
  assert.equal(r.grade, 'e');
  assert.ok(titles(r.cons).includes('Ultra-procesat'));
  assert.ok(titles(r.cons).includes('Mult zahăr'));
  assert.ok(titles(r.pros).includes('Puține grăsimi saturate'));
  assert.ok(r.score < 25);
  assert.equal(r.unit, '100 ml');
});

test('linte: fibre, proteine, neprocesat, scor excelent', () => {
  const r = analyze({
    nutriscore_grade: 'a', nutriscore_score: -8, nova_group: 1, additives_tags: [], ingredients_text: 'linte',
    nutriments: { 'energy-kcal_100g': 116, sugars_100g: 1.8, 'saturated-fat_100g': 0.1, fat_100g: 0.4, salt_100g: 0.01, proteins_100g: 9, fiber_100g: 8 },
  });
  const p = titles(r.pros);
  for (const t of ['Bogat în fibre', 'Bogat în proteine', 'Neprocesat', 'Fără aditivi', 'Practic fără sare']) assert.ok(p.includes(t), t);
  assert.equal(r.cons.length, 0);
  assert.ok(r.score >= 75);
  assert.equal(r.verdict.text, 'Excelent');
});

test('ciocolată: zahăr, grăsimi saturate, calorii', () => {
  const r = analyze({
    nutriments: { 'energy-kcal_100g': 540, sugars_100g: 56, 'saturated-fat_100g': 18, fat_100g: 31, salt_100g: 0.2, proteins_100g: 6, fiber_100g: 2 },
  });
  const c = titles(r.cons);
  for (const t of ['Mult zahăr', 'Multe grăsimi saturate', 'Bogat în grăsimi', 'Foarte caloric']) assert.ok(c.includes(t), t);
  assert.equal(r.official, false);
});

test('scorul general rămâne între 0 și 100', () => {
  assert.equal(overallScore('a', -30, false, 1, 0), 100);
  assert.equal(overallScore('e', 50, false, 4, 20), 0);
  assert.equal(overallScore(null), null);
});
