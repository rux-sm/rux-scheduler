# Browser gate coverage

`node tools/check.mjs` reads classes, tokens, files, ids and the pin. It says
so itself: it cannot see spacing, contrast, focus, behaviour or how the page
looks. rux-ds has five gates for that, they need a real browser, and **they
are not vendored with the pin** — `vendor/rux-ds/tools/` carries the app check
and the server and nothing else. Running them here means copying them in from
a rux-ds clone, sweeping, and deleting them again. That is what was done
below, and it is a gap worth closing upstream: an app on a tag cannot check
its own rendering without a checkout of the design system beside it.

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
