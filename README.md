# rux-scheduler

Fleet scheduling and dispatch — one app on [rux-ds](https://github.com/rux-sm/rux-ds),
served at **rux-sm.github.io/rux-scheduler/**.

`AGENTS.md` is the policy and the only place a rule lives.
`docs/status.md` is where this stands. `docs/log.md` is every dated pass.

## What it is

A week board: buses down the side, days across, one bar per assignment. It
reads and writes the Supabase tables the `rux-ui` app already writes — trips,
assignments, stops, drivers, buses — and is that app's replacement, mid-flight.

The schedule grid and the trip bar are this app's own, prefixed `sch-`; Carbon
has neither. Everything else is rux-ds's, linked live at `/rux-ds/…` with no
copy here and no pin to move.

## Run it

    node tools/serve.mjs

Every site in the family on one origin at `:8640`, laid out as GitHub Pages
lays them out; this app is at `/rux-scheduler/`. **Serving this folder alone
will not work** — the pages link `/rux-ds/…` absolutely, so they need the
shared origin. `../rux-ds` must be checked out beside this repository.

## Check it

    node tools/check.mjs

rux-ds's shared check plus the sprite. Locally that reads rux-ds on `main`; the
Pages workflow reads it at its newest release tag — what is actually live — so
a class added on `main` passes here and fails there until it is tagged. That is
the right failure.

It cannot see whether the page looks right. Open it.

## How it deploys

A push to `main` runs the check and deploys only if it passes. A failing push
stays in git and the last good deployment keeps serving.
