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

     THE REMAINDER GOES OUTSIDE THE PANE. Flooring the day width leaves up to
     six pixels over. They cannot go in a day column -- one column wider than
     its neighbours breaks the placement every bar is measured against. They
     went into the bus column until 2026-09-06, and that column is now exactly
     as wide as its content, so the leftover showed as up to 6px of extra space
     to the right of the bus number: measured 8px of glyph padding on the left
     against 9 to 14 on the right as the window moved. So the PANE gets that
     much narrower instead, and the leftover sits beyond its border in the
     page's own 32px of padding, where nothing reads it as part of the grid.

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

  /* ── THE PANE'S HEIGHT, MEASURED RATHER THAN GUESSED ──────────────────────
     The stylesheet caps the grid at `100dvh` minus a hard 15rem, which is a
     number tuned by hand to the chrome that happened to sit above it. That
     made the cap, not the space, decide: at a 950px viewport the pane came
     out 708px because 950 - 240 - 2 is 708, and hiding the 66px page heading
     would have changed nothing at all. Measuring the pane's own top means
     any change above it -- a heading going, a toolbar wrapping to two rows --
     turns into grid.

     The bottom margin is the content region's own padding, read from it, so
     the grid stops where every other page's content stops.
     ────────────────────────────────────────────────────────────────────────*/
  function fitHeight(sch) {
    const content = sch.closest('.rux--content');
    const below = content ? parseFloat(getComputedStyle(content).paddingBottom) || 0 : 0;
    const top = sch.getBoundingClientRect().top;
    // A floor, for the same reason the stylesheet has one: a short window
    // should scroll the page rather than crush the grid to nothing.
    const height = Math.max(24 * 16, Math.round(window.innerHeight - top - below));
    const next = `${height}px`;
    if (sch.style.maxBlockSize !== next) sch.style.maxBlockSize = next;
  }

  function fitColumns(sch) {
    // The stylesheet's own values, read back rather than duplicated here.
    // Cleared first so every measurement below is of the pane at its natural
    // size; reading a width this function set last time would shrink the grid
    // a little further on every pass.
    sch.style.removeProperty('inline-size');
    sch.style.removeProperty('--sch-day-track');
    // MEASURED, NOT PARSED. The bus column is `max-content` in the stylesheet
    // so it is exactly as wide as the widest thing in it -- there is no length
    // to read, and hand-setting one would clip the day a four-digit bus number
    // appears. The corner cell IS that column, so its rendered width is the
    // base, whatever the content turns out to be.
    const corner = sch.querySelector('.sch-corner');
    const headBase = corner ? Math.ceil(corner.getBoundingClientRect().width) : NaN;
    const dayMin = px(sch, '--sch-day-min');
    const days = parseInt(getComputedStyle(sch).getPropertyValue('--sch-days'), 10) || 7;
    const pane = sch.clientWidth;
    if (!pane || !Number.isFinite(headBase) || !Number.isFinite(dayMin)) return;

    const available = pane - headBase;
    let day = Math.floor(available / days);
    if (day < dayMin) {
      // The floor binds and the grid scrolls: there is no leftover to place,
      // and the pane keeps every pixel it has.
      day = Math.floor(dayMin);
      sch.style.removeProperty('inline-size');
    } else {
      const border = sch.offsetWidth - sch.clientWidth;   // its own 1px each side
      sch.style.inlineSize = `${headBase + day * days + border}px`;
    }
    sch.style.setProperty('--sch-day-track', `${day}px`);
  }

  const sch = document.getElementById('sch');
  if (sch && 'ResizeObserver' in window) {
    // Observing the PANE, not the grid: the grid's width is what this changes,
    // so observing it would feed its own output back in.
    const fit = () => { fitHeight(sch); fitColumns(sch); };

    // THE THREE WAYS THIS IS ASKED TO RUN, and why none of them alone is
    // enough. `window.resize` is the obvious one and is the only one proven
    // by hand here. The ResizeObserver covers the pane's own box changing
    // for a reason the window did not cause. And `Rux.schedule.fit` is the
    // EXPLICIT call, because the case that matters most is not a resize at
    // all: the status notification appearing above the grid -- a week with no
    // trips draws one -- pushes the pane down and takes from its height, and
    // that always happens inside a render, so the renderer says so rather
    // than leaving it to be noticed.
    //
    // THE OBSERVER PATH IS UNVERIFIED. This browser pane does not render
    // while it is hidden, and ResizeObserver delivers at paint, so no
    // callback ever arrived in testing -- a probe observer added by hand
    // counted zero over a change that moved the pane 80px. It is kept because
    // it is correct and free, not because it was seen working.
    const watch = new ResizeObserver(fit);
    watch.observe(sch);
    if (sch.parentElement) watch.observe(sch.parentElement);
    window.addEventListener('resize', fit);
    window.Rux = window.Rux || {};
    window.Rux.schedule = { fit };
    fit();
  }
})();
