#!/usr/bin/env node
// This app's one check: rux-ds's shared app check, run from the vendored copy
// so local and CI read the same bytes. It exits 1 on a failure and returns on
// a pass; an app-specific gate goes after the import, and nothing before it.
await import('../vendor/rux-ds/tools/app-check.mjs');

// THE SPRITE, PASTED WHOLE, MUST BE CURRENT -- wired up 2026-09-09.
// tools/sprite.mjs has existed since 2026-09-06, when the same gap it fixes
// was found moving to v0.1.8, but nothing ran its --check mode automatically:
// this file was the shared check alone. Running it just now found this
// repository stale again, the same way, for the same reason -- a pin move
// rewrites vendor/rux-ds/ and deliberately leaves pages alone, and the shared
// check's sprite rule only asks whether an inlined symbol is somewhere in
// what rux-ds ships, never whether the paste is current. Fixed in the prior
// commit; this is what keeps it from recurring silently.
import { spawnSync } from 'node:child_process';
if (spawnSync(process.execPath, ['tools/sprite.mjs', '--check'], { stdio: 'inherit' }).status !== 0) {
  console.log('\n  FAIL  sprite: see node tools/sprite.mjs --check above');
  process.exit(1);
}
