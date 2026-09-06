# Log

Every dated pass and answered decision, newest first. `AGENTS.md` is the
policy; `docs/backend-inventory.md` and `docs/screen-inventory.md` are the
two inventories the rebuild starts from.

**2026-09-06 - the correctness pass: feedback, failure, and two dead
controls.**

**Week navigation said nothing while it worked.** Measured: 120ms after
pressing the arrow, the label, the bars and the status were all still the
previous week's, so two presses read as a page that had not noticed. The week
being asked for is known the moment the button is pressed, so the label moves
first and the grid dims to 0.55 with `aria-busy` set. **Dimmed, not cleared**
- the week on screen is still worth reading while the next one loads.

**A failed week no longer takes the last good one with it.** It hid the grid
outright, so one dropped request wiped what was there. The rendered week is
tracked separately from the one being fetched: on a failure the label goes
back to what is actually drawn and the notice says which week failed and that
the old one still stands. Only a first load with nothing drawn stays empty.

**A stalled read had no end.** Trying to test the failure path is what found
it: with the network blocked the grid sat dimmed and busy past seven seconds
with no error and no way back but a reload, because a hanging connection
never rejects. `read` loses a race against 15 seconds now. Verified end to
end with a fetch that never settles: the timeout fires, the error reads "The
schedule did not answer within 15 seconds. Still showing the week that did
load.", the grid keeps its 19 bars, the label returns to the drawn week, busy
and the dim clear, and pressing the arrow again is a working retry.

**Two controls that did nothing are gone.** New trip was the most prominent
thing on the page and was disabled; it returns, right-aligned, the day the
trip editor does. Five of the six side-nav items pointed at this page, so
clicking Drivers silently reloaded the schedule - worse than not offering it.
Carbon compiles no disabled state for a side-nav link and inventing one is
not this app's to do, so **the nav lists what exists** and each returns when
its page does.

**2026-09-06 - toolbar buttons to the small size, and a height bug it
uncovered.** All four are `layout--size-sm`, 32px rather than 40, which is
Carbon's own size for a dense context and takes the toolbar row from 40px to
32. The 8px goes to the grid, because the pane's height is measured now
rather than guessed. The smallest target is 32x32, comfortably over the 24px
WCAG 2.5.8 minimum, and this is a pointer-driven dispatch board.

**The bug: the height only followed a window resize.** The pane's own box and
the block above it can change without one, and the case that matters is the
status notification - a week with no trips draws one, the grid starts 80px
lower, and its height has to follow or it runs off the bottom. Reproduced by
hand: the pane's top went 128 to 208 and its cap stayed where it was,
overflowing the viewport.

`sch.js` exposes `Rux.schedule.fit` and `sch-data.js` calls it right after
the line that shows or hides that notification, so the renderer says when
rather than leaving it to be noticed. Measured after: pushed down, the cap
tracks 790 to 710 and leaves exactly 32px below; restored, back to 790.

**A ResizeObserver is also wired, and it is UNVERIFIED.** This browser pane
does not render while hidden and ResizeObserver delivers at paint, so no
callback ever arrived in testing - a probe observer added by hand counted
zero over a change that moved the pane 80px. It is kept because it is correct
and free, not because it was seen working, and the explicit call is what the
behaviour actually rests on. The `window.resize` listener WAS proven, by
dispatching the event by hand after this harness changed the viewport without
firing one.

**2026-09-06 - the toolbar reordered: move, then read, then act.** It ran
New trip, prev, Today, next, label. It now runs prev, next, Today, label,
then New trip on the right.

- **The two arrows are neighbours** because paging back and forth is the most
  repeated gesture on the page, and Today between them put a 70px hop between
  the pair.
- **The label stays after the controls that change it, never before.** This is
  the constraint that decided the order: "August 31 - September 6, 2026" is
  wider than "September 7 - 13, 2026", so anything placed after the label
  slides sideways as the week changes, moving the very buttons being clicked.
  Verified over three weeks - the arrows and Today hold at 64, 112 and 160px
  and New trip's right edge at 1376 while the label changes width under them.
- **New trip is right-aligned**, flush with the grid's right edge, which is
  Carbon's own place for a primary action and keeps creating a trip clear of
  the paging controls.

Considered and rejected: the label as a left-hand title with every control on
the right, which reads well but puts 1200px between reading the week and
changing it, for the action repeated most.

**2026-09-06 - the page heading goes to the outline, and the grid takes the
room.** Two changes, and only together do they pay.

The heading was 42px type in a 50px line and, with the stack gap under it,
cost 66px of a viewport where a bus row is 95px. Three pieces of chrome
already name the page - the tab title, the app name in the header, and the
current item in the side nav - and the toolbar below carries the week, which
is the part that changes. It is `rux--visually-hidden` now, so the document
outline and anyone arriving by screen reader still get it.

