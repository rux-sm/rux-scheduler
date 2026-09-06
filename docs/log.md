# Log

Every dated pass and answered decision, newest first. `AGENTS.md` is the
policy; `docs/backend-inventory.md` and `docs/screen-inventory.md` are the
two inventories the rebuild starts from.

**2026-09-06 - the doubled rule beside the Bus column.** Reported and real:
two hairlines side by side where every other boundary has one. The sticky
column ends in a border and the first day drew a rule of its own at the same
pixel. Both halves of the grid had it, and start-aligning the body's rules
earlier the same day is what gave the body its half.

The day rules now cover **the six boundaries between days and neither edge**.
In the header the first day draws nothing, so the sticky column's own border
survives - it has to, since it is what divides the frozen column from the days
sliding under it. In the body the painted layer starts one day in and repeats
every sixth of its own width, which is exactly one day, so the rules land on
days 1 to 6 and never on either edge. Measured: the layer starts at 138px and
runs 828px on a 138px day, and the gradient period reads 16.6667% of that.

**Monday being today needed its own rule**, because box-shadow is one
property: the first day has to lose the day rule while keeping the accent.
Checked both ways by forcing the class - Monday gets the underline alone, a
midweek day gets rule and underline.

**2026-09-06 - the now-line removed, on rux's call.** Reported as landing on
the wrong day when the window is narrow, and it was: measured at 900px, the
line sat at 785px, inside Friday, with today on Sunday. **The cause is that
a grid container is only as wide as its own containing block.** The line was
positioned as a percentage of `.sch-grid`, whose box measured 770px while its
seven columns totalled 872px and overflowed it. Everything else on the page
is placed inside `.sch-track`, a grid ITEM spanning those columns, whose
width IS their total -- which is why bar placement measured exact at every
width and only this one drifted.

**Nothing replaces it, and that is the better answer anyway.** A grid placed
by DAY has no position within a day to point at, so a rule down the middle of
a column claims a precision the data does not have. Today is the header
cell's own accent: the interactive underline, the bold date, and
`aria-current="date"`.

**One bug found while removing it.** Moving the day rule from
`border-inline-start` to an inset shadow earlier the same day meant
`.sch-day--today`'s own shadow -- later in the file, same specificity --
REPLACED it, so today's column had silently lost its left rule. Both shadows
are on the one property now.

**And one thing the removal made necessary.** With the header cell the only
mark, it has to be on screen: a Sunday sits past the right edge of a narrow
window. The grid now scrolls today's column into view after a render, only
when it is actually out of view and never behind the sticky bus column.
Measured at 900px: scrollLeft 102, today fully visible; at 1440px it does not
scroll at all.

**2026-09-06 - the grid, tightened, and what was actually wrong.** The bars
were never mis-PLACED: measured against the day header columns at eight
viewport widths, the worst error was 0.02px, because the seven columns are
equal `1fr` and the track spans exactly them, so a percentage of the track
lands on a column boundary. Four things around that were wrong, all found
by measuring rather than looking.

1. **The gap was asymmetric**: 2px left and right against 4px above and
   below. One `--sch-gap` at `spacing-02` now governs all four sides.
2. **The bar's text did not line up with the day header's label**: 10px
   from the day boundary against 13px. The header's rule was a
   `border-inline-start`, which sits INSIDE the cell and pushes its label
   one pixel right of everything else measured from that boundary. It is an
   inset box-shadow now, which paints on the same pixel and moves nothing;
   with the 4px gap plus the bar's own 8px padding both now sit at 12px.
3. **Every rule in the body sat one pixel left of the rule above it.** The
   track paints its day rules with a repeating gradient, and it painted the
   LAST pixel of each day (`calc(14.2857% - 1px)` to `14.2857%`, read off the
   resolved `background-image`) while a `border-inline-start` paints a day's
   FIRST. Start-aligned now, so header and body draw the same line.
4. **A bar continuing from the previous week was one gap short.** It went
   flush to the left edge but still subtracted both gaps from its width, so
   it ended 4px before every other bar in that day.

**The gap is 4px because of what it buys**, not because it looked right:
two bars in neighbouring days sit 8px apart plus the rule, it is the same
number already separating stacked bars in a lane, and it is what puts the
bar's first character on the day header's own text edge. It costs 4px of
text width per bar, which matters at the 7rem minimum column where
destinations already truncate. 2px everywhere would buy that back and lose
all three.

