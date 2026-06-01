# Režim A — záznam do databáze `data.js`

**Načti tenhle soubor, jen když je úkolem zápis do databáze webu** (jetozmrd.cz)
— „připrav podklad / záznam do databáze", práce v repu webu, nebo „převeď posudek
do JSON". Metr, osy, pravidlo svícení i D-FENS taxonomie jsou v `SKILL.md`; tady
je jen **výstupní kontrakt a tvar**.

**Výstup = právě jeden validní JSON objekt a nic jiného.** Žádný úvod, markdown,
code fences ani komentáře mimo JSON. Veškerá analýza (skóre, typologie, D-FENS,
verdikt) žije **uvnitř** JSON v polích, která web vykreslí. Záznam musí jít vložit
beze změny struktury do `src/legacy/data.js` (`ZMRD.HEADLINERS`) — `person()` z něj
dopočítá `score`, `tier` a `dims`. `category`, `categoryReason`, `dictum`,
`highlight` i `dfens` se renderují přímo v profilu (`src/legacy/views/detail.jsx`).

## Schéma (authoring shape, který čte `person()`)

```json
{
  "id": "slug-bez-diakritiky",
  "name": "Celé jméno",
  "party": "Strana / hnutí",
  "role": "funkce, např. 'ministryně financí a místopředsedkyně vlády'",
  "scope": "celostátní",
  "photo": null,
  "photoPos": null,
  "gallery": [],
  "obvod": null,

  "category": "Systémový zmrd",
  "categoryReason": "Proč právě tahle kategorie — odlišení od sousedních typů, v hlase. Renderuje se pod hlavičkou profilu.",
  "dictum": "Jednovětý verdikt v dikci D-FENS — suchý, ironický, výhradně věcný.",
  "highlight": "Nejsilnější doložený zmrdovský výkon — jedna konkrétní kauza vyprávěná jako příběh. Renderuje se jako zvýrazněný blok.",

  "lit": ["lze", "penize", "konzistence", "toxicita", "zbabelost"],

  "dfens": [
    { "n": 3,  "why": "Konkrétní politická manifestace znaku u tohoto člověka." },
    { "n": 6,  "why": "…" },
    { "n": 8,  "why": "…" },
    { "n": 10, "why": "…" }
  ],

  "overrides": {
    "lze":         { "text": "Doložený nález k této ose.", "src": [ { "p": "demagog.cz", "t": "Popisek zdroje", "u": "https://demagog.cz/" } ] },
    "penize":      { "text": "…", "src": [ { "p": "hlidacstatu.cz", "t": "…", "u": "https://www.hlidacstatu.cz/" } ] },
    "prace":       { "text": "Čistá osa — bez doloženého záznamu." },
    "konzistence": { "text": "…", "src": [ { "p": "kohovolit.eu", "t": "…", "u": "https://www.kohovolit.eu/" } ] },
    "toxicita":    { "text": "…", "src": [ { "p": "mediální archiv", "t": "…", "u": "https://www.irozhlas.cz/" } ] },
    "zbabelost":   { "text": "…", "src": [ { "p": "justice.cz", "t": "…", "u": "https://justice.cz/" } ] }
  }
}
```

## Pravidla schématu (vazba na `data.js` + render)

