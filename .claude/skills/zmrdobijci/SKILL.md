---
name: zmrdobijci
allowed-tools: WebSearch, WebFetch
description: >
  Faktografická zmrdologická analýza českých politiků jako podklad pro databázi
  webu jetozmrd.cz. Použij kdykoliv přijde dotaz typu: "prověř [politik]",
  "fakta o [politik]", "je [politik] zmrd", "kauzy [politik]", "hlasování [politik]",
  "podklad pro databázi [politik]". Skill agresivně vyhledá veřejně doložitelná
  fakta (Demagog, Hlídač státu, psp.cz, kohovolit.eu, justice.cz, mediální archiv),
  ohodnotí 6 os zmrdství, aplikuje D-FENS taxonomii a vrátí PŘESNĚ JEDEN validní
  JSON ve schématu databáze webu (src/legacy/data.js → person záznam) — včetně
  polí category, categoryReason, dictum, highlight a dfens, která se renderují
  přímo v profilu na webu. Pouze doložená fakta s citacemi; rozlišuje obviněn ≠
  obžalován ≠ pravomocně odsouzen, ale stav řízení mění FORMULACI, ne to, zda osa svítí.
---

# Zmrdologická faktografie — podklad pro databázi jetozmrd.cz

Tvým výstupem je **jeden záznam politika přímo ve schématu databáze webu**
(`src/legacy/data.js`, pole `ZMRD.HEADLINERS`). Záznam musí jít vložit beze změny
struktury — `person()` z něj dopočítá `score`, `tier` a `dims`.

