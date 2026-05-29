---
name: zmrdobijci
allowed-tools: web_search, web_fetch
description: >
  Politická faktografie českých politiků. Strukturované vyhledávání a prezentace
  ověřených faktů o českých politicích — kauzy, rozsudky, hlasování, majetková
  přiznání, docházka, konzistence výroků. Výstup je VŽDY validní JSON objekt
  (žádný text mimo JSON) — pouze fakta s citacemi, bez hodnotových soudů.
  Použij tento skill kdykoliv dostaneš dotaz jako:
  "co víš o [politik]", "prověř [politik]", "fakta o [politik]", "jak hlasoval [politik]",
  "kauzy [politik]", "majetková přiznání [politik]", nebo jakýkoliv dotaz vyžadující
  faktografický profil českého politika.
---

# Politická Faktografie — Postup

## Datové zdroje (v tomto pořadí priority)

| Zdroj | Co hledáš | URL |
|-------|-----------|-----|
| **kohonevolit.cz** | Kauzy, hodnocení, zdroje | `kohonevolit.cz/kauzy?search=[jméno]` |
| **hlasovani.psp.cz** | Jak hlasoval v PSP | `psp.cz/sqw/hl.sqw?o=[období]&id=[id]` |
| **hlidacstatu.cz** | Dotace, zakázky, majetek, funkce | `hlidacstatu.cz/osoba/[slug]` |
| **demagog.cz** | Ověřené výroky — pravda/lež/zavádějící | `demagog.cz/politici/[slug]` |
| **manipulatori.cz** | Ověřování dezinformací, hoaxů a manipulací | `manipulatori.cz` (web_search `[jméno] manipulatori.cz`) |
| **justice.cz** | Rozsudky, trestní řízení | web_search `[jméno] rozsudek justice.cz` |
| **rekonstrukcestatu.cz** | Korupční indexy, střety zájmů | web_search |
| **web_search** | Aktuální kauzy, mediální výstupy | vždy jako doplněk |

## Postup pro každý dotaz

### 1. Identifikace osoby
- Celé jméno, funkce, strana, období působení
- Pokud nejasné — upřesnit před vyhledáváním

### 2. Paralelní vyhledávání (všechny zdroje najednou)
Vyhledej vždy minimálně:
- `[jméno] kauzy skandály` — aktuální mediální výstupy
- `[jméno] kohonevolit` — databáze kauz
- `[jméno] demagog` — ověřené výroky
- `[jméno] hlídač státu` — veřejné funkce, dotace
- `[jméno] hlasování sněmovna` — pokud byl/je poslanec

### 3. Výstupní formát — VŽDY JSON

**Výstup je vždy jeden validní JSON objekt a nic jiného.** Žádný úvodní text, žádný markdown, žádné komentáře mimo JSON, žádné code fences. Pokud klient čeká text, JSON je jediný obsah odpovědi.

#### Pravidla pro JSON
- Kódování UTF-8, diakritika přímo (ne `\u` escapy).
- Každý faktický záznam je objekt s polem `zdroje` (pole stringů — URL nebo název zdroje). Záznam bez zdroje se neuvádí.
- Chybějící data: hodnota `null`, nikdy vymyšlená hodnota.
- Nerelevantní dimenze (např. hlasování u nepolance): `"status": "neaplikovatelné"` a prázdné pole `polozky`.
- Datumy ve formátu `YYYY-MM-DD`, období jako string (`"2017–2021"`).
- Žádná hodnotící adjektiva v hodnotách (viz Kritická pravidla).

#### Schéma výstupu

