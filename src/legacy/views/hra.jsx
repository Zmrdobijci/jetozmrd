/* ZMRD NAKED ATTRACTION — hádej politika podle doložených faktů.
   Fotka se odhaluje zdola nahoru, ke každému vodítku jeden pruh. */
function NakedView({ go, open }) {
  const { ALL, DIMENSIONS } = window.ZMRD;
  const pool = ALL.filter((p) => p.photo && p.score); // jen ti s fotkou a skóre

  const buildRound = React.useCallback(() => {
    const target = pool[Math.floor(Math.random() * pool.length)];
    // vodítka = doložené nálezy cíle (reálná fakta)
    const clues = DIMENSIONS.filter((d) => target.dims[d.key].lit)
      .map((d) => ({ q: d.q, text: target.dims[d.key].finding }));
    // 4 možnosti: cíl + 3 náhodní jiní
    const others = ALL.filter((p) => p.id !== target.id && p.score !== null)
      .sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [target, ...others].sort(() => Math.random() - 0.5);
    return { target, clues, options };
  }, []);

  const [round, setRound] = React.useState(buildRound);
  const [revealed, setRevealed] = React.useState(1);   // odkryté pruhy zdola
  const [shown, setShown] = React.useState(1);          // zobrazená vodítka
  const [wrong, setWrong] = React.useState([]);         // špatné tipy (id)
  const [won, setWon] = React.useState(false);

  const { target, clues, options } = round;
  const SLICES = Math.max(clues.length, 5);

  const newGame = () => {
    setRound(buildRound());
    setRevealed(1); setShown(1); setWrong([]); setWon(false);
  };
  const nextClue = () => {
    setShown((s) => Math.min(clues.length, s + 1));
    setRevealed((r) => Math.min(SLICES, r + 1));
  };
  const guess = (p) => {
    if (won || wrong.includes(p.id)) return;
    if (p.id === target.id) { setWon(true); setRevealed(SLICES); }
    else { setWrong((w) => [...w, p.id]); setRevealed((r) => Math.min(SLICES, r + 1)); }
  };

  return (
    <div className="view naked wrap">
      <header className="page-head">
        <div className="kicker">Zmrd Naked Attraction · 18+ pro charakter</div>
        <h1 className="page-h1">Poznáš zmrda <span className="na-em">odspoda</span>?</h1>
        <p className="page-sub">
          Skrýváme politika. Odhalujeme ho po kouskách zdola nahoru — a ke každému kousku
          přidáme jeden doložený fakt. Tipni si, kdo to je, dřív než uvidíš obličej.
        </p>
      </header>

      <div className="na-stage">
        {/* odhalovací fotka */}
        <div className="na-photo-col">
          <div className={'na-photo' + (won ? ' won' : '')}>
            <img src={target.photo} alt="?" style={target.photoPos ? { objectPosition: target.photoPos } : null} />
            <div className="na-curtain">
              {Array.from({ length: SLICES }).map((_, i) => {
                const covered = i < SLICES - revealed;
                return <div key={i} className={'na-slice' + (covered ? ' on' : '')}></div>;
              })}
            </div>
            {!won && <div className="na-photo-tag mono">odhaleno {Math.round((revealed / SLICES) * 100)} %</div>}
            {won && (
              <div className="na-photo-win">
                <div className="na-win-name">{target.name}</div>
                <Verdict person={target} big />
              </div>
            )}
          </div>
          <div className="na-meter mono">
            <span>kotníky</span><span>obličej</span>
          </div>
        </div>

        {/* vodítka + tipy */}
        <div className="na-play">
          <div className="na-clues">
            <div className="kicker">Doložená vodítka · {shown} z {clues.length}</div>
            <ol className="na-clue-list">
              {clues.slice(0, shown).map((c, i) => (
                <li className="na-clue" key={i}>
                  <span className="na-clue-n mono">{String(i + 1).padStart(2, '0')}</span>
                  <span><strong>{c.q}</strong> {c.text}</span>
                </li>
              ))}
            </ol>
            {!won && shown < clues.length && (
              <button className="btn ghost na-more" onClick={nextClue}>
                Další vodítko (odhalí kousek) <Ico k="arrow" size={15} />
              </button>
            )}
            {!won && shown >= clues.length && (
              <p className="na-nomore mono">Víc vodítek není. Tipni si.</p>
            )}
          </div>

          <div className="na-options">
            <div className="kicker">Kdo je to?</div>
            <div className="na-opt-grid">
              {options.map((p) => {
                const isWrong = wrong.includes(p.id);
                const isWin = won && p.id === target.id;
                return (
                  <button
                    key={p.id}
                    className={'na-opt' + (isWrong ? ' wrong' : '') + (isWin ? ' win' : '')}
                    onClick={() => guess(p)}
                    disabled={won || isWrong}
                  >
                    <span className="na-opt-name">{p.name}</span>
                    <span className="na-opt-party mono">{p.party}</span>
                    {isWrong && <span className="na-opt-x">✗</span>}
                    {isWin && <span className="na-opt-ok"><Ico k="check" size={16} /></span>}
                  </button>
                );
              })}
            </div>
          </div>

          {won && (
            <div className="na-result">
              <p>
                <strong>{target.name}</strong> — {target.category}.
                {wrong.length === 0 ? ' Trefa na první dobrou. Máš oko na zmrdy.' :
                  wrong.length === 1 ? ' Dal sis načas, ale máš ho.' : ' No, nakonec to vyšlo.'}
              </p>
              <div className="na-result-cta">
                <button className="btn ghost" onClick={() => open(target.id)}>Otevřít profil se zdroji <Ico k="arrow" size={15} /></button>
                <button className="btn signal" onClick={newGame}>Další kolo <Ico k="arrow" size={15} /></button>
              </div>
            </div>
          )}
          {!won && wrong.length > 0 && (
            <p className="na-hint mono">Vedle. Zkus to znovu — a koukni na další vodítko.</p>
          )}
          {!won && (
            <button className="na-skip mono" onClick={newGame}>přeskočit a zkusit jiného →</button>
          )}
        </div>
      </div>

      <p className="na-disclaim mono">
        Vodítka jsou doložené nálezy z profilů. Po vyhrání najdeš u politika zdroje ke každému.
      </p>
    </div>
  );
}

Object.assign(window, { NakedView });
