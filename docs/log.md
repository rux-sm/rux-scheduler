# Log

Every dated pass and answered decision, newest first. `AGENTS.md` is the
policy; `docs/backend-inventory.md` and `docs/screen-inventory.md` are the
two inventories the rebuild starts from.

**2026-09-09 - every field on a new trip, and the regression that asking for
it uncovered.** rux asked for all fields to be visible when creating. Building
it found that the Billing tab had broken trip CREATION four commits ago.

**THE BUG, WHICH WAS MINE AND IS ALREADY COMMITTED AT `c125087`.** The Billing
tab rendered nothing on a new trip -- "Billing opens once the trip exists" --
so nine of the ids `readForm` requires did not exist. `readForm` returns null
the moment ONE is missing. The create path is `{ ...readForm(), bus_count: 1 }`
and `{ ...null }` is `{}`, so a new trip would have inserted as
**`{ bus_count: 1 }`**: no destination, no start date. `legsOf` builds no leg
without a start date, so the row would have existed and never appeared on any
week -- created and lost in the same click. Save is disabled until a date is
typed, which is the only reason it was never seen.

**THE FIX IS THE FEATURE.** Every column on the Billing tab is a `trips`
column; none of them needed the trip to exist. The same was true of the two
contact blocks -- the search picks contacts that already exist, and the six
link columns join the insert like any other. A booking contact is often the
first thing known about a trip, someone having rung, so hiding it until after a
save had the order backwards.

**AND A GUARD, BECAUSE THE NEXT ONE DESERVES TO FAIL LOUDLY.** The create path
now refuses to insert from a null form instead of spreading it into nothing.
The fields are all present, so it cannot fire; it is there because this fault
was invisible until someone read the spread.

**SCHEDULE NEEDED A DECISION RATHER THAN A GUARD REMOVED.** Its four fields
write `trip_stops` and a new trip has none. `stopsPatch` refuses to create a
row for an EXISTING leg with no pickup, because where it belongs among the
others is the itinerary editor's business -- but a brand-new trip has no
others, so leg `outbound`, position 0, type `pickup` is the only thing it could
mean. On create the rows are inserted; on edit the refusal stands. Nothing is
written unless something was typed, which is what 687 of the 751 existing trips
look like.

**VERIFIED: the panel. NOT VERIFIED: the insert.** All 21 ids `readForm` wants
are present on the create panel and none is missing. Destination gates Save and
clearing it re-disables with `aria-invalid`. Pickup, yard depart and a quoted
price all accept input there. **No insert was sent** -- same standing limit.

**NOTICED AND NOT FIXED: an end date can precede a start date.** Setting start
to 2026-09-10 left end at 2026-09-07 and nothing objected. `date-picker.js`
swaps them when a range is picked THROUGH the calendar, so this only shows when
a value arrives another way. Pre-existing, not introduced here, and left for a
decision rather than fixed in passing.

**2026-09-09 - one Organization, and an autofill rule that was wrong twice
over.** rux opened the panel, saw `Customer` reading "TMS" above `Organization
or group` reading "TMS", and cut one.

**`trips.customer` IS THE SURVIVOR AND IT IS NOT A COIN TOSS.** It is on 725 of
751 trips; `contacts.client` exists only for the 292 with a linked contact, and
only 160 of the 196 contacts carry one. Keeping the contact's copy would have
blanked the field on 433 trips. Relabelled `Organization`, and the booking
block's field is gone.

**WHAT IT GIVES UP, STATED ONCE.** 13 trips have a `customer` that differs from
their contact's `client` -- "Mission CISD" books for "Vaquero Indoor". Billed-to
and travelling-group were two facts and are now one on this panel.
`contacts.client` still holds the other and the Customers view still edits it;
this form simply stops showing it. Raised before the cut and decided by rux
after it was raised.

**AND THE AUTOFILL RULE WAS WRONG, WHICH THE SCREEN SHOWED WITHIN A MINUTE.**
"Fill only what is empty" was written to stop an agency stamping itself over a
school. Applied to all three fields it produced something worse: picking Adan
Molina left **Louise Reece's phone and email** sitting under his name, because
the rule treats the PREVIOUS contact's data as though a person had typed it.
They are not the same thing.

**THE SPLIT IS BY WHO OWNS THE FACT.** A phone and an email belong to the
person, so choosing a different person REPLACES them. Organization is a trip
column that 13 trips disagree with their contact about, so it stays a
suggestion: empty it fills, filled it stands. Driven: picking Adan Molina now
gives 361-695-7512 and adan.molina@ccisd.us while Organization holds "TMS".

**2026-09-09 - the contact block rebuilt, and the three orderings judged
against the data.** rux collected three proposals for the form's order and
asked which to take. The answer was the third's structure with two of the
first's behaviours, and the reasons are measurements rather than taste.

**WHAT WAS TAKEN, AND WHY EACH SURVIVED A COUNT.** Section headings so the
labels can drop their prefix -- in a 320px panel "Booking contact phone" wraps
and "Phone" does not, so this is width and not tidiness. A search over the
contacts, because there are **196** of them and 55 of the 162 linked ones serve
more than one trip, so a bare name field cannot tell two Ashleys apart. One
day-of row rather than five, because **687 of 751 trips carry no day-of contact
at all** -- 57 carry one, 6 carry two, one carries five -- so five empty rows
would be noise on 91% of trips. "Day-of-trip" over "on-site", since the person
may be travelling with the group or working a desk.

**AND THE TWO BEHAVIOURS FROM THE FIRST PROPOSAL, both of which the data
argues for.** `Same as booking contact` is a checkbox because
`trip_contact_1_id` EQUALS `booking_contact_id` on **34** trips -- 53% of every
day-of contact that exists is the booking contact retyped. And the autofill
suggests rather than locks, because 13 trips have a `customer` that differs
from their contact's `client`: "Mission CISD" books for "Vaquero Indoor",
"Raymondville ISD" for "Raymondville High School". An agency booking for a
school is a real shape here, and a hard fill would stamp the agency onto trips
that are not theirs. Only empty fields are filled.

**WHAT WAS REJECTED, WITH THE NUMBER THAT REJECTED IT.** Trip type first, on
the argument that it decides whether an end date is meaningful: **705 of 751
trips are round trips** and one-way keeps a range too (25 of 26 run a day, one
runs three), so the field is the same value 94% of the time and the main range
is meaningful for every type. Type governs only the conditional `Pick-up` pair,
which already sits directly beneath it. The second proposal's review screen is
wizard shape and this is a side panel; its combined range picker is already
Carbon's; its visual grouping is already `section()`.

**THREE FIELDS ALL THREE PROPOSALS WANTED CANNOT BE BUILT.** `passenger_count`,
`pax` and `passengers` are all absent -- capacity lives on `buses` and
`req_56pax` is a boolean need -- as are `role` and `contact_role`, and the
email thread, which six name probes could not find. All three are schema
additions and rux's to make. Four more of the first proposal's "missing" fields
already existed: pickup location, yard depart, spot and return are the Schedule
section from earlier today.

**THE SEARCH IS A NATIVE `<datalist>`, NOT CARBON'S COMBO BOX**, and that is a
deliberate choice rather than a shortcut. `js/list-box.js` says filtering is not
reimplemented and the combo-box form is not verified -- "nothing here should be
read as covering it" -- so writing the filtering would have been implementing a
component rux-ds owns. A datalist is the platform's, it filters and announces
itself with no script of ours, and the input wearing `rux--text-input` is that
component used correctly. Filed as a seventh request. The cost is on the record
there: no value/label pair, so one string per contact is built and matched
back, and the dropdown is the browser's rather than Carbon's.

**THE NAME STOPPED BEING EDITABLE HERE, which is a change worth naming.** It
was its own field this morning; the search replaced it, and a search FINDS a
contact rather than renaming one. Renaming belongs to the Customers view that
owns the record. Picking a different person is a change to
`trips.booking_contact_id`, a trip column, so it diffs with the trip rather
than with the contact.

**DRIVEN, ALL OF IT EXCEPT THE WRITE.** 196 options in the list. Opening a
linked trip fills Louise Reece - TMS - 240-224-4044 with organisation, phone
and email beside it. Picking another contact resolves its id and arms Save;
typing a name that matches nothing clears the id, which is correct -- it is not
a contact until it is one. Checking `Same as booking contact` hides the rows
and disables the add button; clearing it brings them back. `Add another
contact` stops at five, which is where the schema stops. **No write was sent**,
same standing limit as everything else here.

