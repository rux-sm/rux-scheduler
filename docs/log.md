# Log

Every dated pass and answered decision, newest first. `AGENTS.md` is the
policy; `docs/backend-inventory.md` and `docs/screen-inventory.md` are the
two inventories the rebuild starts from.

**2026-09-06 - the gutter restored, and the entry below corrected.** rux saw
the board flush against the panel, border on border, and asked whether there
should be space. There should, and there had been until the previous change
took it away.

**THE "RESERVED TWICE" REASONING BELOW WAS WRONG.** The 64px between the board
and the panel was not the shell's gutter paid twice; it was the shell's gutter,
once, doing its job - the same 64 the board has from the viewport's LEFT edge.
The "384px gap" that reasoning started from was the panel measured
mid-entrance, 320px right of where it settles, which that same entry then
went on to warn about. Half of the entry was right: the transition really did
stop the padding applying, and its removal stands.

**What IBM does, which is what the original 30rem did.** The slide-in variant
sets the page content's inline-end margin to the PANEL'S FULL WIDTH, and the
content's own padding is what keeps it off the panel's edge. No capture
records page content beside a panel - all nine hold a data table - so this
comes from the component's contract rather than a story, and it is confirmed
by the test that matters: the board is framed alike on both sides. Measured
settled at 1440, left gutter 64, right gutter 64, borders not touching.

The measurement in `sch.js` stays, set to the panel's width rather than a
constant, so a panel at another size or a shell with another gutter is still
right by it. The stylesheet's 30rem is the no-script fallback.

**Three lessons from one afternoon of measuring this page**, each paid for: a
hidden pane freezes transitions and reads their start value; a fronted pane
still reads the panel 320px out until its entrance ends; and a number that
happens to endorse a change already made deserves the most suspicion, not the
least.

**2026-09-06 - the space between the board and the panel, which was two
bugs.** rux asked what sets it and whether that much was intended. It was not,
and neither half of it was deliberate.

**ONE: the transition stopped the padding applying AT ALL.** `.sch-page` had
`transition: padding-inline-end .11s`, and with the panel open the class was
on the element, the rule declared `padding-inline-end: 30rem`, its sheet was
enabled and unwrapped, `page.matches()` was true - and `getComputedStyle`
still returned **0px**, with NO transition object in `getAnimations()`.
Suppressing transitions returned 480px immediately. So the page never made
room and the board ran 96px UNDERNEATH the panel. That animation had already
cost one defect earlier today, when `fit()` measured the page mid-transition
and sized the grid for a width it was about to lose. Two bugs for an animation
nobody asked for, on a page whose panel already slides: removed. The
`transitionend` re-fit went with it, having nothing left to wait for.

**TWO: the room was reserved twice over.** The panel is `position: fixed`
against the VIEWPORT's right edge; `.sch-page` is not there - the shell's
content region holds its own gutter, 64px at 1440. Reserving the panel's full
480 from the page's own edge pays that 64 twice, and it shows as dead space
between the board and the panel. Only the overlap is owed, and that is a
measurement rather than a constant: it moves with the shell's padding and the
panel's size. `sch.js` sets it; the stylesheet keeps 30rem as what renders if
the script never runs, erring toward too much room rather than a board hidden
under the panel.

Verified at 1440: padding 416, board right 960, panel left 960, gap 0, and the
board 64px wider than before. Closed, the padding is removed and the week goes
back to 181px columns.

**A measurement note, twice paid.** The panel reads 320px to the right of
where it settles while its entrance animation runs - that is
`--panel-transform`, not a gap - so a "320px gap" appeared in the middle of
this and was not real. And an earlier read of the padding returned 0 with the
pane hidden, which looked like the same bug for a different reason: CSS
transitions do not advance in a hidden pane. Front the pane, let the animation
finish, then measure.

**2026-09-06 - the bus number centred, which was the price of the last
change.** Giving the bus column the flooring remainder aligned the board with
the toolbar and left the number sitting 8px from one edge and 13.8 from the
other at 1290, moving as the window did. Centred, the remainder splits.

Measured over the glyphs, not the element box, because the number fills its
cell and the box reads even either way: skew from 5.8px to 1px at 1290
(10.4 and 11.4), and 1px at 1440 (8.4 and 9.4). The residual is the glyph's
own side bearings, not a layout error. The corner's "Bus" centres with it -
12.3 and 13.3 - and `.sch-day` keeps its start alignment, since a day name and
its date read left to right. The board still meets the toolbar at 0 in both.

The column carries an identity rather than a value, so nothing there wants a
shared left edge with a column of figures.

**2026-09-06 - the strip at the right edge, and a decision reversed.** rux saw
the board's right edge failing to line up with the New trip button above it.
Real, width-dependent, and mine: 0px at 1440, 2px at 1400 and 1365, 4px at
1290.

**IT WAS DELIBERATE AND THE DELIBERATION WAS WRONG.** `fitColumns` floors the
day width and the leftover has to go somewhere; earlier today it was put
OUTSIDE the pane, narrowing the board so the spare pixels sat in the page's
padding "where nothing reads it as part of the grid". They do read as part of
it - as a ragged edge against the toolbar, which is worse than what that
choice was avoiding.

**The bus column takes the remainder again.** The head becomes
`pane - day * days`, so the columns fill the pane exactly and the right edges
meet. Verified at three widths: gap 0 at 1440, 1400 and 1290, columns summing
to the pane in each, with the head growing 43, 45, 47 to absorb it.

**AND IT SIMPLIFIED THE CODE.** No explicit `inline-size` is needed at all now
- the pane simply fills the board - which retires the `flex-grow` pinning
added earlier today, whose only job was to stop the pane being stretched past
a width nothing sets any more.

**The cost is real and is the one the earlier note named.** Measured with a
Range over the glyphs at 1290: the bus number sits 8px from the left of its
column and 13.8px from the right, and that right figure moves as the window
does. Element boxes read 8 and 9 and hid it - the number fills its cell, so
only the glyph box tells the truth. If it grates, centring the number in the
column splits the remainder evenly and is one declaration; rux's call, not
taken here.

