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

  // ---- D-FENS taxonomie zmrda (10 znaků, dfens-cz.com 2001) — analytický druhý filtr ----
  const DFENS = [
    { n: 1,  label: 'Rád tlachá' },
    { n: 2,  label: 'Vysává cizí zásluhy' },
    { n: 3,  label: 'Líže kliky' },
    { n: 4,  label: 'Nekonzistentní' },
    { n: 5,  label: 'Neumí s lidmi' },
    { n: 6,  label: 'Hraje tvrdě zezadu' },
    { n: 7,  label: 'Neudělá nic pořádně' },
    { n: 8,  label: 'Dbá na image' },
    { n: 9,  label: 'Hraje na body' },
    { n: 10, label: 'Kolektivní' },
  ];
  const dfensById = {};
  DFENS.forEach((d) => { dfensById[d.n] = d; });

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
      id: 'babis', name: 'Andrej Babiš', party: 'ANO',
      role: 'premiér, předseda hnutí ANO',
      scope: 'celostátní', photo: 'assets/babis-portret.jpg',
      category: 'Systémový zmrd',
      categoryReason: 'Není exhibicionista jako Turek ani jen populista jako Okamura — je architekt celého ekosystému. Holding ve svěřenských fondech, dotace, loajální místopředsedové, vlastní fact-checkingový web proti Demagogu, soud, který běží přes tři volební období. Tichá efektivita a kolektivní organizace zmrdství — proto Systémový.',
      dictum: 'Učebnice systémového zmrdství: koncern převedený „nad rámec zákona“, dotace, které mezitím tečou dál, a kauza, kterou lze přežít déle, než trvá jedno volební období.',
      highlight: 'Čapí hnízdo. Vrchní soud v Praze v září 2025 zrušil osvobozující rozsudek a konstatoval, že Babiš i Jana Nagyová naplnili skutkovou podstatu dotačního podvodu a poškození finančních zájmů EU — transformace firmy byla podle soudu „účelové a formální vytvoření zdání“, že jde o nezávislý malý podnik. Hlavní líčení soud nestihl nařídit do říjnových voleb 2025; Babiš volby vyhrál a vinu dlouhodobě odmítá.',
      lit: ['lze', 'penize', 'konzistence', 'toxicita', 'zbabelost'],
      dfens: [
        { n: 3, why: 'Jiná tvář k Bruselu a partnerům než k voličům — střet zájmů „vyřešil daleko nad rámec zákonů“, audit EU tvrdí opak.' },
        { n: 6, why: 'Buduje a těží z neveřejných vazeb — odposlechy k mýtnému, kde Faltýnek „informoval šéfa“.' },
        { n: 8, why: 'Vlastní fact-checkingový web „Můj demagog“ proti Demagogu — řízení obrazu místo faktů.' },
        { n: 9, why: 'Politiku staví na nepříteli (média, „neziskovky“, Brusel), ne na řešení.' },
        { n: 10, why: 'Konglomerát ANO postavený na osobní loajalitě — Faltýnek, Schillerová, Vondráček, Nacher.' },
      ],
      overrides: {
        lze: { text: 'Demagog.cz z více než 1 160 ověřených výroků eviduje 138 nepravdivých a 122 zavádějících — např. nepravdivě nadsadil počet vojáků vyslaných do Estonska a délku sněmovní obstrukce uvedl jako 270 dní, ačkoliv trvala 75 dní.',
          src: [S('demagog.cz', 'Výroky Andreje Babiše — hodnocení', 'https://demagog.cz/politici/andrej-babis-183')] },
        penize: { text: 'Závěrečná zpráva auditu Evropské komise (2021) konstatuje, že Babiš nepřímo ovládá Agrofert přes svěřenské fondy a je ve střetu zájmů; dotace čerpané od 9. 2. 2017 označila za neoprávněné a požadovala vrácení části prostředků. V kauze Čapí hnízdo Vrchní soud v září 2025 zrušil osvobozující rozsudek a uvedl, že byla naplněna skutková podstata dotačního podvodu (nepravomocně).',
          src: [S('iROZHLAS', 'Závěrečná zpráva auditu EK — Babiš je ve střetu zájmů', 'https://www.irozhlas.cz/zpravy-domov/evropska-komise-prvni-audit-stret-zajmu-andrej-babis_2104232054_tzr'), S('iROZHLAS', 'Vrchní soud zrušil osvobozující rozsudek v kauze Čapí hnízdo', 'https://www.irozhlas.cz/zpravy-domov/kauza-capi-hnizdo-rozsudek-babis-nagyova-vrchni-soud_2509121403_pik')] },
        prace: { text: 'Bez doloženého systematického nálezu k této ose v rámci kalibrace; jeho sněmovní absence je dokumentována zvlášť a do svícení ji zde nezapočítávám.' },
        konzistence: { text: 'Slovenský soud v Bratislavě v říjnu 2024 schválil smír, podle kterého ministerstvo vnitra uznalo, že Babiš byl jako agent StB „Bureš“ evidován neoprávněně a vědomě nespolupracoval; slovenský ÚPN naopak trvá na tom, že je evidován oprávněně. Postoj ke střetu zájmů: tvrdí, že Agrofert nevlastní a střet „vyřešil nad rámec zákona“, audit EK ho označil za přetrvávající.',
          src: [S('iROZHLAS', 'Slovenské ministerstvo: Babiš s StB vědomě nespolupracoval, smír', 'https://www.irozhlas.cz/zpravy-domov/babis-podle-slovenskeho-ministerstva-s-stb-vedome-nespolupracoval-a-jako-agent_2410211658_vdv'), S('Echo24', '„Agrofert nevlastním, střet zájmů jsem vyřešil nad rámec zákonů“', 'https://m.echo24.cz/a/HrV57/zpravy-domov-andrej-babis-stret-zajmu-agrofert-dotace-evropska-komise')] },
        toxicita: { text: 'Nejvyšší soud potvrdil, že Babiš svými výroky o „zaplacených demonstrantech“ zasáhl do práv konkrétní účastnice protestů a musí se omluvit; výroky soud označil za nepodložené. Investigativnímu novináři Jaroslavu Kmentovi řekl: „Vy jste to prase novinářské, jste nejhorší novinářská žumpa.“',
          src: [S('iROZHLAS', 'Nejvyšší soud: výroky o zaplacených demonstrantech jsou nepodložené', 'https://www.irozhlas.cz/zpravy-domov/andrej-babis-nejvyssi-soud-jana-filipova-rozsudek-soudu-krajsky-soud-demonstrace_2202231100_bko'), S('Seznam Zprávy', '„Jste novinářské prase“ — výrok vůči J. Kmentovi', 'https://www.seznamzpravy.cz/clanek/audio-podcast-prohnili-jste-novinarske-prase-proc-babisovi-pred-kmentou-ujely-nervy-221072')] },
        zbabelost: { text: 'V kauze Čapí hnízdo přenáší odpovědnost na rodinné příslušníky a podřízené (jeho syn Andrej ml. byl podle médií odvezen na Krym v době vyšetřování). V odposleších k mýtnému Faltýnek hovořil o informování „šéfa“; Babiš znalost popírá a tvrdí „nevěděl jsem o tom“. Kauzu dlouhodobě označuje za politickou objednávku, vlastní odpovědnost nevyvozuje.',
          src: [S('Seznam Zprávy', 'Faltýnkovy odposlechy k mýtnému — „šéfa jsem informoval“', 'https://www.seznamzpravy.cz/clanek/domaci-kauzy-faltynek-v-odposlechu-k-mytnemu-sefa-jsem-informoval-285957'), S('iROZHLAS', 'Soud Čapí hnízdo — Babiš a okolnosti převodu firmy', 'https://www.irozhlas.cz/zpravy-domov/kauza-capi-hnizdo-rozsudek-babis-nagyova-vrchni-soud_2509121403_pik')] },
      },
    }),
    person({
      id: 'schillerova', name: 'Alena Schillerová', party: 'ANO',
      role: 'ministryně financí a místopředsedkyně vlády',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Schillerov%C3%A1_Raku%C5%A1an_2023_%28cropped%29.jpg/500px-Schillerov%C3%A1_Raku%C5%A1an_2023_%28cropped%29.jpg',
      category: 'Systémový zmrd',
      categoryReason: 'Není exhibicionistka jako Turek — funguje tiše a efektivně. Kombinuje rodinné finanční toky, blízkost k neveřejným státním informacím a selektivní fiskální morálku. Učebnicový produkt ekosystému ANO — proto Systémový, ne Populistický.',
      dictum: 'Méně viditelná verze systémového zmrdství: žádná exhibice, jen rodinné finance, státní informace na dosah a fiskální morálka, která platí vždycky jen pro druhé.',
      highlight: 'Zeť David Rusňák — miliardář a bývalý sponzor ANO — se přiznal k objednávání lustrací z neveřejných policejních databází; jeho trestní stíhání bylo podmíněně zastaveno týden předtím, než se Schillerová stala ministryní financí. K trestním kauzám dvou příbuzných sama tvrdí, že „o tom neví vůbec nic".',
      lit: ['lze', 'penize', 'konzistence', 'toxicita', 'zbabelost'],
      dfens: [
        { n: 3, why: 'Babišova věrná — jiná tvář ke šéfovi než navenek.' },
        { n: 6, why: 'Tiché těžení z blízkosti k neveřejným informacím (kauza FAU).' },
        { n: 8, why: 'Hlásá rozpočtovou odpovědnost, jako ministryně dělá pravý opak.' },
        { n: 10, why: 'Pevná součást konglomerátu ANO — účelová loajalita.' },
      ],
      overrides: {
        lze: { text: 'Demagog.cz z 159 ověřených výroků eviduje 18 nepravdivých a 22 zavádějících — např. nepravdivé tvrzení o chybějících zákonných přílohách rozpočtu 2026 a zavádějící dataci zavedení EET.',
          src: [S('demagog.cz', 'Výroky Aleny Schillerové — hodnocení', 'https://demagog.cz/politici/alena-schillerova-495')] },
        penize: { text: 'Ministerstvo financí pod jejím vedením zaplatilo 1,93 mil. Kč ze státních peněz fotografovi a kameramanovi pečujícím o její osobní Instagram a Facebook (policie kauzu odložila, přezkoumává státní zástupce). Firma Bika manžela, kde působí i syn, v rozporu se zákonem nezveřejnila účetní závěrku se zatajeným vkladem 13 mil.',
          src: [S('iROZHLAS', 'Propagace na sítích za 1,93 mil. ze státních peněz', 'https://www.irozhlas.cz/zpravy-domov/schillerova-fotky-propagace-instagram-policie-trestni-oznameni_2205201522_elev'), S('Neovlivní', 'Zatajených 13 milionů — firma manžela Bika', 'https://neovlivni.cz/zatajenych-13-milionu-tak-podnika-manzel-schillerove/')] },
        prace: { text: 'Jediná čistá osa — jako ministryně i předsedkyně klubu vykazovala vysokou aktivitu.' },
        konzistence: { text: 'Jako ministryně hájila schodek 310 mld jako neporušení zákona o rozpočtové odpovědnosti (na jehož přijetí se ANO podílelo) a vinu svalovala na minulou vládu; v opozici týmž metrem označovala rozpočty Stanjury za „nepravdivé a nerealistické". Národní rozpočtová rada její rozpočet označila za bezprecedentní.',
          src: [S('Echo24', 'Schodek 310 mld — zákon prý neporušila', 'https://www.echo24.cz/a/HXKtq/zpravy-ekonomika-rozpocet-zakon-neporusil-rika-schillerova-presto-chce-zmenu'), S('ČeskéNoviny', 'Rozpočtová rada: nesplní zásady odpovědnosti', 'https://www.ceskenoviny.cz/zpravy/rada-rozpocet-asi-nesplni-zasady-odpovednosti-je-to-bezprecedentni/2772495')] },
        toxicita: { text: 'Doložená dehonestující rétorika vůči vládě a oponentům — o jmenování ministryně řekla, že „politici si podali ruku s mafií", schůzi ke kampeličce přirovnala k „devadesátkám v Bogotě".',
          src: [S('CNN Prima', '„Podali si ruku s mafií"', 'https://cnn.iprima.cz/schillerova-fialovi-ministri-si-podali-ruku-s-mafii-proc-nema-ze-jmenovani-decroix-radost-477214'), S('Blesk', '„Jako devadesátky v Bogotě"', 'https://www.blesk.cz/clanek/zpravy-politika/783400/ano-narazilo-se-schuzi-ke-kampelicce-kde-mel-penize-fiala-jako-devadesatky-v-bogote-hrimala-schillerova.html')] },
        zbabelost: { text: 'V kauze „zakleknutí" na firmu FAU u soudu jako svědkyně vypověděla, že o neveřejné informace z živého daňového řízení „nežádala" a „není si toho vědoma"; k trestním kauzám zetě a dalšího příbuzného (vynášení policejních spisů) uvedla, že „o tom neví vůbec nic". Osobní odpovědnost nevyvodila.',
          src: [S('iROZHLAS', '„Nejsem si toho vědoma" — výpověď v kauze FAU', 'https://www.irozhlas.cz/zpravy-domov/nejsem-si-toho-vedoma-schillerova-u-soudu-vypovedela-ze-si-informace-o-fau_2406241647_kma'), S('Seznam Zprávy', 'Kšefty s policejními spisy a rodina Schillerové', 'https://www.seznamzpravy.cz/clanek/domaci-kauzy-kauza-kseftu-s-policejnimi-spisy-ma-dalsi-spojnici-s-rodinou-schillerove-228044')] },
      },
    }),
    person({
      id: 'havlicek', name: 'Karel Havlíček', party: 'ANO',
      role: 'ministr průmyslu a obchodu, 1. místopředseda vlády',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Karel_Havl%C3%AD%C4%8Dek_akademicky-snem-duben-2026_03_%28cropped%29.jpg/500px-Karel_Havl%C3%AD%C4%8Dek_akademicky-snem-duben-2026_03_%28cropped%29.jpg',
      category: 'Hraniční případ',
      categoryReason: 'Havlíček není architekt zmrdství — je jeho spolehlivý vykonavatel. Vlastní dotační minulost a kalkul kolem Rosatomu ho drží nad čistou nulou, ale chybí mu systém i iniciativa Babiše či tichý profit Schillerové. Technokrat v nesprávném dresu — proto jen hraniční, ne plnokrevný.',
      dictum: 'Není architekt zmrdství, je jeho spolehlivý vykonavatel — jenže vykonavatel s vlastním dotačním ocasem a ochotou hrát si s národní bezpečností.',
      highlight: 'Rosatom na Dukovany. Tajné služby (BIS, ÚZSI, Vojenské zpravodajství, NÚKIB) jednotně varovaly, opozice žádala rezignaci — Havlíček tlačil dál a o bezpečnostním dotazníku pro ruskou firmu rozhodl na poslední chvíli bez souhlasu vlády. Otočil teprve když atentát ve Vrběticích pokračování znemožnil. Není to přesvědčení — je to politická kalkulace s národní bezpečností jako vstupenkou.',
      lit: ['penize', 'konzistence'],
      dfens: [
        { n: 3, why: 'Babišův loajalista — veřejně hájil střet zájmů svého šéfa.' },
        { n: 8, why: 'Prezentuje se jako odborník-technokrat, rozhoduje ale politicky.' },
        { n: 9, why: 'Prosazování proti jednotnému varování expertů jako mocenské gesto.' },
      ],
      overrides: {
        penize: { text: 'Jako ministr průmyslu devět dní před odchodem z resortu podepsal kompenzace za drahé energie čtyřem firmám Babišova holdingu Agrofert (Synthesia, Precheza, Deza, Lovochemie) v objemu zhruba 49,4 mil. Kč — poté, co je jeho náměstek Eduard Muřický odmítl kvůli střetu zájmů; šéf Transparency International Petr Leyer uvedl, že firmy na ně neměly nárok a Havlíček porušil zákon. Investigativní reportáže (Reportér magazín) dokumentují i jeho roli investora a člena představenstva firem napojených na dotační kauzy — mj. Technistone v době podání dotace později řešené jako podvod a projekt kmenových buněk nabízející neúčinnou léčbu nevyléčitelně nemocným.',
          src: [S('Seznam Zprávy', 'Šéf Transparency: Havlíček pomohl Agrofertu a porušil zákon', 'https://www.seznamzpravy.cz/clanek/domaci-babis-sef-transparency-havlicek-pomohl-agrofertu-a-porusil-zakon-197473'), S('Seznam Zprávy', 'Babišovy firmy žádaly o náhradu za drahou elektřinu, pomohl Havlíček', 'https://www.seznamzpravy.cz/clanek/domaci-politika-babisovy-firmy-zadaly-o-nahradu-za-drahou-elektrinu-pomohl-havlicek-197212'), S('Reportér magazín', '50 milionů je pryč — dotační podvod, v němž se Havlíček objevuje', 'https://reportermagazin.cz/73103/50-milionu-je-navzdy-pryc-pribeh-dotacniho-podvodu-v-nemz-se-dvakrat-objevuje-karel-havlicek/')] },
        konzistence: { text: 'V tendru na dostavbu Dukovan měsíce prosazoval účast ruského Rosatomu navzdory jednotnému varování tajných služeb; o bezpečnostním dotazníku rozhodl na poslední chvíli bez souhlasu vlády a bez vědomí vládního zmocněnce. Otočil teprve po odhalení ruské stopy ve Vrběticích.',
          src: [S('Transparency International', 'Chaotický tendr na Dukovany ohrožuje bezpečnost ČR', 'https://www.transparency.cz/chaoticky-a-netransparentni-tendr-na-dukovany-ohrozuje-bezpecnostni-i-ekonomicke-zajmy-cr-ministr-havlicek-prosazuje-nezakonnou-vyjimku/'), S('Aktuálně.cz', 'Havlíček tendr změnil, aby v něm udržel Rosatom', 'https://zpravy.aktualne.cz/domaci/jaderny-lobbista-havlicek-tendr-na-dostavbu-dukovan-zmenil/r~4786f7c417b611ecbc3f0cc47ab5f122/')] },
        prace: { text: 'Bez záznamu — spíše přetížen třemi funkcemi najednou než absentér.' },
      },
    }),
    person({
      id: 'turek', name: 'Filip Turek', party: 'Motoristé sobě',
      role: 'europoslanec (2024–2025), poslanec PSP, čestný předseda hnutí, nenominovaný kandidát na ministra',
      scope: 'celostátní', photo: 'assets/turek-1.jpg', photoPos: '57% 46%',
      gallery: [
        { img: 'assets/turek-1.jpg', caption: 'Filip Turek hajluje z kabrioletu. On tvrdí, že jen mává.' },
        { img: 'assets/turek-2.jpg', caption: 'Filip Turek hledá v hospodě zapomenutý mobil.' },
        { img: 'assets/turek-3.jpg', caption: 'Filip Turek si gratuluje, jak porazil dítě.' },
      ],
      category: 'Exhibicionistický zmrd',
      categoryReason: 'Není tichý systémový hráč jako Babiš — staví celou kariéru na otevřené provokaci a kultu osobnosti. Problém nastává ve chvíli, kdy musí provokaci zpětně popřít: archiv příspěvků existuje, on tvrdí „diskreditační kampaň“. Exhibicionista, který se lekl vlastní výlohy — proto tahle kategorie, ne Populistický.',
      dictum: 'Závodník, který jezdil na image a teď couvá od vlastní stopy: 42 stran smazaných postů a jediná obrana je „to jsem nebyl já“.',
      highlight: 'V říjnu 2025 Deník N zveřejnil archiv Turkových smazaných facebookových příspěvků — rasistické, sexistické a homofobní výroky včetně odkazů na Hitlera a Mussoliniho, Obamu označil rasovou nadávkou a upálení tříleté Romky Natálky popsal jako „polehčující okolnost“. Účet Štít demokracie doložil 42 stran postů s časovými razítky; autorství screenshotů na sebe vzal jeho bývalý přítel. Turek autorství popřel a mluví o „diskreditační kampani“. Policie kauzu prověřuje pro podezření z několika trestných činů. 7. ledna 2026 prezident Pavel odmítl Turka jmenovat ministrem s odkazem na ohrožení ústavních hodnot.',
      lit: ['lze', 'prace', 'konzistence', 'toxicita', 'zbabelost'],
      dfens: [
        { n: 4, why: 'Postoj i verze událostí mění podle toho, co se zrovna hodí — od „to jsem psal“ po „to nejsem já“.' },
        { n: 8, why: 'Celá kariéra je budovaná na image provokatéra-závodníka; jakmile image ohrozí archiv, maže stopy.' },
        { n: 9, why: 'Politika jako spektákl a drcení oponentů, ne řešení agendy — z EP odešel bez doloženého legislativního výstupu.' },
        { n: 10, why: 'Účelové spojenectví Motoristů s ANO a SPD kolem vládních postů.' },
      ],
      overrides: {
        lze: { text: 'Deník N v říjnu 2025 zveřejnil archiv jeho smazaných příspěvků s rasistickými, sexistickými a homofobními výroky a odkazy na Hitlera a Mussoliniho; účet Štít demokracie doložil 42 stran postů s časovými razítky a URL. Turek autorství popírá a tvrdí, že jde o manipulaci a diskreditační kampaň, ač experti i podle Deníku přílohou doloženou manipulaci celého rozsahu vyloučili.',
          src: [S('Deník', 'Experti: manipulaci s účty Turka vyloučit nelze, příspěvků je ale hodně', 'https://www.denik.cz/z_domova/turek-prispevky-rasismus-screenshot-manipulace.html'), S('Aktuálně.cz', '„Obama je neg*.“ Turkův údajný rasismus na Facebooku', 'https://zpravy.aktualne.cz/domaci/pravdepodobny-ministr-zahranici-v-nove-vlade-a-soucasny-euro/r~78d9aab4a67411f0bb77ac1f6b220ee8/')] },
        prace: { text: 'V Evropském parlamentu (2024–2025) odešel po zvolení do PSP pro neslučitelnost mandátů bez doloženého legislativního výstupu; v expertním hodnocení Czech MEPs mu chyběl reálný vliv. Z Bruselu sám oznámil odchod „sbalit si kancelář“.',
          src: [S('Deník', '„Půjdu si do kanceláře sbalit.“ Turek v Bruselu končí', 'https://www.denik.cz/z_domova/vysledky-voleb-2025-filip-turek-europarlament-motoriste-poslanecka-snemovna.html'), S('Echo24', 'Čeští europoslanci handlují posty, Turek může skončit zcela bez vlivu', 'https://www.echo24.cz/a/HdtU4/zpravy-zahranici-cesti-europoslanci-europarlament-dostalova-turek-stan-eurovolby-2024')] },
        konzistence: { text: 'K vlastním příspěvkům uvedl protichůdné verze — k části se omluvil, autorství jiných popřel; ke kauzám se opakovaně vrací jiným vysvětlením. K výhrůžce zaměstnanci ambasády nejprve mlčel, poté ji zlehčoval jako ochranu přítelkyně.',
          src: [S('CNN Prima', '„Absolutně to odmítám“ — Turek za zprávou vidí diskreditační kampaň', 'https://cnn.iprima.cz/absolutne-to-odmitam-reaguje-turek-na-sve-udajne-drivejsi-prispevky-za-zpravou-vidi-diskreditacni-kampan-488357'), S('iROZHLAS', '„Nakreslil jsem šibenici, aby to pochopil“ — verze událostí u ambasády', 'https://www.irozhlas.cz/zpravy-domov/nakreslil-jsem-sibenici-aby-pochopil-turek-pred-8-lety-vyhrozoval-zamestnanci_2510150500_vtk')] },
        toxicita: { text: 'Před osmi lety vyhrožoval zaměstnanci saúdskoarabské ambasády — za stěrač auta vložil nakreslenou šibenici a na vůz položil náboj; Saúdská Arábie kvůli tomu zaslala diplomatickou nótu a věc řešilo ministerstvo zahraničí. Případ byl překvalifikován na přestupek proti občanskému soužití a úřad Prahy 6 uložil pokutu. Doloženy též rasistické a dehonestující výroky vůči konkrétním osobám.',
          src: [S('iROZHLAS', 'Turek před 8 lety vyhrožoval zaměstnanci saúdskoarabské ambasády', 'https://www.irozhlas.cz/zpravy-domov/nakreslil-jsem-sibenici-aby-pochopil-turek-pred-8-lety-vyhrozoval-zamestnanci_2510150500_vtk'), S('Echo24', 'Vyhrožoval obrázkem šibenice, Saúdská Arábie poslala nótu', 'https://www.echo24.cz/a/HtfpC/zpravy-domov-dalsi-problem-turek-vyhruzka-obrazek-sibenice-saudska-arabie-nota')] },
        zbabelost: { text: 'Autorství zveřejněných příspěvků popírá a označuje je za cílenou manipulaci a diskreditační kampaň; důkazní břemeno přesouvá na novináře. Policie kauzu smazaných příspěvků prověřuje pro podezření z několika trestných činů.',
          src: [S('iROZHLAS', 'Policie prověřuje kauzu smazaných Turkových příspěvků, podezření z několika trestných činů', 'https://www.irozhlas.cz/zpravy-domov/policie-proveruje-kauzu-smazanych-turkovych-prispevku-ma-podezreni-na-nekolik_2510151132_ako'), S('Česká justice', '„Důkazy o rasismu musí předložit novináři“ — Turek přesouvá břemeno', 'https://www.ceska-justice.cz/2025/10/dukazy-o-rasismu-musi-predlozit-novinari/')] },
        penize: { text: 'Bez doloženého systému čerpání veřejných prostředků či dotačního střetu — peníze nejsou jeho linií.' },
      },
    }),
    person({
      id: 'okamura', name: 'Tomio Okamura', party: 'SPD',
      role: 'předseda SPD, předseda Poslanecké sněmovny',
      scope: 'celostátní', photo: 'assets/okamura-2.jpg', photoPos: '46% 30%',
      gallery: [
        { img: 'assets/okamura-1.jpg', caption: 'Tomio má rád bichty.' },
        { img: 'assets/okamura-2.jpg', caption: 'Tomio ukazuje velikost svého pindíka.' },
        { img: 'assets/okamura-3.jpg', caption: 'Tomio se modlí, aby se nedostal do politiky.' },
        { img: 'assets/okamura-4.jpg', caption: 'Tomio jako hrdý český vlastenec.' },
      ],
      category: 'Populistický zmrd',
      categoryReason: 'Lež a nepřítel jsou u Okamury nástroje, ne vedlejší produkt — potřebuje migranta na plakátu a krátkou paměť voličů. Není systémový hráč budující tichý ekosystém jako Babiš; je hlasitý mechanik strachu. Proto Populistický, ne Systémový. Pracovitost mu přitom upřít nelze — to je jeho čistý roh.',
      dictum: 'Profesionál politiky strachu: 114 nepravd a 76 zavádějících výroků u Demagogu, plakáty, které soud přirovnal k nacistické propagandě, a obžaloba za podněcování nenávisti.',
      highlight: 'Předvolební kampaň SPD 2024 s vyobrazením migrantů a nožů — jeden z billboardů stál na Václavském náměstí. Státní zástupce v roce 2025 podal na Okamuru a SPD obžalobu za podněcování k nenávisti a navrhl podmíněný a peněžitý trest. Nejvyšší správní soud kampaň přirovnal k tomu, jak nacistická a komunistická propaganda zobrazovala příslušníky jiných ras a tříd. Okamura odmítl kampaň obhajovat před sněmovním výborem řešícím jeho vydání ke stíhání.',
      lit: ['lze', 'konzistence', 'toxicita', 'zbabelost'],
      dfens: [
        { n: 4, why: 'Postoje i koalice mění podle aktuální výhody — od Úsvitu k SPD, od antisystémovosti k vyjednávání o vládních postech.' },
        { n: 5, why: 'SPD vede jako vůdcovskou strukturu loajalistů; kritici a odštěpenci odcházejí.' },
        { n: 9, why: 'Potřebuje nepřítele k rozdrcení — migrant, novinář, „vlastizrádci“ — ne řešení problému.' },
        { n: 10, why: 'Účelová koaliční spojenectví s ANO a Motoristy po volbách 2025.' },
      ],
      overrides: {
        lze: { text: 'Demagog.cz z 466 ověřených výroků eviduje 114 nepravdivých a 76 zavádějících — např. nepravdivé tvrzení, že v Praze je cizincem každý třetí obyvatel (dle dat ČSÚ je to každý čtvrtý). Soud mu uložil omluvit se dvěma europoslancům za nepravdivé tvrzení, že hlasovali pro sankce vůči ČR za nepřijímání migrantů.',
          src: [S('demagog.cz', 'Výroky Tomia Okamury — 114 nepravd, 76 zavádějících z 466', 'https://demagog.cz/politici/tomio-okamura-180'), S('Aktuálně.cz', 'Okamura lhal o europoslancích, za výroky o vlastizrádcích se musí omluvit', 'https://zpravy.aktualne.cz/domaci/okamura-lhal-o-ceskych-europoslancich/r~4a4c8b1267a911eb9d74ac1f6b220ee8/')] },
        konzistence: { text: 'Politickou kariéru postavil na střídání projektů a koalic — od hnutí Úsvit přímé demokracie, z něhož odešel, k založení SPD; antisystémovou rétoriku kombinuje s vyjednáváním o vládních postech po volbách 2025.',
          src: [S('Wikipedie', 'Svoboda a přímá demokracie — vznik z rozkolu s hnutím Úsvit', 'https://cs.wikipedia.org/wiki/Svoboda_a_p%C5%99%C3%ADm%C3%A1_demokracie'), S('demagog.cz', 'Dlouhodobý profil výroků a postojů Okamury', 'https://demagog.cz/politici/tomio-okamura-180')] },
        toxicita: { text: 'Státní zástupce v roce 2025 podal obžalobu na Okamuru a SPD za podněcování k nenávisti kvůli předvolebním plakátům z roku 2024; navrhl podmíněný a peněžitý trest. Nejvyšší správní soud kampaň přirovnal ke způsobu, jakým nacistická a komunistická propaganda zobrazovala příslušníky jiných ras. Soud mu dříve uložil omluvit se za označení novinářů za „mediální žumpu“.',
          src: [S('ČT24', 'Státní zástupce podal obžalobu na Okamuru a SPD za podněcování k nenávisti', 'https://ct24.ceskatelevize.cz/clanek/domaci/statni-zastupce-podal-obzalobu-na-okamuru-a-spd-za-podnecovani-k-nenavisti-363800'), S('Deník N', 'Soud přirovnal kampaň SPD k nacistické a komunistické propagandě', 'https://denikn.cz/1881690/podoba-se-nacisticke-a-komunisticke-propagande-soud-ostre-zkritizoval-kampan-spd')] },
        zbabelost: { text: 'K vydání ke stíhání kvůli billboardové kampani odmítl přijít na sněmovní výbor a odmítl kampaň obhajovat; vydání označil za útok na svobodu slova. Za dehonestaci médií se omluvil až na základě pravomocného rozhodnutí soudu.',
          src: [S('iROZHLAS', 'Okamura nepřijde na výbor, odmítá obhajovat kampaň SPD', 'https://www.irozhlas.cz/zpravy-domov/tomio-okamura-spd-trestni-stihani-billboard-vaclavske-namesti_2502020944_ako'), S('Aktuálně.cz', 'Okamura se musí omluvit za výroky o „mediální žumpě“, rozhodl soud', 'https://zpravy.aktualne.cz/domaci/okamura-se-musi-omluvit-za-sve-vyroky-o-medialni-zumpe/r~660515e4bda111e9970a0cc47ab5f122/')] },
        prace: { text: 'Čistý roh — jako předseda strany i sněmovny vykazuje vysokou aktivitu, absentérství doloženo není.' },
        penize: { text: 'Bez doloženého systémového čerpání dotací či zakázek ve střetu zájmů; spor o přiznání podílu na restauraci skončil v jeho prospěch pod prahem ohlašovací povinnosti.' },
      },
    }),
    person({
      id: 'vondracek', name: 'Radek Vondráček', party: 'ANO',
      role: 'expředseda Poslanecké sněmovny, advokát',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Radek_Vondr%C3%A1%C4%8Dek_2019_%28cropped%29.jpg/500px-Radek_Vondr%C3%A1%C4%8Dek_2019_%28cropped%29.jpg',
      category: 'Hraniční případ',
      categoryReason: 'Nemá Babišův dotační stroj ani Faltýnkovu síť — má doloženou advokátní minulost u odsouzených lichvářů, cestu za sankcionovanými ruskými politiky a sklony k vulgárním gestům z předsednického křesla. Dvě až tři osy, žádný vlastní systém — proto Hraniční, ne plnokrevný zmrd.',
      dictum: 'Předseda Sněmovny, který za dialog s lidmi ze sankčního seznamu „se nestydí“ a jako advokát posloužil i pravomocně odsouzeným lichvářům.',
      highlight: 'Jako předseda Sněmovny jel v říjnu 2018 do Moskvy a jednal s Vjačeslavem Volodinem a Valentinou Matvijenkovou — oběma na sankčním seznamu EU i USA po anexi Krymu. Ministerstvo zahraničí připravilo kritické prohlášení, nový ministr Petříček ho po konzultaci s vicepremiérem Hamáčkem stáhl. Vondráček obhajoval, že „sankční seznam není klatba“.',
      lit: ['penize', 'toxicita'],
      dfens: [
        { n: 3, why: 'Vstřícnost k Moskvě a dialog se sankcionovanými — jiná tvář navenek než proklamovaná hodnotová linie.' },
        { n: 8, why: 'Gesta a image z předsednického křesla (kytara na stole, prostředníček) místo důstojnosti úřadu.' },
      ],
      overrides: {
        penize: { text: 'Investigativní reportáže Hospodářských novin (červen 2021) doložily jeho advokátní vazby na dvojici kroměřížských lichvářů Miroslava Kolmana a Rudolfa Cieslu, pravomocně odsouzených za úvěrové podvody. Vondráček HN za reportáž zažaloval; Obvodní soud pro Prahu 8 jeho žalobu v březnu 2022 zamítl (nepravomocně), čímž potvrdil pravdivost reportáže.',
          src: [S('Hospodářské noviny', 'Advokát lichvářů Vondráček prohrál spor s HN', 'https://domaci.hn.cz/c1-67048980-advokat-lichvaru-vondracek-prohral-spor-s-hn-jeho-zalobu-smetl-soud-ze-stolu')] },
        prace: { text: 'Bez doloženého záznamu nadprůměrné neúčasti.' },
        konzistence: { text: 'Bez jednoznačně doloženého obratu kabátu nad rámec setrvalé loajality k Babišovi — osu nesvítím.' },
        toxicita: { text: 'Jako předseda Sněmovny opakovaně vztyčil z předsednického křesla na adresu kolegů zdvižený prostředníček; gesto označil za „legraci“ a posléze se omluvil. K cestě do Ruska uvedl, že Česko si škodí, když „chce být papežštější než papež“.',
          src: [S('iROZHLAS', 'Vondráček ukázal na plénu zdvižený prostředníček', 'https://www.irozhlas.cz/zpravy-domov/radek-vondracek-zdvizeny-prostrednicek-poslanecka-snemovna-vulgarni-gesto_2001221033_ako'), S('Respekt', 'Vondráček se v Rusku setká s politiky ze sankčního seznamu', 'https://www.respekt.cz/politika/respekt-vondracek-se-v-rusku-setkani-s-politiky-ze-sankcniho-seznamu')] },
      },
    }),
    person({
      id: 'faltynek', name: 'Jaroslav Faltýnek', party: 'ANO',
      role: 'expmístopředseda hnutí ANO, expposlanec',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Jaroslav_Faltynek.jpg',
      category: 'Systémový zmrd',
      categoryReason: 'Není to tvář ani řečník — je to zákulisní operátor. Babišova „pravá ruka“, spoluobviněný v Čapím hnízdě, postava odposlechů k mýtnému a vlastního „diáře“ plného poznámek o zakázkách a dotacích. Žádná exhibice, jen sítě, vazby a tichý lobbing — proto Systémový, ne Populistický.',
      dictum: 'Kmotrovský model v dresu hnutí, které slibovalo s kmotry skoncovat: žádné projevy, jen telefonáty, diář a věta „šéfa jsem informoval“.',
      highlight: 'Odposlechy k mýtnému. V policejních záznamech padlo jméno „šéfa“ Babiše 42krát na 116 stranách; Faltýnek podle nich zařizoval zákulisní krytí firmy Kapsch v tendru na mýtné a tlačil přes předsedu ÚOHS Petra Rafaje. „Já už jsem o tom šéfovi řekl, informuji ho,“ zní v přepisu. Policie i státní zástupce řízení nakonec odložili — Faltýnek vinu odmítá.',
      lit: ['penize', 'konzistence', 'zbabelost'],
      dfens: [
        { n: 2, why: 'Přivlastňuje a rozděluje cizí agendu — zakázky a posty v městských firmách dle diáře.' },
        { n: 6, why: 'Klasický hráč zezadu — odposlechy k mýtnému, lobbing přes ÚOHS, neveřejné informace.' },
        { n: 10, why: 'Uzel konglomerátu ANO — propojuje politiku, byznys a dotace pro spřízněné (Černošek).' },
      ],
      overrides: {
        penize: { text: 'Uniklý „diář“ z let 2015–2017, jehož části zveřejnily Seznam Zprávy, obsahoval poznámky o rozdělování veřejných zakázek, dotací a postů v městských firmách v Praze a na Moravě; média popsala mj. dotace pro sportovního funkcionáře a Faltýnkova souseda Miroslava Černoška. Diářem se zabývala NCOZ; Faltýnek tvrdí, že se o dotace „zajímal obecně“.',
          src: [S('Seznam Zprávy', 'Faltýnek a jeho diář — zakázky, dotace, posty', 'https://www.seznamzpravy.cz/clanek/faltynek-a-jeho-diar-skutecny-vlastnik-ja-a-dalsi-dukazy-v-kauze-149932'), S('iROZHLAS', 'Faltýnkův diář zkoumá NCOZ', 'https://www.irozhlas.cz/zpravy-domov/faltynek-denik-zapisnik-diar-cernosek_2104080608_pj')] },
        konzistence: { text: 'V kauze Čapí hnízdo byl jedním z původně obviněných (stíhání zastaveno 2018); u soudu opakovaně tvrdí, že jde o „uměle vytvořenou kauzu s cílem odstranit Babiše z politiky“, a celý skutek popírá. Veřejně dlouhodobě hájí Babišův střet zájmů.',
          src: [S('iROZHLAS', 'Faltýnek: „Je to uměle vytvořená kauza“', 'https://www.irozhlas.cz/zpravy-domov/kauza-capi-hnizdo-zastaveni-stihani-jaroslav-faltynek-andrej-babis-saroch_1909131414_zit')] },
        prace: { text: 'Bez doloženého záznamu nadprůměrné neúčasti — naopak vykazoval intenzivní zákulisní aktivitu.' },
        zbabelost: { text: 'V odposleších k mýtnému podle přepisu informoval „šéfa“ Babiše o jednáních s ÚOHS; Babiš znalost popírá a tvrdí, že od něj „žádný mandát neměl“. Odpovědnost za obsah diáře svedl na bývalou partnerku, která ho měla bez jeho vědomí ofotografovat.',
          src: [S('Seznam Zprávy', 'Faltýnek v odposlechu k mýtnému — „šéfa jsem informoval“', 'https://www.seznamzpravy.cz/clanek/domaci-kauzy-faltynek-v-odposlechu-k-mytnemu-sefa-jsem-informoval-285957'), S('iROZHLAS', 'Faltýnek: diář mi ofotila expartnerka, ať to prošetří policie', 'https://www.irozhlas.cz/zpravy-domov/jaroslav-faltynek-diar-trestni-oznameni-policie-sportovni-dotace_2104071217_kro')] },
      },
    }),
    person({
      id: 'nacher', name: 'Patrik Nacher', party: 'ANO',
      role: 'poslanec, expkandidát na pražského primátora',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Patrik_Nacher_2020_%28cropped%29.jpg/500px-Patrik_Nacher_2020_%28cropped%29.jpg',
      category: 'Vohnout',
      categoryReason: 'Učebnicový vohnout: loajální obhájce, který opakovaně veřejně popírá Babišův střet zájmů, a postava na výplatní pásce PR agentury Home Creditu z doby čínské kampaně. Neiniciuje vlastní kauzy ani netěží vlastní systém — jen líže kliky a kryje šéfa. Placené ohýbání, ne architektura — proto Vohnout, ne Hraniční.',
      dictum: 'Tváří se jako ochránce spotřebitele před bankami, sociální sítě mu přitom spravovala agentura, kterou si Home Credit najal na vylepšování obrazu Číny.',
      highlight: 'PR agentura C&B Reputation Management, kterou si Kellnerův Home Credit najal na zlepšení obrazu Číny v ČR, uvádí ve svých výkazech získaných Aktuálně.cz i „přípravu reakce opozice na pražském magistrátu na spor Praha–Peking“. Nacher připustil, že mu C&B spravuje sociální sítě, spolupráci v záležitosti Praha–Peking ale odmítl.',
      lit: ['penize'],
      dfens: [
        { n: 3, why: 'Loajální obhájce — opakovaně veřejně popírá Babišův střet zájmů.' },
        { n: 8, why: 'Buduje image nezávislého experta na finance, fakticky napojen na PR firmu velkého věřitele.' },
      ],
      overrides: {
        penize: { text: 'Podle dokumentů agentury C&B Reputation Management získaných Aktuálně.cz (kampaň ~2 000 hodin práce duben–srpen 2019, zadavatel Home Credit P. Kellnera) figuruje příprava reakce opozice na magistrátu ve sporu Praha–Peking; Nacher připustil, že mu agentura spravuje sociální sítě, ale řízení postupu vůči koalici odmítl.',
          src: [S('Aktuálně.cz', 'Kritici Číny v hledáčku Home Creditu — placené materiály pro politiky', 'https://zpravy.aktualne.cz/domaci/kritici-ciny-v-hledacku-kellnerova-home-creditu-tajne-platil/r~dc0e28241a8111eaa24cac1f6b220ee8/'), S('Hospodářské noviny', 'Home Credit zasahoval do politiky přes najatou agenturu', 'https://domaci.hn.cz/c1-66692280-home-credit-zasahoval-i-do-politiky-firmou-najata-agentura-pripravovala-materialy-pro-politiky-a-monitorovala-senatora')] },
        prace: { text: 'Bez doloženého záznamu nadprůměrné neúčasti — patří k aktivním řečníkům klubu.' },
        konzistence: { text: 'Bez jednoznačně doloženého obratu postojů — osu nesvítím.' },
        toxicita: { text: 'Doloženy ostré verbální spory (s europoslancem Zdechovským), nedosahují však úrovně systematické dehonestace konkrétních osob — osu nesvítím.' },
      },
    }),
    person({
      id: 'dostalova', name: 'Klára Dostálová', party: 'ANO',
      role: 'expministryně pro místní rozvoj, poslankyně',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/1718282852630_20240611_DOSTALOVA_Klara_CZ_005.jpg/500px-1718282852630_20240611_DOSTALOVA_Klara_CZ_005.jpg',
      category: 'Hraniční případ',
      categoryReason: 'Není architekt zmrdství ani jeho hlasitá tvář — je úřednice, která podle policie obcházela pravidla ve prospěch zakázek a sebe. Kauza CzechTourism byla po třech letech odložena s tím, že jednání bylo „nemorální a v rozporu s pravidly“, ale netrestné. Dílčí doložený prohřešek bez systému — proto Hraniční.',
      dictum: 'Ministryně, jejíž jednání policie popsala jako „nemorální a v rozporu s pravidly hospodaření veřejného sektoru“ — jen ne dost trestné na obžalobu.',
      highlight: 'Kauza CzechTourism. Policie po tříletém vyšetřování v červenci 2022 řízení odložila, přesto popsala šest konkrétních zakázek, do nichž Dostálová zasáhla bez kompetence — mj. reklamní banner na brněnském okruhu (deklarovaných 99 tisíc Kč) účelově sjednaný hlavně kvůli deseti VIP vstupenkám na Grand Prix, z nichž dvě dostala ministryně. Závěr: jednání nemorální, leč netrestné.',
      lit: ['penize'],
      dfens: [
        { n: 3, why: 'Loajální obhájkyně — připravovala odpověď na audit EK o střetu zájmů svého šéfa Babiše.' },
        { n: 7, why: 'Účelové, formálně zakryté zakázky bez reálného plnění (fiktivní smlouva na dokument).' },
      ],
      overrides: {
        penize: { text: 'V kauze CzechTourism policie identifikovala šest zakázek, do nichž Dostálová bez kompetence zasáhla: účelový banner na brněnském okruhu kvůli VIP vstupenkám, dofakturaci 200 tis. Kč za dokument formou smlouvy, kterou policie označila za fiktivní, a podle médií i úhradu auta pro manžela z parlamentního rozpočtu. Řízení bylo v červenci 2022 po třech letech odloženo — jednání policie označila za nemorální, nikoli trestné.',
          src: [S('Seznam Zprávy', 'Nejen auto pro manžela — Dostálová tlačila zakázky, řekla policie', 'https://www.seznamzpravy.cz/clanek/domaci-kauzy-nejen-auto-pro-manzela-dostalova-tlacila-zakazky-na-turistiku-rekla-policie-211151'), S('iROZHLAS', 'Policie odložila část kauzy CzechTourism, figurovala i Dostálová', 'https://www.irozhlas.cz/zpravy-domov/czechtourism-policie-dotace-zneuziti-pravomoce-ano-klara-dostalova_2207121730_vtk')] },
        prace: { text: 'Bez doloženého záznamu nadprůměrné neúčasti.' },
        konzistence: { text: 'Bez jednoznačně doloženého obratu postojů nad rámec loajality k vedení ANO — osu nesvítím.' },
        toxicita: { text: 'Bez doloženého vzorce dehonestace konkrétních osob — osu nesvítím.' },
      },
    }),
    person({
      id: 'vystrcil', name: 'Miloš Vystrčil', party: 'ODS',
      role: 'předseda Senátu, senátor',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/15.05.2024_Vizita_Pre%C8%99edintelui_Senatului_Parlamentului_Republicii_Cehe%2C_Milo%C5%A1_Vystr%C4%8Dil%2C_la_Parlamentul_Republicii_Moldova_-_53723066594_%28cropped%29.jpg/500px-15.05.2024_Vizita_Pre%C8%99edintelui_Senatului_Parlamentului_Republicii_Cehe%2C_Milo%C5%A1_Vystr%C4%8Dil%2C_la_Parlamentul_Republicii_Moldova_-_53723066594_%28cropped%29.jpg',
      category: 'Anti-vohnout (není zmrd)',
      categoryReason: 'Učebnicový anti-vohnout — pravý opak člověka, který se ohýbá před mocí. Cesta na Tchaj-wan 2020 byla doložené zásadové gesto navzdory odporu prezidenta i části vlády a navzdory čínskému nátlaku — opak oportunismu. Žádná doložená lež, finanční střet, toxicita ani otáčení kabátu. Politik s pevnou linií, ne zmrd.',
      dictum: 'Postavit se zásadě navzdory tlaku Pekingu i Hradu je opak zmrdství — Tchaj-wanec, ne kabátník.',
      lit: [],
      overrides: {
        lze: { text: 'Bez doloženého vzorce nepravd.' },
        penize: { text: 'Bez doloženého střetu zájmů; čínský pokus o dezinformaci o „4 mil. dolarů za cestu” byl vyvrácen jako fabrikace.' },
        prace: { text: 'Jako předseda Senátu vykazuje standardní aktivitu.' },
        konzistence: { text: 'Tchajwanskou a proatlantickou linii drží konzistentně i pod tlakem.' },
        toxicita: { text: 'Bez doložených urážek či dehonestace konkrétních osob.' },
        zbabelost: { text: 'Cestu na Tchaj-wan prosadil i přes odpor prezidenta, premiéra a ministra zahraničí — odpovědnosti se nevyhýbal.' },
      },
    }),
    person({
      id: 'richterova', name: 'Olga Richterová', party: 'Piráti',
      role: 'předsedkyně poslaneckého klubu Pirátů, místopředsedkyně Sněmovny',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Olga_Richterov%C3%A1_3_November_2021.jpg/500px-Olga_Richterov%C3%A1_3_November_2021.jpg',
      category: 'Není zmrd',
      categoryReason: 'Etablovaná poslankyně se sociální agendou, u níž rešerše napříč šesti osami nenašla doložený prohřešek. Naopak: opakovaně byla terčem hoaxů a žalob, které u soudů vyhrála (Aliance pro rodinu pravomocně zamítnuta Vrchním soudem, Nela Lisková jí musela zaplatit za nepravdivý příspěvek), a stala se cílem výhrůžek a poškozené výlohy. Žádná osa neunese důkazní břemeno — proto čistá nula, ne uměle nafouknutý Hraniční případ.',
      dictum: 'Spíš terč hoaxů a žalob, které vyhrává, než jejich původce — ani jedna osa nesvítí.',
      lit: [],
      overrides: {
        lze: { text: 'Demagog.cz ověřil zhruba 51 výroků s převahou pravdivých; dílčí nepravdivé hodnocení (např. k systému digitálního stavebního řízení) nezakládá systematickou lež. Osa nesvítí.',
          src: [S('demagog.cz', 'Výroky Olgy Richterové — hodnocení', 'https://demagog.cz/politici/olga-richterova-505')] },
        penize: { text: 'Bez doloženého čerpání veřejných prostředků ve střetu zájmů, dotací ani profitu přes rodinu či firmy.' },
        prace: { text: 'Bez záznamu nadprůměrné neúčasti; aktivní v sociální agendě a ve vedení Sněmovny i klubu.' },
        konzistence: { text: 'Bez doloženého otáčení kabátu; dlouhodobě v jedné straně a v konzistentní sociální agendě.' },
        toxicita: { text: 'Bez doložené dehonestace, šikany či výhrůžek vůči konkrétním osobám — naopak sama byla terčem výhrůžek a poškozené výlohy a hoaxy vyvracela soudní cestou.',
          src: [S('Pirátská strana', 'Richterová vyhrála precedentní spor o svobodu slova s Aliancí pro rodinu', 'https://www.pirati.cz/jak-pirati-pracuji/nikdo-by-se-nemel-bat-zeptat-olga-richterova-vyhrala-precedentni-spor-o-svobodu-slova-zalobu-kterou-na-ni-podala-aliance-pro-rodinu-vrchni-soud-v-praze-pravomocne-zamitl/')] },
        zbabelost: { text: 'Bez doloženého vyhýbání se odpovědnosti či házení podřízených přes palubu.' },
      },
    }),
    person({
      id: 'bartos', name: 'Ivan Bartoš', party: 'Piráti',
      role: 'exvicepremiér pro digitalizaci, exministr pro místní rozvoj, místopředseda klubu Pirátů',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Ivan_Barto%C5%A1_16_December_2021.jpg/500px-Ivan_Barto%C5%A1_16_December_2021.jpg',
      gray: true,
      category: 'Manažerské selhání',
      categoryReason: 'Zpackané digitální stavební řízení je učebnicové odborné a manažerské selhání resortu — nedodefinované řízení projektu, neobsazené klíčové pozice, systém nasazený bez otestování. Audit napočítal 32 zásadních chyb. Nic z toho ale není zmrdství v dikci D-FENS: žádná lež jako nástroj, žádný osobní profit, žádné házení podřízených přes palubu. Bartoš nese politickou a manažerskou odpovědnost za projekt, který neuřídil — ne kauzu, kterou by spáchal. Proto šedá zóna, ne svítící osa.',
      dictum: 'Zodpovědný za rozbitou digitalizaci stavebního řízení — odborné a manažerské selhání ministra, ne zmrdovský kalkul.',
      lit: [],
      overrides: {
        lze: { text: 'Demagog.cz ověřil 299 výroků s převahou pravdivých; dílčí zavádějící či nepravdivá hodnocení k digitalizaci nezakládají systematickou lež. Osa nesvítí.',
          src: [S('demagog.cz', 'Výroky Ivana Bartoše — hodnocení', 'https://demagog.cz/politici/ivan-bartos-76')] },
        penize: { text: 'Bez doloženého osobního finančního prospěchu, dotace ve střetu zájmů ani zakázek přes rodinu.' },
        prace: { text: 'Bez záznamu nadprůměrné neúčasti — spíše přetížen resortem v krizi než absentér.' },
        konzistence: { text: 'Bez doloženého otáčení kabátu; postoje v digitalizaci hájil i za cenu vlastního odvolání.' },
        toxicita: { text: 'Bez doložené dehonestace či výhrůžek vůči konkrétním osobám; ostrá slova o „podrazu“ při odvolání míří na proces, ne na osobní šikanu.' },
        zbabelost: { text: 'Selhání digitalizace nezametl — vinu zčásti svaloval na minimalistické zadání vynucené novým stavebním zákonem a podmínkami ÚOHS, zároveň ale o resortu jednal a odvolání přijal. Nejde o házení podřízených přes palubu. Osa nesvítí.',
          src: [S('Echo24', 'Fiala k odvolání Bartoše: nedokáže si připustit reálný stav digitalizace', 'https://www.echo24.cz/a/HjdEi/zpravy-domov-dokument-fiala-k-odvolani-bartose')] },
      },
    }),
    person({
      id: 'hrib', name: 'Zdeněk Hřib', party: 'Piráti',
      role: 'předseda Pirátů, poslanec, expražský primátor',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Zden%C4%9Bk_H%C5%99ib_%28cropped%29.jpg/500px-Zden%C4%9Bk_H%C5%99ib_%28cropped%29.jpg',
      category: 'Anti-vohnout (má hrany)',
      categoryReason: 'Anti-vohnout — jako pražský primátor čelil tlaku Pekingu (Tchaj-pej, tibetská vlajka), neohnul se. Hřib je konfliktní, ostrý a má velké ego — radní mu vyčítají aroganci, s ředitelem magistrátu se přel o údajné zastrašování, dopravní rozkopaná Praha jde zčásti na jeho účet. To jsou ale hrany výkonného a sebevědomého politika, ne zmrdovský systém. Žádná osa nesvítí: peněžní kauza odměn z PRE Holding skončila zastavením řízení, lhaní mu Demagog neprokázal, finanční profit nemá. Proto „není zmrd“ s poctivě přiznanými hranami, ne Hraniční případ se svítícími osami.',
      dictum: 'Ego a ostré lokty výkonného politika — hrany, ne zmrdství; ani jedna osa neunese důkazní břemeno.',
      lit: [],
      overrides: {
        lze: { text: 'Demagog.cz ze zhruba 51 ověřených výroků eviduje převahu pravdivých; zavádějící či neověřitelná hodnocení jsou ojedinělá. Osa nesvítí.',
          src: [S('demagog.cz', 'Výroky Zdeňka Hřiba — hodnocení', 'https://demagog.cz/politici/zdenek-hrib-463')] },
        penize: { text: 'Z PRE Holding mu jako neuvolněnému členu představenstva přišlo 178 019 Kč odměn, ač měl funkci za vedení Prahy vykonávat bez odměny. Peníze vrátil a chybu připisuje dozorčí radě a účtárně. Přestupkové řízení v Říčanech bylo v únoru 2026 zastaveno s odůvodněním, že přestupek nebyl prokázán (in dubio pro reo). Doložený osobní profit se neprokázal — osa nesvítí.',
          src: [S('Pražský deník', 'Úřad v Říčanech řešil odměny Hřiba z PREH, řízení zastaveno', 'https://prazsky.denik.cz/zpravy_region/bude-pokuta-urad-v-ricanech-resi-odmeny-hriba-za-clenstvi-v-predstavenstvu-preh.html'), S('Neovlivní', 'Hřib o odměnách: myslel jsem, že je to přeplatek za energie', 'https://neovlivni.cz/hrib-o-odmenach-myslel-jsem-ze-to-je-preplatek-za-energie/')] },
        prace: { text: 'Bez záznamu nadprůměrné neúčasti — naopak kumuluje funkce (předseda Pirátů, poslanec, dříve primátor i náměstek).' },
        konzistence: { text: 'Bez doloženého zásadního otáčení kabátu; dlouhodobě v jedné straně a v konzistentní agendě.' },
        toxicita: { text: 'Doloženy konflikty a osobní spory — radní Marvanová ho označila za arogantního, ředitel magistrátu Kubelka ho veřejně obvinil ze zastrašování, Hřib reagoval ostře. Jde o ostrý styl a osobní třenice, ne o doloženou systematickou dehonestaci, šikanu či výhrůžky. Osa zůstává čistá — je to hrana, ne svítící toxicita.',
          src: [S('Echo24', 'Konflikt v pražské radě: primátor Hřib je arogantní, říká radní Marvanová', 'https://www.echo24.cz/a/Sb595/dalsi-konflikt-v-prazske-rade-primator-hrib-je-arogantni-rika-radni-marvanova')] },
        zbabelost: { text: 'Bez doloženého vyhýbání se odpovědnosti či házení podřízených přes palubu; v kauze odměn z PRE chybu sám deklaroval a peníze vrátil.' },
      },
    }),
    person({
      id: 'zdechovsky', name: 'Tomáš Zdechovský', party: 'KDU-ČSL',
      role: 'europoslanec (frakce EPP)',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/1718798537845_20240618_ZDECHOVSKY_Tomas_CZ_005.jpg/500px-1718798537845_20240618_ZDECHOVSKY_Tomas_CZ_005.jpg',
      category: 'Hraniční případ',
      categoryReason: 'Pilný a hlasově aktivní europoslanec s dvěma doloženými skvrnami: nadprůměrný podíl nepravd u Demagogu a rodinný příjem z rozpočtu EP přes asistentské místo manželky u komunistického europoslance — tedy u tábora, který sám veřejně tepe. Není to systém ani finanční konstrukce, proto Hraniční, ne plnokrevný; do práce navíc poctivě chodí.',
      dictum: 'Křižák proti komunismu, jehož manželku platí z rozpočtu komunistický europoslanec — ironie financovaná z evropských peněz.',
      highlight: 'Zdechovský patří k nejhlasitějším českým kritikům komunistů (oblíbeným terčem je Kateřina Konečná). Jeho manželka Ivana přitom pracovala jako asistentka komunistického europoslance Jiřího Maštálky, placená z asistentského rozpočtu EP. Pravidlo proti zaměstnávání příbuzných obešel běžnou praxí „křížového” zaměstnávání rodin napříč poslanci. Sám to hájí jako transparentní a odbornou práci „o chudobě a přístupu ke zdravotní péči”.',
      lit: ['lze', 'penize'],
      dfens: [
        { n: 8, why: 'Buduje image neúnavného obránce hodnot, byrokratickou realitu rodinného příjmu z EP přejde.' },
        { n: 9, why: 'Profiluje se na rozdrcení komunistů a migrace; ostré teze občas předbíhají fakta.' },
        { n: 10, why: 'Účelové obejití zákazu zaměstnávání příbuzných „křížovým” zaměstnáváním rodin napříč poslanci.' },
      ],
      overrides: {
        lze: { text: 'Demagog.cz z 23 ověřených výroků eviduje 5 nepravdivých (cca pětina) — mj. nepravdivé tvrzení, že Charta OSN ukládá žádat o azyl v první bezpečné zemi, což v ní obsaženo není.',
          src: [S('demagog.cz', 'Ověřené výroky Tomáše Zdechovského — hodnocení', 'https://demagog.cz/politici/tomas-zdechovsky-501')] },
        penize: { text: 'Manželka Ivana Zdechovská pracovala jako asistentka komunistického europoslance Jiřího Maštálky, placená z asistentského rozpočtu EP, zatímco Zdechovský sám patří k nejhlasitějším kritikům KSČM. Zákaz zaměstnávání příbuzných byl obejit běžnou praxí „křížového” zaměstnávání rodin napříč poslanci; nezákonnost prokázána nebyla, Zdechovský arrangement hájí jako transparentní.',
          src: [S('Blesk.cz', '„Pronajímá manželku komunistovi” — brání se lidovecký europoslanec', 'https://www.blesk.cz/clanek/zpravy-politika/357269/pronajima-manzelku-komunistovi-normalni-brani-se-lidovecky-europoslanec.html'), S('ProSvět.cz', 'Útočí na komunisty, doma má jejich asistentku', 'https://prosvet.cz/politicky-paradox-tomas-zdechovsky-utoci-na-komunisty-ale-doma-ma-jejich-asistentku/')] },
        prace: { text: 'Čistá osa — účast na hlasováních v EP cca 98,5 % a je nejaktivnějším českým řečníkem na plénu.' },
        konzistence: { text: 'Bez doloženého zásadního otáčení postojů — protikomunistická a protimigrační linie je dlouhodobě stabilní.' },
        toxicita: { text: 'Ostrá, ale veskrze politická rétorika vůči oponentům; bez doložené adresné dehonestace či šikany konkrétní osoby.' },
        zbabelost: { text: 'Kritizovaný arrangement s manželkou veřejně hájí, neodklání jej.' },
      },
    }),
    person({
      id: 'foltyn', name: 'Otakar Foltýn', party: '—',
      role: 'expkoordinátor strategické komunikace Úřadu vlády (2024–2025), plukovník AČR, expvelitel Vojenské policie',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Plk._Otakar_Folt%C3%BDn_%282023%29.jpg/500px-Plk._Otakar_Folt%C3%BDn_%282023%29.jpg',
      category: 'Není zmrd (není stranický politik)',
      categoryReason: 'Foltýn není stranický politik — je jmenovaný úředník a voják, který zmrdologii primárně nepodléhá. Drží ho mimo systém zmrdství fakt, že nečerpá, neotáčí kabát ani neuhýbá před odpovědností: za své výroky se postavil i v parlamentním výboru. Svítí jediná osa — ostrá, doložená a v médiích referovaná rétorika vůči části spoluobčanů. Proto „není zmrd“, ne „hraniční“: jeden ostrý roh, žádný vzorec.',
      dictum: 'Voják v roli komunikátora, který si plete strategickou komunikaci s tím, koho je třeba „hodit do příkopu“ — jediná skvrna je jazyk, ne charakter.',
      highlight: 'Na festivalu Slavonice Fest (3. 8. 2024) označil zhruba 4,5 % populace — obdivovatele Putinova režimu — za „zombíky“ na poli informační války a slovo „svině“; dodal, že je třeba „vykopat dostatečně hluboký příkop“. Místo aby to zmírnil, výroky opakovaně obhajoval a v únoru 2025 si za nimi stál i před mediálním výborem Sněmovny slovy, že „žádného konkrétního člověka sviní nenazval — všichni se přihlásili sami“.',
      lit: ['toxicita'],
      overrides: {
        toxicita: { text: 'Na Slavonice Fest 3. 8. 2024 označil cca 4,5 % populace (obdivovatele Putinova režimu) za „zombíky“ a „svině“ a vyzval k jejich izolaci („vykopat dostatečně hluboký příkop“). Výroky opakovaně hájil, mj. v únoru 2025 před mediálním výborem PSP. Kritizoval je M. Zeman i poslanec J. Foldyna.',
          src: [S('Echo24', '„5 % spoluobčanů jsou zombíci. Je třeba vykopat hluboký příkop“', 'https://www.echo24.cz/a/HbVvK/zpravy-domov-otakar-foltyn'), S('CNN Prima', 'Výroky o sviních budí rozruch, Zeman přirovnal k projevům nacistů', 'https://cnn.iprima.cz/vyroky-otakara-foltyna-o-svinich-budi-rozruch-podle-zemana-pripominaji-projevy-nacistu-445001')] },
      },
    }),
    person({
      id: 'blaha', name: 'Michal Bláha', party: 'Piráti (2024–2025, ukončil)',
      role: 'zakladatel Hlídače státu, expmístopředseda Pirátů (2024–2025)',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Michal_Bl%C3%A1ha_01.jpg/500px-Michal_Bl%C3%A1ha_01.jpg',
      category: 'Anti-vohnout (není zmrd)',
      categoryReason: 'Anti-vohnout v nejčistší formě — nástroj na kontrolu moci, ne na ohýbání před ní. Bláha je transparentní opak zmrda: jeho životní dílo Hlídač státu je nástroj, který zmrdy odhaluje — sleduje dotace, zakázky a sponzory stran. Krátké místopředsednictví Pirátů (2024–2025) je epizoda, ne kariéra; po neúspěšné kandidatuře politiku opustil a vrátil se k hlídání. Žádná osa nesvítí, protože není co — to není mělká rešerše, to je čistý štít.',
      dictum: 'Člověk, který postavil databázi na lov zmrdů, do databáze zmrdů nepatří — jen omylem prošel kolem politiky a vrátil se hlídat.',
      lit: [],
      overrides: {
        lze: { text: 'Bez doloženého záznamu — naopak provozuje ověřovací datovou platformu.' },
        penize: { text: 'Bez doloženého střetu zájmů; Hlídač státu je nezisková transparentní iniciativa.' },
        prace: { text: 'Bez záznamu; krátká politická role, jinak provozní práce na projektu.' },
        konzistence: { text: 'Bez doloženého otáčení kabátu — dlouhodobě jedna agenda (transparentnost).' },
        toxicita: { text: 'Bez doložených urážek či dehonestace konkrétních osob.' },
        zbabelost: { text: 'Bez doloženého vyhýbání se odpovědnosti.' },
      },
    }),
    person({
      id: 'minar', name: 'Mikuláš Minář', party: '—',
      role: 'zakladatel a předseda spolku Milion chvilek pro demokracii, exiniciátor hnutí Lidé PRO (2020–2021)',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Mikul%C3%A1%C5%A1_Min%C3%A1%C5%99_%282026%29.jpg/500px-Mikul%C3%A1%C5%A1_Min%C3%A1%C5%99_%282026%29.jpg',
      category: 'Anti-vohnout (není stranický politik)',
      categoryReason: 'Anti-vohnout — postavil masové hnutí jako tlak na moc, opak ohýbání před ní. Minář je občanský aktivista, ne stranický politik — jeho pokus o vlastní politický projekt Lidé PRO (2020–2021) skončil dřív, než vůbec kandidoval, a do Sněmovny se nikdy nedostal. Vede spolek Milion chvilek, jehož smyslem je tlak na politiky, ne výkon moci. Žádná osa zmrdství nesvítí: nečerpá veřejné prostředky ve střetu, neuhýbá doložitelně před odpovědností. Aktivismus s hranami není zmrdství.',
      dictum: 'Vyvolávač demonstrací, který si na chvíli zkusil dělat politiku, couvnul a vrátil se na náměstí — předmět zmrdologie to nedělá.',
      lit: [],
      overrides: {
        lze: { text: 'Bez doloženého opakovaného nepravdivého výroku v ověřovacích databázích.' },
        penize: { text: 'Bez doloženého čerpání veřejných prostředků ve střetu zájmů.' },
        prace: { text: 'Není volený zástupce — docházka nerelevantní.' },
        konzistence: { text: 'Projekt Lidé PRO 2021 sám ukončil před volbami; jde o jednorázové rozhodnutí, ne doložené otáčení kabátu pro výhodu.' },
        toxicita: { text: 'Bez doložených urážek či dehonestace konkrétních osob.' },
        zbabelost: { text: 'Bez doloženého vyhýbání se odpovědnosti.' },
      },
    }),
    person({
      id: 'nerudova', name: 'Danuše Nerudová', party: 'STAN',
      role: 'europoslankyně, exrektorka Mendelovy univerzity, exprezidentská kandidátka',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Danu%C5%A1e_Nerudov%C3%A1_%282023%29_VI.jpg/500px-Danu%C5%A1e_Nerudov%C3%A1_%282023%29_VI.jpg',
      category: 'Hraniční',
      categoryReason: 'Hraniční, ne Není zmrd: kauza turbotitulů na MENDELU je doložená kontrolou i odebráním akreditace, a její setrvalé „nic jsem neudělala špatně, vinu nese děkan“ naplňuje osu zbabelosti — házení odpovědnosti na podřízeného. Lži na úrovni svícení doloženy nejsou (řada „citátů“ jí byla podsunuta dezinformátory). Dvě osy bez finančního střetu = poctivá dvojka, ne nula.',
      dictum: 'Exrektorka, za jejíhož vedení univerzita podle kontroly „porušovala, co mohla“ — a která odpovědnost za turbotituly důsledně přehazuje na děkana, zatímco sama tvrdí, že neudělala nic špatného.',
      highlight: 'Kauza MENDELU turbotituly: za rektorování Nerudové fakulta udělovala doktoráty cizincům přes zprostředkovatelské agentury (Salcburk, Berlín), studenti se hlásili na zkoušky, které už proběhly, jeden obhajoval během přerušeného studia. Národní akreditační úřad v červnu 2023 fakultě odebral akreditaci doktorského studia ekonomie; kontrola konstatovala porušení zákona v době jejího vedení. Nerudová opakovaně tvrdí, že „neudělala nic špatného“ a odpovědnost nese děkan — přestože sama jednu z dotčených dizertací vedla.',
      lit: ['zbabelost'],
      dfens: [
        { n: 7, why: '„Navrch huj, vespod fuj“ — prestižní instituce navenek, turbotituly a porušování zákona uvnitř.' },
        { n: 8, why: 'Image reformní akademičky a etalonky kvality, zatímco pod jejím vedením univerzita selhávala.' },
      ],
      overrides: {
        lze: { text: 'Systematický záznam nepravdivých výroků na úrovni svícení doložen není; Demagog naopak vyvrací smyšlené „citáty“ jí podsunuté dezinformátory (např. falešný výrok o eutanazii, který je v rozporu s jejím skutečným postojem).',
          src: [S('demagog.cz', 'Smyšlené citáty Danuše Nerudové a dalších politiků', 'https://demagog.cz/diskuze/smyslene-citaty-danuse-nerudove-a-dalsich-ceskych-politiku')] },
        penize: { text: 'Čistá osa — bez doloženého osobního finančního střetu či profitu z kauzy.' },
        prace: { text: 'Bez doloženého záznamu nadprůměrné absence v EP.' },
        konzistence: { text: 'Bez doloženého zásadního otáčení kabátu na úrovni svítící osy (přechod k STAN 2024 byl deklarovaný politický krok, ne obrat postoje).' },
        toxicita: { text: 'Bez doloženého záznamu dehonestace či šikany vůči konkrétním osobám.' },
        zbabelost: { text: 'Za jejího rektorství Mendelova univerzita podle kontroly Národního akreditačního úřadu porušovala zákon o vysokých školách, nařízení vlády i vlastní vnitřní předpisy (kauza „turbotitulů“); NAÚ v červnu 2023 odebral fakultě akreditaci doktorského studia ekonomie. Nerudová odpovědnost setrvale přisuzuje děkanovi a tvrdí, že o praktikách nevěděla, ač vedla jednu z dotčených dizertací a držela funkce v kontrolním orgánu i na dotčené fakultě.',
          src: [S('iROZHLAS', 'Kauza MENDELU se řešila týden před druhým kolem prezidentských voleb', 'https://www.irozhlas.cz/zpravy-domov/mendelova-univerzita-danuse-nerudova-kauza-zakon-akreditace-prezident_2212201731_har'), S('CNN Prima News', 'Univerzita pod jejím vedením porušovala, co mohla, ukázala kontrola', 'https://cnn.iprima.cz/nerudova-v-prusvihu-univerzita-pod-jejim-vedenim-porusovala-co-mohla-ukazala-kontrola-195961')] },
      },
    }),
    person({
      id: 'sikela', name: 'Jozef Síkela', party: 'nezávislý (za STAN)',
      role: 'evropský komisař pro mezinárodní partnerství, exministr průmyslu a obchodu',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/S%C3%ADkela_EC_Portrait_2024_%28cropped%29.jpg/500px-S%C3%ADkela_EC_Portrait_2024_%28cropped%29.jpg',
      category: 'Není zmrd (má hrany)',
      categoryReason: 'Síkelovi se vyčítá rozporuplné ministrování v energetické krizi a pár ostrých výpadů — to jsou ale hrany, ne zmrdovský systém. Slavné přeřeknutí o „větrných elektrárnách“ je gaffe, ne lež; výpad na Havlíčka o „sektě, kde něco hulíte“ je jednorázová parlamentní ostrost, ne vzorec dehonestace. Je nejbohatším členem vlády s vazbami na byznys, majetek ale řádně přiznal a žádný prokázaný střet zájmů z toho nevzešel. Žádná osa neunese důkaz — proto „není zmrd“ s hranami, ne Hraniční případ.',
      dictum: 'Rozporuplný technokrat s ostrým jazykem a tlustou peněženkou — hrany ano, doložené zmrdovské osy ne.',
      lit: [],
      overrides: {
        lze: { text: 'Slavné přeřeknutí ze srpna 2022, kdy v energetické krizi opakovaně řekl „větrné elektrárny“ místo „špičkové elektrárny“, je doložená gaffe, ne nepravdivý výrok jako nástroj. Demagog systematickou lež neprokazuje. Osa nesvítí.',
          src: [S('Ekonomický deník', 'Síkela končí jako jeden z rozporuplných ministrů — přeřeknutí a kritika', 'https://ekonomickydenik.cz/pripad-sikela-ve-funkci-konci-jeden-z-rozporuplnych-ministru-ceske-vlady/')] },
        penize: { text: 'Do politiky vstoupil jako nejbohatší člen vlády s rozsáhlým nemovitým majetkem a vazbami na byznys (mj. byt v komplexu spoluvlastněném Markem Dospivou z Penty); před nástupem prodal podíl ve fondu. Majetek řádně přiznal a protikorupční výhrady míří na nedostatečnou prověrku státem, ne na prokázané čerpání veřejných peněz ve střetu zájmů. Doložený osobní profit z funkce se neprokázal — osa nesvítí.',
          src: [S('Protikorupční linka', 'Nedostatečná prověrka majetku a vazby na oligarchy vyvolávají otázky', 'https://protikorupcnilinka.cz/zpravodajstvi/jozef-sikela-nedostatecna-proverka-majetku-a-vazby-na-ceske-oligarchy-vyvolavaji-otazky')] },
        prace: { text: 'Bez záznamu nadprůměrné neúčasti — naopak intenzivní aktivita v době energetické krize a poté v Evropské komisi.' },
        konzistence: { text: 'Bez doloženého zásadního otáčení kabátu; dlouhodobě nestraník za STAN s konzistentní prounijní a proinvestiční linií.' },
        toxicita: { text: 'Ve sněmovní rozpravě o energetické krizi (11. 9. 2022) vmetl Karlu Havlíčkovi, že neví, „jestli vám ten váš populismus zatemnil mozek, nebo jestli v té vaší sektě něco hulíte“. Jde o jednorázový ostrý výpad v rozpravě, ne o doložený vzorec dehonestace, šikany či výhrůžek. Osa zůstává čistá — hrana, ne svítící toxicita.',
          src: [S('FORUM 24', 'Síkela odmítl kritiku Havlíčka: nevím, jestli v té vaší sektě něco hulíte', 'https://www.forum24.cz/sikela-odmitl-kritiku-havlicka-nevim-jestli-v-te-vasi-sekte-neco-hulite-vmetl-mu')] },
        zbabelost: { text: 'Bez doloženého vyhýbání se odpovědnosti či házení podřízených přes palubu; kritiku za krizové řízení nesl veřejně.' },
      },
    }),
    person({
      id: 'macinka', name: 'Petr Macinka', party: 'Motoristé sobě',
      role: 'předseda hnutí, vicepremiér, ministr zahraničí (od 12/2025), exministr životního prostředí (12/2025–02/2026)',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Petr_Macinka_2026-02-14.jpg/500px-Petr_Macinka_2026-02-14.jpg',
      category: 'Exhibicionistický zmrd',
      categoryReason: 'Stejně jako Turek staví na provokaci a popírání — „klimatická krize skončila“, ekologové jsou „teroristé“. Na rozdíl od Turka přidává mocenský nátlak: SMS prezidentovi o „spálení mostů“. Hraje otevřeně a hlasitě, ne tiše ze zákulisí — proto Exhibicionistický, ne Systémový, byť k systémovosti směřuje.',
      dictum: 'Ministr, který „vyřešil klimatickou krizi“ jednou větou a vyjednávání o postu vede vzkazem, že spálí mosty způsobem do učebnic — diplomacie v podání pravého výfuku.',
      highlight: 'V lednu 2026 prezident Pavel zveřejnil SMS, které mu poslal ministr Macinka — že klid nastane, „až bude Turek na ministerstvu životního prostředí“, jinak „spálí mosty způsobem, který vejde do učebnic politologie“, a že stojí před „nevratným rozhodnutím“. Pavel je označil za pokus o vydírání kvůli nejmenování Turka ministrem. Opozice žádala Macinkovo odvolání.',
      lit: ['lze', 'konzistence', 'toxicita', 'zbabelost'],
      dfens: [
        { n: 4, why: 'Postoj k vědě i institucím ohýbá podle aktuální politické potřeby — popírání klimatu, zpochybňování soudců ÚS.' },
        { n: 6, why: 'Vyjednávání o postu Turka vede nátlakovými neveřejnými vzkazy prezidentovi.' },
        { n: 8, why: 'Buduje image antiestablishmentového provokatéra; postoje volí podle trendu mezi voliči Motoristů.' },
        { n: 9, why: 'Označení ekologické organizace za „teroristickou“ jako gesto rozdrcení oponenta, ne věcný spor.' },
      ],
      overrides: {
        lze: { text: 'Po nástupu na ministerstvo životního prostředí 18. 12. 2025 prohlásil, že „klimatická krize v ČR skončila“, a oznámil zrušení klimatické sekce ministerstva; lidský vliv na klima označuje za zanedbatelný oproti vulkanické aktivitě a pohybu kontinentů — v rozporu s vědeckým konsenzem.',
          src: [S('Deník N', '„Dnes u nás skončila klimatická krize,“ prohlásil Macinka', 'https://denikn.cz/1920400/dnes-u-nas-skoncila-klimaticka-krize-prohlasil-macinka-sve-odpurce-pochvalil-za-vytrvalost/'), S('iROZHLAS', 'Macinka o Hnutí DUHA jako o teroristické organizaci, popírá klimatickou krizi', 'https://www.irozhlas.cz/zpravy-domov/hnuti-duha-petr-macinka-terorismus_2604041544_elev')] },
        konzistence: { text: 'Veřejně zpochybnil nestrannost ústavních soudců jmenovaných prezidentem; postoj k institucím i ke koaličním partnerům přizpůsobuje sporu o jmenování Turka. Pavel jeho zpochybňování ústavních institucí označil za „politický faul“.',
          src: [S('Seznam Zprávy', 'Pavel označil Macinkovo zpochybňování ústavních institucí za politický faul', 'https://www.seznamzpravy.cz/clanek/domaci-politika-pavel-oznacil-macinkovo-zpochybnovani-ustavnich-instituci-za-politicky-faul-295774'), S('ČeskéNoviny', 'Pavel a Macinka se vzájemně obvinili z faulů kvůli ÚS a Turkovi', 'https://www.ceskenoviny.cz/zpravy/pavel-a-macinka-se-vzajemne-obvinili-z-faulu-kvuli-us-a-turkovi/2769317')] },
        toxicita: { text: 'V dubnu 2026 označil ekologickou organizaci Hnutí DUHA za „bez velké nadsázky teroristickou organizaci“; DUHA zaslala předžalobní výzvu a žádá omluvu pod hrozbou žaloby. Po kritice premiéra Babiše ohledně stylu komunikace pronesl v televizi výroky o „méně lidech“.',
          src: [S('iROZHLAS', 'Macinka o Hnutí DUHA jako o teroristické organizaci, DUHA zvažuje žalobu', 'https://www.irozhlas.cz/zpravy-domov/hnuti-duha-petr-macinka-terorismus_2604041544_elev'), S('Deník N', 'Hnutí DUHA zaslalo předžalobní výzvu ministru Macinkovi', 'https://denikn.cz/minuta/2040365')] },
        zbabelost: { text: 'Prezident Pavel zveřejnil Macinkovy SMS, které považuje za pokus o vydírání — Macinka v nich psal, že klid nastane „až bude Turek na MŽP“, jinak „spálí mosty způsobem, který vejde do učebnic politologie“, a stojí před „nevratným rozhodnutím“. Macinka odpovědnost odmítá a označuje to za „tvrdé vyjednávání“.',
          src: [S('Aktuálně.cz', '„Spálím mosty, vejde to do učebnic politologie.“ Co napsal Macinka prezidentovi', 'https://zpravy.aktualne.cz/domaci/spalim-mosty-vejde-to-do-ucebnic-politologie-co-napsal-macinka-prezidentovi/r~aaa29a88d72525d75c54c7bbd0ba909f/'), S('Deník', 'Prezident Pavel obvinil ministra Macinku z vydírání, zveřejnil zprávy', 'https://www.denik.cz/z_domova/prezident-petr-pavel-macinka-vydirani.html')] },
        prace: { text: 'Bez doloženého absentérství — aktivní v exekutivních funkcích.' },
        penize: { text: 'Bez doloženého čerpání veřejných prostředků či dotačního střetu zájmů.' },
      },
    }),
    person({
      id: 'slachta', name: 'Róbert Šlachta', party: 'Přísaha',
      role: 'předseda hnutí Přísaha, exšéf ÚOOZ a NCOZ',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Robert_%C5%A0lachta_SJK_2020_0-58.png/500px-Robert_%C5%A0lachta_SJK_2020_0-58.png',
      category: 'Jedna skvrna',
      categoryReason: 'Jedna skvrna, ne Hraniční: na antikorupčním programu staví hnutí, jehož vlastní rozjezdové financování Úřad pro dohled nad financováním stran označil za netransparentní — doložený rozpor mezi heslem a praxí. Ostatní osy ale drží: žádný doložený finanční profit, žádná systematická lež na úrovni svícení. Vulgární výpad vůči europoslanci je ojedinělý, ne vzorec. Proto jedna doložená osa, ne víc.',
      dictum: 'Antikorupční čistič, jehož hnutí odmítlo prozradit, kdo zaplatil jeho politický rozjezd — netransparentnost, kterou by jako policista sám stíhal.',
      highlight: 'Start Přísahy 2021: Šlachta nejdřív tajil, kdo hnutí půjčil peníze na rozjezd; Úřad pro dohled nad financováním politických stran krok označil za netransparentní. Když seznam dárců nakonec zveřejnil, ukázalo se, že největším sponzorem (200 tisíc Kč) byl podnikatel Jaroslav Kubiska — „jeho“ klíčový svědek z kauzy proti lobbistovi Rittigovi. Šéf antikorupčního hnutí financovaný svým vlastním korunním svědkem.',
      lit: ['penize'],
      dfens: [
        { n: 8, why: 'Image neúplatného detektiva-čističe staví na kontrastu, který jeho vlastní netransparentní financování nabourává.' },
        { n: 9, why: 'Politiku vede jako souboj — vulgární výpady vůči bývalým spolustraníkům místo věcného řešení sporů.' },
      ],
      overrides: {
        lze: { text: 'Bez doloženého systematického záznamu nepravdivých výroků na úrovni svítící osy — naopak ve věci Vrbětic se postavil za závěry tajných služeb a ruskou stopu nezpochybňuje.' },
        penize: { text: 'Rozjezdové financování hnutí Přísaha (2021) Úřad pro dohled nad hospodařením politických stran označil za netransparentní — Šlachta zprvně odmítl uvést, od koho si půjčil. Po zveřejnění se největším sponzorem na transparentním účtu (200 tis. Kč) ukázal podnikatel Jaroslav Kubiska, klíčový svědek v kauze lobbisty Rittiga, v níž Šlachta dříve působil.',
          src: [S('iROZHLAS', 'Největší sponzor Přísahy je Šlachtův hlavní svědek proti Rittigovi', 'https://www.irozhlas.cz/zpravy-domov/prisaha-nove-hnuti-byvaly-policista-slachta-sponzor-kubiska-lobbista-rittig_2102030611_aur'), S('Seznam Zprávy', 'Šlachta tajil, kdo platil start jeho politického hnutí', 'https://www.seznamzpravy.cz/clanek/slachta-taji-kdo-platil-start-jeho-politickeho-hnuti-145639')] },
        prace: { text: 'Bez doloženého záznamu nadprůměrné absence.' },
        konzistence: { text: 'V klíčových bezpečnostních otázkách (Vrbětice, ruská stopa) konzistentní — bez doloženého otáčení kabátu na úrovni svítící osy.' },
        toxicita: { text: 'Doložen ojedinělý vulgární veřejný výpad vůči europoslanci Antonínu Staňkovi („taková sv*ně křivá“) při sporu o rozpad zastoupení Přísahy v EP — incident, ne vzorec, proto osu nesvítíme.',
          src: [S('FORUM 24', '„Sv*ně křivá.“ Šlachta neudržel emoce a napadl europoslance Staňka', 'https://www.forum24.cz/svne-kriva-slachta-neudrzel-emoce-a-urazil-europoslance-antonin-stanek-nam-zaslal-reakci')] },
        zbabelost: { text: 'Bez doloženého záznamu vyhýbání se odpovědnosti.' },
      },
    }),
    person({
      id: 'radim-fiala', name: 'Radim Fiala', party: 'SPD',
      role: 'místopředseda SPD, předseda poslaneckého klubu SPD, poslanec PSP',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Radim_Fiala_Praha_2017.jpg/500px-Radim_Fiala_Praha_2017.jpg',
      category: 'Hraniční případ',
      categoryReason: 'Fiala není architekt ani exhibicionista — je tichá majetková páteř SPD. Doložené nepravdy u Demagogu a přetrvávající vazba na firmu se státními zakázkami ho drží nad nulou, ale chybí mu systémové budování ekosystému i otevřená toxicita Okamury. Proto Hraniční, ne Plnokrevný.',
      dictum: 'Muž, jehož majetek dostal SPD do parlamentu a jehož firma dál inkasuje státní zakázky, zatímco on tvrdí, že už ji vlastně neovládá.',
      highlight: 'Fiala je dle evidence skutečných majitelů nadále spoluvlastníkem holdingu, jehož firmy berou veřejné zakázky — dominantní IF Facility získala v roce 2023 rámcovou smlouvu na kancelářské potřeby pro ministerstvo zemědělství až za 100 milionů korun a má i zakázky s Generálním finančním ředitelstvím a ministerstvem obrany. Fiala tvrdí, že firmy v roce 2018 převedl do svěřenského fondu a jako spoluvlastník figuruje jen proto, že nedostal doplacenou kupní cenu. Současně užívá apartmán ve Špindlerově Mlýně patřící firmě B.S. - Kings z téhož holdingu.',
      lit: ['lze', 'penize', 'konzistence'],
      dfens: [
        { n: 3, why: 'Loajální místopředseda — veřejně hájí předsedu Okamuru i v kauze jeho stíhání.' },
        { n: 6, why: 'Majetkové a firemní vazby drží mimo jasné veřejné dořešení, profit přes svěřenský fond.' },
        { n: 10, why: 'Spolu s Okamurou ručil majetkem za 18milionový úvěr na kampaň SPD — pevná součást konglomerátu.' },
      ],
      overrides: {
        lze: { text: 'Demagog.cz ze 43 ověřených výroků eviduje 12 nepravdivých a 6 zavádějících — např. nepravdivé tvrzení „z Německa tam nikdo nebyl“ k oficiálním návštěvám Tchaj-wanu, ač zástupci německé parlamentní skupiny Tchaj-wan oficiálně navštívili v letech 2019 i 2022.',
          src: [S('demagog.cz', 'Výroky Radima Fialy — 12 nepravd a 6 zavádějících z 43', 'https://demagog.cz/politici/radim-fiala-265')] },
        penize: { text: 'Dle evidence skutečných majitelů nadále spoluvlastní holding, jehož firma IF Facility získala v roce 2023 rámcovou smlouvu pro ministerstvo zemědělství až za 100 mil. Kč a další zakázky s Generálním finančním ředitelstvím a ministerstvem obrany. Užívá též apartmán ve Špindlerově Mlýně (pořízený firmou B.S. - Kings za 6,4 mil. Kč), který patří firmě z téhož holdingu; vysvětluje to nájemní smlouvou.',
          src: [S('Aktuálně.cz', 'Fiala nadále spoluvlastní firmu, která dostává státní zakázky', 'https://zpravy.aktualne.cz/domaci/radim-fiala-z-spd-nadale-spoluvlastni-firmu-ktera-dostava-st/r~5294edeea4e111f0b553ac1f6b220ee8/'), S('Seznam Zprávy', 'Fiala obývá apartmán, který patří jeho bývalé firmě', 'https://www.seznamzpravy.cz/clanek/domaci-kauzy-fiala-z-spd-obyva-apartman-ktery-patri-jeho-byvale-firme-302469')] },
        konzistence: { text: 'Tvrdí, že firmy v roce 2018 prodal, respektive převedl do svěřenského fondu a nemá nad nimi reálný vliv; jako spoluvlastník v evidenci skutečných majitelů přesto figuruje s vysvětlením, že nebyla doplacena celá kupní cena. Vysvětlení ke statusu majetku se v čase liší (prodej × svěřenský fond × nedoplacená cena).',
          src: [S('Seznam Zprávy', 'Fiala obývá apartmán firmy, s níž se prý rozloučil — rozporná vysvětlení', 'https://www.seznamzpravy.cz/clanek/domaci-kauzy-fiala-z-spd-obyva-apartman-ktery-patri-jeho-byvale-firme-302469'), S('HlídacíPes.org', 'Radim Fiala — muž, jehož majetek pomohl SPD do parlamentu', 'https://hlidacipes.org/radim-fiala-muz-jehoz-majetek-pomohl-spd-parlamentu-ma-rad-psy-rusko/')] },
        prace: { text: 'Bez doloženého nadprůměrného absentérství v PSP.' },
        toxicita: { text: 'Bez doložených adresných urážek či výhrůžek konkrétním osobám nad rámec ostré politické rétoriky.' },
        zbabelost: { text: 'Bez doloženého házení podřízených přes palubu; spíše loajální vykonavatel.' },
      },
    }),
    person({
      id: 'fiala', name: 'Petr Fiala', party: 'ODS',
      role: 'expremiér, předseda ODS, lídr opozice',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Petr_Fiala_%282024%29_%28cropped%29.jpg/500px-Petr_Fiala_%282024%29_%28cropped%29.jpg',
      category: 'Slabý lídr (není zmrd)',
      categoryReason: 'Politolog, který čtyři roky vládl jako přednášející — věcně, opatrně, bez vlastního ekosystému; na podzim 2025 volby prohrál a skončil v opozici. Nemá rodinné finanční toky, dotační ocas ani toxickou rétoriku; Demagog ho po stovkách výroků drží v poměru, jaký systémový zmrd nikdy nemá. Jediná hrana je opožděné otočení v postojích podle volebního kalendáře — to z něj dělá slabého lídra, ne zmrda.',
      dictum: 'Slabý lídr není zmrd: žádná exhibice, žádný profit přes rodinu, jen vláda, která sliby plnila napůl a reformu objevila těsně před volbami — které pak prohrála.',
      lit: ['konzistence'],
      overrides: {
        lze: { text: 'Demagog.cz ověřil 534 výroků: 421 pravda, 43 nepravda, 39 zavádějící, 31 neověřitelné — podíl nepravdivých/zavádějících kolem 15 %, na objem výroků premiéra nepodkládá osu systematické lži.' },
        penize: { text: 'Bez doloženého střetu zájmů, dotací či profitu přes rodinu nebo firmy.' },
        prace: { text: 'Čistá osa — vysoká aktivita premiéra i předsedy strany.' },
        konzistence: { text: 'Po letech, kdy ODS blokovala změnu jednacího řádu Sněmovny kvůli obstrukcím, Fiala těsně před koncem volebního období sám změnu prosazoval. Vláda dle Demagogu splnila zhruba 32 % programových slibů, zhruba 40 % nesplnila; sliby z programového prohlášení byly v březnu 2023 revidovány.',
          src: [S('Aktuálně.cz', '550 slibů Petra Fialy — experti hodnotí, kde vláda selhala', 'https://zpravy.aktualne.cz/ekonomika/vic-nez-550-slibu-petra-fialy-experti-popisuji-co-se-vlade-p/r~464210cc9eaa11f0b589ac1f6b220ee8/'), S('Echo24', 'Vládní poločas: (Ne)splněné sliby Fialovy vlády', 'https://www.echo24.cz/a/HGQKa/zpravy-domaci-polocas-vlady-petra-fialy-nesplnene-sliby-spolu-stan-pirati')] },
        toxicita: { text: 'Bez doložené dehonestace či šikany konkrétních osob.' },
        zbabelost: { text: 'Čistá osa — v krizích vystupoval osobně a nezakrýval se podřízenými.' },
      },
    }),
    person({
      id: 'rakusan', name: 'Vít Rakušan', party: 'STAN',
      role: 'exministr vnitra, předseda hnutí STAN',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/9/90/V%C3%ADt_Raku%C5%A1an_%282025%29_%28cropped%29.png',
      gray: true,
      category: 'Manažerské selhání',
      categoryReason: 'Není to Babiš ani Schillerová — chybí tu osobní finanční stopa i prokázaná lež jako nástroj. Dozimetr je selhání hnutí, které si nechalo prorůst pražskou organizaci ekosystémem kolem Redla a Hlubučka, ne doložené osobní zmrdství předsedy. Proto šedá zóna: politická a manažerská odpovědnost za to, co se dělo „pod ním“, ne kauza, kterou by spáchal sám. Jakmile by se prokázalo, že o obviněních věděl předem, osa zbabělosti by se rozsvítila — zatím to ale řeší GIBS a stav je nepravomocný.',
      dictum: 'Zodpovědný za hnutí, které si nepohlídalo vlastní pražskou pobočku — manažerské selhání předsedy, ne (zatím) doložený osobní zmrd.',
      lit: [],
      overrides: {
        lze: { text: 'Demagog.cz eviduje ze 151 ověřených výroků převahu pravdivých; zavádějící hodnocení (např. tvrzení o 20 mld. za nový stavební úřad jako reálně plánované, ač šlo o nejpesimističtější scénář) jsou ojedinělá, ne systematická. Osa nesvítí.' },
        penize: { text: 'Bez doloženého osobního finančního prospěchu, dotace ve střetu zájmů ani profitu přes rodinu. V kauze Dozimetr nebyl obviněn.' },
        prace: { text: 'Bez záznamu nadprůměrné neúčasti; jako ministr vnitra i předseda hnutí vykazuje běžnou aktivitu.' },
        konzistence: { text: 'Bez doloženého otáčení kabátu či účelových obratů v klíčových postojích.' },
        toxicita: { text: 'Bez doložené dehonestující rétoriky, šikany či výhrůžek vůči konkrétním osobám nad rámec běžné politické polemiky.' },
        zbabelost: { text: 'K Dozimetru opakovaně tvrdí, že o ničem nevěděl, a osobní odpovědnost odmítá. Údajná pětistránková nahrávka z porady vnitra (duben 2022), z níž má vyplývat, že o chystaných obviněních věděl předem, je předmětem prověřování GIBS; pravost je sporná a Rakušan ji označuje za předvolební „kompro“ plné nepravd. Stav je nepravomocný a neprokázaný — osa proto zatím nesvítí.',
          src: [S('Deník N', 'GIBS řeší, zda nahrávka existuje, nebo je to podvrh', 'https://denikn.cz/1830131/kompro-na-rakusana-gibs-resi-zda-existuje-nahravka-citlive-schuzky-nebo-je-to-podvrh/'), S('Echo24', 'Rakušan: chystají na mě předvolební kompro, může jít o Dozimetr', 'https://www.echo24.cz/a/HugiG/zpravy-domov-volby-kompro-rakusan-kauza-dozimetr')] },
      },
    }),
    person({
      id: 'pekarova-adamova', name: 'Markéta Pekarová Adamová', party: 'TOP 09',
      role: 'expředsedkyně Poslanecké sněmovny, expředsedkyně TOP 09',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/%C4%8Cehijas_parlamenta_priek%C5%A1s%C4%93d%C4%93t%C4%81jas_viz%C4%ABte_Latvij%C4%81_2024_27_%28cropped%29.jpg/500px-%C4%8Cehijas_parlamenta_priek%C5%A1s%C4%93d%C4%93t%C4%81jas_viz%C4%ABte_Latvij%C4%81_2024_27_%28cropped%29.jpg',
      category: 'Není zmrd',
      categoryReason: 'Je častým cílem dezinformací, ne jejich zdrojem — nejznámější „výroky” (pečení kuřat, přímá volba prezidenta) pocházejí z parodických účtů a fabrikací, ne od ní. Demagog ji vede převážně jako pravdivou. Ostré výroky vůči Orbánovi jsou doložená zahraničněpolitická kritika, ne dehonestace konkrétní osoby. Hrany má, zmrdovský vzorec ne.',
      dictum: 'Terč hoaxů, ne jejich pachatelka — kritizovat Orbána za bourání demokracie není toxicita, je to politický postoj.',
      lit: [],
      overrides: {
        lze: { text: 'Demagog.cz vede převážně pravdivé výroky (cca 101 pravda); nejcirkulovanější „lži” jí byly podvržené z parodických účtů a fabrikací, nejde o její vlastní tvrzení.',
          src: [S('Deník.cz', 'Že Pekarová radila péct kuřata se sousedy? Jde o lež', 'https://www.denik.cz/z_domova/hoax-fake-news-marketa-pekarova-adamova-kurata.html')] },
        penize: { text: 'Bez doloženého střetu zájmů či dotačních vazeb.' },
        prace: { text: 'Jako předsedkyně Sněmovny vykazovala vysokou aktivitu.' },
        konzistence: { text: 'Postoj vůči Orbánovi a maďarské opozici drží dlouhodobě konzistentně od roku 2021.' },
        toxicita: { text: 'Ostrá kritika V. Orbána (oslabování demokracie, kolaborace s Kremlem) je doložená politická polemika vůči zahraničnímu lídrovi, nikoli dehonestace konkrétní osoby; sama je naopak dlouhodobým terčem urážek.' },
        zbabelost: { text: 'Za kontroverzní výroky (např. „vezměte si svetr”) se postavila a obhájila je, odpovědnost neodklání.' },
      },
    }),
    person({
      id: 'stanjura', name: 'Zbyněk Stanjura', party: 'ODS',
      role: 'exministr financí, expředseda poslaneckého klubu ODS',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Zbyn%C4%9Bk_Stanjura_%282022%29.jpg/500px-Zbyn%C4%9Bk_Stanjura_%282022%29.jpg',
      category: 'Vohnout',
      categoryReason: 'Vohnout pravicového střihu: neohýbá se před jedním vůdcem jako loajalisté ANO, ohýbá se před vládní linií. Strana „rozpočtové odpovědnosti“ — jako ministr financí hájil rekordní schodek 290,7 mld jako dodržení pravidel, v opozici tytéž schodky atakuje jako „návrat k nezodpovědnému hospodaření“. K tomu zbabělé svalení bitcoinové kauzy na podřízené. Dvě osy, žádný vlastní profit ani systém — proto Vohnout, ne Potvrzený zmrd (to je jeho stranický kolega Blažek).',
      dictum: 'Strana rozpočtové odpovědnosti, ministr rekordních schodků: ve vládě je hájil, v opozici je atakuje — a za miliardu v bitcoinech může proces, ne ministr.',
      lit: ['konzistence', 'zbabelost'],
      dfens: [
        { n: 4, why: 'Rozpočtovou odpovědnost káže v opozici; ve vládě hájil rekordní schodky jako dodržení pravidel.' },
        { n: 7, why: 'Klíčovou informaci o miliardovém daru nechal ležet ve struktuře ministerstva měsíce bez reakce.' },
      ],
      overrides: {
        lze: { text: 'Demagog.cz: ze 123 výroků 104 pravda, 8 nepravda, 6 zavádějící, 5 neověřitelné — podíl nepravd na ministra financí nízký, osu systematické lži nepodkládá.' },
        penize: { text: 'Bez doloženého střetu zájmů, dotací či profitu přes rodinu.' },
        prace: { text: 'Čistá osa — jako ministr i předseda klubu vykazoval vysokou aktivitu.' },
        zbabelost: { text: 'V bitcoinové kauze obdrželo jeho ministerstvo financí 30. ledna 2025 písemné upozornění na miliardový dar v bitcoinech od odsouzeného; právní sekce 13. února vrátila návrh s varováním. Stanjura připustil, že informace měl dostat dřív, vinu odmítl slovy „prostě se stalo“ a odpovědnost svaloval na podřízené. Národní centrála proti organizovanému zločinu prověřuje jeho vědomost a postup; sám obviněn nebyl.',
          src: [S('Aktuálně.cz', '„Prostě se stalo“ — Stanjura se hájí, policie prověřuje jeho roli v bitcoinové kauze', 'https://zpravy.aktualne.cz/domaci/proste-se-stalo-haji-se-stanjura-na-ktereho-utoci-predevsim/r~2579b1364c0411f080bfac1f6b220ee8/'), S('iROZHLAS', 'Ministerstvo financí o bitcoinech muselo vědět', 'https://www.irozhlas.cz/zpravy-domov/volby-2025-zbynek-stanjura-ministr-financi-neuspel-ve-volbach-ostatni-ministri_2510050818_tec')] },
        toxicita: { text: 'Ostřejší výměny v rozpočtových debatách, ale bez doložené dehonestace konkrétních osob.' },
        konzistence: { text: 'Jako ministr financí (ODS — strana „rozpočtové odpovědnosti“) obhajoval rekordní schodek hospodaření 290,7 mld za rok 2024 jako dodržení rozpočtových pravidel; v opozici od 2026 tytéž deficitní rozpočty označuje za „extrémní schodek a návrat k nezodpovědnému hospodaření“. Koaliční STAN k nedodržení plánovaného schodku 2025 uvedl: „udělali jsme chybu, že jsme věřili Stanjurovi“.',
          src: [S('ČT24', 'Rozpočet 2024 skončil schodkem 290,7 mld, Stanjura nesouhlasí', 'https://ct24.ceskatelevize.cz/clanek/ekonomika/schillerova-oznami-lonsky-vysledek-rozpoctu-ceka-prekroceni-planovaneho-schodku-368943'), S('ODS', 'ODS k rozpočtu 2026: extrémní schodek a rozpočtová nezodpovědnost', 'https://www.ods.cz/clanek/28012-ods-k-rozpoctu-2026-extremni-schodek-a-rozpoctova-nezodpovednost-ohrozuji-v-dobe-ekonomickeho-rustu-budoucnost-ceske-ekonomiky'), S('Echo24', '„Udělali jsme chybu, že jsme věřili Stanjurovi“, zní ze STAN', 'https://www.echo24.cz/a/HPpWs/zpravy-ekonomika-statni-rozpocet-2025-nedodrzeni-schodku-rozpoctu-stanjura-fiala-reakce')] },
      },
    }),
    person({
      id: 'blazek', name: 'Pavel Blažek', party: 'ODS (členství pozastaveno)',
      role: 'exministr spravedlnosti',
      scope: 'celostátní',
      category: 'Potvrzený zmrd',
      categoryReason: 'Bitcoinová kauza není manažerský přešlap — je to vědomé převzetí miliardy v kryptu od odsouzeného drogového dealera, prodej darknetových bitcoinů přes stát a jejich obhajoba jako „ultračistých“. Není systémový jako Babiš (nemá ekosystém ani dlouhý profitový řetězec) ani populista — je to potvrzený jednorázový, ale plně doložený zmrd se třemi svítícími osami a trestním stíháním.',
      dictum: 'Bitcoiny od odsouzeného dealera nazval „ultračistými“ a „ultralegálními“, stát je prodal, policie je zmrazila jako výnos z trestné činnosti — a ministr se cítí „naprosto nevinný“.',
      highlight: 'Březen 2025: ministerstvo spravedlnosti pod Blažkem přijalo dar zhruba miliardy korun v bitcoinech od Tomáše Jiříkovského, pravomocně odsouzeného za drogy a provoz darknetového tržiště. Blažek dar veřejně nazval „ultračistým“, „ultralegálním“ a „morálním pokáním“. Pražská směnárna pak nástrojem Chainalysis dohledala, že bitcoiny pocházejí z tržiště Nucleus, kde se obchodovalo se zbraněmi a drogami. Stát část v aukcích prodal (přes 468 BTC), policie je následně zmrazila jako výnos z trestné činnosti a kupcům muselo ministerstvo vyplatit 44 mil. Kč. Blažek 30. května 2025 rezignoval, 7. června pozastavil členství v ODS. V květnu 2026 ho policie obvinila z legalizace výnosů z trestné činnosti a zneužití pravomoci úřední osoby (hrozí 5–12 let); stíhán je na svobodě a vinu odmítá.',
      lit: ['lze', 'penize', 'zbabelost'],
      dfens: [
        { n: 4, why: 'Dar nejprve „ultračistý a ultralegální“, po dohledání původu z darknetu obrana, že o ničem nevěděl.' },
        { n: 8, why: 'Trval na rétorice „morálního pokání“ dárce, dokud Chainalysis neukázal opak.' },
        { n: 9, why: 'Po obvinění hraje na vlastní nevinu a procesní formality místo věcného vysvětlení původu peněz.' },
      ],
      overrides: {
        lze: { text: 'Dar v bitcoinech od odsouzeného Tomáše Jiříkovského veřejně označil za „ultračistý“, „ultralegální“ a za „morální pokání“ dárce. Nezávislá analýza nástrojem Chainalysis (směnárna Bit.plus) dohledala původ bitcoinů z darknetového tržiště Nucleus obchodujícího se zbraněmi a drogami.',
          src: [S('Deník.cz', 'Vše o kauze bitcoinů: proč ministr Blažek skončil, kdo byl dárce', 'https://www.denik.cz/z_domova/vse-o-blazek-darovane-bitcoiny-faq.html'), S('Wikipedie', 'Bitcoinová kauza — „ultračistý“, „ultralegální“, původ z tržiště Nucleus', 'https://cs.wikipedia.org/wiki/Bitcoinov%C3%A1_kauza')] },
        penize: { text: 'Ministerstvo spravedlnosti pod jeho vedením přijalo dar zhruba miliardy korun v bitcoinech od odsouzeného drogového dealera a část (přes 468 BTC) prodalo v aukcích; policie bitcoiny zmrazila jako výnos z trestné činnosti a kupcům muselo ministerstvo vyplatit 44 mil. Kč. V květnu 2026 obviněn z legalizace výnosů z trestné činnosti a zneužití pravomoci úřední osoby, stíhán na svobodě, hrozí 5–12 let. Sám tvrdí, že osobně nic nezískal.',
          src: [S('Echo24', 'V kauze Bitcoin obviněni další tři lidé včetně exministra Blažka', 'https://www.echo24.cz/a/Hx33D/zpravy-domov-v-kauze-bitcoin-byli-obvineni-dalsi-tri-lide-vcetne-ministra-blazka'), S('Česká justice', 'Blažek končí kvůli skandálu s kryptoměnami', 'https://www.ceska-justice.cz/2025/05/blazek-konci-kvuli-skandalu-s-kryptomenami-opousti-vladu/')] },
        prace: { text: 'Bez doloženého záznamu nadprůměrné neúčasti.' },
        toxicita: { text: 'Bez doložené dehonestace či šikany konkrétních osob ve vazbě na tuto kauzu.' },
        konzistence: { text: 'Mimo bitcoinovou kauzu bez doloženého obratu kabátu či stranických přesunů.' },
        zbabelost: { text: 'Po provalení kauzy 30. května 2025 rezignoval a 7. června pozastavil členství v ODS, ale odpovědnost za přijetí daru odmítá, vinu po obvinění v květnu 2026 popírá („cítím se naprosto nevinný“) a roli přenáší na proces a podřízené. Spolu s ním obviněni i náměstek Radomír Daňhel a advokát Kárim Titz.',
          src: [S('Deník.cz', '„Cítím se naprosto nevinný“, prohlásil Blažek', 'https://www.denik.cz/z_domova/bitkoinova-kauza-pavel-blazek-se-citi-nevinny.html'), S('iROZHLAS', 'Blažek po bitcoinové kauze pozastavil členství v ODS', 'https://www.irozhlas.cz/zpravy-domov/blazek-po-bitcoinove-kauze-pozastavil-clenstvi-v-ods-rezignoval-i-na-post-sefa_2506071813_ako')] },
      },
    }),
    person({
      id: 'kupka', name: 'Martin Kupka', party: 'ODS',
      role: 'exministr dopravy, místopředseda ODS',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Martin_Kupka_ODS_%28cropped%29.jpg/500px-Martin_Kupka_ODS_%28cropped%29.jpg',
      category: 'Není zmrd',
      categoryReason: 'Resort se mu pod rukama plnil korupčními kauzami (Dozimetr ve Středočeském kraji, hotovost u šéfa Správy železnic), ale v žádné z nich Kupka nefiguruje jako obviněný — v Dozimetru byl jen vyslechnut jako svědek a šéfa Správy železnic po nálezu 80 milionů sám odvolal. Manažerská blízkost ke kauzám bez doloženého osobního zmrdství drží osy čisté.',
      dictum: 'Není zmrd, ale ani štístko: dvakrát mu kauza vybuchla pod rukama, dvakrát z toho vyšel jako svědek nebo ten, kdo odvolává — doloženého osobního prohřešku nula.',
      lit: [],
      overrides: {
        lze: { text: 'Bez doloženého systematického lhaní v mediálním archivu či u Demagogu.' },
        penize: { text: 'V kauze Dozimetr (Středočeský kraj) vyslechnut policií jen jako svědek; potvrdil kontakt se Zakariou Nemrahem, ale nebyl obviněn ani označen za příjemce prospěchu.' },
        prace: { text: 'Čistá osa — bez doloženého záznamu nadprůměrné neúčasti.' },
        toxicita: { text: 'Bez doložené dehonestace či šikany konkrétních osob.' },
        konzistence: { text: 'Bez doloženého obratu kabátu či stranických přesunů.' },
        zbabelost: { text: 'V kauze Správy železnic po nálezu 80 mil. v hotovosti u ředitele Svobody (11/2025) sám rozhodl o jeho odvolání — odpovědnost převzal, nezakrýval.' },
      },
    }),
    person({
      id: 'valek', name: 'Vlastimil Válek', party: 'TOP 09',
      role: 'exministr zdravotnictví, expvicepremiér',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Vlastimil-V%C3%A1lek2019b.jpg/500px-Vlastimil-V%C3%A1lek2019b.jpg',
      category: 'Hraniční případ',
      categoryReason: 'Není architekt ani populista — je to lékař v politice s jedním doloženým střetovým návykem: opakovaně létá hrát golf do Dubaje s šéfem IT skupiny, jejíž firmy vyhrávají na jeho resortu zakázky za stovky milionů, a tvrdí, že netuší, čím se přítel živí. To osu peněz rozsvěcí; chybí ale systém, proto jen hraniční, ne plnokrevný.',
      dictum: '„Je to můj pacient, kterému jsem zachránil život. Tečka“ — jen ten pacient náhodou vede IT skupinu, co bere na ministrově resortu zakázky za stovky milionů.',
      highlight: 'Válek opakovaně jezdí soukromě hrát golf do Dubaje s Milanem Samešem, šéfem skupiny Aricoma Group. Firmy Aricomy přitom vyhrávají zakázky na jeho resortu zdravotnictví — kyberbezpečnost ve fakultních nemocnicích, systém výměny zdravotních dat za 188 mil., vzdělávací platformu za 101 mil. a další. Válek dvacetiletého přítele hájí slovy „je to můj pacient, kterému jsem zachránil život“ a tvrdí: „to já vůbec netuším, kam dodává firma pana Sameše.“ Sám byl přitom v letech 2020–2021 IT náměstkem ve fakultní nemocnici Brno během počátečních kyberbezpečnostních tendrů.',
      lit: ['penize'],
      dfens: [
        { n: 8, why: 'Hájí přátelství s dodavatelem resortu vstřícnou historkou o zachráněném životě místo věcného vyřešení střetu.' },
      ],
      overrides: {
        lze: { text: 'Demagog.cz ověřil 10 výroků (6 pravda, 2 nepravda, 2 neověřitelné). V dubnu 2022 tvrdil, že na covid umírají „bez výjimky lidé bez očkování“, což podle dat ÚZIS jeho vlastního resortu neodpovídalo skutečnosti — na ojedinělý doložený výrok, ne systematickou lež.' },
        penize: { text: 'Opakovaně jezdil soukromě hrát golf do Dubaje s Milanem Samešem, šéfem skupiny Aricoma Group, jejíž firmy vyhrávají zakázky na resortu zdravotnictví (kyberbezpečnost ve FN, systém výměny zdravotních dat za 188 mil., vzdělávací platforma za 101 mil. aj.). Válek uvedl, že cesty si platí sám a netuší, čím se Sameš živí. Sám byl v letech 2020–2021 IT náměstkem FN Brno během počátečních kyberbezpečnostních tendrů.',
          src: [S('ČT24', 'Válek létá na golf se šéfem firmy, která vyhrává tendry na jeho resortu', 'https://ct24.ceskatelevize.cz/clanek/domaci/seznam-zpravy-valek-leta-na-golf-se-sefem-firmy-ktera-vyhrava-tendry-na-jeho-resortu-362947'), S('ParlamentníListy', 'Ministr zdravotnictví používá na privátní cesty diplomatický pas', 'https://www.parlamentnilisty.cz/zpravy/kauzy/CK-Valek-Reisen-Ministr-zdravotnictvi-pouziva-na-privatni-cesty-diplomaticky-pas-777251')] },
        prace: { text: 'Čistá osa — bez doloženého záznamu nadprůměrné neúčasti.' },
        toxicita: { text: 'Bez doložené cílené dehonestace či šikany konkrétních osob.' },
        konzistence: { text: 'Bez doloženého zásadního obratu kabátu či stranických přesunů.' },
        zbabelost: { text: 'V korupční kauze nemocnice Motol (zakázky přes 4 mld., téměř dvě desítky obviněných) sám odvolal ředitele Ludvíka a informoval Evropskou komisi — odpovědnost převzal, nezakrýval.' },
      },
    }),
    person({
      id: 'langsadlova', name: 'Helena Langšádlová', party: 'TOP 09',
      role: 'exministryně pro vědu, výzkum a inovace, poslankyně',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Helena_Lang%C5%A1%C3%A1dlov%C3%A1.jpg/500px-Helena_Lang%C5%A1%C3%A1dlov%C3%A1.jpg',
      category: 'Není zmrd',
      categoryReason: 'Slabá v komunikaci a viditelnosti, ne v charakteru. Demisi 2024 podala poté, co ztratila podporu vlastního vedení kvůli neschopnosti „prodat” svou práci — vědecká obec její působení naopak hodnotila pozitivně. Manažerská a komunikační slabina není zmrdství: chybí lež, finanční střet, toxicita i otáčení kabátu.',
      dictum: 'Případ politické neviditelnosti, ne zmrdství — odešla, protože neměla lajky, ne protože by někoho podrazila.',
      lit: [],
      overrides: {
        lze: { text: 'Bez doloženého vzorce nepravd — Demagog eviduje převážně pravdivé hodnocení.' },
        penize: { text: 'Bez doloženého střetu zájmů či dotačních vazeb.' },
        prace: { text: 'Bez záznamu o absenci.' },
        konzistence: { text: 'Bez doloženého otáčení postojů.' },
        toxicita: { text: 'Bez doložených urážek či dehonestace.' },
        zbabelost: { text: 'Demisi a kritiku přijala otevřeně, odpovědnost neodklonila.' },
      },
    }),
    person({
      id: 'jurecka', name: 'Marian Jurečka', party: 'KDU-ČSL',
      role: 'exministr práce a sociálních věcí, exvicepremiér, expředseda KDU-ČSL',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Marian_Jurecka_-_portrait.jpg/500px-Marian_Jurecka_-_portrait.jpg',
      category: 'Oportunistický zmrd',
      categoryReason: 'Není systémový hráč jako Schillerová — chybí mu tichý ekosystém i finanční konstrukce. Je to věřící moralista, který kalibruje vlastní zásadovost podle volební situace: postoj ke sňatkům couvá podle koalice, nad rodinnými dotacemi mhouří oko, a sociální politiku ilustruje stereotypem. Oportunistický, ne Systémový, protože nejde o konstrukci, ale o ohýbání přesvědčení podle aktuální výhody.',
      dictum: 'Křesťanský moralista s pružnou páteří — zásadovost platí, dokud nestojí v cestě koalici nebo rodinnému hektaru.',
      highlight: 'Červenec 2023: ministr práce ilustroval příspěvek o „zneužívání dávek” fotkou tmavého muže s pivem z romské pietní akce a oznámil, že si na takové „posvítí”. Strhla se vlna kritiky napříč koalicí — Kalousek to nazval „nespravedlivým a odpudivým”, Bartoš mu připomněl slib nerozdělovat společnost. Jurečka se omluvil, že se to nemá opakovat. Symbolem zneužívání systému si vybral příslušníka menšiny, kterou prý „vždy podporoval”.',
      lit: ['konzistence', 'toxicita', 'penize'],
      dfens: [
        { n: 4, why: 'Postoj ke stejnopohlavním sňatkům mění podle koaliční výhody — od ultimáta po „svobodné hlasování”.' },
        { n: 8, why: 'Profiluje se jako mravní autorita, sociální politiku ale komunikuje stereotypem pro lajky.' },
        { n: 9, why: 'Rétorika „posvítíme si na zneužívače” cílí na obraz tvrdé ruky, ne na řešení.' },
      ],
      overrides: {
        konzistence: { text: 'V kampani 2021 prohlásil, že si neumí představit účast KDU-ČSL ve vládě, která schválí manželství pro všechny; pod tlakem kolegů z výroku během dní couvl na „svobodné hlasování” každého poslance. Postoj k vyrovnání práv stejnopohlavních párů následně dále posouval podle situace.',
          src: [S('CNN Prima News', 'Jurečka ze svého výroku o stejnopohlavních sňatcích couvá', 'https://cnn.iprima.cz/jurecka-33892'), S('Echo24', 'Jurečka prudce otočil — zákaz sňatků obětuje změně vlády', 'https://www.echo24.cz/a/SZStX/jurecka-prudce-otocil-zakaz-stejnopohlavnich-manzelstvi-obetuje-na-oltar-zmeny-vlady')] },
        toxicita: { text: 'V červenci 2023 jako ministr práce doprovodil příspěvek o zneužívání sociálních dávek fotografií tmavého muže s pivem pořízenou na romské pietní akci, s textem, že si na zneužívače „posvítí”. Krok kritizovali koaliční partneři i romské organizace jako šíření stereotypu stigmatizujícího menšinu; Jurečka se omluvil.',
          src: [S('Aktuálně.cz', 'Rom s pivem a zneužívání dávek — lídři stran kritizují', 'https://zpravy.aktualne.cz/domaci/jurecka-instagram-rom-kampan-davky/r~a3b47a94312711eebc030cc47ab5f122/'), S('Romea.cz', 'Jako symbol zneužívání dávek si vybral Roma — šíření stereotypů', 'https://romea.cz/cz/domaci/ministr-marian-jurecka-si-jako-symbol-zneuzivani-socialnich-davek-vybral-roma-podle-michala-mika-jde-o-sireni-stereotypu-ktere-stigmatizuje-romskou-mensinu')] },
        penize: { text: 'Farmu Jurenka před vstupem do vlády převedl na manželku, která pobírá plošné eurodotace na plochu. Bratr Lukáš Jurečka, působící zároveň jako neplacený poradce na ministerstvu, čerpal přes své zemědělské firmy dotace v řádu desítek až stovek milionů korun (Hlídač státu eviduje souhrnně cca 291 mil. Kč) včetně více než 8 mil. Kč z EU a grantu 500 tis. Kč přímo z resortu řízeného bratrem. Nezákonnost nebyla prokázána; Jurečka střet popírá.',
          src: [S('Neovlivní', 'Dotační parazit — miliony z veřejných peněz pro ministrova bratra', 'https://neovlivni.cz/dotacni-parazit-miliony-z-verejnych-penez-pro-ministrova-bratra/'), S('Echo24', 'Ministr Jurečka nepodniká, eurodotace na půdu čerpá manželka', 'https://www.echo24.cz/a/wcfRQ/ministr-jurecka-nepodnika-eurodotace-na-pudu-cerpa-manzelka')] },
        lze: { text: 'Demagog.cz z 193 ověřených výroků eviduje 7 nepravdivých a 9 zavádějících — převážně dílčí přehánění historických statistik zaměstnanosti; systematické lhaní doloženo není.' },
        prace: { text: 'Bez záznamu o absenci — jako ministr i předseda strany vykazoval vysokou aktivitu.' },
        zbabelost: { text: 'Bez doloženého házení podřízených přes palubu — za sporné výroky se opakovaně sám omlouval.' },
      },
    }),
    person({
      id: 'konecna', name: 'Kateřina Konečná', party: 'Stačilo! / KSČM',
      role: 'předsedkyně KSČM (do sjezdu 2026), europoslankyně, exposlankyně PSP',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/1719413916595_20240626_KONECNA_Katerina_CZ_008.jpg/500px-1719413916595_20240626_KONECNA_Katerina_CZ_008.jpg',
      category: 'Hraniční',
      categoryReason: 'Hraniční, ne Populistický: lež a toxicita jsou doložené a opakované, ale chybí finanční střet i systém kolem vlastní osoby — KSČM žije z nemovitostí, ne z její kapsy. Konzistentní antisystémová rétorika ji drží nad Populistou, který obrací podle nepřítele; Konečná nepřítele drží stejného (NATO, EU, vláda) léta. Tři svítící osy bez finančního ocasu = poctivá trojka, ne čtyřka.',
      dictum: 'Doložená recidivistka zavádějících výroků, která ze sálu odchází s nálepkou „váleční štváči“ — a po volebním krachu Stačilo! dnes odchází i z čela strany, kterou dovedla na 2 %.',
      highlight: 'Říjen 2025: Stačilo! pod jejím vedením získalo 4,3 % a propadlo do mimoparlamentní ligy; preference KSČM následně klesly k 2 %. 30. května 2026 na sjezdu Konečná oznámila, že nekandiduje na žádnou funkci a zůstává řadovou členkou. Lídryně, která hnutí poslala na smetiště, končí jako řadový člen — odpovědnost za výsledek vyvozuje teprve, když už není co vést.',
      lit: ['lze', 'konzistence', 'toxicita'],
      dfens: [
        { n: 4, why: 'Antisystémová pozice se ohýbá podle aktuálního nepřítele — od vlády přes EU po NATO.' },
        { n: 9, why: 'Rétorika míří na rozdrcení soupeře („váleční štváči“) místo věcného řešení války.' },
        { n: 10, why: 'Účelové spojenectví Stačilo! — KSČM jako jádro koalice slepené z nesourodých subjektů.' },
      ],
      overrides: {
        lze: { text: 'Demagog.cz eviduje desítky ověřených výroků s opakovaným podílem nepravdivých a zavádějících — mj. nepravdivé tvrzení o beztrestnosti amerických vojáků v rámci slovenské obranné dohody a zavádějící údaj o zdvojnásobení voličské podpory KSČM v kraji (2008 vs. 2012).',
          src: [S('demagog.cz', 'Konečná o slovenské obranné dohodě — nepravda', 'https://demagog.cz/diskuze/katerina-konecna-stoji-za-slovaky'), S('demagog.cz', 'Ověřené výroky Kateřiny Konečné — hodnocení', 'https://demagog.cz/politici/katerina-konecna-240?hodnoceni=nepravda')] },
        penize: { text: 'Bez doloženého osobního finančního střetu — KSČM se financuje převážně z nájmů a prodeje nemovitostí, nikoli z toků přes její osobu.' },
        prace: { text: 'Na zasedáních EP chyběla cca každý pátý jednací den (12 z 58), účast v hlasováních 89,1 % — podprůměrná docházka, ale ne extrémní; osu nesvítíme, neboť hlasovací účast zůstává nad 89 %.',
          src: [S('Novinky', 'Konečná chyběla na každém pátém jednání europarlamentu', 'https://www.novinky.cz/clanek/domaci-konecna-chybela-na-kazdem-patem-jednani-europarlamentu-dotahuje-ji-gregorova-40537446')] },
        konzistence: { text: 'Dlouhodobě setrvale antisystémová a proruská pozice — v debatě s ministrem Rakušanem označila členy vlády za „válečné štváče“, prosazuje „neutrální Ukrajinu“ a tvrzení, že „nespravedlivý mír je lepší než posílat muže na smrt“. Postoj se neohýbá podle situace, ale konzistence v klíčových bezpečnostních otázkách jde proti faktům (Budapešťské memorandum).',
          src: [S('ČT24', 'Konečná chce garanci neutrální Ukrajiny, Fischer připomněl Budapešťské memorandum', 'https://ct24.ceskatelevize.cz/domaci/3438786-konecna-chce-garanci-neutralni-ukrajiny-fischer-ji-pripomnel-budapestske-memorandum')] },
        toxicita: { text: 'V televizní debatě opakovaně označila členy vlády za „válečné štváče“ („sypete tam peníze, posíláte tam zbraně, pro mě jste váleční štváči“); zároveň zvažovala trestní oznámení na politické oponenty (Nerudová, Novotný). Doložená dehonestující rétorika vůči konkrétním osobám.',
          src: [S('Deník', '„Jste váleční štváči,“ řekla Konečná Rakušanovi', 'https://chrudimsky.denik.cz/zpravy-z-ceska/vit-rakusan-katerina-konecna-debata-hadka-ukrajina.html'), S('Echo24', 'Konečná zvažuje žalobu na Nerudovou i kvůli výrokům Novotného', 'https://www.echo24.cz/a/HHuky/podcast-echo-pavla-strunce-konecna-kscm-zvazuje-trestni-oznameni-nerudova-novotny')] },
        zbabelost: { text: 'Bez samostatného doloženého záznamu házení podřízených přes palubu — odpovědnost za volební krach nese veřejně sama (odchod z čela strany).' },
      },
    }),
    person({
      id: 'malacova', name: 'Jana Maláčová', party: 'SOCDEM',
      role: 'expředsedkyně SOCDEM, expministryně práce a sociálních věcí',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Jana_Mal%C3%A1%C4%8Dov%C3%A1%2C_2021-1.jpg/500px-Jana_Mal%C3%A1%C4%8Dov%C3%A1%2C_2021-1.jpg',
      category: 'Oportunistický zmrd',
      categoryReason: 'Oportunistický, ne Systémový: nebuduje tichý ekosystém jako Schillerová ani neprovokuje jako Turek — mění strategickou identitu strany podle průzkumů a momentální výhody (od „demokratické levice“ k paktu s nereformovanými komunisty). Finanční roh je čistý, proto ne Plnokrevný; ale otočka, ostrá rétorika i docházkové prohřešky drží pevné čtyři osy.',
      dictum: 'Sociální demokratku, která stranu po 77 letech znovu nahnala do náruče komunistů, voliči Stačilo! z kandidátky vykroužkovali — a ona pakt obhajuje jako jedinou cestu, jak SOCDEM zachránit, kterou ale zároveň rozpustila.',
      highlight: 'Sněmovní volby 2025: Maláčová coby předsedkyně SOCDEM dotáhla stranu na společnou kandidátku komunistického Stačilo!, které získalo 4,3 % a propadlo. Z čela pražské kandidátky ji komunističtí voliči vykroužkovali ve prospěch ortodoxní leninistky Petry Prokšanové. Z SOCDEM kvůli paktu odešli Petříček, Dienstbier i hejtman Netolický; Špidla vyzval k její okamžité rezignaci. V prosinci 2025 ji v čele nahradil Jiří Nedvěd.',
      lit: ['lze', 'prace', 'konzistence', 'toxicita'],
      dfens: [
        { n: 4, why: 'Strategickou identitu SOCDEM přepsala podle aktuální výhody — od demokratické levice k paktu s KSČM.' },
        { n: 8, why: 'Komunikaci přiostřila po vzoru Okamury a Vidláka, když to průzkumy začaly vyžadovat.' },
        { n: 9, why: 'Rétorika „pravici ráda půjdu po krku“ — souboj místo řešení.' },
        { n: 10, why: 'Účelové spojenectví Stačilo! — slepení SOCDEM s KSČM kvůli překročení prahu.' },
      ],
      overrides: {
        lze: { text: 'Demagog.cz ověřil desítky jejích výroků; investigativní „databáze lží“ (Neovlivní) dokumentuje její opakované zavádějící formulace, mj. obhajobu „rouškovného“ jako „impulzu pro ekonomiku“ a odbytí debaty o financování důchodů jako „plytké a hloupé“.',
          src: [S('Neovlivní', 'Databáze lží: Maláčová a plytká a hloupá otázka', 'https://neovlivni.cz/databaze-lzi-malacova-a-plytka-a-hloupa-otazka/'), S('demagog.cz', 'Ověřené výroky Jany Maláčové', 'https://demagog.cz/politici/jana-malacova-498')] },
        penize: { text: 'Čistý roh — bez doloženého osobního finančního střetu, dotace ve střetu zájmů ani profitu přes rodinu či firmy.' },
        prace: { text: 'Doložený docházkový prohřešek se symbolickým přesahem: kritizovala poslance za neúčast na kulatém stole, který sama svolala na čtvrtek, kdy zasedala sněmovna — tedy v kolizi s jednacím dnem; ministři SOCDEM včetně ní vykazovali podprůměrnou účast na hlasováních.',
          src: [S('iROZHLAS', 'Maláčová obhajuje rouškovné, kontext její sněmovní aktivity', 'https://www.irozhlas.cz/zpravy-domov/jana-malacova-rouskovne-vyroky-prispevek-pro-duchodce-seniori_2009020827_dok'), S('Deník', 'Přehled účasti poslanců na hlasování', 'https://www.denik.cz/cesi-v-cislech/prehled-ucasti-poslancu-na-hlasovani-kdo-byl-pilny-a-kdo-casto-chybel.html')] },
        konzistence: { text: 'Strategický obrat strany: sociální demokracii, historicky vymezenou vůči KSČ paktem z roku 1948, dovedla k volební koalici s nereformovanými komunisty ze Stačilo!; HlídacíPes doložil, že souhlas k tomuto kroku v zahraničí (Berlín) ve skutečnosti nezískala, ač tvrdila opak. Pakt vyvolal hromadné odchody (Petříček, Dienstbier, Netolický).',
          src: [S('HlídacíPes.org', 'Jak Maláčová nedostala v Berlíně souhlas jít s komunisty', 'https://hlidacipes.org/jak-malacova-nedostala-v-berline-souhlas-jit-s-komunisty/'), S('Hospodářské noviny', 'Po 77 letech zase s bolševiky', 'https://archiv.hn.cz/c1-67754890-jana-malacova-se-rozhodla-udelat-ze-socialni-demokracie-zombie-armadu-neutece-pred-ni-bohuzel-ani-petr-fiala')] },
        toxicita: { text: 'Přiostřená konfrontační rétorika: jako lídryně Stačilo! v Praze deklarovala, že „pravici ráda půjde po krku“; mediální analytici označili její vyhrocenou komunikaci za napodobení rétoriky Okamury a Vidláka. Exposlanec Sklenák po odchodu ze SOCDEM popsal jednání jako „obrovské ponížení“.',
          src: [S('SOCDEM', '„Pravici ráda půjdu po krku“ — lídryně Stačilo! v Praze', 'https://socdem.cz/akt-aktuality/lidryne-kandidatky-stacilo-v-praze-jana-malacova-pravici-rada-pujdu-po-krku/'), S('Blesk', '„Obrovské ponížení“ — exposlanec Sklenák končí v SOCDEM', 'https://www.blesk.cz/clanek/zpravy-politika/838498/obrovske-ponizeni-prosil-jsem-malacovou-at-to-nedelaji-rika-exposlanec-sklenak-a-konci-v-socdem.html')] },
        zbabelost: { text: 'Bez doloženého házení podřízených přes palubu — odpovědnost za krach nesla a z funkce odešla, byť po tlaku (výzva Špidly).' },
      },
    }),
    person({
      id: 'zaoralek', name: 'Lubomír Zaorálek', party: 'SOCDEM',
      role: 'exministr zahraničí, exministr kultury, expmístopředseda SOCDEM',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Lubom%C3%ADr_Zaor%C3%A1lek_2022.jpg/500px-Lubom%C3%ADr_Zaor%C3%A1lek_2022.jpg',
      category: 'Hraniční',
      categoryReason: 'Hraniční, ne Populistický: zásadní obrat o 180° v zahraniční politice (od „z EU chtějí jen zrádci“ k referendu o EU a paktu se Stačilo!) je doložený a tvoří jádro profilu; k tomu jeden doložený toxický akt vůči podřízené. Chybí ale finanční střet i systém kolem vlastní osoby — proto dvě osy a hraniční zařazení, ne plnokrevný zmrd.',
      dictum: 'Bývalý ministr zahraničí, který v roce 2017 prohlásil, že z EU chtějí jen zrádci, dnes coby kandidát Stačilo! tlačí referendum o vystoupení a stojí za Ruskem — proměna pod tlakem mizející kariéry, ne přesvědčení.',
      highlight: 'Předvolební obrat 2025: Zaorálek, jenž jako ministr zahraničí v roce 2017 řekl, že „z EU chtějí odejít jen zrádci“, šel coby dvojka Stačilo! na Moravě s kamerou do bruselského Molenbeeku varovat před migranty a obhajovat referendum o EU i NATO. RESPEKT zdokumentoval jeho otočku o 180 stupňů; sám přitom v roce 2022 „otočil“ v opačném směru a uznal, že „Rusko zásadně destabilizuje Evropu“. Postoj se mění podle politické potřeby, ne podle faktů.',
      lit: ['konzistence', 'toxicita'],
      dfens: [
        { n: 4, why: 'Klíčové zahraničněpolitické postoje (EU, NATO, Rusko) obrací podle aktuální politické výhody.' },
        { n: 5, why: 'Jako ministr kultury si vynutil rezignaci ředitelky Památníku Lidice kvůli jednomu výroku.' },
        { n: 8, why: 'Image antisystémového bojovníka přebírá podle trendu — z proevropského ministra antiunijní kandidát Stačilo!.' },
      ],
      overrides: {
        lze: { text: 'Bez doloženého systematického záznamu nepravdivých výroků na úrovni svítící osy — kritizované formulace spadají spíš pod obraty postojů (osa konzistence).' },
        penize: { text: 'Čistá osa — bez doloženého osobního finančního střetu, dotací či profitu přes rodinu.' },
        prace: { text: 'Bez doloženého záznamu nadprůměrné absence — dlouholetý aktivní poslanec a ministr.' },
        konzistence: { text: 'Doložený obrat o 180° v zahraniční politice: v roce 2017 tvrdil, že z EU chtějí odejít jen „zrádci“, později coby kandidát Stačilo! prosazuje referendum o vystoupení z EU i NATO a staví se prostoru blízkému ruským pozicím; mezitím v roce 2022 „otočil“ opačně a uznal ruskou hrozbu. RESPEKT jeho proměnu opakovaně dokumentoval.',
          src: [S('RESPEKT', 'Zaorálek aspiruje na titul nejtragikomičtějšího politika voleb', 'https://www.respekt.cz/cesko/lubomir-zaoralek-aspiruje-na-titul-nejtragikomictejsiho-politika-voleb'), S('RESPEKT', 'Zaorálek otočil: Rusko zásadně destabilizuje Evropu', 'https://www.respekt.cz/fokus/zaoralek-otocil-rusko-zasadne-destabilizuje-evropu')] },
        toxicita: { text: 'Jako ministr kultury si v roce 2020 vynutil rezignaci ředitelky Památníku Lidice Martiny Lehmannové; veřejně ji označil za autorku výroku o židovské ženě jako o někom, kdo „vyletěl komínem“ — formulace, kterou Lehmannová popřela. Doložený mocenský akt vůči podřízené prostřednictvím dehonestujícího veřejného nařčení.',
          src: [S('iROZHLAS', '„O židovské ženě mluvila, jako že vyletěla komínem,“ řekl Zaorálek k exšéfce Památníku Lidice', 'https://www.irozhlas.cz/zpravy-domov/pamatnik-lidice-martina-lehmannova-lubomir-zaoralek-ministr-kultury_2001302023_ako')] },
        zbabelost: { text: 'Bez samostatného doloženého záznamu vyhýbání se odpovědnosti na úrovni svítící osy.' },
      },
    }),
    person({
      id: 'pavel', name: 'Petr Pavel', party: 'nestraník',
      role: 'prezident České republiky (od 2023), armádní generál ve výslužbě, exppředseda Vojenského výboru NATO',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Petr_Pavel_%28crop%29.jpg/500px-Petr_Pavel_%28crop%29.jpg',
      category: 'Jedna skvrna',
      categoryReason: 'Pavel není zmrd — je kalibrační kotva spodního okraje stupnice. Nečerpá ve střetu, není mediálně doložen jako toxický ani jako absentér. Svítí jediná osa, konzistence, a to kvůli jednomu konkrétnímu obratu: během kampaně 2023 popíral roli ve vojenské rozvědce a obvinil historika z nepravd, po inauguraci ji ale sám přiznal v oficiálním hradním životopise. Jedna doložená skvrna, žádný vzorec — proto „Jedna skvrna“, ne „Hraniční“.',
      dictum: 'Generál, jehož jediná doložená skvrna je obrat ve vlastní minulosti: co v kampani popíral, po zvolení tiše připsal do hradního životopisu.',
      highlight: 'Vojenská rozvědka. Během prezidentské kampaně 2023 Pavel odmítal označení za bývalého důstojníka vojenské rozvědky a na CNN Prima News obvinil historika Petra Blažka, že „nepoužívá argumenty, které jsou pravdivé“. Po inauguraci ovšem jeho oficiální životopis na webu Pražského hradu uvádí, že „v roce 1988 před nástupem na postgraduální kurz se stal členem Zpravodajské správy Generálního štábu“. Blažek poté žádal omluvu. Není to lež o faktu — je to obrat ve vlastní verzi podle toho, zda zrovna probíhá kampaň.',
      lit: ['konzistence'],
      dfens: [
        { n: 8, why: 'Verzi vlastní minulosti formuloval jinak v kampani (popření) a jinak po zvolení (přiznání v hradním životopise).' },
      ],
      overrides: {
        lze: { text: 'Bez doloženého vzorce vlastních nepravdivých výroků; většina „citátů“ kolující o Pavlovi je podle Demagog.cz a Manipulátoři.cz prokázaný podvrh, ne jeho výrok.' },
        penize: { text: 'Bez doloženého čerpání veřejných prostředků ve střetu zájmů či profitu přes rodinu.' },
        prace: { text: 'Bez záznamu o nadprůměrné absenci ve výkonu funkce.' },
        konzistence: { text: 'Během kampaně 2023 odmítal roli ve vojenské rozvědce a na CNN Prima News obvinil historika P. Blažka z nepravd; po inauguraci v oficiálním životopise na webu Hradu uvedl, že se v roce 1988 stal členem Zpravodajské správy Generálního štábu. Blažek následně žádal omluvu.',
          src: [S('ParlamentníListy', 'Pavel přiznal členství v ZS GŠ, co celou kampaň obcházel; historik žádá omluvu', 'https://www.parlamentnilisty.cz/arena/monitor/Rozvedka-Pavel-priznal-co-celou-kampan-obchazel-Historik-zada-omluvu-731699'), S('CNN Prima', 'Petr Pavel o své minulosti lže, byl v utajovaném kurzu vojenské rozvědky, říká historik', 'https://cnn.iprima.cz/petr-pavel-o-sve-minulosti-lze-byl-v-utajovanem-kurzu-vojenske-rozvedky-rika-historik-185485')] },
        toxicita: { text: 'Bez doložených urážek či dehonestace konkrétních osob.' },
        zbabelost: { text: 'Bez doloženého vyhýbání se odpovědnosti; komunistickou minulost veřejně přiznává a lituje jí.' },
      },
    }),
    person({
      id: 'zeman', name: 'Miloš Zeman', party: 'SPOZ (dříve ČSSD)',
      role: 'exprezident ČR (2013–2023), expremiér, zakladatel SPOZ',
      scope: 'celostátní', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Milo%C5%A1_Zeman_2022.jpg/500px-Milo%C5%A1_Zeman_2022.jpg',
      category: 'Populistický zmrd',
      categoryReason: 'Zeman je mistr lži jako nástroje a dehonestace jako sportu — vymyšlený Peroutkův článek, „pomluvy“ novinářů. Není to tichý systémový hráč typu Babiš; je hlasitý provokatér s nepřítelem v každé větě. Peníze přitékaly netransparentně přes spolek a firmy napojené na Rusko. Proto Populistický s finančním přesahem, ne čistě Systémový.',
      dictum: 'Prezident, který si vymyslel Peroutkův článek a stát se za něj musel pravomocně omluvit — a jehož „nekampaň“ byla nejméně transparentní ze všech.',
      highlight: 'V roce 2015 Zeman tvrdil, že novinář Ferdinand Peroutka napsal v časopise Přítomnost článek „Hitler je gentleman“. Článek nikdy neexistoval, v archivech se nenašel. Zeman se odmítl omluvit a jeho mluvčí zveřejnil na webu Hradu jiné Peroutkovy texty. Peroutkova vnučka žalovala stát; Nejvyšší soud v říjnu 2021 pravomocně rozhodl, že Peroutka článek nenapsal a stát se musí za dehonestující výroky omluvit — což ministerstvo financí po šesti letech učinilo.',
      lit: ['lze', 'penize', 'konzistence', 'toxicita'],
      dfens: [
        { n: 4, why: 'Sliby a postoje obrací podle situace — vzdal se práva udělovat milosti jako „feudálního přežitku“, pak jich podepsal 26.' },
        { n: 8, why: 'Bombastické nepodložené informace jako nástroj pozornosti a image silného prezidenta.' },
        { n: 9, why: 'Politika jako drcení oponentů a dehonestace novinářů, ne hledání řešení.' },
        { n: 10, why: 'Síť netransparentních sponzorů a spolku „Přátelé Miloše Zemana“ kolem kampaní.' },
      ],
      overrides: {
        lze: { text: 'Demagog.cz dlouhodobě dokumentuje vysoký podíl nepravd — např. v prezidentské debatě v ČT 2018 z 52 faktických výroků 14 nepravdivých, 5 zavádějících a 8 neověřitelných. Doloženy nepravdy o nediskutovaném přijetí uprchlíků z Kosova 1999 či o tom, že neudělil žádné milosti.',
          src: [S('Deník', 'Demagog: Zeman měl v ČT 14 nepravdivých výroků, Drahoš tři', 'https://www.denik.cz/z_domova/volby-2018-zeman-mel-v-ct-podle-demagog-cz-14-nepravdivych-vyroku-drahos-3-20180126.html'), S('iROZHLAS', 'Sedm nepřesností Miloše Zemana — fakta usvědčují prezidenta', 'https://www.irozhlas.cz/zpravy-domov/milos-zeman-projev-tv-prima-ustava-policie-vrbetice_2104251923_vis')] },
        penize: { text: 'Kampaně i „nekampaň“ vedl netransparentně přes spolek „Přátelé Miloše Zemana“; úřad zjistil, že vedl kampaň za veřejné peníze a nevykázal výjezdy do krajů, Hrad požadoval utajení zprávy. Jeho SPOZ sponzorovala síť firem napojených na ruského právníka z okruhu V. Putina (Roldugin) a na zastoupení Lukoilu — celkem nejméně 12 mil. Kč.',
          src: [S('Aktuálně.cz', 'Zeman dělal kampaň za veřejné peníze, Hrad požadoval utajení zprávy', 'https://zpravy.aktualne.cz/domaci/zeman-kampan/r~ca2e187ee2e611ebb91a0cc47ab5f122/'), S('HlídacíPes.org', 'Nejméně transparentní je „nekampaň“ prezidenta Zemana', 'https://hlidacipes.org/penize-prezidentskou-kampan-nejmene-transparentni-nekampan-prezidenta-zemana/')] },
        konzistence: { text: 'Před zvolením označil milosti a amnestie za „feudální přežitek“ a práva se „dobrovolně vzdal“; přesto podepsal 26 milostí včetně kontroverzní milosti pro doživotně odsouzeného J. Kajínka (2017), který nesplňoval jím deklarovanou podmínku nevyléčitelné nemoci. Ke kauze Vrbětice po týdnu mlčení relativizoval ruskou stopu navzdory zprávě BIS.',
          src: [S('ČT24', 'Zeman hodlal udělovat milosti jen výjimečně, nakonec jich podepsal 26', 'https://ct24.ceskatelevize.cz/clanek/domaci/zeman-hodlal-udelovat-milosti-jen-vyjimecne-nakonec-jich-podepsal-26-9395'), S('Deník N', 'Tajná zpráva BIS o Vrběticích ležela na Hradě deset dní, prezident ji nečetl', 'https://denikn.cz/629479/tajna-zprava-bis-o-vrbeticich-lezela-na-hrade-deset-dni-prezident-ji-necetl-zrejme-mu-o-ni-ani-nerekli/')] },
        toxicita: { text: 'Pravomocně doložená dehonestace — Nejvyšší soud v říjnu 2021 potvrdil, že stát se musí omluvit za Zemanův nepravdivý výrok, že Ferdinand Peroutka napsal článek „Hitler je gentleman“; článek neexistoval. Dlouhodobě dehonestoval novináře (mj. „mediální žumpa“, omezování akreditací).',
          src: [S('iROZHLAS', 'Stát se musí omluvit za Zemanův výrok o Peroutkovi, verdikt pravomocný', 'https://www.irozhlas.cz/zpravy-domov/ferdinand-peroutka-milos-zeman-omluva-soud_2007021216_zit'), S('Deník', 'Nejvyšší soud potvrdil rozsudek v kauze Peroutka — stát se omluví', 'https://www.denik.cz/z_domova/ferdinand-peroutka-zeman-omluva-terezie-kaslova-20211014.html')] },
        prace: { text: 'Bez doloženého systémového absentérství ve vrcholných funkcích.' },
        zbabelost: { text: 'Spíše konfrontační než vyhýbavý; doložené házení podřízených přes palubu nad rámec běžné politiky není linií.' },
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
      id: 'zantovsky', name: 'Michael Žantovský', party: 'nestraník',
      role: 'exsenátor za obvod 21, ředitel Knihovny Václava Havla',
      scope: 'senát', obvod: 21, photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Michael_%C5%BDantovsk%C3%BD_%282022%29.jpg/500px-Michael_%C5%BDantovsk%C3%BD_%282022%29.jpg',
      category: 'Není zmrd',
      categoryReason: 'Diplomat, překladatel, exvelvyslanec v USA, Izraeli a Británii, dnes ředitel Knihovny Václava Havla. Senátorem byl v letech 1996–2002; v roce 2020 senátní souboj o obvod 21 prohrál s Láskou. Žádná doložená osobní kauza napříč osami — kritika prezidenta Zemana v kauze novičok byla věcná, ne toxická. Veřejně čistý profil.',
      dictum: 'Diplomat staré školy bez kauzy, kterou by šlo rozsvítit — profil, kde zmrdolog odchází s prázdnou.',
      lit: [],
      overrides: {
        lze: { text: 'Bez doloženého záznamu o opakovaných nepravdivých výrocích.' },
        penize: { text: 'Bez doloženého záznamu o dotacích či profitu ve střetu zájmů.' },
        prace: { text: 'Bez doloženého záznamu o neúčasti — funkce ředitele Knihovny VH i dřívější senátorský post bez výtek k docházce.' },
        konzistence: { text: 'Dlouhodobě konzistentní prozápadní a havlovská linie.' },
        toxicita: { text: 'Bez doloženého záznamu — kritika Zemana v kauze novičok byla věcná.' },
        zbabelost: { text: 'Bez doloženého záznamu o vyhýbání se odpovědnosti.' },
      },
    }),
    person({
      id: 'laska', name: 'Václav Láska', party: 'SEN 21',
      role: 'senátor za obvod 21',
      scope: 'senát', obvod: 21, photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/V%C3%A1clav_L%C3%A1ska.jpg/500px-V%C3%A1clav_L%C3%A1ska.jpg',
      category: 'Není zmrd',
      categoryReason: 'Advokát, který si kariéru postavil na rozkrývání cizích kauz (DPP, Promopro), ne na vlastních. Demagog mu z ověřených výroků neeviduje jedinou lež. Spory, do kterých se dostal — kárná pokuta advokátní komory za označení konkrétní firmy, ostrá výměna na zastupitelstvu Prahy 5 — jsou epizody konfliktního advokáta, ne vzorec zmrdství. Žádná osa nesvítí na úrovni, kterou by D-FENS obhájil před soudem o přípustné kritice.',
      dictum: 'Konfliktní advokát s ostrými lokty, kterému ale chybí to podstatné — doložený vzorec lži, profitu nebo zbabělosti. Hrany ano, zmrd ne.',
      lit: [],
      overrides: {
        lze: { text: 'Čistá osa. Demagog.cz z 13 ověřených výroků eviduje 12 pravdivých a 1 neověřitelný — žádný nepravdivý ani zavádějící.' },
        penize: { text: 'Bez doloženého záznamu o dotacích ve střetu zájmů či profitu přes rodinu.' },
        prace: { text: 'Bez doloženého záznamu o nadprůměrné neúčasti v Senátu.' },
        konzistence: { text: 'Bez doloženého otáčení kabátu — dlouhodobě konzistentní protikorupční a prozápadní linie.' },
        toxicita: { text: 'Hraniční, nesvítí. V dubnu 2023 podle vyjádření přítomných zastupitelů na zastupitelstvu Prahy 5 verbálně napadl a měl zastrašovat opoziční zastupitele po interpelaci ke kolegovi Vrkočovi; jde o jednu spornou epizodu doloženou jen výpověďmi protistrany, ne o doložený vzorec.' },
        zbabelost: { text: 'Bez doloženého záznamu o vyhýbání se odpovědnosti.' },
      },
    }),
    person({
      id: 'smoljak', name: 'David Smoljak', party: 'STAN',
      role: 'senátor za obvod 24',
      scope: 'senát', obvod: 24, photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/David_Smoljak.jpg/500px-David_Smoljak.jpg',
      category: 'Není zmrd',
      categoryReason: 'Scenárista a senátor (v Senátu aktuálně nezařazený, zvolen za STAN). Mediálně sledovaný spor s bratrem Filipem, který před druhým kolem voleb vytáhl smrt jejich matky a obvinění z manipulace s dědictvím, je doložen jako jednostranné obvinění protistrany bez vznesené obžaloby vůči Davidovi — podle pravidla „co nedoložíš, nesviť“ tedy osa nesvítí. Jinak žádný doložený vzorec zmrdství.',
      dictum: 'Senátor zatažený do rodinné války, kterou rozpoutal někdo jiný — obvinění bratra nelze přičíst jemu, takže zmrdolog nemá co rozsvítit.',
      lit: [],
      overrides: {
        lze: { text: 'Bez doloženého záznamu o opakovaných nepravdivých výrocích.' },
        penize: { text: 'Bez doloženého záznamu o dotacích či profitu ve střetu zájmů.' },
        prace: { text: 'Bez doloženého záznamu o nadprůměrné neúčasti v Senátu.' },
        konzistence: { text: 'Bez doloženého otáčení kabátu.' },
        toxicita: { text: 'Bez doloženého záznamu. Spor s bratrem Filipem o smrt matky a dědictví je jednostranné obvinění protistrany před volbami; vůči Davidovi nebyla vznesena obžaloba, fakt tedy nelze přičíst jemu.' },
        zbabelost: { text: 'Bez doloženého záznamu o vyhýbání se odpovědnosti.' },
      },
    }),
    person({
      id: 'stehlik', name: 'Eduard Stehlík', party: 'ODS/KDU-ČSL',
      role: 'senátor za obvod 24',
      scope: 'senát', obvod: 24, photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Senice_%E2%80%93_Silver_A_%E2%80%93_16_%28cropped%29.JPG/500px-Senice_%E2%80%93_Silver_A_%E2%80%93_16_%28cropped%29.JPG',
      category: 'Není zmrd',
      categoryReason: 'Vojenský historik, exředitel Památníku Lidice a odboru válečných veteránů. V kauze na ministerstvu obrany (2019) vystupoval jako oběť údajné šikany a bossingu, ne jako jejich původce — to osu toxicity nerozsvěcuje. Žádný doložený vlastní vzorec zmrdství napříč osami.',
      dictum: 'Historik, který v jediné mediální kauze figuroval jako poškozený, ne jako pachatel — zmrdolog tu nemá koho usvědčit.',
      lit: [],
      overrides: {
        lze: { text: 'Bez doloženého záznamu o opakovaných nepravdivých výrocích.' },
        penize: { text: 'Bez doloženého záznamu o dotacích či profitu ve střetu zájmů.' },
        prace: { text: 'Bez doloženého záznamu o neúčasti.' },
        konzistence: { text: 'Dlouhodobě konzistentní prozápadní a vojenskohistorická linie.' },
        toxicita: { text: 'Bez doloženého záznamu — v kauze ministerstva obrany byl podle vlastní výpovědi i médií poškozený, ne původce.' },
        zbabelost: { text: 'Bez doloženého záznamu o vyhýbání se odpovědnosti.' },
      },
    }),
    person({
      id: 'nemcova', name: 'Miroslava Němcová', party: 'ODS',
      role: 'senátorka za obvod 27',
      scope: 'senát', obvod: 27, photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Miroslava_N%C4%9Bmcov%C3%A1_ofici%C3%A1ln%C3%AD_2020.jpg/500px-Miroslava_N%C4%9Bmcov%C3%A1_ofici%C3%A1ln%C3%AD_2020.jpg',
      category: 'Anti-vohnout (není zmrd)',
      categoryReason: 'Anti-vohnout — dlouhodobě se nehnula z principiálního odporu vůči moci ani za cenu postů. Expředsedkyně Sněmovny, dlouholetá poslankyně, od 2020 senátorka za obvod 27 (v lednu 2025 oznámila, že už nebude kandidovat). Ostrá rétorika vůči Babišovi („prototyp bezcharakterního zbabělce“) je přípustná politická kritika v kontextu soudního rozhodnutí, ne dehonestace zranitelné osoby — osu toxicity tím nerozsvěcuje. Žádný doložený systém kauz napříč osami.',
      dictum: 'Ostrá v projevu, ale bez doloženého vzorce lži, profitu či otáčení kabátu — políček Babišovi není zmrdství, je to politika.',
      lit: [],
      overrides: {
        lze: { text: 'Bez doloženého záznamu o opakovaných nepravdivých výrocích.' },
        penize: { text: 'Bez doloženého záznamu o dotacích ve střetu zájmů; Hlídač státu eviduje pouze standardní příjmy z veřejné funkce.' },
        prace: { text: 'Bez doloženého záznamu o neúčasti — aktivní napříč komisemi i delegací do Rady Evropy.' },
        konzistence: { text: 'Dlouhodobě konzistentní pravicová a protibabišovská linie.' },
        toxicita: { text: 'Hraniční, nesvítí. Ostré výroky o Babišovi („prototyp bezcharakterního zbabělce, sketa“) z března 2026 padly jako reakce na soudní rozhodnutí v kauze Čapí hnízdo — jde o přípustnou politickou kritiku veřejné osoby, ne o dehonestaci.' },
        zbabelost: { text: 'Bez doloženého záznamu o vyhýbání se odpovědnosti.' },
      },
    }),
    person({
      id: 'hampl', name: 'Václav Hampl', party: 'KDU-ČSL',
      role: 'exsenátor za obvod 27',
      scope: 'senát', obvod: 27, photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Prof._RNDr._V%C3%A1clav_Hampl%2C_DrSc.%282021%29.jpg/500px-Prof._RNDr._V%C3%A1clav_Hampl%2C_DrSc.%282021%29.jpg',
      category: 'Jedna skvrna',
      categoryReason: 'Exrektor UK a senátor za obvod 27 v letech 2014–2020, kdy mandát obhajoval proti Němcové a prohrál. Není to systémový hráč — chybí mu peníze ve střetu, otáčení kabátu i absence. Drží ho nad nulou jediná doložená osa: kampaňová toxicita vůči protikandidátce, kterou nelituje. Proto Jedna skvrna, ne Hraniční případ.',
      dictum: 'Profesor, který v jediné kampani sklouzl k elitářskému shazování soupeřky bez vysoké školy — jedna skvrna na jinak čistém záznamu.',
      highlight: 'Volby do Senátu 2020, obvod Praha 1. Hampl, exrektor Univerzity Karlovy, vyvěsil billboard „Vysoká škola života nestačí“ namířený proti protikandidátce Miroslavě Němcové, která vysokou školu nemá. Jiří Pospíšil označil kampaň za „elitářskou a trapnou“, hnutí Praha sobě se od jejího designu distancovalo. Na nahrávce Hampl o Němcové mluvil jako o „auře svaté ženy vytvořené čistě odchodem z Vladislavského sálu“ a po prohře svých ostrých výroků nelitoval — vadilo mu jen, že byl nahráván.',
      lit: ['toxicita'],
      dfens: [
        { n: 8, why: 'Exrektor profilující se vzděláním jako odznakem nadřazenosti — billboard shazující soupeřku bez VŠ.' },
        { n: 9, why: 'Útok na osobu protikandidátky místo věcného střetu — a po prohře setrvání na něm bez lítosti.' },
      ],
      overrides: {
        lze: { text: 'Nesvítí. Demagog.cz z 17 ověřených výroků eviduje 13 pravdivých a 4 nepravdivé — nepravdivé výroky existují, ale nedosahují systematické úrovně lži jako nástroje.',
          src: [S('demagog.cz', 'Výroky Václava Hampla — hodnocení', 'https://demagog.cz/politici/vaclav-hampl-334')] },
        penize: { text: 'Čistá osa — bez doloženého střetu zájmů; Hlídač státu eviduje jen běžné dary a napojení bez státních zakázek od 2016.' },
        prace: { text: 'Bez doloženého záznamu o nadprůměrné neúčasti — předseda senátního výboru pro EU.' },
        konzistence: { text: 'Dlouhodobě konzistentní proevropská a akademická linie — bez otáčení kabátu.' },
        toxicita: { text: 'V senátní kampani 2020 v obvodu Praha 1 použil billboard „Vysoká škola života nestačí“ namířený proti protikandidátce Němcové, která nemá vysokoškolské vzdělání; kampaň byla kritizována jako elitářská (Jiří Pospíšil) a hnutí Praha sobě se od jejího designu distancovalo. Na nahrávce Němcovou shazoval slovy o „auře svaté ženy“ a po prohře výroků nelitoval.',
          src: [S('Echo24', '„Vysoká škola života nestačí“ — trapný útok na Němcovou, kritizují ho', 'https://echo24.cz/a/SAWtC/vysoka-skola-zivota-nestaci-ma-na-billboardu-senator-hampl-trapny-utok-na-nemcovou-kritizuji-ho'), S('Deník N', 'Poražený Hampl ostrých výroků o Němcové nelituje', 'https://denikn.cz/465397/porazeny-hampl-ostrych-vyroku-o-nemcove-nelituje-nevedel-jsem-ale-ze-me-nahravate-tvrdi/')] },
        zbabelost: { text: 'Bez doloženého záznamu o vyhýbání se odpovědnosti — k výrokům se otevřeně hlásí.' },
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
    DIMENSIONS, DFENS, dfensById, OBVODY, obvodById, HEADLINERS, SENAT, ALL, byId,
    candidatesForObvod, obvodHeat, krajHeat, categoryFor, tier, EGGS,
  };
})();
