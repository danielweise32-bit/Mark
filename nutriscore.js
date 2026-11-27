// Calcul Nutri-Score (algoritmul 2023) — folosit când Open Food Facts nu are un scor oficial.
(function (root) {
  function pts(value, thresholds) {
    let p = 0;
    for (const t of thresholds) if (value > t) p++;
    return p;
  }

  const FOOD = {
    energy: [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350],
    sugars: [3.4, 6.8, 10, 14, 17, 20, 24, 27, 31, 34, 37, 41, 44, 48, 51],
    satFat: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    salt: Array.from({ length: 20 }, (_, i) => +(0.2 * (i + 1)).toFixed(1)),
    protein: [2.4, 4.8, 7.2, 9.6, 12, 14, 17],
    fibre: [3.0, 4.1, 5.2, 6.3, 7.4],
  };
  const DRINK = {
    energy: [30, 90, 150, 210, 240, 270, 300, 330, 360, 390],
    sugars: [0.5, 2, 3.5, 5, 6, 7, 8, 9, 10, 11],
    protein: [1.2, 1.5, 1.8, 2.1, 2.4, 2.7, 3.0],
  };

  function fruitPoints(pct, drink) {
    if (pct > 80) return drink ? 6 : 5;
    if (pct > 60) return drink ? 4 : 2;
    if (pct > 40) return drink ? 2 : 1;
    return 0;
  }

  /**
   * n: { energyKj, sugars, satFat, salt, protein, fibre, fruitPct, sweeteners }
   * opts: { drink, water, cheese }
   * Returnează { grade, score, negative, positive } sau null dacă lipsesc date esențiale.
   */
  function compute(n, opts = {}) {
    if (opts.water) return { grade: 'a', score: 0, negative: 0, positive: 0 };
    const needed = ['energyKj', 'sugars', 'satFat', 'salt'];
    if (needed.some((k) => n[k] == null || isNaN(n[k]))) return null;
    const drink = !!opts.drink;
    const t = drink ? { ...FOOD, ...DRINK } : FOOD;

    let negative =
      pts(n.energyKj, t.energy) + pts(n.sugars, t.sugars) +
      pts(n.satFat, t.satFat) + pts(n.salt, t.salt);
    if (drink && n.sweeteners) negative += 4;

    const fruit = fruitPoints(n.fruitPct || 0, drink);
    const fibre = pts(n.fibre || 0, t.fibre);
    let protein = pts(n.protein || 0, t.protein);
    if (!drink && negative >= 11 && !opts.cheese) protein = 0;

    const positive = fruit + fibre + protein;
    const score = negative - positive;

    let grade;
    if (drink) grade = score <= 2 ? 'b' : score <= 6 ? 'c' : score <= 9 ? 'd' : 'e';
    else grade = score <= 0 ? 'a' : score <= 2 ? 'b' : score <= 10 ? 'c' : score <= 18 ? 'd' : 'e';
    return { grade, score, negative, positive };
  }

  /** Extrage valorile necesare dintr-un produs Open Food Facts. */
  function fromOff(product) {
    const m = product.nutriments || {};
    const num = (v) => (v === undefined || v === null || v === '' ? null : Number(v));
    let energyKj = num(m['energy-kj_100g']);
    if (energyKj == null && m['energy-kcal_100g'] != null) energyKj = num(m['energy-kcal_100g']) * 4.184;
    if (energyKj == null) energyKj = num(m.energy_100g);
    let salt = num(m.salt_100g);
    if (salt == null && m.sodium_100g != null) salt = num(m.sodium_100g) * 2.5;
    const cats = product.categories_tags || [];
    const additives = product.additives_tags || [];
    const sweetenerCodes = ['e950', 'e951', 'e952', 'e954', 'e955', 'e957', 'e959', 'e960', 'e961', 'e962', 'e969'];
    return {
      nutrients: {
        energyKj, salt,
        sugars: num(m.sugars_100g),
        satFat: num(m['saturated-fat_100g']),
        protein: num(m.proteins_100g),
        fibre: num(m.fiber_100g),
        fruitPct: num(m['fruits-vegetables-legumes-estimate-from-ingredients_100g'] ??
          m['fruits-vegetables-nuts-estimate-from-ingredients_100g']),
        sweeteners: additives.some((a) => sweetenerCodes.some((c) => a.startsWith('en:' + c))),
      },
      opts: {
        water: cats.includes('en:waters') && !cats.includes('en:flavored-waters'),
        drink: cats.includes('en:beverages') && !cats.some((c) => /milk|dairies|yogurt/.test(c)),
        cheese: cats.includes('en:cheeses'),
      },
    };
  }

  const api = { compute, fromOff };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NutriScore = api;
})(typeof self !== 'undefined' ? self : this);
