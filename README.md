# 🥗 NutriScan

Aplicație web (PWA) pentru telefon: scanezi codul de bare al unui produs alimentar și vezi imediat **scorul nutrițional**.

## Ce face

- **Scanare cu camera**: folosește detectorul nativ al browserului (Chrome/Android) sau biblioteca ZXing ca rezervă (Safari/iPhone). Codul se poate introduce și manual.
- **Nutri-Score A–E**: îl preia de la [Open Food Facts](https://world.openfoodfacts.org). Dacă produsul nu are un scor oficial, aplicația îl **calculează** din valorile nutriționale (algoritmul Nutri-Score 2023, pentru alimente și băuturi).
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
| `sw.js`, `manifest.webmanifest`, `icon.svg` | Funcționalitate PWA (instalare, offline) |
| `vendor/zxing.min.js` | Biblioteca de scanare ZXing (Apache-2.0) |

## Note

- Datele vin de la Open Food Facts (licență ODbL), o bază de date colaborativă: unele produse pot lipsi sau pot avea date incomplete.
- Scorul calculat local este o estimare: pentru categorii speciale (uleiuri, nuci, brânzeturi) algoritmul oficial are reguli suplimentare.
- Informațiile sunt orientative și nu înlocuiesc sfatul unui medic sau nutriționist.
