/* ==========================================================================
   sch-data.js — THE LIVE WEEK, READ ONLY
   --------------------------------------------------------------------------
   Fills #sch-grid from the tables the rux-ui app already writes. Nothing here
   writes: no insert, no update, no delete, and the New trip button ships
   disabled. Step 2 of docs/screen-inventory.md section 5.

   THE CLIENT IS THE ACCOUNT'S, NOT A SECOND ONE. /account.js at the hub root
   opens the session and exposes window.Rux.account.client; two clients on one
   storage key put two GoTrueClient instances there, which supabase-js warns
   about. A module opened alone -- localhost, or this repo served by itself --
   has no /account.js, so it falls back to its own client with persistSession
   off, which cannot fight the first one because it stores nothing. The
   publishable key is meant to sit in client code; the secret keys are the
   backend project's and are nowhere near this repository.

   WHAT A BAR IS: ONE ASSIGNMENT, NOT ONE TRIP. A trip carries an outbound leg
   (start_date..end_date) and, when it is a drop-off and pick-up, a return leg
   (return_start_date..return_end_date) that can be days later; trip_assignments
   rows name a bus per leg and per position, so a seven-bus trip is seven bars
   across seven rows and a drop-off is two bars on the same row with a gap
   between them. A leg needing more buses than it has assignments contributes
   the difference to the Unassigned row, which is the dispatcher's to-do rather
   than an error.

   NO CONFLICT MARKING, DELIBERATELY. The specimen draws a double-booked bar
   and this page never will: placement here is by DAY, and two same-day trips
   on one bus are ordinary -- a morning charter and an afternoon one -- so
   marking every overlap would cry wolf on most rows. Real conflict detection
   needs the times, which is the time-aligned mode, which is later.

   EVERY VALUE FROM THE DATABASE IS WRITTEN WITH textContent. The rows were
   authored in another application, and a destination is data, never markup.
   ========================================================================== */
