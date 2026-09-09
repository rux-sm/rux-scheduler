# Requests to rux-ds

What this app has asked the design system for, and why. `AGENTS.md`: a missing
component, rule or icon is a request to rux-ds with invented content, never a
local rule. This file is the record so a request is not re-argued from scratch
the next time it comes up, and so what was declined stays declined for a reason.

Open requests are listed first. A request that lands is moved to **Settled**
with the tag that carried it.

---

## Open — a toggle's words cannot be the product's, 2026-09-09

**Asked for:** let a consumer supply the two words `setToggle` writes, or say
that On/Off is deliberate and a product wanting other words should not use the
toggle.

**Why:** `js/form-controls.js` owns the toggle -- correctly, and this app hands
it the whole behaviour -- and `setToggle` hard-codes `text.textContent = on ?
'On' : 'Off'`. The Billing tab has three of them over columns whose values are
words already: `contract_status` is "Pending"/"Signed", `invoice_status` is
"Pending"/"Invoiced", both across all 751 rows. Rendering "Contract: On" says
less than the data does.

**THE FILE ALREADY RAISED THIS AGAINST ITSELF.** Its header calls the
hard-coding "worth a decision rather than a silent default", and objects in the
same breath to depending on a TRANSLATED STRING when reading `aria-label` --
"writing one is the same problem facing the other way". This is that decision
arriving with a consumer attached, not a new argument.

**What this app did in the meantime, and it is not a workaround to keep.** The
LABEL carries the meaning instead: "Contract signed", not "Contract", so On and
Off read correctly against it. That is honest and needs no override, but it
spends a word of the label on every toggle and cannot express a pair like
Invoiced/Pending where neither side is the absence of the other.

**What it is not:** not a request to change the markup, the event or who owns
the click -- all three are right and this app depends on them. Only the two
strings.

---

## Open — nothing compiles a size for header action icons, 2026-09-08

**Asked for:** a compiled size for the icon inside `.rux--header__action`, at
whatever value rux-ds judges correct. Not a change to what it looks like -- a
rule that holds it.

**Why:** rux asked for button icons to follow Carbon design-system-wide, and
every other button on this page could be made to. `.rux--btn .rux--btn__icon` is
1rem square unconditionally (`rux.css:3461`) and does not follow the button
size, so four toolbar buttons here just moved from carrying 16px in `width`/
`height` attributes to carrying `rux--btn__icon` and being governed. **The two
header actions are the one place that could not be done**, and the reason is a
gap rather than a disagreement.

**PARSED RULE BY RULE, CARBON SETS NO SIZE THERE.** Every rule in `rux.css`
whose selector names `header__action` together with `svg` or `icon` --
`:27249`, `:27254`, `:27270`, `:27284`, `:27288`, `:27292`, `:27299` -- sets
`fill`, `display` or `transform`. **Zero of them set `block-size`,
`inline-size`, `width` or `height`.** So an app's header action icon is whatever
size its own markup asserts, and two consumers following the same guidance can
disagree without either being wrong.

**WHY WE ARE NOT SOLVING IT LOCALLY, EITHER WAY.** Adding `rux--btn__icon` to
these two would take them to 16, and that is not obviously right: a header
action is a different component from a toolbar button, Carbon's own React ships
20px icons in `HeaderGlobalAction`, and its markup passes the icon as a bare
child with no `btn__icon` class -- which is exactly the shape here. So this app
keeps 20 and matches Carbon React. Writing a rule in `rux-overrides.css` to pin
it would be a local rule standing in for a missing rux-ds one, which `AGENTS.md`
forbids in as many words. Hence a request.

**What it is not:** not a claim that 20 is right and 16 wrong. If rux-ds
compiles 16 we will drop the attributes and follow; the ask is only that
something other than a consumer's markup decides.

---

## Open — `ui-shell.js` calls a shell state invented that the CSS ships three
rules for, 2026-09-08

