/* HLEDAT — vyhledávání a procházení všech politiků */
function Hledat({ go, query, setQuery }) {
  const { ALL, EGGS } = window.ZMRD;
  const [filter, setFilter] = React.useState('vse');

  const q = (query || '').trim().toLowerCase();
  const egg = q && EGGS[q.replace(/\s+/g, '')] ? EGGS[q.replace(/\s+/g, '')] : null;

  let list = ALL.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q) && !p.party.toLowerCase().includes(q)) return false;
    if (filter === 'zmrdi') return p.score !== null && p.score >= 3;
    if (filter === 'cisti') return p.score === 0;
    if (filter === 'senat') return p.scope === 'senát';
    return true;
  });
  list = list.sort((a, b) => (b.score === null ? -1 : b.score) - (a.score === null ? -1 : a.score));

  const filters = [['vse', 'Vše'], ['zmrdi', 'Zmrdi (3+)'], ['cisti', 'Čistí (0)'], ['senat', 'Senát']];

  return (
    <div className="view hledat wrap">
      <header className="page-head">
        <div className="kicker">Vyhledávání</div>
        <h1 className="page-h1">Najděte si svého politika</h1>
        <p className="page-sub">Zadejte jméno nebo stranu. Prohledává headlinery i senátní kandidáty.</p>
      </header>

      <div className="search-big">
        <Ico k="search" size={20} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Babiš, Turek, ANO, STAN…"
          autoFocus
        />
        {query && <button className="search-clear" onClick={() => setQuery('')}><Ico k="close" size={16} /></button>}
      </div>

      <div className="filterbar">
        {filters.map(([k, l]) => (
          <button key={k} className={'chip' + (filter === k ? ' on' : '')} onClick={() => setFilter(k)}>{l}</button>
        ))}
        <span className="filterbar-count mono">{list.length} výsledků</span>
      </div>

      {egg && (
        <div className="egg">
          <strong>{egg.name}</strong>
          <p>{egg.msg}</p>
        </div>
      )}

      <div className="reslist">
        {list.length === 0 && !egg && (
          <p className="noresults mono">Nic. Buď je čistý jako lilie, nebo ho ještě nemáme v databázi.</p>
        )}
        {list.map((p) => (
          <PersonCard key={p.id} person={p} onOpen={(id) => go('detail', { id })} />
        ))}
      </div>
    </div>
  );
}

/* ŽEBŘÍČEK — leaderboard */
function Zebricek({ go }) {
  const { ALL } = window.ZMRD;
  const ranked = ALL.filter((p) => p.score !== null)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return (
    <div className="view zebricek wrap">
      <header className="page-head">
        <div className="kicker">Žebříček · síň (ne)slávy</div>
        <h1 className="page-h1">Žebříček zmrdů</h1>
        <p className="page-sub">Řazeno podle počtu doložených dimenzí. Nahoře ti, u kterých svítí nejvíc.</p>
      </header>

      <div className="ladder">
        {ranked.map((p, i) => (
          <button className="ladder-row" key={p.id} onClick={() => go('detail', { id: p.id })}>
            <span className="ladder-rank mono">{String(i + 1).padStart(2, '0')}</span>
            {p.photo
              ? <img className="ladder-photo" src={p.photo} alt={p.name} loading="lazy" style={p.photoPos ? { objectPosition: p.photoPos } : null} />
              : <span className="ladder-portrait portrait" aria-hidden="true">FOTO</span>}
            <span className="ladder-name">
              <span className="ladder-nm">{p.name}</span>
              <span className="ladder-party mono">{p.party} · {p.category}</span>
            </span>
            <span className="ladder-bar" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, j) => (
                <i key={j} className={j < p.score ? 'on' : ''}></i>
              ))}
            </span>
            <span className={'ladder-score score-num sm ' + p.tier}>{p.score}<span className="of">/6</span></span>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Hledat, Zebricek });