**2026-09-06 - cancel, not delete, and a defect it uncovered.** rux described
the old board's only bar action: cancel, which gives the trip a cancelled
status and takes it off the schedule while leaving it on the trips page, "its
useful to know about trips that were cancelled". Deleting outright belongs on
that page, for test rows worth nothing to anybody.

**THE SCHEDULE HAS BEEN DRAWING CANCELLED TRIPS AS LIVE WORK.** `cancelled_at`
is set on 41 of the 743 rows and the week read never excluded it. Three of
those 41 overlap the week on screen right now - Local and Hidalgo TX on the
3rd, Edinburg TX on the 2nd - so this was not theoretical. Proven by trip id
rather than by destination text, because a first attempt matched on text and
"Edinburg, TX" also names live trips: it read 2 where the honest answer was 0
after the fix and 3 before it. The read now filters `is('cancelled_at', null)`.

**Cancel asks for a reason and stores it when given.** 32 of the 41 already
carry one, so it is normally written but not always, and refusing a cancel
without one would be stricter than the data has ever been. The modal's
structure is copied from `templates/wizard-page.html`, which confirms a cancel
the same way; `modal.js` supplies the focus trap, Escape and
`data-rux-close`. Danger styling, because it takes a trip off the board -- but
it is reversible, which is exactly why it is not a delete.

**Delete is still not built anywhere**, and now has a home in the plan: the
trips page, once that exists.

**Verified against production and restored.** Banquete, TX: the modal named
the trip and its customer, cancelling set `cancelled_at` and the reason, the
bar left the board, and the notice said where it went. Then both columns were
nulled and the cancelled count went back to exactly 41 with 743 rows.

One measurement note: the modal read `opacity: 0` from a computed style while
the screenshot showed it fully painted. The same stale-style trap as the side
panel; the screenshot is what settled it.

**2026-09-06 - the bar's right-click menu.** `screen-inventory.md` section 5
keeps three of the old bar's five icons - Open trip, Move bus, Print envelope -
and section 7 says the ones wanted WITHOUT opening anything belong on a
right-click menu. Two of the three are here.

**Open trip**, which the panel already does on a left click, and **Take off
this bus**, which is Move bus in the only form it can take without a list of
every bus. That write is not new: it is exactly what the drag does when a bar
is dropped on the Unassigned row.

**Hidden where it cannot act.** A bar with no assignment row is an unfilled
slot in the Unassigned row and there is nothing to clear, so the item is not
rendered rather than rendered disabled - a disabled item that can never enable
is worse than no item. Verified on the bar after unassigning it: menu opens,
the item is gone.

**Print envelope is the third and is deferred, not forgotten** - printing is
step 5 of the build order and nothing prints yet.

**Delete is not on this menu and that is deliberate.** The inventory never
lists it among the bar's actions, so it has no home in the plan; inventing one
for an irreversible write, on a menu, is not a call to make in passing. Worth
rux deciding where it belongs.

**Verified against production and restored.** Open trip opened the panel on
"Banquete, TX". Take off this bus set `bus_id` null, the board redrew the bar
in the Unassigned row, the notice read as expected, and the assignment was put
back on its original bus with a match confirmed.

The placement arithmetic both menus use is now one function; the cell menu's
handler already returned early on a bar, so the two contextmenu listeners on
the grid do not fight.

**2026-09-06 - right-click an empty cell, the old board's gesture.** rux said
the old app offered "add new trip" from a context menu on an empty spot, with
the date and bus already filled. It is worth keeping for the reason it
existed: the two things a new trip most needs are the two the cell already
knows, so creating from a cell leaves only the destination to type.

**Which day, from the pointer.** The track is ONE element spanning all seven
columns - bars sit inside it by percentage, not in per-day cells - so there is
no element to read the day off. It is the pointer's offset across the track
over a seventh of its width, the arithmetic `clip` does in reverse. Verified:
a press at 2.5/7 across row 763 filled in Wednesday 2026-09-02 and bus 763.

**Only on empty space.** A right-click on a bar is left alone; that gesture
wants the bar's own actions, which are not built, and offering "new trip here"
over an existing trip is the wrong answer to it.

**Two writes, and the second can fail on its own.** The assignment needs the
trip's id, which only exists after the insert, so `.select('id').single()`
returns it and a second insert puts the bus on. **If that second write fails
the first still stands**, which this client cannot roll back and should not
pretend to: the trip exists with no bus, so it appears in the Unassigned row,
and the notice says exactly that rather than claiming the whole thing failed.

**Created against production and deleted.** Trip on 2026-09-02 with an
assignment carrying the right bus, `leg: outbound`, `position: 0`; the board
drew the bar on row 763 and NOT in Unassigned. Deleting the trip cascaded the
assignment away, back to 743 rows, and a `like 'ZZ %'` sweep returned empty.

**AND IT EXPOSED A QUIET BUG OF MY OWN.** `NOTE` carried only `error` and
`info`, and `say` falls back to `info` for anything else - so every "Saved 1
change" and "Trip created" notice since the editor landed has been rendering
as an INFO notice. Right words, wrong kind, hidden by a fallback. Found only
because `warning` was needed for the half-finished create. `success` and
`warning` are in the map now, both classes written out in full, and the create
above was confirmed carrying `rux--inline-notification--success`.

**2026-09-06 - New trip, and the button's own promise kept.** The toolbar
comment said it would come back "on the day the trip editor does", absent
rather than disabled because a disabled primary button was the most prominent
thing on the page and did nothing. Dates were the only thing standing in the
way, so it is back: primary, rightmost, which is Carbon's place for the action
that creates something.

**It opens the same panel with nothing in it.** A trip needs exactly one thing
to exist on the board - a start date, since `legsOf` builds the outbound leg
only `if (trip.start_date)` - and with no assignment the render pushes it into
the Unassigned row. So creation needs no bus and no drivers, and the Fleet tab
says as much instead of showing blanks.