**On its own that would have gained nothing**, and this is the part worth
remembering. The grid's height was capped at `100dvh` minus a hard 15rem, a
number tuned by hand to whatever chrome happened to sit above it: at 950px
the pane came out 708px because 950 - 240 - 2 is 708, so the cap decided, not
the space. `sch.js` measures the pane's own top now and subtracts the content
region's own bottom padding, which means any change above the grid - a
heading going, a toolbar wrapping - turns into grid. The stylesheet keeps its
old cap as the no-script fallback.

Measured after, at 1440x950: pane top 136, height 780 against 708, exactly
32px left below it, and eight bus rows visible where seven fitted. At
1200x500 the 24rem floor holds at 382px and both the page and the grid
scroll. At 1440x1100 it grows to 930 on the resize listener alone.

**2026-09-06 - three pixels clear, evenly, on rux's call.** The gap was 4px
to every boundary and the clear space was not: 3px left and bottom against
4px right and top. **Every rule is 1px painted on one side of the boundary it
marks**, so it falls inside the gap on that side - the day rule sits in its
column's first pixel, the row rule in its row's last - and outside it on the
other. Two variables now: `--sch-gap` where the rule is inside, and
`--sch-gap-clear`, one pixel less, where it is not.

Measured after: 3px clear on all four sides, the bar unchanged at 88px, the
single-lane row 95px rather than 96. The bar's first character still lands at
12px from the day boundary, which is where the day header's own label starts,
so the alignment that mattered did not move.

**The continuing edges keep no gap, which was rux's own point.** A bar running
in from last week sits flush at the track's left with 3px on its right; one
running out into next week is flush at the right with 3px on its left. The
space is what says the trip stops there, so an edge that does not stop has
none. Verified on the specimen, both directions.

**Between two stacked bars stays 4px.** There is no rule there - it separates
bar from bar rather than bar from line - and at 3px two bars in one row would
read as closer to each other than to the grid.

**2026-09-06 - whole-pixel day columns, and what "pixel perfect" turned out
to mean.** rux asked for the bars to be pixel perfect in the grid. Audited
first: **the placement arithmetic was already exact**, worst deviation 0.016px
across six viewport widths, because the bars are positioned inside the track
and the track is a grid item spanning the very columns they are measured
against.

**The columns themselves were the problem.** `1fr` is a seventh of whatever
is left over, which is almost never a whole pixel. Measured at 1440 on a 2x
display: the track 1253.992px, a day 179.1417px, the day boundaries at 121,
300.141, 479.281, 658.422, 837.57 and so on - and 37 of 38 bar edges missing
a device pixel, the worst by 0.438 of one. The browser then paints every bar
edge, and every day rule, across two device pixels.

`sch.js` now floors the day width to whole pixels and **gives the remainder to
the bus column**. Parking it in the last day would make one column visibly
wider than its neighbours; leaving it at the right edge would open a gap
inside the pane's border. The bus column carries no alignment of its own, so
a few pixels there are invisible and the grid still fills its pane exactly.
When the floor binds the columns are already at `--sch-day-min` and the grid
scrolls, so there is no remainder to place.

After: every column exactly 179px at 1440, every boundary an integer, worst
edge 0.031 device pixels, which is float noise. Checked at 1441, 1443, 1447
and 1520, where the day lands on 179, 179, 180 and 190 and the grid fills
each time; at 900 the floor binds at 136px and it scrolls; the specimen gets
it too, since both pages load this file.

**It is an enhancement, not a requirement.** Without the script the
stylesheet's own `minmax(--sch-day-min, 1fr)` renders, which is exactly what
shipped before, so there is no state where the grid depends on it to work.

**2026-09-06 - the side nav is behind the hamburger at every width.** rux's
question was whether this just makes desktop behave the way the narrow
breakpoint already does, and it does, with one difference: the scrim stays
below the breakpoint, so at desktop the nav opens over the page with nothing
dimmed.

**It needed no new CSS and no change in rux-ds.** Three compiled Carbon
classes and one attribute:
- `header__menu-toggle__hidden` is OPT-IN, not forced - Carbon hides the
  button above 66rem only if the markup asks. Removed, so the button shows.
- `side-nav--hidden` is declared AFTER `--side-nav--ux` and BEFORE
  `--expanded`, so carrying it permanently makes the nav 0 at every width
  while the hamburger's own `--expanded` still opens it to 16rem.
- The page's 18rem content offset, which existed to clear a persistent nav,
  is gone; the nav is `position: fixed` at z-index 8000 with an opaque
  background, so it covers the grid rather than pushing it.
- The button's label is Carbon's own "Open menu", because `js/ui-shell.js`
  swaps only that known pair and left "Toggle navigation" alone.

`js/ui-shell.js` has no width gate at all - the 66rem in it is comment, not
code - so the toggle it already ships works at desktop untouched. The earlier
reading that this would need a change there was wrong and is corrected here.

