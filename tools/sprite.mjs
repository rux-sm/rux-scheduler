#!/usr/bin/env node
//
// Re-inlines rux-ds's sprite into every page at this app's root, read from
// the checkout beside this repository (or DS=<dir>) since 2026-09-09, when
// this app stopped vendoring a copy (rux-ds roadmap §8.4, step 2).
//
// WHY A PAGE INLINES IT AT ALL, rather than pointing <use> at the file:
// WebKit has never supported a cross-document <use>, and both failures are
// silent -- a fully styled page with empty boxes where the icons were.
// rux-ds's own `npm run icons` says the same and refreshes its templates and
// root pages for that reason.
//
// WHY THIS FILE EXISTS: a pin move rewrites vendor/rux-ds/ and deliberately
// leaves pages alone, so an app that moved to a tag carrying NEW icons still
// had the old sprite spliced into its markup. There was no command to run and
// no gate that would notice: check.mjs asks whether every <use> RESOLVES, and
// it does, against the stale copy. Found 2026-09-06 moving to v0.1.8 for
// `accessibility` and `hotel`.
//
//   node tools/sprite.mjs            rewrite each page's SPRITE block
//   node tools/sprite.mjs --check    exit 1 if any page is out of date
//
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const DS = resolve(root, process.env.DS ?? '../rux-ds');

const sprite = readFileSync(join(DS, 'assets/icons.svg'), 'utf8').trim();
const BEGIN = /<!-- SPRITE:BEGIN[\s\S]*?-->\n/;
const END = '<!-- SPRITE:END -->';

let stale = 0, written = 0;
for (const file of readdirSync(root).filter(f => f.endsWith('.html'))) {
  const path = join(root, file);
  const html = readFileSync(path, 'utf8');
  const begin = html.match(BEGIN);
  const endAt = html.indexOf(END);
  if (!begin || endAt < 0) { console.log(`  ${file} — no SPRITE block, left alone`); continue; }
  const head = html.slice(0, begin.index + begin[0].length);
  const tail = html.slice(endAt);
  const next = head + sprite + '\n' + tail;
  if (next === html) { console.log(`  ${file} — current`); continue; }
  stale++;
  if (check) { console.log(`  ${file} — STALE against ${DS}/assets/icons.svg`); continue; }
  writeFileSync(path, next);
  written++;
  console.log(`  ${file} — rewritten`);
}

if (check && stale) {
  console.log(`\n  ${stale} page(s) carry a sprite older than rux-ds's. Run: node tools/sprite.mjs`);
  process.exit(1);
}
console.log(`\n  ${written} page(s) rewritten from rux-ds's sprite (${(sprite.match(/<symbol/g) ?? []).length} symbols)`);