**Every default is the data's, not invented.** Counted across all 743:
`trip_type` never null and 705 round trips, so that is the type; `bus_count`
never null, so it is written as 1 rather than left for `|| 1` to cover;
`confirmed` never null with 274 already false, so a trip nobody has confirmed
is a normal row and the box starts clear; `destination` null on NONE, which is
why it joins the start date as required - a null would have been the first in
the table. `customer` is null on 26, so it is not required.

**A new trip is saveable with nothing touched**, because its defaults are
already a real trip. The dirty test is for edits; creation only asks whether
the two required fields are filled.

**Created against production and deleted.** 743 rows before, 744 after, the
row carrying exactly the defaults above, and the board drew ONE bar for it in
the Unassigned row - `inUnassignedRow: [true]`, which is the claim this whole
design rests on. Then deleted by id, back to 743, and a `like 'ZZ TEST%'`
sweep returned empty.

**A third invented class, caught by the gate.** The button was written with a
`rux--btn__label` span around its text; Carbon compiles no such class and puts
the label as bare text beside the icon, which is what `templates/table-page`
does. That is three this session - the interpolated date-picker container, the
invented date-picker invalid state, and this - all three caught by
check-classes rather than by me.

**2026-09-06 - the ring around the whole form, and two widths.** rux asked
whether the form should be selectable like that, and whether notes and dates
should span the panel.

**The ring was a real defect and ARIA names the rule.** A tabpanel takes
`tabindex="0"` only when NOTHING inside it is focusable. Details holds 16
focusable controls and carried the attribute anyway, so the panel was a
redundant tab stop that drew a focus ring around the entire form. It is now
decided per panel from its contents at render time, not written into the
markup once: Details drops it, Fleet KEEPS it, because Fleet is read-only and
without it a keyboard user could reach the tab and never reach what it
reveals.

**Notes should fill, and does now.** `.rux--text-area__wrapper` is
`display: flex` at `inline-size: 100%`, but `.rux--text-area` carries no width
of its own, so as a flex item at the default `0 1 auto` it took its basis from
the HTML `cols` default and sat at 190px inside a 447px wrapper. That 190 is
the BROWSER's number, not Carbon's -- nothing in rux.css sizes the control.
Growing it is what the 100% wrapper already said was intended.

**The dates should NOT, and are left alone.** `.rux--date-picker__input` is an
explicit `inline-size: 8.96875rem` in Carbon's own CSS. A date is a
fixed-length string; the width is a decision, not an oversight, and two of
them leaving space to the right is how a Carbon form looks. Stretching them
would be a divergence with nothing behind it and no functional gain.

Verified: Details `tabindex` absent with 16 focusable inside, Fleet `0` with
none, notes 447 against a 447 wrapper, date inputs still 144.

**2026-09-06 - the tab spacing, and only half of it was wrong.** rux asked
whether the tabs should reach the panel's sides or keep the gap. Measured
against the panel edge at 480px: title 17, tab strip 17 left and 16 right,
form fields **33 and 32**.

**The strip's inset is Carbon's and is right.** `side-panel__inner-content`
is `padding: 0 1rem 1rem`, so the strip lines up exactly with the panel's own
title. Nothing to fix.

**The content was double-padded.** `.rux--tab-content` adds a density-derived
inline padding of its own on top of the panel's, so every field sat 16px
further in than the title above it - a ragged edge running down the panel,
which is what could be seen. `rux-overrides.css` zeroes the INLINE padding
only, inside a side panel only, at Carbon's own specificity. The block padding
stays: it is the separation between the strip and what it reveals, and the
panel supplies none of it.

**NO CAPTURE SETTLES THE FULL-BLEED QUESTION.** None of the nine captured
side-panel stories contains tabs - every one holds a data table - so there is
no reference for tabs inside a panel and full bleed would be a divergence with
nothing behind it. The inset at least matches the one alignment the panel
already asserts. Said plainly rather than answered from taste.

Verified: title, strip and fields all at 17 left and 16 right.

**2026-09-06 - trip dates, and split is two outings not one range.** rux asked
whether From/To could serve round trip and split with a depart-only field for
one way. **The data says no to both halves of that**, so it was measured
across all 743 trips before anything was built.

| type | n | outbound | return dates |
|---|---|---|---|
| round_trip | 705 | end differs from start in 268 | never |
| one_way | 26 | one day in 25, THREE in one | never |
| dropoff_pickup | 12 | always exactly one day | always set, always later |

**A split is not a range.** All 12 drop off on a single day, the bus LEAVES,
and it returns 1 to 4 days later - Sandia TX drops 19 July and collects 22
July. A From/To range would claim the bus for those four days when the point
of the type is that it is free in between, and the board already knew: legsOf
makes two legs and draws two bars. **And one way is not a single date** - 25
of 26 run a day, but Corpus Christi runs 2027-01-31 to 02-02, which a
depart-only field would have silently collapsed.

So it is ONE control repeated per leg: an outbound From/To for every type, and
a second pair labelled Pick-up shown only for a split. That maps onto the four
columns and onto how bars are already placed, so nothing is special-cased at
render time.

**The return pair is nulled off a non-split on save, on rux's instruction**,
because legsOf reads those columns whatever the type says and would draw a
phantom second bar.

**Verified against production and restored.** Trip
`f522945d-b51f-4480-a072-7f63b5ceaf4e`: made a split with a pick-up on the
6th, saved, and the board drew TWO bars - outbound at day 3, return at day 6.
Switched back to round trip, saved, both return columns came back null and the
board went to one bar. Restored all five columns and compared against the
recorded original.

**A start date is now unsaveable when empty.** legsOf builds the outbound leg
only `if (trip.start_date)`, so a null start takes the trip off every week
while leaving the row in the table - lost rather than deleted, by the editor
that just did it. Clearing it disables Save and marks the field
`aria-invalid`. The end date needs no such guard: blank means the same day,
which is also what the picker leaves behind after the first click of a range.

**Two gates caught two real mistakes in this pass, both mine.** The container
class was built as `rux--date-picker-container--${which}` and check-classes
cannot see through an interpolation, so it read an uncompiled fragment and
failed - both names are written out in full now, the same rule the
notification kinds follow. Then the invalid state hung a
`rux--date-picker--invalid` class on the root, which Carbon does not compile
at all; that is inventing a class to hang a rule on, and the gate said so.
`aria-invalid` alone does the job.

