# Log

Every dated pass and answered decision, newest first. `AGENTS.md` is the
policy; `docs/backend-inventory.md` and `docs/screen-inventory.md` are the
two inventories the rebuild starts from.

**2026-09-06 — pin moved to v0.1.7.** The tag was cut in rux-ds at
`57031cc`, verified there in a clean worktree with all 41 browser cells
current, nothing removed in `CHANGES.md`. The move brought
`vendor/rux-ds/tools/` and `githooks/` with it, so `node tools/check.mjs`,
the commit hook and `node tools/serve.mjs` now run from the vendored copy;
this is the first commit made under the app's own hook. The drift report
lists three head resources that are this app's own and a header nav the
page leaves out on purpose. Pages was enabled by rux with the Actions
source.

**2026-09-06 — the week grid, static.** `index.html` is the Schedule page:
Carbon shell and toolbar, and the two app components in `sch.css`, the
grid and the trip bar, with `sch.js` for selection and the size switcher.
Eleven invented trips on an invented week show every state the old bar
had: two-day, continues-before, continues-after with a partial-PO border,
a second lane, unconfirmed, double booked, out of service, Unassigned.
Ported from `rux-ui` with four changes, each recorded in the stylesheet's
header: Carbon tag tints instead of saturated fills, square corners, the
border-interactive and focus tokens for selected and focus, label-01 and
label-02 as the two size tiers with row height equal to line height.
Measured live at 1440×900: compact rows 16px and a bar 88px, comfortable
18px and 98px; a click sets `aria-pressed`; the overflow menu opens under
rux-ds's `menu.js`. Looked at in white, g10, g90, g100 and rux; the light
themes tint, the dark ones saturate, both Carbon's own tag palette. The
shared app check passes when run from rux-ds's copy, since the vendored
copy is still absent. Not covered: no data, no drag, no editor, no week
navigation, no time-aligned mode; `check-a11y` and the spacing gate are
rux-ds's and were not run here; the `Settings` and `Drivers` nav icons are
stand-ins from the sprite's forty icons.

**2026-09-06 — repository started.** Scaffolded by rux-ds
`tools/new-project.sh` from `v0.1.6`; that tag predated the shared app
check, so `vendor/rux-ds/tools/` was empty and `node tools/check.mjs` failed
on a missing module until the pin moved, see above. Two
inventories written from the `rux-backend` snapshot of 2026-09-03 and the
old app in `rux-ui`. Decisions recorded there: same tables, no schema
change; platform sign-in from the first commit, which the old app's
permissive policies allow; every floating window becomes a side panel or
modal; the week grid and the trip bar are the app's two components, rule
added to `AGENTS.md`. Not done: no page beyond the scaffold, no Pages
deployment, and rux-ds roadmap §4.13 step 8 amended separately there.
