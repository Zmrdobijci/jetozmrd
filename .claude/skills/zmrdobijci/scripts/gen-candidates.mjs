#!/usr/bin/env node
/**
 * Z listiny kandidátů (data/senat-2026-kandidati.csv) vygeneruje
 * src/legacy/senat-kandidati.js — roster pro vykreslení plné kandidátky na mapě.
 * Spuštění: node .claude/skills/zmrdobijci/scripts/gen-candidates.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const CSV = resolve(HERE, '../data/senat-2026-kandidati.csv');
const OUT = resolve(ROOT, 'src/legacy/senat-kandidati.js');

const TITLES = new Set(['ing','mgr','mudr','rsdr','bc','mba','phd','csc','drsc','judr','rndr','paeddr','prof','doc','dis','th','lic','ph','dr','ddr','mvdr','pharmdr','mga','bca','akad','gen','plk','pplk','thlic','thdr','phmr','arch','et','ml','st']);
const ZW = /[​-‍﻿]/g;
const clean = (s) => s.replace(ZW, '').trim();

// "Příjmení Jméno Tituly" -> "Jméno Příjmení"
function reorder(raw) {
  const toks = clean(raw).replace(/\./g, '. ').split(/\s+/).map((t) => t.trim()).filter(Boolean);
  const named = toks.filter((t) => !TITLES.has(t.replace(/\./g, '').toLowerCase()));
  if (named.length < 2) return named.join(' ');
  const first = named[named.length - 1];
  const surnames = named.slice(0, named.length - 1);
  return [first, ...surnames].join(' ');
}
const esc = (s) => clean(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const csv = readFileSync(CSV, 'utf8').replace(/^﻿/, '');
const rows = csv.split(/\r?\n/).filter((l) => l.trim()).slice(1);
const cands = rows.map((line) => {
  const c = line.split(';').map(clean);
  return { obvod: Number(c[0]), num: Number(c[1]), name: reorder(c[2]), party: c[4], job: c[7], mesto: c[8] };
}).filter((c) => c.name && c.obvod);

const lines = cands.map((c) =>
  `  { obvod: ${c.obvod}, num: ${c.num}, name: '${esc(c.name)}', party: '${esc(c.party)}', job: '${esc(c.job)}', mesto: '${esc(c.mesto)}' },`
);

const out = `/* Senátní kandidáti obvodů volených 2026 — ${cands.length} kandidátů, 27 obvodů.
   Zdroj: valekjo/senat-2026-web (data-raw/vsichni-platni-kandidati.csv).
   GENEROVÁNO skriptem .claude/skills/zmrdobijci/scripts/gen-candidates.mjs — needituj ručně.
   Slouží k vykreslení celé kandidátky na mapě; neprověření kandidáti = Šedá zóna. */
window.SENAT_KANDIDATI_2026 = [
${lines.join('\n')}
];
`;

writeFileSync(OUT, out, 'utf8');
console.log(`Zapsáno ${cands.length} kandidátů do ${OUT}`);
