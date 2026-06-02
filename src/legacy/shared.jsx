/* Sdílené UI: skóre, dimenze, karty osob, logo strany */
const { DIMENSIONS } = window.ZMRD;

/* ── LOGO STRANY ─────────────────────────────────────────────
   Sdílené napříč pohledy (strany, profil). Normalizace rozházených
   stranických řetězců → kanonická strana; skutečné logo z Wikimedia
   Commons, fallback monogram se značkovou barvou. */
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

/* monogramová „loga" stran — značková barva, kde je ověřená; jinak neutrální tmavá.
   Nejde o oficiální loga (ochranné známky), ale o stylizovaný monogram. */
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
  'Přísaha': 'Přísaha.svg',
  'Trikolora': "Tricolour Citizens' Movement logo.svg",
};

const logoUrl = (f) => 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(f.replace(/ /g, '_')) + '?width=320';

function StranaLogo({ party }) {
  const [err, setErr] = React.useState(false);
  const file = LOGO_FILE[party];
  const b = PARTY_BRAND[party] || { bg: '#2f3540', abbr: (party || '?').slice(0, 3) };
  if (file && !err) {
    return (
      <span className="strana-logo strana-logo-img">
        <img src={logoUrl(file)} alt={party + ' logo'} loading="lazy" onError={() => setErr(true)} />
      </span>
    );
  }
  return <span className="strana-logo" style={{ background: b.bg, color: b.fg || '#fff' }} aria-hidden="true">{b.abbr}</span>;
}

/* malý řádek 6 ikon — rozsvícené = signal */
function DimDots({ dims, size = 18 }) {
  return (
    <div className="dimdots" title="6 dimenzí zmrdství">
      {DIMENSIONS.map((d) => {
        const lit = dims[d.key].lit;
        return (
          <span key={d.key} className={'dimdot' + (lit ? ' lit' : '')} title={d.q + (lit ? ' ANO' : ' ne')}>
            <DimIcon k={d.key} size={size} />
          </span>
        );
      })}
    </div>
  );
}

/* verdiktový štítek */
function Verdict({ person, big }) {
  const label = person.score === null ? '?' : person.score + '/6';
  return (
    <span className={'verdict ' + person.tier} style={big ? { fontSize: 13, padding: '7px 14px' } : null}>
      <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{label}</strong>
      <span style={{ opacity: 0.5 }}>·</span>
      <span>{person.category}</span>
    </span>
  );
}

/* velký skóre panel (detail) — 6 rozsvěcujících dimenzí */
function ScorePanel({ person, onJump }) {
  const isGray = person.score === null;
  return (
    <div className="scorepanel">
      <div className="scorepanel-num">
        <div className={'score-num ' + (isGray ? 'gray' : '')}>
          {isGray ? '?' : person.score}
          {!isGray && <span className="of">/6</span>}
        </div>
        <Verdict person={person} big />
      </div>
      <div className="scorepanel-grid">
        {DIMENSIONS.map((d) => {
          const dim = person.dims[d.key];
          return (
            <button
              key={d.key}
              className={'dimcell' + (dim.lit ? ' lit' : '')}
              onClick={() => onJump && onJump(d.key)}
            >
              <DimIcon k={d.key} size={26} />
              <span className="dimcell-q">{d.q}</span>
              <span className="dimcell-ans">{dim.lit ? 'ANO' : 'ne'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* karta osoby v seznamu / mřížce */
function PersonCard({ person, onOpen, rank }) {
  return (
    <button className="pcard" onClick={() => onOpen(person.id)}>
      {rank != null && <span className="pcard-rank mono">{String(rank).padStart(2, '0')}</span>}
      {person.photo
        ? <img className="pcard-portrait pcard-photo" src={person.photo} alt={person.name} loading="lazy" style={person.photoPos ? { objectPosition: person.photoPos } : null} />
        : <span className="pcard-portrait portrait" aria-hidden="true">FOTO</span>}
      <span className="pcard-body">
        <span className="pcard-top">
          <span className="pcard-name">{person.name}</span>
          <span className="pcard-party mono">{person.party}</span>
        </span>
        <span className="pcard-role">{person.role}</span>
        <DimDots dims={person.dims} size={17} />
      </span>
      <span className="pcard-verdict">
        <span className={'score-num sm ' + person.tier}>
          {person.score === null ? '?' : person.score}<span className="of">/6</span>
        </span>
        <span className={'pcard-cat ' + person.tier}>{person.category}</span>
      </span>
    </button>
  );
}

Object.assign(window, { DimDots, Verdict, ScorePanel, PersonCard, StranaLogo, canonStrana });
