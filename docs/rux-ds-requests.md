# Requests to rux-ds

What this app has asked the design system for, and why. `AGENTS.md`: a missing
component, rule or icon is a request to rux-ds with invented content, never a
local rule. This file is the record so a request is not re-argued from scratch
the next time it comes up, and so what was declined stays declined for a reason.

Open requests are listed first. A request that lands is moved to **Settled**
with the tag that carried it.

---

## Open — `check-behaviour` cannot see a consumer app, 2026-09-08

**Asked for:** scope the fixtures in `tools/check-behaviour.js` to the document
rather than to kitchen-sink section ids, or let the section id be optional.

**Why:** run against this app it reports 4 passed of 18 on both pages, and the
other 14 all say `no X on this page`. That message is not true. `index.html`
has a working shell and a two-tab tablist; the gate looks for
`#ui-shell .rux--header__menu-trigger` (`tools/check-behaviour.js:247`) and
`#tabs [role="tablist"]` (`:120`), and no consumer page carries a sink section
id. The gate is therefore unusable by consumers for 14 of its 18 cases, and it
reports that as failure rather than as absence — which reads, in a ledger, like
14 broken behaviours.

**Measured 2026-09-08 at `52efa52`, by hand, because the gate could not.** The
shell it calls absent takes the nav 0 → 256 → 0 across two clicks of the
trigger, swaps the glyph `#i-menu` → `#i-close` → `#i-menu`, sets `aria-label`
to "Close menu" while open, and sets `side-nav--expanded`. The tablist it calls
"fewer than two tabs" has two, with roving `tabindex` 0 / -1 and `aria-selected`
true / false. Both are exactly what the gate would have asserted.

**What already survives the move, and is worth keeping.** The four passing cases
are `profile` (a theme radio moves `data-theme` and stores it; a typed name is
stored) and `theme` (`apply()` puts the stored theme on `<html>`, and refuses a
value that is not a theme name). Those test module APIs rather than sink markup,
which is why they are the ones that work here.

**Not asked for:** a headless runner. Roadmap §4.8 settled that, and this is a
selector change.


## Open — two group icons for the sprite, 2026-09-07

**Asked for:** `events` and `user--multiple`, added to
`assets/icons.svg` as `#i-events` and `#i-user--multiple`.

**Why:** the schedule toolbar's `Drivers` control is a text button. It toggles
the driver availability grid, sits beside a primary `New trip` button, and is
the only text button in a toolbar Carbon draws as icons. Carbon's own small
table toolbar — the spec rux worked from — is icon buttons flush against the
primary action, so the text button is the one thing in that row not following
the pattern.

**Why not an icon already in the sprite.** There is exactly one person in the
62: `user--avatar`, a single figure in a circle. `index.html:258` already uses
it for the shell's **Account** button, roughly 200px above the toolbar. The same
glyph in one header meaning both "your account" and "the driver roster" is worse
than the text button it would replace.

**Both, not one, and the reason is a measurement.** Carbon ships 2592 icons at
32 and only 68 at 16. The 68 are the chrome that appears small constantly —
chevrons, arrows, close, menu, search, settings, `user`, `user--avatar`. Neither
`events` nor `user--multiple` is among them, and nor is any multi-person glyph,
which reads as Carbon's own judgement that a group does not survive being
shrunk. A toolbar button renders its icon at 16px
(`.rux--btn .rux--btn__icon` is `1rem` square), so both would be 32-unit
drawings displayed at half size.

`events` is three overlapping figures; `user--multiple` is two. Three may go
muddy at 16 where two holds. That is a judgement to make by LOOKING, not from
the source, which is why the ask is for both — put them on the sink at 16px side
by side and keep whichever reads. Scaling itself is normal here: 33 of the
sprite's 62 icons are 32-unit drawings already rendered at 16 or 20.

**If neither survives:** no change. The text button works, and it is a better
answer than an unreadable glyph. This request costs nothing if it is declined
on the evidence.

**Not asked for:** a 16px redraw. Carbon has not drawn one and inventing one
here would be inventing markup, which `AGENTS.md` forbids in both repositories.

---

## Open — a date picker whose trigger is not its own input, 2026-09-07

**Asked for:** a `--next` date picker that can be opened from an element the
consuming page supplies, or a variant with no visible input -- an icon-only
trigger whose value is read rather than shown.

**Why:** `screen-inventory.md` section 7 decided that jumping to a date is the
week LABEL's job -- "a permanent mini calendar spends standing space on an
occasional action" -- and that decision cannot be built. Paging is one week a
click, so a month away is eight of them.

**What the contract says, and it is not a gap in the module.**
`js/date-picker.js` is explicit: a `.rux--date-picker--next` containing a
`.rux--date-picker__calendar-container` is claimed on load, and "the trigger is
`.rux--date-picker__icon` inside the same root, so the markup already relates
them". That rule is the right one -- it is the same rule menu.js settled, and
it is why a picker needs no `data-rux-*`. The shape simply has no room for a
trigger the page owns.

**The three ways round it, and why each is barred here.** Putting
`rux--date-picker__icon` on this app's own label is a Carbon class repurposed
on an app element. Hiding the picker's input needs a rule on a Carbon part from
an app stylesheet, which `AGENTS.md` forbids in both repositories. Showing the
input leaves a toolbar reading "Sep 7 - 13, 2026" beside a `2026-09-07` field --
two date displays of one week -- or replaces the range readout, which is the
most-read thing in that row.

**What it is not:** a request to portal the calendar, or to change the keyboard
model. Only where the open command may come from.

**Nothing is built here in the meantime.** A date picker in the shape the
component allows would be shipped knowing it is the wrong one, and reverting it
later costs more than the eight clicks.

---

## Settled

Nothing yet.
