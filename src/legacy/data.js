/* ============================================================
   jetozmrd.cz — DATA
   Veřejně doložitelná fakta. Žádné dojmy.
   Hodnoceno metodikou zmrdobijci (6 měřitelných os + D-FENS filtr).
   Každá rozsvícená osa má konkrétní citaci na veřejný zdroj.
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
     HEADLINEŘI — celostátní politici a veřejné osobnosti
     Hodnoceno metodikou zmrdobijci. Babiš, Turek a Okamura mají
     vlastní fotogalerie; ostatní profilové foto z Wikimedia Commons.
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
      id: 'havlicek', name: 'Karel Havlíček', party: 'ANO',
      role: 'exvicepremiér a exministr průmyslu a obchodu / dopravy, místopředseda hnutí ANO',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Karel_Havl%C3%AD%C4%8Dek_akademicky-snem-duben-2026_03_%28cropped%29.jpg/500px-Karel_Havl%C3%AD%C4%8Dek_akademicky-snem-duben-2026_03_%28cropped%29.jpg',
      dictum: 'Devět dní před odchodem z resortu stihl podepsat to, co jeho náměstek odmítl kvůli střetu zájmů — a pak v Bruselu hájil, že žádný střet zájmů neexistuje.',
      lit: ['penize'],
      overrides: {
        penize: { text: 'Jako ministr průmyslu podepsal kompenzace za drahé energie čtyřem firmám z Babišova holdingu Agrofert (Synthesia, Precheza, Deza, Lovochemie) v celkové výši zhruba 49,4 mil. Kč. Podpisy provedl devět dní před svým odchodem z ministerstva poté, co je jeho náměstek Eduard Muřický odmítl kvůli obavám ze střetu zájmů. Ředitel Transparency International Petr Leyer uvedl, že firmy na kompenzace neměly podle zákona o střetu zájmů nárok a že Havlíček porušil zákon.', src: [S('mediální archiv', 'Seznam Zprávy: Šéf Transparency: Havlíček pomohl Agrofertu a porušil zákon', 'https://www.seznamzpravy.cz/clanek/domaci-babis-sef-transparency-havlicek-pomohl-agrofertu-a-porusil-zakon-197473'), S('mediální archiv', 'Seznam Zprávy: Babišovy firmy žádaly o náhradu za drahou elektřinu, pomohl Havlíček', 'https://www.seznamzpravy.cz/clanek/domaci-politika-babisovy-firmy-zadaly-o-nahradu-za-drahou-elektrinu-pomohl-havlicek-197212')] },
        lze: { text: 'Demagog.cz u Havlíčka eviduje 15 výroků hodnocených jako nepravda a 4 jako zavádějící (vedle 93 pravdivých) — opakované, ale ne převažující nepravdivé výroky, např. o slibu výstavby plynových elektráren či o generaci letounů Gripen.' },
        konzistence: { text: 'Opakovaně a kategoricky popíral existenci střetu zájmů Andreje Babiše, který evropské audity konstatovaly; postoj hájil i na jednání ministrů EU v Bruselu.' },
      },
    }),
    person({
      id: 'schillerova', name: 'Alena Schillerová', party: 'ANO',
      role: 'ministryně financí, místopředsedkyně hnutí ANO, šéfka poslaneckého klubu',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Schillerov%C3%A1_Raku%C5%A1an_2023_%28cropped%29.jpg/500px-Schillerov%C3%A1_Raku%C5%A1an_2023_%28cropped%29.jpg',
      dictum: 'U čísel, na nichž stojí její odbornost, sahá k nepravdě a zavádění natolik soustavně, že to už není přeřek, ale metoda.',
      lit: ['lze'],
      overrides: {
        lze: { text: 'Demagog.cz u Schillerové eviduje 18 výroků hodnocených jako nepravda a 22 jako zavádějící (vedle 96 pravdivých) — soustavné nepravdivé a zavádějící výroky, typicky u rozpočtových a daňových dat, např. nepravdivé tvrzení o chybějících zákonných přílohách rozpočtu 2026 nebo zavádějící líčení historie zavedení EET.', src: [S('demagog.cz', 'Profil Aleny Schillerové — statistika ověřených výroků', 'https://demagog.cz/politici/alena-schillerova-495')] },
      },
    }),
    person({
      id: 'vondracek', name: 'Radek Vondráček', party: 'ANO',
      role: 'expředseda Poslanecké sněmovny, poslanec',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Radek_Vondr%C3%A1%C4%8Dek_2019_%28cropped%29.jpg/500px-Radek_Vondr%C3%A1%C4%8Dek_2019_%28cropped%29.jpg',
      dictum: 'Vztyčený prostředníček z předsednického křesla i cesta za sankcionovanými v Moskvě — a pokaždé to byla jen nadsázka a hledání řešení.',
      lit: [],
      overrides: {
        toxicita: { text: 'V lednu 2020 jako předseda Sněmovny zahájil jednání vztyčeným prostředníčkem směrem k poslancům; gesto označil za \'legraci\'. V roli předsedy čelil i kritice za potlesk během projevu ministra, jenž měl narušovat jeho nestrannost.' },
        konzistence: { text: 'V říjnu 2018 jako předseda Sněmovny podnikl kritizovanou cestu do Ruska, kde se setkal se sankcionovanými představiteli; kritici uváděli, že se nesetkal s pronásledovanou opozicí.' },
      },
    }),
    person({
      id: 'faltynek', name: 'Jaroslav Faltýnek', party: 'ANO',
      role: 'dlouholetý místopředseda hnutí ANO, exposlanec',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Jaroslav_Faltynek.jpg',
      dictum: 'Schůzky s uchazečem o miliardový tendr i šéfem antimonopolního úřadu vydával za hledání řešení nejlepšího pro stát — obviněn za to nakonec nebyl.',
      lit: ['penize'],
      overrides: {
        penize: { text: 'Policejní odposlechy zdokumentovaly, že jako poslanec a místopředseda ANO zasahoval do miliardového tendru na výběr dálničního mýta: v listopadu 2017 se v Brně sešel se šéfem firmy Kapsch Karlem Feixem a s předsedou ÚOHS Petrem Rafajem. Hájil se, že jednal \'se všemi zájemci\' a hledal \'řešení nejlepší pro stát\'. Obviněn v této věci nebyl. Dříve, v kauze Čapí hnízdo, Sněmovna v září 2017 vydala Faltýnka k trestnímu stíhání pro dotační podvod, ale státní zástupce Jaroslav Šaroch jeho stíhání v květnu 2018 zastavil.', src: [S('mediální archiv', 'Forum24: Faltýnek, Rafaj a Kapsch — odposlechy odhalují zákulisí', 'https://www.forum24.cz/faltynek-rafaj-a-kapsch-odposlechy-odhaluji-mafianske-zakulisi-hnuti-ano'), S('mediální archiv', 'Aktuálně.cz: Policisté nahráli schůzku Faltýnka (kauza mýtného)', 'https://zpravy.aktualne.cz/domaci/patnactka-pro-faltynka-policiste-nahrali-schuzku-obzalovaneh/r~eaad2e18893d11eaa6f6ac1f6b220ee8/')] },
        toxicita: { text: 'V odposleších z brněnské korupční kauzy Stoka jej spolupracovník Jiří Švachula označil za toho, \'kdo je ten kat\'; Faltýnek v této věci obviněn nebyl.' },
      },
    }),
    person({
      id: 'nacher', name: 'Patrik Nacher', party: 'ANO',
      role: 'poslanec, spotřebitelská a finanční témata',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Patrik_Nacher_2020_%28cropped%29.jpg/500px-Patrik_Nacher_2020_%28cropped%29.jpg',
      dictum: 'Objevil se ve výkazu agentury, kterou na vylepšení obrazu Číny platil Home Credit — prý se mu jen starala o sociální sítě.',
      lit: [],
      overrides: {
        penize: { text: 'Jméno Nachera, tehdy pražského zastupitele za ANO, se objevilo ve výkazu PR agentury C&B Reputation Management, kterou si na zlepšení obrazu Číny v Česku najal Home Credit. Nacher ovlivňování kategoricky popřel s tím, že mu agentura \'pouze spravovala sociální sítě\', a uvedl, že s ní dál spolupracovat nebude. Obviněn nebyl.' },
        lze: { text: 'Demagog.cz u Nachera eviduje 6 výroků hodnocených jako nepravda a 5 jako zavádějící (vedle 41 pravdivých) — dílčí nepravdivé výroky, např. o ústavní lhůtě pro vyslovení důvěry vládě.' },
      },
    }),
    person({
      id: 'dostalova', name: 'Klára Dostálová', party: 'ANO',
      role: 'exministryně pro místní rozvoj, poslankyně',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/1718282852630_20240611_DOSTALOVA_Klara_CZ_005.jpg/500px-1718282852630_20240611_DOSTALOVA_Klara_CZ_005.jpg',
      dictum: 'Nejdřív trvala na tom, že evropský audit Babišova střetu zájmů není finální — a když ji konfrontovali se stanoviskem Komise, přiznala, že závěrečný je.',
      lit: ['konzistence'],
      overrides: {
        konzistence: { text: 'Její ministerstvo nejprve odmítalo, že evropský audit ke střetu zájmů Andreje Babiše skončil (\'rozhodně nejde o finální podobu auditní zprávy\'). Po konfrontaci se stanoviskem Evropské komise Dostálová přiznala, že na ministerstvo dorazila závěrečná zpráva o auditu; rozpor se snažila obhájit selektivním výkladem nařízení EU.', src: [S('mediální archiv', 'Deník N: Zpráva o Babišově střetu zájmů je závěrečná, přiznala Dostálová', 'https://denikn.cz/244863/zprava-o-babisove-stretu-zajmu-je-zaverecna-priznala-dostalova-cesko-muze-jeste-bojovat-o-to-kolik-bude-vracet/'), S('mediální archiv', 'iROZHLAS: Dostálová — Audit ke střetu zájmů budeme rozporovat; Evropská komise: nelze', 'https://www.irozhlas.cz/zpravy-domov/stret-zajmu-audit-evropska-komise-andrej-babis-dotace-dostalova-ministerstvo-pro_1912020600_kno')] },
        penize: { text: 'V kauze zakázek státní agentury CzechTourism ji policie prověřovala jako podezřelou (na podzim 2018 proběhla domovní prohlídka, zabaven počítač); tuto část kauzy policie později odložila a Dostálová obviněna nebyla. Samostatně byla medializována i prověřovaná podezření z financování auta z prostředků na poslanecké asistenty — případ skončil bez obvinění kvůli nepoužitelnosti důkazů.' },
        lze: { text: 'Demagog.cz u Dostálové eviduje 8 výroků hodnocených jako nepravda a 5 jako zavádějící (vedle 37 pravdivých).' },
      },
    }),
    person({
      id: 'vystrcil', name: 'Miloš Vystrčil', party: 'ODS',
      role: 'předseda Senátu',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/15.05.2024_Vizita_Pre%C8%99edintelui_Senatului_Parlamentului_Republicii_Cehe%2C_Milo%C5%A1_Vystr%C4%8Dil%2C_la_Parlamentul_Republicii_Moldova_-_53723066594_%28cropped%29.jpg/500px-15.05.2024_Vizita_Pre%C8%99edintelui_Senatului_Parlamentului_Republicii_Cehe%2C_Milo%C5%A1_Vystr%C4%8Dil%2C_la_Parlamentul_Republicii_Moldova_-_53723066594_%28cropped%29.jpg',
      dictum: 'Ve straně od roku 1991, výroky ověřitelné, kritiku snáší bez svalování viny — vzorek zmrdství se nekoná.',
      lit: [],
      overrides: {
        penize: { text: 'V březnu 2026 čelil kritice za použití vojenského speciálu na cestu na zimní paralympiádu do Itálie; uvedl, že měl povolení od armády a ministerstvo obrany potvrdilo, že stroj byl k cestě určen na základě úředního rozhodnutí. Jde o spornou epizodu, ne o doložené zneužití.' },
      },
    }),
    person({
      id: 'richterova', name: 'Olga Richterová', party: 'Piráti',
      role: 'předsedkyně strany, poslankyně',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Olga_Richterov%C3%A1_3_November_2021.jpg/500px-Olga_Richterov%C3%A1_3_November_2021.jpg',
      dictum: 'Terč dezinformací, který se bránil u soudu a vyhrál — na straně obětí kyberšikany, ne jejích původců.',
      lit: [],
    }),
    person({
      id: 'bartos', name: 'Ivan Bartoš', party: 'Piráti',
      role: 'expředseda strany, exministr pro místní rozvoj a digitalizaci',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Ivan_Barto%C5%A1_16_December_2021.jpg/500px-Ivan_Barto%C5%A1_16_December_2021.jpg',
      gray: true,
      category: 'Manažerské selhání',
      dictum: 'Spuštění digitalizace stavebního řízení skončilo měsíci výpadků a odvoláním — selhání řízení projektu, ne doložené osobní zmrdství.',
      lit: [],
      overrides: {
        prace: { text: 'Digitalizace stavebního řízení spuštěná 1. 7. 2024 provázely od startu zásadní výpadky. Audit ministerstva i kontrola ÚOHS našly pochybení v zadávacích řízeních, časový tlak, absenci projektového řízení a nedostatek personálních kapacit; podle odborníků způsobily problémy škodu přes dvě miliardy korun. Premiér Fiala Bartoše 24. 9. 2024 odvolal. Jde o doložené manažerské a odborné selhání resortu vedeného Bartošem, nikoli o prokázané osobní zmrdství.' },
        zbabelost: { text: 'Bartoš opakovaně odmítal razantní kroky navrhované profesními komorami a nepřipouštěl, že systém má zásadní problémy; část odpovědnosti přičítal zdržení legislativy a výběrových řízení a po odvolání glosoval, že nápravu řešení \'hodili na další vládu\'. Sporné rozložení odpovědnosti, ne jednoznačně doložené házení podřízených přes palubu.' },
      },
    }),
    person({
      id: 'hrib', name: 'Zdeněk Hřib', party: 'Piráti',
      role: 'exprimátor Prahy, místopředseda strany',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Zden%C4%9Bk_H%C5%99ib_%28cropped%29.jpg/500px-Zden%C4%9Bk_H%C5%99ib_%28cropped%29.jpg',
      dictum: 'Odměnu, kterou neměl brát, hodil na dozorčí radu; řízení skončilo pro nedostatek důkazů — vzorec mezi sporem a zametením.',
      lit: [],
      overrides: {
        penize: { text: 'Po vstupu do dozorčí rady PRE holding v červnu 2024 deklaroval výkon funkce bez nároku na odměnu, firma mu však během roku 2024 vyplatila zhruba 178 tisíc korun. Hřib z pochybení vinil dozorčí radu, podle právní analýzy je za přijetí odměny odpovědný veřejný činitel, který ji přijal. Přestupkové řízení úřad v Říčanech zastavil s tím, že pochybení nebylo prokázáno (in dubio pro reo). Peníze vrátil.' },
        konzistence: { text: 'Kritici včetně spolustraníka Ivana Bartoše mu vytkli podporu tajného hlasování o geologickém průzkumu metra D za 1,5 miliardy, což šlo proti pirátskému slibu transparentnosti. Jednotlivý sporný případ, ne doložený vzorec otáčení postojů.' },
        toxicita: { text: 'Na zastupitelstvu se v září střetl s ředitelem magistrátu Martinem Kubelkou; Kubelka obvinil některé Piráty ze zastrašování a vydírání a konkrétně Hřiba z nátlaku. Jde o vzájemná, soudně nepotvrzená obvinění z personálního sporu.' },
      },
    }),
    person({
      id: 'zdechovsky', name: 'Tomáš Zdechovský', party: 'KDU-ČSL',
      role: 'europoslanec',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/1718798537845_20240618_ZDECHOVSKY_Tomas_CZ_005.jpg/500px-1718798537845_20240618_ZDECHOVSKY_Tomas_CZ_005.jpg',
      dictum: 'Nejvíc cestujícího českého europoslance vozí cizí státy, jejichž lidská práva pak řeší — střet rolí, který sám nevidí.',
      lit: ['penize'],
      overrides: {
        penize: { text: 'Zdechovský výjezdy výrazně předčí všechny ostatní české europoslance — vykázal deset zahraničních cest hrazených třetími stranami (mj. SAE, Bahrajn, Maledivy, Egypt, dvakrát Maroko, Indie). Expert na lobbing upozornil, že opakované pracovní cesty do drahých hotelů nastolují otázku střetu zájmů. Dánská europoslankyně Karen Melchiorová jej vinila ze střetu zájmů, protože vyjednával prohlášení odsuzující porušování lidských práv v Bahrajnu, zatímco zároveň předsedal skupině přátelství s Bahrajnem; cesta do Bahrajnu nebyla v době zveřejnění uvedena v oficiálním registru cest EP. The Guardian uvedl, že neexistuje důkaz protiprávního jednání — kritika míří na střet rolí a nedostatečnou transparentnost.', src: [S('mediální archiv', 'iROZHLAS: \'Cestovní kancelář Evropský parlament.\' Zdechovský výjezdy výrazně předčí všechny české europoslance', 'https://www.irozhlas.cz/zpravy-svet/evropsky-parlament-zahranicni-cesty-cesti-europoslanci-katargate-lobbing-korupce_2304030500_aur'), S('mediální archiv', 'Aktuálně.cz: Zdechovský pod drobnohledem. Katargate přitáhla pozornost k jeho kontaktům v Zálivu', 'https://zpravy.aktualne.cz/zahranici/zdechovsky-na-tapete-katargate-pritahla-pozornost-ke-kontakt/r~cf0717d27c7911edbc030cc47ab5f122/')] },
      },
    }),
    person({
      id: 'foltyn', name: 'Otakar Foltýn', party: '—',
      role: 'Vládní koordinátor strategické komunikace (2024–2025), voják z povolání',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Plk._Otakar_Folt%C3%BDn_%282023%29.jpg/500px-Plk._Otakar_Folt%C3%BDn_%282023%29.jpg',
      category: 'Není zmrd (není stranický politik)',
      dictum: 'Voják, který nazval část spoluobčanů sviněmi a stál si za tím — ostré, ale mířené na omlouvače ruské agrese; čistý štít není totéž co diplomatický jazyk.',
      lit: [],
      overrides: {
        toxicita: { text: 'Na festivalu ve Slavonicích (srpen 2024) označil cca 4,5 % populace s antisystémovými postoji za „zombíky“, mluvil o „sviních“ a „hlubokém příkopu“. Výrok opakovaně obhajoval („Stojím si za tím“, „klidně zopakuji“). Mířeno explicitně na omlouvače ruské agrese, nikoli plošně — proto sporné, nikoli jednoznačná dehonestace nevinných; osa se nesvítí.' },
      },
    }),
    person({
      id: 'blaha', name: 'Michal Bláha', party: '— (2024–2025 místopředseda Pirátů)',
      role: 'Zakladatel projektu Hlídač státu, aktivista za transparentnost',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Michal_Bl%C3%A1ha_01.jpg/500px-Michal_Bl%C3%A1ha_01.jpg',
      category: 'Není zmrd (není politik)',
      dictum: 'Provozuje jeden ze zdrojů, ze kterých čerpá i tento zmrdometr — a sám se na zmrdometru ničím doloženým neobjevuje; ironie, kterou ocení jen pečlivý čtenář rejstříku smluv.',
      lit: [],
      overrides: {
        penize: { text: 'Od 2022 člen správní rady VZP, kde schválené roční odměny činily 1,3 mil. Kč (2022) a 1,6 mil. Kč (2023). Spolek Kverulant označuje souběh s rolí šéfa watchdogu Hlídač státu za střet zájmů; Bláha to odmítá s tím, že hájí zájmy pojištěnců. Jde o sporné hodnocení a legitimní odměnu za funkci, nikoli o doložené dotace či zakázky ve střetu — osa se nesvítí.' },
      },
    }),
    person({
      id: 'minar', name: 'Mikuláš Minář', party: '—',
      role: 'Aktivista, spoluzakladatel spolku Milion chvilek pro demokracii, exlídr hnutí Lidé PRO',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Mikul%C3%A1%C5%A1_Min%C3%A1%C5%99_%282026%29.jpg/500px-Mikul%C3%A1%C5%A1_Min%C3%A1%C5%99_%282026%29.jpg',
      category: 'Není zmrd (není politik)',
      dictum: 'Apoštol transparentnosti, který musel být na zveřejnění vlastního účetnictví dotlačen — vyúčtování nakonec předložil, takže pointa zůstává jen u trapnosti, ne u zmrdství.',
      lit: [],
      overrides: {
        konzistence: { text: 'Po krachu projektu Lidé PRO (2021) přiznal, že část prostředků šla mimo transparentní účet; bývalý šéf Transparency International David Ondráčka i sponzor Martin Hausenblas ho vyzvali ke zveřejnění. Závěrečnou zprávu (příjmy i náklady cca 7,3 mil. Kč, výhradně od soukromých dárců) nakonec zveřejnil. Napětí mezi proklamovanou transparentností a praxí je doložené, ale šlo o vlastní dárcovské peníze a účetnictví předložil — osa se nesvítí.' },
      },
    }),
    person({
      id: 'nerudova', name: 'Danuše Nerudová', party: 'STAN (od 2024; dříve nezávislá)',
      role: 'Europoslankyně, exrektorka Mendelovy univerzity, exprezidentská kandidátka 2023',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Danu%C5%A1e_Nerudov%C3%A1_%282023%29_VI.jpg/500px-Danu%C5%A1e_Nerudov%C3%A1_%282023%29_VI.jpg',
      dictum: 'Rektorka, za níž univerzita podle kontrolorů porušovala zákon i vlastní předpisy, ale „pytlák byl děkan“ — a u čísel o důchodech a domácnostech jí Demagog opakovaně naměřil nepravdu.',
      lit: ['lze', 'zbabelost'],
      overrides: {
        lze: { text: 'Demagog.cz vyhodnotil několik jejích výroků jako nepravdivé — mj. údaje o podílu domácností ve finanční tísni, o vývoji ukazatele zdravé délky života i tvrzení, že studenti na MENDELU dokončili studium „o pár měsíců dříve“ (ve skutečnosti řada o 22–30 měsíců místo 3 let, tedy až o rok).', src: [S('demagog.cz', 'Hodnocení výroků Danuše Nerudové — opakovaná hodnocení „nepravda“', 'https://demagog.cz/diskuze/danuse-nerudova-kandidatka-na-prezidentku'), S('demagog.cz', 'Výrok k MENDELU hodnocen jako nepravda', 'https://demagog.cz/vyrok/22373')] },
        zbabelost: { text: 'Národní akreditační úřad zjistil, že za jejího rektorství (2018–2022) Mendelova univerzita porušovala zákon i vlastní předpisy a přišla o akreditaci doktorských programů ekonomie; Robert Plaga označil část pochybení za „systémové nedostatky, nikoli individuální selhání“ připisované rektorce. Nerudová odpovědnost odmítla a svalila ji na děkana („Za celou věc nese jednoznačně odpovědnost děkan“; „Nebyla jsem pytlák, ale hajný“), ačkoli souběžně vedla vnitřní hodnoticí radu a účastnila se kolegií děkana.', src: [S('mediální archiv', 'Respekt: Plaga označuje pochybení za systémová; Nerudová svaluje odpovědnost na děkana', 'https://www.respekt.cz/kontext/problemy-nerudove-kvuli-univerzite-sili-kontrolor-plaga-je-oznacuje-za-systemove'), S('mediální archiv', 'Aktuálně.cz: Podle kontroly univerzita za Nerudové porušila zákon', 'https://zpravy.aktualne.cz/domaci/nerudova/r~2fe8e592814011eda873ac1f6b220ee8/')] },
      },
    }),
    person({
      id: 'sikela', name: 'Jozef Síkela', party: '— (nezávislý nominovaný za STAN)',
      role: 'Eurokomisař pro mezinárodní partnerství, exministr průmyslu a obchodu (2021–2024)',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/S%C3%ADkela_EC_Portrait_2024_%28cropped%29.jpg/500px-S%C3%ADkela_EC_Portrait_2024_%28cropped%29.jpg',
      dictum: 'Eurokomisař, jehož největším hříchem je podle kritiků neviditelnost — politické „kde je Síkela?“ není zmrdství, jen slabá PR.',
      lit: [],
    }),
    person({
      id: 'macinka', name: 'Petr Macinka', party: 'Motoristé sobě',
      role: 'předseda hnutí, ministr zahraničních věcí a vicepremiér (od prosince 2025)',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Petr_Macinka_2026-02-14.jpg/500px-Petr_Macinka_2026-02-14.jpg',
      dictum: 'Provokaci povýšil na program: kritiky veřejně škatulkuje jako méněcenné a oponentní organizaci coby teroristickou, načež provokace prohlašuje za nevinné.',
      lit: ['toxicita'],
      overrides: {
        toxicita: { text: 'V pořadu CNN Prima News o svých kriticích řekl, že je považuje za „méněcenné“. Ekologické Hnutí DUHA opakovaně označil za „teroristickou organizaci“; organizace mu kvůli tomu zaslala předžalobní výzvu a žádá omluvu. Ředitelka DUHA uvedla, že po výroku jí a ženám v týmu začaly chodit výhrůžky.', src: [S('irozhlas.cz', 'Hnutí DUHA poslalo Macinkovi předžalobní výzvu kvůli nařčení z terorismu', 'https://www.irozhlas.cz/zpravy-domov/hnuti-duha-poslalo-macinkovi-predzalobni-vyzvu-kvuli-narceni-z-terorismu-zada_2604210846_mst'), S('mediální archiv', 'Heroine.cz: Macinka označil Hnutí Duha za teroristy, ředitelka popisuje výhrůžky', 'https://www.heroine.cz/spolecnost/macinka-oznacil-hnuti-duha-za-teroristy-uz-jsem-otrla-vyhruzky-znasilnenim-a-zabitim-mi-chodily-uz-pred-lety-popisuje-reditelka-organizace')] },
        zbabelost: { text: 'Prezident Petr Pavel v lednu 2026 zveřejnil SMS, v nichž Macinka přes prezidentova poradce vzkazoval, že pokud nebude Filip Turek ministrem životního prostředí, „důsledky ho velice překvapí“; Pavel je označil za pokus o vydírání. Policie věc po prověření odložila, tj. neshledala podezření z trestného činu — řízení tedy nedospělo k obvinění.' },
      },
    }),
    person({
      id: 'slachta', name: 'Róbert Šlachta', party: 'Přísaha',
      role: 'předseda hnutí, senátor za Břeclavsko, exšéf ÚOOZ',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Robert_%C5%A0lachta_SJK_2020_0-58.png/500px-Robert_%C5%A0lachta_SJK_2020_0-58.png',
      dictum: 'Antikorupční étos prodává jako značku, ale soud mu pravomocně nařídil omluvit se za výroky z vlastní knihy a dráhu mu kdysi dláždil týž Babiš, jehož dnes potírá.',
      lit: ['lze'],
      overrides: {
        lze: { text: 'Městský soud v Praze pravomocně rozhodl (30. 1. 2025), že se Šlachta musí omluvit bývalému státnímu zástupci Liboru Grygárkovi za výroky z pamětí „Třicet let pod přísahou“; soud konstatoval, že napadené výroky jsou způsobilé zasáhnout do osobnostních práv. V samostatném sporu mu nalézací soud uložil omluvit se novináři Marku Wollnerovi a zaplatit 400 000 Kč za nařčení o krytí organizovaného zločinu (Šlachta se odvolal, nepravomocné). Demagog.cz mu část ověřených výroků hodnotí jako zavádějící.', src: [S('justice.cz', 'Česká justice: Šlachta se musí pravomocně omluvit Grygárkovi za výroky v knize', 'https://www.ceska-justice.cz/2025/01/slachta-se-musi-omluvit-grygarkovi-za-sve-vyroky-nemusi-mu-ale-nic-platit/'), S('mediální archiv', 'ČeskéNoviny.cz: Šlachta se má omluvit Wollnerovi a zaplatit 400 tis., odvolal se', 'https://www.ceskenoviny.cz/zpravy/slachta-se-musi-omluvit-novinari-a-zaplatit-mu-400000-kc-rozhodl-soud/2652093'), S('demagog.cz', 'Ověřené výroky Róberta Šlachty', 'https://demagog.cz/politici/robert-slachta-578')] },
        konzistence: { text: 'Buduje hnutí na antikorupčním étosu a kritice Andreje Babiše, ačkoli mu Babiš jako ministr financí v roce 2016 zajistil post náměstka ředitele Celní správy a sám Šlachta připustil, že nese „stigma Babišova člověka“.' },
      },
    }),
    person({
      id: 'radim-fiala', name: 'Radim Fiala', party: 'SPD',
      role: 'místopředseda hnutí, poslanec, předseda poslaneckého klubu SPD',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Radim_Fiala_Praha_2017.jpg/500px-Radim_Fiala_Praha_2017.jpg',
      dictum: 'Z řečnického pultíku šíří proruské narativy a vulgarity vůči opozici, a přitom drží nelichotivý rekord v počtu hlasování, k nimž se vůbec nepřihlásil.',
      lit: ['lze', 'prace', 'toxicita'],
      overrides: {
        lze: { text: 'Demagog.cz z 43 ověřených výroků hodnotí 12 jako nepravdu a 6 jako zavádějící. V České televizi opakoval narativy z ruského dezinformačního prostředí — zpochybnil ruskou odpovědnost za výbuchy ve Vrběticích (kterou vláda doložila 2021), označil Ukrajinu za „nejzkorumpovanější zemi světa“ a zpochybnil legitimitu prezidenta Zelenského.', src: [S('demagog.cz', 'Ověřené výroky Radima Fialy (12 nepravda, 6 zavádějící ze 43)', 'https://demagog.cz/politici/radim-fiala-265'), S('mediální archiv', 'Manipulátoři.cz: Fiala v ČT opakoval proruské dezinformace o Ukrajině i Vrběticích', 'https://manipulatori.cz/radim-fiala-v-ct-opakoval-proruske-dezinformace-o-ukrajine-i-vrbeticich-fakta-rikaji-neco-jineho/')] },
        prace: { text: 'Ve volebním období 2021–2025 byl podle přehledu účasti na hlasování největším absentérem bez omluvy — nepřihlášen byl u 27,9 % hlasování, čímž svým hlasem nepřispěl k 2412 rozhodnutím.', src: [S('mediální archiv', 'Deník.cz: Přehled účasti poslanců na hlasování — kdo často chyběl', 'https://www.denik.cz/cesi-v-cislech/prehled-ucasti-poslancu-na-hlasovani-kdo-byl-pilny-a-kdo-casto-chybel.html'), S('psp.cz', 'Hlasování poslance Radima Fialy, PS 2021–2025', 'https://psp.cz/cgi-bin/win/sqw/phlasa.sqw?o=9&id_posl=1790&s=104&pg=1')] },
        toxicita: { text: 'Během nočního jednání Sněmovny o sjezdu sudetských Němců u řečnického pultíku bouchl do stolu a vulgárně nadával opozici („Jděte do prdele“); následující den se za výrok omluvil s tím, že mu to „ujelo“.', src: [S('mediální archiv', 'Aktuálně.cz: Šéf poslanců SPD řval na Bendu a vulgárně nadával opozici', 'https://zpravy.aktualne.cz/domaci/sef-poslancu-spd-fiala-vulgarne-plisnil-opozici-nocni-jednani-snemovny-se-zvrhlo-v-bouri/r~aaa2937e783357f396af15d70ec60d9d/'), S('mediální archiv', 'Seznam Zprávy: Fiala se neudržel a vulgárně promluvil k opozici, pak se omlouval', 'https://www.seznamzpravy.cz/clanek/domaci-politika-fiala-se-neudrzel-vulgarne-promluvil-k-opozici-neprijatelne-zni-z-ano-305651')] },
      },
    }),
    person({
      id: 'fiala', name: 'Petr Fiala', party: 'ODS',
      role: 'expředseda ODS, expremiér (2021–2025)',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Petr_Fiala_%282024%29_%28cropped%29.jpg/500px-Petr_Fiala_%282024%29_%28cropped%29.jpg',
      dictum: 'Občanům garantoval, že nezvýší daně, a pak je konsolidačním balíčkem zvýšil — sám později připustil, že měl předvolební sliby raději rovnou odvolat.',
      lit: ['konzistence'],
      overrides: {
        konzistence: { text: 'V předvolební debatě v září 2021 prohlásil: „Garantujeme občanům, že nezvýšíme daně.“ Vládní konsolidační balíček v roce 2023 následně daně zvýšil. Fiala sám připustil, že po ruském útoku na Ukrajinu měl říct, že předvolební sliby už neplatí, místo aby na jejich plnění trval.', src: [S('demagog.cz', 'Sliby vlády Petra Fialy 2021–2025 — daňový závazek a jeho porušení', 'https://demagog.cz/sliby/sliby-vlady-petra-fialy'), S('mediální archiv', 'iROZHLAS: Předvolební sliby dohání premiéra Fialu i celou jeho vládu', 'https://www.irozhlas.cz/komentare/radko-kubicko-predvolebni-sliby-premier-petr-fiala-vlada-cesko-komentar_2306070629_ale')] },
        lze: { text: 'Demagog.cz mu ověřil přes 500 výroků se smíšeným výsledkem; jako nepravdivé hodnotí například tvrzení, že české školy byly během covidu zavřené nejdéle (podle UNESCO byly v pěti evropských zemích zavřené déle) či že ČR plní maastrichtská konvergenční kritéria (dle zprávy splňuje jen dvě ze čtyř). Nejde o doložený soustavný vzorec účelové lži.' },
      },
    }),
    person({
      id: 'rakusan', name: 'Vít Rakušan', party: 'STAN',
      role: 'předseda hnutí, exministr vnitra',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/9/90/V%C3%ADt_Raku%C5%A1an_%282025%29_%28cropped%29.png',
      dictum: 'Kauza Dozimetr se dotkla jeho lidí, ne jeho obvinění; obraty v postojích a stažené tvrzení o odposleších drží jeho bilanci ve sporné šedé zóně.',
      lit: [],
      overrides: {
        penize: { text: 'V korupční kauze Dozimetr (DPP) byl obviněn jeho bývalý náměstek a pražský zastupitel Petr Hlubuček (STAN), nikoli Rakušan; ten v ní obviněn nebyl. Kritika se vede v rovině politické odpovědnosti a vnitřní kontroly v hnutí, nikoli doloženého osobního čerpání či zakázek.' },
        lze: { text: 'Rakušan a STAN šířili příspěvky vzbuzující dojem, že je odposlouchával Agrofert; po žalobě Agrofertu uzavřeli smír, příspěvky stáhli a obě strany konstatovaly, že se tvrzení neprokázala. Demagog.cz mu z přes 150 ověřených výroků část hodnotí jako nepravdu.' },
        konzistence: { text: 'U zrušení superhrubé mzdy posun postoje: nejprve ji STAN navrhoval, posléze Rakušan uvedl, že by ji „teď spíš odložili“, a později ji označil za „obrovskou chybu“ — s odůvodněním, že se změnila ekonomická situace.' },
      },
    }),
    person({
      id: 'pekarova-adamova', name: 'Markéta Pekarová Adamová', party: 'TOP 09',
      role: 'předsedkyně strany, expředsedkyně Poslanecké sněmovny',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/%C4%8Cehijas_parlamenta_priek%C5%A1s%C4%93d%C4%93t%C4%81jas_viz%C4%ABte_Latvij%C4%81_2024_27_%28cropped%29.jpg/500px-%C4%8Cehijas_parlamenta_priek%C5%A1s%C4%93d%C4%93t%C4%81jas_viz%C4%ABte_Latvij%C4%81_2024_27_%28cropped%29.jpg',
      dictum: 'Je spíš terčem dezinformačních hoaxů než jejich původkyní; pokusy o její odvolání z čela Sněmovny padly na proceduře, ne na doloženém pochybení.',
      lit: [],
      overrides: {
        toxicita: { text: 'V kauze Dominika Feriho se veřejně omluvila za vyjádření některých spolustraníků k obětem; sama bývá podle ověřovatelů dlouhodobě nejčastějším terčem dezinformací (např. doložený hoax o „pečení kuřat se sousedy“, který je smyšlený).' },
      },
    }),
    person({
      id: 'stanjura', name: 'Zbyněk Stanjura', party: 'ODS',
      role: 'exministr financí (2021–2025), bývalý poslanec',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Zbyn%C4%9Bk_Stanjura_%282022%29.jpg/500px-Zbyn%C4%9Bk_Stanjura_%282022%29.jpg',
      dictum: 'Resort, který měl miliardu od odsouzeného nahlásit jako riziko praní peněz, si půldruhého měsíce nevšiml, že varování leží na stole.',
      lit: [],
      overrides: {
        penize: { text: 'Ministerstvo financí pod jeho vedením je v bitcoinové kauze prověřováno policií kvůli podezření, že neoznámilo riziko praní špinavých peněz u daru ~1 mld. Kč v bitcoinech od odsouzeného Tomáše Jiřikovského. Právní varování proti přijetí daru leželo podle médií na resortu zhruba půldruhého měsíce; Stanjura uvádí, že stanovisko četl až 25. března, ač darovací smlouva byla podepsána 7. března. Sám nebyl obviněn, vystupuje jako svědek / politicky kritizovaná osoba; nejde o doložené osobní obohacení.' },
        zbabelost: { text: 'Selhání s nepředaným právním varováním bylo opozicí i auditem směřováno na šéfa jeho kabinetu Filipa Bendu, který stanovisko Stanjurovi včas nepředal. Doložené je institucionální pochybení MF; jednoznačné doložení, že by Stanjura osobně svaloval vinu na podřízeného, chybí.' },
      },
    }),
    person({
      id: 'blazek', name: 'Pavel Blažek', party: 'ODS (členství pozastaveno od 6/2025)',
      role: 'exministr spravedlnosti (2021–2025)',
      scope: 'celostátní', photo: null,
      dictum: 'Když resort přijme miliardu od odsouzeného a verze se začnou rozpadat, viník se najde u soudců, policie i novinářů — jen ne u ministra.',
      lit: ['lze', 'toxicita'],
      overrides: {
        lze: { text: 'K bitcoinovému daru opakovaně podával verze, které se rozcházejí s doloženými fakty: tvrdil, že převod proběhl 7. března „za přítomnosti notáře", ač podle zjištění byly stovky bitcoinů přesunuty již o den dříve; podle žalobce věděl, že zabavená elektronika skrývá cenné bitcoiny, soudům to ale neuvedl. Médii byl opakovaně přistižen u nepřesností (Echo24: „Bitcoinové lži a Blažkovy nepravdy"). Pozn.: 4. 5. 2026 byl VSZ Olomouc obviněn (stíhán na svobodě, nepravomocně) ze zneužití pravomoci úřední osoby a 2× legalizace výnosů z trestné činnosti; vinu odmítá.', src: [S('denikn.cz', 'Blažek podle žalobce věděl, že zabavená elektronika skrývá cenné bitcoiny, soudům to neřekl', 'https://denikn.cz/1753951/blazek-vedel-ze-zabavena-elektronika-skryva-cenne-bitcoiny-soudum-to-ale-podle-zalobce-nerekl/'), S('mediální archiv', 'Echo24 (editorial M. Balšínek): „Bitcoinové lži a Blažkovy nepravdy"', 'https://www.echo24.cz/a/HKQ6v/editorial-balsinek-bitcoinove-lzi-a-blazkovy-nepravdy'), S('mediální archiv', 'iROZHLAS/Aktuálně: „Neřekl jsem, že ty bitcoiny jsou ultračisté" — sporné výroky a otázky kauzy', 'https://zpravy.aktualne.cz/domaci/nerekl-jsem-ze-ty-bitcoiny-jsou-ultraciste-smlouva-je-ultral/r~2b15d590a9bd11f0b589ac1f6b220ee8/')] },
        toxicita: { text: 'V souvislosti s kauzou na sociálních sítích zpochybňoval nezávislost české justice, přirovnal postup policie k praktikám komunistického režimu 50. let a naznačil, že zadržený Jiřikovský měl být tlačen k vydání kompromitujících informací o politicích výměnou za mírnější trest. Jeho nástupkyně Eva Decroix tyto výroky veřejně kritizovala a označila je za „metaforické atomové bomby".', src: [S('mediální archiv', 'Deník.cz: Blažek kvůli bitcoinům pálí i do justice', 'https://www.denik.cz/z_domova/kauza-bitcoiny-pavel-blazek-pali-do-justice-mozna-priprava-na-boj-rika-vales.html'), S('mediální archiv', 'Echo24: Blažkovy výroky jsou nešťastné, zní z koalice; Decroix o útoku na nezávislost justice', 'https://www.echo24.cz/a/HmxRv/zpravy-domaci-denik-kauza-bitcoin-blazek-vyroky-jsou-nestastne-vlada-fiala-decroix')] },
        konzistence: { text: 'Verze o průběhu a okolnostech přijetí daru se v čase měnily (datum a způsob převodu, míra jeho informovanosti, hodnocení „ultralegální" smlouvy), což média opakovaně dokumentovala při postupném rozpadu první verze příběhu.' },
        penize: { text: 'Obvinění z 4. 5. 2026 se týká nakládání s veřejnými prostředky a legalizace výnosů z trestné činnosti u státního daru ~1 mld. Kč, nikoli doloženého osobního obohacení; věc je nepravomocná (stíhán na svobodě), vinu odmítá.' },
      },
    }),
    person({
      id: 'kupka', name: 'Martin Kupka', party: 'ODS',
      role: 'exministr dopravy (2021–2025), předseda ODS (od 1/2026)',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Martin_Kupka_ODS_%28cropped%29.jpg/500px-Martin_Kupka_ODS_%28cropped%29.jpg',
      dictum: 'Regulátora, který napsal Bruselu varování, lze odvolat za hodinu — a celý jeho úřad pak zrušit jako „úspornější řešení".',
      lit: [],
      overrides: {
        toxicita: { text: 'Podle investigace Seznam Zpráv stáhl 15. 2. 2023 z vládní agendy znovujmenování Pavla Kodyma, šéfa Úřadu pro přístup k dopravní infrastruktuře, krátce poté, co Kodym varoval evropské orgány, že plán na vložení ~1 mld. Kč do Českých drah je možná protiprávní; následně prosadil zrušení celého úřadu. Médii byl rovněž popsán jeho zdráhavý postoj ke jmenování whistleblowera Lea Steinera do dozorčí rady ČD. Kupka časovou souvislost i účelovost odmítá; žádné porušení zákona nebylo konstatováno.' },
        penize: { text: 'Tunel vysokorychlostní trati u jeho bydliště v Líbeznicích byl prodloužen (z ~2,7 na ~3,4 km, náklad ~5,9 mld. Kč) v době, kdy byl ministrem dopravy; v Líbeznicích dříve jako starosta variantu vyjednával. Sousední obce (např. Odolena Voda) uvádějí, že obdobné žádosti správce neuznal. Kupka uvádí, že o aktuálním prodloužení nerozhodoval, a střet zájmů odmítá; nebylo konstatováno pochybení.' },
        konzistence: { text: 'V kauze Dozimetr byl policií vyslechnut jako svědek (komunikace s Redlovou skupinou ohledně vedení středočeské správy silnic v době jeho krajského náměstkování), nikdy nebyl obviněn — doloženo jen postavení svědka, nikoli trestní odpovědnost.' },
      },
    }),
    person({
      id: 'valek', name: 'Vlastimil Válek', party: 'TOP 09',
      role: 'místopředseda strany, exministr zdravotnictví (2021–2025), vicepremiér',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Vlastimil-V%C3%A1lek2019b.jpg/500px-Vlastimil-V%C3%A1lek2019b.jpg',
      dictum: 'Tvrdit, že nevím, co kamarád z golfu dělá, je těžší poté, co se najde schůzka, kde jste s ním a úředníky řešili dodávky IT do zdravotnictví.',
      lit: [],
      overrides: {
        konzistence: { text: 'Opakovaně tvrdil, že neví, čím se profesně živí jeho přítel z golfu Milan Sameš. Seznam Zprávy doložily schůzku z března 2022 v brněnské restauraci, kde Válek, Sameš (předseda představenstva IT firmy Aricoma se zakázkami ve zdravotnictví v řádu stovek mil. Kč, skupina KKCG) a úředníci ministerstva probírali zdravotnické IT; vedoucí ÚZIS schůzku potvrdil jako jednání o dodavatelských příležitostech. Po konfrontaci Válek upřesnil, že si Sameše s IT „nespojil". Nebyl doložen žádný neoprávněný prospěch ani protiprávní jednání — jde o rozpor ve věrohodnosti, nikoli o prokázaný střet zájmů.' },
      },
    }),
    person({
      id: 'langsadlova', name: 'Helena Langšádlová', party: 'TOP 09',
      role: 'exministryně pro vědu, výzkum a inovace (2021–2024), poslankyně',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Helena_Lang%C5%A1%C3%A1dlov%C3%A1.jpg/500px-Helena_Lang%C5%A1%C3%A1dlov%C3%A1.jpg',
      dictum: 'Když bojovnice proti dezinformacím rozšíří neověřené tvrzení, rozdíl proti zmrdovi je v tom, že se druhý den omluví.',
      lit: [],
      overrides: {
        lze: { text: 'V roce 2024 veřejně uvedla, že organizace Aliance pro rodinu „spolupracuje s Ruskem" / je napojena na Putinův režim. Sama výrok vzápětí přehodnotila a omluvila se s tím, že vycházela z neověřené informace. Jde o jediný doložený a následně odvolaný výrok, nikoli o opakovaný vzorec — proto se osa nesvítí. Kritika jejího působení směřovala spíše na komunikační/odbornou stránku resortu než na zmrdské chování.' },
      },
    }),
    person({
      id: 'jurecka', name: 'Marian Jurečka', party: 'KDU-ČSL',
      role: 'předseda strany, exministr práce a sociálních věcí (2021–2025), vicepremiér',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Marian_Jurecka_-_portrait.jpg/500px-Marian_Jurecka_-_portrait.jpg',
      dictum: 'Tančit na ministerstvu do tří ráno v den masakru lze přežít — stačí pak tvrdit, že se večírek ukončil včas.',
      lit: [],
      overrides: {
        zbabelost: { text: 'Jeho ministerstvo (MPSV) pořádalo 21. 12. 2023 vánoční večírek v den střelby na FF UK (14–15 mrtvých). Resort nejprve tvrdil, že akci ukončil předčasně; podle svědka se tančilo do noci a sám Jurečka se po mimořádné vládě na večírek vrátil a odcházel kolem půl čtvrté ráno. Tvrzení, že rozsah tragédie zjistil až po několika hodinách, naráží na doloženou časovou osu (policie hlásila mrtvé krátce po 15:00, kolem 17:45 potvrzeno 15 obětí). Za alkohol na pracovišti dostalo MPSV pokutu 25 000 Kč. Jurečka se následně omluvil a připustil pochybení — osobní odpovědnost tedy nakonec přijal, proto je nález veden jako sporný.' },
        penize: { text: 'Po zpřísnění zákona o střetu zájmů převedl rodinnou farmu Jurenka na manželku, která dál čerpá plošné eurodotace na půdu (malá farma ~30 ha, ~150 tis. Kč/rok povinných plošných dotací); jeho bratr působil jako neplacený poradce na ministerstvu zemědělství v době, kdy Jurečka ovlivňoval rozdělování dotací. Převod technicky vyhovoval zákonu a nebylo konstatováno protiprávní jednání ani srovnatelné objemy jako u investičních dotací; jde o spornou optiku střetu zájmů, nikoli o doložené zneoprávněné čerpání.' },
      },
    }),
    person({
      id: 'konecna', name: 'Kateřina Konečná', party: 'Stačilo! / KSČM',
      role: 'předsedkyně KSČM, europoslankyně',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/1719413916595_20240626_KONECNA_Katerina_CZ_008.jpg/500px-1719413916595_20240626_KONECNA_Katerina_CZ_008.jpg',
      dictum: 'Mandát v Bruselu bere, ale na lavici v něm sedí nejméně ze všech českých zástupců — zbytek času vysvětluje, proč si zrovna tahle hlasování ověřovat nemáme.',
      lit: ['lze', 'prace'],
      overrides: {
        lze: { text: 'Demagog.cz opakovaně vyhodnotil její výroky jako nepravdivé — mj. tvrzení o stovkách miliard vyvážených z ČR (ve skutečnosti desítky miliard), o církevních restitucích a o počtu vojáků v slovensko-americké obranné dohodě.', src: [S('demagog.cz', 'Profil Kateřiny Konečné — výroky hodnocené jako nepravda', 'https://demagog.cz/politici/katerina-konecna-240?hodnoceni=nepravda'), S('demagog.cz', 'Výrok o vývozu peněz z ČR hodnocený jako nepravda', 'https://demagog.cz/vyrok/10705')] },
        prace: { text: 'Podle analýzy docházky chyběla na 12 z 58 jednacích dnů Evropského parlamentu od voleb v červnu 2024 (cca 20,7 %, každý pátý den) — nejvyšší neúčast mezi srovnávanými českými europoslanci.', src: [S('mediální archiv', 'Novinky.cz: Konečná chyběla na každém pátém jednání europarlamentu', 'https://www.novinky.cz/clanek/domaci-konecna-chybela-na-kazdem-patem-jednani-europarlamentu-dotahuje-ji-gregorova-40537446')] },
        konzistence: { text: 'Sporné: jako předsedkyně KSČM vedla stranu do koalice Stačilo!, přičemž v této roli po neúspěchu ve volbách 2025 oznámila odchod z čela strany; jde spíše o strategický posun než o doložené otáčení osobních postojů.' },
      },
    }),
    person({
      id: 'malacova', name: 'Jana Maláčová', party: 'SOCDEM',
      role: 'předsedkyně strany, exministryně práce a sociálních věcí',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Jana_Mal%C3%A1%C4%8Dov%C3%A1%2C_2021-1.jpg/500px-Jana_Mal%C3%A1%C4%8Dov%C3%A1%2C_2021-1.jpg',
      dictum: 'Stranu, která si zakázala spojení s komunisty vlastní rezolucí, dovedla přesně k tomu spojení — a po prohraných volbách děkovala za odvahu pokusu.',
      lit: [],
      overrides: {
        konzistence: { text: 'Sporné: jako předsedkyně dovedla SOCDEM do předvolební spolupráce s komunisty v rámci koalice Stačilo!, což kritici uvnitř strany označili za porušení tzv. bohumínského usnesení z roku 1995 zakazujícího spolupráci s KSČ; rozhodnutí vyvolalo vlnu odchodů a po neúspěchu (4,3 %) avizovala rezignaci.' },
        lze: { text: 'Sporné: v únoru 2021 v debatě prohlásila, že \'ani druhá světová válka nezpůsobila to, co covid\' v souvislosti se zavřenými školami; výrok následně vysvětlovala jako mířený na uzavření škol, nešlo o doloženě nepravdivé tvrzení, ale o kontroverzní srovnání.' },
      },
    }),
    person({
      id: 'zaoralek', name: 'Lubomír Zaorálek', party: 'SOCDEM',
      role: 'exministr kultury a exministr zahraničí',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Lubom%C3%ADr_Zaor%C3%A1lek_2022.jpg/500px-Lubom%C3%ADr_Zaor%C3%A1lek_2022.jpg',
      dictum: 'Ředitelce lidického památníku dal vybrat mezi rezignací a odvoláním — věcný spor o důstojnost přeživších se tak vyřešil ministerským ultimátem.',
      lit: [],
      overrides: {
        toxicita: { text: 'Sporné: jako ministr kultury dal v roce 2020 ředitelce Památníku Lidice Martině Lehmannové na výběr mezi vlastní rezignací a odvoláním ve sporu o zveřejnění archivního zjištění o jedné z lidických žen; šlo o věcný spor o citlivost vůči přeživším, nikoli o bezdůvodnou dehonestaci.' },
        lze: { text: 'Sporné: Demagog.cz eviduje u jeho výroků jednotlivá hodnocení \'nepravda\', rozsah ale nevybočuje z běžné míry u dlouholetých politiků a nedosahuje doloženého vzorce opakovaného klamání.' },
      },
    }),
    person({
      id: 'pavel', name: 'Petr Pavel', party: 'nestraník',
      role: 'prezident republiky',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Petr_Pavel_%28crop%29.jpg/500px-Petr_Pavel_%28crop%29.jpg',
      dictum: 'Předlistopadové členství v KSČ i zpravodajský kurz nezapírá a nazývá je chybou — spor zůstává jen o to, kde přesně leží hranice mezi jazykovým kurzem a přípravou rozvědčíka.',
      lit: [],
      overrides: {
        konzistence: { text: 'Sporné: doloženě byl od roku 1985 členem KSČ (vč. funkce předsedy základní organizace) a v letech 1988–1991 absolvoval utajovaný zpravodajský kurz D-2; minulost veřejně přiznává a označuje za chybu, fact-checking označil za zavádějící spíše jeho formulaci, že druhý rok studia probíhal \'v novém režimu\', když třetí semestr začal ještě před 17. listopadem 1989.' },
      },
    }),
    person({
      id: 'zeman', name: 'Miloš Zeman', party: 'SPOZ (zakladatel), dříve ČSSD',
      role: 'exprezident republiky, expředseda ČSSD a expremiér',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Milo%C5%A1_Zeman_2022.jpg/500px-Milo%C5%A1_Zeman_2022.jpg',
      dictum: 'Z předsedy sociální demokracie přes vlastní stranu až k objetí dřívějšího úhlavního nepřítele — a po cestě soudně prohraný citát, který nikdy neexistoval, a vtípek o likvidaci novinářů přímo Putinovi.',
      lit: ['lze', 'toxicita', 'konzistence', 'penize'],
      overrides: {
        lze: { text: 'Demagog.cz dlouhodobě eviduje stovky ověřovaných výroků a opakovaně vysokou míru nepravd — např. v prezidentské debatě ČT 2018 vyhodnotil 14 jeho výroků jako nepravdivé. V kauze Peroutka soud rozhodl, že úřad prezidenta se musí omluvit, neboť Ferdinand Peroutka článek \'Hitler je gentleman\' nenapsal; Zeman přesto na existenci článku trval.', src: [S('demagog.cz', 'Profil Miloše Zemana — ověřené výroky', 'https://demagog.cz/politici/milos-zeman-168'), S('mediální archiv', 'iROZHLAS: Zeman v debatě ČT nemluvil pravdu ve 14 případech', 'https://www.irozhlas.cz/volby/prezidentska-debata-demagog-milos-zeman-jiri-drahos_1801260840_ako'), S('mediální archiv', 'Kauza Hitler je gentleman — přehled (Wikipedie/soudní spor)', 'https://cs.wikipedia.org/wiki/Kauza_Hitler_je_gentleman')] },
        toxicita: { text: 'Při setkání s Vladimirem Putinem v Pekingu 2017 v přítomnosti novinářů prohlásil, že novinářů je moc a \'měli by se likvidovat\'; Syndikát novinářů to označil za politicky i lidsky nevkusné vzhledem k zemi, kde byly desítky novinářů zabity.', src: [S('mediální archiv', 'Aktuálně.cz: Zeman u Putina o likvidaci novinářů', 'https://zpravy.aktualne.cz/domaci/je-treba-likvidovat-novinare-rikal-zeman-putinovi-staci-je-v/r~ec67a81e388211e7983b002590604f2e/')] },
        konzistence: { text: 'V roce 2007 odešel z ČSSD, v roce 2009 založil vlastní Stranu práv občanů – Zemanovci; po letech dřívějšího ostrého odmítání Andreje Babiše (kterého v roce 2011 veřejně kritizoval) se s ním sblížil a podporoval ho — spojenectví komentátoři i sám Kalousek popisují jako čistě pragmatický obrat.', src: [S('mediální archiv', 'Deník N: Zeman a Babiš — zlomové okamžiky spojenectví', 'https://denikn.cz/996278/zeman-a-babis-jak-funguje-spojenectvi-z-rozumu/'), S('mediální archiv', 'iROZHLAS: Zeman naznačil, že bude volit Babišovo ANO', 'https://www.irozhlas.cz/zpravy-domov/milos-zeman-tornado-jizni-morava-rozhovor-andrej-babis-milos-vystrcil_2106271107_kro')] },
        penize: { text: 'Financování jeho prezidentské kampaně bylo Transparency International vyhodnoceno jako nejméně důvěryhodné ze všech kandidátů kvůli netransparentnosti; mezi sponzory figurovaly firmy a osoby spojované s ruským okruhem (mj. okolo zbrojaře Strnada a Alexeje Beljajeva), přičemž jeden dar zbrojaře Strnada byl poslán skrytě přes autozastavárnu.', src: [S('mediální archiv', 'Seznam Zprávy: Skrytý dar zbrojaře Strnada poslán přes autozastavárnu', 'https://www.seznamzpravy.cz/clanek/domaci-kauzy-skryty-dar-zbrojare-strnada-milion-poslal-zemanovi-pres-autozastavarnu-291895'), S('mediální archiv', 'Transparency International: Miloš Zeman a jeho muži aneb Hrad s.r.o.', 'https://www.transparency.cz/kauzy/milos-zeman-a-jeho-muzi-aneb-hrad-s-r-o/')] },
      },
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
     SENÁTNÍ KANDIDÁTI
     Smyšlení kandidáti byli odstraněni. Oficiální listiny pro volby
     2026 vzniknou až po registraci (21. 7.–4. 8. 2026), takže zatím
     plníme jen doložené úřadující senátory obhajující mandát.
     Tracer: obvod 21 (Praha 5) — Václav Láska, úřadující senátor.
     ========================================================= */
  const SENAT = [
    person({
      id: 'laska', name: 'Václav Láska', party: 'SEN 21',
      role: 'senátor za obvod 21 (Praha 5), zakladatel a předseda hnutí Senátor 21',
      scope: 'senát', obvod: 21,
      photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/V%C3%A1clav_L%C3%A1ska.jpg/500px-V%C3%A1clav_L%C3%A1ska.jpg',
      dictum: 'Bývalý vyšetřovatel a šéf správní rady Transparency International, který kariéru strávil hledáním cizích máselných hlav — a sám si žádnou nenanesl. Jediná tečka v rejstříku je pokuta advokátní komory z roku 2013 za příliš ostrá slova na adresu jedné kanceláře. To je profesní přestřelení, ne zmrdství. Čistý štít.',
      lit: [],
      overrides: {
        konzistence: { text: 'V letech 2014–2017 byl členem Strany zelených, v prosinci 2017 odešel a založil vlastní hnutí Senátor 21, jehož je prvním předsedou. Jde o organizační obrat — protikorupční a prozápadní linie zůstává napříč obdobími konzistentní, žádný hodnotový veletoč.' },
        toxicita: { text: 'Jediný doložený incident: v roce 2013 mu Česká advokátní komora na stížnost kanceláře Šachta & Partners uložila pokutu 200 000 Kč za ostrá veřejná obvinění pronesená při protikorupční práci. Jednorázové profesní přestřelení během watchdog činnosti, nikoli vzorec dehonestace — osu proto nesvítíme.' },
      },
    }),
    person({
      id: 'zantovsky', name: 'Michael Žantovský', party: 'nestraník',
      role: 'diplomat, ředitel Knihovny Václava Havla, exsenátor; kandidát v obvodu 21 (2. kolo 2020)',
      scope: 'senát', obvod: 21,
      photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Michael_%C5%BDantovsk%C3%BD_%282022%29.jpg/500px-Michael_%C5%BDantovsk%C3%BD_%282022%29.jpg',
      dictum: 'Havlův mluvčí, velvyslanec ve třech zemích a senátor už v 90. letech — kariéra strávená v diplomatických službách bez jediné doložené tečky. Zmrdometr nemá co rozsvítit.',
      lit: [],
      overrides: {
        lze: { text: 'Demagog.cz eviduje jen několik ověřených výroků a žádný doložený vzorec nepravdivých či zavádějících tvrzení.' },
        konzistence: { text: 'Od 90. let (senátor za ODA 1996–2002) drží konzistentní prozápadní a liberálně-konzervativní linii navázanou na odkaz Václava Havla; v roce 2020 kandidoval s podporou koalice TOP 09, ODS a STAN. Žádný doložený názorový veletoč.' },
      },
    }),
    person({
      id: 'smoljak', name: 'David Smoljak', party: 'STAN',
      role: 'senátor za obvod 24 (Praha 9), scenárista a publicista',
      scope: 'senát', obvod: 24,
      photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/David_Smoljak.jpg/500px-David_Smoljak.jpg',
      dictum: 'Scenárista a publicista, který do Senátu přišel z kultury, ne z mocenských struktur — a za celý mandát si nevysloužil jedinou doloženou osu. Čistý štít.',
      lit: [],
      overrides: {
        lze: { text: 'Demagog.cz u Smoljaka nevede profil s doloženým vzorcem nepravd; faktograficky čistá osa.' },
        konzistence: { text: 'Dlouhodobě konzistentní občansko-liberální a prozápadní postoj; mandát získal a obhajuje za STAN s podporou Pirátů a TOP 09, bez doloženého obratu v klíčových postojích.' },
      },
    }),
    person({
      id: 'stehlik', name: 'Eduard Stehlík', party: 'ODS/KDU-ČSL',
      role: 'vojenský historik, exředitel ÚSTR; kandidát v obvodu 24 (2. kolo 2020)',
      scope: 'senát', obvod: 24,
      photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Senice_%E2%80%93_Silver_A_%E2%80%93_16_%28cropped%29.JPG/500px-Senice_%E2%80%93_Silver_A_%E2%80%93_16_%28cropped%29.JPG',
      dictum: 'Vojenský historik, jehož nejostřejší kauza — spor s bývalými podřízenými z ÚSTR — uvázla v rovině neprokázaného tvrzení. Doloženou osu zmrdometr nenašel.',
      lit: [],
      overrides: {
        toxicita: { text: 'Jako ředitel Ústavu pro studium totalitních režimů (2022–2023) čelil otevřenému dopisu 19 zaměstnanců, kteří mu vytýkali bossing a cenzuru. Stehlík obvinění odmítl; jím podanou žalobu na bývalé zaměstnance soud v listopadu 2023 zamítl. Tvrzení o bossingu zůstává neprokázané — osu proto nesvítíme.' },
        lze: { text: 'Bez doloženého vzorce nepravdivých výroků v ověřovacích databázích.' },
      },
    }),
    person({
      id: 'nemcova', name: 'Miroslava Němcová', party: 'ODS',
      role: 'senátorka za obvod 27 (Praha 1), expředsedkyně Poslanecké sněmovny',
      scope: 'senát', obvod: 27,
      photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Miroslava_N%C4%9Bmcov%C3%A1_ofici%C3%A1ln%C3%AD_2020.jpg/500px-Miroslava_N%C4%9Bmcov%C3%A1_ofici%C3%A1ln%C3%AD_2020.jpg',
      dictum: 'Ostrý jazyk vůči ruské agresi, který soud uznal za přípustnou politickou kritiku, a podíl nepravd pod hranicí soustavnosti — na rozsvícení osy to nestačí.',
      lit: [],
      overrides: {
        lze: { text: 'Demagog.cz u Němcové z 92 ověřených výroků eviduje 8 nepravdivých a 9 zavádějících (vedle 65 pravdivých) — dílčí, nikoli převažující pochybení; pod hranicí soustavnosti, kterou svítíme.' },
        toxicita: { text: 'V říjnu 2022 na sociální síti označila ruské agresory za \'parchanty\' a domácí přitakávače za \'pátou kolonu\'. Podané trestní oznámení skončilo zastavením stíhání a výrok byl posouzen jako přípustná politická kritika v kontextu války. Jednorázová ostrá polemika vůči vnějšímu agresorovi, nikoli vzorec dehonestace konkrétních osob — osu nesvítíme.' },
      },
    }),
    person({
      id: 'hampl', name: 'Václav Hampl', party: 'KDU-ČSL',
      role: 'exsenátor (2014–2020), exrektor Univerzity Karlovy; kandidát v obvodu 27 (2. kolo 2020)',
      scope: 'senát', obvod: 27,
      photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Prof._RNDr._V%C3%A1clav_Hampl%2C_DrSc.%282021%29.jpg/500px-Prof._RNDr._V%C3%A1clav_Hampl%2C_DrSc.%282021%29.jpg',
      dictum: 'Bývalý rektor, jehož docházka na hlasování Senátu dvě volební období výrazně zaostávala za průměrem — jediná osa, kterou data jednoznačně rozsvěcují.',
      lit: ['prace'],
      overrides: {
        prace: { text: 'Statistiky účasti na hlasování Senátu vykazují za období 2014–2016 účast 62,9 % a 2016–2018 účast 67,0 %, tedy výrazně pod obvyklým senátním průměrem; v dalším období se účast zvedla na 83,6 %. Dvě po sobě jdoucí období podprůměrné docházky jsou doložená.', src: [S('senát.cz', 'Statistika účasti na hlasování — Václav Hampl', 'https://www.senat.cz/informace/pro_media/statistiky/statistika_hlasovani.php?pid=280&obdobi=10'), S('kohovolit.eu', 'Hlasovací účast v Senátu', 'https://www.kohovolit.eu/')] },
        lze: { text: 'Demagog.cz eviduje ze 17 ověřených výroků 4 nepravdivé — dílčí pochybení pod hranicí soustavnosti, osu nesvítíme.' },
        toxicita: { text: 'V kampani 2020 se v obvodu objevil billboard s heslem o tom, že \'vysoká škola života nestačí\', mířený na chybějící vysokoškolské vzdělání protikandidátky Miroslavy Němcové. Jednorázový kampaňový osten ke konkrétnímu faktu, nikoli vzorec dehonestace — osu nesvítíme.' },
        zbabelost: { text: 'Z rektorského působení na Univerzitě Karlově je doložena kritika jeho postupu v kauze kolem nemovitosti v Opletalově ulici (2013); jednorázová epizoda bez doloženého opakovaného vzorce vyhýbání se odpovědnosti — osu nesvítíme.' },
      },
    }),
  ];

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