Not done: the New Trip button. Dates were the thing blocking it, so it is next.

**2026-09-06 - the sliver right of Sunday, and it was two bugs.** rux saw a
few pixels of daylight between the last day column and the pane's border at
full width. Real, and mine.

**One: the head column was reserved at a width it never took.** `fitColumns`
ceils the corner to keep the pane on whole pixels -- 42.203 becomes 43 -- and
builds the pane's width from that, but the column itself stayed `max-content`
and kept its fractional width. So the columns summed to 1309.203 inside a
1310px content box and 0.797px fell out at the right, about two device pixels
on a 2x display. The fix is to pin the column to the figure already reserved
for it.

**Two, and it only appeared once the first was fixed: `flex-grow` handed the
remainder back.** The whole point of the narrowing is that the leftover pixels
sit OUTSIDE the pane's border where nothing reads them as part of the grid.
`.sch-board > .sch` grows, so the pane was stretched to fill the board again
and 2.805px reopened with the driver grid on.

**And grow could not simply be removed, which the first attempt did.** Growing
is also the MEASUREMENT: `fitColumns` reads `clientWidth` off the pane to
learn how much room there is, and a pane that cannot grow measures its own
content -- 995 instead of 1310, so the week never widened past the floor and
every day column sat at its 136px minimum. Caught immediately because the
check reads the day width, not just the gap. So grow is restored for the
measuring pass and pinned to 0 for the width just set; the floor-binds branch
leaves it alone, since a grid wider than its pane should fill whatever room
there is and scroll.

Verified across five states at 1440, columns summing exactly to the pane in
every one that does not scroll: 1310/181, driver grid on 1030/141, trip panel
open 553 and scrolling at the 136 floor, then both back again.

**2026-09-06 - the trip editor, first slice.** Step 4 of the build order. The
panel gains Details and Fleet tabs and Details is editable: destination,
customer, type, the confirmed flag, the three requirement flags, notes. Every
one is a plain column on `trips` that changes nothing about WHERE the bar
sits, so a save is one update with no cascade.

**What is not editable and why, since `trips` has 88 columns.** Dates move a
bar across days and are read through legsOf/clip, so a wrong write moves a
real trip; they get a pass with the placement in front of them. Times are not
on the trip at all - they live per-leg and per-stop in `trip_stops`, which is
the itinerary editor. Bus and drivers are the Fleet half, read-only here.
Money, contacts and the per-leg workflow booleans want a fuller editor than a
panel.

**One Save button, because one is what is captured.** `action-set--row-double`
is compiled but no captured story shows a two-button action set, so the second
is not ours to invent. Close discards, and it already restores focus. The
markup for the action set, the tabs, the text input, the select, the checkbox
group and the text area all came from `carbon-ibm-products-dom.json` and the
vendored `templates/`, not from guesses.

**Dirty is computed, not tracked.** Every input re-reads the form against the
values the panel opened with, so typing a change and typing it back out again
disables Save rather than leaving it armed. Verified: disabled at open, armed
on edit, disabled on revert, armed on a checkbox, disabled when unchecked, and
a whitespace-only edit does not count because the read trims.

**Saved against production and restored.** Trip
`f522945d-b51f-4480-a072-7f63b5ceaf4e`, notes null before; wrote a marker
through the panel, read it back from the table, status said "Saved 1 change.",
then set it back to null and confirmed. The save reads the week back rather
than trusting the write, as the drag does.

Not done: the panel closes on save because a render replaces every bar, and
reopening on the new bar is not written yet. The Fleet tab is read-only. Both
tabs carried the leg's dates and times for one commit, which read as a bug;
they are in Details now, above the editor they belong to.

**2026-09-06 - back to xs, and the width derived rather than picked.** rux
asked for both. Rows return to 24px: 32 showed 23 of 40 drivers where 24 shows
31, and seeing the roster at once is the whole point of the grid. The header
stays at 32 to meet the schedule's day header, which is the one row where the
two grids sit side by side. The square follows the row, so a day cell is 24 by
24 again.

**The width is now content-sized, the same rule the bus column follows.** It
is only ever seven squares plus the longest driver name, so hand-setting it
means clipping a name or carrying dead space. `max-content` with a 22rem cap,
and `minmax(0, max-content)` on the name track so the cap shrinks and
ellipsises rather than overflowing. It comes out at 261px against the 304 of
19rem and the 368 it carried at 32px rows; the board gets the 43 back and now
measures 1035. Nothing clips, checked by `scrollWidth` against `clientWidth`
on all 40.

**THE FIRST MEASUREMENT OF THE NAMES WAS WRONG, and I reported it to rux
before catching it.** It said the longest name needed 131px, which would have
made 19rem the "derived" answer - a wrong number that happened to justify the
value already there, which is the kind that survives. The probe built its font
from `getComputedStyle(el).font`, and **that shorthand returns an empty string
here**, so every name was measured in the browser's default 16px serif and
inflated by about half. The real longest is "Vicente Solar" at 88px in a 91px
column. Read the longhands, or ask the rendered box whether it overflows.

**2026-09-06 - left of the board, and the trial comes out.** rux chose it,
so the dock and the right-hand slot are deleted along with the layout button
and the stored preference. One position, no switch.

**Every row is 32px now**, Carbon's sm and the height the header already had,
which makes the earlier "match the header, not every row" answer moot - rux
looked at it and wanted one height throughout. The square follows the row, so
a day cell is 32 by 32 and the aside widens from 19rem to 23rem to hold seven
of them plus a 142px name column. The cost is on screen: 23 of 40 drivers
visible against 31 at 24px rows.

Verified after the deletion: aside at x=64 with the board at 448, rows and
squares 32, header 32, both panes ending on the same line, and neither the
dock nor the layout button in the document.

**A process note worth keeping.** The cleanup went out as two heredocs and the
first one asserted on its last replacement, so `sch-data.js` was never written
while `sch.js` was - and `node tools/check.mjs` still exited 0, because a
stale module that parses is not something it can see. Caught by grepping for
the thing that should have been gone. Check the file, not the exit code, when
a pass is a deletion.

