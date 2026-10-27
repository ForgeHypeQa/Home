/* Section glide (homepage).
   One swipe or wheel flick at the end of a section glides smoothly to the start of the next one.
   Long sections scroll normally until their end. Hero video, stacking problem cards and the phone
   section keep their own native scrolling. To switch off: set ON = false (or add ?noglide to the URL). */
(() => {
  const ON = true;
  if (!ON || /[?&]noglide\b/.test(location.search)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const FREE = new Set(['hero', 'trust', 'pains', 'fixes', 'ugc']);       // native scrolling only
  const secs = [...document.querySelectorAll('main > section[id]')].filter(s => getComputedStyle(s).display !== 'none');
  if (secs.length < 3) return;

  const phone = () => innerWidth < 900;
  const offset = () => (phone() ? 24 : 108);                       // space left for the navbar
  const anchorTop = s => {                                          // where a section should land
    const first = s.querySelector(':scope > .wrap, :scope > div') || s;
    return Math.round(first.getBoundingClientRect().top + scrollY - offset());
  };
  const current = () => {
    const y = offset() + 2;
    let cur = secs[0];
    for (const s of secs) if (s.getBoundingClientRect().top <= y) cur = s;
    return cur;
  };

  let busy = false;
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const glideTo = y => {
    y = Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight));
    const from = scrollY, dist = y - from;
    if (Math.abs(dist) < 4) return false;
    busy = true;
    const html = document.documentElement, prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    const dur = Math.min(900, Math.max(550, Math.abs(dist) * 0.6)), t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, from + dist * ease(k));
      if (k < 1) requestAnimationFrame(step);
      else { html.style.scrollBehavior = prev; setTimeout(() => { busy = false; }, 350); }
    };
    requestAnimationFrame(step);
    return true;
  };

  /* decide what a gesture in direction dir (1 = down, -1 = up) should do: a target y, or null for native */
  const plan = dir => {
    const cur = current(), i = secs.indexOf(cur);
    if (FREE.has(cur.id)) return null;
    const r = cur.getBoundingClientRect();
    if (dir > 0) {
      if (r.bottom - innerHeight > 60) return null;                  // more of this section to read
      const next = secs[i + 1];
      if (!next || FREE.has(next.id)) return null;
      return anchorTop(next);
    }
    const atTop = Math.abs(anchorTop(cur) - scrollY) < 8;
    if (!atTop) return null;                                         // not at the start yet: scroll normally
    const prev = secs[i - 1];
    if (!prev || FREE.has(prev.id)) return null;
    const pr = prev.getBoundingClientRect();
    const prevTop = anchorTop(prev), prevEnd = Math.round(pr.bottom + scrollY - innerHeight);
    return Math.max(prevTop, prevEnd);                               // long section: land on its end
  };

  const typing = () => !!document.querySelector('dialog[open]') || /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '') ||
    !!document.querySelector('.ms-panel:not([hidden])');

  /* wheel and trackpad */
  let wheelLock = 0;
  addEventListener('wheel', e => {
    if (e.ctrlKey || typing() || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    if (busy || performance.now() < wheelLock) { if (busy) e.preventDefault(); return; }
    if (Math.abs(e.deltaY) < 4) return;
    const y = plan(Math.sign(e.deltaY));
    if (y == null) return;
    e.preventDefault();
    if (glideTo(y)) wheelLock = performance.now() + 1100;
  }, { passive: false });

  /* touch: decide on the first move of each swipe */
  let sy = 0, sx = 0, mode = null, target = null;
  addEventListener('touchstart', e => {
    if (e.touches.length !== 1) { mode = 'native'; return; }
    sy = e.touches[0].clientY; sx = e.touches[0].clientX; mode = null; target = null;
  }, { passive: true });
  addEventListener('touchmove', e => {
    if (busy) { e.preventDefault(); return; }
    if (mode === 'native') return;
    if (mode === 'glide') { e.preventDefault(); return; }
    const dy = sy - e.touches[0].clientY, dx = sx - e.touches[0].clientX;
    if (Math.abs(dy) < 6 || Math.abs(dx) > Math.abs(dy) || typing()) return;
    const y = plan(Math.sign(dy));
    if (y == null) { mode = 'native'; return; }
    mode = 'glide'; target = y; e.preventDefault();
  }, { passive: false });
  addEventListener('touchend', e => {
    if (mode === 'glide' && target != null) {
      const dy = sy - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 24) glideTo(target);
    }
    mode = null; target = null;
  }, { passive: true });
})();