**2026-09-09 - Customer details, four fields of five, and two facts the
mockup could not show.** rux asked to include the mockup's Customer Details
card. Counted before building, as with Billing.

**FOUR MAP CLEANLY.** `contacts` holds 196 rows: name 196, phone 140, email
134, client 160 -- all four real and all four editable. Customer name, Customer
phone, Business/School and Email are in.

**`Business/School` IS NOT THE `Customer` FIELD ABOVE IT**, which is the thing
that looked like duplication and is not. Of the 275 trips carrying both, 262
agree and 13 genuinely differ: "Mission CISD" books for "Vaquero Indoor",
"Raymondville ISD" for "Raymondville High School", "Santa Rosa TX" for "Santa
Rosa HS". `trips.customer` is who the trip is billed to, `contacts.client` is
the group travelling. Both stay, and the panel now shows both.

**`Email thread` IS NOT BUILT BECAUSE THERE IS NO COLUMN.** Asked the table for
`missive_url`, `email_thread`, `email_thread_url`, `thread_url`,
`missive_link` and `conversation_url`; all six came back absent. A Missive link
is a schema addition and rux's to make, the same answer `service_type` got on
the Billing tab. Nothing was invented to fill the space.

**459 OF 751 TRIPS HAVE NO CONTACT AT ALL**, which is the case the mockup
cannot show and the section has to be honest about. Only 292 carry a
`booking_contact_id`, so an unlinked trip gets a line saying so -- and saying
that the Customer field above is the billing name -- rather than four dead
boxes. Attaching one means choosing from 196 contacts, which is a picker and a
separate piece of work. Both branches were driven: a linked trip fills with
Louise Reece / 240-224-4044 / TMS / lreece@tms.com, an unlinked one shows the
hint.

**IT EDITS A SHARED RECORD, AND THE PANEL SAYS SO ON SCREEN.** 55 of the 162
linked contacts serve more than one trip and the busiest serves 18, so
correcting a phone here corrects it on all 18. That is what a contact IS, and
it is how the old app already works -- `backend-inventory.md` lists `contacts`
as written by the trip editor as well as the customer editor -- so this
follows it rather than inventing a rule. What would have been wrong is leaving
it implicit, so a hint under the fields states it.

**A THIRD TABLE MEANS A THIRD WRITE.** `contactPatch` diffs one row the way
`stopsPatch` does and the save sends it separately; `trips.update` has no
`name` or `client` to receive. A failure there leaves the trip saved and says
which half did not, the rule the stop and assignment writes already follow.

**VERIFIED: reads, both branches, arming. NOT VERIFIED: the write.** Save is
dead at open, arms on a phone edit, dies again on the way back. The `contacts`
update was not sent -- same standing limit as every other write here.

**2026-09-09 - mm/dd/yyyy where it can be had, and the mono zero settled by
looking at it.** rux asked for the date format everywhere and whether the mono
face is really loading.

**THE FONT IS LOADING AND IT IS THE REAL FACE.** Rendered `0O` at 200px and
looked: the zero carries IBM Plex Mono's centre DOT and the capital O does not,
and both measure 240px, so it is the monospaced face rather than a fallback
wearing its name. That is the check that settles it -- the width probes in the
entry below could only say "not the fallback", where the dot says "this font".

**THE FORMAT SPLITS IN TWO, AND ONLY ONE HALF IS OURS.** `mdy()` now formats
every date this app renders itself; the Billing payments list is the one place
today. It does STRING work rather than `new Date()`, because a bare
`new Date('2026-07-06')` is parsed as UTC midnight and printed local, which is
the previous day west of Greenwich -- the payment dated the 6th would have read
as the 5th.

**THE PICKER'S OWN FIELDS CANNOT FOLLOW, and they are left alone.**
`date-picker.js` reads one shape -- `^(\d{4})-(\d{2})-(\d{2})$` in `parse()`
-- and writes ISO straight back into the input on every pick, at four places.
A field showing mm/dd/yyyy is a field the module cannot read: no calendar
position, no range arithmetic. There is no format hook, and
`--short` is a width rather than a format. Filed as a sixth request. Writing a
display layer over a module that owns the field is the workaround shape
`AGENTS.md` forbids, so nothing was written.

**A TEST OF MINE WAS BADLY DESIGNED AND IS NOT EVIDENCE.** The first attempt to
show the module rejects mm/dd/yyyy typed the format into the start field and
read a highlighted day off the calendar as acceptance. The highlight came from
the OTHER input, still ISO. The source settles it; that probe did not, and
saying so is cheaper than someone re-running it.

**2026-09-09 - the date labels, and a mono question answered by measuring.**
`From`/`To` are `Start date`/`End date`, matching Carbon's own story. The
`Pick-up` return pair took the same words rather than keeping the old ones: two
date ranges in one form labelled two ways would have made the conditional
section the odd one out, and the `Pick-up` heading above them already says
which outing they belong to.

**AND THE TYPE IS MONO, WHICH TOOK FOUR TRIES TO ESTABLISH.** rux asked whether
the date text is the mono version. Carbon compiles
`.rux--date-picker__input { font-family: var(--rux-code-02-font-family, 'IBM
Plex Mono', ...) }`, this app's input computes the same stack, and it resolves
to the real face: `09/08/2026` measures 84px against 77.16 for system-ui and
77.93 for Plex Sans, 84 being the true monospace advance. Nothing to change.

**THE MEASUREMENT WENT WRONG TWICE FIRST, AND THE REASON IS WORTH KEEPING.**
The first probes said it was NOT rendering mono -- `"IBM Plex Mono"` measured
identically to `serif`, which is what an unavailable face looks like. `plex.css`
sets `font-display: optional` on every face, and optional means the browser
uses the fallback if the file is not ready almost at once and then **never
swaps it in for that page load**, cached or not. So the face was present,
`document.fonts` reported it loaded, and the page was still drawing system-ui.
Only an explicit `document.fonts.load()` before measuring showed the real
advance. A warm reload did NOT fix it, and reading that as "optional is not the
cause" was wrong -- it is the cause, and the warm-load test simply had not
warmed the face.

**WHAT THAT MEANS IN USE.** On a cold load the date field can render in
system-ui rather than IBM Plex Mono, for the whole of that load. It is rux-ds's
deliberate choice -- reasoned in `plex.css`'s own header, which lists the
date-picker and time-picker inputs among the things that are code-02 -- and it
is not a divergence from Carbon, which this app matches either way. Recorded
rather than filed.

**2026-09-09 - the dates moved to the first row of Details.** rux's reasoning,
and it is the right one: the range is the first decision anyone makes about a
trip and the one field that arrives already answered. A trip created from a
cell carries the day that cell was, so the panel now opens with row one filled
and the rest blank, which is the order the form should read in.

**IT ALSO FIXED AN ADJACENCY BY ACCIDENT.** `Pick-up`, the return pair, is
appended after the main block and only shown for a drop-off and pick-up trip.
Type used to sit two fields above it; Type is now directly above, so choosing
that type makes a field appear immediately beneath the select that asked for
it. Driven: switching the type reveals `Pick-up` in place.

**AND IT COSTS THE CALENDAR NOTHING**, which was the thing worth checking
rather than assuming. `__calendar-container` is `position: absolute;
inset-block-start: 100%` against its own root, so it opens downward over what
follows -- from the top of the panel it has MORE room, not less. Measured: the
calendar opens at 260 and ends at 608 against a panel body ending at 869, so it
now falls entirely inside the panel where before it ran past the fold. Overflow
is unchanged at 191 for a round trip; nothing moved but the order.

**2026-09-09 - the calendar was painting the panel's own colour.** rux
compared it against Carbon's `range-with-calendar` story at g100 and said the
surface looked wrong. It was, and the token was right -- what was missing was
the context it reads.