**2026-09-06 - beside the board means as tall as the board.** rux asked
whether the list should reach the schedule's height. It should: it had a
hand-set 30rem cap of its own and stopped short with empty page beneath it,
showing 18 of 40 drivers. In the side and left positions it now takes the
same measured height the grid gets, so both panes run 128 to 918 and 31 of 40
drivers are visible without scrolling. Docked it keeps the stylesheet's cap,
because there it sits BELOW the grid and this height would push it off-screen.

A measurement note: `.sch-avail__row` is `display: contents` and has no box,
so counting visible rows from their rects reads zero. Counted from the name
cells instead.

**2026-09-06 - a third position, left of the schedule.** rux asked about it
rather than a left-hand panel, and it is one property: `side` and `left` are
the same box in the same flex row, `order: -1` apart. The layout button cycles
Dock, Side, Left and names where it goes next. Verified through a full cycle:
aside at 1072 after the board, at 64 with the board pushed to 384, then the
dock.

**A left-hand Carbon panel was the other option and was argued against.** The
class is compiled and would have worked. But `screen-inventory.md` section 7
says a panel holds the DETAIL OF A SELECTED THING and closes when you are
done, and rux keeps this open the whole time - persistent reference belongs in
the layout. It also costs the same width as the slot already there, so it buys
no room, only a different edge to lose it from.

**What the left position trades, and it is not obvious in either direction.**
It puts the trip panel beside the board it describes, which is what rux found
awkward about the middle. It also puts the selected trip's date and the
squares that answer it at opposite edges of the screen, which is the pairing
the marked column exists to serve. Both are defensible; that is what the
trial is for.

**2026-09-06 - the header seam, fixed in the header.** rux asked whether the
availability rows should go to 32 to match the table header. Measured: both
grids start at y=129 and the schedule's day header is 32px against this one's
24, so the mismatch was one row and 8px. Taking every row to 32 would have
spent 320px of scroll to fix it - 40 drivers at 32 is 1280 against 960 - so
the header alone takes the schedule's height and the data stays at xs. Both
headers now run 129 to 161 and the cell is still a 24px square.

**2026-09-06 - the availability grid at xs, on rux's reading.** Still on
trial; this is the side layout made to fit its slot. Days are one letter,
M T W T F S S, because the day number is already directly above in the
schedule's own header and "T..." truncated twice said less than "T". The row
is 24px, which is the step Carbon's data table calls xs, and the day cell is
square at that: a day here is a STATE, so it wants to be a mark rather than a
box with text in it. It was 25 by 32, which read as neither. Everything the
squares do not need goes to the name - 80px before, 134 now.

`minmax(0, 1fr)` on the name track and not `1fr`, because a track's automatic
minimum is its content and a long name would have pushed the squares out of
the panel instead of ellipsing. Read live: 24 by 24, square, 40 rows.

**2026-09-06 - driver availability, built both ways to be decided from.**
rux was unsure about section 7's answer and asked to try both. Both are built,
one renderer fills one element, and the `Side`/`Dock` button moves it. **This
is a trial, not a decision**: the loser's slot and that button come out
together.

**It is the week grid again, not a third component.** `.sch-avail__grid`
carries `.sch-grid` and inherits its column template; the rules add a denser
row and three cell states, and nothing else. Free is the state with nothing in
it, because free is what is being looked for. Busy and time off are Carbon's
tag tints, the same palette the bars use.

**Busy is derived, time off is stored.** No table holds a driver's day: a
driver is busy because an assignment they are on covers it, so this walks the
same legs the bars are placed from - as correct as the board above it and
wrong in the same ways. `driver_time_off` is fetched by OVERLAP, not
containment, since a fortnight away has neither date inside this week. Read
live: 40 drivers, 16 busy cells, 4 on time off.

**What my recommendation had wrong, and rux was right to push.** Section 7 says
a second row group in the grid. That puts it in the SAME scroll container as
the buses, so it scrolls away exactly when there are enough buses to need it.
The dock is a separate pane instead: same columns, own scroll.

**Three defects found by building it, all fixed.** `fitHeight` gave the grid
every remaining pixel, so the dock began at y=950 in a 950px window - 240px
tall and entirely below the fold. `fit()` runs inside `openPanel` and measured
the page mid-transition, so the grid kept its pre-panel width; harmless with
only the grid there, but it pushed the aside to 1380 against a panel edge at
960. And `.sch-board` sits in Carbon's `rux--stack-vertical`, which is a grid,
where an item defaults to `min-width: auto` and will not shrink below its
content: the track was 832 and the box still measured 1316. `min-inline-size:
0` is load-bearing, and the comment says so.

**One number rux should weigh:** the side layout with the trip panel open
leaves the schedule 512px, under four day columns. The dock costs 240px of
height and leaves all seven.

**2026-09-06 - the flash again, and the cause I had wrong.** rux said it was
still doing it, and it was. **The entry below this one names the timer as the
cause and that is wrong.** The timer was a real defect - the exit was being cut
off at 88% - but it was never what rux could see, and fixing it changed nothing
for them.

**Carbon TRANSITIONS the panel, and the close was fighting that, not the
animation.** The base rule carries `transition-property: display, opacity,
transform` at 150ms with `transition-behavior: allow-discrete`. So ending the
close removes `--closing`, the exit animation's `forwards` fill goes with it,
and the panel does not snap out of sight - it TRANSITIONS back, sliding in
from 320px and fading up to full opacity. `display` is in that same list, so
`display: none` waits out the 150ms and the panel is on screen for the whole
return trip. The reappearance IS the removal, animated, which is exactly why
correcting WHEN the class came off did not help.

`transition: none` alongside the `display: none` already in the `[hidden]`
rule. It applies only while the attribute is set, so the entrance is untouched.

**Proved without a timer, because timing here cannot be trusted.** The end of a
close was reproduced by hand and the element asked what it was running.
Without the rule: `display: grid` with a live `CSSTransition` on `display`.
With it: `display: none` and nothing running. The opacity and transform return
is the same mechanism and was not isolated by that run - the synthetic close
had not moved them - but the `display` transition alone holds the panel on
screen at full strength, and that is the flash.

