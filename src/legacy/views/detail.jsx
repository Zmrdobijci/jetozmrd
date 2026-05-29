/* DETAIL — profil politika: 6 dimenzí + skóre + citace */
function Detail({ go, id }) {
  const { byId, DIMENSIONS } = window.ZMRD;
  const p = byId[id];
  if (!p) return <div className="view wrap"><p>Profil nenalezen.</p></div>;

  const jump = (k) => {
    const el = document.getElementById('dim-' + k);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };

  const litDims = DIMENSIONS.filter((d) => p.dims[d.key].lit);
  const cleanDims = DIMENSIONS.filter((d) => !p.dims[d.key].lit);

  return (
    <div className="view detail wrap">
      <button className="backlink mono" onClick={() => go('back')}>
        <Ico k="back" size={16} /> zpět
      </button>

      <div className="detail-grid">
        {/* LEVÝ SLOUPEC — identita + skóre */}
        <div className="detail-left">
          <div className="detail-id">
            {p.photo
              ? <img className="detail-portrait detail-photo" src={p.photo} alt={p.name} style={p.photoPos ? { objectPosition: p.photoPos } : null} />
              : <span className="detail-portrait portrait" aria-hidden="true">FOTO<br />politika</span>}
            <div>
              <div className="detail-party mono">{p.party} · {p.scope === 'senát' ? 'kandidát do Senátu' : p.role}</div>
              <h1 className="detail-name">{p.name}</h1>
              {p.scope !== 'senát' && <div className="detail-role">{p.role}</div>}
            </div>
          </div>

          <ScorePanel person={p} onJump={jump} />

          {p.dictum && (
            <blockquote className="dictum">
              <span className="dictum-mark">„</span>
              {p.dictum}
              <footer className="mono">— zmrdometr / dle D-FENS zmrdologie</footer>
            </blockquote>
          )}
        </div>

        {/* PRAVÝ SLOUPEC — nálezy */}
        <div className="detail-right">
          {litDims.length > 0 ? (
            <React.Fragment>
              <div className="findings-head">
                <div className="kicker">Doložené nálezy · {litDims.length} z 6</div>
                <h2 className="findings-h2">Co svítí a proč</h2>
              </div>
              {litDims.map((d) => {
                const dim = p.dims[d.key];
                return (
                  <div className="finding lit" id={'dim-' + d.key} key={d.key}>
                    <div className="finding-icon"><DimIcon k={d.key} size={24} /></div>
                    <div className="finding-body">
                      <div className="finding-top">
                        <h3 className="finding-q">{d.q}</h3>
                        <span className="finding-flag mono">ANO</span>
                      </div>
                      <p className="finding-text">{dim.finding}</p>
                      <div className="sources">
                        <span className="sources-label mono">Zdroje:</span>
                        {dim.sources.map((s, i) => (
                          <a className="source" key={i} href={s.u} target="_blank" rel="noopener noreferrer">
                            <Ico k="doc" size={14} />
                            <span className="source-pub mono">{s.p}</span>
                            <span className="source-t">{s.t}</span>
                            <Ico k="ext" size={13} />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ) : (
            <div className="clean-banner">
              <Ico k="check" size={22} />
              <div>
                <h2 className="findings-h2">Žádný doložený nález</h2>
                <p>{p.dictum || 'Zmrdometr nenašel ani jednu rozsvícenou dimenzi. To z nikoho nedělá světce — jen to znamená, že není zmrd.'}</p>
              </div>
            </div>
          )}

          {/* čisté osy */}
          {cleanDims.length > 0 && (
            <div className="clean-list">
              <div className="kicker">Čisté osy · {cleanDims.length} z 6</div>
              <div className="clean-grid">
                {cleanDims.map((d) => (
                  <div className="clean-item" key={d.key}>
                    <DimIcon k={d.key} size={18} />
                    <span>{d.q}</span>
                    <span className="clean-ok mono">ne</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {p.gallery && p.gallery.length > 0 && (
            <div className="gallery">
              <div className="kicker">Z archivu · doloženo objektivem</div>
              <div className="gallery-grid">
                {p.gallery.map((g, i) => (
                  <figure className="gallery-item" key={i}>
                    <img src={g.img} alt={g.caption} loading="lazy" />
                    <figcaption className="mono">{g.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Detail });