(() => {
  'use strict';

  const PROJECT = 'https://udnmqhayzhrbltxzzhjw.supabase.co';
  const PUBLISHABLE = 'sb_publishable_w3h8Mtwam0ULemVKGKyBfw_DTbTaJIS';

  const gridEl = document.getElementById('sch-grid');
  const schEl = document.getElementById('sch');
  const statusEl = document.getElementById('sch-status');
  const rangeEl = document.getElementById('sch-range');
  if (!gridEl || !schEl || !statusEl) return;

  // -- dates, all local -----------------------------------------------------
  // Never toISOString(): it converts to UTC first, so west of Greenwich every
  // date lands on the day before. These build and read the local calendar day.
  const DAY = 864e5;
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parseISO = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const mondayOf = d => addDays(d, -((d.getDay() + 6) % 7));
  // Math.round, because a span crossing a daylight-saving change is 23 or 25
  // hours and integer division would drop or add a day.
  const daysBetween = (a, b) => Math.round((b - a) / DAY);

  // -- the palette ----------------------------------------------------------
  // rux-ui stores a colour NAME, and its own module maps retired names to live
  // ones (orange and yellow to amber, cyan to teal). Carbon's tag palette has
  // no amber, so amber is the one colour that cannot be honoured and renders
  // warm-gray; it is also the most-used one. Recorded in docs/log.md as rux's
  // call: a neutral amber, or one bar hue that is not a Carbon tag.
  const HUES = {
    teal: 'teal', cyan: 'teal', green: 'green', purple: 'purple',
    pink: 'magenta', magenta: 'magenta', blue: 'blue', red: 'red',
    amber: 'warm-gray', yellow: 'warm-gray', orange: 'warm-gray',
  };

  // THREE LEVELS, WHICH IS RUX-UI'S OWN RULE. Its `--_tone` reads
  // `var(--_trip-bar-color, var(--sched-trip-bar-confirmed-tone))` with a
  // second rule giving `--unconfirmed:not([data-trip-bar-color])` the
  // unconfirmed tone: an override colour beats status, status beats the
  // default, and the default is BLUE, not neutral. Only the override was
  // wired here until 2026-09-06, and 679 of 743 trips carry none, so
  // virtually every bar came out grey -- a bar saying nothing where the old
  // board said "confirmed, nothing to look at".
  const hueFor = trip => HUES[String(trip.trip_bar_color || '').toLowerCase()]
    ?? (trip.confirmed === false ? 'red' : 'blue');

  const UNASSIGNED = ' unassigned';

  const client = window.Rux?.account?.client
    ?? (window.supabase ? window.supabase.createClient(PROJECT, PUBLISHABLE, { auth: { persistSession: false } }) : null);

  // -- status ---------------------------------------------------------------
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  const svgUse = (href, size, box) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size); svg.setAttribute('height', size);
    svg.setAttribute('viewBox', box); svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', href);
    svg.appendChild(use);
    return svg;
  };

  // WRITTEN OUT, NOT BUILT FROM A PREFIX AND A VARIANT. `rux--inline-
  // notification--${kind}` is a class no checker can resolve, and check-
  // classes said so on the first run: it read the literal half and failed on
  // it. Both whole names appear here, so the gate can see them, which is the
  // point of the gate.
  /* EVERY CLASS WRITTEN OUT IN FULL, never `--${kind}`: check-classes reads
     the source and cannot see through an interpolation.

     SUCCESS AND WARNING WERE MISSING UNTIL 2026-09-06 and the lookup falls
     back to `info`, so every "Saved" and "Trip created" notice this editor has
     shown was rendering as an INFO notice -- the right words in the wrong
     kind, which is exactly the sort of thing a fallback hides. Found while
     adding `warning` for a half-finished create. */
  const NOTE = {
    error: { cls: 'rux--inline-notification rux--inline-notification--error', icon: '#i-error--filled' },
    info: { cls: 'rux--inline-notification rux--inline-notification--info', icon: '#i-information--filled' },
    success: { cls: 'rux--inline-notification rux--inline-notification--success', icon: '#i-checkmark--filled' },
    warning: { cls: 'rux--inline-notification rux--inline-notification--warning', icon: '#i-warning--filled' },
  };

  function say(kind, title, subtitle) {
    statusEl.replaceChildren();
    if (!kind) { statusEl.hidden = true; return; }
    statusEl.hidden = false;
    const spec = NOTE[kind] ?? NOTE.info;
    const note = el('div', spec.cls);
    note.setAttribute('role', 'status');
    const details = el('div', 'rux--inline-notification__details');
    const icon = svgUse(spec.icon, '20', '0 0 32 32');
    icon.setAttribute('class', 'rux--inline-notification__icon');
    const wrap = el('div', 'rux--inline-notification__text-wrapper');
    wrap.append(
      el('div', 'rux--inline-notification__title', title),
      el('div', 'rux--inline-notification__subtitle', subtitle),
    );
    details.append(icon, wrap);
    note.appendChild(details);
    statusEl.appendChild(note);
  }

  // -- reading --------------------------------------------------------------
  const TRIP_COLUMNS = [
    'id', 'destination', 'customer', 'start_date', 'end_date',
    'return_start_date', 'return_end_date', 'departure_time', 'return_time',
    'trip_type', 'confirmed', 'trip_bar_color', 'bus_count', 'return_bus_count',
    'req_sleeper', 'req_ada', 'req_56pax', 'notes',
    'trip_assignments(id,bus_id,position,leg,trip_drivers(driver_id,role))',
    // THE TIMES ARE HERE, NOT ON THE TRIP. `trips.departure_time`,
    // `return_time` and `spot_time` are null on all 743 rows -- counted
    // 2026-09-06, not sampled -- so a bar reading them showed an empty row on
    // every trip. The itinerary carries them: a leg's first `pickup` stop
    // holds the departure in `depart_prev`, its last `return` stop holds the
    // arrival in `arrive`. That is rux-ui's own rule (extractTripTimes), with
    // one correction: it read a trip's stops without regard to leg, and a bar
    // here IS a leg, so the return leg of a drop-off must read its own.
    'trip_stops(position,leg,type,depart_prev,arrive,spot)',
  ].join(',');

  // A STALLED REQUEST HAS TO END SOMEWHERE. A rejected fetch surfaces at once,
  // but a connection that simply hangs does not: measured 2026-09-06 with the
  // network blocked, the grid sat dimmed and marked busy past seven seconds
  // with no error and no way back except a reload. The read loses after this,
  // the catch runs, and pressing the arrow again is a retry. The abandoned
  // request may still land; nothing reads it, because a second read cannot
  // start while one is in flight.
  const READ_TIMEOUT = 15000;
  const withTimeout = promise => Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(
      () => reject(new Error(`The schedule did not answer within ${READ_TIMEOUT / 1000} seconds.`)),
      READ_TIMEOUT)),
  ]);

  async function read(weekStart) {
    const weekEnd = addDays(weekStart, 6);
    // A trip that STARTED before this week can still run through it, so the
    // window reaches back; 90 days is far longer than any trip in the data and
    // the exact overlap is decided per leg below, not by this filter.
    const lo = iso(addDays(weekStart, -90));
    const hi = iso(weekEnd);
    const unwrap = r => { if (r.error) throw new Error(r.error.message); return r.data ?? []; };

    const [buses, trips, drivers, oos, timeOff] = await withTimeout(Promise.all([
      client.from('buses').select('id,number,capacity,type,status,sort_order,ada_lift,sleeper').order('sort_order').then(unwrap),
      client.from('trips').select(TRIP_COLUMNS).gte('start_date', lo).lte('start_date', hi).order('start_date').then(unwrap),
      client.from('drivers').select('id,name,short_name').then(unwrap),
      client.from('bus_out_of_service').select('bus_id,start_date,end_date,reason').lte('start_date', hi).gte('end_date', iso(weekStart)).then(unwrap),
      // OVERLAP, NOT CONTAINMENT: a driver away across the whole fortnight has
      // neither date inside this week and is still away every day of it.
      client.from('driver_time_off').select('driver_id,start_date,end_date,reason').lte('start_date', hi).gte('end_date', lo).then(unwrap),
    ]));
    return { buses, trips, drivers, oos, timeOff, weekStart, weekEnd };
  }

  // formatRange, not two formatted dates joined by a dash: only it knows that
  // a week inside one month is "September 7 - 13, 2026" here and "7-13
  // September 2026" elsewhere. Building it by hand read "7 - September 13,
  // 2026", which is what sent me looking.
  function setRange(weekStart, weekEnd) {
    if (!rangeEl) return;
    const fmt = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
    rangeEl.textContent = typeof fmt.formatRange === 'function'
      ? fmt.formatRange(weekStart, weekEnd)
      : `${fmt.format(weekStart)} - ${fmt.format(weekEnd)}`;
  }

  // -- placing --------------------------------------------------------------
  // A leg's clock, from its own stops. The trip columns stay as the fallback
  // they were written to be, though every one of them is null today.
  const timesOf = (trip, leg) => {
    const stops = (trip.trip_stops || [])
      .filter(s => (s.leg || 'outbound') === leg)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const pickup = stops.find(s => s.type === 'pickup') ?? stops[0];
    const back = [...stops].reverse().find(s => s.type === 'return');
    return {
      depart: pickup?.depart_prev || (leg === 'outbound' ? trip.departure_time : trip.return_time) || null,
      back: back?.arrive || null,
      spot: pickup?.spot || null,
    };
  };

  const legsOf = trip => {
    const legs = [];
    if (trip.start_date) legs.push({ leg: 'outbound', from: trip.start_date, to: trip.end_date || trip.start_date, count: trip.bus_count || 1, ...timesOf(trip, 'outbound') });
    if (trip.return_start_date) legs.push({ leg: 'return', from: trip.return_start_date, to: trip.return_end_date || trip.return_start_date, count: trip.return_bus_count || trip.bus_count || 1, ...timesOf(trip, 'return') });
    return legs;
  };

  const clip = (from, to, weekStart, weekEnd) => {
    const a = parseISO(from), b = parseISO(to);
    if (b < weekStart || a > weekEnd) return null;
    const vs = a < weekStart ? weekStart : a;
    const ve = b > weekEnd ? weekEnd : b;
    return {
      start: daysBetween(weekStart, vs),
      span: daysBetween(vs, ve) + 1,
      fromPrev: a < weekStart,
      toNext: b > weekEnd,
    };
  };

  // Greedy lane packing: the first lane whose last occupied day ends before
  // this bar starts. Bars are sorted by start first, which is what makes one
  // pass enough.
  function assignLanes(bars) {
    const lastEnd = [];
    bars.sort((x, y) => x.place.start - y.place.start || x.place.span - y.place.span);
    for (const bar of bars) {
      let lane = 0;
      while (lastEnd[lane] !== undefined && lastEnd[lane] >= bar.place.start) lane++;
      bar.lane = lane;
      lastEnd[lane] = bar.place.start + bar.place.span - 1;
    }
    return lastEnd.length || 1;
  }

  // -- drawing --------------------------------------------------------------
  const addRow = (bar, cls, ...parts) => {
    const r = el('div', `sch-bar__row ${cls}`);
    for (const p of parts) if (p != null) r.appendChild(p);
    bar.appendChild(r);
  };
  const hhmm = t => (t ? String(t).slice(0, 5) : '');

  function barEl(b, driversById) {
    const { trip, leg, assign, place, slot } = b;
    const hue = hueFor(trip);
    const bar = el('article', `sch-bar sch-bar--${hue}`);
    bar.setAttribute('role', 'button');
    bar.tabIndex = 0;
    bar.setAttribute('aria-pressed', 'false');
    bar.dataset.tripId = trip.id;
    bar.dataset.leg = leg.leg;
    if (assign) {
      bar.dataset.assignmentId = assign.id;
      bar.dataset.busId = assign.bus_id ?? '';
      bar.dataset.start = place.start;
      bar.dataset.span = place.span;
    }
    if (trip.confirmed === false) bar.classList.add('sch-bar--unconfirmed');
    if (place.fromPrev) bar.classList.add('sch-bar--from-prev');
    if (place.toNext) bar.classList.add('sch-bar--to-next');
    bar.style.setProperty('--sch-start', place.start);
    bar.style.setProperty('--sch-span', place.span);
    bar.style.setProperty('--sch-lane', b.lane);

    const count = leg.count || 1;
    const ref = [leg.leg === 'return' ? 'Return' : '', count > 1 ? `${slot + 1} of ${count}` : '']
      .filter(Boolean).join(' · ');

    addRow(bar, 'sch-bar__dest', el('span', null, trip.destination || 'No destination'), el('span', 'sch-bar__ref', ref));
    addRow(bar, 'sch-bar__client', el('span', null, trip.customer || ''));

    // Departure and return on one line, an en dash between them. The SPOT
    // time -- be at the yard -- is read above and deliberately not drawn: the
    // row is one line in a column of about 119px, and three times do not fit
    // where two already fill it. It belongs on the trip editor, which does not
    // exist yet.
    const dep = hhmm(leg.depart), back = hhmm(leg.back);
    const legDays = daysBetween(parseISO(leg.from), parseISO(leg.to)) + 1;
    const when = dep && back ? `${dep} \u2013 ${back}`
      : dep ? `Dep ${dep}`
      : back ? `Ret ${back}`
      : (legDays > 1 ? `${legDays} days` : '');
    addRow(bar, 'sch-bar__time', el('span', null, when));

    const reqs = [
      trip.req_sleeper ? 'Sleeper' : null,
      trip.req_ada ? 'ADA lift' : null,
      trip.req_56pax ? '56 pax' : null,
      trip.trip_type && trip.trip_type !== 'round_trip' ? String(trip.trip_type).replace(/_/g, ' ') : null,
    ].filter(Boolean).join(' · ');
    addRow(bar, 'sch-bar__reqs', el('span', null, reqs));

    const names = assign
      ? (assign.trip_drivers || [])
          .map(d => driversById.get(d.driver_id))
          .filter(Boolean)
          .map(who => who.short_name || who.name)
      : [];
    addRow(bar, 'sch-bar__drivers', el('span', null, assign ? (names.join(' · ') || 'No driver') : 'Needs a bus'));

    bar.setAttribute('aria-label', [
      trip.destination || 'No destination', trip.customer, ref,
      place.fromPrev ? 'continues from the previous week' : null,
      place.toNext ? 'continues into the next week' : null,
      trip.confirmed === false ? 'unconfirmed' : null,
    ].filter(Boolean).join(', '));
    return bar;
  }

  function render(data) {
    const { buses, trips, drivers, oos, timeOff, weekStart, weekEnd } = data;
    const driversById = new Map(drivers.map(d => [d.id, d]));
    // What the panel reads when a bar is clicked: the bar carries ids, not
    // objects, and re-fetching a trip already in hand would be a round trip
    // for nothing.
    panelIndex = { trips: new Map(trips.map(t => [t.id, t])), buses: new Map(buses.map(b => [b.id, b])), driversById };

    const tracks = new Map();
    const push = (key, bar) => { if (!tracks.has(key)) tracks.set(key, []); tracks.get(key).push(bar); };

    for (const trip of trips) {
      for (const leg of legsOf(trip)) {
        const place = clip(leg.from, leg.to, weekStart, weekEnd);
        if (!place) continue;
        const assigns = (trip.trip_assignments || [])
          .filter(a => (a.leg || 'outbound') === leg.leg)
          .sort((x, y) => (x.position ?? 0) - (y.position ?? 0));
        for (const a of assigns) push(a.bus_id ?? UNASSIGNED, { trip, leg, assign: a, place, slot: a.position ?? 0 });
        for (let i = assigns.length; i < (leg.count || 1); i++) push(UNASSIGNED, { trip, leg, assign: null, place, slot: i });
      }
    }

    // Rows: every active bus, plus any bus this week actually uses, so a trip
    // on a retired bus is visible rather than silently dropped.
    const used = new Set([...tracks.keys()]);
    const rows = buses
      .filter(b => b.status === 'active' || used.has(b.id))
      .map(b => ({ id: b.id, bus: b }));
    // ALWAYS PRESENT, HIDDEN WHEN EMPTY. A drag has to be able to drop the
    // week's FIRST unassigned trip somewhere, and a row that is not in the
    // document has no rectangle to aim at.
    rows.push({ id: UNASSIGNED, bus: null, empty: !tracks.has(UNASSIGNED) });

    gridEl.replaceChildren();
    gridEl.appendChild(el('div', 'sch-corner', 'Bus'));

    // TODAY IS THE HEADER CELL AND NOTHING ELSE. There was a rule down the
    // column until 2026-09-06; sch.css says why it went and why nothing
    // replaces it.
    const today = iso(new Date());
    let todayCell = null;
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i);
      const cell = el('div', 'sch-day');
      if (i >= 5) cell.classList.add('sch-day--weekend');
      if (iso(d) === today) { cell.classList.add('sch-day--today'); cell.setAttribute('aria-current', 'date'); todayCell = cell; }
      cell.append(
        document.createTextNode(d.toLocaleDateString(undefined, { weekday: 'short' })),
        el('span', 'sch-day__num', String(d.getDate())),
      );
      gridEl.appendChild(cell);
    }

    const oosByBus = new Map();
    for (const w of oos) { if (!oosByBus.has(w.bus_id)) oosByBus.set(w.bus_id, []); oosByBus.get(w.bus_id).push(w); }

    for (const r of rows) {
      const bars = tracks.get(r.id) ?? [];
      const lanes = bars.length ? assignLanes(bars) : 1;
      const rowEl = el('div', 'sch-row' + (r.id === UNASSIGNED ? ' sch-row--unassigned' : ''));
      if (r.empty) rowEl.hidden = true;

      // THE HEAD IS THE NUMBER AND THE EQUIPMENT ICONS. Capacity, type and a
      // non-active status are not dropped, they move to the cell's title, so
      // the column can be narrow and a hover still answers "which bus is this".
      const head = el('div', 'sch-row-head');
      // "No bus", not "Unassigned": the word was the widest thing in the
      // column and set its width on its own. This one wraps, and the row's
      // title carries the full sense.
      head.append(el('div', 'sch-row-head__num', r.bus ? String(r.bus.number) : 'No\nbus'));
      if (!r.bus) head.title = 'Trips with no bus yet';
      if (r.bus) {
        head.title = [
          `Bus ${r.bus.number}`,
          r.bus.capacity ? `${r.bus.capacity} pax` : null,
          r.bus.type,
          r.bus.ada_lift ? 'ADA lift' : null,
          r.bus.sleeper ? 'Sleeper' : null,
          r.bus.status !== 'active' ? r.bus.status : null,
        ].filter(Boolean).join(' · ');
      }

      // EACH SYMBOL KEEPS ITS OWN viewBox. The sprite quarries every icon from
      // the smallest size Carbon ships it in, so these are not all one box:
      // accessibility and hotel exist only at 32, warning--filled at 16. Drawing
      // a 16-box symbol inside a 32-box svg scales it to a quarter of the space.
      const kit = el('div', 'sch-row-head__kit');
      const flag = (href, box, label, cls) => {
        const span = el('span', cls || null);
        span.title = label;
        span.setAttribute('role', 'img');
        span.setAttribute('aria-label', label);
        span.appendChild(svgUse(href, '16', box));
        kit.appendChild(span);
      };
      if (r.bus?.ada_lift) flag('#i-accessibility', '0 0 32 32', 'ADA lift');
      if (r.bus?.sleeper) flag('#i-hotel', '0 0 32 32', 'Sleeper');

      const windows = (oosByBus.get(r.id) ?? []).filter(w => clip(w.start_date, w.end_date, weekStart, weekEnd));
      if (windows.length) {
        flag('#i-warning--filled', '0 0 16 16', `Out of service: ${windows.map(w => w.reason || 'no reason given').join('; ')}`, 'sch-row-head__oos');
      }
      if (kit.childElementCount) head.appendChild(kit);

      const track = el('div', 'sch-track');
      track.style.setProperty('--sch-lanes', lanes);
      if (r.bus) track.dataset.busId = r.bus.id; else track.dataset.unassigned = 'true';
      for (const w of windows) {
        const place = clip(w.start_date, w.end_date, weekStart, weekEnd);
        const span = el('div', 'sch-oos');
        span.style.setProperty('--sch-start', place.start);
        span.style.setProperty('--sch-span', place.span);
        span.setAttribute('role', 'img');
        span.setAttribute('aria-label', `Out of service, ${w.reason || 'no reason given'}`);
        track.appendChild(span);
      }
      for (const b of bars) { const el = barEl(b, driversById); installDrag(el); track.appendChild(el); }

      rowEl.append(head, track);
      gridEl.appendChild(rowEl);
    }

    // The pane's own border closes the grid, so whichever row ends up last on
    // screen must not draw a rule of its own.
    const shownRows = [...gridEl.querySelectorAll('.sch-row')].filter(r => !r.hidden);
    shownRows[shownRows.length - 1]?.classList.add('sch-row--last');

    // Every bar is replaced on a render, so the panel's opener is gone. Close
    // rather than leave a panel pointing at an element no longer in the page.
    closePanel(false);

    schEl.hidden = false;
    drawAvailability(availabilityRows(data), weekStart);
    placeAvailability();

    // THE ONLY MARK FOR TODAY IS ITS HEADER CELL, so the grid brings that cell
    // into view rather than leaving it past the right edge -- which is where a
    // Sunday sits on a narrow window. Only when it is actually out of view, and
    // never past the sticky bus column, which covers the pane's left edge.
    if (todayCell) {
      const sticky = gridEl.querySelector('.sch-corner')?.offsetWidth ?? 0;
      const visible = schEl.clientWidth;
      const left = todayCell.offsetLeft;
      const right = left + todayCell.offsetWidth;
      if (right > schEl.scrollLeft + visible) schEl.scrollLeft = right - visible;
      else if (left < schEl.scrollLeft + sticky) schEl.scrollLeft = Math.max(0, left - sticky);
    }

    // formatRange, not two formatted dates joined by a dash: only it knows
    // that a week inside one month is "September 7 - 13, 2026" here and
    // "7-13 September 2026" elsewhere. Building it by hand read
    // "7 - September 13, 2026", which is what sent me looking.
    setRange(weekStart, weekEnd);

    const barCount = [...tracks.values()].reduce((n, list) => n + list.length, 0);
    if (!barCount) say('info', 'Nothing this week', 'No trip touches these seven days.');
    else say(null);

    // The line above just changed what sits ABOVE the grid, which moves the
    // grid and changes how much height is left for it. sch.js owns that sum;
    // this says when to redo it rather than leaving it to an observer.
    window.Rux?.schedule?.fit?.();
  }

  /* ── MOVING A TRIP TO ANOTHER BUS ─────────────────────────────────────────
     THE ONE THING THIS PAGE WRITES, and it writes one column:
     `trip_assignments.bus_id`. Vertical only, exactly as rux-ui's own drag is
     -- a trip's DATES are the itinerary's business and are changed in the
     editor, never by sliding a bar sideways.

     ITS RULES, TAKEN FROM THAT DRAG RATHER THAN INVENTED:
       * a threshold before it counts, so a press that does not move still
         selects the bar;
       * the Unassigned row is revealed for the duration, because the week's
         first unassigned trip needs somewhere to land;
       * a double booking and an out-of-service stretch are WARNINGS, not
         walls -- the row says so and the drop still goes through, because the
         dispatcher can see something this page cannot;
       * the Unassigned row can never be a conflict;
       * dropping on the row it came from does nothing.

     WHAT IT DOES NOT DO: no ghost that re-lays-out a multi-day bar, no
     optimistic move. The source dims, the target row lights, and on release
     the week is read again from the server -- so what is on screen after a
     move is what the database actually holds, not what this page hoped.
     ────────────────────────────────────────────────────────────────────────*/
  const DRAG_THRESHOLD = 4;

  const overlaps = (aStart, aSpan, bStart, bSpan) =>
    aStart < bStart + bSpan && bStart < aStart + aSpan;

  // Read off the rendered week rather than the data, because the rendered
  // week is exactly the seven days being asked about.
  function targetWarns(track, start, span) {
    if (track.dataset.unassigned) return false;
    for (const other of track.querySelectorAll('.sch-bar')) {
      if (overlaps(start, span, +other.dataset.start, +other.dataset.span)) return true;
    }
    for (const oos of track.querySelectorAll('.sch-oos')) {
      const s = parseFloat(oos.style.getPropertyValue('--sch-start'));
      const n = parseFloat(oos.style.getPropertyValue('--sch-span'));
      if (overlaps(start, span, s, n)) return true;
    }
    return false;
  }

  async function moveToBus(assignmentId, busId) {
    const { error } = await client.from('trip_assignments').update({ bus_id: busId }).eq('id', assignmentId);
    if (error) throw new Error(error.message);
  }

  function installDrag(bar) {
    if (!bar.dataset.assignmentId) return;   // an unfilled slot owns no row to move
    bar.addEventListener('pointerdown', down => {
      if (down.button !== 0) return;
      const startY = down.clientY;
      const start = +bar.dataset.start, span = +bar.dataset.span;
      const fromBus = bar.dataset.busId || null;
      let moved = false, target = null, tracks = [], unassignedRow = null;

      const clear = () => {
        for (const { track } of tracks) track.classList.remove('sch-track--drop', 'sch-track--warn');
      };

      const move = ev => {
        if (!moved) {
          if (Math.abs(ev.clientY - startY) < DRAG_THRESHOLD) return;
          moved = true;
          unassignedRow = gridEl.querySelector('.sch-row--unassigned');
          if (unassignedRow?.hidden) { unassignedRow.hidden = false; unassignedRow.dataset.revealed = 'true'; }
          tracks = [...gridEl.querySelectorAll('.sch-track')].map(t => ({ track: t, rect: t.getBoundingClientRect() }));
          bar.classList.add('sch-bar--dragging');
          document.body.style.cursor = 'grabbing';
          bar.setPointerCapture(down.pointerId);
        }
        ev.preventDefault();
        const hit = tracks.find(({ rect }) => ev.clientY >= rect.top && ev.clientY <= rect.bottom);
        const next = hit?.track ?? null;
        if (next === target) return;
        clear();
        target = next;
        const sameRow = target && (target.dataset.busId ?? null) === fromBus;
        if (target && !sameRow) {
          target.classList.add(targetWarns(target, start, span) ? 'sch-track--warn' : 'sch-track--drop');
        }
      };

      const up = async () => {
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', up);
        bar.removeEventListener('pointercancel', up);
        if (!moved) return;
        document.body.style.cursor = '';
        bar.classList.remove('sch-bar--dragging');
        clear();
        if (unassignedRow?.dataset.revealed) { unassignedRow.hidden = true; delete unassignedRow.dataset.revealed; }
        // The browser fires a click after this; suppress the one that would
        // otherwise toggle selection at the end of a drag.
        bar.addEventListener('click', e => e.stopPropagation(), { capture: true, once: true });

        const toBus = target ? (target.dataset.busId ?? null) : fromBus;
        if (!target || toBus === fromBus) return;
        try {
          schEl.setAttribute('aria-busy', 'true');
          gridEl.classList.add('sch-grid--busy');
          await moveToBus(bar.dataset.assignmentId, toBus);
        } catch (e) {
          say('error', 'Could not move that trip', String(e && e.message ? e.message : e));
        } finally {
          schEl.removeAttribute('aria-busy');
          gridEl.classList.remove('sch-grid--busy');
        }
        show();   // read it back, rather than trusting the move landed
      };

      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
      bar.addEventListener('pointercancel', up);
    });
  }

  /* ── THE TRIP PANEL ───────────────────────────────────────────────────────
     READ ONLY for now: it shows a trip, it changes nothing. Editing goes in
     field by field, the way the drag went in.

     NO rux-ds MODULE CLAIMS `side-panel`, so opening and closing it is this
     app's own behaviour on Carbon's own markup -- the class is compiled, the
     structure is the sink's, and only the open/closed state is ours. Escape
     closes it and focus goes back to the bar that opened it, because a panel
     that swallows focus on close leaves a keyboard user at the top of the
     document.

     THE PAGE MAKES ROOM rather than the panel floating over it: `.sch-page`
     takes the panel's width as end padding, and the grid follows on its own
     because it measures its pane. Carbon's slide-in variant exists for
     exactly this and drops the shadow a floating panel would carry.
     ────────────────────────────────────────────────────────────────────────*/
  let panelIndex = { trips: new Map(), buses: new Map(), driversById: new Map() };
  let panelOpener = null;
  const panelDetails = document.getElementById('sch-panel-details');
  const panelFleet = document.getElementById('sch-panel-fleet');
  const panelSave = document.getElementById('sch-panel-save');

  const panelEl = document.getElementById('sch-panel');
  const panelBody = document.getElementById('sch-panel-body');
  void panelBody;   // kept as the scroll container's handle; content goes in the tabs
  const panelLabel = document.getElementById('sch-panel-label');
  const panelTitle = document.getElementById('sch-panel-title');
  const panelTitleCollapsed = document.getElementById('sch-panel-title-collapsed');
  const panelSubtitle = document.getElementById('sch-panel-subtitle');
  const pageEl = document.querySelector('.sch-page');

  const def = (rows) => {
    const dl = el('dl', 'sch-def');
    for (const [k, v] of rows) {
      if (!v) continue;
      dl.append(el('dt', null, k), el('dd', null, v));
    }
    return dl;
  };

  const section = (title, node) => {
    const wrap = el('div', 'sch-panel-section');
    wrap.append(el('div', 'sch-panel-section__title', title), node);
    return wrap;
  };

  /* THE EXIT IS ENDED BY THE ANIMATION, NEVER BY A TIMER. Carbon's exit is a
     150ms animation with `forwards`, and that fill is the only thing holding
     the panel off-screen once it finishes -- remove `--closing` and the
     element SNAPS back to opacity 1 at its original position. A
     `setTimeout(150)` loses that race every time: the timer starts when it is
     called and the animation starts a frame later, so the class came off at
     about 88% of the way through. Sampled every frame on 2026-09-06: at 143ms
     the panel was still at opacity 0.176 and 263px out, and the next frame had
     it back at opacity 1 and x=0. That one full-strength frame is the flash
     rux reported -- the panel appearing again just as it should have gone.

     ORDER MATTERS AS MUCH AS THE TRIGGER. `hidden` goes on FIRST, while the
     fill still holds the panel out of sight, and only then does the class come
     off; the snap happens to an element that is already `display: none`.

     The timer stays as a FALLBACK, not the mechanism. `animationend` does not
     arrive if a stylesheet suppresses animations -- which the gate sweep does
     deliberately -- and a panel that never hides is worse than one that
     flashes. It runs long, and whichever fires first wins. */
  function endClose() {
    if (!panelEl.classList.contains('rux--side-panel--closing')) return;
    panelEl.removeEventListener('animationend', onExitEnd);
    panelEl.hidden = true;
    panelEl.classList.remove('rux--side-panel--closing');
  }

  // NOT `{ once: true }`: the header runs animations of its own and they
  // bubble, so a listener spent on the first event to arrive would be spent on
  // the wrong one. This waits for an animation that ended on the panel itself.
  function onExitEnd(e) { if (e.target === panelEl) endClose(); }

  function closePanel(returnFocus = true) {
    if (panelEl.hidden) return;
    panelEl.classList.remove('rux--side-panel--open');
    panelEl.classList.add('rux--side-panel--closing');
    panelEl.addEventListener('animationend', onExitEnd);
    setTimeout(endClose, 400);
    pageEl?.classList.remove('sch-page--with-panel');
    markAvailDay(null);
    for (const b of document.querySelectorAll('.sch-bar[aria-pressed="true"]')) b.setAttribute('aria-pressed', 'false');
    const opener = panelOpener;
    panelOpener = null;
    window.Rux?.schedule?.fit?.();
    if (returnFocus && opener?.isConnected) opener.focus();
  }

  /* ── THE TRIP EDITOR ───────────────────────────────────────────────────────
     STEP 4's FIRST SLICE, and deliberately not all 88 columns of `trips`.
     What is editable here is what is a plain column on the trip and changes
     nothing about WHERE the bar sits: destination, customer, type, status,
     the three requirement flags, notes. One update, no cascade.

     WHAT IS NOT EDITABLE HERE AND WHY. Dates move a bar across days and are
     read through legsOf/clip, so a wrong write moves a real trip -- they get
     their own pass with the placement in front of it. Times are not on the
     trip at all: they live per-leg and per-stop in `trip_stops`, which is the
     itinerary editor. Bus and drivers are the Fleet half. Money, contacts and
     the per-leg workflow booleans are a fuller editor than this panel.

     ONE BUTTON, BECAUSE ONE IS WHAT IS CAPTURED. `action-set--row-double` is
     compiled but no captured story shows two buttons in an action set, so the
     second is not ours to invent (AGENTS.md). Close discards.

     SAVE READS BACK rather than trusting the write, the same rule the drag
     follows: `show()` refetches the week. A render replaces every bar, so the
     panel closes with it -- reopening on the new bar is not done yet. */
  const FIELD = (id, label, control, cls = 'rux--form-item') => {
    const item = el('div', cls);
    const lw = el('div', 'rux--text-input__label-wrapper');
    const lab = el('label', 'rux--label', label);
    lab.setAttribute('for', id);
    lw.appendChild(lab);
    item.append(lw, control);
    return item;
  };

  function textField(id, label, value) {
    const outer = el('div', 'rux--text-input__field-outer-wrapper');
    const wrap = el('div', 'rux--text-input__field-wrapper');
    const input = el('input', 'rux--text-input');
    input.type = 'text';
    input.id = id;
    input.value = value ?? '';
    wrap.appendChild(input);
    outer.appendChild(wrap);
    return FIELD(id, label, outer, 'rux--form-item rux--text-input-wrapper');
  }

  function selectField(id, label, value, options) {
    const box = el('div', 'rux--select rux--layout--size-md');
    const lab = el('label', 'rux--label', label);
    lab.setAttribute('for', id);
    const wrap = el('div', 'rux--select-input__wrapper');
    const sel = el('select', 'rux--select-input');
    sel.id = id;
    for (const [val, text] of options) {
      const o = el('option', 'rux--select-option', text);
      o.value = val;
      if (String(value ?? '') === val) o.selected = true;
      sel.appendChild(o);
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'rux--select__arrow');
    svg.setAttribute('width', '16'); svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 32 32'); svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#i-chevron--down');
    svg.appendChild(use);
    wrap.append(sel, svg);
    box.append(lab, wrap);
    const item = el('div', 'rux--form-item');
    item.appendChild(box);
    return item;
  }

  function checkField(id, label, checked) {
    const item = el('div', 'rux--form-item rux--checkbox-wrapper');
    const input = el('input', 'rux--checkbox');
    input.type = 'checkbox';
    input.id = id;
    input.checked = !!checked;
    const lab = el('label', 'rux--checkbox-label');
    lab.setAttribute('for', id);
    lab.appendChild(el('div', 'rux--checkbox-label-text', label));
    item.append(input, lab, el('div', 'rux--checkbox__validation-msg'));
    return item;
  }

  function notesField(id, label, value) {
    const item = el('div', 'rux--form-item');
    const lw = el('div', 'rux--text-area__label-wrapper');
    const lab = el('label', 'rux--label', label);
    lab.setAttribute('for', id);
    lw.appendChild(lab);
    const wrap = el('div', 'rux--text-area__wrapper');
    const ta = el('textarea', 'rux--text-area');
    ta.id = id;
    ta.rows = 3;
    ta.value = value ?? '';
    wrap.append(ta, el('span', 'rux--text-area__counter-alert'));
    wrap.lastChild.setAttribute('role', 'alert');
    item.append(lw, wrap);
    return item;
  }

  /* A CARBON RANGE DATE PICKER, built from the capture
     `preview-preview-datepicker--range-with-calendar@open`: the root, two
     `--from`/`--to` containers, and ONE shared calendar container. The module
     fills the calendar and owns it from there -- "the markup is the API" --
     so only the shell is written here, and `Rux.datePicker.init(scope)` claims
     it after the panel is built.

     IT WRITES ISO AND DISPATCHES `change`, which is why the dirty check picks
     these up for free. One behaviour to know: the FIRST pick of a range clears
     the `to` input, so a half-made range is a real state and the save below
     treats a blank end as "same day as the start". */
  const dpIcon = () => {
    const b = el('button', 'rux--date-picker__icon');
    b.type = 'button';
    b.setAttribute('aria-label', 'Open calendar');
    b.tabIndex = -1;
    b.appendChild(svgUse('#i-calendar', 16, 32));
    return b;
  };

  // BOTH NAMED IN FULL, never built from a fragment: `check-classes` reads the
  // source and cannot see through an interpolation, so a composed class name
  // is one it cannot verify -- and it said so. Same rule as the notification
  // kinds. These are the two the range capture carries.
  const DP_CONTAINER = {
    from: 'rux--date-picker-container rux--date-picker-container--from',
    to: 'rux--date-picker-container rux--date-picker-container--to',
  };

  const dpContainer = (which, id, labelText, value) => {
    const c = el('div', DP_CONTAINER[which]);
    const lab = el('label', 'rux--label', labelText);
    lab.setAttribute('for', id);
    const wrap = el('div', 'rux--date-picker-input__wrapper');
    const span = el('span');
    const input = el('input', 'rux--date-picker__input');
    input.type = 'text';
    input.id = id;
    input.value = value || '';
    span.append(input, dpIcon());
    wrap.appendChild(span);
    c.append(lab, wrap);
    return c;
  };

  function dateRange(fromId, toId, fromLabel, toLabel, fromVal, toVal) {
    const root = el('div', 'rux--date-picker rux--date-picker--next rux--date-picker--range');
    root.append(
      dpContainer('from', fromId, fromLabel, fromVal),
      dpContainer('to', toId, toLabel, toVal),
    );
    const cc = el('div', 'rux--date-picker__calendar-container');
    cc.hidden = true;
    const cal = el('div', 'rux--date-picker__calendar');
    cal.setAttribute('role', 'grid');
    cal.setAttribute('aria-label', 'Calendar');
    cal.tabIndex = 0;
    const month = el('div', 'rux--date-picker__month');
    const prev = el('button', 'rux--date-picker__month-nav');
    prev.type = 'button'; prev.setAttribute('aria-label', 'Previous month');
    prev.appendChild(svgUse('#i-chevron--left', 16, 32));
    const next = el('button', 'rux--date-picker__month-nav');
    next.type = 'button'; next.setAttribute('aria-label', 'Next month');
    next.appendChild(svgUse('#i-chevron--right', 16, 32));
    month.append(prev, el('div', 'rux--date-picker__current-month'), next);
    const weekdays = el('div', 'rux--date-picker__weekdays');
    for (let i = 0; i < 7; i++) weekdays.appendChild(el('div', 'rux--date-picker__weekday'));
    cal.append(month, weekdays, el('div', 'rux--date-picker__days'));
    cc.appendChild(cal);
    root.appendChild(cc);
    const item = el('div', 'rux--form-item');
    item.appendChild(root);
    return item;
  }

  // The fields this pass writes, each with how to read it off the form and
  // what counts as unchanged. `null` and '' are the same thing to the column.
  const SPLIT = 'dropoff_pickup';
  const isoOrNull = v => (/^\d{4}-\d{2}-\d{2}$/.test((v || '').trim()) ? v.trim() : null);

  const EDITS = [
    { key: 'destination', get: f => f['sch-f-destination'].value.trim() || null },
    { key: 'start_date', get: f => isoOrNull(f['sch-f-start'].value) },
    // A BLANK END IS THE SAME DAY, not a null: `legsOf` falls back to
    // start_date anyway, and the picker CLEARS this input on the first pick of
    // a range, so a half-made range would otherwise save as a null end.
    { key: 'end_date', get: f => isoOrNull(f['sch-f-end'].value) ?? isoOrNull(f['sch-f-start'].value) },
    // THE RETURN PAIR IS NULLED OFF A SPLIT, on rux's instruction: a
    // round trip carrying return dates draws a phantom second bar, because
    // `legsOf` makes a leg from them whatever the type says.
    { key: 'return_start_date', get: f => f['sch-f-type'].value === SPLIT ? isoOrNull(f['sch-f-rstart'].value) : null },
    { key: 'return_end_date', get: f => f['sch-f-type'].value !== SPLIT ? null
        : (isoOrNull(f['sch-f-rend'].value) ?? isoOrNull(f['sch-f-rstart'].value)) },
    { key: 'customer', get: f => f['sch-f-customer'].value.trim() || null },
    { key: 'trip_type', get: f => f['sch-f-type'].value || null },
    { key: 'confirmed', get: f => f['sch-f-confirmed'].checked },
    { key: 'req_sleeper', get: f => f['sch-f-sleeper'].checked },
    { key: 'req_ada', get: f => f['sch-f-ada'].checked },
    { key: 'req_56pax', get: f => f['sch-f-56pax'].checked },
    { key: 'notes', get: f => f['sch-f-notes'].value.trim() || null },
  ];

  let editing = null;   // { id, before: {...} }

  function readForm() {
    const f = {};
    for (const id of ['destination', 'customer', 'type', 'confirmed', 'sleeper', 'ada', '56pax', 'notes',
                      'start', 'end', 'rstart', 'rend']) {
      f[`sch-f-${id}`] = document.getElementById(`sch-f-${id}`);
    }
    if (Object.values(f).some(v => !v)) return null;
    const out = {};
    for (const e of EDITS) out[e.key] = e.get(f);
    return out;
  }

  const same = (a, b) => (a ?? null) === (b ?? null);

  function patchOf() {
    if (!editing) return null;
    const now = readForm();
    if (!now) return null;
    const patch = {};
    for (const e of EDITS) if (!same(now[e.key], editing.before[e.key])) patch[e.key] = now[e.key];
    return patch;
  }

  /* A TRIP WITHOUT A START DATE IS A TRIP NOBODY CAN SEE. `legsOf` makes the
     outbound leg only `if (trip.start_date)`, so saving a null start would
     take the trip off every week of the board while leaving the row in the
     table -- lost rather than deleted, and from inside the editor that just
     did it. So it is not saveable: clearing the field disables Save and the
     field is marked invalid. The same is not true of the end date, which
     falls back to the start, or of the pick-up pair, which only a split
     reads. */
  function refreshDirty() {
    const patch = patchOf();
    const startEl = document.getElementById('sch-f-start');
    const destEl = document.getElementById('sch-f-destination');
    const startOk = !!isoOrNull(startEl?.value);
    // DESTINATION IS REQUIRED because it is the bar's only label and because
    // it is not null on ANY of the 743 rows -- a null would be the first.
    const destOk = !!destEl?.value.trim();
    destEl?.setAttribute('aria-invalid', String(!destOk));
    // `aria-invalid` ONLY. The first attempt hung a
    // `rux--date-picker--invalid` class on the root and check-classes failed
    // it: Carbon compiles no such class, and inventing one to hang a rule on
    // is the thing AGENTS.md forbids. The attribute is real, it is what a
    // screen reader reads, and Save being dead says the rest.
    startEl?.setAttribute('aria-invalid', String(!startOk));
    // A NEW TRIP IS SAVEABLE WITH NOTHING CHANGED, because its defaults are
    // already a real trip -- the dirty test is for edits, not for creation.
    const nothingToDo = !editing?.creating && (!patch || Object.keys(patch).length === 0);
    panelSave.disabled = !startOk || !destOk || nothingToDo;
  }

  /* NEW TRIP OPENS THE SAME PANEL WITH NOTHING IN IT. A trip needs one thing
     to exist on the board -- a start date -- because `legsOf` builds the
     outbound leg only `if (trip.start_date)`. With no assignment the render
     pushes it into the Unassigned row, which is where a trip nobody has given
     a bus belongs, so creation needs no bus and no drivers.

     THE DEFAULTS ARE THE DATA'S, not invented. Across all 743 trips:
     `trip_type` is never null and 705 are round trips, so that is the type;
     `bus_count` is never null, so it is written as 1 rather than left for
     `|| 1` to cover; `confirmed` is never null and 274 trips are false, so a
     trip nobody has confirmed yet is a normal row and the box starts clear;
     `destination` is never null in any of the 743, which is why it is
     required below alongside the date. `customer` is null on 26, so it is
     not. */
  // The bus a new trip will be put on, when creation started from a cell.
  // Null means the trip is created with no assignment and lands in Unassigned.
  let createBusId = null;

  function openCreate(opts = {}) {
    const start = opts.startDate || iso(shown && cursor ? cursor : mondayOf(new Date()));
    createBusId = opts.busId || null;
    openPanel(null, {
      id: null,
      destination: '', customer: '',
      trip_type: 'round_trip', confirmed: false,
      start_date: start, end_date: start,
      return_start_date: null, return_end_date: null,
      req_sleeper: false, req_ada: false, req_56pax: false,
      notes: '', trip_assignments: [], trip_stops: [],
    });
  }

  function openPanel(bar, draft) {
    const creating = !!draft;
    const trip = draft ?? panelIndex.trips.get(bar.dataset.tripId);
    if (!trip) return;
    const legName = bar?.dataset.leg || 'outbound';
    const leg = legsOf(trip).find(l => l.leg === legName) ?? legsOf(trip)[0];
    const bus = bar ? panelIndex.buses.get(bar.dataset.busId) : null;
    const assign = bar ? (trip.trip_assignments || []).find(a => a.id === bar.dataset.assignmentId) : null;

    const heading = creating ? 'New trip' : (trip.destination || 'No destination');
    panelLabel.textContent = creating ? 'Create' : 'Trip';
    panelTitle.textContent = heading;
    panelTitleCollapsed.textContent = heading;
    panelSubtitle.textContent = creating ? '' : (trip.customer || '');

    const legDays = leg ? daysBetween(parseISO(leg.from), parseISO(leg.to)) + 1 : 0;
    const when = !leg ? '' : leg.from === leg.to
      ? parseISO(leg.from).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
      : `${parseISO(leg.from).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} to ${parseISO(leg.to).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} (${legDays} days)`;

    const names = assign
      ? (assign.trip_drivers || []).map(d => {
          const who = panelIndex.driversById.get(d.driver_id);
          const name = who ? (who.name || who.short_name) : null;
          return name ? (d.role && d.role !== 'driver' ? `${name} (${d.role})` : name) : null;
        }).filter(Boolean)
      : [];

    const reqs = [
      trip.req_sleeper ? 'Sleeper' : null,
      trip.req_ada ? 'ADA lift' : null,
      trip.req_56pax ? '56 pax' : null,
    ].filter(Boolean).join(', ');

    editing = { id: trip.id, creating, before: {
      destination: trip.destination ?? null,
      customer: trip.customer ?? null,
      trip_type: trip.trip_type ?? null,
      confirmed: trip.confirmed !== false,
      req_sleeper: !!trip.req_sleeper,
      req_ada: !!trip.req_ada,
      req_56pax: !!trip.req_56pax,
      notes: trip.notes ?? null,
      start_date: trip.start_date ?? null,
      end_date: trip.end_date ?? trip.start_date ?? null,
      return_start_date: trip.return_start_date ?? null,
      return_end_date: trip.return_end_date ?? trip.return_start_date ?? null,
    } };

    panelDetails.replaceChildren();
    const form = el('div', 'rux--stack-vertical rux--stack-scale-5');
    form.append(
      textField('sch-f-destination', 'Destination', trip.destination),
      textField('sch-f-customer', 'Customer', trip.customer),
      selectField('sch-f-type', 'Type', trip.trip_type, [
        ['', '—'],
        ['round_trip', 'Round trip'],
        ['one_way', 'One way'],
        [SPLIT, 'Drop-off and pick-up'],
      ]),
      dateRange('sch-f-start', 'sch-f-end', 'From', 'To', trip.start_date, trip.end_date || trip.start_date),
    );

    /* THE RETURN PAIR IS A SECOND OUTING, NOT THE END OF THE FIRST. Measured
       across all 743 trips on 2026-09-06: every one of the 12 drop-off and
       pick-up trips drops off on a SINGLE day, and the bus comes back 1 to 4
       days later -- Sandia TX drops 19 July and collects 22 July. A single
       From/To range would say the bus is committed for those four days when
       the point of the type is that it is free in between, and the board
       already knows better: `legsOf` makes two legs and draws two bars.

       Round trip and one way never carry return dates -- 0 of 731 -- so the
       pair only appears for a split. And one way is NOT a single date: 25 of
       26 run a day, but one runs three, so it keeps the range too. */
    const returnDates = el('div', 'sch-panel-return-dates');
    returnDates.appendChild(section('Pick-up', dateRange(
      'sch-f-rstart', 'sch-f-rend', 'From', 'To',
      trip.return_start_date, trip.return_end_date || trip.return_start_date)));
    returnDates.hidden = trip.trip_type !== SPLIT;
    form.appendChild(returnDates);
    const flags = el('fieldset', 'rux--checkbox-group');
    flags.setAttribute('aria-disabled', 'false');
    const legend = el('legend', 'rux--label rux--type-heading-compact-01', 'Status and needs');
    flags.append(
      legend,
      checkField('sch-f-confirmed', 'Confirmed', trip.confirmed !== false),
      checkField('sch-f-sleeper', 'Sleeper', trip.req_sleeper),
      checkField('sch-f-ada', 'ADA lift', trip.req_ada),
      checkField('sch-f-56pax', '56 pax', trip.req_56pax),
    );
    form.append(flags, notesField('sch-f-notes', 'Notes', trip.notes));
    panelDetails.appendChild(form);

    // THE LEG'S OWN FACTS STAY READ-ONLY. Dates and times are not in this
    // pass; they are shown because the editor above is meaningless without
    // knowing which leg is on screen.
    // NO LEG YET, SO NOTHING TO SAY ABOUT ONE. The section describes the bar
    // that was clicked, and in create mode there is no bar; showing it with
    // blanks would read as data that failed to load.
    if (!creating) panelDetails.appendChild(section('This leg', def([
      ['Leg', legName === 'return' ? 'Return' : 'Outbound'],
      ['When', when],
      // THE SPOT TIME HAS A HOME HERE. The bar's one line of times could hold
      // departure and return and no more; be-at-the-yard is read in the panel.
      ['Departs', hhmm(leg.depart)],
      ['Spot', hhmm(leg.spot)],
      ['Returns', hhmm(leg.back)],
    ])));

    // FLEET IS THE BUS AND WHO IS ON IT, and nothing else -- the leg's own
    // dates and times are in Details, above the editor they belong to. Both
    // tabs carried them for one commit, which read as a bug rather than a
    // convenience.
    panelFleet.replaceChildren();
    if (creating) {
      const onBus = createBusId ? panelIndex.buses.get(createBusId) : null;
      panelFleet.appendChild(onBus
        ? def([['Bus', `${onBus.number}`], ['Drivers', 'None yet']])
        : el('p', 'sch-panel-hint',
            'A new trip starts with no bus. Save it and it lands in the Unassigned row, where it can be dragged onto one.'));
    } else panelFleet.appendChild(def([
      ['Bus', bus ? `${bus.number}${(leg.count || 1) > 1 ? ` — ${(assign?.position ?? 0) + 1} of ${leg.count}` : ''}` : 'Not assigned'],
      ['Drivers', names.join(', ') || (assign ? 'None assigned' : null)],
      ['Needs', reqs],
    ]));

    const stops = creating ? [] : (trip.trip_stops || [])
      .filter(st => (st.leg || 'outbound') === legName)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    if (stops.length) {
      const list = el('div', 'rux--structured-list rux--structured-list--condensed');
      list.setAttribute('role', 'table');
      const body = el('div', 'rux--structured-list-tbody');
      body.setAttribute('role', 'rowgroup');
      for (const st of stops) {
        const row = el('div', 'rux--structured-list-row');
        row.setAttribute('role', 'row');
        const when = el('div', 'rux--structured-list-td rux--structured-list-content--nowrap', hhmm(st.depart_prev) || hhmm(st.arrive) || '');
        when.setAttribute('role', 'cell');
        const what = el('div', 'rux--structured-list-td', [st.label, st.name, st.address].filter(Boolean).join(' — ') || st.type || 'Stop');
        what.setAttribute('role', 'cell');
        row.append(when, what);
        body.appendChild(row);
      }
      list.appendChild(body);
      panelDetails.appendChild(section('Itinerary', list));
    }

    // The module claims a picker on load; these were built just now, so it is
    // asked again for this subtree.
    window.Rux?.datePicker?.init?.(panelDetails);

    /* A TABPANEL IS A TAB STOP ONLY WHEN NOTHING INSIDE IT IS. That is the
       ARIA rule, and Details breaks it: it holds 16 focusable controls, so its
       own `tabindex="0"` made the panel a redundant stop and drew a focus ring
       around the whole form -- which is what rux saw. Fleet is read-only with
       nothing focusable in it, so it KEEPS the attribute: without it a
       keyboard user could reach the tab and never reach what it reveals.
       Decided per panel, from its contents, rather than written into the
       markup once and left to rot as the contents change. */
    for (const tp of [panelDetails, panelFleet]) {
      const focusable = tp.querySelector('input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])');
      if (focusable) tp.removeAttribute('tabindex');
      else tp.setAttribute('tabindex', '0');
    }

    document.getElementById('sch-f-type')?.addEventListener('change', e => {
      returnDates.hidden = e.target.value !== SPLIT;
      refreshDirty();
    });

    refreshDirty();

    panelOpener = bar;
    markAvailDay(bar ? Number(bar.style.getPropertyValue('--sch-start')) : null);
    panelEl.classList.remove('rux--side-panel--closing');
    panelEl.hidden = false;
    panelEl.classList.add('rux--side-panel--open');
    pageEl?.classList.add('sch-page--with-panel');
    window.Rux?.schedule?.fit?.();
    document.getElementById('sch-panel-close')?.focus();
  }

  /* ── DRIVER AVAILABILITY ───────────────────────────────────────────────────
     LEFT OF THE BOARD, decided 2026-09-06 after trying it docked below the
     schedule and to its right as well. The dock aligned Thursday under
     Thursday and cost 240px of height; the right-hand slot sat between the
     board and the panel describing it, which is what settled it. Both are
     gone. The marked day column is what answers "who is free THEN" now that
     the columns no longer line up.

     BUSY IS DERIVED, NOT STORED. There is no per-driver-per-day row anywhere:
     a driver is busy on a day because an assignment they are on covers it, so
     this walks the same legs the bars are placed from and marks the days each
     one spans. That means it is exactly as correct as the board above it, and
     wrong in the same way if the board is.

     TIME OFF IS STORED, in `driver_time_off`, and beats busy in the cell --
     a driver both assigned and away is a conflict worth seeing as away. */
  const asideSlot = document.getElementById('sch-aside');
  const availEl = document.getElementById('sch-avail');
  const availGrid = document.getElementById('sch-avail-grid');
  const availToggle = document.getElementById('sch-avail-toggle');
  let availOn = false;
  let availRows = [];

  function availabilityRows({ trips, drivers, timeOff, weekStart, weekEnd }) {
    const rows = (drivers || [])
      .slice()
      .sort((a, b) => (a.short_name || a.name || '').localeCompare(b.short_name || b.name || ''))
      .map(d => ({ driver: d, days: Array.from({ length: 7 }, () => ({ off: null, trips: [] })) }));
    const byId = new Map(rows.map(r => [r.driver.id, r]));

    for (const trip of trips || []) {
      for (const leg of legsOf(trip)) {
        const place = clip(leg.from, leg.to, weekStart, weekEnd);
        if (!place) continue;
        for (const a of trip.trip_assignments || []) {
          if ((a.leg || 'outbound') !== leg.leg) continue;
          for (const td of a.trip_drivers || []) {
            const row = byId.get(td.driver_id);
            if (!row) continue;
            const what = trip.destination || 'Trip';
            for (let i = 0; i < place.span; i++) {
              const day = row.days[place.start + i];
              if (day && !day.trips.includes(what)) day.trips.push(what);
            }
          }
        }
      }
    }

    for (const off of timeOff || []) {
      const row = byId.get(off.driver_id);
      if (!row) continue;
      const place = clip(off.start_date, off.end_date || off.start_date, weekStart, weekEnd);
      if (!place) continue;
      for (let i = 0; i < place.span; i++) {
        const day = row.days[place.start + i];
        if (day) day.off = off.reason || 'Time off';
      }
    }
    return rows;
  }

  function drawAvailability(rows, weekStart) {
    availRows = rows;
    availGrid.textContent = '';

    const head = el('div', 'sch-avail__days');
    head.appendChild(el('div', 'sch-avail__day sch-avail__day--head', 'Driver'));
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart.getTime() + i * DAY);
      // ONE LETTER: M T W T F S S. The day number is directly above in the
      // schedule's own header, and "T..." truncated twice said less than "T".
      const cell = el('div', 'sch-avail__day', d.toLocaleDateString(undefined, { weekday: 'narrow' }));
      cell.dataset.day = String(i);
      head.appendChild(cell);
    }
    availGrid.appendChild(head);

    for (const row of rows) {
      const r = el('div', 'sch-avail__row');
      r.appendChild(el('div', 'sch-avail__name', row.driver.short_name || row.driver.name || 'Driver'));
      row.days.forEach((day, i) => {
        const busy = day.trips.length > 0;
        const cls = day.off ? 'sch-avail__cell sch-avail__cell--off'
          : busy ? 'sch-avail__cell sch-avail__cell--busy'
          : 'sch-avail__cell';
        const cell = el('div', cls);
        cell.dataset.day = String(i);
        cell.appendChild(el('span', null, day.off || day.trips.join(' · ')));
        if (day.off || busy) cell.title = `${row.driver.name || ''} — ${day.off || day.trips.join(' · ')}`;
        r.appendChild(cell);
      });
      availGrid.appendChild(r);
    }
    markAvailDay(currentTripDay());
  }

  // The selected trip's day, marked down the column so "who is free THEN" does
  // not need counting. Null clears it.
  function markAvailDay(index) {
    for (const c of availGrid.querySelectorAll('.sch-avail__cell--on-day, .sch-avail__day--on-day')) {
      c.classList.remove('sch-avail__cell--on-day', 'sch-avail__day--on-day');
    }
    if (index == null) return;
    for (const c of availGrid.querySelectorAll(`.sch-avail__cell[data-day="${index}"]`)) c.classList.add('sch-avail__cell--on-day');
    for (const d of availGrid.querySelectorAll(`.sch-avail__day[data-day="${index}"]`)) d.classList.add('sch-avail__day--on-day');
  }

  const currentTripDay = () => {
    const bar = document.querySelector('.sch-bar[aria-pressed="true"]');
    const start = bar && Number(bar.style.getPropertyValue('--sch-start'));
    return Number.isFinite(start) && bar ? start : null;
  };

  function placeAvailability() {
    if (asideSlot) {
      asideSlot.hidden = !availOn;
      if (availOn) asideSlot.appendChild(availEl);
    }
    availEl.hidden = !availOn;
    availToggle.setAttribute('aria-pressed', String(availOn));
    window.Rux?.schedule?.fit?.();
  }

  /* FIT AGAIN WHEN THE ROOM HAS ACTUALLY CHANGED. `.sch-page` transitions its
     end padding over 110ms, and the fit() inside openPanel runs at once --
     measuring the width the page still has, not the one it is going to. With
     only the grid there that self-corrected on the next resize and nobody
     noticed. With the side layout it does not: the grid keeps its pre-panel
     width, the aside is pushed past the panel's edge, and 420px of it sits
     behind the panel. Measured at 1440: aside right 1380 against a panel left
     of 960. So the fit is repeated when the transition ends and the numbers
     are real. */
  pageEl?.addEventListener('transitionend', e => {
    if (e.target === pageEl && e.propertyName === 'padding-inline-end') window.Rux?.schedule?.fit?.();
  });

  availToggle?.addEventListener('click', () => { availOn = !availOn; placeAvailability(); });

  // DIRTY IS COMPUTED, NOT TRACKED. Every input event re-reads the form and
  // compares it against the values the panel opened with, so typing a change
  // and typing it back out again disables Save rather than leaving it armed.
  panelDetails?.addEventListener('input', refreshDirty);
  panelDetails?.addEventListener('change', refreshDirty);

  panelSave?.addEventListener('click', async () => {
    if (!editing) return;
    const patch = patchOf();
    if (!editing.creating && (!patch || !Object.keys(patch).length)) return;
    const id = editing.id;
    const creating = editing.creating;
    panelSave.disabled = true;
    say('info', creating ? 'Creating the trip…' : 'Saving the trip…');
    try {
      // CREATE WRITES EVERY FIELD, not the diff: there is no row to diff
      // against. `bus_count` is set to 1 rather than left null, because it is
      // null on none of the 743 rows and `legsOf` would only paper over it.
      const row = creating ? { ...readForm(), bus_count: 1 } : patch;
      const wantBus = creating ? createBusId : null;
      /* TWO WRITES WHEN A CELL ASKED FOR A BUS, and they cannot be one:
         the assignment needs the trip's id, which only exists after the
         insert. `.select().single()` is what returns it.

         IF THE SECOND WRITE FAILS THE FIRST STANDS, and that is the honest
         outcome rather than a silent rollback this client cannot do: the trip
         exists, it simply has no bus, so it appears in the Unassigned row
         where it can be dragged onto one. The message says exactly that
         instead of claiming the whole thing failed. */
      const { data: made, error } = await withTimeout(
        (creating
          ? client.from('trips').insert(row).select('id').single()
          : client.from('trips').update(row).eq('id', id)).then(r => r));
      if (error) throw new Error(error.message);
      if (wantBus && made?.id) {
        const { error: aErr } = await withTimeout(client.from('trip_assignments')
          .insert({ trip_id: made.id, bus_id: wantBus, leg: 'outbound', position: 0 }).then(r => r));
        if (aErr) {
          await show();
          say('warning', 'The trip was created without its bus.',
            `It is in the Unassigned row and can be dragged onto one. ${aErr.message}`);
          return;
        }
      }
      // READ IT BACK rather than trusting the write, as the drag does. The
      // render replaces every bar, so the panel closes with it.
      await show();
      if (creating) say('success', wantBus ? 'Trip created on its bus.' : 'Trip created. It is in the Unassigned row until it has a bus.');
      else say('success', `Saved ${Object.keys(patch).length} change${Object.keys(patch).length === 1 ? '' : 's'}.`);
    } catch (e) {
      say('error', `The trip was not ${creating ? 'created' : 'saved'}. ${e.message}`);
      panelSave.disabled = false;
    }
  });

  /* ── RIGHT-CLICK AN EMPTY CELL ─────────────────────────────────────────────
     The old board's gesture, and the reason it is worth keeping: the two
     things a new trip most needs are the two the cell already knows. The row
     is the bus and the column is the day, so creating from a cell fills both
     in and leaves only the destination to type.

     WHICH DAY, FROM THE POINTER. The track is one element spanning all seven
     columns -- bars are placed inside it by percentage, not by cell -- so
     there is no per-day element to read. The day is the pointer's offset
     across the track divided by a seventh of its width, which is the same
     arithmetic `clip` uses in reverse.

     ONLY ON EMPTY SPACE. A right-click on a bar is left alone: that wants the
     bar's own actions, which are not built, and offering "new trip here" over
     an existing one would be the wrong answer to the gesture.

     THE MENU IS POSITIONED HERE AND OPENED BY THE MODULE. `Rux.menu.open`
     gives Escape, outside-press and focus return; it repositions only
     `position: fixed` surfaces, and this one is absolute inside `.sch-page`,
     so the placement below stands. */
  const cellMenu = document.getElementById('sch-cell-menu');
  const barMenu = document.getElementById('sch-bar-menu');
  let cellMenuAt = null;
  let barMenuFor = null;

  // Both menus are placed the same way, so the arithmetic is written once.
  function popMenuAt(menu, e) {
    const page = pageEl?.getBoundingClientRect();
    menu.hidden = false;
    menu.style.position = 'absolute';
    menu.style.insetInlineStart = `${e.clientX - (page?.left ?? 0)}px`;
    menu.style.insetBlockStart = `${e.clientY - (page?.top ?? 0)}px`;
    pageEl?.appendChild(menu);
    window.Rux?.menu?.open?.(menu, null);
  }

  gridEl.addEventListener('contextmenu', e => {
    const track = e.target.closest('.sch-track');
    if (!track || e.target.closest('.sch-bar')) return;
    if (!shown) return;
    e.preventDefault();

    const box = track.getBoundingClientRect();
    const days = parseInt(getComputedStyle(gridEl).getPropertyValue('--sch-days'), 10) || 7;
    const index = Math.min(days - 1, Math.max(0, Math.floor((e.clientX - box.left) / (box.width / days))));
    cellMenuAt = {
      startDate: iso(addDays(shown, index)),
      busId: track.dataset.unassigned ? null : (track.dataset.busId || null),
    };

    popMenuAt(cellMenu, e);
  });

  /* THE BAR'S OWN MENU. `screen-inventory.md` section 5 keeps three of the old
     bar's five icons and section 7 puts the ones wanted without opening
     anything here. Open trip is one. Move bus is the other, in the only form
     it can take without a list of every bus: taking the bus AWAY, which sends
     the trip to the Unassigned row -- the same write the drag makes when a bar
     is dropped there, so nothing new is being invented for it.

     TAKE OFF THIS BUS IS HIDDEN WHERE IT CANNOT ACT: a bar with no assignment
     row is an unfilled slot in the Unassigned row, and there is nothing to
     clear. A disabled item that can never enable is worse than no item.

     PRINT ENVELOPE IS THE THIRD AND IS NOT HERE, because printing is step 5 of
     the build order and nothing prints yet. Not forgotten -- deferred.

     DELETE IS NOT HERE EITHER, and deliberately: the inventory never lists it
     among the bar's actions, so it has no home in the plan yet and this is not
     the place to invent one for an irreversible write. */
  gridEl.addEventListener('contextmenu', e => {
    const bar = e.target.closest('.sch-bar');
    if (!bar || !bar.dataset.tripId) return;
    e.preventDefault();
    e.stopPropagation();
    barMenuFor = bar;
    document.getElementById('sch-bar-menu-unassign').hidden =
      !bar.dataset.assignmentId || !bar.dataset.busId;
    popMenuAt(barMenu, e);
  });

  barMenu?.addEventListener('click', async e => {
    const item = e.target.closest('.rux--menu-item');
    if (!item || !barMenuFor) return;
    const bar = barMenuFor;
    window.Rux?.menu?.close?.(barMenu);
    barMenu.hidden = true;

    if (item.id === 'sch-bar-menu-open') { openPanel(bar); return; }

    if (item.id === 'sch-bar-menu-unassign') {
      const assignmentId = bar.dataset.assignmentId;
      if (!assignmentId) return;
      say('info', 'Taking the trip off its bus…');
      try {
        // The same write the drag makes for a drop on the Unassigned row.
        const { error } = await withTimeout(
          client.from('trip_assignments').update({ bus_id: null }).eq('id', assignmentId).then(r => r));
        if (error) throw new Error(error.message);
        await show();
        say('success', 'Taken off its bus. It is in the Unassigned row.');
      } catch (err) {
        say('error', `The trip was not moved. ${err.message}`);
      }
    }
  });
  barMenu?.addEventListener('rux:menu-closed', () => { barMenu.hidden = true; });

  cellMenu?.addEventListener('click', e => {
    if (!e.target.closest('#sch-cell-menu-new')) return;
    window.Rux?.menu?.close?.(cellMenu);
    cellMenu.hidden = true;
    if (cellMenuAt) openCreate(cellMenuAt);
  });
  cellMenu?.addEventListener('rux:menu-closed', () => { cellMenu.hidden = true; });

  document.getElementById('sch-new-trip')?.addEventListener('click', () => openCreate());
  document.getElementById('sch-panel-close')?.addEventListener('click', () => closePanel());
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !panelEl.hidden) { e.preventDefault(); closePanel(); }
  });
  gridEl.addEventListener('click', e => {
    const bar = e.target.closest('.sch-bar');
    if (bar && bar.dataset.tripId) openPanel(bar);
  });

  // -- the week, and moving between them ------------------------------------
  let cursor = mondayOf(new Date());
  let loading = false;
  let shown = null;   // the week actually on screen, which is not `cursor` mid-fetch

  async function show() {
    if (!client) {
      say('error', 'Not connected', 'The account script did not load, so this page has no way to reach the schedule. It is served from the site root and is missing here.');
      return;
    }
    if (loading) return;
    loading = true;

    // SAY SO BEFORE THE FETCH, NOT AFTER IT. The week being asked for is known
    // the moment the button is pressed and the read takes a few hundred
    // milliseconds, during which nothing used to change at all -- measured
    // 2026-09-06, 120ms after a press the label, the bars and the status were
    // all the previous week's. Two presses read as nothing happening. The
    // label moves now and the grid dims, which says stale rather than empty:
    // clearing it would throw away a week the person can still read.
    const asked = cursor;
    setRange(asked, addDays(asked, 6));
    schEl.setAttribute('aria-busy', 'true');
    gridEl.classList.add('sch-grid--busy');

    try {
      render(await read(asked));
      shown = asked;
    } catch (e) {
      // A FAILED WEEK DOES NOT TAKE THE LAST GOOD ONE WITH IT. Hiding the grid
      // meant one dropped request wiped what was on screen. What is drawn is
      // still `shown`, so the label goes back to it and the notice says which
      // week failed; only a first load with nothing drawn yet stays empty.
      if (shown) setRange(shown, addDays(shown, 6));
      else schEl.hidden = true;
      const why = String(e && e.message ? e.message : e);
      say('error', 'Could not load that week', shown
        ? `${why} Still showing the week that did load.`
        : why);
    } finally {
      loading = false;
      schEl.removeAttribute('aria-busy');
      gridEl.classList.remove('sch-grid--busy');
    }
  }

  const go = days => { cursor = addDays(cursor, days); show(); };
  document.getElementById('sch-prev')?.addEventListener('click', () => go(-7));
  document.getElementById('sch-next')?.addEventListener('click', () => go(7));
  document.getElementById('sch-today')?.addEventListener('click', () => { cursor = mondayOf(new Date()); show(); });

  // /account.js opens the session asynchronously and these tables do not need
  // one, so the first paint does not wait for it; the client is whichever
  // exists when this runs.
  show();
})();
