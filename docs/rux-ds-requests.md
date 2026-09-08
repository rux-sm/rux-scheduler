# Requests to rux-ds

What this app has asked the design system for, and why. `AGENTS.md`: a missing
component, rule or icon is a request to rux-ds with invented content, never a
local rule. This file is the record so a request is not re-argued from scratch
the next time it comes up, and so what was declined stays declined for a reason.

Open requests are listed first. A request that lands is moved to **Settled**
with the tag that carried it.

---

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

## Settled

Nothing yet.
