/* Minimalistické geometrické ikony — 6 dimenzí + UI */
const _ip = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };

function DimIcon({ k, size = 24 }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', ..._ip };
  switch (k) {
    case 'lze': // řeč / bublina s vykřičníkem
      return (
        <svg {...c}>
          <path d="M4 5.5h16v10H9l-4 3v-3H4z" />
          <line x1="12" y1="8.5" x2="12" y2="11.5" />
          <circle cx="12" cy="13.4" r="0.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'penize': // bankovka
      return (
        <svg {...c}>
          <rect x="3" y="6.5" width="18" height="11" rx="1.2" />
          <circle cx="12" cy="12" r="2.4" />
          <line x1="6" y1="9.4" x2="6" y2="9.41" />
          <line x1="18" y1="14.6" x2="18" y2="14.61" />
        </svg>
      );
    case 'prace': // hodiny / docházka
      return (
        <svg {...c}>
          <circle cx="12" cy="12.5" r="7.5" />
          <path d="M12 8.5v4l2.8 2" />
        </svg>
      );
    case 'konzistence': // otáčení kabátu — U-turn
      return (
        <svg {...c}>
          <path d="M7 16V11a4 4 0 0 1 8 0v5" />
          <path d="M4.5 13.5 7 16l2.5-2.5" />
          <path d="M17.5 13.5 15 16l-2.5-2.5" transform="rotate(180 15 14.75)" />
          <path d="M12.5 13.5 15 16l2.5-2.5" />
        </svg>
      );
    case 'toxicita': // výstražný trojúhelník
      return (
        <svg {...c}>
          <path d="M12 4.5 21 19H3z" />
          <line x1="12" y1="10" x2="12" y2="14" />
          <circle cx="12" cy="16.4" r="0.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'zbabelost': // bílá vlajka / kapitulace
      return (
        <svg {...c}>
          <line x1="6" y1="4" x2="6" y2="20" />
          <path d="M6 5h11l-2.5 3L17 11H6z" />
        </svg>
      );
    default:
      return <svg {...c}><circle cx="12" cy="12" r="8" /></svg>;
  }
}

function Ico({ k, size = 18 }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', ..._ip };
  switch (k) {
    case 'search':
      return <svg {...c}><circle cx="11" cy="11" r="6.5" /><line x1="16" y1="16" x2="20.5" y2="20.5" /></svg>;
    case 'arrow':
      return <svg {...c}><line x1="4" y1="12" x2="19" y2="12" /><path d="M13 6l6 6-6 6" /></svg>;
    case 'back':
      return <svg {...c}><line x1="20" y1="12" x2="5" y2="12" /><path d="M11 6l-6 6 6 6" /></svg>;
    case 'ext':
      return <svg {...c}><path d="M14 5h5v5" /><line x1="19" y1="5" x2="11" y2="13" /><path d="M18 13.5V19H5V6h5.5" /></svg>;
    case 'close':
      return <svg {...c}><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>;
    case 'menu':
      return <svg {...c}><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>;
    case 'check':
      return <svg {...c}><path d="M5 12.5l4.5 4.5L19 7" /></svg>;
    case 'doc':
      return <svg {...c}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="15.5" x2="15" y2="15.5" /></svg>;
    case 'pin':
      return <svg {...c}><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.4" /></svg>;
    default:
      return <svg {...c}><circle cx="12" cy="12" r="8" /></svg>;
  }
}

Object.assign(window, { DimIcon, Ico });
