---
name: zmrdobijci
allowed-tools: WebSearch, WebFetch
description: >
  Faktografická zmrdologická analýza českých politiků jako podklad pro databázi
  webu jetozmrd.cz. Použij kdykoliv přijde dotaz typu: "prověř [politik]",
  "fakta o [politik]", "je [politik] zmrd", "kauzy [politik]", "hlasování [politik]",
  "podklad pro databázi [politik]". Skill vyhledá veřejně doložitelná fakta
  (Demagog, Hlídač státu, psp.cz, kohovolit.eu, justice.cz, mediální archiv),
  ohodnotí 6 os zmrdství, aplikuje D-FENS taxonomii jako druhý filtr a vrátí
  PŘESNĚ JEDEN validní JSON ve schématu databáze webu (src/legacy/data.js → person
  záznam), připravený k vložení do pole ZMRD.HEADLINERS. Pouze doložená fakta
  s citacemi, žádné hodnotové soudy; rozlišuje obviněn ≠ obžalován ≠ pravomocně
  odsouzen.
---

# Zmrdologická faktografie — podklad pro databázi jetozmrd.cz

Tvým výstupem je **jeden záznam politika přímo ve schématu databáze webu**
(`src/legacy/data.js`, pole `ZMRD.HEADLINERS`). Záznam musí jít vložit beze změny
struktury — `person()` z něj dopočítá `score`, `tier` a `dims`. Žádný analytický
text mimo JSON.

## Výstupní kontrakt (NEJDŮLEŽITĚJŠÍ)

**Výstup = právě jeden validní JSON objekt a nic jiného.** Žádný úvod, žádný
markdown, žádné code fences, žádné komentáře mimo JSON.

### Schéma (authoring shape, který čte `person()`)