- **`id`** — slug bez diakritiky, malými písmeny (`moravec-emanuel`, `quisling-vidkun`). Krátká forma příjmení stačí, musí být unikátní v databázi. Je to zároveň routa profilu (`#/detail/[id]`).
- **`scope`** — `"celostátní"` nebo `"senát"`. U senátu vyplň i **`obvod`** (číslo) a `role` typu `"kandidát do Senátu"`.
- **`photo`** — **aktivně dohledej oficiální portrét** a vlož přímou URL na obrázek (ne na stránku). Priorita zdrojů:
  - **Poslanec PSP** → psp.cz. Otevři detail osoby (`WebFetch https://www.psp.cz/sqw/detail.sqw?id=<id_osoby>`) a vezmi `<img class="sharp" src="/eknih/cdrom/2025ps/eknih/2025ps/poslanci/i<ID>.jpg">`; výsledná URL je `https://www.psp.cz/eknih/cdrom/2025ps/eknih/2025ps/poslanci/i<ID>.jpg`.
  - **Senátor** → senat.cz. Na detailu senátora najdi `/images/senatori/<slug>_295.jpg`; URL je `https://www.senat.cz/images/senatori/<slug>_295.jpg`.
  - **Ostatní (ministr-neposlanec, historická osoba)** → Wikimedia Commons / cs.wikipedia lead image: `WebFetch https://cs.wikipedia.org/w/api.php?action=query&redirects=1&titles=<Jméno>&prop=pageimages&piprop=thumbnail&pithumbsize=500&format=json` → `thumbnail.source`. Jen **solo portrét správné osoby** (ověř popisek/kategorii); skupinové foto NE.
  - **Pravidla:** vždy ověř, že portrét patří TÉ osobě (časté jméno = riziko záměny); použij jen oficiální nebo volně licencovaný zdroj (psp.cz, senat.cz, Wikimedia Commons), **nikdy chráněnou tiskovou fotku**; **raději `null` než špatná nebo rozbitá URL**. Nevymýšlej cesty.
