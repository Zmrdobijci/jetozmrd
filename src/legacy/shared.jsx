/* Sdílené UI: skóre, dimenze, karty osob */
const { DIMENSIONS } = window.ZMRD;

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
      <span className="pcard-portrait portrait" aria-hidden="true">FOTO</span>
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

Object.assign(window, { DimDots, Verdict, ScorePanel, PersonCard });