**Confirmed by rux the same day: no more flash.** Which is the reading that
matters, because the proof above is structural and the eye was the only
instrument that could see the defect in the first place.

**The harness wasted most of this pass and the reason is worth keeping.** The
browser pane throttles a page it is not showing: timers clamp to 1000ms, CSS
animations do not run, and `requestAnimationFrame` does not fire. Two
measurements were taken through that without noticing - a close that "finished
in 68ms" against a 4000ms animation, and a run with no animation events at
all. Front the pane before timing anything, and prefer a question that has no
clock in it: `getAnimations()` answered this one outright.

**2026-09-06 - the flash on close, and a timer that could not win.** rux saw
the panel appear again for an instant as it closed. It did.

**The exit's `forwards` fill is the only thing holding the panel off-screen.**
Carbon's exit is a 150ms animation; remove `--closing` and the element snaps
back to opacity 1 at its original position. The close used a
`setTimeout(150)`, which starts when it is called while the animation starts a
frame later, so the class came off at about 88% of the way through. Sampled
every frame: at 143ms the panel was at opacity 0.176 and 263px out, and the
next frame had it at opacity 1 and x=0.

Now `animationend` ends the exit and the timer is only a fallback, running
long at 400ms for the case where a stylesheet suppresses animations - which
the gate sweep does deliberately, and a panel that never hides would be worse
than one that flashes. **`hidden` goes on before the class comes off**, so the
snap happens to an element that is already `display: none`.

**The frame sampler could not see this defect, and could not prove the fix.**
It is worth writing down. The old code set `hidden` in the same statement pair
as the class removal, so no `requestAnimationFrame` sample ever caught a frame
that was both visible and at full opacity - the run before the fix looks clean
in the log. The animation runs on the COMPOSITOR, and cancelling it commits a
full-strength frame there that the main thread never observes. Visible to the
eye, invisible to script. What is measurable is that the animation now
completes - 0.102 at 287px on the last visible frame against 0.176 at 263px
before - and the rest is structural. **That sentence originally ended
"confirmed by rux looking at it", and that was never true:** rux looked
and it was still flashing. See the entry above for the real cause.

**2026-09-06 - the panel was open the whole time, and `hidden` could not
close it.** rux asked whether the panel is always open like that even when
empty. It was, on every load, and the entry below this one did not notice:
it recorded the open state in detail and never looked at the closed one.

**An author rule beats the browser's.** `.rux--side-panel` sets
`display: grid`, and the user-agent's `[hidden] { display: none }` is the
weakest rule in the cascade, so marking the element hidden did nothing at
all. Carbon has no closed state to reach for because its React version does
not render one - closed means absent from the document - and this app keeps
the element and toggles it, which is the arrangement Carbon never had to
style. Measured before the fix: `hidden` true and `display: grid` at 480px
wide with the page already giving up its 30rem.

`rux-overrides.css` gets its first rule, one line at Carbon's own
specificity: `hidden` means hidden. **The same trap as `.sch-row`**, whose
`display: contents` swallowed the attribute the same way when the empty bus
rows were meant to collapse; that one is in the stylesheet's header, and
this is the second instance, so it is a rule rather than a coincidence -
any Carbon class that sets `display` needs a `[hidden]` companion before
the attribute is used to hide it.

**Carbon's own animation classes now drive both directions**, since the
element persists: `--open` goes on after `hidden` comes off, and `--closing`
runs for 150ms before `hidden` goes back on, so the panel leaves rather than
vanishing. Verified live in all four states: at load `display: none` with
width 0; open, `display: grid` at 480 with `--open` set and the title
reading the clicked trip; mid-close, `--closing` present and not yet hidden;
closed, both classes cleared, `hidden` true, `display: none`, page padding
back to 0 and the day columns back to 181.

One measurement note, because it nearly produced a second wrong answer: the
first read after the close returned `display: grid` from a stale computed
style. Forcing a reflow first returns `none`. The same trap the pane has
shown before, and it makes a fixed thing look broken rather than the other
way round.

**2026-09-06 - the trip panel, read only.** Step 4 of
`docs/screen-inventory.md` section 5, and the first thing that makes clicking
a bar lead anywhere. It shows a trip; it changes nothing yet. Editing goes in
field by field, the way the drag did.

Carbon's `side-panel`, and **no rux-ds module claims it**, so opening and
closing it is this app's own behaviour on Carbon's own markup - the classes
are compiled and the structure is the sink's; only the open state is ours.
The slide-in variant, not the default: it drops the shadow because the page
makes ROOM rather than letting the panel float over the grid. `.sch-page`
takes the panel's 30rem as end padding and the grid follows on its own,
because it measures its pane. Measured with it open: page padding 480px, day
columns at their 136px floor with the week scrolling, grid right edge 896
against the panel's left at 960, so nothing is covered. Closed, the columns
go back to 181.

**The spot time finally has somewhere to be.** The bar's one line of times
holds departure and return and no more; be-at-the-yard is read in the panel,
along with the full itinerary for that leg, the drivers' full names and roles,
the requirements, the trip type and the notes.

**Focus is handled, because a panel that drops it is worse than none.** Open
puts focus on the close button, Escape and the close button both return it to
the bar that opened it, and the bar's selection clears with it. A render
replaces every bar, so a panel left open across one closes itself rather than
pointing at an element no longer in the page.

Not done and deliberate: no editing, no actions in the header yet, and the
availability section is not built - section 7 says it is a second row group in
the grid rather than panel content, so it is its own piece of work.

**2026-09-06 - where every surface lives, written down before the first panel
is built.** rux asked whether there was a general plan for the old right
panel's contents. There were per-surface verdicts and no architecture, so
`docs/screen-inventory.md` section 7 now carries one: the panel holds the
detail of the thing you selected, a page holds a list or a feed, a menu or
modal holds options and one-off actions.

