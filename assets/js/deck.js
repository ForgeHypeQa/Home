/* Deck: stacked card carousel (fixes, services, success stories), styled like the reels.
   Centre card on top, neighbours tucked behind on both sides. Swipe, tap a side card, dots or arrows to move;
   loops; optional auto-advance (data-auto="ms") that pauses while touched, hovered or off screen.
   data-spread = on desktop the neighbours sit side by side (three across). */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.deck').forEach(deck => {
    const track = deck.querySelector('.deck-track');
    if (!track) return;
    const cards = [...track.children], n = cards.length;
    if (n < 2) return;
    deck.classList.add('stacked');
    const auto = +deck.dataset.auto || 0;
    const dotsWrap = deck.querySelector('.deck-dots');
    const dots = dotsWrap ? cards.map((c, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'deck-dot';
      b.setAttribute('aria-label', 'Show card ' + (i + 1) + ' of ' + n);
      b.addEventListener('click', () => { hold(); show(i); });
      dotsWrap.appendChild(b);
      return b;
    }) : [];
    let cur = 0, hover = false, inView = false, holdUntil = 0, lastMove = performance.now();

    const layout = () => {
      cards.forEach((c, i) => {
        let d = (i - cur + n) % n; if (d > n / 2) d -= n;
        c.dataset.pos = Math.abs(d) <= 2 ? d : (d < 0 ? -3 : 3);
        const on = d === 0;
        c.setAttribute('aria-hidden', String(!on));
        c.querySelectorAll('a, button').forEach(el => { el.tabIndex = on ? 0 : -1; });
      });
      dots.forEach((d, i) => d.classList.toggle('on', i === cur));
    };
    const show = i => { cur = (i + n) % n; layout(); lastMove = performance.now(); };
    const hold = () => { holdUntil = performance.now() + 6000; };

    /* height = tallest card, so the stack never clips */
    const measure = () => {
      const h = Math.max(...cards.map(c => Math.max(c.offsetHeight, c.firstElementChild ? c.firstElementChild.scrollHeight : 0)));
      track.style.setProperty('--h', Math.ceil(h) + 'px');
    };
    if ('ResizeObserver' in window) { const ro = new ResizeObserver(measure); cards.forEach(c => { ro.observe(c); if (c.firstElementChild) ro.observe(c.firstElementChild); }); }
    if (document.fonts) document.fonts.ready.then(measure);
    addEventListener('resize', measure); addEventListener('load', measure);

    /* swipe */
    let sx = 0, sy = 0, down = false, moved = false;
    track.addEventListener('pointerdown', e => { down = true; moved = false; sx = e.clientX; sy = e.clientY; hold(); });
    track.addEventListener('pointermove', e => {
      if (down && Math.abs(e.clientX - sx) > 10 && Math.abs(e.clientX - sx) > Math.abs(e.clientY - sy)) moved = true;
    });
    track.addEventListener('pointerup', e => {
      if (!down) return; down = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1));
    });
    track.addEventListener('pointercancel', () => { down = false; });

    /* a tap on a side card brings it forward instead of following its link; a swipe never clicks */
    cards.forEach((c, i) => c.addEventListener('click', e => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; return; }
      if (i !== cur) { e.preventDefault(); e.stopPropagation(); hold(); show(i); }
    }, true));

    deck.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
    deck.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hover = false; });
    deck.addEventListener('focusin', hold);
    deck.querySelectorAll('.deck-arrow').forEach(b => b.addEventListener('click', () => { hold(); show(cur + (+b.dataset.dir || 1)); }));
    deck.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { hold(); show(cur + 1); }
      if (e.key === 'ArrowLeft') { hold(); show(cur - 1); }
    });

    new IntersectionObserver(([en]) => { inView = en.isIntersecting; }, { threshold: .4 }).observe(track);
    if (auto) setInterval(() => {
      const now = performance.now();
      if (RM.matches || !inView || hover || document.hidden || now < holdUntil || now - lastMove < auto) return;
      show(cur + 1);
    }, 400);

    deck._goTo = i => { hold(); show(i); };
    deck._index = () => cur;
    layout(); measure();
  });
})();
