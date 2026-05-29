/* AI ZMRDOLOG — zeptej se AI, jestli je dotyčný zmrd. Odpověď podložená naší databází. */
function AiZmrdolog({ go, open }) {
  const { ALL, DIMENSIONS } = window.ZMRD;
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [answer, setAnswer] = React.useState(null);
  const [matched, setMatched] = React.useState(null);
  const [askedName, setAskedName] = React.useState('');
  const [err, setErr] = React.useState(null);

  const findPerson = (name) => {
    const n = name.trim().toLowerCase();
    if (!n) return null;
    return ALL.find((p) => p.name.toLowerCase().includes(n)) ||
           ALL.find((p) => n.includes(p.name.split(' ').pop().toLowerCase())) || null;
  };

  // Deterministic verdict from our own database — used when the live AI
  // (Claude artifact runtime) isn't available. Same VERDIKT/ROZBOR/POINTA
  // shape renderAnswer() expects, so it styles identically.
  const buildLocalAnswer = (person, name) => {
    if (!person) {
      return [
        'Náhled bez živé AI — řídíme se jen doloženými fakty.',
        'VERDIKT: není v databázi — nelze doložit',
        'ROZBOR: ' + name + ' zatím ve zmrdometru není. Bez doložených veřejných zdrojů verdikt nevynášíme — to by byl jen dojem, a těmi se neřídíme.',
        'POINTA: Co není doložené, to nehodnotíme. Zatím.',
        'Hodnotíme doložené chování, ne osobu.',
      ].join('\n');
    }
    const lit = DIMENSIONS.filter((d) => person.dims[d.key].lit);
    const rozbor = lit.length
      ? lit.slice(0, 4).map((d) => d.label.toLowerCase() + ' — ' + person.dims[d.key].finding).join(' ')
      : 'Žádná z šesti os není doložena jako problematická.';
    const score = person.score === null ? 'šedá zóna' : person.score + '/6';
    return [
      'Náhled bez živé AI — verdikt sestaven přímo z naší doložené databáze.',
      'VERDIKT: ' + score + ' — ' + person.category,
      'ROZBOR: ' + rozbor,
      'POINTA: ' + (lit.length >= 4
        ? 'Vzorec je čitelný a doložený. Žádný dojem, jen záznam.'
        : 'Zatím spíš jednotlivosti než vzorec — sledujeme dál.'),
      'Hodnotíme doložené chování, ne osobu.',
    ].join('\n');
  };

  const ask = async (name) => {
    const query = (name != null ? name : q).trim();
    if (!query || loading) return;
    if (name != null) setQ(query);
    setLoading(true); setErr(null); setAnswer(null); setAskedName(query);
    const person = findPerson(query);
    setMatched(person);

    // Live LLM verdict only exists inside the Claude artifact runtime
    // (window.claude). On the deployed static site we fall back to a
    // deterministic verdict built straight from our documented database.
    if (!(window.claude && window.claude.complete)) {
      setAnswer(buildLocalAnswer(person, query));
      setLoading(false);
      return;
    }

    const dimList = DIMENSIONS.map((d) => '- ' + d.q + ' (' + d.label + ')').join('\n');
    let facts;
    if (person) {
      const lit = DIMENSIONS.filter((d) => person.dims[d.key].lit).map((d) =>
        '• ' + d.q + ' ANO — ' + person.dims[d.key].finding +
        ' [zdroje: ' + person.dims[d.key].sources.map((s) => s.p).join(', ') + ']');
      const clean = DIMENSIONS.filter((d) => !person.dims[d.key].lit).map((d) => '• ' + d.q + ' ne').join('\n');
      facts = 'OSOBA JE V DATABÁZI ZMRDOMETRU.\nJméno: ' + person.name + ' (' + person.party + ', ' + person.role + ')\n' +
        'Naměřené skóre: ' + (person.score === null ? 'šedá zóna' : person.score + '/6') + ' — ' + person.category + '\n' +
        'Doložené nálezy:\n' + (lit.join('\n') || '— žádné —') + '\nČisté osy:\n' + clean;
    } else {
      facts = 'OSOBA NENÍ V DATABÁZI ZMRDOMETRU. Posuď maximálně opatrně a jasně upozorni, že nejde o ověřený profil — bez doložených zdrojů je to jen kvalifikovaný odhad.';
    }

    const prompt =
      'Jsi „AI zmrdolog" webu jetozmrd.cz. Píšeš v dikci blogu D-FENS o zmrdech: suchý, ironický, ' +
      'ale výhradně věcný — opíráš se jen o doložitelné chování, nikdy o dojmy. Hodnotíš 6 dimenzí:\n' + dimList +
      '\n\nDotaz uživatele: „Je ' + query + ' zmrd?"\n\nPodklady z naší profesní databáze:\n' + facts +
      '\n\nOdpověz česky, maximálně ~160 slov, BEZ emoji, přesně v této struktuře (každý štítek na samostatném řádku):\n' +
      'VERDIKT: <X/6 nebo „není v databázi"> — <kategorie / krátké posouzení>\n' +
      'ROZBOR: 2–4 věty ke klíčovým rozsvíceným dimenzím, s odkazem na typ veřejného zdroje (hlídačstát, Demagog, psp.cz, justice.cz).\n' +
      'POINTA: jedna ostřejší D-FENS věta.\n' +
      'Na úplný závěr přidej krátkou větu, že hodnotíme doložené chování, ne osobu.';

    try {
      const text = await window.claude.complete({ messages: [{ role: 'user', content: prompt }] });
      setAnswer(text);
    } catch (e) {
      setErr('AI je momentálně přetížená (nebo se zalekla právníků). Zkuste to za chvíli.');
    } finally {
      setLoading(false);
    }
  };

  const picks = ['Andrej Babiš', 'Filip Turek', 'Tomio Okamura', 'Petr Pavel', 'Petr Fiala'];

  const renderAnswer = (text) =>
    text.split('\n').filter((l) => l.trim()).map((line, i) => {
      const m = line.match(/^([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]{4,}):\s*(.*)$/);
      if (m) return (
        <p className="ai-line" key={i}>
          <span className={'ai-label ai-' + m[1].toLowerCase()}>{m[1]}</span>
          <span>{m[2]}</span>
        </p>
      );
      return <p className="ai-line plain" key={i}>{line}</p>;
    });

  return (
    <div className="view aiview wrap">
      <header className="page-head">
        <div className="kicker">Profesní AI · experimentální</div>
        <h1 className="page-h1">Zeptej se AI zmrdologa</h1>
        <p className="page-sub">
          Napište jméno politika. AI projde naši faktografickou databázi a vynese verdikt
          v dikci zmrdometru — výhradně z doložitelného chování, ne z dojmů.
        </p>
      </header>

      <div className="ai-console">
        <div className="ai-bar">
          <span className="ai-dot"></span><span className="ai-dot"></span><span className="ai-dot"></span>
          <span className="ai-bar-title mono">zmrdolog.ai — relace</span>
        </div>

        <form className="ai-input" onSubmit={(e) => { e.preventDefault(); ask(); }}>
          <span className="ai-prompt mono">je</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="jméno politika…"
            autoFocus
          />
          <span className="ai-prompt mono">zmrd?</span>
          <button type="submit" className="btn signal" disabled={loading || !q.trim()}>
            {loading ? 'zkoumám…' : 'Zeptat se'} {!loading && <Ico k="arrow" size={15} />}
          </button>
        </form>

        <div className="ai-picks">
          <span className="mono">Rychlý dotaz:</span>
          {picks.map((p) => (
            <button key={p} className="chip" onClick={() => ask(p)} disabled={loading}>{p}</button>
          ))}
        </div>

        <div className="ai-output">
          {!answer && !loading && !err && (
            <div className="ai-idle mono">
              <p>&gt; AI zmrdolog je připraven.</p>
              <p>&gt; Databáze: hlídačstát · Demagog · psp.cz · justice.cz · kohovolit.eu</p>
              <p>&gt; Čekám na jméno_</p>
            </div>
          )}
          {loading && (
            <div className="ai-loading mono">
              <span className="ai-spin"></span>
              Procházím veřejné zdroje a aplikuji zmrdologický rámec…
            </div>
          )}
          {err && <div className="ai-error mono">{err}</div>}
          {answer && (
            <div className="ai-answer">
              {renderAnswer(answer)}
              {matched ? (
                <button className="ai-cta" onClick={() => open(matched.id)}>
                  Otevřít doložený profil: {matched.name} <Ico k="arrow" size={15} />
                </button>
              ) : (
                <button className="ai-cta ghost" onClick={() => go('hledat')}>
                  Tato osoba není v databázi — prohledat ručně <Ico k="search" size={15} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="ai-disclaim mono">
        AI odpovídá na základě veřejných, citovatelných faktů. Generovaný text je orientační —
        závazné jsou doložené profily a jejich zdroje.
      </p>
    </div>
  );
}

Object.assign(window, { AiZmrdolog });
