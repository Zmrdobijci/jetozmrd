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

      <div className="meth-pillars">
        <div className="meth-pillar">
          <div className="meth-num mono">Pilíř I</div>
          <h2>D-FENS zmrdologie</h2>
          <p>
            Klasická behaviorální taxonomie identifikující základní znaky zmrda. Původně psaná
            pro firemní prostředí, na politiku ovšem sedí překvapivě dobře. Klíčové zjištění
            autora platí beze změny i po dvou dekádách:
          </p>
          <blockquote className="dictum sm">
            <span className="dictum-mark">„</span>
            Zmrd by raději porodil ježka, než by utrpěl porážku.
            <footer className="mono">— D-FENS, 2001</footer>
          </blockquote>
        </div>
        <div className="meth-pillar">
          <div className="meth-num mono">Pilíř II</div>
          <h2>Faktografická databáze</h2>
          <p>
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
        </div>
      </div>

      <section className="meth-dims">
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
      </section>

      <section className="meth-scale">
        <div className="kicker">Kategorizace</div>
        <h2 className="meth-dims-h2">Od „není zmrd" po „učebnicový"</h2>
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
