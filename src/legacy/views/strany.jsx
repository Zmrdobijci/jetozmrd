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

/* monogramová „loga" stran — značková barva, kde je ověřená; jinak neutrální tmavá.
   fg světlý, není-li uvedeno. Nejde o oficiální loga (ochranné známky), ale o stylizovaný monogram. */
const PARTY_BRAND = {
  'ANO': { bg: '#122a6b', abbr: 'ANO' },
  'ODS': { bg: '#0072ce', abbr: 'ODS' },
  'SPD': { bg: '#1e4488', abbr: 'SPD' },
  'Piráti': { bg: '#111111', abbr: 'Pir' },
  'STAN': { bg: '#2f3540', abbr: 'STAN' },
  'KDU-ČSL': { bg: '#f4c400', fg: '#1a1a1a', abbr: 'KDU' },
  'TOP 09': { bg: '#7a2e6d', abbr: 'TOP' },
  'Motoristé sobě': { bg: '#2f3540', abbr: 'Mot' },
  'Stačilo!/KSČM': { bg: '#d2122e', abbr: 'S!' },
  'SOCDEM/ČSSD': { bg: '#f07d00', abbr: 'SOC' },
  'Přísaha': { bg: '#2f3540', abbr: 'Pří' },
  'SEN 21': { bg: '#2f3540', abbr: 'S21' },
  'Svobodní': { bg: '#2f3540', abbr: 'Svo' },
  'Trikolora': { bg: '#2f3540', abbr: 'Tri' },
  'Naše Česko': { bg: '#2f3540', abbr: 'NČ' },
  'Nezařazení': { bg: '#9a958c', abbr: '—' },
};

/* skutečná loga stran — soubory na Wikimedia Commons (zdroj: Wikidata P154 / Commons).
   Special:FilePath dává stabilní hotlink. Když logo chybí nebo se nenačte → monogram. */
const LOGO_FILE = {
  'ANO': 'ANO Logo.svg',
  'ODS': 'Logo of ODS (2015).svg',
  'SPD': 'Svoboda a přímá demokracie - simple (Czech, 2015).svg',
  'Piráti': 'Logo Pirátů.svg',
  'STAN': 'Logo STAROSTOVÉ.svg',
  'KDU-ČSL': 'KDU-ČSL Logo 1992.svg',
  'TOP 09': 'Logo of the TOP 09 (2021).svg',
  'Motoristé sobě': 'Motoristé sobě logo.svg',
  'Stačilo!/KSČM': 'Stačilo Logo 2026.svg',
  'SOCDEM/ČSSD': 'Logo of the Social Democracy (Czech Republic).svg',
  'SEN 21': 'SEN 21 logo (2024).svg',
  'Svobodní': 'Svobodní 2022.svg',
  'Naše Česko': 'Naše Česko, Martin Kuba, hnutí (logo).png',
  'Přísaha': 'Přísaha 2021.svg',
  'Trikolora': "Tricolour Citizens' Movement logo.svg",
};

const logoUrl = (f) => 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(f.replace(/ /g, '_')) + '?width=320';

function StranaLogo({ party }) {
  const [err, setErr] = React.useState(false);
  const file = LOGO_FILE[party];
  const b = PARTY_BRAND[party] || { bg: '#2f3540', abbr: party.slice(0, 3) };
  if (file && !err) {
    return (
      <span className="strana-logo strana-logo-img">
        <img src={logoUrl(file)} alt={party + ' logo'} loading="lazy" onError={() => setErr(true)} />
      </span>
    );
  }
  return <span className="strana-logo" style={{ background: b.bg, color: b.fg || '#fff' }} aria-hidden="true">{b.abbr}</span>;
}

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
