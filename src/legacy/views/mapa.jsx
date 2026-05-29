/* MAPA — skutečná mapa ČR: kraje + body senátních obvodů (volby 2026) */
function MapaView({ go, selected, setSelected }) {
  const { OBVODY, obvodById, candidatesForObvod, obvodHeat, krajHeat } = window.ZMRD;
  const MAP = window.CZ_MAP;
  const ob = selected ? obvodById[selected] : null;
  const cands = ob ? candidatesForObvod(ob.num) : [];

  const regFill = (h) => (h === 0 ? 'var(--paper-2)' : 'color-mix(in oklch, var(--signal) ' + (7 + h * 7) + '%, var(--paper-2))');
  const dotFill = (h) => (h === 0 ? 'var(--clean)' : 'color-mix(in oklch, var(--signal) ' + (34 + h * 13) + '%, var(--paper))');

  return (
    <div className="view mapview wrap">
      <header className="page-head">
        <div className="kicker">Krok 1 · vyberte svůj obvod</div>
        <h1 className="page-h1">Kdo se uchází o váš hlas do Senátu?</h1>
        <p className="page-sub">
          V roce 2026 se volí ve 27 senátních obvodech (čísla dělitelná třemi), 9.–10. října.
          Klikněte na puntík svého obvodu — barva = nejvyšší naměřené skóre tamních kandidátů.
        </p>
      </header>

      <div className="mapwrap">
        {/* skutečná mapa ČR */}
        <div className="cartogram">
          <svg className="czmap" viewBox={MAP.viewBox} role="img" aria-label="Mapa České republiky se senátními obvody">
            <g className="czmap-regions">
              {MAP.regions.map((r) => (
                <path key={r.id} d={r.d} className="region" style={{ fill: regFill(krajHeat(r.name)) }}>
                  <title>{r.name} kraj</title>
                </path>
              ))}
            </g>
            <g className="czmap-dots">
              {OBVODY.map((o) => {
                const h = obvodHeat(o.num);
                const sel = selected === o.num;
                return (
                  <g key={o.num} className={'dot' + (sel ? ' sel' : '')} onClick={() => setSelected(o.num)}>
                    <title>{'obvod č. ' + o.num + ' — ' + o.city}</title>
                    <circle cx={o.x} cy={o.y} r={sel ? 5.6 : 4.2} className="dot-c" style={{ fill: dotFill(h) }} />
                    <text x={o.x} y={o.y} className="dot-t">{o.num}</text>
                  </g>
                );
              })}
            </g>
          </svg>
          <div className="carto-legend">
            <span className="mono">méně zmrdů</span>
            <span className="legend-bar">
              <i style={{ background: dotFill(0) }}></i><i style={{ background: dotFill(1) }}></i>
              <i style={{ background: dotFill(2) }}></i><i style={{ background: dotFill(3) }}></i>
              <i style={{ background: dotFill(4) }}></i><i style={{ background: dotFill(5) }}></i>
            </span>
            <span className="mono">víc zmrdů</span>
          </div>
          <p className="carto-note mono">27 z 81 obvodů · obrysy krajů orientační · zdroj členění: senat.cz</p>
        </div>

        {/* panel kandidátů */}
        <aside className={'candpanel' + (ob ? ' active' : '')}>
          {!ob &&
            <div className="candpanel-empty">
              <Ico k="pin" size={30} />
              <p>Klikněte na puntík obvodu v mapě a uvidíte své senátní kandidáty.</p>
            </div>
          }
          {ob &&
            <React.Fragment>
              <div className="candpanel-head">
                <div className="kicker">{ob.kraj} kraj</div>
                <h2 className="candpanel-obvod">
                  <span className="candpanel-num mono">č. {ob.num}</span> {ob.city}
                </h2>
                <p className="candpanel-meta mono">{cands.length} kandidátů · řazeno od nejvyššího skóre</p>
              </div>
              <div className="candlist">
                {cands.map((p) =>
                  <PersonCard key={p.id} person={p} onOpen={(id) => go('detail', { id })} />
                )}
              </div>
              <p className="candpanel-foot">
                Skóre je počet doložených dimenzí zmrdství. Detail a zdroje otevřete kliknutím na kandidáta.
              </p>
            </React.Fragment>
          }
        </aside>
      </div>
    </div>);
}

Object.assign(window, { MapaView });