What it settles: Tasks and History become pages, the customer editor moves
from a modal into the panel so there is one editing surface, the view options
need a toolbar menu again since the one they were promised was dropped with
the specimen, and the mini calendar becomes a date-picker trigger on the week
label rather than standing space.

**And it corrects me on the driver availability grid.** I had it as a popover,
twice. rux's account of the old board is that clicking a trip highlights the
row for that trip's DATE, so the grid answers "who is free then" about the
selected trip - which is the panel's job, beside the trip's own driver list.
The per-driver card that opened from a cell in that grid does stay a popover:
that is the detail of a cell, not a surface.

**2026-09-06 - the doubled bottom edge, and the one cell that was not the
frame's colour.** Both reported by rux, both real.

**The last row drew a rule into the pane's own border**, so the bottom of the
grid was 2px where every other row boundary is 1. The last VISIBLE row is
marked by `sch-data.js` rather than by `:last-child`, which would land on the
Unassigned row on the weeks it is hidden and leave the real last row still
drawing one. Verified: last track 0px, every other track 1px, pane border 1px.

**The Unassigned row's head had its own surface** and was the only cell in the
sticky column that was not the column's colour. It takes the frame's
`layer-accent-01` now, like every other head; the row is already told apart by
its italic label and by the tint on its track, which is where a row's own
identity belongs.

That is the third instance today of the same shape of fault - two edges
meeting on one boundary - after the day rules beside the bus column and the
day rules in the header band. **The rule that falls out of all three: a line
belongs to exactly one of the two things it separates, and the frame's own
border always wins.**

**2026-09-06 - the bus column at 42px, with the padding actually equal.**
Three answers to three questions from rux.

**"No bus" is broken at the space and always two lines.** Left to wrap on its
own it is 53px wide and set the column single-handed, wider than the numbers
it sits under. Stacked it is 28px and the numbers decide.

**The column sizes itself.** It is `max-content` in the stylesheet and
`sch.js` measures the corner's rendered width rather than parsing a token, so
the column is exactly the widest of the corner's "Bus", the longest bus number
and the stacked label, plus 8px either side. 42px today. A four-digit bus
number widens it on its own, where a hand-set 45px would have clipped one by
10px.

**The whole-pixel remainder moved out of that column, which is what made the
padding uneven.** Flooring the day width leaves up to 6px over; it used to go
into the bus column, and once that column was exactly its content the leftover
showed as extra space to the right of the number - measured 8px of glyph
padding on the left against 9 to 14 on the right as the window moved. The pane
is that much narrower now instead, so the leftover falls beyond its border in
the page's own 32px of padding, where nothing reads it as part of the grid.
Measured at 1440, 1441, 1443, 1445, 1447 and 1520: the column holds at 42px
with **8px each side at every width**, every day column an equal integer, and
the grid filling the pane exactly. Where the floor binds and the grid scrolls
there is no leftover and the pane keeps every pixel.

**And the corner's borders are deliberate.** It carries exactly two, its right
and its bottom, which are the frame's own two edges - the right continuous
with the bus column's, the bottom continuous with the day band's. The first
day cell draws no left rule, so there is no doubling: verified, 1px each and
no shadow on the neighbour.

**2026-09-06 - the frame's own rules, and why neither axis has any.** rux
noticed the bus column still had lines between rows while the day band had
none, and asked whether that was deliberate. It was not, and it was worse
than inconsistent: **those column rules are invisible in g10** - measured at
1.00:1 against their own background, the same collapse that took the day
band's rules out an hour earlier, and for the same reason. Putting the column
on `layer-accent-01` moved it onto a surface the subtle tokens cannot draw on.

`border-strong-01` is the only token that survives all five themes there, and
it is the wrong answer: it reads 2.5:1 against the band where the body's own
rules read 1.3:1 against the pane, so the frame would carry heavier lines than
the grid it frames.

**So neither axis draws grid lines.** Both are clean strips. The frame is
already separated by its own surface and its two edges; a row begins where its
number does, with the body's rule immediately to its right - symmetric with
the day band, where the column rules start below it. Verified: the column has
no bottom border, the band has no shadow, and both keep the one edge that
divides them from the grid.

**2026-09-06 - the two sticky axes are one frame now.** rux asked whether the
bus column should be styled like the day band. It is, and the two precedents
disagree, so the reasoning is worth keeping.

**Carbon's own data table says no.** `thead` takes `layer-accent`; `tbody th`
- a row header - takes no background at all, only `text-secondary` and a
border. That is right for a table, where the row header is one column of
content among others.

**rux-ui's scheduler said yes**, painting the corner, the day heads and the
row heads from a single `--sched-calendar-header-bg`.

This follows rux-ui, because this axis is not a column of content: it holds
the row's identity and what the bus carries, and nothing anyone reads as a
value. Corner, day band and bus column now share `layer-accent-01` in all
five themes, so the corner is a corner rather than a cell that changes colour
halfway down. The Unassigned row head keeps its own hover step, one below the
frame, so it still reads as the odd row out.

**And an answer to the other half of the question: Carbon has no example of
this table.** No calendar, gantt, schedule, timeline or matrix component
exists in `@carbon/styles` at all - checked against the package, not from
memory. That is the whole reason the grid is this app's own component, and it
is why questions like this one get settled by argument from the nearest
Carbon pattern rather than by copying one.

**2026-09-06 - the day header is one 32px row, and the date sits beside the
day.** It was two stacked lines at 51px. It is `2rem` now, the same 32px the
toolbar's buttons are, with the name and the number on one line: they name one
thing, so they read as one label, the name in the secondary colour and the
date in the primary. The 19px goes to the grid inside the pane, which is more
of the last bus row rather than a whole new one.

**Not spread to the far edge, which is what rux sketched, and the reason is
the rules that came out an hour earlier.** With no vertical rules in the band,
a date pushed to the right of its own cell sits 24px from the NEXT day's name
and 117px from its own -- measured on a 179px column - so it would read as
belonging to the wrong column. Kept together the pair is unambiguous. Spread
becomes the better arrangement again the day the band gets its rules back,
and it is a one-line change either way.

Corner and day cells both measure 32px, "Bus" still starts on the same pixel
as the bus numbers, and the today underline is unaffected.

