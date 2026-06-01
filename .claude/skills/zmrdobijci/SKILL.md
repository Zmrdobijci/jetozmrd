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

### Pravidla schématu (vazba na `data.js` + render)

- **`id`** — slug bez diakritiky, malými písmeny (`schillerova`, `havlicek`). Krátká forma příjmení stačí, musí být unikátní v databázi. Je to zároveň routa profilu na webu (`#/detail/[id]`).
- **`scope`** — `"celostátní"` nebo `"senát"`. U senátu vyplň i **`obvod`** (číslo) a `role` typu `"kandidát do Senátu"`.
- **`photo`** — **aktivně dohledej oficiální portrét** a vlož přímou URL na obrázek (ne na stránku). Priorita zdrojů:
  - **Poslanec PSP** → psp.cz. Otevři detail osoby (`WebFetch https://www.psp.cz/sqw/detail.sqw?id=<id_osoby>` nebo přes vyhledávání) a vezmi `<img class="sharp" src="/eknih/cdrom/2025ps/eknih/2025ps/poslanci/i<ID>.jpg">`; výsledná URL je `https://www.psp.cz/eknih/cdrom/2025ps/eknih/2025ps/poslanci/i<ID>.jpg`.
  - **Senátor** → senat.cz. Na detailu senátora (`…/senatori/index.php?par_2=2` → odkaz par_3=<id>) najdi `/images/senatori/<slug>_295.jpg`; URL je `https://www.senat.cz/images/senatori/<slug>_295.jpg`.
  - **Ostatní (ministr-neposlanec, historická osoba)** → Wikimedia Commons / cs.wikipedia lead image: `WebFetch https://cs.wikipedia.org/w/api.php?action=query&redirects=1&titles=<Jméno>&prop=pageimages&piprop=thumbnail&pithumbsize=500&format=json` → `thumbnail.source`. Jen **solo portrét správné osoby** (ověř popisek/kategorii); skupinové foto NE.
  - **Pravidla:** vždy ověř, že portrét patří TÉ osobě (časté jméno = riziko záměny); použij jen oficiální nebo volně licencovaný zdroj (psp.cz, senat.cz, Wikimedia Commons), **nikdy chráněnou tiskovou fotku**; **raději `null` než špatná nebo rozbitá URL**. Nevymýšlej cesty.