```json
{
  "id": "slug-bez-diakritiky-s-pomlckami",
  "name": "Celé jméno",
  "party": "Strana / hnutí",
  "role": "funkce, např. 'předseda hnutí, expremiér'",
  "scope": "celostátní",
  "photo": null,
  "photoPos": null,
  "gallery": [],
  "obvod": null,

  "category": "Systémový zmrd",
  "dictum": "Jedna věta v dikci D-FENS — suchá, ironická, výhradně věcná.",

  "lit": ["lze", "penize", "konzistence", "toxicita", "zbabelost"],

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

### Pravidla schématu (vazba na `data.js`)

- **`id`** — slug bez diakritiky, malými písmeny, slova spojená pomlčkou (`andrej-babis` → v praxi `babis`). Musí být unikátní v rámci databáze.
- **`scope`** — `"celostátní"` nebo `"senát"`. U senátu vyplň i **`obvod`** (číslo) a `role` typu `"kandidát do Senátu"`.
- **`photo` / `photoPos` / `gallery`** — když nemáš doložené veřejné foto, ponech `null` / `[]`. Nevymýšlej cesty.
- **`lit`** — pole klíčů os, které jsou **🔴 doložené**. Klíče POUZE z: `lze`, `penize`, `prace`, `konzistence`, `toxicita`, `zbabelost`. `score` se dopočítá automaticky jako `lit.length` (0–6) — do JSON ho **nepiš**.
- **`overrides[klíč]`** — pro každou **🔴 osu z `lit`** je povinné `text` (nález) **i `src`** (≥ 1 zdroj). Pro **čistou osu** dej buď stručný `text` bez `src`, nebo osu z `overrides` úplně vynech (použije se defaultní čistá fráze). Web u čistých os zobrazí jen „ne" — text čisté osy slouží jako podklad, nerenderuje se.
- **`src` položka** = `{ "p": …, "t": …, "u": … }`: `p` = krátký název zdroje (`demagog.cz`, `hlidacstatu.cz`, `psp.cz`, `kohovolit.eu`, `justice.cz`, `mediální archiv`, `Evropská komise`…), `t` = popisek konkrétního zdroje, `u` = URL. **Žádná 🔴 osa bez `src`.**
- **`category`** — z povolené množiny (viz níže). Když ji nevyplníš, dopočítá se ze `score` přes `categoryFor()`. Pro headlinery ji vyplňuj vždy (typologie nese víc informace než číslo).
- **Šedá zóna** — pokud jde o manažerské/systémové selhání bez prokázaného osobního zmrdství, přidej `"gray": true` (pak `score = null`, `category` např. `"Manažerské selhání"`). Osu, která je jen kritizovaná, ale neprokázaná, **nedávej do `lit`** — dej její kontext do `overrides` jako čistou osu.
- Kódování UTF-8, diakritika přímo (ne `\u`). Datumy `YYYY-MM-DD`, období jako string (`"2017–2021"`).

### Ověřený příklad (Andrej Babiš — odpovídá záznamu v `data.js`)

```json
{
  "id": "babis",
  "name": "Andrej Babiš",
  "party": "ANO",
  "role": "premiér, předseda hnutí",
  "scope": "celostátní",
  "photo": "assets/babis-portret.jpg",
  "photoPos": null,
  "gallery": [],
  "obvod": null,
  "category": "Systémový zmrd",
  "dictum": "Učebnicový případ z hlediska zmrdologie: jediná čistá osa je docházka — protože do práce, kde se rozhodují dotace, chodí velmi rád.",
  "lit": ["lze", "penize", "konzistence", "toxicita", "zbabelost"],
  "overrides": {
    "lze": {
      "text": "Demagog.cz dlouhodobě eviduje vysoký podíl nepravdivých a zavádějících výroků.",
      "src": [
        { "p": "demagog.cz", "t": "Výroky Andreje Babiše", "u": "https://demagog.cz/" },
        { "p": "hlidacstatu.cz", "t": "Veřejné výroky", "u": "https://www.hlidacstatu.cz/" }
      ]
    },
    "penize": {
      "text": "Audit Evropské komise (2021) konstatoval střet zájmů u koncernu Agrofert čerpajícího dotace; kauza Čapí hnízdo řešena soudem.",
      "src": [
        { "p": "Evropská komise", "t": "Audit střetu zájmů (2021)", "u": "https://ec.europa.eu/" },
        { "p": "hlidacstatu.cz", "t": "Dotace koncernu Agrofert", "u": "https://www.hlidacstatu.cz/" },
        { "p": "justice.cz", "t": "Kauza Čapí hnízdo", "u": "https://justice.cz/" }
      ]
    },
    "prace": {
      "text": "Jediná osa bez záznamu — jako premiér i poslanec vykazoval vysokou aktivitu."
    },
    "konzistence": {
      "text": "Soudní spory o evidenci ve svazcích StB; doložené názorové obraty napříč obdobími.",
      "src": [
        { "p": "justice.cz", "t": "Spor o evidenci StB", "u": "https://justice.cz/" },
        { "p": "demagog.cz", "t": "Archiv postojů", "u": "https://demagog.cz/" }
      ]
    },
    "toxicita": {
      "text": "Opakované dehonestující výroky vůči novinářům a politickým oponentům (mediální archiv).",
      "src": [
        { "p": "mediální archiv", "t": "Výroky vůči novinářům", "u": "https://www.irozhlas.cz/" }
      ]
    },
    "zbabelost": {
      "text": "V kauze Čapí hnízdo přenesení dotace na rodinné příslušníky; vyhýbání se osobní odpovědnosti.",
      "src": [
        { "p": "mediální archiv", "t": "Čapí hnízdo — rodinní příslušníci", "u": "https://www.irozhlas.cz/" }
      ]
    }
  }
}
```

---

## 6 os zmrdství (klíče = `data.js` DIMENSIONS)

Hodnocení je **binární pro databázi** (osa svítí 🔴, nebo ne) — web jiný stav
nerenderuje. Při analýze ber 3 stupně a mapuj je takto:

| Klíč | Otázka | 🔴 do `lit` když… | 🟡 / 🟢 (mimo `lit`) |
|------|--------|-------------------|----------------------|
| **lze** | Lže prokazatelně? | Demagog/mediální archiv doloží opakované nepravdivé či zavádějící výroky | Ojedinělé/sporné → kontext do `text`, osu nesvítit |
| **penize** | Žije z cizích peněz / dotací? | Doložené čerpání veřejných prostředků, dotace ve střetu zájmů, zakázky | Běžný plat za funkci ≠ 🔴 |
| **prace** | Chodí do práce? | Záznamy psp.cz / EP / kohovolit.eu vykazují nadprůměrnou neúčast | Průměrná docházka → 🟢 |
| **konzistence** | Je konzistentní? | Doložené otáčení kabátu, změny stran, obraty v klíčových postojích | Vývoj názoru s odůvodněním → 🟢 |
| **toxicita** | Chová se toxicky? | Doložené urážky, dehonestace, šikana, výhrůžky vůči konkrétním osobám | Ostrá, ale věcná polemika → 🟢 |
| **zbabelost** | Je zbabělý? | Doložené vyhýbání se odpovědnosti, házení podřízených přes palubu | — |

**Mapování 3 stupňů → databáze:** 🔴 doloženo → klíč do `lit` + `text`+`src`.
🟡 částečně → **mimo `lit`**, nález popiš v `overrides[klíč].text` (slouží jako
podklad, web ho u čisté osy nezobrazí). 🟢 čistá → mimo `lit`, `text` volitelný.
Do `lit` patří jen to, co bys obhájil před soudem o přípustné kritice.

---

## Kategorie (typologie) — pole `category`

Po analýze zařaď do **jedné** kategorie. Score (0–6) je kvantita, kategorie je
kvalita („jaký typ zmrda"). Pro headlinery vyplňuj typologii:

| Kategorie | Kdy |
|-----------|-----|
| **Systémový zmrd** | Sofistikovaný, dlouhodobý, buduje ekosystém spolupracovníků, střídá role |
| **Exhibicionistický zmrd** | Provokuje vědomě a otevřeně; problém nastává, když musí provokaci popírat |
| **Populistický zmrd** | Vědomé lži jako politický nástroj; potřebuje nepřítele a krátkou paměť |
| **Oportunistický zmrd** | Mění přesvědčení podle situace / průzkumů |
| **Hraniční případ** | 2–3 osy svítí, nebo sporné důkazy (v `data.js` též `"Hraniční"`) |
| **Není zmrd** | 0–1 osa; slabé vedení či odborné selhání ≠ zmrdství |

Když nevyplníš `category`, dopočítá se ze score: 0 `Není zmrd` · 1 `Jedna skvrna`
· 2 `Hraniční případ` · 3 `Potvrzený zmrd` · 4 `Plnokrevný zmrd` · 5 `Systémový
zmrd` · 6 `Učebnicový zmrd`. Pro nezmrdy/šedou zónu používej výstižné varianty
(`"Slabý lídr (není zmrd)"`, `"Manažerské selhání"` + `"gray": true`).

---

## D-FENS zmrdologie — druhý filtr (zdroj: dfens-cz.com, 2001)

D-FENS definoval zmrda jako jedince s přebujelým egem, který se snaží dostat tam,
kam nepatří, lidsky nepřijatelnými metodami. **Použij 10 znaků jako druhý filtr**:
určují volbu `category` a dikci `dictum`. (Do JSON je nepiš — jsou to analytická
optika, ne pole databáze.)

| # | Znak | Politická manifestace |
|---|------|-----------------------|
| 1 | Rád tlachá | Půl hodiny řeči, nula obsahu; výroky bez závazku |
| 2 | Vysává cizí zásluhy | Přivlastňuje si cizí práci, přebírá agendu |
| 3 | Líže kliky | Jiné chování k nadřízeným (EU, vůdce) než k veřejnosti |
| 4 | Nekonzistentní | Reaguje pokaždé jinak podle aktuální výhody |
| 5 | Neumí s lidmi | Obklopuje se loajalisty, likviduje kritiky |
| 6 | Hraje tvrdě zezadu | Intrikuje, omezuje konkurentům přístup k informacím |
| 7 | Neudělá nic pořádně | „Navrch huj, vespod fuj" — výsledky chybí |
| 8 | Dbá na image | Sleduje, co je „in", mění pozici podle trendů |
| 9 | Hraje na body | Potřebuje rozdrcení soupeře, ne řešení problému |
| 10 | Kolektivní | Tvoří konglomeráty zmrdů — účelová spojenectví |

Čím víc znaků a čím vyšší stupeň organizace (fáze 1 izolovaný → 3 ovládl vedení),
tím spíš **Systémový zmrd**. Otevřená provokace → **Exhibicionistický**. Lež jako
nástroj → **Populistický**. Otáčení podle situace → **Oportunistický**.

## Dictum

Jednovětý verdikt v dikci D-FENS: **suchý, ironický, ale výhradně věcný** — opírá
se o doložené chování, nikdy o dojem. Pojmenuje vzorec, ne osobu. (Vzor viz
příklad Babiš výše.)

---

## Datové zdroje (pořadí priority)

| Zdroj (`p`) | Co hledáš | URL / postup |
|-------------|-----------|--------------|
| **demagog.cz** | Ověřené výroky — pravda/lež/zavádějící | `demagog.cz/politici/[slug]` |
| **hlidacstatu.cz** | Dotace, zakázky, majetek, funkce, střet zájmů | `hlidacstatu.cz/osoba/[slug]` |
| **psp.cz** | Docházka a hlasování v PSP | `psp.cz` → záznam účasti |
| **kohovolit.eu** | Hlasovací historie, postoje, stranické přesuny, účast v EP | `kohovolit.eu` |
| **justice.cz** | Soudní řízení, rejstříky, pravomocná rozhodnutí | WebSearch `[jméno] rozsudek justice.cz` |
| **mediální archiv** | Doložené výroky a kauzy (irozhlas.cz, Deník N, …) | WebSearch + WebFetch |
| Evropská komise / další | Audity, oficiální dokumenty | dle kauzy |

WebSearch používej vždy pro **aktuální** stav (ne jen z paměti); WebFetch na
ověření konkrétního zdroje, který půjde do `src`.

## Postup pro každý dotaz

1. **Identifikace** — celé jméno, funkce, strana, období, `scope` (celostátní/senát).
   Když nejasné, upřesni před hledáním.
2. **Paralelní hledání** — minimálně: `[jméno] kauzy`, `[jméno] demagog`,
   `[jméno] hlídač státu dotace`, `[jméno] hlasování sněmovna`, `[jméno] rozsudek`.
3. **Ohodnoť 6 os** (3 stupně → binární `lit` dle tabulky). Každá 🔴 osa musí mít
   citaci, jinak ji nesvítíš.
4. **Druhý filtr D-FENS** — urči naplněné znaky → zvol `category` a napiš `dictum`.
5. **Sestav JEDEN JSON** přesně dle schématu. Zkontroluj: klíče os, `src` u všech
   🔴 os, `category` z povolené množiny, validní JSON, žádný text mimo.

## Kritická pravidla

1. **Pouze ověřitelná fakta** — každá 🔴 osa má `src`. Bez zdroje se nesvítí.
2. **Žádné inference** — popisuj, co je doloženo, ne co z toho „vyplývá".
3. **Rozlišuj stav řízení** — obviněn ≠ obžalován ≠ odsouzen ≠ pravomocně
   odsouzen. Uváděj přesný stav; nepravomocné označ jako nepravomocné.
4. **Datová mezera je validní výsledek** — „nedostatek dat" je lepší než svícení
   bez důkazu. Raději osu nesviť.
5. **Žádné hodnotové soudy** v datech — bez adjektiv „skandální", „podezřelý",
   „záhadný". Hodnotí se chování, ne osoba. (Ostrost patří jen do `dictum`.)
6. **Aktuální data** — vždy WebSearch pro nejnovější stav.
7. **Výstup = jeden validní JSON** ve schématu `data.js` person záznamu. Žádný
   markdown/text mimo JSON. Klíče os, tvar `src` `{p,t,u}` a názvy `category`
   musí přesně odpovídat databázi.

## Fallback stavy

- **Méně než 2 roky v politice / málo dat** — vrať záznam s prázdným `lit`,
  `category` typu `"Hraniční případ"` nebo `"Není zmrd"` a poznámkou v `dictum`
  („omezená data — krátká kariéra"). Nevymýšlej osy.
- **Regionální/senátní kandidát bez národní databáze** — opři se o mediální
  archiv + Hlídač státu; co nedoložíš, nesviť.
- **Manažerské/odborné selhání bez osobního zmrdství** — `"gray": true`,
  `category` `"Manažerské selhání"`, kritizovanou osu nech čistou s kontextem
  v `overrides`.
