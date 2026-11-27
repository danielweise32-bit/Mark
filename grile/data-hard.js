// Mod HARD: întrebări mai grele, în stilul subiectelor de examen (mai mulți pași de rezolvare, capcane tipice).
// Sunt scrise pentru exersare și NU sunt copiate din subiectele oficiale.
// Cheia este id-ul materiei din data-en.js / data-bac.js.
(function (root) {
  root.GRILE = root.GRILE || {};
  root.GRILE.hard = {
    'en-mate': [
      { q: 'Dacă a + b = 7 și a·b = 10, atunci a² + b² este egal cu:', o: ['29', '49', '39', '69'], a: 0, e: 'a² + b² = (a + b)² − 2ab = 49 − 20 = 29.' },
      { q: 'Numărul √(3 − 2√2) este egal cu:', o: ['√2 − 1', '1 − √2', '√2 + 1', '√3 − √2'], a: 0, e: '(√2 − 1)² = 2 − 2√2 + 1 = 3 − 2√2, iar √2 − 1 > 0.' },
      { q: 'Media geometrică a numerelor a = √3 + 1 și b = √3 − 1 este:', o: ['√2', '2', '√3', '1'], a: 0, e: 'a·b = 3 − 1 = 2, deci m_g = √2.' },
      { q: 'Suma numerelor naturale n pentru care (2n + 7)/(n + 1) este număr natural este:', o: ['4', '0', '5', '6'], a: 0, e: '(2n + 7)/(n + 1) = 2 + 5/(n + 1), deci n + 1 ∈ {1, 5}, adică n ∈ {0, 4}. Suma = 4.' },
      { q: 'În cubul ABCDA′B′C′D′, măsura unghiului dreptelor AB′ și BC′ este:', o: ['60°', '45°', '90°', '30°'], a: 0, e: 'AB′ ∥ DC′, deci unghiul este ∠DC′B. Triunghiul BDC′ are laturile diagonale ale fețelor, deci este echilateral: 60°.' },
      { q: 'Un preț crește cu 20%, apoi noul preț scade cu 20%. Față de prețul inițial, prețul final:', o: ['scade cu 4%', 'rămâne același', 'crește cu 4%', 'scade cu 20%'], a: 0, e: '1,2 · 0,8 = 0,96, adică 96% din prețul inițial: scădere de 4%.' },
      { q: 'Funcția f(x) = ax + b are graficul care trece prin A(1, 3) și B(−1, −1). Valoarea f(2) este:', o: ['5', '3', '7', '4'], a: 0, e: 'a + b = 3 și −a + b = −1 ⇒ b = 1, a = 2. f(2) = 5.' },
      { q: 'Mulțimea soluțiilor reale ale inecuației |2x − 3| ≤ 5 este:', o: ['[−1, 4]', '(−1, 4)', '[−4, 1]', '[1, 4]'], a: 0, e: '−5 ≤ 2x − 3 ≤ 5 ⇒ −2 ≤ 2x ≤ 8 ⇒ −1 ≤ x ≤ 4.' },
      { q: 'Aria unui triunghi echilateral cu latura de 6 cm este:', o: ['9√3 cm²', '18√3 cm²', '36√3 cm²', '6√3 cm²'], a: 0, e: 'A = l²√3/4 = 36√3/4 = 9√3 cm².' },
      { q: 'Raza cercului circumscris unui triunghi dreptunghic cu catetele de 5 cm și 12 cm este:', o: ['6,5 cm', '13 cm', '6 cm', '8,5 cm'], a: 0, e: 'Ipotenuza = 13 cm; centrul cercului circumscris este mijlocul ipotenuzei, deci R = 6,5 cm.' },
      { q: 'O piramidă patrulateră regulată are latura bazei de 6 cm și înălțimea de 4 cm. Aria laterală este:', o: ['60 cm²', '96 cm²', '48 cm²', '120 cm²'], a: 0, e: 'Apotema piramidei = √(4² + 3²) = 5 cm. A_l = 4 · (6 · 5)/2 = 60 cm².' },
      { q: 'Dacă x² − 6x + 9 + y² + 4y + 4 = 0, atunci x + y este:', o: ['1', '5', '−1', '0'], a: 0, e: '(x − 3)² + (y + 2)² = 0 ⇒ x = 3 și y = −2, deci x + y = 1.' },
      { q: 'Cel mai mic număr natural care, împărțit pe rând la 6, la 8 și la 9, dă de fiecare dată restul 5 este:', o: ['77', '72', '149', '53'], a: 0, e: 'n − 5 este multiplu comun al lui 6, 8, 9; c.m.m.m.c. = 72, deci n = 77.' },
      { q: 'Se alege la întâmplare un număr de două cifre. Probabilitatea ca el să fie pătrat perfect este:', o: ['1/15', '1/9', '6/99', '1/10'], a: 0, e: 'Sunt 90 de numere de două cifre; pătrate perfecte: 16, 25, 36, 49, 64, 81 (6). P = 6/90 = 1/15.' }
    ],
    'en-romana': [
      { q: 'În fraza „Cine se aseamănă se adună.”, propoziția „Cine se aseamănă” este o subordonată:', o: ['subiectivă', 'predicativă', 'completivă directă', 'atributivă'], a: 0, e: 'Cine se adună? „Cine se aseamănă” – îndeplinește funcția de subiect pentru „se adună”.' },
      { q: 'În enunțul „Cartea lui e interesantă.”, cuvântul „lui” are funcția sintactică de:', o: ['atribut pronominal genitival', 'complement indirect', 'atribut adjectival', 'subiect'], a: 0, e: 'Pronumele personal în genitiv determină substantivul „cartea”: atribut pronominal genitival.' },
      { q: 'Cuvântul „chibrit” are:', o: ['7 litere și 6 sunete', '7 litere și 7 sunete', '6 litere și 6 sunete', '7 litere și 5 sunete'], a: 0, e: 'Grupul „ch” notează un singur sunet [k]: c-h-i-b-r-i-t = 7 litere, 6 sunete.' },
      { q: 'În enunțul „S-a întors acasă OBOSIT.”, cuvântul scris cu majuscule are funcția de:', o: ['element predicativ suplimentar', 'nume predicativ', 'atribut adjectival', 'complement circumstanțial de mod'], a: 0, e: 'Adjectivul se referă și la subiect, și la verbul predicativ „s-a întors”: element predicativ suplimentar.' },
      { q: 'Forma corectă a imperativului negativ, persoana a II-a singular, a verbului „a face” este:', o: ['nu face!', 'nu fă!', 'nu faci!', 'nu făcea!'], a: 0, e: 'Imperativul negativ de persoana a II-a singular are forma infinitivului: „nu face!”.' },
      { q: 'În enunțul „Au venit doi.”, numeralul „doi” are funcția sintactică de:', o: ['subiect', 'atribut adjectival', 'complement direct', 'nume predicativ'], a: 0, e: 'Cine au venit? „Doi” – numeral cu valoare substantivală, subiect.' },
      { q: 'În fraza „Pleacă unde vrea.”, propoziția subordonată este:', o: ['circumstanțială de loc', 'completivă directă', 'atributivă', 'subiectivă'], a: 0, e: 'Unde pleacă? „Unde vrea” – arată locul acțiunii.' },
      { q: 'În care enunț cuvântul „piatră” are sens figurat?', o: ['Are o inimă de piatră.', 'Casa este din piatră.', 'A aruncat o piatră în lac.', 'Drumul e pavat cu piatră.'], a: 0, e: '„Inimă de piatră” = om insensibil, nemilos: sens figurat.' },
      { q: 'Forma scrisă corect a imperativului „dă” urmat de pronumele „mi” și „l” este:', o: ['Dă-mi-l!', 'Dă-mil!', 'Dămi-l!', 'Dăm-il!'], a: 0, e: 'Verbul și cele două pronume neaccentuate se leagă prin cratimă: dă-mi-l.' },
      { q: 'În enunțul „Am citit cartea.”, subiectul este:', o: ['neexprimat, inclus', 'neexprimat, subînțeles', 'simplu, exprimat', 'inexistent'], a: 0, e: 'Desinența verbului „am citit” arată persoana I (eu): subiect inclus.' },
      { q: 'Forma verbală „cântase” este la modul indicativ, timpul:', o: ['mai-mult-ca-perfect', 'imperfect', 'perfect simplu', 'perfect compus'], a: 0, e: 'Sufixul „-se” este marca mai-mult-ca-perfectului.' },
      { q: 'Sinonimul cuvântului „a tergiversa” este:', o: ['a amâna', 'a grăbi', 'a explica', 'a încurca'], a: 0, e: '„A tergiversa” = a amâna intenționat rezolvarea unei probleme.' }
    ],
    'bac-romana': [
      { q: 'Cele două părți ale romanului „Ion” de Liviu Rebreanu se intitulează:', o: ['„Glasul pământului” și „Glasul iubirii”', '„Ultima noapte de dragoste” și „Întâia noapte de război”', '„Pământul” și „Iubirea”', '„Ana” și „Florica”'], a: 0, e: 'Titlurile exprimă cele două patimi care îl stăpânesc pe Ion.' },
      { q: 'În „Luceafărul”, Hyperion îi cere Demiurgului:', o: ['să-l dezlege de nemurire', 'să-i dea putere asupra lumii', 'să-l facă rege', 'să-i redea lumina'], a: 0, e: '„Și pentru toate dă-mi în schimb / O oră de iubire” – el cere să devină muritor.' },
      { q: 'În „O scrisoare pierdută”, personajul care folosește tot o scrisoare compromițătoare pentru a obține candidatura este:', o: ['Agamiță Dandanache', 'Nae Cațavencu', 'Zaharia Trahanache', 'Farfuridi'], a: 0, e: 'Dandanache păstrează scrisoarea „pentru altă dată” – variantă amplificată a lui Cațavencu.' },
      { q: 'Romanul „Ultima noapte de dragoste, întâia noapte de război” începe cu o discuție la popota ofițerilor despre:', o: ['dreptul soțului înșelat de a ucide', 'strategia războiului', 'filozofia lui Kant', 'moștenirea unchiului Tache'], a: 0, e: 'Discuția declanșează memoria involuntară a lui Gheorghidiu și relatarea căsniciei sale.' },
      { q: 'În „Enigma Otiliei”, Felix Sima este:', o: ['student la Medicină', 'student la Drept', 'avocat', 'ofițer'], a: 0, e: 'Felix, orfan, vine la Bucureștii lui moș Costache ca să studieze Medicina.' },
      { q: 'Romanul care începe cu „În Câmpia Dunării, cu câțiva ani înaintea celui de-al doilea război mondial, se pare că timpul era foarte răbdător cu oamenii” este:', o: ['„Moromeții”', '„Ion”', '„Baltagul”', '„Enigma Otiliei”'], a: 0, e: 'Este incipitul romanului lui Marin Preda.' },
      { q: 'În poezia lui Lucian Blaga, „lumina altora”, care „sugrumă vraja nepătrunsului ascuns”, corespunde cunoașterii:', o: ['paradisiace (logice)', 'luciferice (poetice)', 'mitice', 'empirice'], a: 0, e: '„Lumina mea” = cunoașterea luciferică, care sporește misterul; „lumina altora” = cunoașterea paradisiacă.' },
      { q: 'În „Testament” de Tudor Arghezi, cartea lăsată urmașilor este numită:', o: ['„hrisovul vostru cel dintâi”', '„plumbul”', '„corola de minuni”', '„oglinda”'], a: 0, e: '„Ea e hrisovul vostru cel dintâi” – cartea ca document de noblețe spirituală.' },
      { q: 'Motoul romanului „Baltagul” provine din:', o: ['balada „Miorița”', 'basmul „Harap-Alb”', 'Biblie', '„Letopisețul” lui Ion Neculce'], a: 0, e: '„Stăpâne, stăpâne, / Mai cheamă ș-un câne...” – romanul este considerat o replică la „Miorița”.' },
      { q: 'Neomodernismul în poezia românească este asociat cu:', o: ['generația anilor ’60', 'Junimea', 'Școala Ardeleană', 'pașoptiștii'], a: 0, e: 'Nichita Stănescu, Marin Sorescu, Ana Blandiana – revenirea la autonomia esteticului după realismul socialist.' },
      { q: 'Acțiunea din „O scrisoare pierdută” se petrece:', o: ['în timpul unei campanii electorale', 'în timpul Primului Război Mondial', 'la sat, la o nuntă', 'la curtea lui Lăpușneanu'], a: 0, e: '„În capitala unui județ de munte, în zilele noastre”, în timpul alegerilor.' },
      { q: '„Riga Crypto și lapona Enigel” este construită ca:', o: ['o baladă cultă, „nuntă” imposibilă între două lumi', 'un pastel de iarnă', 'o elegie despre moarte', 'o fabulă cu morală explicită'], a: 0, e: 'Riga Crypto (regele-ciupercă, lumea inferioară) și Enigel (ființa care aspiră spre soare) nu se pot uni.' }
    ],
    'bac-mate': [
      { q: 'lim (x → 0) sin(3x)/x este egală cu:', o: ['3', '1', '0', '1/3'], a: 0, e: 'sin(3x)/x = 3 · sin(3x)/(3x) → 3 · 1 = 3.' },
      { q: 'Numărul soluțiilor reale ale ecuației log₂ x + log₂(x − 2) = 3 este:', o: ['1', '2', '0', '3'], a: 0, e: 'x(x − 2) = 8 ⇒ x = 4 sau x = −2. Condiția x > 2 lasă doar x = 4.' },
      { q: '∫₀^(π/2) sin x dx este egală cu:', o: ['1', '0', 'π/2', '−1'], a: 0, e: '−cos x de la 0 la π/2 = −0 + 1 = 1.' },
      { q: 'Suma soluțiilor reale ale ecuației 4ˣ − 5·2ˣ + 4 = 0 este:', o: ['2', '5', '4', '0'], a: 0, e: 'Cu t = 2ˣ: t² − 5t + 4 = 0 ⇒ t ∈ {1, 4} ⇒ x ∈ {0, 2}. Suma = 2.' },
      { q: 'Determinantul matricei (1 2 3; 4 5 6; 7 8 9) este:', o: ['0', '1', '−3', '45'], a: 0, e: 'Linia a treia = 2·L2 − L1, liniile sunt dependente, deci det = 0.' },
      { q: 'Pentru z = 1 + i, modulul lui z²⁰ este:', o: ['1024', '2²⁰', '512', '20√2'], a: 0, e: '|z| = √2, deci |z²⁰| = (√2)²⁰ = 2¹⁰ = 1024.' },
      { q: 'Pentru f(x) = x·ln x, valoarea f′(1) este:', o: ['1', '0', 'e', '2'], a: 0, e: 'f′(x) = ln x + 1, deci f′(1) = 0 + 1 = 1.' },
      { q: 'Punctul de minim local al funcției f(x) = x³ − 3x este:', o: ['x = 1', 'x = −1', 'x = 0', 'x = √3'], a: 0, e: 'f′(x) = 3x² − 3 = 0 ⇒ x = ±1; f′ trece de la negativ la pozitiv în x = 1.' },
      { q: 'Aria suprafeței delimitate de graficul f(x) = x², axa Ox și dreptele x = 0, x = 3 este:', o: ['9', '27', '3', '6'], a: 0, e: '∫₀³ x² dx = x³/3 de la 0 la 3 = 9.' },
      { q: 'Coeficientul lui x² din dezvoltarea (1 + x)⁶ este:', o: ['15', '6', '20', '12'], a: 0, e: 'C₆² = 15.' },
      { q: 'Se alege un număr din {1, 2, …, 20}. Probabilitatea ca el să fie multiplu de 3 sau de 5 este:', o: ['9/20', '10/20', '8/20', '7/20'], a: 0, e: 'Multipli de 3: 6, de 5: 4, de 15: 1. Total 6 + 4 − 1 = 9.' },
      { q: 'Rangul matricei (1 2; 2 4) este:', o: ['1', '2', '0', '4'], a: 0, e: 'det = 0, dar matricea nu e nulă, deci rangul este 1.' },
      { q: 'lim (n → ∞) (1 + 1/n)²ⁿ este egală cu:', o: ['e²', 'e', '1', '2e'], a: 0, e: '[(1 + 1/n)ⁿ]² → e².' },
      { q: 'Inversul lui 3 față de înmulțirea modulo 7 (în ℤ₇) este:', o: ['5', '3', '2', '4'], a: 0, e: '3 · 5 = 15 = 2·7 + 1, adică 3 · 5 ≡ 1 (mod 7).' }
    ],
    'bac-istorie': [
      { q: 'Legea rurală a lui Alexandru Ioan Cuza, prin care țăranii au primit pământ, a fost adoptată în:', o: ['1864', '1859', '1866', '1921'], a: 0, e: 'Legea rurală din august 1864, după lovitura de stat din mai 1864.' },
      { q: 'Statutul Dezvoltător al Convenției de la Paris a fost adoptat în urma:', o: ['loviturii de stat a lui Cuza din mai 1864', 'abdicării lui Cuza', 'Războiului de Independență', 'Unirii din 1918'], a: 0, e: 'Statutul a întărit puterea domnitorului, fiind aprobat prin plebiscit.' },
      { q: 'Constituția din 1938 a consfințit:', o: ['regimul de autoritate monarhică al lui Carol al II-lea', 'regimul comunist', 'votul universal pentru femei și bărbați pentru prima dată', 'monarhia constituțională liberală'], a: 0, e: 'Puterea era concentrată în mâinile regelui; partidele au fost apoi dizolvate.' },
      { q: 'Prin Dictatul de la Viena (30 august 1940), România a cedat:', o: ['nord-vestul Transilvaniei Ungariei', 'Basarabia URSS', 'Cadrilaterul Bulgariei', 'Bucovina Austriei'], a: 0, e: 'Basarabia și nordul Bucovinei fuseseră cedate URSS în iunie 1940; Cadrilaterul – Bulgariei în septembrie 1940.' },
      { q: 'Prin Tratatul de la Berlin (1878), România:', o: ['a primit Dobrogea și a cedat Rusiei sudul Basarabiei', 'a primit Transilvania', 'a pierdut Dobrogea', 'a devenit regat'], a: 0, e: 'Independența a fost recunoscută cu aceste condiții; Regatul a fost proclamat abia în 1881.' },
      { q: 'Declarația din aprilie 1964 a Partidului Muncitoresc Român exprima:', o: ['distanțarea de Moscova („declarația de independență”)', 'aderarea la NATO', 'începerea colectivizării', 'abdicarea regelui'], a: 0, e: 'PMR afirma dreptul fiecărui partid de a-și stabili singur linia politică.' },
      { q: 'Unirea Basarabiei cu România a fost votată de Sfatul Țării la:', o: ['27 martie 1918', '28 noiembrie 1918', '1 decembrie 1918', '24 ianuarie 1859'], a: 0, e: 'Bucovina s-a unit la 28 noiembrie, Transilvania la 1 decembrie 1918.' },
      { q: 'La 23 august 1944, România:', o: ['a ieșit din alianța cu Germania, iar Ion Antonescu a fost arestat', 'a intrat în război alături de Germania', 'a semnat Tratatul de la Trianon', 'a devenit republică populară'], a: 0, e: 'Regele Mihai I a ordonat arestarea mareșalului; România a trecut de partea Națiunilor Unite.' }
    ],
    'bac-geografie': [
      { q: 'Cel mai lung defileu din Europa se află pe:', o: ['Dunăre, între Baziaș și Gura Văii', 'Olt, la Turnu Roșu', 'Mureș, între Deda și Toplița', 'Bistrița, la Bicaz'], a: 0, e: 'Defileul Dunării (aprox. 144 km) traversează Carpații.' },
      { q: 'Cel mai mare crater vulcanic din România se află în Munții:', o: ['Călimani', 'Harghita', 'Retezat', 'Apuseni'], a: 0, e: 'Craterul Călimanilor are un diametru de aproximativ 10 km.' },
      { q: 'Cel mai estic punct al României este localitatea:', o: ['Sulina', 'Zimnicea', 'Beba Veche', 'Horodiștea'], a: 0, e: 'Sud – Zimnicea, vest – Beba Veche, nord – Horodiștea.' },
      { q: 'Cel mai sudic punct al României se află lângă:', o: ['Zimnicea', 'Mangalia', 'Calafat', 'Giurgiu'], a: 0, e: 'Zimnicea, pe Dunăre (aprox. 43°37′ N).' },
      { q: 'Paralela care străbate teritoriul României este:', o: ['45° N', '30° N', '60° N', '0°'], a: 0, e: 'Paralela de 45° N, la jumătatea distanței dintre Ecuator și Polul Nord.' },
      { q: 'Cel mai mare lac din Europa (fără Marea Caspică) este:', o: ['Ladoga', 'Balaton', 'Geneva', 'Onega'], a: 0, e: 'Lacul Ladoga, din Rusia (aprox. 17.700 km²).' },
      { q: 'Fiordurile, văi glaciare invadate de mare, sunt specifice în special țărmului:', o: ['Norvegiei', 'Italiei', 'Spaniei', 'Greciei'], a: 0, e: 'Sunt rezultatul glaciației cuaternare.' },
      { q: 'Podișul Getic s-a format prin:', o: ['acumularea de pietrișuri și nisipuri aduse de râuri din Carpați', 'erupții vulcanice', 'încrețirea scoarței ca munții', 'acțiunea ghețarilor'], a: 0, e: 'Este un podiș piemontan, format din depozite sedimentare.' }
    ],
    'bac-biologie': [
      { q: 'La o frecvență cardiacă de 75 de bătăi pe minut, un ciclu cardiac durează:', o: ['0,8 s', '1 s', '0,6 s', '1,25 s'], a: 0, e: '60 s : 75 = 0,8 s.' },
      { q: 'La monohibridare cu dominanță completă (Aa × Aa), raportul de segregare fenotipică în F₂ este:', o: ['3 : 1', '1 : 2 : 1', '9 : 3 : 3 : 1', '1 : 1'], a: 0, e: 'Genotipic 1AA : 2Aa : 1aa; fenotipic 3 dominanți : 1 recesiv.' },
      { q: 'La dihibridare, raportul de segregare fenotipică în F₂ este:', o: ['9 : 3 : 3 : 1', '3 : 1', '1 : 2 : 1', '1 : 1 : 1 : 1'], a: 0, e: 'Combinarea independentă a două perechi de caractere (legea a II-a a lui Mendel).' },
      { q: 'O moleculă de ADN conține 30% adenină. Procentul de citozină este:', o: ['20%', '30%', '40%', '70%'], a: 0, e: 'A = T = 30% ⇒ G + C = 40% ⇒ C = 20%.' },
      { q: 'Codonul de inițiere a sintezei proteice este:', o: ['AUG', 'UAA', 'UGA', 'UAG'], a: 0, e: 'UAA, UAG și UGA sunt codoni stop.' },
      { q: 'Miopia se corectează cu lentile:', o: ['divergente', 'convergente', 'cilindrice obligatoriu', 'bifocale obligatoriu'], a: 0, e: 'La miopi imaginea se formează înaintea retinei; lentila divergentă o împinge pe retină.' },
      { q: 'Diabetul insipid este cauzat de deficitul de:', o: ['ADH (vasopresină)', 'insulină', 'tiroxină', 'adrenalină'], a: 0, e: 'Fără ADH, rinichii nu reabsorb apa: poliurie accentuată.' },
      { q: 'Volumul curent (aerul inspirat și expirat într-o respirație liniștită) este de aproximativ:', o: ['500 mL', '1500 mL', '3500 mL', '150 mL'], a: 0, e: 'Volumul curent ≈ 500 mL; capacitatea vitală ≈ 3500 mL.' }
    ],
    'bac-chimie': [
      { q: 'Numărul de moli de O₂ necesari arderii complete a unui mol de propan (C₃H₈) este:', o: ['5', '3', '4', '7'], a: 0, e: 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O.' },
      { q: 'Masa de NaOH dizolvată în 200 g de soluție de concentrație 10% este:', o: ['20 g', '10 g', '2 g', '180 g'], a: 0, e: 'm_d = c · m_s / 100 = 10 · 200 / 100 = 20 g.' },
      { q: 'Numărul de izomeri de catenă ai alcanului C₅H₁₂ este:', o: ['3', '2', '4', '5'], a: 0, e: 'n-pentan, izopentan (2-metilbutan) și neopentan (2,2-dimetilpropan).' },
      { q: 'pH-ul unei soluții de HCl de concentrație 0,01 mol/L este:', o: ['2', '1', '12', '0,01'], a: 0, e: 'Acid tare: [H₃O⁺] = 10⁻² mol/L ⇒ pH = 2.' },
      { q: 'Configurația electronică a sodiului (Z = 11) este:', o: ['1s² 2s² 2p⁶ 3s¹', '1s² 2s² 2p⁷', '1s² 2s² 2p⁵ 3s²', '1s² 2s² 2p⁶ 3p¹'], a: 0, e: 'Electronul distinctiv se află în orbitalul 3s.' },
      { q: 'Hibridizarea atomilor de carbon din etenă (CH₂=CH₂) este:', o: ['sp²', 'sp³', 'sp', 'nu sunt hibridizați'], a: 0, e: 'Carbonul implicat într-o dublă legătură este hibridizat sp².' },
      { q: 'Numărul de legături σ dintr-o moleculă de etenă este:', o: ['5', '6', '4', '1'], a: 0, e: '4 legături C–H și o legătură σ C–C; a doua legătură C–C este π.' },
      { q: 'Prin adiția HBr la propenă se obține, conform regulii lui Markovnikov, în principal:', o: ['2-bromopropan', '1-bromopropan', '1,2-dibromopropan', 'bromoetan'], a: 0, e: 'Hidrogenul se leagă la carbonul cu mai mulți H, iar bromul la carbonul central.' }
    ],
    'bac-fizica': [
      { q: 'Un corp este aruncat vertical în sus cu viteza de 20 m/s (g = 10 m/s²). Înălțimea maximă atinsă este:', o: ['20 m', '40 m', '10 m', '200 m'], a: 0, e: 'h_max = v₀²/(2g) = 400/20 = 20 m.' },
      { q: 'Pentru același corp (v₀ = 20 m/s, g = 10 m/s²), timpul de urcare este:', o: ['2 s', '4 s', '1 s', '20 s'], a: 0, e: 't = v₀/g = 2 s.' },
      { q: 'Într-o transformare izotermă a unui gaz ideal, presiunea se dublează. Volumul:', o: ['se înjumătățește', 'se dublează', 'rămâne constant', 'crește de 4 ori'], a: 0, e: 'p·V = const. (legea Boyle–Mariotte).' },
      { q: 'Randamentul unui motor Carnot care funcționează între 400 K și 300 K este:', o: ['25%', '75%', '33%', '100%'], a: 0, e: 'η = 1 − T_rece/T_cald = 1 − 300/400 = 0,25.' },
      { q: 'Doi rezistori de 2 Ω și 3 Ω sunt legați în serie la o sursă ideală de 10 V. Intensitatea curentului este:', o: ['2 A', '5 A', '0,5 A', '50 A'], a: 0, e: 'I = U/(R₁ + R₂) = 10/5 = 2 A.' },
      { q: 'Un obiect se află la 40 cm de o lentilă convergentă cu distanța focală de 20 cm. Imaginea se formează la:', o: ['40 cm, reală și răsturnată', '20 cm, virtuală', '10 cm, reală', 'infinit'], a: 0, e: '1/x₂ − 1/x₁ = 1/f ⇒ 1/x₂ = 1/20 − 1/40 = 1/40. Obiectul e la 2f, deci imaginea e la 2f.' },
      { q: 'Un corp se mișcă circular uniform cu 10 m/s pe un cerc cu raza de 5 m. Accelerația centripetă este:', o: ['20 m/s²', '2 m/s²', '50 m/s²', '0'], a: 0, e: 'a_cp = v²/r = 100/5 = 20 m/s².' },
      { q: 'Un corp alunecă fără frecare pe un plan înclinat cu 30° (g = 10 m/s²). Accelerația lui este:', o: ['5 m/s²', '10 m/s²', '8,66 m/s²', '0'], a: 0, e: 'a = g·sin 30° = 10 · 0,5 = 5 m/s².' }
    ],
    'bac-info': [
      { q: 'Câte numere de 3 cifre distincte se pot forma cu cifrele 1, 2, 3, 4?', o: ['24', '64', '12', '4'], a: 0, e: 'Aranjamente de 4 luate câte 3: 4 · 3 · 2 = 24.' },
      { q: 'Numărul minim de muchii pe care trebuie să le aibă un graf neorientat cu 6 noduri pentru a fi conex este:', o: ['5', '6', '15', '3'], a: 0, e: 'Un graf conex cu n noduri are cel puțin n − 1 muchii (cazul arborelui).' },
      { q: 'Pentru f(n) = (n < 2 ? n : f(n−1) + f(n−2)), valoarea f(6) este:', o: ['8', '5', '13', '6'], a: 0, e: 'Șirul lui Fibonacci: 0, 1, 1, 2, 3, 5, 8 ⇒ f(6) = 8.' },
      { q: 'Numărul maxim de noduri ale unui arbore binar cu nivelurile 0, 1, 2 și 3 este:', o: ['15', '8', '16', '7'], a: 0, e: '1 + 2 + 4 + 8 = 2⁴ − 1 = 15.' },
      { q: 'După secvența x = 1234; s = 0; while (x) { s = s*10 + x%10; x = x/10; } variabila s are valoarea:', o: ['4321', '10', '1234', '0'], a: 0, e: 'Algoritmul construiește oglinditul numărului.' },
      { q: 'Se generează în ordine lexicografică submulțimile cu 3 elemente ale mulțimii {1, 2, 3, 4, 5}. A patra soluție generată este:', o: ['{1, 3, 4}', '{1, 2, 5}', '{1, 3, 5}', '{2, 3, 4}'], a: 0, e: 'Ordinea: {1,2,3}, {1,2,4}, {1,2,5}, {1,3,4}…' },
      { q: 'Valoarea expresiei C++ 7/2*2 + 7%3 este:', o: ['7', '8', '6', '9'], a: 0, e: '7/2 = 3 (împărțire întreagă), 3*2 = 6, 7%3 = 1 ⇒ 7.' },
      { q: 'Într-o matrice pătratică n × n, cu liniile și coloanele numerotate de la 1, elementele a[i][j] de pe diagonala secundară respectă relația:', o: ['i + j = n + 1', 'i = j', 'i + j = n', 'i − j = 1'], a: 0, e: 'De exemplu, pentru n = 3: (1,3), (2,2), (3,1).' }
    ],
    'bac-logica': [
      { q: 'Din premisele „Toți M sunt P” și „Toți S sunt M” rezultă valid concluzia:', o: ['Toți S sunt P', 'Unii P nu sunt S', 'Niciun S nu este P', 'Toți P sunt S'], a: 0, e: 'Modul Barbara (AAA, figura I).' },
      { q: 'Dacă propoziția „Unii S nu sunt P” este adevărată, atunci „Toți S sunt P” este:', o: ['falsă', 'adevărată', 'nedeterminată', 'echivalentă'], a: 0, e: 'O și A sunt contradictorii: au valori de adevăr opuse.' },
      { q: 'Dacă propoziția de tip A este falsă, propoziția de tip E corespunzătoare este:', o: ['nedeterminată', 'adevărată', 'falsă', 'contradictorie cu O'], a: 0, e: 'Contrarele nu pot fi ambele adevărate, dar pot fi ambele false: din falsitatea lui A nu rezultă nimic despre E.' },
      { q: 'Formula ¬(p ∧ q) este echivalentă cu:', o: ['¬p ∨ ¬q', '¬p ∧ ¬q', 'p ∨ q', 'p → q'], a: 0, e: 'Legea lui De Morgan.' },
      { q: 'Contrapoziția implicației p → q este:', o: ['¬q → ¬p', 'q → p', '¬p → ¬q', 'p ∧ ¬q'], a: 0, e: 'Contrapoziția este echivalentă cu implicația inițială.' },
      { q: 'Din „Toți câinii sunt mamifere” și „Toate pisicile sunt mamifere” s-a concluzionat „Toate pisicile sunt câini”. Greșeala este:', o: ['termenul mediu nedistribuit', 'termen major ilicit', 'premise negative', 'patru termeni'], a: 0, e: '„Mamifere” este predicat în ambele premise afirmative, deci nu este distribuit niciodată.' }
    ],
    'bac-engleza': [
      { q: 'Hardly ___ the house when it started to rain.', o: ['had I left', 'I had left', 'I left', 'did I leave'], a: 0, e: 'După „Hardly” la început de propoziție urmează inversiunea, cu Past Perfect.' },
      { q: 'I wish I ___ harder last year.', o: ['had studied', 'studied', 'would study', 'have studied'], a: 0, e: 'Regret despre trecut: wish + Past Perfect.' },
      { q: 'He denied ___ the money.', o: ['having stolen', 'to steal', 'steal', 'to have stolen'], a: 0, e: '„Deny” este urmat de forma -ing; „having stolen” subliniază anterioritatea.' },
      { q: 'If she had taken the bus, she ___ late.', o: ['wouldn’t have been', 'won’t be', 'wouldn’t be', 'hadn’t been'], a: 0, e: 'Condiționalul de tip III: If + Past Perfect, would have + participiu.' },
      { q: 'The report is said ___ by a famous expert.', o: ['to have been written', 'to write', 'writing', 'to be writing'], a: 0, e: 'Construcție pasivă impersonală, cu acțiune anterioară: to have been + participiu.' },
      { q: 'It’s high time we ___ home.', o: ['went', 'go', 'will go', 'have gone'], a: 0, e: '„It’s (high) time” + Past Simple cu sens de prezent.' },
      { q: 'Not only ___ late, but he also forgot the tickets.', o: ['was he', 'he was', 'he is', 'did he was'], a: 0, e: '„Not only” la început de propoziție cere inversiune.' },
      { q: 'She suggested that he ___ a doctor.', o: ['see', 'sees', 'to see', 'seeing'], a: 0, e: 'După „suggest that” se folosește subjonctivul (forma de bază).' }
    ],
    'bac-economie': [
      { q: 'Prețul crește de la 10 la 12 lei, iar cantitatea cerută scade de la 100 la 80 de bucăți. Cererea este:', o: ['cu elasticitate unitară', 'elastică', 'inelastică', 'perfect inelastică'], a: 0, e: 'ΔQ% = 20%, ΔP% = 20% ⇒ coeficientul de elasticitate = 1.' },
      { q: 'Costul total este 500 lei, costul fix 200 lei, iar producția 100 de bucăți. Costul variabil mediu este:', o: ['3 lei', '5 lei', '2 lei', '7 lei'], a: 0, e: 'CV = 500 − 200 = 300; CVM = 300 / 100 = 3 lei.' },
      { q: 'O firmă vinde 50 de bucăți cu 10 lei bucata, iar costul total este 400 lei. Profitul este:', o: ['100 lei', '500 lei', '400 lei', '50 lei'], a: 0, e: 'VT = 500; Pr = 500 − 400 = 100 lei.' },
      { q: 'Indicele prețurilor este 120%. Rata inflației este:', o: ['20%', '120%', '12%', '1,2%'], a: 0, e: 'Rata inflației = indicele prețurilor − 100%.' },
      { q: 'Populația activă este de 10 milioane, iar numărul șomerilor de 1 milion. Rata șomajului este:', o: ['10%', '1%', '9%', '11%'], a: 0, e: 'Rata șomajului = șomeri / populația activă · 100.' },
      { q: 'Costul total crește de la 1000 la 1150 lei când producția crește de la 100 la 110 bucăți. Costul marginal este:', o: ['15 lei', '10 lei', '150 lei', '1,5 lei'], a: 0, e: 'Cmg = ΔCT/ΔQ = 150/10 = 15 lei.' }
    ],
    'bac-psihologie': [
      { q: 'Legea care exprimă relația dintre intensitatea stimulului și intensitatea senzației este legea:', o: ['Weber–Fechner', 'Yerkes–Dodson', 'Ebbinghaus', 'Zeigarnik'], a: 0, e: 'Senzația crește proporțional cu logaritmul intensității stimulului.' },
      { q: 'Capacitatea memoriei de scurtă durată este, după G. Miller, de aproximativ:', o: ['7 ± 2 elemente', '20 ± 5 elemente', '3 elemente', 'nelimitată'], a: 0, e: '„Numărul magic 7 plus sau minus 2”.' },
      { q: 'Teoria inteligențelor multiple aparține lui:', o: ['Howard Gardner', 'Alfred Binet', 'Jean Piaget', 'Daniel Goleman'], a: 0, e: 'Gardner descrie mai multe tipuri de inteligență: lingvistică, logico-matematică, muzicală etc.' },
      { q: 'Efectul Zeigarnik se referă la:', o: ['reținerea mai bună a sarcinilor neterminate', 'uitarea rapidă după învățare', 'influența grupului asupra opiniei', 'iluziile optice'], a: 0, e: 'Sarcinile întrerupte rămân mai bine în memorie decât cele finalizate.' },
      { q: 'Conform tipologiei lui Pavlov, temperamentul sangvinic corespunde tipului de sistem nervos:', o: ['puternic, echilibrat, mobil', 'puternic, neechilibrat', 'puternic, echilibrat, inert', 'slab'], a: 0, e: 'Coleric – puternic neechilibrat; flegmatic – puternic echilibrat inert; melancolic – slab.' },
      { q: 'Iluzia Müller-Lyer (segmente egale percepute inegal) ilustrează o eroare a:', o: ['percepției', 'memoriei', 'gândirii', 'voinței'], a: 0, e: 'Este o iluzie optico-geometrică.' }
    ],
    'bac-filosofie': [
      { q: '„Existența precede esența” este teza lui:', o: ['Jean-Paul Sartre', 'Platon', 'Immanuel Kant', 'Aristotel'], a: 0, e: 'Existențialismul lui Sartre: omul se definește prin propriile alegeri.' },
      { q: 'Definiția omului ca „animal politic” (zoon politikon) aparține lui:', o: ['Aristotel', 'Platon', 'Hobbes', 'Machiavelli'], a: 0, e: 'În „Politica”: omul își realizează natura doar în cetate.' },
      { q: 'Problema inducției (de ce ne așteptăm ca viitorul să semene cu trecutul) a fost formulată de:', o: ['David Hume', 'René Descartes', 'Platon', 'Jean-Paul Sartre'], a: 0, e: 'Hume arată că inducția nu poate fi justificată rațional fără un cerc vicios.' },
      { q: 'Teoria statului minimal a fost susținută de:', o: ['Robert Nozick', 'John Rawls', 'Karl Marx', 'Jean-Jacques Rousseau'], a: 0, e: '„Anarhie, stat și utopie” (1974).' },
      { q: 'În „Republica” lui Platon, cetatea ideală trebuie condusă de:', o: ['filosofi', 'războinici', 'negustori', 'adunarea tuturor cetățenilor'], a: 0, e: 'Filosofii-regi, cei care cunosc Ideea de Bine.' },
      { q: 'Lucrarea „Critica rațiunii pure” a fost scrisă de:', o: ['Immanuel Kant', 'Hegel', 'Descartes', 'Locke'], a: 0, e: 'Kant, 1781: limitele și condițiile cunoașterii.' }
    ],
    'bac-sociologie': [
      { q: 'Regula „faptele sociale trebuie tratate ca lucruri” aparține lui:', o: ['Émile Durkheim', 'Max Weber', 'Auguste Comte', 'Karl Marx'], a: 0, e: '„Regulile metodei sociologice” (1895).' },
      { q: 'Lucrarea „Etica protestantă și spiritul capitalismului” a fost scrisă de:', o: ['Max Weber', 'Émile Durkheim', 'Karl Marx', 'Dimitrie Gusti'], a: 0, e: 'Weber leagă valorile religioase de dezvoltarea economică.' },
      { q: 'Învățarea rolurilor pe care o persoană urmează să le îndeplinească în viitor se numește socializare:', o: ['anticipativă', 'primară', 'de resocializare', 'deviantă'], a: 0, e: 'Ex.: un student la medicină preia valorile profesiei de medic.' },
      { q: 'Familia formată din părinți și copiii lor necăsătoriți se numește:', o: ['familie nucleară', 'familie extinsă', 'familie monoparentală', 'grup secundar'], a: 0, e: 'Familia extinsă include și alte generații sau rude.' },
      { q: 'Pentru ca rezultatele unei anchete să poată fi generalizate, eșantionul trebuie să fie:', o: ['reprezentativ', 'cât mai mic', 'format din voluntari', 'ales după preferința cercetătorului'], a: 0, e: 'Eșantionul reprezentativ reproduce structura populației studiate.' },
      { q: 'La Karl Marx, criteriul principal al împărțirii societății în clase este:', o: ['raportul cu mijloacele de producție', 'nivelul de educație', 'religia', 'vârsta'], a: 0, e: 'Proprietarii mijloacelor de producție și cei care își vând forța de muncă.' }
    ]
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
