// Exposes React on window so the legacy global-scope files (which expect a
// global `React`/`ReactDOM`, e.g. `const { useState } = React`,
// `ReactDOM.createRoot`) resolve at runtime. Must be imported FIRST in main.jsx
// so it evaluates before any legacy module.
import React from 'react';
import * as ReactDOM from 'react-dom/client';

window.React = React;
window.ReactDOM = ReactDOM;