**THE MEASUREMENT.** `.rux--date-picker--next .rux--date-picker__calendar` is
`background-color: var(--rux-layer)`, and `--rux-layer` is CONTEXTUAL: Carbon
expects an ancestor to have raised it. Nothing on Carbon's story page has, so
the calendar takes layer-01 and steps above the page background, which is why
it reads correctly there. Here it opens inside a side panel that IS a layer-01
surface: measured in g90, panel `#393939` and calendar `#393939` -- the same
value, no step, the boundary invisible. Not a wrong colour, a missing one.

**THE FIX IS CARBON'S OWN LAYER COMPONENT.** `.rux--layer-one/two/three` are
compiled in the pin and set `--rux-layer` for their subtree; a surface floating
over another surface is exactly what layer-two is for. It goes on
`__calendar-container` and not on the panel, so every field in the form keeps
the layer it had and only the floating thing is raised. It survives
`date-picker.js` detaching and re-inserting the container, the class travelling
with the element.

**STEPPED IN ALL FIVE THEMES, checked rather than assumed.** white 255/244,
g10 244/255, g90 82/57, g100 57/38, rux 255/244. **g10 inverts** -- the calendar
is DARKER than the panel there, because Carbon's g10 puts layer-01 at #ffffff
and layer-02 at #f4f4f4. That is the system's own ordering, not a fault, and it
is worth knowing before someone reads it as one.

**NOT A REQUEST.** The markup was already right: `date-picker.js` claims
`__calendar-container` inside the root and does not portal it, which is what
this app builds. Only the layer context was missing, and the class for it ships.

**2026-09-09 - the Billing tab, built against counted columns rather than a
mockup.** Third tab in the editor, between Details and Fleet.

**EVERY FIELD WAS COUNTED BEFORE IT WAS BUILT**, which is the habit the
Schedule section earned by getting it wrong. Over all 751 rows: `quoted_price`
99, `deposit_amount` 31, `invoice_number` 43, `po_ref` 42, `po_amount` 47,
`contract_status` 336, `invoice_status` 336, `balance_paid` 751, `date_paid`
24. All nine are real, so all nine are fetched and eight are editable.
`contract_status` holds exactly "Pending" and "Signed"; `invoice_status`
exactly "Pending" and "Invoiced" -- two values each, which is why they are
toggles and not selects.

**THREE THINGS IN THE MOCKUP ARE NOT BUILT, AND THE REASONS ARE DIFFERENT.**
`Service type` (Charter/Ticketed) has no column: `trips.service_type` does not
exist -- asked for it and read the error -- and exactly ONE trip of 751 has any
`trip_ticket_options`, so there is nothing to switch between and the column
would be rux's to add. `Est. miles`/`Actual miles` are not trip columns either;
`trip_stops.miles` carries them per stop with `miles_source` saying estimated
or manual, so a total is the itinerary's arithmetic. And `Balance` is drawn as
money in the mockup while `balance_paid` is a **boolean**, true on 751 of 751 --
the column is "is it settled", not "how much is left". It is a toggle, and the
amount outstanding is shown beside it as quoted less payments, from the same
rows the Payments list shows so the two cannot disagree.

**TWO FAULTS FOUND BY DRIVING IT, NOT BY READING IT.** Save never armed for any
Billing field: `input` and `change` were bound to `panelDetails` alone, so
typing a quoted price left the button grey and the edit was lost. And the
toggle read `false` after an odd number of presses, because `toggleField` bound
its own click handler to a control `js/form-controls.js` already owns --
`setToggle` sets `aria-checked`, swaps `__switch--checked` and fires
`rux:toggle`. Ours is gone; the panel listens for `rux:toggle` instead, which
is the third event, a <button> firing neither `input` nor `change`.

**THE TOGGLE'S WORDS ARE CARBON'S AND CANNOT BE OURS.** `setToggle` hard-codes
On/Off, so "Signed"/"Pending" was overwritten on the first press. The label
carries the meaning instead -- "Contract signed" -- which reads correctly and
needs no override. Filed as a fifth request: rux-ds's own file header already
calls that hard-coding "worth a decision rather than a silent default", so this
is that decision arriving with a consumer attached.

**MARKUP CAME FROM rux-ds's TEMPLATES, NOT FROM THE COMPILED SELECTORS.** The
toggle is `templates/form-page.html`'s shape, copied. That is the correction to
how `timeField` was built yesterday -- reading class names out of `rux.css` and
assembling something plausible produced a `rux--time-picker` wrapped round
markup that was not that component. One grep of `templates/` is the cost of not
doing that again. Money is a `rux--text-input` with `inputmode="decimal"` and
deliberately NOT `rux--number-input`: Carbon's ships stepper buttons, and a
quoted price is not stepped by one. `calendarBody()` was extracted so the range
picker and Billing's single `Date paid` build the same calendar.

**BLANK IS NULL AND NOT ZERO.** 652 of 751 trips have no quoted price; a form
turning every empty box into 0 would claim 652 free charters.

**VERIFIED: reads, arming, toggles. NOT VERIFIED: the write.** Trip 218 shows
quoted 45500, invoice 15659, PO ref "MT CONV DALLAS S26-ESCAMILLA", PO amount
22750, Contract Pending, Invoice Invoiced -- all matching the table. Save is
dead at open, arms on a money edit or a toggle, and dies again on the way back,
driven on both. **The `trips` update was not sent**: same standing limit as
everything else that writes here.

**NOT DONE.** Payments are read-only -- `backend-inventory.md` records that the
old app rewrites every row of a trip on save, so editing means owning insert,
update, delete and position, which is an editor rather than a panel field.
Deposit is stored but does not feed the balance, because what it means against
`trip_payments` was not established. No Service type, no miles, per above.
`node tools/check.mjs` passes.

**2026-09-09 - the Details tab restructured, and a correction that inverted
where it writes.** rux asked to strip the itinerary down to a pickup location
and three times, after a five-tab mockup from rux-ui. The structure was the
easy half; the store was not.

**I TOLD RUX THREE OF THE FOUR FIELDS WERE ALREADY COLUMNS AND THAT WAS WRONG
WHERE IT MATTERED.** `trips.departure_time`, `spot_time` and `return_time` do
exist -- and are **null on all 743 rows**, counted 2026-09-06 and recorded in
the comment above the select this app has been reading all along. `timesOf`
takes them only as a fallback that has never been taken; `spot` has no column
fallback at all. Writing them would have saved values **the board does not
read**: the field would change, Save would report success, and the bar would
not move. The Schedule section writes `trip_stops`.

**WHICH TURNS OUT TO BE THE HAPPY VERSION.** All four fields are two rows -- the
leg's `pickup` stop carries the location, `depart_prev` and `spot`; its `return`
stop carries `arrive`. Stripping the itinerary is editing those two rows, and
`stopsOfLeg` is now the ONE place that picks them, extracted from `timesOf` so
the bar and the panel describing it cannot choose different stops.

**WHAT WENT AND WHAT CAME.** Out: `This leg`, a 146px `sch-def` readout, and
`Itinerary`, a 284px structured list -- 430px of a 729px panel that could not be
acted on. In: Pickup location and a two-up row of Yard depart, Spot, Return.
**Overflow 405 to 191 at 1440x950**, and what remains is a form that scrolls
rather than a readout that forced it.

**TWO FAULTS CAUGHT BY LOOKING, BOTH MINE, BOTH IN THIS PASS.** First the row
was three columns: 288 across, 91 each, arithmetically fine and rendered
"07:5", "03:4", "07:C" -- a `type="time"` control draws "07:50 AM" plus a clock
and wants about 130. The clipping is in the control's shadow DOM, so
`scrollWidth` on the input reported nothing and only the screenshot showed it.
Two columns give 140. Second, and worse, `timeField` first wrapped a
`rux--text-input` in `rux--time-picker` -- a Carbon name on markup that is not
that component, since Carbon's time picker is a `__input-field` beside a
`select` for AM/PM. That is precisely the move `docs/rux-ds-requests.md` refuses
for `rux--date-picker__icon`. It is a plain Carbon text input in time mode now,
and `.sch-times` is an `sch-` rule for the row, which Carbon does ship nothing
for.