**2026-09-06 - the grid was a layer step too dim, both ways.** rux compared
it to the sink's own data table in g90 and was right twice: the table's rules
are brighter and its header lighter. Measured, table against grid: header
#525252 against #393939, row rule #6f6f6f against #525252.

**The cause is that Carbon's tokens are layer-aware and the grid ignored it.**
The un-suffixed `--rux-border-subtle` is the border for content sitting on the
page background. This grid does not sit there: its pane is `--rux-layer`,
which IS layer-01, so its rules are `border-subtle-01` and its header band is
`layer-accent-01`. Ten rules moved up a step and the header band with them.
Both now read the same as the table in every theme.

**Lifting the header cost it its vertical rules, and they are gone for good.**
On `layer-accent-01` the rule and its own background land on the same colour
in g10; the step up, `border-subtle-02`, collapses the same way in white and
rux, both measured at 1.00:1. `border-strong-01` survives all five at 2.3 to
2.5, but a header rule heavier than the body's breaks the single line each
boundary is meant to draw from top to bottom. **Carbon's own table header has
no vertical rules either.** So the band has none: its bottom edge divides it
from the grid, the sticky column's edge divides it from the bus numbers, and
the day labels sit at the same 12px as the bar text below them, which is what
actually says where a column starts.

**And the Unassigned row moved off `layer-accent`**, which is the header
band's surface now; two accent bands at opposite ends of the grid read as two
headers. It takes the hover step instead.

**2026-09-06 - the bus reassignment drag: the first thing this page writes.**
Step 3 of `docs/screen-inventory.md` section 5. It writes ONE column,
`trip_assignments.bus_id`, on one row. Vertical only, as rux-ui's own drag is:
a trip's dates belong to the itinerary and are changed in an editor, never by
sliding a bar sideways.

Its rules are taken from that drag rather than invented, and each was driven
and measured:

- **A threshold before it counts** - a 2px move leaves the bar unflagged, so a
  press that does not travel still selects.
- **The Unassigned row is revealed for the duration** and hidden again after,
  because the week's first unassigned trip needs a rectangle to land on.
- **A double booking is a warning, not a wall.** Dragging a Thursday bar over
  a bus already working that Thursday lit the row in the warning tone rather
  than the interactive one, and the drop would still go through: the
  dispatcher can see what this page cannot. Out of service reads the same.
- **The Unassigned row can never be a conflict.**
- **Dropping on the row it came from does nothing** - released on its own
  track, no highlight, no write, `aria-busy` never set.

**No ghost and no optimistic move.** The source dims where it sits, the target
row lights, and on release the week is read back from the server, so what is
on screen after a move is what the database holds rather than what this page
hoped.

**Driven against real data, and put back.** The South Padre Island assignment
moved from bus 218 to 763 through the interface, the row was confirmed changed
by reading the table directly, and the original bus was written back the same
way. Nothing in production is left altered.

**2026-09-06 - why every bar was grey, and the rule that fixes it.** rux
asked. The cause: only the OVERRIDE colour was wired. rux-ui's rule has three
levels, in its own `--_tone` declaration and the one rule beneath it -
`var(--_trip-bar-color, var(--sched-trip-bar-confirmed-tone))`, with
`--unconfirmed:not([data-trip-bar-color])` taking the unconfirmed tone. So an
override beats status, status beats the default, **and the default is blue,
not neutral**: blue-400 on the dark themes, blue-600 on the light, with red
for unconfirmed. Only 64 of 743 trips carry an override, so wiring that alone
left every other bar saying nothing.

Carbon has no token for "a confirmed trip" and its support tokens are for
alerts, so the categorical tag palette carries all three levels: the override
hues as before, `blue` for the default and `red` for unconfirmed. That is the
same information the old board showed, in tokens this system already compiles.
On the current week, 17 blue and 2 red.

**The selection ring had to move.** It was `border-interactive`, which is
Carbon's blue, and a blue ring on a blue bar is the one pairing that cannot be
seen. It is `layer-selected-inverse` now - near-black on the light themes,
near-white on the dark - measured at 7.09:1 against the fill on g90 and g100
and 13.79:1 on white, g10 and rux. Label on fill reads 5.94:1 in all five,
comfortably past AA. Focus keeps the focus token; they are different signals.

**2026-09-06 - the browser gates, swept for the first time.** `docs/gate-
coverage.md` is the record. Both pages, white theme asserted from a resolved
token, focus taken with Tab then blurred, transitions suppressed, Plex
serving, pointer parked, page looked at. **Two findings, both adjudicated,
nothing to fix.**

- **Five stripped classes on `index.html`** are the pre-JS loading spinner in
  `#sch-status`. `sch-data.js` replaces the status contents on the first read,
  so they live in the file and never in the settled page - which is the point
  of them, and not a defect.
- **One spacing divergence on both pages**, `rux--header__name` at 8px of
  inline start padding where Carbon's capture has 16. Carbon's own rule causes
  it: it tightens the app name when the hamburger sits beside it, and the
  captured story has the toggle hidden because it was taken at desktop. This
  app shows it at every width, so the rule fires and the value is right.

`check-a11y` read 0 on both, and **the red run was done** rather than assumed:
stripping every focus outline and shadow took it to 21 findings and restoring
them returned it to 0. `check-rendered` and `check-behaviour` are N/A here for
the same reason they are on rux-ds's own templates - one measures kitchen-sink
sections, the other drives modules these pages do not carry.

**A gap for rux-ds, raised not acted on: the browser gates are not vendored.**
`vendor/rux-ds/tools/` carries the app check and the server. Sweeping meant
copying three gates and a 360KB capture out of a rux-ds clone and deleting
them after, so an app on a tag cannot check its own rendering without a
checkout of the design system beside it.

**And a second thing to raise there.** `js/ui-shell.js` says a desktop
hamburger "invents a state IBM's design does not have". Carbon ships
`.rux--header__menu-toggle:not(.__hidden) ~ .rux--header__name`, a rule whose
only purpose is to space the app name when that toggle is visible. It is the
divergence above, and it is evidence the other way.

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
