#!/usr/bin/env node
// This app's one check: rux-ds's shared app check, run from the vendored copy
// so local and CI read the same bytes. It exits 1 on a failure and returns on
// a pass; an app-specific gate goes after the import, and nothing before it.
await import('../vendor/rux-ds/tools/app-check.mjs');
