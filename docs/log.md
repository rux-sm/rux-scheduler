# Log

Every dated pass and answered decision, newest first. `AGENTS.md` is the
policy; `docs/backend-inventory.md` and `docs/screen-inventory.md` are the
two inventories the rebuild starts from.

**2026-09-06 — repository started.** Scaffolded by rux-ds
`tools/new-project.sh` from `v0.1.6`; that tag predates the shared app
check, so `vendor/rux-ds/tools/` is empty and `node tools/check.mjs` fails
on a missing module until the pin moves to a tag that carries it. Two
inventories written from the `rux-backend` snapshot of 2026-09-03 and the
old app in `rux-ui`. Decisions recorded there: same tables, no schema
change; platform sign-in from the first commit, which the old app's
permissive policies allow; every floating window becomes a side panel or
modal; the week grid and the trip bar are the app's two components, rule
added to `AGENTS.md`. Not done: no page beyond the scaffold, no Pages
deployment, and rux-ds roadmap §4.13 step 8 amended separately there.
