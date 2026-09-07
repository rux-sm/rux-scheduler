# Browser gate coverage

`node tools/check.mjs` reads classes, tokens, files, ids and the pin. It says
so itself: it cannot see spacing, contrast, focus, behaviour or how the page
looks. rux-ds has five gates for that, they need a real browser, and **they
are not vendored with the pin** — `vendor/rux-ds/tools/` carries the app check
and the server and nothing else. Running them here means copying them in from
a rux-ds clone, sweeping, and deleting them again. That is what was done
below, and it is a gap worth closing upstream: an app on a tag cannot check
its own rendering without a checkout of the design system beside it.

## Re-swept 2026-09-07 at `b8c373d`

Both pages, white theme asserted by `--rux-field-hover` (#e8e8e8) and
`body` `rgb(255,255,255)` read in the same execution, 1440×950, focus taken
with Tab then blurred (`activeElement` BODY, `hasFocus` true), transitions and
animations suppressed, IBM Plex serving, pointer parked with only HTML, BODY
and MAIN in `:hover` and no control under measurement, page looked at.

| Gate | `index.html` | `specimen.html` |
|---|---|---|
| `check-runtime-classes` | 122 / 117, **5 stripped**, 0 added | 56 / 56, 0 stripped, 0 added |
| `check-a11y` | 0 findings, 0 notes, ring check live | 0 findings, 0 notes, ring check live |
| `check-spacing` | 46 checked, 43 matched, 1 known, **2 diverges**, 4 not comparable, 28 no reference | 30 checked, 29 matched, **1 diverges**, 1 not comparable, 9 no reference |
| `check-rendered` | N/A | N/A |
| `check-behaviour` | N/A | N/A |

**The red run was done again.** Stripping every `:focus` outline and
box-shadow took `check-a11y` from 0 to 20 on `index.html` and from 0 to 14 on
`specimen.html`, and restoring them returned both to 0.

**`specimen.html` is unchanged, figure for figure.** `index.html` is not, and
the growth is the page's own: it gained 151 lines across `7ce4e93`
(right-click actions), `c277be1` (cancel a trip) and `3202be8` (the board on
the whole screen), all after the sweep below. 60/55 became 122/117 for that
reason and no other. The **same five** adjudicated classes are stripped — the
`inline-loading` spinner `sch-data.js` replaces — so that finding is unchanged
in kind.

**One divergence is new, and it is this app's own decision, already reasoned.**
`rux--tab-content` reports no inline padding where Carbon's capture has 16px,
on 2 of 2 variants. That is `.rux--side-panel .rux--tab-content
{ padding-inline: 0 }` in `rux-overrides.css`, added at `f9716f5` — after the
sweep below, which is why it appears now. Its comment there records the
measurement (a field sat 33px from the panel edge against the title's 17), the
specificity, the panel scope, and that **no capture settles it**: none of the
nine captured side-panel stories contains tabs. Not a defect and not to be
removed. `rux--header__name` is the standing Carbon-caused one described below.

**HOW THIS WAS RUN, AND IT DID NOT NEED THE TOOLS COPIED IN.** The header of
this file says sweeping here means copying rux-ds's browser gates over and
deleting them again. It does not. The app was served through the rux-ds
server's own origin by a gitignored symlink in that clone (`.brand/sched` →
this repository), so the page loads from `localhost:8642/.brand/sched/` and
`/tools/check-*.js` are already there to `eval`. Nothing was copied into this
repository and nothing was deleted from it. The environment matches the earlier
sweeps in the way that matters: everything this app owns served 200, and only
`/switcher.js` and `/account.js` 404 — root-absolute hub files that 404 on this
app's own server too, which is the drift the report below already names.

**A TIMING TRAP, PAID FOR HERE.** The first `check-runtime-classes` reading of
this sweep was taken immediately on load and said 122/122 with **0 stripped**.
That is wrong and it looks like a clean result: `sch-data.js` had not yet
replaced `#sch-status`, so the spinner was still in the live DOM and matched
the file. Read again once settled — `.rux--inline-loading` gone — it says
122/117 with the five stripped. rux-ds's own pages settle synchronously and
never show this; a page that fetches does. Wait for the page to settle before
this gate, not merely for it to load.

## Re-swept 2026-09-06 at `abb971a`

The grid moved onto `border-subtle-01` and `layer-accent-01` and the header
band lost its vertical rules. **Every reading is unchanged again** - 60/55
with 5 stripped and 56/56 clean, 0 a11y findings on both with the ring check
live, 29/28 and 30/29 with the one `header__name` divergence. Colour was the
whole change and `check-spacing` measures boxes; the contrast that moved was
measured directly instead, and `docs/log.md` carries it.

## Re-swept 2026-09-06 at `9151235`

The bar's default fill became blue, the selection ring moved to
`layer-selected-inverse`, and the drag added its own `sch-` classes. **Every
reading is unchanged from the first sweep below**, which is the answer those
changes should give: none of them touches a Carbon component's box, and the
new classes are the app's own, which `check-runtime-classes` does not track.

| Gate | `index.html` | `specimen.html` |
|---|---|---|
| `check-runtime-classes` | 60 / 55, 5 stripped, 0 added | 56 / 56, 0 stripped, 0 added |
| `check-a11y` | 0 findings, 0 notes, ring check live | 0 findings, 0 notes, ring check live |
| `check-spacing` | 29 / 28, 1 diverges, 1 not comparable, 9 no reference | 30 / 29, 1 diverges, 1 not comparable, 9 no reference |

The contrast the colour change introduced was measured separately rather than
left to this gate, which does not read colour: label on fill 5.94:1 in all
five themes, selection ring on fill 7.09:1 on the dark pair and 13.79:1 on the
light three. `docs/log.md` carries the numbers.

## Swept 2026-09-06 at `092f8f3`

Both pages, white theme asserted by `--rux-field-hover` (#e8e8e8) read in the
same execution, 1440×950, focus taken with Tab then blurred (`activeElement`
BODY, `hasFocus` true), transitions and animations suppressed, IBM Plex
serving, pointer parked off content, page looked at.

| Gate | `index.html` | `specimen.html` |
|---|---|---|
| `check-runtime-classes` | 60 / 55, **5 stripped**, 0 added | 56 / 56, 0 stripped, 0 added |
| `check-a11y` | 0 findings, 0 notes, ring check live | 0 findings, 0 notes, ring check live |
| `check-spacing` | 29 checked, 28 matched, **1 diverges**, 1 not comparable, 9 no reference | 30 checked, 29 matched, **1 diverges**, 1 not comparable, 9 no reference |
| `check-rendered` | N/A | N/A |
| `check-behaviour` | N/A | N/A |

**The red run was done, on the gate that read zero.** Stripping every outline
and box-shadow on `:focus` took `check-a11y` from 0 findings to 21, and
restoring them returned it to 0. A green reading from this gate means
something here.

**`check-rendered` and `check-behaviour` are N/A for the same reason they are
on rux-ds's own templates.** The first measures `.ks-sec` sections inside
`.ks-main`, which is kitchen-sink structure neither page has. The second
drives every rux-ds module against sink markup, and these pages carry the
shell and almost nothing else, so it would report a pass it did not earn.

## The two findings, both adjudicated

**Five stripped classes on `index.html`, and they should be there.** They are
`inline-loading`, its `__animation` and `__text`, and `loading` with
`loading--small` — the spinner the page ships inside `#sch-status` saying
"Loading the week…". `sch-data.js` replaces the status contents the moment the
first read returns, so the classes are in the file and never in the settled
page. That is the point of them: a page whose script never runs, or whose
first read is slow, says something true instead of showing an empty grid.
Not a defect, and not to be removed.

**One spacing divergence on both pages, and Carbon caused it.**
`rux--header__name` has 8px of inline start padding where Carbon's capture has
16px. The rule doing it is Carbon's own:

    .rux--header__menu-toggle:not(.rux--header__menu-toggle__hidden) ~ .rux--header__name

which tightens the app name when the hamburger sits beside it. The captured
story has the toggle hidden, because it was captured at desktop where Carbon
hides it by default; this app deliberately shows it at every width, so
Carbon's own rule fires and the padding is correct rather than wrong.

Worth noting where the decision was made: rux-ds's `js/ui-shell.js` says a
desktop hamburger "invents a state IBM's design does not have". Carbon ships
a stylesheet rule for exactly that arrangement, which is evidence the other
way. Raised here rather than acted on.