**VERIFIED: reads and arming. NOT VERIFIED: the write.** Every bar tested filled
all four from real stops -- 07:50 AM, 03:45 PM, 07:00 PM on trip 218, matching
both the bar and the readout that was removed. Save is dead at open, arms on a
time or a location edit, and dies again when the value is typed back, checked
on both. **The `trip_stops` update itself was not driven**: the grid needs the
production sign-in this browser pane has no session for, the same standing limit
under which `moveToBus` shipped. Two branches are also untested because this
week's data has neither: a **return-leg** panel, and the **disabled** state for a
leg missing a `pickup` or `return` row.

**NOT DONE.** Pickup location is a text input, not a select of the saved
locations -- `settings` holds them and this app does not fetch it. A leg with no
stop row gets disabled controls rather than an inserted row, deliberately:
making stops is the itinerary editor's job, which `screen-inventory.md` puts
later. Billing, Trip Contact, Requirements chips, Files and Grid from the mockup
are all untouched; Files is blocked upstream, `rux--file-uploader` not being in
the pin. `node tools/check.mjs` passes.

**2026-09-08 - custom themes were vendored, unlinked and failing in silence.**
rux-ds noticed it and sent the one line; every claim in it was checked here
before the line went in, and the round trip was driven live afterwards.

**THE FAULT.** `vendor/rux-ds/js/custom-themes.js` has shipped since the v0.1.9
pin and neither page ever linked it -- this app was scaffolded before rux-ds
Phase 16 put the tag in `templates/app-shell.html`, and a pin move refreshes
`vendor/` without rewriting a page. **Nothing failed loudly, because every read
of the module is optionally chained:** `profile.js:79` is
`window.Rux?.customThemes?.list() ?? []`, so the panel had no radio to clone and
said nothing; `theme.js:73` is `window.Rux?.customThemes?.get(t)`, so a stored
custom id resolved to `undefined` and fell back. A theme saved in rux-ds's
creator simply never appeared, with no error to search for.

**VERIFIED BEFORE THE FIX, NOT ASSUMED.** `window.Rux.customThemes` was
`undefined` on the live page and the account panel offered 5 radios -- the four
compiled themes and rux. The vendored file is byte-identical to rux-ds v0.1.11
(sha256 `a04c6e76…` both sides), so this needed no pin move and no tag.

**ORDER IS LOAD-BEARING AND IS WRITTEN DOWN.** `custom-themes.js` goes BEFORE
`theme.js`, because `theme.js` resolves a stored id through the module at load;
after it, a custom theme would resolve to undefined on the first paint.
rux-ds's own template has the same order at lines 14 and 15. A comment above
the tag says so, since the next person to tidy the head is the one at risk.

**DRIVEN LIVE, WHOLE.** Saved `{id:'probe-teal', kind:'accent', tokens:
{interactive:'#0f7d6b'}}`; the panel went from 5 radios to 6; applying it moved
`--rux-interactive` from #4589ff to #0f7d6b and set
`data-rux-custom-theme="probe-teal"`; removing it released the token back to
#4589ff, cleared the attribute and emptied the store. The probe was cleaned up
-- the page is back on g90 with 5 radios and `{"v":1,"themes":[]}` stored. Both
pages carry the module; `specimen.html` was checked too, not inferred from
`index.html`.

**ONE LIMIT, AND IT IS NOT MINE TO CLAIM AS TESTED.** rux-ds points out that
`localStorage` is per browser profile per origin, so a custom theme does not
follow a user to another device: the hub syncs the theme PREFERENCE to Supabase
but never the DEFINITION, so a custom id opened on a second device resolves to
nothing, falls back to white, and `account.js` would then push that white back
up. **Neither of us has tested it** -- it follows from two behaviours rather
than from a run -- and it needs a second device and the production sign-in this
browser pane has no session for. Recorded so it is not discovered as a surprise.

**2026-09-08 - button icons put under Carbon's rule rather than under our
attributes.** rux asked for button icons to follow Carbon design-system-wide at
16px. **Nothing in rux-ds needed changing: Carbon already enforces it.**
`.rux--btn .rux--btn__icon` is `1rem` square unconditionally (rux.css:3461) and
does NOT follow the button size -- xs through xl all draw 16. Across all 33
`.rux--btn__icon` rules there are two departures: `--expressive` at 20
(:3814) and `unstable-pagination` at `initial` (:22604). Carbon's own toolbar row
agrees, `.rux--toolbar-action__icon` being 1rem with a 1rem cap (:13390).

**WHAT WAS ACTUALLY WRONG WAS HERE, AND IT WAS GOVERNANCE RATHER THAN SIZE.**
Four `rux--btn` buttons -- `sch-prev`, `sch-next`, `sch-view-trigger`,
`sch-avail-close` -- drew their icons at 16 from `width`/`height` ATTRIBUTES
with no `rux--btn__icon` class, so Carbon's rule was not reaching them. They
looked right and were held right by nothing: an edit to either attribute would
have moved them with no rule objecting. The class is on all four now. **No
visual change, by design** -- measured 16x16 before and after, which is the
point of the change rather than a disappointment in it.

**AND ONE SET OF DEAD ATTRIBUTES REMOVED.** The side-nav icon carried
`width="20" height="20"` while `.rux--side-nav__icon > svg` (:28017) sets 1rem,
and CSS beats presentational attributes -- so it has always rendered 16 and the
markup has always said 20. Corrected to 16. Nothing moves; the file stops lying.

**THE TWO HEADER ACTIONS STAY AT 20, ON RUX'S CALL, AND THE GAP IS FILED.** Account and the app
switcher are `rux--btn--icon-only` carrying 20px icons by attribute, and putting
`rux--btn__icon` on them WOULD take them to 16 -- a visible change, and not
clearly the right one. `rux.css` compiles no size for header action icons at
all: `.rux--btn--icon-only.rux--header__action svg` sets `fill` and nothing else
(:27288), and Carbon's own React header actions ship 20. So this is the one
place where "follow Carbon" does not resolve itself, and it is rux's call rather
than a mechanical sweep's. The menu toggle is not a `rux--btn` at all, so the
rule would never have reached it either way.

**AND THE ARGUMENT FOR 20 IS STRONGER THAN "LEAVE IT".** Carbon's React ships
20px icons in `HeaderGlobalAction` and passes the icon as a bare child with no
`btn__icon` class -- which is exactly the markup shape here. So adding the class
would have moved this app AWAY from Carbon rather than towards it, which is the
opposite of what the sweep was for. Re-parsed rule by rule to be sure: of the
seven `rux.css` rules naming `header__action` with `svg` or `icon`, **zero set a
size** -- they set `fill`, `display` and `transform` only.

**A FIFTH REQUEST RATHER THAN A LOCAL RULE.** Pinning 20 in `rux-overrides.css`
would be a local rule standing in for a missing rux-ds one, which `AGENTS.md`
forbids in as many words, so `docs/rux-ds-requests.md` now asks rux-ds to
compile a size at whatever value it judges right. The ask is explicitly not
"20 is correct" -- if they compile 16, the attributes come off and this app
follows.

**AND OPENING THE CONSOLE TO CHECK THE SWEEP FOUND A DEFECT OLDER THAN IT.**
`svgUse(href, size, box)` takes the WHOLE viewBox string, and four callers were
passing its last number: `svgUse('#i-checkmark', 16, 32)` wrote
`viewBox="32"`, which is invalid, so the browser dropped the attribute and
logged one error per icon -- **78 in a session**, in the console this app is
meant to be debugged in. Fixed at the date-picker calendar, both mini-calendar
chevrons and the view menu's checkmarks.

**IT NEVER LOOKED WRONG, WHICH IS WHY IT LASTED.** Every symbol in the sprite
carries its own viewBox and scales into whatever viewport it is used in, so the
icons rendered correctly with no outer viewBox at all -- verified before
touching it, the view menu's checkmarks were the right size and shape. The
fault was only ever in the console. The numbers were not even guessable from the
call site: `#i-checkmark` is a 20-unit drawing, the chevrons are 16, and
`#i-calendar` is 32, where all four calls said 32. The helper now says so above
its own definition.

**VERIFIED BY MARKER, NOT BY A CLEAN BUFFER.** The pane's console accumulates
across reloads, so "the errors are gone" could not be read off it. Bracketed
between two deliberate `console.error` markers, with the view menu opened twice
and a bar clicked to rebuild every icon those four calls produce: **zero new
viewBox errors, and 0 malformed of 23 SVGs in the DOM.** The two remaining 404s
are `/switcher.js` and `/account.js`, root-absolute by design -- the same seven
`check.mjs` declines to check, and they resolve on the deployed root.