```json
{
  "osoba": {
    "cele_jmeno": "string",
    "funkce": "string|null",
    "strana": "string|null",
    "obdobi_pusobeni": "string|null"
  },
  "logika_razeni": "kdo to je → odkud má moc a peníze → co s penězi dělá → co dělá v politice → jak je důvěryhodný a jaké má kauzy",
  "dimenze": {
    "1_vzdelani_a_profesni_draha": {
      "status": "ok|neaplikovatelne|bez_dat",
      "polozky": [
        { "polozka": "Dosažené vzdělání / tituly", "detail": "string|null", "obdobi": "string|null", "zdroje": [] },
        { "polozka": "Profesní dráha před vstupem do politiky", "detail": "string|null", "obdobi": "string|null", "zdroje": [] },
        { "polozka": "Zpochybnění / odebrání titulu", "detail": "string|null", "obdobi": "string|null", "zdroje": [] }
      ]
    },
    "2_lustrace_a_minulost_pred_1989": {
      "status": "ok|neaplikovatelne|bez_dat",
      "poznamka": "Evidence ve svazku StB je registrační údaj, NE důkaz vědomé spolupráce. Kategorii uváděj doslovně dle ABS (kandidát spolupráce / důvěrník / agent…). Formulace 'evidován ve svazku kategorie X dle ABS', nikdy 'byl agent StB'. Respektuj soudní rozhodnutí ve prospěch lustrovaného. Členství v KSČ jen kde doloženo — jednotný veřejný registr neexistuje.",
      "polozky": [
        { "polozka": "Členství v KSČ", "detail": "string|null", "zdroje": [] },
        { "polozka": "Evidence ve svazcích StB (kategorie)", "detail": "string|null", "zdroje": [] }
      ]
    },
    "3_ekonomicka_aktivita": {
      "status": "ok|neaplikovatelne|bez_dat",
      "polozky": [
        { "polozka": "Podnikání / firmy (vlastnictví, statutární funkce)", "detail": "string|null", "obdobi": "string|null", "zdroje": [] },
        { "polozka": "Veřejné funkce (volené i jmenované)", "detail": "string|null", "obdobi": "string|null", "zdroje": [] },
        { "polozka": "Členství v dozorčích / správních radách", "detail": "string|null", "obdobi": "string|null", "zdroje": [] },
        { "polozka": "Souběh podnikání a veřejné funkce", "detail": "string|null", "obdobi": "string|null", "zdroje": [] }
      ]
    },
    "4_majetkova_priznani_a_strety_zajmu": {
      "status": "ok|neaplikovatelne|bez_dat",
      "polozky": [
        { "polozka": "string", "detail": "string|null", "zdroje": [] }
      ]
    },
    "5_financovani_kampani_a_sponzori": {
      "status": "ok|neaplikovatelne|bez_dat",
      "polozky": [
        { "polozka": "Transparentní účet kampaně", "hodnota": "string|null", "zdroje": [] },
        { "polozka": "Hlavní sponzoři / dárci", "hodnota": "string|null", "zdroje": [] },
        { "polozka": "Napojení na lobbisty", "hodnota": "string|null", "zdroje": [] }
      ]
    },
    "6_medialni_a_vlastnicke_vazby": {
      "status": "ok|neaplikovatelne|bez_dat",
      "polozky": [
        { "polozka": "Vlastnictví / ovládání média", "detail": "string|null", "zdroje": [] },
        { "polozka": "Vazby na vydavatele", "detail": "string|null", "zdroje": [] },
        { "polozka": "Střet zájmů dle zákona (lex Babiš)", "detail": "string|null", "zdroje": [] }
      ]
    },
    "7_financni_toky_dotace_zakazky": {
      "status": "ok|neaplikovatelne|bez_dat",
      "polozky": [
        { "polozka": "string", "hodnota": "string|null", "prijemce": "string|null", "zdroje": [] }
      ]
    },
    "8_dobrocinna_cinnost": {
      "status": "ok|neaplikovatelne|bez_dat",
      "polozky": [
        { "polozka": "Dary / sponzoring (nadace, charita)", "detail": "string|null", "obdobi": "string|null", "zdroje": [] },
        { "polozka": "Vlastní nadace nebo nadační fond", "detail": "string|null", "obdobi": "string|null", "zdroje": [] },
        { "polozka": "Veřejně doložené dobrovolnictví / pro bono", "detail": "string|null", "obdobi": "string|null", "zdroje": [] }
      ]
    },
    "9_hlasovani_vs_retorika": {
      "status": "ok|neaplikovatelne|bez_dat",
      "polozky": [
        { "tema": "string", "co_rikal": "string|null", "jak_hlasoval": "string|null", "konzistentni": "ano|ne|nelze_urcit", "zdroje": [] }
      ]
    },
    "10_dochazka_a_aktivita": {
      "status": "ok|neaplikovatelne|bez_dat",
      "polozky": [
        { "metrika": "Docházka na hlasování (%)", "hodnota": "string|null", "zdroje": [] },
        { "metrika": "Počet předložených zákonů", "hodnota": "string|null", "zdroje": [] },
        { "metrika": "Počet interpelací", "hodnota": "string|null", "zdroje": [] }
      ]
    },
    "11_legislativni_stopa_a_vysledky": {
      "status": "ok|neaplikovatelne|bez_dat",
      "polozky": [
        { "navrh_zakon": "string", "stav": "string|null", "realny_dopad_dolozeny": "string|null", "zdroje": [] }
      ]
    },
    "12_zahranicni_vazby_a_cesty": {
      "status": "ok|neaplikovatelne|bez_dat",
      "polozky": [
        { "polozka": "Financované zahraniční cesty", "detail": "string|null", "zdroje": [] },
        { "polozka": "Čestné funkce v zahraničí", "detail": "string|null", "zdroje": [] },
        { "polozka": "Vazby na zahraniční subjekty", "detail": "string|null", "zdroje": [] }
      ]
    },
    "13_konzistence_vyroku": {
      "status": "ok|neaplikovatelne|bez_dat",
      "polozky": [
        { "vyrok": "string", "kdy": "string|null", "pozdejsi_realita": "string|null", "hodnoceni_zdroje": "string|null", "zdroje": [] }
      ]
    },
    "14_kauzy_a_pravni_rizeni": {
      "status": "ok|neaplikovatelne|bez_dat",
      "polozky": [
        { "kauza": "string", "stav": "obviněn|obžalován|odsouzen|pravomocně odsouzen|zproštěn|jiné", "vysledek": "string|null", "zdroje": [] }
      ]
    }
  },
  "datova_kvalita": {
    "pokryti": [
      { "dimenze": "string", "ma_data": true, "poznamka": "string|null" }
    ],
    "mezery": ["string"],
    "stav_ke_dni": "YYYY-MM-DD"
  }
}
```

