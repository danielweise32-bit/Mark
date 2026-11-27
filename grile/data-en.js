// Grile pentru Evaluarea Națională (clasa a VIII-a).
// Format întrebare: { q: enunț, o: [4 variante], a: indexul variantei corecte, e: explicație }
(function (root) {
  root.GRILE = root.GRILE || {};
  root.GRILE.en = {
    id: 'en',
    name: 'Evaluarea Națională',
    short: 'EN',
    subtitle: 'Clasa a VIII-a',
    icon: '🎒',
    subjects: [
      {
        id: 'en-romana', name: 'Limba și literatura română', icon: '📖', color: '#e07a5f',
        questions: [
          { q: 'Sinonimul cuvântului „a contempla” este:', o: ['a privi îndelung', 'a respinge', 'a grăbi', 'a ascunde'], a: 0, e: '„A contempla” înseamnă a privi cu atenție, îndelung, de obicei cu admirație.' },
          { q: 'Antonimul cuvântului „efemer” este:', o: ['trecător', 'durabil', 'fragil', 'ușor'], a: 1, e: '„Efemer” = de scurtă durată, trecător; opusul este „durabil”, „veșnic”.' },
          { q: 'Forma corectă în enunțul „___ s-au jucat toată ziua în parc.” este:', o: ['Copii', 'Copiii', 'Copiiii', 'Copi'], a: 1, e: 'Substantivul „copil”, la plural articulat hotărât, se scrie cu trei de „i”: „copiii”.' },
          { q: 'Cuvântul care conține un diftong este:', o: ['poezie', 'alee', 'soare', 'aer'], a: 2, e: 'În „soa-re”, grupul „oa” este diftong (se pronunță într-o singură silabă). Celelalte conțin hiaturi.' },
          { q: 'Cuvântul „poezie” are:', o: ['două silabe', 'trei silabe', 'patru silabe', 'cinci silabe'], a: 2, e: 'Despărțirea în silabe: po-e-zi-e, deci patru silabe.' },
          { q: 'Cuvântul „nefericit” s-a format prin:', o: ['compunere', 'derivare cu prefix', 'conversiune', 'împrumut'], a: 1, e: 'Prefixul „ne-” se adaugă la „fericit”: derivare cu prefix.' },
          { q: 'Cuvântul „floare-de-colț” s-a format prin:', o: ['derivare cu sufix', 'conversiune', 'compunere', 'derivare cu prefix'], a: 2, e: 'Este un cuvânt compus prin alăturare, cu cratimă.' },
          { q: 'În enunțul „Ion este medic.”, predicatul este:', o: ['verbal', 'nominal', 'inexistent', 'exprimat prin adverb'], a: 1, e: 'Predicatul nominal = verb copulativ („este”) + nume predicativ („medic”).' },
          { q: 'Forma verbală „aș fi venit” este la modul:', o: ['indicativ, perfect compus', 'conjunctiv, perfect', 'condițional-optativ, perfect', 'imperativ'], a: 2, e: '„Aș fi venit” = condițional-optativ, timpul perfect.' },
          { q: 'În enunțul „I-am dat cartea fratelui.”, substantivul „fratelui” este în cazul:', o: ['nominativ', 'acuzativ', 'genitiv', 'dativ'], a: 3, e: 'Răspunde la întrebarea „cui?” și este complement indirect: cazul dativ.' },
          { q: 'În enunțul „Cartea MEA este pe masă.”, cuvântul scris cu majuscule are funcția sintactică de:', o: ['subiect', 'atribut adjectival', 'complement direct', 'nume predicativ'], a: 1, e: '„Mea” este adjectiv pronominal posesiv care determină substantivul „cartea”: atribut adjectival.' },
          { q: 'În fraza „Știu CĂ VEI VENI.”, propoziția scrisă cu majuscule este o subordonată:', o: ['subiectivă', 'completivă directă', 'atributivă', 'circumstanțială de timp'], a: 1, e: 'Răspunde la întrebarea „ce știu?” și ține locul unui complement direct.' },
          { q: 'În enunțul „A învățat bine pentru examen.”, cuvântul „bine” este:', o: ['adjectiv', 'substantiv', 'adverb', 'verb'], a: 2, e: '„Bine” determină verbul „a învățat” și arată modul: adverb de mod.' },
          { q: 'Varianta scrisă corect este:', o: ['Nul cunosc.', 'Nu-l cunosc.', 'Nu l-cunosc.', 'Nu lcunosc.'], a: 1, e: 'Negația „nu” și pronumele „l” se leagă prin cratimă: „nu-l”.' },
          { q: 'Pronumele de politețe din seria de mai jos este:', o: ['el', 'acesta', 'dumneavoastră', 'cineva'], a: 2, e: '„Dumneavoastră” este pronume personal de politețe.' },
          { q: 'În versul „Vântul plânge la fereastră”, figura de stil este:', o: ['comparația', 'personificarea', 'enumerația', 'epitetul'], a: 1, e: 'Vântului i se atribuie o acțiune omenească (plânsul): personificare.' },
          { q: 'În structura „ochi ca stelele”, figura de stil este:', o: ['metafora', 'repetiția', 'comparația', 'inversiunea'], a: 2, e: 'Apare termenul de comparație „ca”, care leagă doi termeni: comparație.' },
          { q: 'Rima împerecheată are schema:', o: ['abab', 'aabb', 'abba', 'aaaa'], a: 1, e: 'Rima împerecheată: versurile rimează două câte două (aabb).' },
          { q: 'Măsura unui vers reprezintă:', o: ['numărul de strofe', 'numărul de silabe din vers', 'potrivirea sunetelor finale', 'succesiunea silabelor accentuate'], a: 1, e: 'Măsura = numărul de silabe dintr-un vers.' },
          { q: '„Moara cu noroc” de Ioan Slavici aparține genului:', o: ['liric', 'epic', 'dramatic', 'publicistic'], a: 1, e: 'Este o nuvelă, operă epică (există narator, acțiune și personaje).' },
          { q: 'Autorul operei „Povestea lui Harap-Alb” este:', o: ['Mihai Eminescu', 'Ion Creangă', 'Ioan Slavici', 'Mihail Sadoveanu'], a: 1, e: 'Basmul cult „Povestea lui Harap-Alb” a fost scris de Ion Creangă.' },
          { q: 'Modul de expunere care prezintă succesiunea întâmplărilor este:', o: ['descrierea', 'dialogul', 'narațiunea', 'monologul'], a: 2, e: 'Narațiunea relatează o succesiune de fapte, întâmplări.' },
          { q: 'Textul în care autorul își exprimă direct sentimentele, prin intermediul eului liric, aparține genului:', o: ['epic', 'liric', 'dramatic', 'științific'], a: 1, e: 'În genul liric sentimentele sunt transmise direct, prin vocea eului liric.' },
          { q: 'Subiectul din enunțul „Au sosit oaspeții de departe.” este:', o: ['au sosit', 'oaspeții', 'de departe', 'subiect inclus'], a: 1, e: 'Cine au sosit? „Oaspeții” – subiect simplu exprimat prin substantiv.' }
        ]
      },
      {
        id: 'en-mate', name: 'Matematică', icon: '📐', color: '#3d85c6',
        questions: [
          { q: 'Rezultatul calculului 2³ + 3² este:', o: ['12', '15', '17', '36'], a: 2, e: '2³ = 8 și 3² = 9, deci 8 + 9 = 17.' },
          { q: '√144 este egal cu:', o: ['11', '12', '14', '72'], a: 1, e: '12 · 12 = 144.' },
          { q: '25% din 80 este:', o: ['20', '25', '32', '40'], a: 0, e: '25/100 · 80 = 20.' },
          { q: 'Soluția ecuației 3x − 5 = 10 este:', o: ['x = 3', 'x = 5', 'x = 15', 'x = −5'], a: 1, e: '3x = 15, deci x = 5.' },
          { q: 'Media aritmetică a numerelor 4, 6, 8 și 10 este:', o: ['6', '7', '8', '28'], a: 1, e: '(4 + 6 + 8 + 10) : 4 = 28 : 4 = 7.' },
          { q: '(a + b)² este egal cu:', o: ['a² + b²', 'a² + ab + b²', 'a² + 2ab + b²', '2a + 2b'], a: 2, e: 'Formula de calcul prescurtat: (a + b)² = a² + 2ab + b².' },
          { q: '(x − 2)(x + 2) este egal cu:', o: ['x² − 4', 'x² + 4', 'x² − 4x + 4', 'x² − 2'], a: 0, e: '(a − b)(a + b) = a² − b², deci x² − 4.' },
          { q: 'Aria unui pătrat cu latura de 6 cm este:', o: ['24 cm²', '36 cm²', '12 cm²', '18 cm²'], a: 1, e: 'A = l² = 6² = 36 cm².' },
          { q: 'Un triunghi dreptunghic are catetele de 6 cm și 8 cm. Ipotenuza are:', o: ['10 cm', '14 cm', '12 cm', '9 cm'], a: 0, e: 'Teorema lui Pitagora: √(36 + 64) = √100 = 10 cm.' },
          { q: 'Volumul unui cub cu muchia de 3 cm este:', o: ['9 cm³', '18 cm³', '27 cm³', '54 cm³'], a: 2, e: 'V = l³ = 3³ = 27 cm³.' },
          { q: 'Diagonala unui cub cu muchia a este:', o: ['a√2', 'a√3', '2a', '3a'], a: 1, e: 'd = a√3 (din Pitagora aplicat de două ori).' },
          { q: 'Cel mai mare divizor comun al numerelor 12 și 18 este:', o: ['3', '6', '36', '2'], a: 1, e: '12 = 2²·3 și 18 = 2·3², deci c.m.m.d.c. = 2·3 = 6.' },
          { q: 'Mulțimea numerelor naturale x care verifică 2x + 1 < 7 este:', o: ['{0, 1, 2}', '{1, 2, 3}', '{0, 1, 2, 3}', '{3}'], a: 0, e: '2x < 6, deci x < 3. Numerele naturale: 0, 1, 2.' },
          { q: 'Pentru f(x) = 2x − 3, valoarea f(4) este:', o: ['8', '5', '11', '−5'], a: 1, e: 'f(4) = 2·4 − 3 = 5.' },
          { q: 'Suma măsurilor unghiurilor unui triunghi este:', o: ['90°', '180°', '270°', '360°'], a: 1, e: 'În orice triunghi, suma unghiurilor este 180°.' },
          { q: 'Fracția 3/4 exprimată în procente este:', o: ['34%', '60%', '75%', '80%'], a: 2, e: '3/4 = 0,75 = 75%.' },
          { q: 'Lungimea unui cerc cu raza de 5 cm este:', o: ['5π cm', '10π cm', '25π cm', '20π cm'], a: 1, e: 'L = 2πr = 2π·5 = 10π cm.' },
          { q: 'Aria unui disc cu raza de 3 cm este:', o: ['6π cm²', '9π cm²', '3π cm²', '12π cm²'], a: 1, e: 'A = πr² = 9π cm².' },
          { q: '|−7| + |3| este egal cu:', o: ['−4', '4', '10', '−10'], a: 2, e: 'Modulul este mereu pozitiv: 7 + 3 = 10.' },
          { q: 'Probabilitatea de a obține un număr par la aruncarea unui zar este:', o: ['1/6', '1/3', '1/2', '2/3'], a: 2, e: 'Cazuri favorabile: 2, 4, 6 (3 cazuri) din 6 posibile: 3/6 = 1/2.' },
          { q: 'Un tetraedru (piramidă triunghiulară) are:', o: ['4 muchii', '6 muchii', '8 muchii', '3 muchii'], a: 1, e: 'Tetraedrul are 4 fețe, 4 vârfuri și 6 muchii.' },
          { q: 'Volumul unui cilindru cu raza de 2 cm și înălțimea de 5 cm este:', o: ['10π cm³', '20π cm³', '25π cm³', '40π cm³'], a: 1, e: 'V = πr²h = π·4·5 = 20π cm³.' },
          { q: 'Media geometrică a numerelor 4 și 9 este:', o: ['6', '6,5', '13', '36'], a: 0, e: 'mg = √(4·9) = √36 = 6.' },
          { q: 'Dacă x/3 = 8/6, atunci x este:', o: ['2', '4', '6', '16'], a: 1, e: 'Produsul mezilor = produsul extremilor: 6x = 24, deci x = 4.' },
          { q: 'Numărul √2 aparține mulțimii:', o: ['ℕ', 'ℤ', 'ℚ', 'ℝ \\ ℚ'], a: 3, e: '√2 nu poate fi scris ca fracție: este număr irațional.' }
        ]
      }
    ]
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