Not changed and deliberate: a bar keeps five rows even when a row is empty,
so every bar in a lane is the same height. That is the old app's rule 1.1.

**2026-09-06 - the bus column, narrowed to what it says.** It held "Bus 218"
over "52 pax - Motorcoach" and took 9rem of a grid whose job is the seven
days beside it. Now the number alone, with the equipment as icons under it:
`accessibility` for an ADA lift, `hotel` for a sleeper, the warning mark for
an out-of-service window. Capacity, type and a non-active status are not
dropped, they moved to the row's `title`. Measured 1440x950: the head went
144px to 88px and each day column 117px to 138px, and the icons take their
colour from the same token in all five themes.

**5.5rem, not the 5rem tried first.** Three digits fit either way, but
"Unassigned" measured 66px against a 63px content box and clipped; the row
is worth its own word rather than an abbreviation.

**The two icons came from rux-ds, not from here.** Carbon ships both and the
sprite carried neither, so `tools/icons.mjs` there gained two names, the
glyph snapshot gained two entries and moved none, all 41 browser cells were
re-swept because `npm run icons` rewrites every page's inlined sprite, and
`v0.1.8` was cut. The pin moved to it. **A pin move does NOT refresh a page's
inlined sprite** - `new-project.sh` leaves pages alone by design - so the app
had the new icons in `vendor/` and the old sprite in its markup, with no
gate able to see it: `check.mjs` asks whether a `<use>` resolves, and it did,
against the stale copy. `tools/sprite.mjs` is the answer, and `--check` says
whether a page is behind the pin.

**2026-09-06 - the live week, read only.** `index.html` now draws the real
schedule: `sch-data.js` reads `buses`, `trips` with their `trip_assignments`
and `trip_drivers` nested, `drivers` and `bus_out_of_service` straight from
the Supabase project the rux-ui app writes, through the client
`/account.js` exposes. Nothing writes; New trip ships disabled. Week
navigation works. The static states moved to `specimen.html`, which needs no
network and stays the design reference; it is deliberately not in the nav.

**A bar is one ASSIGNMENT, not one trip** - the model the data actually has.
A trip carries an outbound leg and, when it is a drop-off and pick-up, a
return leg days later; assignments name a bus per leg and per position. So
the Dallas trip of 7 to 11 September renders as seven bars across seven bus
rows, each labelled its position of seven, and a drop-off renders as two
bars on one row with a gap. A leg needing more buses than it has
assignments puts the difference on Unassigned as "Needs a bus"; verified on
Harlingen (pm) that week, which needs four and has three.

**Two faults found by measuring, not by reading.** The week label built by
hand read "7 - September 13, 2026"; it is `Intl.DateTimeFormat.formatRange`
now, which knows the form for the locale. And the day header only sticks to
its SCROLL CONTAINER, which was never scrolling - the page was, so the
header slid away above ten bus rows. The grid is its own scroll pane now;
measured after, the header holds at the top and the bus column at the left
through both scroll directions.

**No conflict marking, deliberately.** Placement here is by day, and two
same-day trips on one bus are ordinary. Marking every overlap would cry
wolf on most rows; real detection needs the times, which is the
time-aligned mode, which is later. The specimen still draws the state.

**ONE THING NEEDS RUX'S CALL: amber.** rux-ui stores a colour name and its
own module maps retired names onto five live ones - teal, green, purple,
amber, pink. Carbon's tag palette has no amber, and amber is the most-used
of the five (22 rows of 64 counted 2026-09-06, counting the yellow that
maps to it). It renders warm-gray today, which is honest but drops the
distinction. Either amber goes neutral, or `sch.css` gets one bar hue that
is not a Carbon tag. Not decided here.

Measured live at 1440x950 against the real project: current week 11 rows and
19 bars, next week 18 bars with 7 multi-day, one continuing into the week
after, two unconfirmed drawn hollow. All five themes resolve their own
tokens, read off the computed styles rather than the screenshots, which lag
while the browser pane is hidden. Selection, keyboard Enter and both size
tiers work on live bars: 88px compact, 98px comfortable.

Not covered: no drag, no editor, no realtime, no time-aligned mode, no
two-week view, no print. The side nav's other five items go nowhere yet.
`check-a11y` and the spacing gate are rux-ds's and have never run against
this app.

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