**ANSWERED ON rux-ds `main` AT `a545cc1` ("docs(shell): Name both shells the CSS
supports"), IN NO TAG, told to us 2026-09-08 and verified in the clone.**
`js/ui-shell.js` now names both configurations and says the collapsible desktop
one is legitimate; the three compiled readings below are the documented doctrine
rather than a consumer's complaint. Their measurement, which ours did not make:
at 1440 with transitions off, `--ux` plus `--hidden` is 0, adding `--expanded`
gives 256 and removing it gives 0 -- so the nav does open at desktop, and the
old claim that `--expanded` changes nothing above the breakpoint holds only for
a nav without `--hidden`. **The capture half of this request is DECLINED, and
that is the useful half of the answer:** see `docs/gate-coverage.md`, where it
makes our 8px adjudication permanent rather than provisional. Stays open here
until a tag carries it and the pin moves.

**Asked for:** correct or qualify the comment in `js/ui-shell.js:7-11` — "A
template showing the button at desktop invents a state IBM's design does not
have" — or, if the state really is out of bounds, say what a consumer using the
rail shell should do instead. Either way, capture the shell with a permanent
toggle, so `check-spacing` has a reference for it.

**Why:** this app renders `--side-nav--ux --side-nav--hidden` with a
`__menu-toggle` that carries no `__hidden`, so the hamburger is visible at every
width. `check-spacing` therefore reports `rux--header__name` at 8px of inline
start where the capture has 16, on both pages, in every sweep since the first.
It is adjudicated in `docs/gate-coverage.md` as Carbon-caused and not a defect,
and it has to be re-adjudicated each time because the comment above says the
configuration causing it is not a real one. Re-arguing a settled thing is what
this file exists to stop.

**THE COMMENT IS CONTRADICTED BY THREE SEPARATE PIECES OF COMPILED CSS**, all in
`css/rux.css` at v0.1.11 and none of them ours to change.

**One — `__hidden` is markup-applied, not automatic.**
`.rux--header__menu-toggle__hidden { display: none }` exists only inside
`@media (min-width: 66rem)` (`rux.css:27317`). Nothing in the stylesheet adds
that class. "Carbon hides it above 66rem" is therefore true only of a page that
writes the class in, and is a statement about the consumer's markup rather than
about the design.

**Two — the spacing rule cannot mean what a responsive-only hamburger would need
it to mean.** `.rux--header__menu-toggle:not(.__hidden) ~ .rux--header__name`
(`rux.css:27364`) carries no media query. In a page that writes `__hidden`, the
class is present at EVERY width, so below 66rem — where that toggle is on screen
— the selector does not match and the name keeps its 16px. The one case a
"space the name while the button is beside it" rule would exist for is exactly
the case it misses. The only configuration it ever fires in is a toggle with no
`__hidden`: a permanent one.

**Three — the cascade order of the nav's own classes only pays off at desktop.**
`.rux--side-nav--hidden { inline-size: 0 }` (`:27657`) is declared AFTER
`--side-nav--ux`'s `16rem` (`:27643`) at equal specificity, so it wins; and
`--side-nav--expanded { 16rem }` (`:27661`) is declared after `--hidden`, so it
wins over that. Below 66rem `--ux` is already 0 and `--hidden` changes nothing,
so that ordering does no work at all except above 66rem — where its only use is
letting a consumer collapse and reopen a nav at desktop.

**What this is not.** Not a request to change any of those rules: they are
right, and this app depends on all three. Not a request to make the rail shell
the default, and not a claim that the persistent shell is wrong. The ask is only
that the doctrine and the stylesheet agree, and that whichever way it is settled
is written down once.

**If the comment stands and the state is declined:** this app needs to be told
what to render instead, because the alternative shipped in the pin — `--ux`
persistent at 16rem above 66rem — is a permanent 256px column on a page whose
whole argument is horizontal room for a week. See `docs/log.md` 2026-09-08: at
1440 the board is already 323px short of a week with both companions open.


## Open — `check-behaviour` cannot see a consumer app, 2026-09-08

**ANSWERED ON rux-ds `main` AT `0527a30` ("feat(gates): Scope check-behaviour to
the document"), IN NO TAG, verified in the clone.** Each case scopes to its sink
section where one exists and to the document where it does not; an absent
component is SKIPPED rather than failed, and a present root with a broken
contract still FAILS, so it retires no contract. It found a real defect on their
side before it was applied -- eleven templates carried an invented
`aria-label="Toggle navigation"` that silently disabled the name swap, fixed at
`2677d7d`. **Checked here: we are clean.** `index.html:219` carries
`aria-label="Open menu"`, the recognised pair, and driven live the label, the
glyph and `aria-expanded` all move together. Stays open until a tag carries it.

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

**HALF LANDED, HALF DECLINED, on `main` at `c869d7f`, in no tag.**
`#i-user--multiple` is in `assets/icons.svg`; `#i-events` is not and will not be.
Verified in the clone: `user--multiple` 1, `events` 0.

**THE DECLINE IS REASONED AND WE ARE NOT RE-ASKING.** Judged from a
nearest-neighbour magnification of each glyph rasterised at its real device size
rather than from a screenshot -- a browser pane downscaling a 1280 viewport by
0.625 destroys exactly the detail in question, and at that scale both look fine.
At 16 device px `events` merges the front figure's head and shoulders into one
smear while the two behind stay rings. At 32 all three are legible, so a
2x-display-only reading would have admitted it; it was declined on the 1x
reading. `events--alt` was tried unasked and is worse than either. Written up in
rux-ds's `docs/log.md` ("the scheduler's sprite ask, answered by rasterising
rather than by reasoning"), in the comment above `user--multiple` in
`tools/icons.mjs`, and in `c869d7f` itself.

**WHAT IT LEAVES US.** This request asked for a pair because a toolbar button
renders its icon at 16px. With one glyph the `Drivers` toggle either goes
icon-only on `user--multiple` alone or stays text. That is a decision here and
not a request there -- rux-ds has agreed it is ours.

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

**ANSWERED ON rux-ds `main` AT `89e14fd` ("feat(date-picker): Let a page own the
trigger"), IN NO TAG, verified in the clone.** This unblocks
`screen-inventory.md` §7 -- jumping to a date is the week LABEL's job -- which
has been undecidable rather than merely unbuilt. Nothing is built here yet: the
pin is on v0.1.11 and the work sits 42 commits past it on `main`. Stays open
until a tag carries it and the pin moves.

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
