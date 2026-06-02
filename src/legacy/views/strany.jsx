/* STRANY — zazmrdovatění politických stran
   „co pixel, to politik" · barva = naměřené skóre · klik = profil */

/* canonStrana + StranaLogo žijí ve shared.jsx (sdílené se profilem) */

const TIER_BG = {
  'v-0': 'var(--clean)',
  'v-low': 'oklch(0.58 0.12 75)',
  'v-mid': 'oklch(0.58 0.17 45)',
  'v-high': 'var(--signal)',
  'v-gray': 'var(--ink-faint)',
};

/* D-FENS stádia zazmrdovatění organizace — „koeficient nasycenosti struktury zmrdy"
   (termín D-FENS, dfens-cz.com) škálovaný průměrným skóre. Texty v dikci D-FENS
   s jeho vlastními pojmy: zmrdí embryo, ovládnutí, „navrch huj vespod fuj", líže kliky. */
const DFENS_STADIA = [
  { min: 0.0, cls: 'v-0', label: 'Imunní organismus',
    text: 'Organizace s funkčními obrannými mechanismy. Kompetence tu poráží intriku a lízání klik se nevyplácí — zmrda struktura vyplivne dřív, než stihne zapustit kořeny.' },
  { min: 0.5, cls: 'v-low', label: 'Zmrdí embryo',
    text: 'Zdravá tkáň s ojedinělým zmrdím embryem. Pár skvrn, žádný vzorec — strukturu drží výkon, ne loajalita, a nákazu zatím izoluje.' },
  { min: 1.5, cls: 'v-low', label: 'První fáze ovládnutí',
    text: 'Koeficient nasycenosti struktury roste. Zmrdi uvnitř operují koordinovaně, tvoří se konglomerát a loajalita k partě začíná v rozhodování přebíjet výkon.' },
  { min: 2.5, cls: 'v-mid', label: 'Systémová nákaza',
    text: 'Struktura prolezlá zmrdy. Organizaci vládne „navrch huj, vespod fuj" — odměňuje se lízání klik, ne výsledek; kdo nehraje, odchází nebo mlčí. Slouží partě, ne svému účelu.' },
  { min: 3.5, cls: 'v-high', label: 'Zmrdokracie',
    text: 'Konglomerát zmrdů ovládl kormidlo. Celá organizace jede jako divadelní představení, deklarovaný účel je kulisa a moc s penězi se přerozdělují mezi své.' },
  { min: 4.5, cls: 'v-high', label: 'Učebnicový konglomerát',
    text: 'Terminální nasycenost struktury. Organizace existuje už jen proto, aby zmrdy živila, kryla a reprodukovala — zmrdobijce by tu ukřižovali. Čistá kultura zmrda dle učebnice.' },
];

function stadiumFor(avg) {
  let s = DFENS_STADIA[0];
  for (const x of DFENS_STADIA) if (avg >= x.min) s = x;
  return s;
}

function czPlural(n, one, few, many) {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}

