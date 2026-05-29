// Entry point. Order matters: setup-globals first (exposes React/ReactDOM),
// then data/maps, then UI helpers, then views, then the app shell. Static
// imports evaluate in source order — this reproduces the original sequential
// <script> loading the artifact relied on.
import './setup-globals.js';

import './styles.css';
import './components.css';

import './legacy/data.js';
import './legacy/czmap.js';
import './legacy/icons.jsx';
import './legacy/shared.jsx';
import './legacy/views/landing.jsx';
import './legacy/views/mapa.jsx';
import './legacy/views/ai.jsx';
import './legacy/views/detail.jsx';
import './legacy/views/hledat.jsx';
import './legacy/views/metodika.jsx';
import './legacy/app.jsx';
