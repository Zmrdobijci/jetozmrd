#!/usr/bin/env node
/**
 * Coverage test: jsou všichni senátní kandidáti z oficiální listiny v databázi webu?
 *
 * Zdroj pravdy: data/senat-2026-kandidati.csv (kandidáti 27 obvodů volených 2026).
 * Kontrolovaná DB:  src/legacy/data.js (SENAT záznamy se scope: 'senát').
 *
 * Spuštění:  node .claude/skills/zmrdobijci/test/senat-coverage.mjs
 * Exit code: 0 = pokrytí 100 %, 1 = chybí aspoň jeden kandidát (gate pro doplňování).
 *
 * Párování podle jména je tolerantní: zahodí tituly, srovná množinu
 * jmenných tokenů (příjmení + křestní) po odstranění diakritiky a malých písmen,
 * a navíc kontroluje shodu obvodu.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..'); // repo root
const CSV = resolve(HERE, '../data/senat-2026-kandidati.csv');
const DATA = resolve(ROOT, 'src/legacy/data.js');

const TITLES = new Set([
  'ing', 'mgr', 'mudr', 'rsdr', 'bc', 'mba', 'phd', 'csc', 'drsc', 'judr',
  'rndr', 'paeddr', 'prof', 'doc', 'dis', 'th', 'lic', 'ph', 'dr', 'ddr',
  'mvdr', 'pharmdr', 'mga', 'bca', 'akad', 'gen', 'plk', 'pplk', 'thlic',
  'thdr', 'phmr', 'arch', 'ml', 'st', 'd',
]);

const ZW = /[​-‍﻿]/g; // zero-width + BOM
const fold = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '') // diakritika
    .replace(ZW, '')
    .toLowerCase();

// množina jmenných tokenů (bez titulů, bez interpunkce)
function nameTokens(raw) {
  return new Set(
    fold(raw)
      .replace(/[.,]/g, ' ')
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t && !TITLES.has(t) && !/^\d+$/.test(t))
  );
}

// kandidát je v DB, pokud jeho jmenné tokeny jsou podmnožinou tokenů osoby v DB
// (DB může mít navíc rodné/prostřední jméno) a sedí obvod
const subset = (cand, db) => cand.size > 0 && [...cand].every((x) => db.has(x));

// ---- 1) načti kandidáty z CSV ----
const csv = readFileSync(CSV, 'utf8').replace(/^﻿/, '');
const rows = csv.split(/\r?\n/).filter((l) => l.trim()).slice(1); // bez hlavičky
const candidates = rows.map((line) => {
  const c = line.split(';').map((x) => x.replace(/[​-‍﻿]/g, '').trim());
  return { obvod: Number(c[0]), num: Number(c[1]), name: c[2], party: c[4], tokens: nameTokens(c[2]) };
}).filter((c) => c.name);

// ---- 2) načti DB osoby z data.js (regex přes person({...}) bloky) ----
const src = readFileSync(DATA, 'utf8');
// posbírej name + obvod + scope ze záznamů
const people = [];
const reName = /\bname:\s*'([^']+)'/g;
let m;
// jednodušší: rozsekej na person( bloky a z každého vytáhni name/obvod/scope
const blocks = src.split(/person\(\{/).slice(1);
for (const b of blocks) {
  const head = b.slice(0, 2000);
  const name = (head.match(/\bname:\s*'([^']+)'/) || [])[1];
  if (!name) continue;
  const obvod = (head.match(/\bobvod:\s*(\d+)/) || [])[1];
  const scope = (head.match(/\bscope:\s*'([^']+)'/) || [])[1];
  people.push({ name, obvod: obvod ? Number(obvod) : null, scope: scope || null, tokens: nameTokens(name) });
}

// ---- 3) párování ----
const isPresent = (cand) =>
  people.some((p) => subset(cand.tokens, p.tokens) && (p.obvod == null || p.obvod === cand.obvod));

const present = candidates.filter(isPresent);
const missing = candidates.filter((c) => !isPresent(c));

// ---- 4) report ----
const byObvod = new Map();
for (const c of candidates) {
  if (!byObvod.has(c.obvod)) byObvod.set(c.obvod, { total: 0, have: 0 });
  const o = byObvod.get(c.obvod);
  o.total++;
  if (isPresent(c)) o.have++;
}

const pct = ((present.length / candidates.length) * 100).toFixed(1);
console.log(`\nSENÁTNÍ COVERAGE — kandidáti v DB webu`);
console.log(`════════════════════════════════════════`);
console.log(`Kandidátů v listině: ${candidates.length}`);
console.log(`V databázi:          ${present.length}`);
console.log(`Chybí:               ${missing.length}`);
console.log(`Pokrytí:             ${pct} %\n`);

console.log(`Podle obvodu (have/total):`);
for (const o of [...byObvod.keys()].sort((a, b) => a - b)) {
  const { have, total } = byObvod.get(o);
  const bar = have === total ? '✅' : `${have}/${total}`;
  console.log(`  obvod ${String(o).padStart(2)} : ${bar}`);
}

if (missing.length) {
  console.log(`\nChybějící kandidáti (${missing.length}):`);
  for (const c of missing.sort((a, b) => a.obvod - b.obvod || a.num - b.num)) {
    console.log(`  [${String(c.obvod).padStart(2)}] ${c.name}  (${c.party})`);
  }
}

console.log('');
process.exit(missing.length === 0 ? 0 : 1);
