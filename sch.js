// BEHAVIOUR: selecting a trip bar, and sizing the day columns to whole pixels.
// No network, no drag, no editing yet.
//
// A bar is a role=button whose pressed state IS the selection -- aria-pressed
// is the state of record and no class mirrors it -- and the browser pane
// delivers Enter and Space as keydown without a click, so this turns those
// into one.
(() => {
  'use strict';

  document.addEventListener('click', e => {
    const bar = e.target.closest('.sch-bar');
    if (!bar) return;
    const on = bar.getAttribute('aria-pressed') === 'true';
    for (const b of document.querySelectorAll('.sch-bar[aria-pressed="true"]')) b.setAttribute('aria-pressed', 'false');
    bar.setAttribute('aria-pressed', on ? 'false' : 'true');
  });

  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.sch-bar')) { e.preventDefault(); e.target.click(); }
  });

  /* ── WHOLE-PIXEL DAY COLUMNS ──────────────────────────────────────────────
     A day column of `1fr` is whatever a seventh of the leftover happens to be,
     and that is almost never a whole pixel. Measured 2026-09-06 at 1440 on a
     2x display: the track came to 1253.992px, a day to 179.1417px, the day
     boundaries to 121, 300.141, 479.281, 658.422, 837.57 and so on, and 37 of
     38 bar edges missed a device pixel, the worst by 0.438 of one. The
     placement arithmetic was already exact -- the bars sat where the columns
     said, to within 0.016px -- so this is not a maths error. It is that the
     columns themselves land between pixels, and the browser then paints every
     bar edge, and every day rule, across two of them.

     THE REMAINDER GOES TO THE BUS COLUMN, not to a day. Flooring the day width
     leaves up to six pixels over; parking them in the last day would make one
     column visibly wider than its neighbours, and leaving them at the right
     edge would open a gap inside the pane's border. The bus column carries no
     alignment of its own, so growing it by a few pixels is invisible and the
     grid still fills its pane exactly.

     WHEN THE FLOOR BINDS this does nothing but round: the columns are already
     at --sch-day-min and the grid scrolls, so there is no remainder to place.

     IT IS AN ENHANCEMENT, NOT A REQUIREMENT. With this script absent the
     stylesheet's own `minmax(--sch-day-min, 1fr)` renders, which is what
     shipped before today. Nothing here is load-bearing for the grid to work.
     ────────────────────────────────────────────────────────────────────────*/
  const px = (el, name) => {
    const raw = getComputedStyle(el).getPropertyValue(name).trim();
    if (raw.endsWith('px')) return parseFloat(raw);
    if (raw.endsWith('rem')) return parseFloat(raw) * parseFloat(getComputedStyle(document.documentElement).fontSize);
    return NaN;
  };

  function fitColumns(sch) {
    // The stylesheet's own values, read back rather than duplicated here.
    sch.style.removeProperty('--sch-head-w');
    sch.style.removeProperty('--sch-day-track');
    const headBase = px(sch, '--sch-head-w');
    const dayMin = px(sch, '--sch-day-min');
    const days = parseInt(getComputedStyle(sch).getPropertyValue('--sch-days'), 10) || 7;
    const pane = sch.clientWidth;
    if (!pane || !Number.isFinite(headBase) || !Number.isFinite(dayMin)) return;

    const available = pane - headBase;
    let day = Math.floor(available / days);
    let head = headBase;
    if (day < dayMin) day = Math.floor(dayMin);     // floor binds; the grid scrolls
    else head = headBase + (available - day * days);

    sch.style.setProperty('--sch-day-track', `${day}px`);
    sch.style.setProperty('--sch-head-w', `${head}px`);
  }

  const sch = document.getElementById('sch');
  if (sch && 'ResizeObserver' in window) {
    // Observing the PANE, not the grid: the grid's width is what this changes,
    // so observing it would feed its own output back in.
    new ResizeObserver(() => fitColumns(sch)).observe(sch);
    fitColumns(sch);
  }
})();
