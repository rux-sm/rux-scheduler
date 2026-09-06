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
  const NOTE = {
    error: { cls: 'rux--inline-notification rux--inline-notification--error', icon: '#i-error--filled' },
    info: { cls: 'rux--inline-notification rux--inline-notification--info', icon: '#i-information--filled' },
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

    const [buses, trips, drivers, oos] = await withTimeout(Promise.all([
      client.from('buses').select('id,number,capacity,type,status,sort_order,ada_lift,sleeper').order('sort_order').then(unwrap),
      client.from('trips').select(TRIP_COLUMNS).gte('start_date', lo).lte('start_date', hi).order('start_date').then(unwrap),
      client.from('drivers').select('id,name,short_name').then(unwrap),
      client.from('bus_out_of_service').select('bus_id,start_date,end_date,reason').lte('start_date', hi).gte('end_date', iso(weekStart)).then(unwrap),
    ]));
    return { buses, trips, drivers, oos, weekStart, weekEnd };
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
    const { buses, trips, drivers, oos, weekStart, weekEnd } = data;
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

  const panelEl = document.getElementById('sch-panel');
  const panelBody = document.getElementById('sch-panel-body');
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

  function closePanel(returnFocus = true) {
    if (panelEl.hidden) return;
    // Carbon's own pair: --closing runs the exit, then the element goes back
    // to hidden. Without the wait the panel would vanish rather than leave.
    panelEl.classList.remove('rux--side-panel--open');
    panelEl.classList.add('rux--side-panel--closing');
    setTimeout(() => {
      panelEl.classList.remove('rux--side-panel--closing');
      panelEl.hidden = true;
    }, 150);
    pageEl?.classList.remove('sch-page--with-panel');
    for (const b of document.querySelectorAll('.sch-bar[aria-pressed="true"]')) b.setAttribute('aria-pressed', 'false');
    const opener = panelOpener;
    panelOpener = null;
    window.Rux?.schedule?.fit?.();
    if (returnFocus && opener?.isConnected) opener.focus();
  }

  function openPanel(bar) {
    const trip = panelIndex.trips.get(bar.dataset.tripId);
    if (!trip) return;
    const legName = bar.dataset.leg || 'outbound';
    const leg = legsOf(trip).find(l => l.leg === legName) ?? legsOf(trip)[0];
    const bus = panelIndex.buses.get(bar.dataset.busId);
    const assign = (trip.trip_assignments || []).find(a => a.id === bar.dataset.assignmentId);

    panelTitle.textContent = trip.destination || 'No destination';
    panelTitleCollapsed.textContent = trip.destination || 'No destination';
    panelSubtitle.textContent = trip.customer || '';

    const legDays = daysBetween(parseISO(leg.from), parseISO(leg.to)) + 1;
    const when = leg.from === leg.to
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

    panelBody.replaceChildren();
    panelBody.appendChild(def([
      ['Leg', legName === 'return' ? 'Return' : 'Outbound'],
      ['When', when],
      // THE SPOT TIME FINALLY HAS A HOME. The bar's one line of times could
      // hold departure and return and no more; be-at-the-yard is read here.
      ['Departs', hhmm(leg.depart)],
      ['Spot', hhmm(leg.spot)],
      ['Returns', hhmm(leg.back)],
      ['Bus', bus ? `${bus.number}${(leg.count || 1) > 1 ? ` — ${(assign?.position ?? 0) + 1} of ${leg.count}` : ''}` : 'Not assigned'],
      ['Drivers', names.join(', ') || (assign ? 'None assigned' : null)],
      ['Type', trip.trip_type ? String(trip.trip_type).replace(/_/g, ' ') : null],
      ['Status', trip.confirmed === false ? 'Unconfirmed' : 'Confirmed'],
      ['Needs', reqs],
    ]));

    const stops = (trip.trip_stops || [])
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
      panelBody.appendChild(section('Itinerary', list));
    }

    if (trip.notes) panelBody.appendChild(section('Notes', el('p', null, trip.notes)));

    panelOpener = bar;
    panelEl.classList.remove('rux--side-panel--closing');
    panelEl.hidden = false;
    panelEl.classList.add('rux--side-panel--open');
    pageEl?.classList.add('sch-page--with-panel');
    window.Rux?.schedule?.fit?.();
    document.getElementById('sch-panel-close')?.focus();
  }

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