**Logika řazení dimenzí:** kdo to je → odkud má moc a peníze → co s penězi dělá → co dělá v politice → jak je důvěryhodný a jaké má kauzy. Bloky: A. Původ a profil (1–3) · B. Peníze a vazby/vstup (4–6) · C. Peníze a benefity/výstup (7–8) · D. Politická činnost (9–12) · E. Integrita a důvěryhodnost (13–14).

---

## D-FENS Zmrdologie — Taxonomie (zdroj: dfens-cz.com, 2001)

D-FENS definoval zmrda jako jedince s přebujelým egem, který se snaží dostat tam kam nepatří pomocí lidsky nepřijatelných metod. Původně firemní kontext, aplikovatelné na politiku.

### 10 základních znaků zmrda (D-FENS)

| # | Znak | Politická manifestace |
|---|------|-----------------------|
| 1 | **Rád tlachá** | Půl hodiny řeči, nula obsahu. Výroky bez konkrétního závazku. |
| 2 | **Vysává** | Přivlastňuje si cizí zásluhy, přebírá agendu jiných. |
| 3 | **Líže kliky** | Jiné chování k nadřízeným (EU, Babiš) vs. veřejnosti. |
| 4 | **Nekonzistentní** | Na stejnou situaci reaguje pokaždé jinak podle aktuální výhody. |
| 5 | **Neumí zacházet s lidmi** | Obklopuje se loajalisty, likviduje kritiky. |
| 6 | **Hraje tvrdě a dává rány zezadu** | Intrikuje, omezuje přístup k informacím konkurentům. |
| 7 | **Neudělá nic pořádně** | "Navrch huj, vespod fuj" — výsledky neexistují nebo jsou Augiášovy chlévy. |
| 8 | **Hodně dbá na image** | Sleduje co je "in", rychle mění pozici podle trendů. |
| 9 | **Hraje na body** | Potřebuje absolutní rozdrcení soupeře, ne řešení problému. |
| 10 | **Kolektivní** | Tvoří konglomeráty zmrdů — spojenectví čistě účelová. |

### Fáze zazmrdování instituce (D-FENS)
- **Fáze 1** — izolovaní zmrdi na nižších pozicích, ještě nezorganizovaní → zasáhnout ihned
- **Fáze 2** — zmrdi dosáhli stejné úrovně, začínají se shlukovat → závažný stav
- **Fáze 3** — zmrdi ovládli vedení → prakticky neléčitelné zevnitř

### Aplikace na politický kontext
D-FENSova definice vznikla pro firemní prostředí. Při aplikaci na politiky:
- "Nadřízený" = volič, média, koaliční partner, EU
- "Firma" = strana, ministerstvo, sněmovna
- "Projekt" = zákon, reforma, vládní program
- Bodovací systém = průzkumy, hlasování, mediální prostor

---

## Kritická pravidla

1. **Pouze ověřitelná fakta** — každý řádek musí mít zdroj
2. **Žádné inference** — nepsat co z toho vyplývá, pouze co je
3. **Rozlišuj stav řízení** — obviněn ≠ obžalován ≠ odsouzen ≠ pravomocně odsouzen
4. **Datová mezera je validní výsledek** — "nedostatek dat" je lepší než vymyšlené skóre
5. **Žádné hodnotové soudy** — bez adjektiv jako "skandální", "záhadný", "podezřelý"
6. **Aktuální data** — vždy web_search pro nejnovější stav, ne jen z paměti
7. **Výstup vždy validní JSON** — jeden JSON objekt dle schématu, žádný text/markdown mimo něj, chybějící hodnoty jako `null`

## Fallback stavy

- **Méně než 2 roky v politice:** profil s poznámkou "omezená data — krátká kariéra"
- **Regionální politik bez národní databáze:** pouze mediální výstupy + hlídačstát
- **Historický politik (neaktivní 5+ let):** označit jako archivní profil