**NOT DONE.** Nothing pins the header action icons until that request lands;
they are 20 by this app's own markup, as they were. The `svgUse` fault was
found by hand and nothing gates against its return -- `check.mjs` cannot see a
malformed attribute built at runtime. `node tools/check.mjs` passes.

**2026-09-08 - rux-ds answered all four requests in one afternoon, and three
of the four answers are unreachable.** The rux-ds session reported back and
every claim below was checked in the clone rather than relayed.

**THREE LANDED ON `main` AND ARE IN NO TAG.** `a545cc1` corrects the
`ui-shell.js` comment and names both shells the CSS supports; `0527a30` scopes
`check-behaviour` to the document; `89e14fd` lets a page own the date-picker
trigger. `c869d7f` adds `#i-user--multiple`. **The pin is on v0.1.11 and that
work sits 42 commits past it**, so none of it is consumable here -- the pin only
ever moves to a tag. Cutting one is rux's call and rux-ds has put it to them; a
minor bump by their §8.2, both being additions. We are not asking for one, and
said so.

**WHAT THAT UNBLOCKS WHEN IT ARRIVES.** The date-picker trigger makes
`screen-inventory.md` §7 buildable -- jumping to a date is the week LABEL's job
-- which has been undecidable rather than merely unbuilt since 2026-09-07.
Nothing is built for it yet.

**`#i-events` IS DECLINED AND THE DRIVERS BUTTON IS NOW OUR PROBLEM.** Judged by
rasterising each glyph at its real device size and magnifying, not from a
screenshot: at 16 device px `events` merges the front figure's head and
shoulders into one smear. At 32 all three read, so the decline is a 1x call.
This app asked for a pair because a toolbar button draws its icon at 16px; with
one glyph the toggle either goes icon-only on `user--multiple` or stays text.
rux-ds agrees that is ours. Unanswered here.

**THE 8px ADJUDICATION STOPS BEING PROVISIONAL, WHICH IS THE MOST USEFUL THING
IN THE REPLY.** The capture half of our shell request was DECLINED, and the
reason is stronger than the fix would have been:
`carbon-react-spacing.json` keys on an element's own signature plus its parents
and holds one entry for `cds--header__name`; our 8px comes from a SIBLING
selector, and both shells give the name an identical signature and parent, so no
capture can separate them. `check-spacing.js:482` passes on ANY recorded
variant, so an 8px entry would license 8px across eleven persistent-shell
templates and rux-ds's own index.html -- a real regression to buy a cosmetic
pass here. **An exception list would not have been a passing check.**
`docs/gate-coverage.md` now says the finding is permanent and that we are not
waiting on anyone.

**AND WE WERE TOLD TO CHECK OUR OWN SHELL MARKUP, SO IT WAS CHECKED.**
`check-behaviour` found eleven rux-ds templates carrying an invented
`aria-label="Toggle navigation"`, which silently disabled `ui-shell.js`'s name
swap: the glyph and `aria-expanded` moved while the accessible name did not.
`index.html:219` carries `aria-label="Open menu"` -- the recognised pair, no
`data-rux-label-*` needed -- and driven live here, open gives "Close menu",
`#i-close` and `aria-expanded="true"`, close gives all three back. **Clean, and
verified rather than assumed.**

**NOT DONE.** No pin move, because there is no tag. The Drivers button is still
text. Everything the entries below leave open stays open, Edit trip's 405px
overflow included.

**2026-09-08 (second pass) - the two flanks made one width, and two
corrections to the entry below.** rux asked for three things: both companions
at a stock 320, the roster's day cells 24x24, and whatever that frees given to
the driver name. All three are in. The interesting part is that the entry
directly below this one argued against the second, and its argument was sound
on a premise nobody had checked.

**THE ROSTER WAS NEVER A CARBON PANEL, WHICH IS WHY IT DID NOT MATCH.** The
trip editor is `rux--side-panel--sm` and measures Carbon's compiled 20rem. The
roster is `.sch-aside`, this app's own box, and was `inline-size: max-content`
capped at 22rem: **331.195px, a width set by the longest driver name.** So the
two things flanking the board disagreed by 11px for a reason nobody chose, and
the roster moved whenever its data did. It is `flex: 0 0 20rem` now. Carbon
ships six panel sizes -- xs 16rem, sm 20rem, md 30rem, lg 40rem, xl 65rem, 2xl
80rem, each `clamp(16rem, var(--rux-side-panel-modified-size, N), 100%)` -- so
20rem is its number, reached the same way, not a local invention.
`--rux-side-panel-modified-size` is the sanctioned hook for a custom width and
this app still uses none.

**"WED IS 26px" WAS RIGHT AND WAS NOT THE WHOLE QUESTION.** The entry below
held `--sch-day-track` at sm because the head must carry three letters and
"Wed" is 26px at label-01 -- re-measured today at 25.0 of glyphs plus 0.32 of
tracking three times, so 26.0, and it genuinely will not fit 24. What it did
not weigh is the middle: the case for three letters was only ever that ONE
cannot tell Tuesday from Thursday or Saturday from Sunday. **Two can.** "We" is
18.4px, the widest of the seven, and clears a 24px cell with 5.6 to spare. The
labels are sliced from `weekday: 'short'` rather than hand-written, so a
non-English locale gets its own first two characters.

**THE CELL IS SQUARE AGAIN AND THE NAME TOOK THE DIFFERENCE.** `--sch-day-track`
rejoins `--sch-avail-h` at xs after one day apart, so the cells are 24x24 rather
than 32x24, and `--sch-head-w` is `minmax(0, 1fr)` -- which is what its own
comment had claimed since the aside became `max-content` and made the head the
thing sizing the box. **The name column goes 107 to 152**, and all 40 drivers
now fit it without ellipsing, in all five themes. The 32px head band is
untouched, so the two grids' top edges still line up.

**WHAT IT DID NOT BUY, AND THIS IS THE POINT.** The board gained 11px, not 56:
the days gave up 56 but the aside gave up its `max-content` 331 for 320, and
the rest went inward to the name. At 1440x950 with both companions open the
week is still short and still scrolls -- `crowded` is still true, the roster
still yields on the editor opening, and the overrule still costs Saturday and
Sunday. Nothing here was ever going to close 323px, which the entry below is
right about.

**AND A SECOND CORRECTION, TO THE FIELD-VARIANT DECISION.** That entry rejected
`size-sm` partly on "the panel's content is 729px inside a 729px box: it does
not overflow." That reads `scrollHeight`, which is floored at `clientHeight`
and so cannot report slack -- 729 was the box describing itself. Measured
properly: New trip's content is ~656 and fits at 1440x950 with 73 to spare, but
overflows by 87 at 790 tall; **Edit trip is 1134 in the same box -- 405 over at
950, 565 at 790** -- because it carries `This leg` (146) and `Itinerary` (284),
which New trip does not. The conclusion holds and the reason changes: `size-sm`
saves 8px on each of four fields, 32 against 405, so it is rejected for buying
8% of a real gap rather than for buying nothing. Edit trip's overflow is
structural and is NOT addressed here -- same shape as the 323px finding, and
open.

**AND A THIRD CORRECTION, TO A CARBON PRECEDENT THAT WAS NEVER THERE.** The
entry below defends 24px rows under a 32px band with "Carbon's own row-height
control offers exactly this shape: five row heights under an unchanged header."
Read from the compiled stylesheet rather than from memory, it does not: `thead
tr` sits in EVERY size selector beside `tbody tr` -- `--xs` 1.5rem (rux.css
:12127), `--sm` 2rem (:12157), `--md` 2.5rem (:12182), `--xl` 4rem (:12207),
with lg the unclassed default. **Carbon moves the head and the body together
and ships no variant where they differ.** 24-under-32 is this app's own shape,
which an `sch-` component is entitled to; what it is not entitled to is the
claim that Carbon ships it. The decision itself stands on the half that was
load-bearing -- there is no 32px body row on this page to be consistent with,
and 32 of 40 drivers is a measurement, not a precedent. Struck in place below.

