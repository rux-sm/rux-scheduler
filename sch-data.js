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
    'req_sleeper', 'req_ada', 'req_56pax',
    'trip_assignments(id,bus_id,position,leg,trip_drivers(driver_id,role))',
  ].join(',');

  async function read(weekStart) {
    const weekEnd = addDays(weekStart, 6);
    // A trip that STARTED before this week can still run through it, so the
    // window reaches back; 90 days is far longer than any trip in the data and
    // the exact overlap is decided per leg below, not by this filter.
    const lo = iso(addDays(weekStart, -90));
    const hi = iso(weekEnd);
    const unwrap = r => { if (r.error) throw new Error(r.error.message); return r.data ?? []; };

    const [buses, trips, drivers, oos] = await Promise.all([
      client.from('buses').select('id,number,capacity,type,status,sort_order,ada_lift,sleeper').order('sort_order').then(unwrap),
      client.from('trips').select(TRIP_COLUMNS).gte('start_date', lo).lte('start_date', hi).order('start_date').then(unwrap),
      client.from('drivers').select('id,name,short_name').then(unwrap),
      client.from('bus_out_of_service').select('bus_id,start_date,end_date,reason').lte('start_date', hi).gte('end_date', iso(weekStart)).then(unwrap),
    ]);
    return { buses, trips, drivers, oos, weekStart, weekEnd };
  }

  // -- placing --------------------------------------------------------------
  const legsOf = trip => {
    const legs = [];
    if (trip.start_date) legs.push({ leg: 'outbound', from: trip.start_date, to: trip.end_date || trip.start_date, count: trip.bus_count || 1, time: trip.departure_time });
    if (trip.return_start_date) legs.push({ leg: 'return', from: trip.return_start_date, to: trip.return_end_date || trip.return_start_date, count: trip.return_bus_count || trip.bus_count || 1, time: trip.return_time });
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
    const hue = HUES[String(trip.trip_bar_color || '').toLowerCase()] ?? 'gray';
    const bar = el('article', `sch-bar sch-bar--${hue}`);
    bar.setAttribute('role', 'button');
    bar.tabIndex = 0;
    bar.setAttribute('aria-pressed', 'false');
    bar.dataset.tripId = trip.id;
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

    const legDays = daysBetween(parseISO(leg.from), parseISO(leg.to)) + 1;
    const when = hhmm(leg.time) ? `Dep ${hhmm(leg.time)}` : (legDays > 1 ? `${legDays} days` : '');
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
    if (tracks.has(UNASSIGNED)) rows.push({ id: UNASSIGNED, bus: null });

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

      // THE HEAD IS THE NUMBER AND THE EQUIPMENT ICONS. Capacity, type and a
      // non-active status are not dropped, they move to the cell's title, so
      // the column can be narrow and a hover still answers "which bus is this".
      const head = el('div', 'sch-row-head');
      // "No bus", not "Unassigned": the word was the widest thing in the
      // column and set its width on its own. This one wraps, and the row's
      // title carries the full sense.
      head.append(el('div', 'sch-row-head__num', r.bus ? String(r.bus.number) : 'No bus'));
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
      for (const w of windows) {
        const place = clip(w.start_date, w.end_date, weekStart, weekEnd);
        const span = el('div', 'sch-oos');
        span.style.setProperty('--sch-start', place.start);
        span.style.setProperty('--sch-span', place.span);
        span.setAttribute('role', 'img');
        span.setAttribute('aria-label', `Out of service, ${w.reason || 'no reason given'}`);
        track.appendChild(span);
      }
      for (const b of bars) track.appendChild(barEl(b, driversById));

      rowEl.append(head, track);
      gridEl.appendChild(rowEl);
    }

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
    if (rangeEl) {
      const opts = { day: 'numeric', month: 'long', year: 'numeric' };
      const fmt = new Intl.DateTimeFormat(undefined, opts);
      rangeEl.textContent = typeof fmt.formatRange === 'function'
        ? fmt.formatRange(weekStart, weekEnd)
        : `${fmt.format(weekStart)} - ${fmt.format(weekEnd)}`;
    }

    const barCount = [...tracks.values()].reduce((n, list) => n + list.length, 0);
    if (!barCount) say('info', 'Nothing this week', 'No trip touches these seven days.');
    else say(null);
  }

  // -- the week, and moving between them ------------------------------------
  let cursor = mondayOf(new Date());
  let loading = false;

  async function show() {
    if (!client) {
      say('error', 'Not connected', 'The account script did not load, so this page has no way to reach the schedule. It is served from the site root and is missing here.');
      return;
    }
    if (loading) return;
    loading = true;
    try {
      render(await read(cursor));
    } catch (e) {
      schEl.hidden = true;
      say('error', 'Could not load the week', String(e && e.message ? e.message : e));
    } finally {
      loading = false;
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
