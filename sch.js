// BEHAVIOUR: selecting a trip bar, and nothing else. A bar is a role=button
// whose pressed state IS the selection -- aria-pressed is the state of record
// and no class mirrors it -- and the pane delivers Enter and Space as keydown
// without a click, so this turns those into one. No network, no drag, no
// editing yet.
//
// IT ALSO DROVE A SIZE SWITCHER until 2026-09-06, a Carbon content switcher
// that no rux-ds module claims. rux removed the second size tier, so the
// switcher went with it and this file is back to one job.
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