**A day column goes 143px to 179px, text 119px to 155px**, which is more than
every other adjustment today put together. Verified at 1440: closed 0 and open
256 with the grid never reflowing, glyph swapping to the X, aria-expanded
tracking, Escape closing and restoring the label. At 900: closed 0, open 256,
scrim 900x850 and active, exactly as before.

**A measurement trap worth recording.** getComputedStyle right after a class
change returned the PREVIOUS value in this browser pane, which made `--hidden`
look inert and `--expanded` look like it collapsed the nav - the readings were
lagging one step. Forcing layout with offsetWidth and waiting two animation
frames fixed it, and the true readings then matched the stylesheet's own order
exactly: 256 / 0 / 256 / 256.

**2026-09-06 - the empty time row, and why it was empty.** rux asked why no
times showed. The bar was reading `trips.departure_time` and `return_time`,
and those columns are **null on all 743 rows** - counted, not sampled. They
are dead columns; nothing has ever written them.

The times live in the itinerary. A leg's first `pickup` stop holds the
departure in `depart_prev` and its last `return` stop holds the arrival in
`arrive`. That is rux-ui's own rule, `extractTripTimes`, with one correction:
it read a trip's stops without regard to leg, and a bar here IS a leg, so the
return leg of a drop-off now reads its own stops. The trip columns stay as
the fallback they were written to be.

Measured over a 90-day window: 99 trips, 80 with stops, 72 with both a
departure and a return derivable, 74KB for the nested query. On the current
week 18 of 19 bars now carry a time and none of them clips.

**The SPOT time is read and deliberately not drawn.** The row is one line in a
column of about 119px and two times already fill it; three would not fit. It
belongs on the trip editor, which does not exist yet.

**Not handled: a return after midnight.** "Banquete, TX 12:23 - 01:38" is real
data and the bar gives no sign that the arrival is the next day. Day
granularity cannot show it; the old app only distinguished it in time-aligned
mode, which is later.

**2026-09-06 - the bus column, 5.5rem to 3.5rem, and what actually made it
possible.** rux asked whether stacking the equipment icons would let the
column be narrower. Measured first, and it would not have: at 88px the two
icons side by side came to 36px, a three-digit number to 26px, and the word
"Unassigned" to 66px against a 71px content box. **The LABEL was the column's
width.** Stacking icons that were already narrower than the number above them
saves nothing on its own.

So both: the icons are in a column, and the row is labelled "No bus", which
wraps to two lines and puts the full sense in the row's title. The widest
thing left is the number, and 3.5rem carries a four-digit one; the floor
below that is the corner's own "Bus" at 39px. The corner also took the row
head's inline padding rather than the day cells', so that word starts on the
same pixel as the numbers under it - measured, both at 329px.

The 32px goes to the days: a day column reads 143px at 1440 against 138px
before, and 119px of text against 114px. Nothing clips at 1440, 1000 or 900,
and "No bus" wraps to two lines at all three.

**2026-09-06 - the day column floor, raised to 8.5rem.** rux asked whether a
minimum width would do, given the grid already scrolls past it. It does, and
the exact threshold was measured rather than picked: at 8.5rem the 1fr share
of 138px still wins on a 1440 window and nothing changes, at 9rem the floor
binds and pushes 42px of overflow. So 8.5rem is free where the week fits and
worth 24px a column where it does not - 112px of text at the old 7rem against
136px now.

**What a floor cannot do, said plainly.** It only binds when the columns would
otherwise be narrower, so it buys nothing on a wide window; only a floor ABOVE
the 1fr share could, and that scrolls the whole week at every size. Measured
over 30 single-day bars across two weeks of real data, a destination needs
113px at the median, 167px at the third quartile and 349px at the worst
("Harlingen Convention Center Shuttle to UTRGV"). Fitting three quarters of
them means a 191px column, which is 1425px of grid before the bus column.

**The lever that would actually pay is vertical, not horizontal.** The bar has
five fixed rows and the time row is empty on most trips here; spending that
row on a second line of destination would roughly double the characters at no
horizontal cost. Not done, and not decided.

**2026-09-06 - one size, no switcher, on rux's call.** The bar shipped with
two density tiers behind a Carbon content switcher, compact at label-01 and
comfortable at label-02. The second tier is gone and compact is the only one:
12px text, 16px rows, an 88px bar. Old rule 2.8 allowed two and this takes
one, because the larger tier fits FEWER characters into a day column that
already truncates a destination, and the switcher spent a toolbar control
saying so. `--sch-fs` and `--sch-row-h` stay as the derivation of the row
height, not as a knob.

The toolbar is now four controls and the week label. `sch.js` is back to one
job, selecting a bar, since the switcher was the only thing it drove besides
that; the spacer that existed only to push the switcher right went with it.
Measured after: no switcher in either page, no `sch--lg` anywhere, bar text
12px, row 16px, bar 88px, and selection still sets `aria-pressed`.

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
