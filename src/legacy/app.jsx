/* APP — shell, routing, navigace */
const { useState, useEffect, useCallback } = React;

const NAV = [
['home', 'Domů'],
['mapa', 'Mapa'],
['strany', 'Strany'],
['naked', 'Naked Attraction'],
['ai', 'Zeptat se AI'],
['zebricek', 'Žebříček'],
['hledat', 'Hledat'],
['metodika', 'Metodika']];


function parseHash() {
  const h = (location.hash || '#/home').replace(/^#\/?/, '');
  const [view, id] = h.split('/');
  return { view: view || 'home', id };
}

const TWEAK_DEFAULTS = { signal: '#c73b22', headingFont: 'Space Grotesk' };

// Theme is fixed (the artifact's editor panel was removed). Keep the
// [state, setter] shape App expects; the setter is a no-op.
function useTweaks(defaults) {
  return [defaults, () => {}];
}

function App() {
  const [t] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState(parseHash());
  const [selectedKraj, setSelectedKraj] = useState(null);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const histRef = React.useRef([]);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {window.scrollTo(0, 0);setMenuOpen(false);}, [route.view, route.id]);

  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--signal', t.signal);
    r.setProperty('--font-display', "'" + t.headingFont + "', system-ui, sans-serif");
  }, [t.signal, t.headingFont]);

  const go = useCallback((view, opts) => {
    opts = opts || {};
    if (view === 'back') {
      const prev = histRef.current.pop();
      if (prev) {location.hash = prev;} else {location.hash = '#/home';}
      return;
    }
    histRef.current.push(location.hash || '#/home');
    if (view === 'detail') location.hash = '#/detail/' + opts.id;else
    location.hash = '#/' + view;
  }, []);

  const navGo = (v) => {histRef.current = [];location.hash = '#/' + v;};

  const { view, id } = route;
  const activeNav = view === 'detail' ? '' : view;

  let content;
  if (view === 'detail') content = <Detail go={go} id={id} />;else
  if (view === 'mapa') content = <MapaView go={go} selected={selectedKraj} setSelected={setSelectedKraj} />;else
  if (view === 'strany') content = <StranyView go={go} />;else
  if (view === 'ai') content = <AiZmrdolog go={go} open={(id) => go('detail', { id })} />;else
  if (view === 'naked') content = <NakedView go={go} open={(id) => go('detail', { id })} />;else
  if (view === 'hledat') content = <Hledat go={go} query={query} setQuery={setQuery} />;else
  if (view === 'zebricek') content = <Zebricek go={go} />;else
  if (view === 'metodika') content = <Metodika go={go} />;else
  content = <Landing go={navGo} open={(id) => go('detail', { id })} />;

  return (
    <React.Fragment>
      <div className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => navGo('home')}>
            <span className="brand-mark"></span>
            JE&nbsp;TO&nbsp;<em>ZMRD</em>?
          </button>
          <nav className="nav">
            {NAV.map(([k, l]) =>
            <button key={k} className={activeNav === k || k === 'home' && view === 'home' ? 'active' : ''} onClick={() => navGo(k)}>{l}</button>
            )}
            <button className="nav-search" onClick={() => navGo('hledat')}>
              <Ico k="search" size={15} />
              <input
                readOnly
                placeholder="hledat…"
                value=""
                onFocus={() => navGo('hledat')} />
              
            </button>
          </nav>
          <button className="menu-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="menu">
            <Ico k={menuOpen ? 'close' : 'menu'} size={20} />
          </button>
        </div>
        <div className={'mobile-nav' + (menuOpen ? ' open' : '')}>
          {NAV.map(([k, l]) =>
          <button key={k} className={activeNav === k ? 'active' : ''} onClick={() => navGo(k)}>{l}</button>
          )}
        </div>
      </div>

      <main className="app-main">{content}</main>

      <footer className="foot">
        <div className="wrap">
          <div>
            <div className="brand" style={{ fontSize: 17, marginBottom: 8 }}>
              <span className="brand-mark" style={{ width: 20, height: 20 }}></span>
              JE&nbsp;TO&nbsp;<em>ZMRD</em>?
            </div>
            <div className="mono">Měříme, co jiní jen tuší.<br />Veřejná, citovatelná fakta · jetozmrd.cz · 2026</div>
          </div>
          <button className="foot-slogan" onClick={() => navGo('mapa')}>
            Prohackni politiku.
          </button>
        </div>
      </footer>
    </React.Fragment>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);