**WHERE THAT CAME UP: rux asked whether each table should choose its own
header and toolbar size variant.** Answered no, and the first reason is that
the premise is not the page's: **there is no `rux--data-table` and no
`rux--table-toolbar` in this app at all** -- audited live, the only
`rux--layout--size-*` carriers are eight buttons, a tabs strip and a select.
The board, the roster and `.sch-toolbar` are all this app's own, so a size
variant has nothing to switch. The other two reasons: the header band was never
the constraint in the 24/32/24/32 flip-flop, which was always a body-row
question; and the two grids' top edges line up BECAUSE both bands are pinned at
32, so a per-table header size is precisely what would break the one alignment
invariant here. The density control that would pay is the one already built --
the view menu's four bar-row toggles move a 95px bus row, where a band can move
8.

**NOT DONE.** Everything the entry below leaves open stays open: the bars, no
undo, no weekend tint. Edit trip's overflow is now named and unfixed. The gates
were not re-run; this was measured by hand at 1440x950 and 1440x790, and the
clipping check was run in all five themes. `node tools/check.mjs` passes, token
count 79 -- one lower because the roster no longer reads
`--rux-layout-size-height-sm`.

**2026-09-08 - the layout review, and the arithmetic that settled three
open questions at once.** rux was finalising the layout with both companions
under review and asked three things: whether the driver grid has to match the
main table, whether xs and md could differ between them, and whether the trip
editor's fields want another variant or fluid. All three were answered by one
measurement neither question had asked for.

**THE THREE COLUMNS DO NOT FIT A WEEK AT 1440, AND NOTHING ABOUT DENSITY CAN
PAY FOR IT.** Measured live at 1440x950, both companions open: the board is
1344, the roster 331, the editor 320, two gaps 32, and seven day columns need
984 -- the `--sch-day-min` floor of 8.5rem times seven plus a 32px bus column.
1667 wanted against 1344 had, so the week runs **323px short** and Saturday and
Sunday scroll off the right edge. A charter board that hides the weekend is the
one failure this layout cannot have, and it had it. Either companion ALONE
fits: 997 of 997 with the roster, 1008 of 984 with the editor. Both together
never do -- all three need a 1763px viewport, which is why it looked correct on
rux's screen and broke on a laptop.

**WHY DENSITY WAS THE WRONG LEVER, WHICH IS WHAT THE QUESTIONS ASSUMED.** xs
rows give back 56px and the editor at `--xs` gives 64: 120 of the 323. There is
no arrangement of the three at 1440. The editor cannot go below its own 16rem
clamp, so the answer had to be about WHICH regions coexist, not how tight they
are.

**THE ROSTER YIELDS TO THE EDITOR, AND ONLY ON THE WAY IN.** `fitColumns` in
sch.js already computed this exact condition -- `day < dayMin` IS "the week does
not fit" -- so it is named `crowded` and returned rather than measured a second
time somewhere else. `fitPanelRoom` is why: docs/log.md records the afternoon
three places disagreed about one number, and a second budget would have been
the fourth. sch-data.js reads it once, as the editor OPENS, and hides the
roster; closing gives it back. Not on every fit -- this runs on every resize
frame, and yielding on a measurement that moves under the pointer would
collapse the roster while a window edge is being dragged.

**THE TOGGLE WAS WRITTEN WRONG FIRST AND THE BROWSER CAUGHT IT.**
`aria-pressed` came from `availOn`, the wanted state, so a yielded roster left a
lit button with nothing behind it -- and pressing it flipped the invisible want
to false: pressed, still nothing, control dead. Both now come from `shown`.
`availOn` still survives the editor, which is how the roster returns unasked;
it is simply no longer the thing announced. Verified through six steps: on,
yield, overrule, a second bar clicked with the overrule holding, off, close.

**XS ROWS UNDER AN SM HEAD, AND THE FLIP-FLOP ENDS ON AN ARGUMENT.** The row
height has been 24, 32, 24, 32 and is now 24. Every previous turn was fought
over how many drivers fit and the readings were genuinely even, which is why it
kept turning. What broke the tie: the consistency the last turn protected was
not there. It traded eight drivers for "one module on the page" and the page
does not have one -- a bus row is 95px. The 32px module lives in the toolbar
and the two header BANDS, never in a body row, so what the rows were matched to
was a band. The band is still 32px and still explicit. ~~Carbon's own
row-height control offers exactly this shape: five row heights under an
unchanged header.~~ **That sentence is wrong and is corrected in the entry
above, 2026-09-08 second pass: Carbon moves the head with the body at every
size and ships no such variant.** The rest of the paragraph stands, and so does
the decision -- the appeal to precedent was never the load-bearing half.
Measured at 1440x950: **32 of 40 drivers, up from 24**.

**THE DAY COLUMNS STOPPED FOLLOWING THE ROW, WHICH FORFEITS THE 56px ON
PURPOSE.** `--sch-day-track` WAS `--sch-avail-h`, so xs took the seven columns
with it. It also clipped the head: "Wed" is 26px at label-01 in a 24px column,
measured. Three letters are there because one cannot tell Tuesday from Thursday,
settled 2026-09-07, and reopening it for 56px that does not close a 323px gap
would be paying a real cost for nothing. The cell is 32x24 now rather than
square, which costs nothing -- what it draws is a bar spanning days.

**THE TRIP EDITOR'S FIELDS ARE UNCHANGED, AND FLUID WAS THE WRONG ASK.** Every
field measures 64px: a 20px label, a 40px control, 4px. The control is md
because `.rux--text-input` clamps to `--rux-layout-size-height-md` by default,
which is what the explicitly-md select already was, so they agreed before
anyone set them. **Fluid is `min-block-size: 4rem` -- 64px, identical**, because
it trades the outer label for an inner one; it buys no height at all. It also
hides `form__helper-text`, and there is no fluid checkbox in the pin, so the
four Status and needs boxes could not follow and the form would mix fluid with
default -- the one thing fluid must not do. `size-sm` works and was measured at
56px a field, but the panel's content is 729px inside a 729px box: it does not
overflow, so it would buy nothing but a smaller target on the only thing here
anyone types into. Left at 40. The board is scanned and the editor is typed
into; that is the same argument that frees the roster's rows, pointed the other
way.

**RUX PROPOSED ONE SHARED RIGHT-HAND SLOT** -- both companions in the same
place, mutually exclusive by construction -- and it is the better mechanism
against the worse model. It makes the budget structural: one slot cannot
overflow, no `crowded`, no restore. Declined because it costs the task the app
exists for. Assigning a driver means the editor open and the roster answering
who is free; the width budget keeps that wherever there is room -- verified at
2000x950, both open, schedule 1221 of 984 needed, no yield taken -- and gives
it up only where it cannot be had. The shared slot gives it up at every width
including the one rux works at. The 2026-09-06 note about the right-hand slot
putting the grid "between the board and the panel describing it" does NOT apply
here and was not the reason.

**AND THE HEADER QUESTION THAT CAME OUT OF IT, FILED RATHER THAN FIXED.** rux
compared this app's `rux--header__name` against another rux-ds app's and asked
which padding is correct. Neither is wrong: Carbon ships three values — 16/32
plain, 8/32 when a visible hamburger sits beside it, 16/16 below 41.98rem — and
this app gets the middle one because its toggle carries no `__hidden`. Nothing
in this repository touches that class. Checking it turned the standing note at
the foot of the 2026-09-06 entry into a real request: `js/ui-shell.js` calls a
desktop hamburger invented, and three separate compiled rules only do work in
that configuration. Written up in `docs/rux-ds-requests.md`, which now has four
open. The brand stays content-width, which is what Carbon's own header is —
there is no reserved slot to align to a rail that measures 0 most of the time.

**NOT DONE.** The bars themselves, still: the review's own findings from
2026-09-07 are all open. No undo, no weekend tint -- which this pass makes
sharper, since the weekend is exactly what was falling off. The gates were not
re-run; this was measured by hand in the browser at 1440x950 and 2000x950,
white and g90, and `node tools/check.mjs` passes with the token count at 80.

**2026-09-08 - the browser sweep at `52efa52`, and two gates that were never
actually run.** Figures and conditions are in `docs/gate-coverage.md`; this is
what the pass changed its mind about.

