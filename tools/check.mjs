#!/usr/bin/env node
// This app's one check: rux-ds's shared app check, imported from the rux-ds
// checkout beside this repository (or DS=<dir>). It exits 1 on a failure and
// returns on a pass; an app-specific gate goes after the import, and nothing
// before it.
//
// SINCE 2026-09-09 THIS APP VENDORS NOTHING (rux-ds roadmap §8.4, step 2). Its
// pages link /rux-ds/… on the shared origin, so the check resolves them
// against a rux-ds checkout: locally the sibling on main, in CI the newest
// tag, which is what is live at /rux-ds/. A class added on main passes here
// and fails in CI until it is tagged -- the right failure, and a loud one.
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
process.chdir(root);
const DS = resolve(root, process.env.DS ?? '../rux-ds');
if (!existsSync(join(DS, 'tools/app-check.mjs'))) {
  console.log(`  FAIL  ds: no rux-ds at ${DS} -- clone it beside this repository, or set DS=<dir>`);
  process.exit(1);
}
await import(pathToFileURL(join(DS, 'tools/app-check.mjs')).href);

// THE SPRITE, PASTED WHOLE, MUST BE CURRENT -- wired up 2026-09-09.
// tools/sprite.mjs has existed since 2026-09-06, when the same gap it fixes
// was found moving to v0.1.8, but nothing ran its --check mode automatically:
// this file was the shared check alone. A release that changes a symbol
// leaves the paste in these pages behind, and the shared check's sprite rule
// only asks whether an inlined symbol matches one rux-ds ships, never whether
// the page carries every symbol it should. This is what keeps that from
// recurring silently. It reads the same rux-ds the check above did.
if (spawnSync(process.execPath, ['tools/sprite.mjs', '--check'], { stdio: 'inherit', env: { ...process.env, DS } }).status !== 0) {
  console.log('\n  FAIL  sprite: see node tools/sprite.mjs --check above');
  process.exit(1);
}
