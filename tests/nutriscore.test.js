const test = require('node:test');
const assert = require('node:assert');
const { compute, fromOff } = require('../nutriscore.js');

test('apa primește A', () => assert.equal(compute({}, { water: true }).grade, 'a'));

test('legume (fibre, fructe) => A', () => {
  const r = compute({ energyKj: 150, sugars: 3, satFat: 0.1, salt: 0.1, protein: 2, fibre: 3.5, fruitPct: 90 });
  assert.equal(r.grade, 'a');
});

test('ciocolată => E', () => {
  const r = compute({ energyKj: 2250, sugars: 56, satFat: 18, salt: 0.2, protein: 6, fibre: 2 });
  assert.equal(r.grade, 'e');
});

test('băutură cu zahăr (cola) => E', () => {
  const r = compute({ energyKj: 180, sugars: 10.6, satFat: 0, salt: 0 }, { drink: true });
  assert.equal(r.grade, 'e');
});

test('lipsă date => null', () => assert.equal(compute({ sugars: 1 }), null));

test('fromOff convertește kcal și sodiu, detectează băuturi', () => {
  const { nutrients, opts } = fromOff({
    nutriments: { 'energy-kcal_100g': 42, sugars_100g: 10.6, 'saturated-fat_100g': 0, sodium_100g: 0.004 },
    categories_tags: ['en:beverages', 'en:sodas'],
  });
  assert.ok(Math.abs(nutrients.energyKj - 175.7) < 0.5);
  assert.ok(Math.abs(nutrients.salt - 0.01) < 1e-9);
  assert.equal(opts.drink, true);
});