**THE HEADER OF `gate-coverage.md` WAS WRONG AND IT COST A SESSION ITS PLAN.**
It said running rux-ds's browser gates here means copying them into this
repository and deleting them again. The `b8c373d` entry forty lines below
already corrected that in bold. The header was read, believed, and a restart
into a different working directory was planned around it before anything was
measured. The header now says the true mechanism first. A correction that only
exists below the thing it corrects is not a correction.

**`check-rendered` AND `check-behaviour` WERE CARRIED AS "N/A" AND HAD NOT BEEN
RUN.** Both were run this time and neither reading matches the word.
`check-rendered` throws — `getBoundingClientRect` of null — because its unit is
`.ks-sec` inside `.ks-main`. `check-behaviour` reports 4 passed of 18, and the
prior entry's reasoning for the N/A was backwards: it said the gate "would
report a pass it did not earn", when what it actually does is report fourteen
failures it did not earn. Every one of those fourteen is a fixture scoped to a
kitchen-sink section id, so no consumer app can satisfy one. Filed as a request
in `docs/rux-ds-requests.md`.

**WHAT THE GATE COULD NOT SEE WAS CHECKED BY HAND, AND WORKS.** The shell
`check-behaviour` calls absent: nav 0 → 256 → 0 over two clicks, glyph
`#i-menu` → `#i-close` → `#i-menu`, `aria-label` "Close menu" while open. The
tablist it calls "fewer than two tabs": two, roving `tabindex` 0 / -1.

**TWO NEW SPACING DIVERGENCES, NEITHER A DEFECT.** The `rux--css-grid`
full-width inset is this app's own `--rux-grid-margin: 0`, and its comment's
arithmetic was measured rather than taken on trust — `.rux--content` pays 32px,
the column's margin pays 16px, content lands at 48px, and `.sch-board` lands at
48px too, so the regions do agree and the comment's "16px" is the grid's own
contribution. The `rux--tabs__nav-item` 1px margin is Carbon's own compiled
rule at `vendor/rux-ds/css/rux.css:25485`, an adjacent-sibling selector that
needs two tabs to fire; nothing here selects that class. Same category as the
standing `rux--header__name` finding.

**THE ELEVEN RUNTIME-ADDED CLASSES WERE RESOLVED, NOT ASSUMED.** ADDED is the
harmless direction for the coverage ratchet, but harmless is not the same as
resolves, so all eleven toggletip and popover classes were checked against the
pinned `rux.css` by hand, along with `rux--btn--selected`. The one class this
app builds rather than writes out, `sch--no-${r}`, has exactly four values and
exactly four matching selectors at `sch.css:607`.


**2026-09-07 - the toolbar's own pass, and two things left unbuilt on
purpose.** Continues the entry below, same sitting.

**IT DOES NOT STACK.** `flex-wrap: wrap` had put the week on a second line and
the actions on a third -- three rows of chrome above a board whose argument is
vertical room, and it moved the paging buttons every time it happened. One row
now; the LABEL is what gives way, truncating, because a shortened
"Sep 7 - 13, 20..." still says which week and a hidden button says nothing. The
month is `short` for the same reason: about 70px back on the widest thing there.

**RUX PROPOSED HIDING `New trip` AT NARROW WIDTHS** on the grounds that a trip
can be made by right-clicking an empty cell. Declined, and recorded because it
was a reasonable ask: that gesture is a LONG PRESS on touch, which this same day
taught to mean "pick up a bar", and a right-click menu is a power path rather
than how anyone learns an app can create something. Hiding the primary action at
the width where the app is hardest to use inverts it. `Drivers` is the better
candidate if one has to go.

**THE VIEW MENU, WITH TWO OF THE FOUR OPTIONS SECTION 7 LISTS.** Bar rows --
customer, times, requirements, drivers -- and start on Sunday. Turning a row off
REMOVES it: `--sch-bar-rows` is the count, so the bar shrinks and more buses fit,
which is the first thing done about the blank requirements line the review found.
**Time-aligned and two-week are deliberately absent.** This grid places by day
and fetches one week; a control for either would be a switch attached to nothing.
Preferences are `localStorage` with a try-catch, read before `cursor` is first
computed so a saved Sunday holds for the first week drawn.

**THE EQUIPMENT ICONS WERE SETTING THE ROW HEIGHT**, which rux saw and I had
argued against removing a day earlier. Two icons stacked under a number come to
about 74px; the rows carrying two measured taller than the rows carrying one.
The view menu makes it far worse -- a two-row bar is 40px, so equipment would
decide every row. `ada_lift` and `sleeper` are attributes and moved to a
toggletip on the bus number, built from the `popover-container` /
`toggletip-button` / `popover-content` structure in
`carbon-ibm-products-dom.json`. Out of service STAYS: it is a state, it changes
what the row accepts this week, and one icon cannot out-measure a bar.

**"#", NOT "Bus", and it saves no width.** rux asked for it to save space; the
column floors at 2rem to square the corner and the widest bus number is already
under it. What changes is a heading that stopped saying a word the grid says.

**THE DAY LETTERS WERE CRAMPED, AND THE FIX WAS THE TYPE.** rux asked for single
letters back. "Wed" at the table header's 14px is about 30px in a 32px square, so
the seven touched -- but one letter cannot tell Tuesday from Thursday, which is
what put three letters there this morning. The day cells drop to label-01 and
"Driver" keeps 14px: a word labelling names and a day labelling marks are
different jobs in one row.

**NOT BUILT, AND BOTH ARE UPSTREAM.** The Drivers button stays text: the sprite's
only person is `user--avatar` and the shell's Account button already uses it.
And the week label cannot become a date-picker trigger, which section 7 decided
it should be -- `js/date-picker.js`'s contract is that the trigger is
`__icon` INSIDE the picker's root, and every way round it either puts a Carbon
class on an app element or an app rule on a Carbon part. A picker in the shape
the component allows would be shipped knowing it is the wrong one. Both are in
`docs/rux-ds-requests.md`, which is new and is this app's record of what it has
asked for.

**2026-09-07 - the board rebuilt against Carbon's data table, in one long
pass with rux at the screen.** rux asked for a design review of the schedule --
"the most important page to get right as it will be the most used" -- and then
drove it component by component from IBM's own data table pages. Everything
below is one sitting; the order is the order it happened, because several
entries correct the one before them.

**THE REVIEW'S OWN FINDINGS, AND WHICH SURVIVED.** Colour spends itself on the
normal case (every bar blue, the one teal override doing all the work); five
lines per bar with the requirements row blank on nearly all of them; the
destination truncating while times never do; 70% of the board drawn as boxes;
four of five bar lines at one weight. **None of these are fixed.** They are the
content of the bars, and this pass was the frame around them.

**WHAT THE TABLE GAVE, in the order rux asked for it.** No box around the pane
-- Carbon's table draws none and the header band closes the top edge, and it
retired the line that met the trip panel's border as a doubled edge. No vertical
day rules, on rux's call to try the table's own terms; the arithmetic is
deliberately untouched so it is one paste back, and the thing to judge it on is
an EMPTY row, where nothing but the header seven columns away says which day is
which. No rule under either header band. The row rule runs through the bus
column, which only became possible because the row heads left `layer-accent-01`
-- the old comment measured 1.00:1 in g10 on that surface and every figure in it
still holds. The last row draws its rule again, which the pane's border had been
covering for.

