/* STRANY — zazmrdovatění politických stran
   „co pixel, to politik" · barva = naměřené skóre · klik = profil */

/* normalizace rozházených stranických řetězců na kanonické strany */
const STRANY_CANON = [
  ['ANO', ['ano']],
  ['ODS', ['ods']],
  ['SPD', ['spd']],
  ['Piráti', ['pirat']],
  ['STAN', ['stan', 'slk', 'starostov']],
  ['KDU-ČSL', ['kdu']],
  ['TOP 09', ['top 09', 'top09']],
  ['Motoristé sobě', ['motorist']],
  ['Stačilo!/KSČM', ['stacilo', 'kscm']],
  ['SOCDEM/ČSSD', ['socdem', 'cssd', 'spoz']],
  ['Přísaha', ['prisaha']],
  ['SEN 21', ['sen 21', 'sen21']],
  ['Svobodní', ['svobodn']],
  ['Trikolora', ['trikolor']],
  ['Naše Česko', ['nase cesko']],
];

function canonStrana(raw) {
  if (!raw) return 'Nezařazení';
  const full = raw.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const lead = full.split(/[(/]/)[0].trim();
  for (const [name, al] of STRANY_CANON) if (al.some((a) => lead.includes(a))) return name;
  const m = full.match(/(?:za |klub )([^)]*)/);
  if (m) {
    const seg = m[1];
    for (const [name, al] of STRANY_CANON) if (al.some((a) => seg.includes(a))) return name;
  }
  return 'Nezařazení';
}

const TIER_BG = {
  'v-0': 'var(--clean)',
  'v-low': 'oklch(0.58 0.12 75)',
  'v-mid': 'oklch(0.58 0.17 45)',
  'v-high': 'var(--signal)',
  'v-gray': 'var(--ink-faint)',
};

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
        {parties.map((p, i) => (
          <section className="strana-card" key={p.name}>
            <div className="strana-head">
              <span className="strana-rank mono">{String(i + 1).padStart(2, '0')}</span>
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

            <div className="pixelfield">
              {p.members.map((m) => (
                <button
                  key={m.id}
                  className="pixel"
                  style={{ background: TIER_BG[m.tier] || TIER_BG['v-gray'] }}
                  title={m.name + ' — ' + m.score + '/6 · ' + m.category}
                  onClick={() => go('detail', { id: m.id })}
                  aria-label={m.name}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="carto-note mono" style={{ marginTop: 28 }}>
        Zobrazeno {assessed.length} politiků s naměřeným skóre · nehodnocení kandidáti čekají na posudek · zdroj členění: psp.cz, senat.cz
      </p>
    </div>
  );
}

window.StranyView = StranyView;
