# 🥗 NutriScan

Aplicație web (PWA) pentru telefon: scanezi codul de bare al unui produs alimentar și vezi imediat **scorul nutrițional**.

## Ce face

- **Scanare cu camera**: folosește detectorul nativ al browserului (Chrome/Android) sau biblioteca ZXing ca rezervă (Safari/iPhone). Codul se poate introduce și manual.
- **Nutri-Score A–E**: îl preia de la [Open Food Facts](https://world.openfoodfacts.org). Dacă produsul nu are un scor oficial, aplicația îl **calculează** din valorile nutriționale (algoritmul Nutri-Score 2023, pentru alimente și băuturi).
- **Scor general 0–100** (Excelent / Bun / Mediocru / Slab), calculat din Nutri-Score, gradul de procesare și numărul de aditivi.
- **Avantaje și dezavantaje** pentru fiecare produs: zahăr, grăsimi, sare, calorii, fibre, proteine, fructe și legume, procesare, aditivi, îndulcitori, ulei de palmier, cu procentul din doza zilnică de referință.
- **Grad de procesare NOVA** (1–4) și numărul de aditivi.
- **Valori nutriționale la 100 g**, cu semafor (scăzut / moderat / ridicat) pentru grăsimi, grăsimi saturate, zaharuri și sare.
- Alergeni, lista de ingrediente și **istoric** al produselor scanate (păstrat pe dispozitiv).
- Se poate instala pe ecranul principal și pornește și offline (datele produselor necesită internet).

## Pornire

Nu e nevoie de build. Camera funcționează doar pe **HTTPS** sau `localhost`.

```bash
npm start          # servește aplicația pe http://localhost:8080
npm test           # teste pentru calculul Nutri-Score
```

### Publicare gratuită cu GitHub Pages

1. Pe GitHub: **Settings → Pages**.
2. La *Source* alege **Deploy from a branch**, selectează branch-ul și folderul `/ (root)`, apoi **Save**.
3. După 1–2 minute aplicația e disponibilă la `https://<utilizator>.github.io/<repo>/`. Deschide adresa pe telefon și alege „Adaugă pe ecranul principal”.

## Structură

| Fișier | Rol |
| --- | --- |
| `index.html`, `style.css` | Interfața |
| `app.js` | Scanare, căutare produs, afișare, istoric |
| `nutriscore.js` | Calculul Nutri-Score 2023 |
| `insights.js` | Scor general 0–100, avantaje și dezavantaje |
| `sw.js`, `manifest.webmanifest`, `icon.svg` | Funcționalitate PWA (instalare, offline) |
| `vendor/zxing.min.js` | Biblioteca de scanare ZXing (Apache-2.0) |

## Note

- Datele vin de la Open Food Facts (licență ODbL), o bază de date colaborativă: unele produse pot lipsi sau pot avea date incomplete.
- Scorul calculat local este o estimare: pentru categorii speciale (uleiuri, nuci, brânzeturi) algoritmul oficial are reguli suplimentare.
- Informațiile sunt orientative și nu înlocuiesc sfatul unui medic sau nutriționist.

---

# 📝 Grila Mea – teste grilă pentru EN și BAC

Site separat, în folderul [`grile/`](grile/), cu teste grilă pentru **Evaluarea Națională** (clasa a VIII-a: română, matematică) și **Bacalaureat** (română, matematică, istorie, geografie, biologie, chimie, fizică, informatică, logică, psihologie, economie, sociologie, filosofie, engleză).

- **Două moduri:** *Antrenament* (vezi imediat răspunsul corect și explicația) și *Simulare de examen* (cronometru, poți reveni la întrebări, notă la final).
- **🔥 Mod Hard:** întrebări mai grele (în stilul subiectelor de examen, scrise pentru exersare, nu copiate din subiectele oficiale), 3 vieți, 60 de secunde pe întrebare, puncte cu bonus de combo și viteză, record personal.
- **Animații:** tranziții între pagini, carduri care se înclină după cursor, particule și combo la răspunsuri corecte, confetti, scântei în modul Hard, sunete opționale. Se pot opri din „Personalizare” (și se opresc automat dacă sistemul cere mișcare redusă).
- **Greșelile mele:** întrebările greșite se salvează automat și dispar când le rezolvi corect.
- **Progres:** teste date, procent pe materii, serie de zile, istoric.
- **Personalizare:** nume și avatar, 7 teme (inclusiv întunecat și automat), orice culoare de accent, font, mărimea textului, colțuri rotunjite, spațiere, animații.
- **Grilele mele:** îți creezi propriile materii și întrebări; import/export JSON ca să faci schimb cu colegii.
- Copie de siguranță a datelor (export/import). Totul se păstrează doar în browser.

Pe GitHub Pages site-ul e la `https://<utilizator>.github.io/<repo>/grile/`. Local: `npm start` și deschide `http://localhost:8080/grile/`.

**Adăugarea întrebărilor în site:** editează `grile/data-en.js`, `grile/data-bac.js` sau, pentru modul Hard, `grile/data-hard.js`. Fiecare întrebare are forma
`{ q: 'Enunț', o: ['A', 'B', 'C', 'D'], a: 0, e: 'Explicație' }`, unde `a` este indexul variantei corecte (0 = prima). `npm test` verifică dacă toate întrebările sunt valide.
