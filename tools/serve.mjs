#!/usr/bin/env node
// This app's server: rux-ds's, vendored with the pin, on 8643 so it runs
// beside rux-ds's own sink on 8642. Serves index.html at /, from the app root.
process.env.PORT ??= '8643';
process.chdir(new URL('..', import.meta.url).pathname);
await import('../vendor/rux-ds/tools/serve.mjs');
