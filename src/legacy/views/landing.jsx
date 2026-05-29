/* LANDING — manifest v dikci D-FENS */
function Landing({ go, open }) {
  const { ALL } = window.ZMRD;
  const top = ALL.filter((p) => p.score !== null).sort((a, b) => b.score - a.score).slice(0, 4);

  return (
    <div className="view landing">
      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-main">
            <div className="hero-kicker mono">Faktografický zmrdometr · od&nbsp;voličů pro&nbsp;voliče</div>
            <h1 className="hero-h1">
              Je to <em>zmrd</em>?
            </h1>
            <p className="hero-lede">
              Než někoho pošlete do Senátu, vyplatí se vědět, koho tam posíláte.
              Zmrdometr nehodnotí, co politik <em>říká</em>. Hodnotí, co <em>doloženě udělal</em> —
              a každé tvrzení podkládá odkazem na veřejný zdroj.
            </p>
            <div className="hero-cta">
              <button className="btn signal" onClick={() => go('mapa')}>
                Zadat region <Ico k="arrow" size={16} />
              </button>
              <button className="btn ghost" onClick={() => go('hledat')}>
                <Ico k="search" size={16} /> Najít politika
              </button>
            </div>
          </div>

          <aside className="hero-side">
            <button className="medallion-card" onClick={() => open('babis')}>
              <span className="medallion" role="img" aria-label="Andrej Babiš"></span>
              <span className="medallion-badge">5<small>/6</small></span>
              <span className="medallion-cap">
                <span className="medallion-name">Andrej Babiš</span>
                <span className="medallion-cat mono">Systémový zmrd · doloženo 5 z 6</span>
              </span>
            </button>
            <div className="hero-presumption">
              <div className="kicker">Presumpce zmrdometru</div>
              <p className="hero-presumption-big">
                Byl-li zmrdem <span className="u">před</span> úřadem, bude zmrdem
                <span className="u"> po</span> úřadě.
              </p>
              <p className="hero-presumption-note">
                Charakter se mandátem nemění. Proto se nedíváme na sliby a projevy —
                díváme se na chování a hodnoty, které jsou doložené a citovatelné.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* MANIFEST */}
      <section className="manifest">
        <div className="wrap manifest-single">
          <span className="manifest-bar" aria-hidden="true"></span>
          <p className="manifest-lead">
            Dali byste svoji babičku na starost člověku, který lže, krade, hází své
            spolupracovníky přes palubu a křivě přísahá na zdraví svých dětí?
          </p>
          <p className="manifest-sub">
            Ne. A přitom skoro třetině národa nedělá problém takového člověka zvolit
            do čela země.
          </p>
        </div>
      </section>

      {/* JAK TO FUNGUJE */}
      <section className="steps wrap">
        <div className="kicker">Jak to funguje</div>
        <div className="steps-grid">
          {[
            ['01', 'Zadáte region', 'Kliknete na svůj kraj v mapě. Ukážeme senátní kandidáty, které ve svém obvodu reálně volíte.'],
            ['02', 'Změříme 6 dimenzí', 'Lže? Žije z cizích peněz? Chodí do práce? Drží slovo? Chová se toxicky? Je zbabělý?'],
            ['03', 'Doložíme zdroji', 'Každý rozsvícený atribut má odkaz na veřejný zdroj — hlídačstát, Demagog, psp.cz, justice.cz. Žádné dojmy.'],
          ].map(([n, t, d]) => (
            <div className="step" key={n}>
              <div className="step-n mono">{n}</div>
              <h3 className="step-t">{t}</h3>
              <p className="step-d">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BETA ŽEBŘÍČEK NÁHLED */}
      <section className="teaser wrap">
        <div className="teaser-head">
          <div>
            <div className="kicker">Z beta testování</div>
            <h2 className="teaser-h2">Nejvýraznější naměřené hodnoty</h2>
          </div>
          <button className="btn ghost" onClick={() => go('zebricek')}>
            Celý žebříček <Ico k="arrow" size={16} />
          </button>
        </div>
        <div className="teaser-list">
          {top.map((p, i) => (
            <PersonCard key={p.id} person={p} onOpen={open} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="wrap disclaim">
        <p>
          Zmrdometr pracuje výhradně s veřejně dostupnými, citovatelnými fakty.
          Nehodnotí osoby — hodnotí jejich <strong>zdokumentované chování</strong>.
          Není to pomluva, je to datová analýza.
        </p>
        <p className="disclaim-wish">
          Přejeme všem pevnou ruku ve volbách. Ať je zmrdů ve Sněmovně i Senátu co nejméně.
        </p>
      </section>
    </div>
  );
}

Object.assign(window, { Landing });
