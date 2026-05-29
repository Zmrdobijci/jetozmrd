import { defineConfig } from 'vite';

// Legacy artifact code is global-scope (no imports/exports) and relies on a
// global `React`/`ReactDOM`, just like the original UMD + Babel setup.
// Mirror that: classic JSX transform emitting React.createElement, with React
// exposed on window by src/setup-globals.js (imported first in src/main.jsx).
export default defineConfig({
  base: './',
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
});