- **`photoPos` / `gallery`** — ponech `null` / `[]`, pokud nemáš důvod jinak.
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
| **penize** | Žije z cizích peněz / dotací? | Doložený vzorec života z veřejných peněz bez vlastního přínosu — dotační byznys, trafiky / dosazené funkce, střet zájmů, zakázky či profit přes rodinu/firmy, dotační podvod |
| **prace** | Vyhýbá se práci — v mandátu i v životě? | (a) psp.cz / EP / kohovolit.eu vykazují nadprůměrnou neúčast, **NEBO** (b) nemá doloženou reálnou kariéru mimo politiku — v životě nikdy tvrdě nemakal (profi politik / trafikant od mládí). Čistá osa **vyžaduje důkaz** práce; viz „Pozor u prace" níže |
| **konzistence** | Je nekonzistentní? | Doložené otáčení kabátu, změny stran, obraty v klíčových postojích dle výhody; **i série přeběhů přes ideologické spektrum** (viz „Pozor u konzistence" níže) |
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

**Pozor u `penize` — *vzorec*, ne jednorázovka.** Osu rozsvěcuje doložená *závislost*
existence nebo byznysu na veřejných penězích, ne jeden legální příjem. Běžný plat za reálně
vykonávanou funkci nebo jedna dotace dostupná komukoli za reálný projekt **nesvítí**. Svítí,
když je veřejný zdroj *jádrem* příjmů bez vlastního přínosu: dotační impérium, trafika /
dosazená funkce, čerpání ve střetu zájmů, dotační podvod. Test: *„dal by mu někdo tu korunu
dobrovolně z vlastní kapsy za to, co reálně umí?"*

**Pozor u `konzistence` — přeběhlictví přes spektrum svítí i bez „obratu v mandátu".**
Osa **nesvítí jen** za otočku doloženou ve funkci nebo za explicitní programový obrat
v drženém mandátu. Svítí i **série stranických přesunů přes ideologicky neslučitelné
tábory** (např. ČSSD → SPOZ → SPD), a to **i když šlo o pouhé neúspěšné kandidatury** bez
získaného postu. Samotné křižování levice–pravice *je* ten obrat — kdo střídá programově
protichůdné strany podle volitelnosti, je oportunista bez ohledu na to, že mandát nezískal;
„byly to jen neúspěšné kandidatury, ne otáčení kabátu ve funkci" **není** důvod osu zhasnout.
Test: *„dají se programy strany A a strany B držet současně, nebo se navzájem vylučují?"*
Vylučují → konzistence svítí (a `category` spíš `Oportunistický zmrd`). Naopak **jeden** přesun
mezi blízkými stranami téhož proudu, nebo **jediná** kandidatura, sám o sobě nesvítí.

**Pozor u `prace` — přísně: měř docházku I životní kariéru, a nedávej osu zadarmo.**
Osa má **dva spouštěče, stačí jeden**:
- **(a) Vyhýbání v mandátu** — psp.cz / kohovolit.eu / EP doloží nadprůměrnou neúčast na
  hlasováních a schůzích oproti kolegům.
- **(b) Žádná reálná práce v životě** — kariéra od mládí jen v politice, stranických
  funkcích, dosazených pozicích a trafikách, **bez doloženého období, kdy člověk tvrdě
  makal v reálné profesi** (řemeslo, medicína, věda, sedlák, vlastní firma s reálným
  výkonem…). Profi politik od pětadvaceti bez jediného skutečného džobu = osa svítí.

**Důkazní pravidlo (klíčové — obrácené břemeno):** osu **nezhasínej z dobré vůle.**
Když tvrdíš, že subjekt „maká" / „má za sebou poctivou práci", **uveď konkrétní důkaz**
do `text` + `src` (profese, zaměstnavatel, období, doložený výkon). Když důkaz nemáš,
**napiš to natvrdo** — `text`: „reálná kariéra mimo politiku nedoložena — data chybí" —
a osu z presumpce neviny nech nesvítit, ale **nikdy netvrď pracovitost bez dokladu**.
Pořadí: doložený profi-politik bez reálné profese → 🔴 svítí; doložená reálná kariéra
→ čistá (s citací); nezjištěno → „data chybí", nesvítí, žádné chvály bez důkazu.

---

## Aktuální politický kontext (ověř WebSearch — může být neaktuální)

Funkce se mění; **role vždy ověř hledáním**, neber z paměti ani z této kotvy.
Poslední známý stav (kalibrováno k 2026): po sněmovních volbách na podzim 2025
vznikla **3. vláda Andreje Babiše** (ANO + SPD + Motoristé), jmenovaná 15. 12. 2025,
důvěru dostala 15. 1. 2026.

- **Vláda (ANO+SPD+Motoristé):** Babiš (premiér), Schillerová (ministryně financí, místopř. vlády), Havlíček (ministr průmyslu a obchodu, 1. místopř. vlády), Okamura (předseda Sněmovny), Turek (vládní zmocněnec — prezident odmítl jmenovat ministrem).
- **Opozice (SPOLU + STAN + Piráti):** Fiala (expremiér, ODS), Rakušan (exministr vnitra, STAN), Pekarová Adamová (expředsedkyně Sněmovny, TOP 09), Bartoš a Hřib (Piráti).

Než označíš někoho „premiér / ministr / ex-", potvrď aktuální funkci hledáním —
tahle kotva stárne každou rekonstrukcí vlády.

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
| Petr Fiala | 1/6 | Slabý lídr (není zmrd) | konzistence |
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
| **Vohnout** | Pasivní protějšek zmrda — neiniciuje ani neprofituje, jen se ohýbá před mocí: hlasuje na povel, kryje vůdce, postoj mění shora. Definuje ho zbabělost + ohýbání (znak 3 líže kliky), ne vlastní systém. Typicky 1–3 osy (viz „Zmrd vs. vohnout") |
| **Není zmrd** | 0–1 osa; slabé vedení či odborné selhání ≠ zmrdství. **0/6 = ani zmrd, ani vohnout** (vohnout potřebuje doložené ohýbání) |
| **Anti-vohnout** | 0 os + **doložené postavení se moci** (vzdor nátlaku, kontrola mocných). Pozitivní opak vohnouta. Použij variantu `"Anti-vohnout (není zmrd)"` / `"(má hrany)"`. Příklady v `data.js`: Vystrčil, Němcová, Minář, Hřib, Bláha |

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

## Zmrd vs. vohnout — dvě tváře téže taxonomie

D-FENS optika nezná jen aktivního dravce. Zmrd a vohnout jsou dva póly téhož ekosystému:

- **Zmrd** = aktivní dravec s přebujelým egem. Iniciuje, profituje, buduje. Cpe se tam, kam nepatří, nepřijatelnými metodami.
- **Vohnout** = pasivní palivo zmrdího systému. Neiniciuje, neprofituje — jen se **ohýbá před mocí**: hlasuje, jak se řekne, kryje vůdce, postoj mění podle příkazu shora a vlastní odpovědnosti se zbaběle vyhýbá. Bez vohnoutů by systémový zmrd neměl koho ovládat.

**Jak vohnouta poznáš (profil os + D-FENS znaků):**
- **Jádro = znak 3 (líže kliky)** — jiná tvář k vůdci/vedení než k veřejnosti.
- **zbabelost svítí** — vyhýbá se vlastní odpovědnosti, schovává se za stranu nebo vůdce.
- **konzistence svítí formou ohýbání** — postoj nemění podle vlastní kalkulace (to je oportunista), ale podle toho, kam fouká od vedení.
- **znak 10 (kolektivní)** jako řadový člen konglomerátu, ne jeho architekt.
- Naopak typicky **NEsvítí penize** (nemá vlastní obohacovací schéma) ani **toxicita** (je submisivní, ne agresivní).

**Dvě varianty — nehledej vohnouta jen u stran s vůdcem (pozor na optickou asymetrii):**
- **Vohnout vůdcovský** (typicky ANO/SPD) — líže kliky jednomu silnému lídrovi, veřejně kryje jeho kauzy. *Příklad: Nacher — placený loajální obhájce Babišova střetu zájmů.*
- **Vohnout koaliční** (typicky pravice bez silného vůdce) — neohýbá se před osobou, ale před vládní/stranickou linií: zradí vlastní programovou identitu kvůli setrvání ve vládě a zbaběle se vyhne odpovědnosti. *Příklad: Stanjura (ODS) — strana „rozpočtové odpovědnosti“, jejíž ministr hájil rekordní schodky a v opozici je atakuje.* **Stejný metr na obě strany:** když rozsvěcíš konzistenci levici za obhajobu schodků (Schillerová), musíš ji rozsvítit i pravici za totéž.

**Hraniční testy (čím vohnout NENÍ):**
- Iniciuje vlastní kauzy a profituje z nich → **zmrd**, ne vohnout. *Příklad: Havlíček — má jádro vohnouta (líže kliky Babišovi), ale vlastní dotační ocas a tlak na Rosatom proti varování tajných služeb ho překlápějí do Hraničního zmrda. „Vohnout s ocasem", který kategorii přerostl.*
- Mění kabát podle vlastní výhody/průzkumů, ne na povel → **oportunistický zmrd**.
- Je na vrcholu a neohýbá se před nikým — selhává vedením, ne poslušností → **slabý lídr / není zmrd**. *Příklad: Fiala — premiér bez nadřízeného; jeho jediná hrana je elektorální kalkul, ne ohýbání před mocí. Mimo osu vohnouta.*
- Doložené osy nesvítí a žádný vzorec ohýbání → **Není zmrd** (čistý). Pokud se navíc moci doloženě **postavil** (Vystrčil — Tchaj-wan navzdory tlaku Pekingu a Zemana; Němcová, Minář), je to **anti-vohnout** — opak kategorie.

**Skóre a render:** vohnout má typicky nízké zmrd-skóre (1–3), protože aktivní osy nesvítí — ale **„Vohnout" je kvalitativní kategorie, ne totéž co „Hraniční případ".** Hraniční = pár os, nejasné důkazy; Vohnout = jasný vzorec ohýbání před mocí. A **0/6 vohnout neexistuje** — bez doložené zbabělosti či ohýbání nesvítí nic a jde o čistého „Není zmrd". V `categoryReason` rozdíl obhaj.

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
  "role": "ministryně financí a místopředsedkyně vlády",
  "scope": "celostátní",
  "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Schillerov%C3%A1_Raku%C5%A1an_2023_%28cropped%29.jpg/500px-Schillerov%C3%A1_Raku%C5%A1an_2023_%28cropped%29.jpg", "photoPos": null, "gallery": [], "obvod": null,
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
    "prace": { "text": "Čistá osa, doloženo: před politikou kariéra daňové právničky a vrcholné úřednice Finanční správy (generální ředitelství) — reálná profese mimo politiku doložena; jako ministryně i předsedkyně klubu vysoká aktivita.",
               "src": [ { "p": "Wikipedie / životopis", "t": "Schillerová — daňová právnička, Finanční správa", "u": "https://cs.wikipedia.org/wiki/Alena_Schillerov%C3%A1" } ] },
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
  "role": "ministr průmyslu a obchodu, 1. místopředseda vlády",
  "scope": "celostátní",
  "photo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Karel_Havl%C3%AD%C4%8Dek_akademicky-snem-duben-2026_03_%28cropped%29.jpg/500px-Karel_Havl%C3%AD%C4%8Dek_akademicky-snem-duben-2026_03_%28cropped%29.jpg", "photoPos": null, "gallery": [], "obvod": null,
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
    "prace": { "text": "Čistá osa, doloženo: před politikou podnikatel a vysokoškolský pedagog (ČZU), prezident Asociace malých a středních podniků — reálná kariéra mimo politiku doložena. Spíše přetížen třemi funkcemi než absentér.",
               "src": [ { "p": "Wikipedie / životopis", "t": "Havlíček — podnikatel, pedagog ČZU, AMSP", "u": "https://cs.wikipedia.org/wiki/Karel_Havl%C3%AD%C4%8Dek_(politik)" } ] }
  }
}
```

---

## Fallback stavy

- **Málo dat / krátká kariéra** — vrať záznam s prázdným `lit`, `category` typu `"Hraniční případ"` nebo `"Není zmrd"`, vynech `highlight`/`dfens` a stav popiš v `dictum` („omezená data — krátká kariéra"). Nevymýšlej osy.
- **Regionální/senátní kandidát** — opři se o mediální archiv + Hlídač státu; co nedoložíš, nesviť.
- **Manažerské/odborné selhání bez osobního zmrdství** — `"gray": true`, `category` `"Manažerské selhání"`, kritizovanou osu nech čistou s kontextem v `overrides`.