function StranyView({ go }) {
  const { ALL } = window.ZMRD;

  // jen politici s naměřeným skóre — nehodnocení kandidáti by mřížku zaplavili šedou
  const assessed = React.useMemo(() => ALL.filter((p) => p.score != null), [ALL]);

  const parties = React.useMemo(() => {
    const g = {};
    assessed.forEach((p) => {
      const c = canonStrana(p.party);
      (g[c] = g[c] || []).push(p);
    });
    const arr = Object.entries(g).map(([name, members]) => {
      const total = members.reduce((s, m) => s + m.score, 0);
      const avg = members.length ? total / members.length : 0;
      const hits = members.filter((m) => m.score >= 4).length; // vysoké skóre
      members = members.slice().sort((a, b) => b.score - a.score);
      return { name, members, count: members.length, total, avg, hits };
    });
    // řazení: nejvíc zazmrdovatělé strany nahoře (průměr, pak součet)
    arr.sort((a, b) => b.avg - a.avg || b.total - a.total || b.count - a.count);
    return arr;
  }, [assessed]);

  const maxTotal = Math.max(...parties.map((p) => p.total), 1);

  const [tip, setTip] = React.useState(null); // { m, x, y }
  const showTip = (m, e) => {
    const pad = 16, w = 230, h = 96;
    let x = e.clientX + 18, y = e.clientY - h - 12;
    if (x + w > window.innerWidth - pad) x = e.clientX - w - 18;
    if (y < pad) y = e.clientY + 20;
    setTip({ m, x, y });
  };

  return (
    <div className="view strany-view wrap">
      <header className="page-head">
        <div className="kicker">Zazmrdovatění podle stran</div>
        <h1 className="page-h1">Která strana má nejvíc zmrdů?</h1>
        <p className="page-sub">
          Co pixel, to jeden hodnocený politik. Barva = naměřené skóre (0–6) podle šesti dimenzí.
          Strany řadíme podle <strong>průměrného skóre na politika</strong> — férové srovnání napříč velikostí klubů.
          Klikněte na libovolný pixel a otevře se profil daného politika.
        </p>
      </header>

      <div className="strany-legend">
        <span className="mono">méně zmrd</span>
        <span className="legend-bar">
          <i style={{ background: TIER_BG['v-0'] }} title="0/6 — není zmrd"></i>
          <i style={{ background: TIER_BG['v-low'] }} title="1–2/6"></i>
          <i style={{ background: TIER_BG['v-mid'] }} title="3/6 — hraniční"></i>
          <i style={{ background: TIER_BG['v-high'] }} title="4–6/6 — zmrd"></i>
        </span>
        <span className="mono">víc zmrd</span>
      </div>

      <div className="strany-list">
        {parties.map((p, i) => {
          const st = stadiumFor(p.avg);
          return (
          <section className="strana-card" key={p.name}>
            <div className="strana-head">
              <span className="strana-rank mono">{String(i + 1).padStart(2, '0')}</span>
              <StranaLogo party={p.name} />
              <div className="strana-id">
                <h2 className="strana-name">{p.name}</h2>
                <div className="strana-meta mono">
                  {p.count} {p.count === 1 ? 'politik' : p.count >= 2 && p.count <= 4 ? 'politici' : 'politiků'}
                  {p.hits > 0 && <span className="strana-hits"> · {p.hits}× skóre 4+</span>}
                </div>
              </div>
              <div className="strana-score">
                <span className="strana-avg">
                  {p.count ? p.avg.toFixed(1) : '—'}
                  <span className="of">/6</span>
                </span>
                <span className="strana-avg-label mono">prům. na politika</span>
              </div>
            </div>

            <div className="strana-bar" title={'celkové skóre strany: ' + p.total}>
              <span className="strana-bar-fill" style={{ width: (p.total / maxTotal) * 100 + '%' }}></span>
              <span className="strana-bar-label mono">celkem {p.total} {czPlural(p.total, 'bod', 'body', 'bodů')} zmrdství</span>
            </div>

            <div className={'strana-stadium ' + st.cls}>
              <span className="strana-stadium-tag">
                <span className="strana-stadium-kicker mono">nasycenost zmrdy · D-FENS</span>
                <span className="strana-stadium-label">{st.label}</span>
              </span>
              <span className="strana-stadium-text">{st.text}</span>
            </div>

            <div className="pixelfield">
              {p.members.map((m) => (
                <button
                  key={m.id}
                  className="pixel"
                  style={{ background: TIER_BG[m.tier] || TIER_BG['v-gray'] }}
                  onClick={() => go('detail', { id: m.id })}
                  onMouseEnter={(e) => showTip(m, e)}
                  onMouseMove={(e) => showTip(m, e)}
                  onMouseLeave={() => setTip(null)}
                  aria-label={m.name}
                />
              ))}
            </div>
          </section>
          );
        })}
      </div>

      <p className="carto-note mono" style={{ marginTop: 28 }}>
        Zobrazeno {assessed.length} politiků s naměřeným skóre · nehodnocení kandidáti čekají na posudek · zdroj členění: psp.cz, senat.cz<br />
        Stádia „nasycenosti struktury zmrdy" volně dle zmrdologie D-FENS —{' '}
        <a href="https://dfens-cz.com/zmrdi-i-zasveceni/" target="_blank" rel="noopener noreferrer" className="strany-dfens-link">origoš metodika ↗</a>.
        {' '}Loga stran © příslušné strany; zdroj Wikimedia Commons.
      </p>

      {tip && (
        <div className="pixel-tip" style={{ left: tip.x, top: tip.y }}>
          {tip.m.photo
            ? <img className="pixel-tip-photo" src={tip.m.photo} alt="" loading="lazy" style={tip.m.photoPos ? { objectPosition: tip.m.photoPos } : null} />
            : <span className="pixel-tip-photo pixel-tip-nophoto">FOTO</span>}
          <div className="pixel-tip-body">
            <div className="pixel-tip-name">{tip.m.name}</div>
            <div className="pixel-tip-party mono">{tip.m.party}</div>
            <div className="pixel-tip-verdict">
              <span className={'pixel-tip-score ' + tip.m.tier}>{tip.m.score}<span className="of">/6</span></span>
              <span className={'pixel-tip-cat ' + tip.m.tier}>{tip.m.category}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.StranyView = StranyView;