**Klíčové: všechna analytická pole se renderují na webu.** `category`,
`categoryReason`, `dictum`, `highlight` i `dfens` se zobrazují přímo v profilu
(viz `src/legacy/views/detail.jsx`). Nejsou to poznámky do šuplíku — jsou to
viditelné sekce profilu. Proto je u headlinerů vyplňuj vždy a piš je v hlase
(viz „Hlas" níže), ne jako suchý poznámkový aparát.

## Výstupní kontrakt (NEJDŮLEŽITĚJŠÍ)

**Výstup = právě jeden validní JSON objekt a nic jiného.** Žádný úvod, žádný
markdown, žádné code fences, žádné komentáře mimo JSON. Veškerá analýza (skóre,
typologie, D-FENS, verdikt, nejsilnější výkon) žije **uvnitř** JSON v polích, která
web vykreslí — ne v textu okolo.

### Schéma (authoring shape, který čte `person()`)

```json
{
  "id": "slug-bez-diakritiky",
  "name": "Celé jméno",
  "party": "Strana / hnutí",
  "role": "funkce, např. 'expministryně financí, místopředsedkyně klubu'",
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

### Pravidla schématu (vazba na `data.js` + render)

- **`id`** — slug bez diakritiky, malými písmeny (`schillerova`, `havlicek`). Krátká forma příjmení stačí, musí být unikátní v databázi. Je to zároveň routa profilu na webu (`#/detail/[id]`).
- **`scope`** — `"celostátní"` nebo `"senát"`. U senátu vyplň i **`obvod`** (číslo) a `role` typu `"kandidát do Senátu"`.
- **`photo` / `photoPos` / `gallery`** — když nemáš doložené veřejné foto, ponech `null` / `[]`. Nevymýšlej cesty.
- **`lit`** — pole klíčů os, které **🔴 svítí**. POUZE z: `lze`, `penize`, `prace`, `konzistence`, `toxicita`, `zbabelost`. `score = lit.length` (0–6) se dopočítá — do JSON ho **nepiš**.
- **`category`** — z povolené množiny (viz Kategorie). Pro headlinery vyplňuj vždy. Bez ní se dopočítá ze `score` přes `categoryFor()`.
- **`categoryReason`** *(renderuje se — „Proč tahle kategorie", přímo pod hlavičkou)* — 2–4 věty, proč právě tahle kategorie a ne sousední (např. „Systémový, ne Populistický, protože…"). U headlinerů povinné.
- **`dictum`** *(renderuje se — verdikt s patičkou „dle D-FENS zmrdologie")* — jedna věta, hlas D-FENS. Povinné.
- **`highlight`** *(renderuje se — „Nejsilnější zmrdovský výkon", zvýrazněný blok)* — nejsilnější jednotlivá kauza vyprávěná jako mikropříběh s konkrétními aktéry, čísly, datem. U headlinerů s 🔴 osami povinné. U nezmrdů vynech.
- **`dfens`** *(renderuje se — „D-FENS znaky · N z 10")* — pole `{ "n": <1–10>, "why": "…" }`. `n` je číslo znaku z taxonomie (viz tabulka), `why` jeho konkrétní manifestace u tohoto člověka (web k číslu sám doplní oficiální `label`). Uváděj jen skutečně naplněné znaky. U headlinerů 2–5 znaků; u čistých nezmrdů prázdné/vynech.
- **`overrides[klíč]`** — pro každou **🔴 osu z `lit`** je povinné `text` (nález) **i `src`** (≥ 1 zdroj). Pro **čistou osu** dej buď stručný `text` bez `src`, nebo osu vynech (použije se defaultní fráze). Čisté osy web zobrazí jen jako „ne".
- **`src` položka** = `{ "p": …, "t": …, "u": … }`: `p` = krátký název zdroje, `t` = popisek konkrétního zdroje, `u` = funkční URL. **Žádná 🔴 osa bez `src`.** Ideálně 2 nezávislé zdroje na osu.
- **Šedá zóna** — manažerské/systémové selhání bez prokázaného osobního zmrdství: `"gray": true` (pak `score = null`), `category` např. `"Manažerské selhání"`. Kritizovanou, ale neprokázanou osu **nedávej do `lit`**.
- Kódování UTF-8, diakritika přímo (ne `\u`). Uvozovky v textech jako „české".

---

## Metodika rešerše — AGRESIVNĚ a PARALELNĚ

Mělká rešerše = podhodnocený profil. To je nejčastější chyba. U etablovaného
politika existují kauzy — tvým úkolem je je najít a doložit, ne je „pro jistotu"
přejít. Pracuj jako investigativec, ne jako advokát obhajoby.

**Krok 1 — vějíř dotazů naráz.** Pro každý subjekt pusť MINIMÁLNĚ těchto 8 hledání
(víc, když něco najdeš):

1. `[jméno] kauzy` / `[jméno] skandál`
2. `[jméno] demagog.cz` (podíl nepravdivých výroků)
3. `[jméno] hlídač státu dotace střet zájmů`
4. `[jméno] hlasování sněmovna docházka` (psp.cz / kohovolit.eu)
5. `[jméno] rozsudek soud trestní stíhání` (justice.cz + média)
6. `[jméno] kohovolit` (přesuny stran, obraty postojů)
7. `[jméno] výrok pobouření` (toxicita — konkrétní citace)
8. `[jméno] rodina firma majetek` (peníze přes příbuzné)

**Krok 2 — drž se nitky.** Když hledání odhalí kauzu, dohledej ji do konkrétních
faktů: aktéři, částky, datum, stav řízení, citace. `WebFetch` na zdroj, který
půjde do `src`. Jeden titulek nestačí — chci větu, kterou obhájíš.

**Krok 3 — kontrola pokrytí.** Než uzavřeš, projdi všech 6 os zvlášť a u každé si
odpověz: „Hledal jsem k téhle ose, nebo jsem ji jen tipnul?" Netknutá osa není
čistá — je nezrešeršovaná.

---

## 6 os zmrdství (klíče = `data.js` DIMENSIONS)

Pro databázi je hodnocení **binární** (osa svítí 🔴, nebo ne). Při analýze ber
3 stupně, ale mapuj jednoznačně:

| Klíč | Otázka | 🔴 do `lit` když… |
|------|--------|-------------------|
| **lze** | Lže prokazatelně? | Demagog/archiv doloží opakované nepravdivé či zavádějící výroky |
| **penize** | Žije z cizích peněz / dotací? | Doložené čerpání veřejných prostředků, dotace ve střetu zájmů, zakázky, profit přes rodinu/firmy |
| **prace** | Chodí do práce? | psp.cz / EP / kohovolit.eu vykazují nadprůměrnou neúčast |
| **konzistence** | Je konzistentní? | Doložené otáčení kabátu, změny stran, obraty v klíčových postojích dle výhody |
| **toxicita** | Chová se toxicky? | Doložené urážky, dehonestace, šikana, výhrůžky vůči konkrétním osobám |
| **zbabelost** | Je zbabělý? | Doložené vyhýbání se odpovědnosti, házení podřízených/rodiny přes palubu |

### Pravidlo svícení (NEJDŮLEŽITĚJŠÍ — fixuje podhodnocení)

**Doloženo + referováno = osa svítí.** Ke svícení osy stačí fakt **doložený
a referovaný v důvěryhodném médiu** (Demagog, iROZHLAS, Deník N, Seznam Zprávy,
Reportér, Transparency International, ČT, Echo24, Neovlivní…). **Pravomocný
rozsudek NENÍ podmínka.** Stav řízení („obviněn", „stíhán", „nepravomocně
odsouzen", „audit konstatoval", „policie odložila") mění jen **formulaci v `text`**,
nikdy ne to, zda osa svítí. Nazvi stav přesně — a osu rozsviť.

Do `lit` patří vše, co bys obhájil před soudem o **přípustné kritice** (tj. fakt
opřený o veřejný zdroj). Jen čistě spekulativní nebo nedoložené tvrzení nesvítí —
to ale není totéž jako „není rozsudek".

---

## Kalibrace — kotvy z živé databáze

Než přidělíš skóre, porovnej subjekt s těmito **referenčními headlinery**
(jsou už v `data.js`). Tvůj odhad musí sednout do téhle stupnice:

| Politik | Skóre | Kategorie | Svítící osy |
|---------|------:|-----------|-------------|
| Andrej Babiš | 5/6 | Systémový zmrd | lze, penize, konzistence, toxicita, zbabelost |
| Alena Schillerová | 5/6 | Systémový zmrd | lze, penize, konzistence, toxicita, zbabelost |
| Filip Turek | 5/6 | Exhibicionistický zmrd | lze, prace, konzistence, toxicita, zbabelost |
| Tomio Okamura | 4/6 | Populistický zmrd | lze, konzistence, toxicita, zbabelost |
| Jana Maláčová | 4/6 | Oportunistický zmrd | lze, prace, konzistence, toxicita |
| Kateřina Konečná | 3/6 | Hraniční | lze, konzistence, toxicita |
| Karel Havlíček | 2/6 | Hraniční případ | penize, konzistence |
| Petr Pavel | 1/6 | Jedna skvrna | konzistence |
| Vít Rakušan | — (gray) | Manažerské selhání | — |
| Petr Fiala | 0/6 | Slabý lídr (není zmrd) | — |
| Ivan Bartoš | 0/6 | Není zmrd | — |
| Zdeněk Hřib | 0/6 | Není zmrd (má hrany) | — |

**Čtení stupnice:**
- **5–6** = etablovaný hráč s ekosystémem kauz napříč osami (Babiš, Schillerová, Turek).
- **4** = výrazný zmrd s jedním „čistým" rohem (Okamura chodí do práce; Maláčová není finančně ve střetu).
- **2–3** = doložené dílčí prohřešky bez systému (Havlíček, Konečná).
- **0–1** = čistí nebo jediná skvrna (Fiala, Bartoš, Hřib; Pavel).

### Pravidlo proti podhodnocení

U **etablovaného politika** (≥ 2 období / ministerský post) s mediálně doloženými
kauzami je výsledek **0–1 signál nedostatečné rešerše, ne čistoty.** Než takový
nízký výsledek uzavřeš, vrať se a dohledej. Pokud subjekt patří do ligy
Babiš/Schillerová/Turek a vyšlo ti 1–2, **hledal jsi málo.** Naopak skóre nenafukuj
uměle — Havlíček je poctivě 2/6, protože systém zmrdství nemá; přesnost > dramatičnost.

---

## Kategorie (typologie) — pole `category`

Score je kvantita, kategorie kvalita („jaký typ"). Zařaď do **jedné**:

| Kategorie | Kdy |
|-----------|-----|
| **Systémový zmrd** | Sofistikovaný, dlouhodobý, buduje ekosystém spolupracovníků, střídá role, tiše těží |
| **Exhibicionistický zmrd** | Provokuje vědomě a otevřeně; problém, když musí provokaci popírat |
| **Populistický zmrd** | Vědomé lži jako nástroj; potřebuje nepřítele a krátkou paměť voličů |
| **Oportunistický zmrd** | Mění přesvědčení podle situace / průzkumů |
| **Hraniční případ** | 2–3 osy svítí, nebo sporné/dílčí důkazy (v `data.js` též `"Hraniční"`) |
| **Není zmrd** | 0–1 osa; slabé vedení či odborné selhání ≠ zmrdství |

Defaultní mapování ze score (když `category` nevyplníš): 0 `Není zmrd` · 1 `Jedna
skvrna` · 2 `Hraniční případ` · 3 `Potvrzený zmrd` · 4 `Plnokrevný zmrd` ·
5 `Systémový zmrd` · 6 `Učebnicový zmrd`. Pro nezmrdy/šedou zónu používej výstižné
varianty (`"Slabý lídr (není zmrd)"`, `"Manažerské selhání"` + `"gray": true`).

V `categoryReason` typologii **obhaj** — odliš ji od nejbližšího souseda
(„proč Systémový, a ne jen Populistický").

---

## D-FENS zmrdologie — taxonomie (zdroj: dfens-cz.com, 2001)

D-FENS definoval zmrda jako jedince s přebujelým egem, který se snaží dostat tam,
kam nepatří, lidsky nepřijatelnými metodami. 10 znaků slouží jako **druhý filtr**
(určují `category` a `dictum`) **i jako přímý obsah pole `dfens`**, které se
renderuje. Do `dfens` dávej znaky podle čísla `n`:

| `n` | Znak (label doplní web) | Politická manifestace → text do `why` |
|----:|--------------------------|----------------------------------------|
| 1 | Rád tlachá | Půl hodiny řeči, nula závazku |
| 2 | Vysává cizí zásluhy | Přivlastňuje si cizí práci, přebírá agendu |
| 3 | Líže kliky | Jiná tvář k nadřízeným (EU, vůdce) než k veřejnosti |
| 4 | Nekonzistentní | Reaguje pokaždé jinak podle aktuální výhody |
| 5 | Neumí s lidmi | Obklopuje se loajalisty, likviduje kritiky |
| 6 | Hraje tvrdě zezadu | Intrikuje, těží z neveřejných informací, omezuje konkurenci |
| 7 | Neudělá nic pořádně | „Navrch huj, vespod fuj" — výsledky chybí |
| 8 | Dbá na image | Sleduje, co je „in", pozici mění podle trendů |
| 9 | Hraje na body | Potřebuje rozdrcení soupeře, ne řešení problému |
| 10 | Kolektivní | Tvoří konglomeráty zmrdů — účelová spojenectví |

Čím víc znaků a vyšší organizace, tím spíš **Systémový**. Otevřená provokace →
**Exhibicionistický**. Lež jako nástroj → **Populistický**. Otáčení podle situace
→ **Oportunistický**.

---

## Hlas (výstup má hlas)

`categoryReason`, `dictum` a `highlight` se čtou jako text, ne jako tabulka.
Piš je v dikci D-FENS: **suchý, ironický, ale výhradně věcný.** Opírej se
o doložené chování, nikdy o dojem; pojmenuj vzorec, ne osobu. Žádná vata, žádné
„je třeba dodat". Pole `overrides[].text` naopak drž **fakticky a stroze** — tam
je hlas nežádoucí, jen doložený nález a stav řízení.

---

## Datové zdroje (pořadí priority)

| Zdroj (`p`) | Co hledáš | URL / postup |
|-------------|-----------|--------------|
| **demagog.cz** | Ověřené výroky — pravda/lež/zavádějící | `demagog.cz/politici/[slug]` |
| **hlidacstatu.cz** | Dotace, zakázky, majetek, střet zájmů | `hlidacstatu.cz/osoba/[slug]` |
| **psp.cz** | Docházka a hlasování v PSP | `psp.cz` → záznam účasti |
| **kohovolit.eu** | Hlasovací historie, postoje, stranické přesuny | `kohovolit.eu` |
| **justice.cz** | Soudní řízení, rejstříky, pravomocná rozhodnutí | WebSearch `[jméno] rozsudek justice.cz` |
| **mediální archiv** | Doložené výroky a kauzy (irozhlas.cz, Deník N, Seznam Zprávy, Reportér, Echo24, Neovlivní, Transparency) | WebSearch + WebFetch |
| Evropská komise / další | Audity, oficiální dokumenty | dle kauzy |

`WebSearch` vždy pro **aktuální** stav (ne z paměti); `WebFetch` na ověření
konkrétního zdroje do `src`.

---

## Postup pro každý dotaz

1. **Identifikace** — celé jméno, funkce, strana, období, `scope`. Když nejasné, upřesni před hledáním.
2. **Agresivní paralelní rešerše** — vějíř ≥ 8 dotazů (viz Metodika). Drž se každé nitky do konkrétních faktů.
3. **Ohodnoť 6 os** dle pravidla svícení (doloženo + referováno = svítí). Kontrola pokrytí: hledal jsem ke každé ose?
4. **Kalibrace** — porovnej s referenční stupnicí. Vyšlo nízko u etablovaného hráče? Vrať se hledat.
5. **D-FENS filtr** — naplněné znaky → `dfens[]` + volba `category`.
6. **Napiš hlas** — `dictum`, `categoryReason`, `highlight`.
7. **Sestav JEDEN JSON** přesně dle schématu. Zkontroluj: klíče os, `src` u všech 🔴 os, `dfens` tvar `{n,why}`, `category` z povolené množiny, validní JSON, žádný text mimo.

## Kritická pravidla

1. **Pouze ověřitelná fakta** — každá 🔴 osa má `src` (ideálně 2 nezávislé).
2. **Doloženo + referováno svítí** — pravomocný rozsudek není podmínka; stav řízení mění formulaci, ne svícení.
3. **Rozlišuj stav řízení** v `text` — obviněn ≠ obžalován ≠ odsouzen ≠ pravomocně odsouzen. Nazvi přesně.
4. **Nepodhodnocuj** — nízké skóre u etablovaného hráče s kauzami = signál mělké rešerše. Ale ani nenafukuj: přesnost > dramatičnost.
5. **Žádné hodnotové soudy v `overrides[].text`** — bez adjektiv „skandální", „podezřelý". Hodnotí se chování, ne osoba. (Hlas patří do `dictum`/`categoryReason`/`highlight`.)
6. **Aktuální data** — vždy WebSearch.
7. **Výstup = jeden validní JSON** ve schématu `data.js` person záznamu. Žádný markdown/text mimo. Analýza žije v polích, která web vykreslí.

---

## Ověřené příklady

### Vysoké skóre — Alena Schillerová (5/6, Systémový zmrd) — odpovídá záznamu v `data.js`

```json
{
  "id": "schillerova",
  "name": "Alena Schillerová",
  "party": "ANO",
  "role": "expministryně financí, místopředsedkyně klubu",
  "scope": "celostátní",
  "photo": null, "photoPos": null, "gallery": [], "obvod": null,
  "category": "Systémový zmrd",
  "categoryReason": "Není exhibicionistka jako Turek — funguje tiše a efektivně. Kombinuje rodinné finanční toky, blízkost k neveřejným státním informacím a selektivní fiskální morálku. Učebnicový produkt ekosystému ANO — proto Systémový, ne Populistický.",
  "dictum": "Méně viditelná verze systémového zmrdství: žádná exhibice, jen rodinné finance, státní informace na dosah a fiskální morálka, která platí vždycky jen pro druhé.",
  "highlight": "Zeť David Rusňák — miliardář a bývalý sponzor ANO — se přiznal k objednávání lustrací z neveřejných policejních databází; jeho trestní stíhání bylo podmíněně zastaveno týden předtím, než se Schillerová stala ministryní financí. K trestním kauzám dvou příbuzných sama tvrdí, že „o tom neví vůbec nic".",
  "lit": ["lze", "penize", "konzistence", "toxicita", "zbabelost"],
  "dfens": [
    { "n": 3,  "why": "Babišova věrná — jiná tvář ke šéfovi než navenek." },
    { "n": 6,  "why": "Tiché těžení z blízkosti k neveřejným informacím (kauza FAU)." },
    { "n": 8,  "why": "Hlásá rozpočtovou odpovědnost, jako ministryně dělá pravý opak." },
    { "n": 10, "why": "Pevná součást konglomerátu ANO — účelová loajalita." }
  ],
  "overrides": {
    "lze": { "text": "Demagog.cz z 159 ověřených výroků eviduje 18 nepravdivých a 22 zavádějících — např. nepravdivé tvrzení o chybějících zákonných přílohách rozpočtu 2026 a zavádějící dataci zavedení EET.",
             "src": [ { "p": "demagog.cz", "t": "Výroky Aleny Schillerové — hodnocení", "u": "https://demagog.cz/politici/alena-schillerova-495" } ] },
    "penize": { "text": "Ministerstvo financí pod jejím vedením zaplatilo 1,93 mil. Kč ze státních peněz fotografovi a kameramanovi pečujícím o její osobní Instagram a Facebook (policie kauzu odložila, přezkoumává státní zástupce). Firma Bika manžela, kde působí i syn, v rozporu se zákonem nezveřejnila účetní závěrku se zatajeným vkladem 13 mil.",
               "src": [ { "p": "iROZHLAS", "t": "Propagace na sítích za 1,93 mil. ze státních peněz", "u": "https://www.irozhlas.cz/zpravy-domov/schillerova-fotky-propagace-instagram-policie-trestni-oznameni_2205201522_elev" }, { "p": "Neovlivní", "t": "Zatajených 13 milionů — firma manžela Bika", "u": "https://neovlivni.cz/zatajenych-13-milionu-tak-podnika-manzel-schillerove/" } ] },
    "prace": { "text": "Jediná čistá osa — jako ministryně i předsedkyně klubu vykazovala vysokou aktivitu." },
    "konzistence": { "text": "Jako ministryně hájila schodek 310 mld jako neporušení zákona o rozpočtové odpovědnosti a vinu svalovala na minulou vládu; v opozici týmž metrem označovala rozpočty Stanjury za „nepravdivé a nerealistické". Národní rozpočtová rada její rozpočet označila za bezprecedentní.",
                     "src": [ { "p": "Echo24", "t": "Schodek 310 mld — zákon prý neporušila", "u": "https://www.echo24.cz/a/HXKtq/zpravy-ekonomika-rozpocet-zakon-neporusil-rika-schillerova-presto-chce-zmenu" }, { "p": "ČeskéNoviny", "t": "Rozpočtová rada: nesplní zásady odpovědnosti", "u": "https://www.ceskenoviny.cz/zpravy/rada-rozpocet-asi-nesplni-zasady-odpovednosti-je-to-bezprecedentni/2772495" } ] },
    "toxicita": { "text": "Doložená dehonestující rétorika vůči vládě a oponentům — o jmenování ministryně řekla, že „politici si podali ruku s mafií", schůzi ke kampeličce přirovnala k „devadesátkám v Bogotě".",
                  "src": [ { "p": "CNN Prima", "t": "„Podali si ruku s mafií"", "u": "https://cnn.iprima.cz/schillerova-fialovi-ministri-si-podali-ruku-s-mafii-proc-nema-ze-jmenovani-decroix-radost-477214" } ] },
    "zbabelost": { "text": "V kauze „zakleknutí" na firmu FAU u soudu jako svědkyně vypověděla, že o neveřejné informace z živého daňového řízení „nežádala" a „není si toho vědoma"; k trestním kauzám zetě a dalšího příbuzného uvedla, že „o tom neví vůbec nic". Osobní odpovědnost nevyvodila.",
                   "src": [ { "p": "iROZHLAS", "t": "„Nejsem si toho vědoma" — výpověď v kauze FAU", "u": "https://www.irozhlas.cz/zpravy-domov/nejsem-si-toho-vedoma-schillerova-u-soudu-vypovedela-ze-si-informace-o-fau_2406241647_kma" } ] }
  }
}
```

### Poctivě nízké skóre — Karel Havlíček (2/6, Hraniční případ)

Demonstruje, že rekalibrace nevede k plošně vysokým číslům — vede k **přesným**.
Havlíček má dvě doložené osy a žádný systém, proto 2/6, ne 5/6.

```json
{
  "id": "havlicek",
  "name": "Karel Havlíček",
  "party": "ANO",
  "role": "expvicepremiér, exministr průmyslu a dopravy",
  "scope": "celostátní",
  "photo": null, "photoPos": null, "gallery": [], "obvod": null,
  "category": "Hraniční případ",
  "categoryReason": "Havlíček není architekt zmrdství — je jeho spolehlivý vykonavatel. Vlastní dotační minulost a kalkul kolem Rosatomu ho drží nad čistou nulou, ale chybí mu systém i iniciativa Babiše či tichý profit Schillerové. Technokrat v nesprávném dresu — proto jen hraniční, ne plnokrevný.",
  "dictum": "Není architekt zmrdství, je jeho spolehlivý vykonavatel — jenže vykonavatel s vlastním dotačním ocasem a ochotou hrát si s národní bezpečností.",
  "highlight": "Rosatom na Dukovany. Tajné služby (BIS, ÚZSI, Vojenské zpravodajství, NÚKIB) jednotně varovaly, opozice žádala rezignaci — Havlíček tlačil dál a o bezpečnostním dotazníku pro ruskou firmu rozhodl na poslední chvíli bez souhlasu vlády. Otočil teprve když atentát ve Vrběticích pokračování znemožnil. Není to přesvědčení — je to politická kalkulace s národní bezpečností jako vstupenkou.",
  "lit": ["penize", "konzistence"],
  "dfens": [
    { "n": 3, "why": "Babišův loajalista — veřejně hájil střet zájmů svého šéfa." },
    { "n": 8, "why": "Prezentuje se jako odborník-technokrat, rozhoduje ale politicky." },
    { "n": 9, "why": "Prosazování proti jednotnému varování expertů jako mocenské gesto." }
  ],
  "overrides": {
    "penize": { "text": "Investigativní reportáže (Reportér magazín) dokumentují jeho roli investora a člena představenstva firem napojených na dotační kauzy — mj. Technistone v době podání dotace později řešené jako podvod a projekt kmenových buněk nabízející neúčinnou léčbu nevyléčitelně nemocným. Opakovaně veřejně hájil střet zájmů A. Babiše a čerpání dotací Agrofertem.",
               "src": [ { "p": "Reportér magazín", "t": "50 milionů je pryč — dotační podvod, v němž se Havlíček objevuje", "u": "https://reportermagazin.cz/73103/50-milionu-je-navzdy-pryc-pribeh-dotacniho-podvodu-v-nemz-se-dvakrat-objevuje-karel-havlicek/" }, { "p": "iROZHLAS", "t": "Obhajoba střetu zájmů Babiše", "u": "https://www.irozhlas.cz/zpravy-domov/karel-havlicek-stret-zajmu-evropsky-soudni-dvur-rezoluce-evropskeho-parlamentu_2106131358_tzr" } ] },
    "konzistence": { "text": "V tendru na dostavbu Dukovan měsíce prosazoval účast ruského Rosatomu navzdory jednotnému varování tajných služeb; o bezpečnostním dotazníku rozhodl na poslední chvíli bez souhlasu vlády a bez vědomí vládního zmocněnce. Otočil teprve po odhalení ruské stopy ve Vrběticích.",
                     "src": [ { "p": "Transparency International", "t": "Chaotický tendr na Dukovany ohrožuje bezpečnost ČR", "u": "https://www.transparency.cz/chaoticky-a-netransparentni-tendr-na-dukovany-ohrozuje-bezpecnostni-i-ekonomicke-zajmy-cr-ministr-havlicek-prosazuje-nezakonnou-vyjimku/" }, { "p": "Aktuálně.cz", "t": "Havlíček tendr změnil, aby v něm udržel Rosatom", "u": "https://zpravy.aktualne.cz/domaci/jaderny-lobbista-havlicek-tendr-na-dostavbu-dukovan-zmenil/r~4786f7c417b611ecbc3f0cc47ab5f122/" } ] },
    "prace": { "text": "Bez záznamu — spíše přetížen třemi funkcemi najednou než absentér." }
  }
}
```

---

## Fallback stavy

- **Málo dat / krátká kariéra** — vrať záznam s prázdným `lit`, `category` typu `"Hraniční případ"` nebo `"Není zmrd"`, vynech `highlight`/`dfens` a stav popiš v `dictum` („omezená data — krátká kariéra"). Nevymýšlej osy.
- **Regionální/senátní kandidát** — opři se o mediální archiv + Hlídač státu; co nedoložíš, nesviť.
- **Manažerské/odborné selhání bez osobního zmrdství** — `"gray": true`, `category` `"Manažerské selhání"`, kritizovanou osu nech čistou s kontextem v `overrides`.
