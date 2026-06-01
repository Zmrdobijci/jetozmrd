/* METODIKA — D-FENS zmrdologie */
function Metodika({ go }) {
  const { DIMENSIONS } = window.ZMRD;
  const sources = [
    ['hlídačstát.cz', 'dotace, smlouvy, veřejné zakázky, majetková přiznání'],
    ['demagog.cz', 'faktická hodnocení pravdivosti výroků politiků'],
    ['psp.cz', 'docházka a hlasování v Poslanecké sněmovně'],
    ['kohovolit.eu', 'hlasovací historie, postoje, stranické přesuny'],
    ['justice.cz', 'soudní řízení, rejstříky, pravomocná rozhodnutí'],
    ['mediální archiv', 'doložené výroky a doložené kauzy z důvěryhodných médií'],
  ];

  // 10 znaků zmrda podle D-FENS (zdroj: dfens-cz.com, 2001)
  const dfensSigns = [
    ['Rád tlachá', 'Půl hodiny řeči, nula závazku.'],
    ['Vysává cizí zásluhy', 'Přivlastňuje si cizí práci, přebírá agendu.'],
    ['Líže kliky', 'Jiná tvář k nadřízeným než k veřejnosti.'],
    ['Nekonzistentní', 'Reaguje pokaždé jinak podle aktuální výhody.'],
    ['Neumí s lidmi', 'Obklopuje se loajalisty, likviduje kritiky.'],
    ['Hraje tvrdě zezadu', 'Intrikuje, těží z neveřejných informací, omezuje konkurenci.'],
    ['Neudělá nic pořádně', '„Navrch huj, vespod fuj" — výsledky chybí.'],
    ['Dbá na image', 'Sleduje, co je „in", pozici mění podle trendů.'],
    ['Hraje na body', 'Potřebuje rozdrcení soupeře, ne řešení problému.'],
    ['Kolektivní', 'Tvoří konglomeráty zmrdů — účelová spojenectví.'],
  ];

  // Stádia zazmrdovatění organizace — „koeficient nasycenosti struktury zmrdy" (D-FENS)
  const orgStadia = [
    ['Ø 0–0.5', 'Imunní organismus', 'v-0', 'Funkční obranné mechanismy. Kompetence poráží intriku, lízání klik se nevyplácí — zmrda struktura vyplivne dřív, než zapustí kořeny.'],
    ['Ø 0.5–1.5', 'Zmrdí embryo', 'v-low', 'Zdravá tkáň s ojedinělým zmrdím embryem. Pár skvrn, žádný vzorec — strukturu drží výkon, ne loajalita.'],
    ['Ø 1.5–2.5', 'První fáze ovládnutí', 'v-low', 'Koeficient nasycenosti roste. Zmrdi operují koordinovaně, tvoří konglomerát a loajalita k partě začíná přebíjet výkon.'],
    ['Ø 2.5–3.5', 'Systémová nákaza', 'v-mid', 'Struktura prolezlá zmrdy. Vládne „navrch huj, vespod fuj" — odměňuje se lízání klik, ne výsledek. Organizace slouží partě, ne účelu.'],
    ['Ø 3.5–4.5', 'Zmrdokracie', 'v-high', 'Konglomerát zmrdů ovládl kormidlo. Celá organizace jede jako divadelní představení, deklarovaný účel je kulisa.'],
    ['Ø 4.5–6', 'Učebnicový konglomerát', 'v-high', 'Terminální nasycenost. Organizace existuje, aby zmrdy živila, kryla a reprodukovala. Zmrdobijce by tu ukřižovali.'],
  ];

  return (
    <div className="view metodika wrap">
      <header className="page-head">
        <div className="kicker">Metodika</div>
        <h1 className="page-h1">Zmrdologie pro voliče</h1>
        <p className="page-sub">
          Zmrdometr stojí na dvou pilířích: na klasické české behaviorální analýze
          (D-FENS, 2001) a na veřejných, citovatelných datech. Ideologii neměří. Měří chování.
        </p>
      </header>

      <section className="meth-skill-top">
        <div className="meth-skill-top-body">
          <div className="meth-num mono">Reprodukovatelnost</div>
          <h2>Záznamy generuje AI podle skillu</h2>
          <p>
            Profily v databázi nesepisuje redakce ručně — generuje je AI (Claude) podle přesně
            definovaného zadání, tzv. <em>skillu</em>: jen doložitelná fakta, šest os zmrdství,
            D-FENS taxonomie jako druhý filtr a u každé rozsvícené osy citovatelný zdroj.
          </p>
          <p>
            Skill zveřejňujeme schválně — postup má být auditovatelný a reprodukovatelný.
            Stáhni si ho a ověř, podle jakých pravidel záznam vznikl.
          </p>
        </div>
        <div className="meth-skill-top-cta">
          <a className="btn signal meth-ai-dl" href="zmrdobijci-skill.md" download="zmrdobijci-skill.md">
            Stáhnout skill (SKILL.md) <Ico k="download" size={16} />
          </a>
        </div>
      </section>

      <section className="meth-dims meth-dims-top">
        <div className="kicker">Měřicí osy</div>
        <h2 className="meth-dims-h2">Šest dimenzí zmrdství</h2>
        <p className="meth-dims-sub">Skóre = počet os, u kterých existuje doložený nález. 0 čisté, 6 učebnicové.</p>
        <div className="meth-dims-grid">
          {DIMENSIONS.map((d, i) => (
            <div className="meth-dim" key={d.key}>
              <div className="meth-dim-ico"><DimIcon k={d.key} size={28} /></div>
              <div className="meth-dim-n mono">{String(i + 1).padStart(2, '0')}</div>
              <h3>{d.q}</h3>
              <p>{d.hint}</p>
            </div>
          ))}
        </div>
        <p className="meth-dims-note">
          Osu toxicity kalibrujeme i proti <strong>Dignity Indexu</strong>{' '}
          (<a href="https://www.dignity.us/index" target="_blank" rel="noopener noreferrer">dignity.us</a>) —
          škále míry kontemptu vs. důstojnosti ve veřejném projevu. Ukazuje, že toxicita není měřena „od oka".
        </p>
      </section>

      <div className="meth-pillars">
        <div className="meth-pillar">
          <div className="meth-num mono">Pilíř I</div>
          <h2>D-FENS zmrdologie</h2>
          <p>
            Klasická behaviorální taxonomie identifikující základní znaky zmrda. Původně psaná
            pro firemní prostředí, na politiku ovšem sedí překvapivě dobře. Klíčové zjištění
            autora platí beze změny i po dvou dekádách:
          </p>
          <div className="meth-quotes">
            <blockquote className="dictum sm">
              <span className="dictum-mark">„</span>
              Zmrd by raději porodil ježka, než by utrpěl porážku.
            </blockquote>
            <blockquote className="dictum sm">
              <span className="dictum-mark">„</span>
              Zmrd nikdy neudělá chybu. Chybu vždycky udělal někdo jiný, kdo mu nestihl uhnout.
            </blockquote>
            <blockquote className="dictum sm">
              <span className="dictum-mark">„</span>
              Poznáš ho podle toho, že čím výš stoupá, tím za míň věcí je odpovědný.
            </blockquote>
            <blockquote className="dictum sm">
              <span className="dictum-mark">„</span>
              Navrch huj, vespod fuj. Práce žádná, ega na rozdávání.
            </blockquote>
          </div>
          <a className="meth-blog mono" href="https://www.dfens-cz.com/" target="_blank" rel="noopener noreferrer">
            Číst D-FENS na dfens-cz.com <Ico k="ext" size={14} />
          </a>
        </div>
        <div className="meth-pillar meth-pillar-scale">
          <div className="meth-num mono">Kategorizace</div>
          <h2>Od „není zmrd" po „učebnicový"</h2>
          <div className="scale-rows">
            {[
              ['0/6', 'Není zmrd', 'v-0', 'Čistý štít. Slabé vedení sem nepatří — to není zmrdství.'],
              ['1/6', 'Jedna skvrna', 'v-low', 'Jeden doložený prohřešek. Jinak v pořádku.'],
              ['2–3/6', 'Hraniční případ', 'v-mid', 'Začíná svítit. Volič by měl zpozornět.'],
              ['4/6', 'Plnokrevný zmrd', 'v-high', 'Většina os svítí. Vzorec, ne náhoda.'],
              ['5–6/6', 'Systémový / učebnicový', 'v-high', 'Zmrdství jako metoda. D-FENS by uronil slzu hrdosti.'],
            ].map(([s, t, cls, d]) => (
              <div className="scale-row" key={t}>
                <span className={'verdict ' + cls}><strong>{s}</strong></span>
                <span className="scale-t">{t}</span>
                <span className="scale-d">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="meth-databaze">
        <div className="kicker">Pilíř II · data</div>
        <h2 className="meth-dims-h2">Faktografická databáze</h2>
        <p className="meth-dims-sub">
          Vše veřejné, vše dohledatelné, vše citovatelné. Žádný výrok zmrdometru nestojí na
          dojmu — každá rozsvícená dimenze má v profilu odkaz na zdroj.
        </p>
        <div className="meth-sources">
          {sources.map(([s, d]) => (
            <div className="meth-source" key={s}>
              <span className="meth-source-name mono">{s}</span>
              <span className="meth-source-d">{d}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="meth-dfens-signs">
        <div className="kicker">D-FENS · jak poznáš zmrda</div>
        <h2 className="meth-dims-h2">Deset znaků podle D-FENS</h2>
        <p className="meth-dims-sub">
          Originální taxonomie z roku 2001 popisuje, podle čeho zmrda poznáš v reálu.
          Šest měřitelných os výše je její citovatelnou destilací — tady je úplná předloha.
        </p>
        <ol className="dfens-signs">
          {dfensSigns.map(([label, desc], i) => (
            <li className="dfens-sign" key={label}>
              <span className="dfens-sign-n mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="dfens-sign-body">
                <strong>{label}</strong>
                <span className="dfens-sign-d">{desc}</span>
              </span>
            </li>
          ))}
        </ol>
        <a className="meth-blog mono" href="https://www.dfens-cz.com/" target="_blank" rel="noopener noreferrer">
          Zdroj: D-FENS, „Jak poznáte zmrda" · dfens-cz.com, 2001 <Ico k="ext" size={14} />
        </a>
      </section>

      <section className="meth-dfens-signs meth-org">
        <div className="kicker">D-FENS · zmrd v organizaci</div>
        <h2 className="meth-dims-h2">Zazmrdovatění celé organizace</h2>
        <p className="meth-dims-sub">
          Zmrdství se nezastaví u jednotlivce. D-FENS popisuje, jak zmrd organizaci infiltruje
          a postupně nasytí — měří to <strong>„koeficientem nasycenosti struktury zmrdy"</strong>.
          Tutéž optiku přikládáme na politické strany: průměrné skóre na politika určuje stádium,
          v němž se strana jako organismus nachází.
        </p>
        <div className="meth-org-list">
          {orgStadia.map(([band, label, cls, desc], i) => (
            <div className={'meth-org-stadium ' + cls} key={label}>
              <div className="meth-org-stadium-head">
                <span className="meth-org-step mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="meth-org-label">{label}</span>
                <span className="meth-org-band mono">{band}</span>
              </div>
              <p className="meth-org-desc">{desc}</p>
            </div>
          ))}
        </div>
        <a className="meth-blog mono" href="https://dfens-cz.com/zmrdi-iii-infiltracni-prirucka/" target="_blank" rel="noopener noreferrer">
          Origoš metodika: D-FENS, „Zmrdi III — Infiltrační příručka" · dfens-cz.com <Ico k="ext" size={14} />
        </a>
        <div className="meth-org-cta">
          <button className="btn" onClick={() => go('strany')}>Měření stran podle stádia <Ico k="arrow" size={16} /></button>
        </div>
      </section>

      <section className="meth-legal">
        <div className="kicker">Právní upozornění</div>
        <p>
          Zmrdometr pracuje výhradně s veřejně dostupnými, citovatelnými fakty. Nehodnotí osoby,
          hodnotí jejich zdokumentované chování. Tento přístup je v souladu s českou judikaturou
          o přípustné kritice veřejně činných osob.
        </p>
        <p className="mono meth-legal-sign">Jinými slovy: není to pomluva, je to datová analýza. D-FENS by byl hrdý.</p>
      </section>

      <div className="meth-cta">
        <button className="btn signal" onClick={() => go('mapa')}>Změřit své kandidáty <Ico k="arrow" size={16} /></button>
      </div>
    </div>
  );
}

Object.assign(window, { Metodika });
