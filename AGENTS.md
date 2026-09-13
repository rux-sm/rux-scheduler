---
type: app
---

# AGENTS.md — the policy

The one instruction file; `CLAUDE.md` imports it. `README.md`, if there is
one, is the long version.

## What this repository is

**Public.** Scheduler, one app on rux-ds, served at `rux-sm.github.io/rux-scheduler/`.
Started by rux-ds `tools/new-project.sh`. Since 2026-09-09 it vendors no copy
of rux-ds: its pages link `/rux-ds/…` on the shared origin, and what is live
there is rux-ds's newest tag (rux-ds roadmap §8.4, step 2). Nothing from a
client, a person or a private repository appears in it.

## What is yours and what is not
**The shared part of this is one document, not three.** `rux-ds/docs/consumer-policy.md`
is what every project on rux-ds agrees to — how it is linked rather than
vendored, what is yours and what is rux-ds's, where a colour and a component
rule go, the one check, and how to serve the family locally. Read it first;
what follows is only what is this repository's own. Added 2026-09-11.


- **Yours:** the pages at the root, `rux-theme.css` and `rux-overrides.css`
  (deltas only — empty is the normal state), `brand/`, `tools/`, this file.
- **rux-ds's:** everything under `/rux-ds/`, served from its own repository
  and never copied here. A missing component or rule is added to rux-ds, in
  the same session, with invented content — never a local rule here.
- Every `rux--*` class comes from rux-ds's `css/rux.css`. A colour goes
  in `rux-theme.css` inside a `[data-theme]` block; a component rule in
  `rux-overrides.css` at Carbon's own specificity; never `!important`.
- **App components are yours, prefixed `sch-`.** Carbon has no schedule grid
  and no trip bar, so this app owns them: markup in the page, rules in
  `sch.css`, every colour, size and space a `--rux-*` token; a `--sch-*`
  variable carries a count or a position only. No rule on a `rux--*` class
  there. `check.mjs` fails on an invented token; it cannot
  see a bad `sch-` rule, so open the page. A `sch-` class is never a way to
  restyle a Carbon part — that is done in rux-ds.
- The app list is the hub's `switcher.json`, and `/switcher.js` fills the
  panel at runtime. Nothing here lists apps.
- **`rux-ui` is the old app, it is still live, and it is not checked out
  beside this one.** Removed from the Developer folder 2026-09-11; it is at
  `github.com/rux-sm/rux-ui` and is read there. The docs here cite its files
  by path — `js/data/*.js`, `js/core/billing-config.js`, `docs/trip-bar.md` —
  and those citations still resolve on GitHub and nowhere on this machine.
  **Never clone it back in beside this repository**: it carries its own
  unrelated design system, `.rux-*` single-dash, and rux-ds froze it as a
  non-consumer on 2026-08-26.
  **What still couples the two is the database, not the source.** It writes
  the `public` schema this app reads. `rux-backend/tools/check-drift.mjs` is
  the only thing watching that seam; run it before trusting
  `docs/backend-inventory.md`, which was read off rux-ui on 2026-09-06.

## One session

Since 2026-09-12 a task that needs something from rux-ds or from the schema
does it there, in the same session, after reading that repository's own
`AGENTS.md` — no memo, no reply, no second authorization. What is still
unfinished across the family is the hub's `docs/status.md`.

## The one check

    node tools/check.mjs

rux-ds's shared check, imported from the rux-ds checkout beside this
repository (`../rux-ds`, or `DS=<dir>`): classes, tokens, local references,
ids, the inlined sprite. Locally that is rux-ds on `main`; the Pages workflow
checks rux-ds out at its newest tag — what is live at `/rux-ds/` — and the
site deploys only when the check passes there. A class added on `main`
passes locally and fails in CI until it is tagged; that is the right
failure. It cannot see whether the page looks right: serve it
(`node tools/serve.mjs`, every site on one origin at :8640, this app at
`/rux-scheduler/`), open it, in every theme.

## Which rux-ds this app is on

The one that is live. There is no pin to move: a rux-ds release reaches this
site on its next deploy, and `CHANGES.md` in rux-ds names any class that
left between two tags. `rux-ds` cloned beside this repository is required
to check or serve it.

## Commits

`type(scope): Subject`, subject ≤50 chars, body wrapped at 72 bytes, authored
by rux alone with no AI attribution. `.githooks/commit-msg` refuses anything
else; arm it once per clone: `git config core.hooksPath .githooks`.