**THE 32px MODULE, AFTER TWO WRONG ANSWERS.** rux asked whether the headers
should be md/40 and whether both could be 40 wide. Measured in Plex: "218" is
25.2px at 14px and 21.6 at 12, "1234" 33.6 and 28.8. 40 needs 12px type; 48
(Carbon's default table) was tried and reverted; 32 is where it landed, because
Carbon's SMALL table is what this board actually is. **The 32 was already right
and nobody had noticed**: `.sch-avail__days` was pinned at 2rem to meet the
schedule's day header, and the 40 and 48 experiments had silently broken that
for a day.

**THE TOOLBAR IS PART OF THE BOARD.** `.rux--table-toolbar` is `--rux-layer` at
3rem, the SAME surface as the grid body with the day band the only accent -- the
obvious guess, that the toolbar shares the header band's colour, is wrong and
the source screenshot shows it. It was first hung over the whole board on the
argument that `.sch-board` keeps its width when Drivers is toggled. **That was
wrong and rux saw it**: the driver grid has its own header row, so one toolbar
over two heads read as one table. It belongs to the schedule, in `.sch-frame`.

**THE TRIP EDITOR IS A COLUMN, NOT AN OVERLAY**, on rux's ask after IBM's
condensed-grid pages, and it reopens `screen-inventory.md` section 7. No rux-ds
module claims `side-panel`, so nothing was lost. What went with it:
`fitPanelRoom()`, `.sch-page--with-panel`, its no-script fallback, and the
`animationend` plus 400ms timer that existed to stop a one-frame flash on close.
Three places that had to agree about one number, and the log above records the
afternoon they did not.

**FOUR BUGS FOUND BY BUILDING IT.** A wrapper at `min-inline-size: 0` around a
panel with Carbon's `16rem` floor, which is why the editor escaped its own box.
`display: flex` on `.sch-aside` beating the UA's `[hidden]` rule -- the same
trap `.sch-row` documents twenty lines up, in a file that had already written
the lesson down. A definite height needed where a `max-block-size` was given,
without which the panel's `auto 1fr auto` rows never constrain and the Save bar
is pushed down the page instead of pinned. And `.sch-page` was **never**
`position: relative`, though `popMenuAt` has offset menus by its rect since the
day they were built -- every ancestor to `.rux--content` is static, so the
right-click menus have been landing about 96px out.

**THE PAGE'S INSET IS ONE NUMBER NOW.** It was `--rux-grid-margin` plus half a
gutter, 32px a side, stepping to 40 above 99rem. Zeroing the grid's own margin
leaves the column gutter, which is a flat 2rem at every width: 16px a side
always, matching what `.sch-board` puts between its regions.

**THE AUDIT RUX ASKED FOR AT THE END, and one finding I withdrew.** Times were
`String(t).slice(0, 5)` -- a truncation, not a format, and the only thing on the
page ignoring the reader; they are 12 hour. Tabs were `--contained`, which is
built to fill its container and filled half of a 20rem column. Both region
titles were wrong against each other rather than against their own subordinates,
and are `heading-compact-02` over the columns' `heading-compact-01`. The Drivers
toggle set `aria-pressed` and nothing else -- Carbon compiles no `[aria-pressed]`
styling at all, and `rux--btn--selected` is its own compiled answer. The driver
grid's single day letters could not tell Tuesday from Thursday, and the comment
justifying them cited an alignment that stopped existing when the grid moved
left. **Withdrawn:** that the bus and driver columns disagree on alignment. They
hold a 32px square of digits and a column of names; centred and start are both
right.

**NOT DONE.** No undo on a bus move. No weekend tint, so an empty row still
cannot be counted. Nothing about the bars themselves. The equipment icons stay
until a vehicle panel exists to hold what they say. Two icons are requested from
rux-ds in `docs/rux-ds-requests.md` and the Drivers button stays text until they
land. The duplicate driver names -- two Bennys, two Ernestos -- are untouched
and make the roster ambiguous in the one pane meant to resolve it.

**AND THE HONEST PART: almost none of this was verified by me.** The browser
preview stayed pinned to the rux-ds project through a folder change and three
restarts, so every check was `node tools/check.mjs`, `node --check`, a markup
balance parser, and text measured in Plex through a harness. rux looked at every
step and sent screenshots; several changes above exist because of what those
showed. The five browser gates have not been run against this pass at all, and
`docs/gate-coverage.md` is stale from `b8c373d`.

**2026-09-07 - moving a bus by accident on a phone, which was two faults.**
rux: *"i keep by mistake moving buses on mobile"*, and asked whether a
confirmation screen was the answer. It is not the first answer, because
neither fault needed one.

**A CONFIRMATION ON EVERY DROP WAS REJECTED.** It taxes the mouse drag, which
was never the thing going wrong, and a dialog raised on every legitimate move
is dismissed reflexively inside a week -- at which point it has cost the
gesture and gates nothing. It stays available as a touch-only gate if the two
fixes below turn out not to be enough; rux's call, not taken here.

**FAULT ONE: 4px is no threshold at all for a thumb.** The drag armed on 4px
of travel whatever the pointer was, and a finger moves that far just landing
on the glass. So a scroll that began on a bar and the drag were competing for
one gesture, and on a board that scrolls in both directions the scroll is what
a finger on a bar nearly always meant. Touch now HOLDS: within 10px for 400ms
and the bar lifts, travel before that and the drag stands down for good and
the board keeps the gesture. The mouse is untouched at 4px.

**Keyed off `pointerType`, not the screen.** The gesture says what it is; a
width query would have given a touchscreen laptop the hold for its mouse and,
had it been a `pointer: coarse` query, the same answer for both of its
pointers. One window, one size, both behaviours, decided per gesture.

**FAULT TWO, AND THE WORSE ONE: an interrupted drag committed the move.**
`pointercancel` was bound to the same handler as `pointerup`, and that handler
wrote as soon as the drag had armed. `pointercancel` is exactly what a browser
fires when it takes a touch over for scrolling -- so the accidental arm above
did not merely start a drag, it FINISHED one, against whichever row the bar
was last over, with nothing released. Not mobile's alone: a system dialog or a
window switch mid-drag does the same on a desktop. Only a release writes now.

**Measured before and after, on the shipped code.** The drag block was sliced
out of `sch-data.js` by its own text into a harness with stubbed
`client`/`show`/`say` and driven with synthetic pointer events, first from
`HEAD` and then from the working tree, same six gestures:

| Gesture | Before | After |
|---|---|---|
| Mouse drag to another bus, released | wrote | wrote |
| Mouse drag, interrupted | **wrote** | no write |
| Touch swipe across the bar (a scroll) | **wrote** | no write |
| Touch hold, drag, released | wrote | wrote |
| Touch hold, drag, interrupted | **wrote** | no write |
| Touch hold, dropped on its own row | no write | no write |

Five of six wrote before; the two that should write, write.

**The hold needed the page to stop fighting it.** `touch-action` is read when a
gesture STARTS, so it cannot be tightened once the hold completes: a
non-passive `touchmove` suppresses the scroll instead, which holds only because
arming requires the finger to have stayed still -- a scroll already under way
cannot be taken back. `.sch-bar` also takes `touch-action: manipulation`
(panning and pinching kept, double-tap zoom dropped), `-webkit-touch-callout:
none` and `user-select: none`, or iOS raises its selection callout on top of
the bar being picked up. Android fires `contextmenu` at about the moment the
hold completes, so the bar menu now stands down while a touch drag is armed;
right-click is unchanged.

**NOT DONE, and each is a separate decision.** No undo on a completed move --
proposed as the third fix, the write to reverse it is the one `moveToBus`
already makes, and it is the only one of the three that helps when the move
was deliberate but wrong. No touch-only confirmation. **And this was not
driven on a real touch device or on the live page**: the grid needs the
production sign-in the browser pane has no session for, so the evidence above
is synthetic pointer events against the real code, not a thumb on a phone.
`node tools/check.mjs` exits 0. The header of `sch-data.js` still opens "READ
ONLY ... nothing here writes", which stopped being true when the drag landed
and is untouched here.

**2026-09-06 - full width, because a board is scanned, not read.** rux asked
whether the week should still be tiny on a large screen, and whether it should
still scroll with the trip panel and the driver grid open when there is room
either side. It should not, and the cause was not the board's.

**Carbon's grid caps content at 99rem and centres it.** `.rux--css-grid` is
`max-inline-size: 99rem; margin-inline: auto` -- a reading width, right for
prose and forms. On a 2000px screen that left about 200px dead on each side
while the board scrolled for want of room: with both the panel and the driver
grid open it had 763px against the 995 seven columns need at their floor.

**Carbon ships the answer.** `rux--css-grid--full-width` is
`max-inline-size: 100%`, the modifier for exactly a data-dense page. Applied
always rather than behind a toggle: a week board has no reading-width
argument, and a toggle is a control that needs explaining for a state nobody
would choose.

Measured at 2000px: board only 1854 wide with 258px days; with the driver grid
1577 and 219; with the driver grid AND the trip panel 1097 and 150 - all seven
days on screen in every state, nothing scrolling. At 1440 nothing changes,
since the cap was above the viewport there anyway.

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