- **`photoPos` / `gallery`** — ponech `null` / `[]`, pokud nemáš důvod jinak.
- **`lit`** — pole klíčů os, které **🔴 svítí**. POUZE z: `lze`, `penize`, `prace`, `konzistence`, `toxicita`, `zbabelost`. `score = lit.length` (0–6) se dopočítá — do JSON ho **nepiš**.
- **`category`** — z povolené množiny (viz `SKILL.md` → Kategorie). Pro headlinery vyplňuj vždy. Bez ní se dopočítá ze `score` přes `categoryFor()`.
- **`categoryReason`** *(renderuje se — „Proč tahle kategorie", pod hlavičkou)* — 2–4 věty, proč právě tahle kategorie a ne sousední. U headlinerů povinné.
- **`dictum`** *(renderuje se — verdikt s patičkou „dle D-FENS zmrdologie")* — jedna věta, hlas D-FENS. Povinné.
- **`highlight`** *(renderuje se — „Nejsilnější zmrdovský výkon", zvýrazněný blok)* — nejsilnější kauza jako mikropříběh s konkrétními aktéry, čísly, datem. U headlinerů s 🔴 osami povinné. U nezmrdů vynech.
- **`dfens`** *(renderuje se — „D-FENS znaky · N z 10")* — pole `{ "n": <1–10>, "why": "…" }`. `n` je číslo znaku z taxonomie, `why` jeho konkrétní manifestace (web k číslu doplní oficiální `label`). Jen skutečně naplněné znaky. U headlinerů 2–5 znaků; u čistých nezmrdů prázdné/vynech.
- **`overrides[klíč]`** — pro každou **🔴 osu z `lit`** povinné `text` (nález) **i `src`** (≥ 1 zdroj). Pro **čistou osu** buď stručný `text` bez `src`, nebo osu vynech (použije se defaultní fráze). Čisté osy web zobrazí jen jako „ne".
- **`src` položka** = `{ "p": …, "t": …, "u": … }`: `p` = krátký název zdroje, `t` = popisek konkrétního zdroje, `u` = funkční URL. **Žádná 🔴 osa bez `src`.** Ideálně 2 nezávislé zdroje na osu.
- **Šedá zóna** — manažerské/systémové selhání bez prokázaného osobního zmrdství: `"gray": true` (pak `score = null`), `category` např. `"Manažerské selhání"`. Kritizovanou, ale neprokázanou osu **nedávej do `lit`**.
- Kódování UTF-8, diakritika přímo (ne `\u`). Uvozovky v textech jako „české".

**Před odevzdáním zkontroluj:** klíče os, `src` u všech 🔴 os, `dfens` tvar `{n,why}`,
`category` z povolené množiny, validní JSON, žádný text mimo. **Žádné hodnotové soudy
v `overrides[].text`** (žádné „skandální", „podezřelý") ani interní názvy spouštěčů
(„spouštěč c", „osa svítí") — hlas patří do `dictum`/`categoryReason`/`highlight`.

---

## Ověřené příklady

### 5/6 Systémový zmrd — Emanuel Moravec (arcikolaborant)

Architekt kolaborace, ne pěšák. Ukazuje i výjimku u osy `prace`: makal neúnavně —
jen na zradě, proto se osa flagne, ale nesvítí.

```json
{
  "id": "moravec-emanuel",
  "name": "Emanuel Moravec",
  "party": "kolaborantská správa Protektorátu Čechy a Morava",
  "role": "protektorátní ministr školství a lidové osvěty (1942–1945), předseda Kuratoria pro výchovu mládeže",
  "scope": "celostátní", "photo": null, "photoPos": null, "gallery": [], "obvod": null,
  "category": "Systémový zmrd",
  "categoryReason": "Architekt, ne pěšák kolaborace: nebyl jen poslušný úředník, ale budoval celý aparát — ministerstvo osvěty, Kuratorium pro výchovu mládeže, propagandistickou mašinu, která měla převychovat národ k loajalitě k Říši. Proto Systémový, ne pouhý vohnout.",
  "dictum": "Z legionáře a hlasatele obrany republiky se stal nejhorlivější český kolaborant — důkaz, že nejpřesvědčivější zrádce bývá bývalý vlastenec.",
  "highlight": "Do Mnichova 1938 patřil Moravec k nejhlasitějším zastáncům ozbrojené obrany republiky proti Hitlerovi. Po okupaci se obrátil o sto osmdesát stupňů a stal se tváří kolaborace — jako protektorátní ministr školství řídil propagandu vůči vlastnímu národu a v Kuratoriu formoval děti k loajalitě k Říši. Když 5. května 1945 vypuklo Pražské povstání, spáchal sebevraždu.",
  "lit": ["lze", "penize", "konzistence", "toxicita", "zbabelost"],
  "dfens": [
    { "n": 4, "why": "Učebnicová nekonzistence — z protinacistického jestřába arcikolaborant podle toho, kdo byl u moci (taxonomie D-FENS, dfens-cz.com, 2001)." },
    { "n": 3, "why": "Líže kliky okupantovi: jiná tvář k Říši než dřív k republice." },
    { "n": 8, "why": "Mění image podle vítěze dějin." },
    { "n": 9, "why": "Propaganda staví na nepříteli (odboj, Západ, Židé), ne na řešení." },
    { "n": 10, "why": "Buduje kolaborantský konglomerát — ministerstvo, Kuratorium, tisk." }
  ],
  "overrides": {
    "lze": { "text": "Jako ministr lidové osvěty řídil systematickou nacistickou propagandu vůči českému obyvatelstvu — relativizaci okupace a démonizaci odboje a spojenců. Vědomé šíření nepravd jako profese.", "src": [ { "p": "Radio Prague Int.", "t": "Emanuel Moravec — tvář české kolaborace", "u": "https://english.radio.cz/emanuel-moravec-face-czech-collaboration-nazis-8562122" } ] },
    "penize": { "text": "Existenci, postavení i moc odvozoval od okupační správy — ministerský post i aparát Kuratoria mu zajišťovala loajalita k Říši, ne výkon pro vlastní zemi.", "src": [ { "p": "Wikipedie", "t": "Emanuel Moravec — protektorátní ministr", "u": "https://cs.wikipedia.org/wiki/Emanuel_Moravec" } ] },
    "prace": { "text": "Čistá osa (flag, ne svícení): Moravec nebyl absentér ani vyžírka — pracoval neúnavně, jenže na kolaboraci a propagandě. Osa měří vyhýbání se práci, ne její obsah; práci si upřít nelze, zlo z ní dělají ostatní osy." },
    "konzistence": { "text": "Důstojník rakousko-uherské armády, pak přeběh k legionářům; ve 30. letech hlasitý demokrat a zastánce ozbrojené obrany proti Hitlerovi; po březnu 1939 nejhorlivější nacistický kolaborant. Obrat přes celé spektrum podle toho, kdo byl u moci.", "src": [ { "p": "Wikipedie", "t": "Moravec — od legionáře k arcikolaborantovi", "u": "https://cs.wikipedia.org/wiki/Emanuel_Moravec" } ] },
    "toxicita": { "text": "Veřejně dehonestoval odboj, spojence i vlastní národ; propaganda cílená na konkrétní skupiny (odbojáři, Židé) jako nepřátele.", "src": [ { "p": "Radio Prague Int.", "t": "Moravec — propaganda vůči vlastnímu národu", "u": "https://english.radio.cz/emanuel-moravec-face-czech-collaboration-nazis-8562122" } ] },
    "zbabelost": { "text": "Když se fronta zhroutila a 5. května 1945 vypuklo Pražské povstání, vyhnul se odpovědnosti sebevraždou — nechal za sebou aparát i lidi, které do kolaborace zatáhl.", "src": [ { "p": "Wikipedie", "t": "Moravec — sebevražda 5. 5. 1945", "u": "https://cs.wikipedia.org/wiki/Emanuel_Moravec" } ] }
  }
}
```

### 4/6 Oportunistický zmrd — Vidkun Quisling (eponym zrádce)

Univerzální archetyp: jeho jméno se ještě za války stalo synonymem pro zrádce
(„quisling"). Vydal vlastní zemi okupantovi výměnou za moc.

```json
{
  "id": "quisling-vidkun",
  "name": "Vidkun Quisling",
  "party": "Nasjonal Samling (norská fašistická strana)",
  "role": "vůdce kolaborantské vlády okupovaného Norska (ministerský předseda 1942–1945)",
  "scope": "celostátní", "photo": null, "photoPos": null, "gallery": [], "obvod": null,
  "category": "Oportunistický zmrd",
  "categoryReason": "Není architekt teroru jako Heydrich — je oportunista, který využil invaze k uchopení moci. V den německého útoku (9. 4. 1940) se sám prohlásil premiérem a zemi nabídl okupantovi. Dominuje zrada vlastní země pro osobní moc, ne vlastní ideologický systém — proto Oportunistický.",
  "dictum": "Jeho jméno se stalo synonymem pro zrádce ještě dřív, než válka skončila — vydal vlastní zemi výměnou za křeslo, které mu dali nepřátelé.",
  "highlight": "Když 9. dubna 1940 napadlo Německo Norsko, Quisling se zmocnil rozhlasového studia a sám se prohlásil ministerským předsedou — puč ve službě okupantovi. Od roku 1942 vedl loutkovou vládu pod Reichskommissarem Terbovenem. Po válce byl odsouzen za velezradu, zpronevěru i podíl na vraždách a 24. října 1945 popraven. Slovo „quisling" zůstalo v řadě jazyků synonymem pro zrádce.",
  "lit": ["lze", "penize", "konzistence", "zbabelost"],
  "dfens": [
    { "n": 4, "why": "Z důstojníka a humanitárního pracovníka kolaborant podle toho, kde byla moc (taxonomie D-FENS, dfens-cz.com, 2001)." },
    { "n": 3, "why": "Líže kliky okupantovi výměnou za vlastní křeslo." },
    { "n": 6, "why": "K moci se dostal pučem a z neústavní zkratky, ne z vůle lidu." },
    { "n": 10, "why": "Buduje kolaborantský aparát Nasjonal Samling napojený na okupanta." }
  ],
  "overrides": {
    "lze": { "text": "Jako čelo loutkové vlády šířil okupační propagandu a legitimizoval německou okupaci vůči Norům — vědomé zkreslování ve prospěch cizí mocnosti.", "src": [ { "p": "Britannica", "t": "Vidkun Quisling — Nazi collaborator", "u": "https://www.britannica.com/biography/Vidkun-Abraham-Lauritz-Jonsson-Quisling" } ] },
    "penize": { "text": "Moc i postavení odvozoval od okupanta; soud ho po válce uznal vinným mj. ze zpronevěry — z okupační moci profitoval osobně.", "src": [ { "p": "Holocaust Encyclopedia (USHMM)", "t": "Quisling — soud za válečné zločiny a velezradu", "u": "https://encyclopedia.ushmm.org/content/en/article/vidkun-quisling-1" } ] },
    "prace": { "text": "Touto osou nehodnotitelné — voják a politik, který se práci nevyhýbal; zlo je v obsahu jeho jednání, ne v absenci." },
    "konzistence": { "text": "Bývalý důstojník a humanitární pracovník (pomoc při hladomoru v Rusku) skončil jako vůdce fašistické strany a v den invaze se prohlásil premiérem ve službě okupantovi — obrat o 180 stupňů proti vlastní zemi.", "src": [ { "p": "Wikipedie", "t": "Vidkun Quisling — od humanitárního pracovníka ke kolaborantovi", "u": "https://en.wikipedia.org/wiki/Vidkun_Quisling" } ] },
    "toxicita": { "text": "Bez doloženého vzorce adresných osobních urážek nad rámec samotné kolaborace — osa nesvítí (zlo je zde ve zradě, ne v rétorice)." },
    "zbabelost": { "text": "Zemi vydal nepříteli místo obrany a odpovědnost za okupační teror přesouval na poměry; postavil vlastní moc nad osud národa.", "src": [ { "p": "Holocaust Encyclopedia (USHMM)", "t": "Norové popravili kolaboranta Quislinga", "u": "https://encyclopedia.ushmm.org/content/en/film/war-crimes-trial-of-vidkun-quisling" } ] }
  }
}
```

### 0/6 Anti-vohnout — Milada Horáková (postavila se moci)

Demonstruje, že 0/6 není selhání rešerše, ale plnohodnotný výsledek — a že existuje
i pozitivní opak zmrda. `lit` i `dfens` jsou prázdné, `highlight` se vynechává jen
u nezmrdů bez příběhu; tady ho má, protože je hodný připomenutí.

```json
{
  "id": "horakova-milada",
  "name": "Milada Horáková",
  "party": "Československá strana národně socialistická",
  "role": "právnička, poslankyně, odbojářka — popravena v komunistickém monstrprocesu (1950)",
  "scope": "celostátní", "photo": null, "photoPos": null, "gallery": [], "obvod": null,
  "category": "Anti-vohnout (není zmrd)",
  "categoryReason": "Pravý opak zmrda i vohnouta: postavila se dvěma totalitám po sobě — nacistické i komunistické — a ani pod hrozbou smrti se neohnula. Žádná osa nesvítí; je tu jako kotva nuly a důkaz, že 0/6 je existující kategorie cti, ne mezera v rešerši.",
  "dictum": "Měřítko spodního konce stupnice: kdo raději zemře, než aby odvolal, není zmrd ani vohnout — je jeho protiklad.",
  "highlight": "Horáková se za druhé světové války zapojila do odboje proti nacismu, byla zatčena gestapem a vězněna (Terezín i německé věznice). Po únoru 1948 odmítla emigrovat a postavila se i komunistickému režimu. V roce 1950 byla v zinscenovaném monstrprocesu odsouzena za „velezradu", odmítla žádat o milost a 27. června 1950 byla popravena navzdory mezinárodním protestům (Einstein, Churchill).",
  "lit": [],
  "dfens": [],
  "overrides": {
    "lze": { "text": "Žádný doložený vzorec nepravd — naopak za pravdu a svobodu zaplatila životem." },
    "penize": { "text": "Z veřejné funkce neprofitovala; odmítla i pohodlnou emigraci a zůstala." },
    "prace": { "text": "Právnička a poslankyně s reálnou prací i odbojovou činností — osa vyhýbání se práci je tu absurdní." },
    "konzistence": { "text": "Konzistentní obrana demokracie proti nacismu i komunismu — opak otáčení kabátu; postoj nezměnila ani pod hrozbou popravy." },
    "toxicita": { "text": "Žádná dehonestace osob; bránila principy, ne aby ničila lidi." },
    "zbabelost": { "text": "Absolutní opak — vzdala se možnosti požádat o milost a u soudu trvala na svém přesvědčení až na popraviště." }
  }
}
```

---

## Fallback stavy (JSON)

- **Málo dat / krátká kariéra** — vrať záznam s prázdným `lit`, `category` typu `"Hraniční případ"` nebo `"Není zmrd"`, vynech `highlight`/`dfens` a stav popiš v `dictum` („omezená data — krátká kariéra"). Nevymýšlej osy.
- **Regionální/senátní kandidát** — opři se o mediální archiv + Hlídač státu; co nedoložíš, nesviť.
- **Manažerské/odborné selhání bez osobního zmrdství** — `"gray": true`, `category` `"Manažerské selhání"`, kritizovanou osu nech čistou s kontextem v `overrides`.
