/* ============================================================
   jetozmrd.cz — DATA
   Veřejně doložitelná fakta. Žádné dojmy.
   Pozn.: data jsou demonstrační (beta). Citace odkazují na typ
   veřejného zdroje, ze kterého by se tvrzení doložilo.
   ============================================================ */
(function () {
  // ---- 6 dimenzí zmrdství (D-FENS zmrdologie, redukováno na 6 měřitelných os) ----
  const DIMENSIONS = [
    { key: 'lze',         q: 'Lže?',                  label: 'Lže',
      hint: 'Doložené nepravdivé a zavádějící výroky.',
      lit: 'Nepravdy doloženy.', clean: 'Bez záznamu nepravd.' },
    { key: 'penize',      q: 'Žije z cizích peněz?',  label: 'Cizí peníze',
      hint: 'Čerpání veřejných prostředků, dotace, střet zájmů.',
      lit: 'Žije z veřejných peněz.', clean: 'Veřejné peníze čisté.' },
    { key: 'prace',       q: 'Chodí do práce?',       label: 'Docházka',
      hint: 'Účast na hlasováních a jednáních dle záznamů.',
      lit: 'Do práce nechodí.', clean: 'Docházka v pořádku.' },
    { key: 'konzistence', q: 'Je konzistentní?',      label: 'Konzistence',
      hint: 'Otáčení kabátu, změny stran a postojů.',
      lit: 'Kabát otáčí.', clean: 'Postoje drží.' },
    { key: 'toxicita',    q: 'Chová se toxicky?',     label: 'Toxicita',
      hint: 'Urážky, dehonestace, šikana, výhružky.',
      lit: 'Chová se toxicky.', clean: 'Bez doložené toxicity.' },
    { key: 'zbabelost',   q: 'Je zbabělý?',           label: 'Zbabělost',
      hint: 'Vyhýbání se odpovědnosti, házení druhých přes palubu.',
      lit: 'Zbabělost doložena.', clean: 'Odpovědnosti se nevyhýbá.' },
  ];

  // ---- defaultní nálezy + citace pro dimenze (použito u kandidátů bez override) ----
  const PHRASE = {
    lze:        () => ({ text: 'Demagog.cz eviduje opakované nepravdivé či zavádějící výroky.',
                         src: [{ p: 'demagog.cz', t: 'Výroky — hodnocení pravdivosti', u: 'https://demagog.cz/' }] }),
    penize:     () => ({ text: 'V registrech doloženo čerpání veřejných prostředků a smluv.',
                         src: [{ p: 'hlidacstatu.cz', t: 'Profil — dotace a veřejné zakázky', u: 'https://www.hlidacstatu.cz/' }] }),
    prace:      () => ({ text: 'Záznamy o hlasování vykazují nadprůměrnou neúčast.',
                         src: [{ p: 'psp.cz', t: 'Záznam účasti na hlasováních', u: 'https://www.psp.cz/' }] }),
    konzistence:() => ({ text: 'Doložena změna stranické příslušnosti nebo otočka v klíčovém postoji.',
                         src: [{ p: 'kohovolit.eu', t: 'Hlasovací a stranická historie', u: 'https://www.kohovolit.eu/' }] }),
    toxicita:   () => ({ text: 'Doloženy dehonestující či urážlivé výroky vůči konkrétním osobám.',
                         src: [{ p: 'mediální archiv', t: 'Záznam výroku', u: 'https://www.irozhlas.cz/' }] }),
    zbabelost:  () => ({ text: 'Doloženo přenášení viny na podřízené a vyhýbání se odpovědnosti.',
                         src: [{ p: 'mediální archiv', t: 'Reportáž ke kauze', u: 'https://www.irozhlas.cz/' }] }),
  };

  function categoryFor(n) {
    return [
      'Není zmrd', 'Jedna skvrna', 'Hraniční případ', 'Potvrzený zmrd',
      'Plnokrevný zmrd', 'Systémový zmrd', 'Učebnicový zmrd',
    ][n];
  }
  // verdict tier -> css class
  function tier(n) {
    if (n === 0) return 'v-0';
    if (n <= 1) return 'v-low';
    if (n <= 3) return 'v-mid';
    return 'v-high';
  }

  // build a full dims object from a list of lit keys + optional overrides
  function buildDims(litKeys, overrides) {
    overrides = overrides || {};
    const out = {};
    DIMENSIONS.forEach((d) => {
      const isLit = litKeys.includes(d.key);
      if (isLit) {
        const o = overrides[d.key];
        const base = PHRASE[d.key]();
        out[d.key] = {
          lit: true,
          finding: (o && o.text) || base.text,
          sources: (o && o.src) || base.src,
        };
      } else {
        out[d.key] = { lit: false, finding: (overrides[d.key] && overrides[d.key].text) || d.clean, sources: [] };
      }
    });
    return out;
  }

  function person(p) {
    const lit = p.lit || [];
    const score = p.gray ? null : lit.length;
    return Object.assign({
      score,
      category: p.category || (p.gray ? 'Šedá zóna' : categoryFor(lit.length)),
      tier: p.gray ? 'v-gray' : tier(lit.length),
      dims: buildDims(lit, p.overrides),
    }, p);
  }

  // src helpers
  const S = (p, t, u) => ({ p, t, u });

  /* =========================================================
     HEADLINEŘI — beta testování (12 osob z popisu projektu)
     Tvrzení vázána na obecně známé, veřejně doložené záležitosti.
     ========================================================= */
  const HEADLINERS = [
    person({
      id: 'babis', name: 'Andrej Babiš', party: 'ANO', role: 'premiér, předseda hnutí',
      scope: 'celostátní', photo: 'assets/babis-portret.jpg',
      dictum: 'Učebnicový případ z hlediska zmrdologie: jediná čistá osa je docházka — protože do práce, kde se rozhodují dotace, chodí velmi rád.',
      lit: ['lze', 'penize', 'konzistence', 'toxicita', 'zbabelost'],
      category: 'Systémový zmrd',
      overrides: {
        lze:    { text: 'Demagog.cz dlouhodobě eviduje vysoký podíl nepravdivých a zavádějících výroků.',
                  src: [S('demagog.cz', 'Výroky Andreje Babiše', 'https://demagog.cz/'), S('hlidacstatu.cz', 'Veřejné výroky', 'https://www.hlidacstatu.cz/')] },
        penize: { text: 'Audit Evropské komise (2021) konstatoval střet zájmů u koncernu Agrofert čerpajícího dotace; kauza Čapí hnízdo řešena soudem.',
                  src: [S('Evropská komise', 'Audit střetu zájmů (2021)', 'https://ec.europa.eu/'), S('hlidacstatu.cz', 'Dotace koncernu Agrofert', 'https://www.hlidacstatu.cz/'), S('justice.cz', 'Kauza Čapí hnízdo', 'https://justice.cz/')] },
        prace:  { text: 'Jediná osa bez záznamu — jako premiér i poslanec vykazoval vysokou aktivitu.' },
        konzistence: { text: 'Soudní spory o evidenci ve svazcích StB; doložené názorové obraty napříč obdobími.',
                  src: [S('justice.cz', 'Spor o evidenci StB', 'https://justice.cz/'), S('demagog.cz', 'Archiv postojů', 'https://demagog.cz/')] },
        toxicita: { text: 'Opakované dehonestující výroky vůči novinářům a politickým oponentům (mediální archiv).',
                  src: [S('mediální archiv', 'Výroky vůči novinářům', 'https://www.irozhlas.cz/')] },
        zbabelost: { text: 'V kauze Čapí hnízdo přenesení dotace na rodinné příslušníky; vyhýbání se osobní odpovědnosti.',
                  src: [S('mediální archiv', 'Čapí hnízdo — rodinní příslušníci', 'https://www.irozhlas.cz/')] },
      },
    }),
    person({
      id: 'turek', name: 'Filip Turek', party: 'Motoristé sobě', role: 'europoslanec',
      scope: 'celostátní', photo: 'assets/turek-1.jpg', photoPos: '57% 46%',
      gallery: [
        { img: 'assets/turek-1.jpg', caption: 'Filip Turek hajluje z kabrioletu. On tvrdí, že jen mává.' },
        { img: 'assets/turek-2.jpg', caption: 'Filip Turek hledá v hospodě zapomenutý mobil.' },
        { img: 'assets/turek-3.jpg', caption: 'Filip Turek si gratuluje, jak porazil dítě.' },
      ],
      dictum: 'Exhibice je forma sdělení. Když pak musíš sdělené popírat, máš problém s konzistencí i se zbabělostí najednou.',
      lit: ['lze', 'prace', 'konzistence', 'toxicita', 'zbabelost'],
      category: 'Exhibicionistický zmrd',
      overrides: {
        toxicita: { text: 'Investigace (Deník N, 2025) zveřejnila sérii rasistických a extremistických příspěvků z jeho profilů.',
                  src: [S('Deník N', 'Investigace příspěvků (2025)', 'https://denikn.cz/')] },
        lze: { text: 'Autorství příspěvků nejprve popíral, část později relativizoval.',
                  src: [S('Deník N', 'Reakce a popření', 'https://denikn.cz/'), S('demagog.cz', 'Výroky', 'https://demagog.cz/')] },
        konzistence: { text: 'Opakované stranické a názorové přesuny; relativizace dřívějších postojů.',
                  src: [S('kohovolit.eu', 'Politická historie', 'https://www.kohovolit.eu/')] },
        zbabelost: { text: 'Odpovědnost přenášena na „zneužití účtu" a třetí osoby.',
                  src: [S('Deník N', 'Vysvětlení autorství', 'https://denikn.cz/')] },
        prace: { text: 'Záznamy Evropského parlamentu vykazují nízkou účast na hlasováních.',
                  src: [S('kohovolit.eu', 'Účast v EP', 'https://www.kohovolit.eu/')] },
      },
    }),
    person({
      id: 'okamura', name: 'Tomio Okamura', party: 'SPD', role: 'předseda hnutí',
      scope: 'celostátní', photo: 'assets/okamura-2.jpg', photoPos: '46% 30%',
      gallery: [
        { img: 'assets/okamura-1.jpg', caption: 'Tomio má rád bichty.' },
        { img: 'assets/okamura-2.jpg', caption: 'Tomio ukazuje velikost svého pindíka.' },
        { img: 'assets/okamura-3.jpg', caption: 'Tomio se modlí, aby se nedostal do politiky.' },
        { img: 'assets/okamura-4.jpg', caption: 'Tomio jako hrdý český vlastenec.' },
      ],
      dictum: 'Populista potřebuje nepřítele a krátkou paměť. Obojí dodává spolehlivě.',
      lit: ['lze', 'konzistence', 'toxicita', 'zbabelost'],
      category: 'Populistický zmrd',
      overrides: {
        lze: { text: 'Demagog.cz eviduje vysoký podíl nepravdivých výroků, zejména k migraci a EU.',
                  src: [S('demagog.cz', 'Výroky Tomia Okamury', 'https://demagog.cz/')] },
        toxicita: { text: 'Soudně řešené protiimigrační kampaně a dehonestující rétorika vůči menšinám.',
                  src: [S('justice.cz', 'Soudní řízení ke kampaním', 'https://justice.cz/'), S('mediální archiv', 'Kampaň SPD', 'https://www.irozhlas.cz/')] },
        konzistence: { text: 'Zakládání a obměna politických projektů (Úsvit → SPD) při zachování rétoriky.',
                  src: [S('kohovolit.eu', 'Politická historie', 'https://www.kohovolit.eu/')] },
        zbabelost: { text: 'Distancování se od vlastních kandidátů po vypuknutí skandálů.',
                  src: [S('mediální archiv', 'Distancování od kandidátů', 'https://www.irozhlas.cz/')] },
      },
    }),
    person({
      id: 'malacova', name: 'Jana Maláčová', party: 'SOCDEM', role: 'předsedkyně strany',
      scope: 'celostátní',
      dictum: 'Oportunismus není přesvědčení, je to navigace. Otázka je, jestli řídí ona, nebo průzkumy.',
      lit: ['lze', 'prace', 'konzistence', 'toxicita'],
      category: 'Oportunistický zmrd',
      overrides: {
        lze: { text: 'Demagog.cz eviduje zavádějící výroky k sociálním tématům.',
                  src: [S('demagog.cz', 'Výroky', 'https://demagog.cz/')] },
        prace: { text: 'V některých obdobích podprůměrná účast na hlasováních dle záznamů.',
                  src: [S('psp.cz', 'Účast na hlasováních', 'https://www.psp.cz/')] },
        konzistence: { text: 'Doložené koaliční a názorové obraty podle aktuální politické situace.',
                  src: [S('kohovolit.eu', 'Postoje a hlasování', 'https://www.kohovolit.eu/')] },
        toxicita: { text: 'Doložené ostré osobní útoky vůči vnitrostranickým oponentům.',
                  src: [S('mediální archiv', 'Vnitrostranické spory', 'https://www.irozhlas.cz/')] },
      },
    }),
    person({
      id: 'konecna', name: 'Kateřina Konečná', party: 'Stačilo! / KSČM', role: 'předsedkyně',
      scope: 'celostátní',
      dictum: 'Hraniční případ. Tři osy svítí, tři ne — zmrdometr nehodnotí ideologii, jen chování.',
      lit: ['lze', 'konzistence', 'toxicita'],
      category: 'Hraniční',
      overrides: {
        lze: { text: 'Demagog.cz eviduje zavádějící výroky k EU a zahraniční politice.',
                  src: [S('demagog.cz', 'Výroky', 'https://demagog.cz/')] },
        konzistence: { text: 'Spojování a přejmenovávání politických projektů před volbami.',
                  src: [S('kohovolit.eu', 'Politická historie', 'https://www.kohovolit.eu/')] },
        toxicita: { text: 'Doložené ostré dehonestující výroky vůči oponentům.',
                  src: [S('mediální archiv', 'Výroky', 'https://www.irozhlas.cz/')] },
      },
    }),
    person({
      id: 'rakusan', name: 'Vít Rakušan', party: 'STAN', role: 'předseda, exministr vnitra',
      scope: 'celostátní', gray: true,
      dictum: 'Šedá zóna. Kauza Dozimetr je selhání řízení hnutí, nikoli prokázané osobní zmrdství. Manažerská chyba ≠ zmrd.',
      lit: [],
      category: 'Manažerské selhání',
      overrides: {
        zbabelost: { text: 'V kauze Dozimetr kritizováno pomalé vyvození personální odpovědnosti.',
                  src: [S('mediální archiv', 'Kauza Dozimetr', 'https://www.irozhlas.cz/')] },
      },
    }),
    person({
      id: 'pavel', name: 'Petr Pavel', party: 'nestraník', role: 'prezident republiky',
      scope: 'celostátní',
      dictum: 'Jedna skvrna. Členství v KSČ a předlistopadová zpravodajská minulost jsou doložené — zbytek os je čistý.',
      lit: ['konzistence'],
      category: 'Jedna skvrna',
      overrides: {
        konzistence: { text: 'Členství v KSČ a absolvování zpravodajského kurzu před rokem 1989 (vojenská minulost).',
                  src: [S('mediální archiv', 'Vojenská a stranická minulost', 'https://www.irozhlas.cz/')] },
      },
    }),
    person({
      id: 'fiala', name: 'Petr Fiala', party: 'ODS', role: 'předseda, expremiér',
      scope: 'celostátní',
      dictum: 'Žádný záznam zmrdství. Slabost ve vedení a komunikaci není zmrdství — je to jen slabost. Zmrdometr ji neměří.',
      lit: [], category: 'Slabý lídr (není zmrd)',
    }),
    person({
      id: 'bartos', name: 'Ivan Bartoš', party: 'Piráti', role: 'exministr pro digitalizaci',
      scope: 'celostátní',
      dictum: 'Není zmrd. Nezvládnutá digitalizace stavebního řízení je odborné selhání, ne charakterová vada.',
      lit: [], category: 'Není zmrd',
    }),
    person({
      id: 'hrib', name: 'Zdeněk Hřib', party: 'Piráti', role: 'exprimátor Prahy',
      scope: 'celostátní',
      dictum: 'Není zmrd, ale má hrany. Konfliktnost a tvrdohlavost nejsou zmrdství, pokud nejde o lež, krádež ani zradu.',
      lit: [], category: 'Není zmrd (má hrany)',
    }),
    person({
      id: 'foltyn', name: 'Otakar Foltýn', party: '—', role: 'vládní zmocněnec pro strategickou komunikaci',
      scope: 'celostátní',
      dictum: 'Není zmrd. Není ani politik. Testováno omylem, ponecháno pro pořádek.',
      lit: [], category: 'Není zmrd (není ani politik)',
    }),
    person({
      id: 'mersmid', name: 'Mesršmíd', party: '—', role: 'údajná osoba',
      scope: 'celostátní',
      dictum: 'Viz Foltýn. Není zmrd, není politik, není jisté, že existuje. Edge case ponechán z úcty k beta testu.',
      lit: [], category: 'Není zmrd (viz Foltýn)',
    }),
  ];

  /* =========================================================
     SENÁTNÍ OBVODY — volby 2026
     Senátních obvodů je 81, číslovaných cca od západu na východ;
     každý sudý rok se volí třetina (27). V roce 2026 se volí
     obvody s číslem dělitelným třemi (3, 6, … 81); 1. kolo 9.–10. 10. 2026.
     Zdroj: senat.cz, Wikipedie (Volby do Senátu 2026).
     Poloha = orientační kartogram (grid 9×6, západ→východ).
     ========================================================= */
  const OBVODY = [
    { num: 3,  city: 'Cheb',             kraj: 'Karlovarský',     x: 12,  y: 66 },
    { num: 9,  city: 'Plzeň-město',      kraj: 'Plzeňský',        x: 33,  y: 92 },
    { num: 6,  city: 'Louny',            kraj: 'Ústecký',         x: 50,  y: 56 },
    { num: 33, city: 'Děčín',            kraj: 'Ústecký',         x: 47,  y: 36 },
    { num: 36, city: 'Česká Lípa',       kraj: 'Liberecký',       x: 80,  y: 42 },
    { num: 30, city: 'Kladno',           kraj: 'Středočeský',     x: 60,  y: 64 },
    { num: 18, city: 'Příbram',          kraj: 'Středočeský',     x: 62,  y: 90 },
    { num: 27, city: 'Praha 1',          kraj: 'Praha',           x: 70,  y: 66 },
    { num: 21, city: 'Praha 5',          kraj: 'Praha',           x: 66,  y: 71 },
    { num: 24, city: 'Praha 9',          kraj: 'Praha',           x: 74,  y: 65 },
    { num: 15, city: 'Pelhřimov',        kraj: 'Vysočina',        x: 97,  y: 101 },
    { num: 12, city: 'Strakonice',       kraj: 'Jihočeský',       x: 55,  y: 112 },
    { num: 54, city: 'Znojmo',           kraj: 'Jihomoravský',    x: 116, y: 118 },
    { num: 39, city: 'Trutnov',          kraj: 'Královéhradecký', x: 110, y: 46 },
    { num: 42, city: 'Kolín',            kraj: 'Středočeský',     x: 88,  y: 72 },
    { num: 51, city: 'Žďár n. Sáz.',     kraj: 'Vysočina',        x: 112, y: 95 },
    { num: 60, city: 'Brno-město',       kraj: 'Jihomoravský',    x: 128, y: 109 },
    { num: 48, city: 'Rychnov n. Kn.',   kraj: 'Královéhradecký', x: 119, y: 53 },
    { num: 45, city: 'Hradec Králové',   kraj: 'Královéhradecký', x: 106, y: 59 },
    { num: 63, city: 'Přerov',           kraj: 'Olomoucký',       x: 150, y: 92 },
    { num: 57, city: 'Vyškov',           kraj: 'Jihomoravský',    x: 138, y: 104 },
    { num: 75, city: 'Karviná',          kraj: 'Moravskoslezský', x: 186, y: 69 },
    { num: 66, city: 'Olomouc',          kraj: 'Olomoucký',       x: 152, y: 80 },
    { num: 72, city: 'Ostrava',          kraj: 'Moravskoslezský', x: 176, y: 72 },
    { num: 69, city: 'Frýdek-Místek',    kraj: 'Moravskoslezský', x: 177, y: 84 },
    { num: 78, city: 'Zlín',             kraj: 'Zlínský',         x: 162, y: 110 },
    { num: 81, city: 'Uherské Hradiště', kraj: 'Zlínský',         x: 152, y: 117 },
  ];

  /* =========================================================
     SENÁTNÍ KANDIDÁTI po obvodech (demonstrační, fiktivní osoby)
     Generováno deterministicky; každý rozsvícený atribut má citaci.
     ========================================================= */
  let _uid = 0;
  function sen(obNum, name, party, lit, female, opts) {
    opts = opts || {};
    const id = 'sen-' + obNum + '-' + (_uid++);
    return person(Object.assign({
      id, name, party, obvod: obNum, scope: 'senát',
      role: 'kandidát' + (female ? 'ka' : '') + ' do Senátu',
      lit, dictum: opts.dictum || null,
    }, opts));
  }

  const FIRST_M = ['Jan', 'Petr', 'Tomáš', 'Martin', 'Jiří', 'Pavel', 'Josef', 'Václav', 'Michal', 'Zdeněk', 'Ondřej', 'Lukáš', 'Radek', 'Marek', 'David', 'Aleš', 'Roman', 'Vít', 'Stanislav', 'Bohumil'];
  const FIRST_F = ['Jana', 'Eva', 'Hana', 'Lenka', 'Marie', 'Lucie', 'Petra', 'Klára', 'Veronika', 'Alena', 'Ivana', 'Tereza', 'Kateřina', 'Markéta', 'Dana', 'Simona', 'Barbora', 'Zuzana'];
  const SUR_M = ['Novák', 'Svoboda', 'Dvořák', 'Černý', 'Procházka', 'Kučera', 'Veselý', 'Horák', 'Pokorný', 'Pospíšil', 'Hájek', 'Jelínek', 'Král', 'Růžička', 'Sedláček', 'Zeman', 'Kolář', 'Navrátil', 'Čermák', 'Urban', 'Blažek', 'Kříž', 'Holub', 'Soukup', 'Vlček', 'Šimek', 'Kratochvíl', 'Tichý', 'Roubal', 'Brabec'];
  const SUR_F = ['Nováková', 'Svobodová', 'Dvořáková', 'Černá', 'Procházková', 'Kučerová', 'Veselá', 'Horáková', 'Pokorná', 'Pospíšilová', 'Hájková', 'Jelínková', 'Králová', 'Růžičková', 'Sedláčková', 'Kolářová', 'Navrátilová', 'Čermáková', 'Urbanová', 'Blažková', 'Holubová', 'Soukupová', 'Vlčková', 'Šimková', 'Kratochvílová', 'Tichá', 'Marešová', 'Coufalová'];
  const PARTIES = ['ANO', 'ODS', 'STAN', 'Piráti', 'SPD', 'KDU-ČSL', 'SOCDEM', 'Přísaha', 'Motoristé sobě', 'nezávislý'];
  const LIT_SETS = [
    [], [], ['konzistence'], ['penize', 'konzistence'], ['lze', 'toxicita'],
    ['penize', 'prace', 'zbabelost'], ['lze', 'penize', 'konzistence'],
    ['lze', 'toxicita', 'zbabelost'], ['lze', 'penize', 'konzistence', 'toxicita'],
    ['penize', 'prace', 'konzistence', 'toxicita'], ['lze', 'penize', 'prace', 'konzistence', 'toxicita'],
  ];

  const SENAT = [];
  OBVODY.forEach((ob) => {
    const k = ob.num / 3;
    const count = 2 + (k % 2);  // střídá 2 a 3 kandidáty
    for (let i = 0; i < count; i++) {
      const female = (ob.num + i) % 5 < 2;
      const fn = female ? FIRST_F : FIRST_M;
      const sn = female ? SUR_F : SUR_M;
      const name = fn[(ob.num * 3 + i * 7) % fn.length] + ' ' + sn[(ob.num * 5 + i * 11) % sn.length];
      const party = PARTIES[(ob.num + i * 4) % PARTIES.length];
      const lit = LIT_SETS[(k + i * 4) % LIT_SETS.length];
      SENAT.push(sen(ob.num, name, party, lit, female));
    }
  });

  const ALL = HEADLINERS.concat(SENAT);
  const byId = {};
  ALL.forEach((p) => { byId[p.id] = p; });

  const obvodById = {};
  OBVODY.forEach((o) => { obvodById[o.num] = o; });

  // candidates per obvod, sorted worst-first
  function candidatesForObvod(num) {
    return SENAT.filter((p) => p.obvod === num)
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }
  // heat for map tile = max score among candidates
  function obvodHeat(num) {
    const c = candidatesForObvod(num);
    return c.length ? Math.max(...c.map((p) => p.score || 0)) : 0;
  }
  // heat for a whole kraj region = max score among its obvody
  function krajHeat(krajName) {
    const nums = OBVODY.filter((o) => o.kraj === krajName).map((o) => o.num);
    return nums.length ? Math.max(...nums.map((n) => obvodHeat(n))) : 0;
  }

  // easter eggs for search
  const EGGS = {
    navrkal: {
      name: 'Navrkal',
      msg: 'Edge case. Po 2 letech v politice nedostatek dat. Vrátil se k datům, takže zřejmě v pořádku. 0/6.',
    },
  };

  window.ZMRD = {
    DIMENSIONS, OBVODY, obvodById, HEADLINERS, SENAT, ALL, byId,
    candidatesForObvod, obvodHeat, krajHeat, categoryFor, tier, EGGS,
  };
})();
