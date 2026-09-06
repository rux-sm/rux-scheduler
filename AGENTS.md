# AGENTS.md — the policy

The one instruction file; `CLAUDE.md` imports it. `README.md`, if there is
one, is the long version.

## What this repository is

**Public.** Scheduler, one app on rux-ds, served at `rux-sm.github.io/rux-scheduler/`.
Started by rux-ds `tools/new-project.sh`; `vendor/rux-ds/PIN` names the tag
it is on. Nothing from a client, a person or a private repository appears in
it.

## What is yours and what is not

- **Yours:** the pages at the root, `rux-theme.css` and `rux-overrides.css`
  (deltas only — empty is the normal state), `brand/`, `tools/`, this file.
- **rux-ds's:** everything under `vendor/rux-ds/`. Never edited; a pin move
  overwrites it. A missing component or rule is a request to rux-ds with
  invented content, never a local rule.
- Every `rux--*` class comes from `vendor/rux-ds/css/rux.css`. A colour goes
  in `rux-theme.css` inside a `[data-theme]` block; a component rule in
  `rux-overrides.css` at Carbon's own specificity; never `!important`.
- **App components are yours, prefixed `sch-`.** Carbon has no schedule grid
  and no trip bar, so this app owns them: markup in the page, rules in
  `sch.css`, every colour, size and space a `--rux-*` token; a `--sch-*`
  variable carries a count or a position only. No rule on a `rux--*` class
  there. `check.mjs` fails on an invented token; it cannot
  see a bad `sch-` rule, so open the page. A `sch-` class is never a way to
  restyle a Carbon part — that is a request to rux-ds (added 2026-09-06).
- The app list is the hub's `switcher.json`, and `/switcher.js` fills the
  panel at runtime. Nothing here lists apps.

## The one check

    node tools/check.mjs

rux-ds's shared check, run from the vendored copy: classes, tokens, local
references, ids, the pin. The Pages workflow runs it and the site deploys
only when it passes. It cannot see whether the page looks right: serve it
(`node tools/serve.mjs`), open it, in every theme.

## Moving the pin

From a rux-ds clone on `main`, with the tag fetched:

    sh ~/Developer/rux-ds/tools/new-project.sh . --tag vX.Y.Z

Only `vendor/rux-ds/` changes. Read the drift report it prints, then
`CHANGES.md` in rux-ds between the two tags, then `node tools/check.mjs`.

## Commits

`type(scope): Subject`, subject ≤50 chars, body wrapped at 72 bytes, authored
by rux alone with no AI attribution. `.githooks/commit-msg` refuses anything
else; arm it once per clone: `git config core.hooksPath .githooks`.
