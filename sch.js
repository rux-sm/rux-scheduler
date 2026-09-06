// BEHAVIOUR: the specimen's two interactions, and no more. A trip bar is a
// role=button whose pressed state is the selection (aria-pressed is the
// state of record, no class mirrors it); the size switcher is a Carbon
// content switcher, which no rux-ds module claims, so the four lines it
// needs live here. No network, no drag, no editing yet. 2026-09-06.
document.addEventListener('click', e => {
  const bar = e.target.closest('.sch-bar');
  if (bar) {
    const on = bar.getAttribute('aria-pressed') === 'true';
    document.querySelectorAll('.sch-bar[aria-pressed="true"]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    bar.setAttribute('aria-pressed', on ? 'false' : 'true');
    return;
  }
  const tab = e.target.closest('.rux--content-switcher-btn');
  if (tab) {
    const list = tab.parentElement;
    list.querySelectorAll('.rux--content-switcher-btn').forEach(b => {
      const sel = b === tab;
      b.classList.toggle('rux--content-switcher--selected', sel);
      b.setAttribute('aria-selected', sel);
      b.tabIndex = sel ? 0 : -1;
    });
    const target = document.querySelector(list.dataset.schSizes);
    if (target) target.classList.toggle('sch--lg', tab.dataset.size === 'lg');
  }
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.sch-bar')) { e.preventDefault(); e.target.click(); }
});
