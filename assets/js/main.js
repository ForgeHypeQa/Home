/* ForgeHype · main.js
   1 hero scrub   2 nav + menu   3 reveals + living elements   4 theme mixer (dark ↔ light by scroll)
   5 problem grid glow   6 the stack   7 service image cycling   8 about (words, marquee, clock)
   9 qatar video   10 phone stage   11 hold to forge   12 stories carousel   13 why rotator
   14 form → Web3Forms + WhatsApp   15 embers   16 reduced motion, live in both directions */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smoothstep = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const FINE = matchMedia('(pointer: fine)');
  const COARSE = matchMedia('(pointer: coarse)');
  let pinned = false; // reduced-motion pin state, shared by the hero gate and the ambient drives
  const showPage = () => document.body.classList.add('ready');
  requestAnimationFrame(() => requestAnimationFrame(showPage));
  setTimeout(showPage, 400); // belt and braces: never leave the page hidden

  /* ================= 1. HERO SCRUB ================= */
  const hero = $('#hero'), stage = $('#stage'), video = $('#heroVideo');
  const posterLayer = $('.poster', stage), ring = $('.ring', stage), hudAlt = $('#hudAlt');
  const VIDEO_URL = 'assets/video/hero-scrub.mp4';
  const VIDEO_BYTES = 5625736; // real byte size of assets/video/hero-scrub.mp4, the fallback when Content-Length is missing
  const bands = $$('[data-band]', stage).map(el => ({
    el, a: +el.dataset.a, b: +el.dataset.b, ramp: el.dataset.ramp ? +el.dataset.ramp : null, op: -1, k: -1, kl: -1, live: false
  }));
  let target = 0, shown = 0, rafId = null, lastTick = 0, heroOnScreen = true;
  let seekBusy = false, pendingTime = null, scrubOn = false, heroInit = false, videoDone = false;
  let loadK = 0, loadStart = 0, lastAlt = '', lastAltAt = 0;

  const heroProgress = () => {
    const range = hero.offsetHeight - innerHeight;
    return range > 0 ? clamp(-hero.getBoundingClientRect().top / range, 0, 1) : 0;
  };
  function requestSeek(t) {
    if (!video.duration || !isFinite(t)) return;
    if (seekBusy) { pendingTime = t; return; }
    seekBusy = true; video.currentTime = t;
  }
  video.addEventListener('seeked', () => {
    seekBusy = false;
    if (pendingTime !== null) { const t = pendingTime; pendingTime = null; requestSeek(t); }
  });
  video.addEventListener('error', () => { seekBusy = false; pendingTime = null; failVideo(); });

  function updateCaptions(p, now) {
    for (let i = 0; i < bands.length; i++) {
      const b = bands[i];
      const op = 1; // the single band stays on; its children step in on --k
      const k = clamp((p - b.a) / (b.ramp || (b.b - b.a)), 0, 1);
      if (op !== b.op) { b.op = op; b.el.style.opacity = '1'; }
      if (Math.abs(k - b.k) > 0.004 || (k === 1 && b.k !== 1) || (k === 0 && b.k !== 0)) { b.k = k; b.el.style.setProperty('--k', k.toFixed(3)); }
      if (Math.abs(loadK - b.kl) > 0.008 || (loadK === 1 && b.kl !== 1)) { b.kl = loadK; b.el.style.setProperty('--kl', loadK.toFixed(3)); }
      if (!b.live) { b.live = true; b.el.classList.add('live'); }
    }
    const settled = p > 0.9;
    if (settled !== stage.classList.contains('settled')) stage.classList.toggle('settled', settled);
    if (hudAlt && now !== undefined && now - lastAltAt > 100) {
      const txt = 'DESCENT ' + String(Math.round(p * 100)).padStart(2, '0') + '%';
      if (txt !== lastAlt) { lastAlt = txt; lastAltAt = now; hudAlt.textContent = txt; }
    }
  }
  function tick(now) {
    const dt = Math.min(100, now - (lastTick || now)); lastTick = now;
    if (loadK < 1) { if (!loadStart) loadStart = now; loadK = Math.min(1, easeOut(clamp((now - loadStart) / 1400, 0, 1))); }
    const kf = 0.16;
    shown += (target - shown) * (1 - Math.pow(1 - kf, dt / 16.667));
    const converged = Math.abs(target - shown) < 0.0005 && loadK >= 1;
    if (converged) { shown = target; rafId = null; lastTick = 0; } else rafId = requestAnimationFrame(tick);
    if (video.duration) requestSeek(shown * video.duration);
    updateCaptions(shown, now);
  }
  function onScroll() {
    target = heroProgress();
    if (rafId === null && heroOnScreen) rafId = requestAnimationFrame(tick);
  }
  function failVideo() {
    if (videoDone) return; videoDone = true;
    stage.classList.add('video-failed');
    if (ring) ring.style.opacity = 0;
  }
  function makeHeroInit() {
    if (heroInit) return; heroInit = true;
    posterLayer.style.backgroundImage = "url('assets/img/hero-poster.jpg')";
    let started = false;
    const start = () => { if (started) return; started = true; loadHeroBlob().catch(failVideo); };
    const img = new Image(); img.onload = start; img.onerror = start; img.src = 'assets/img/hero-poster.jpg';
    setTimeout(start, 4000);
  }
  async function loadHeroBlob() {
    if (location.protocol === 'file:') throw new Error('file protocol');
    const ctrl = new AbortController();
    let watchdog = setTimeout(() => ctrl.abort(), 20000);
    const res = await fetch(VIDEO_URL, { priority: 'low', signal: ctrl.signal });
    if (!res.ok || !res.body) throw new Error('video fetch failed');
    const total = Number(res.headers.get('Content-Length')) || VIDEO_BYTES;
    const reader = res.body.getReader(); const chunks = []; let got = 0, lastRing = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      clearTimeout(watchdog); watchdog = setTimeout(() => ctrl.abort(), 20000);
      chunks.push(value); got += value.length;
      const frac = Math.min(1, got / total), now = performance.now();
      if (now - lastRing > 100 || frac === 1) { lastRing = now; ring.style.setProperty('--ld', Math.round(126 * (1 - frac))); }
    }
    clearTimeout(watchdog);
    ring.style.setProperty('--ld', 0);
    video.src = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
    video.load();
    video.addEventListener('canplay', () => {
      requestSeek(heroProgress() * video.duration);
      stage.classList.add('video-ready');
      videoDone = true;
    }, { once: true });
  }
  const GATES = [
    '(min-width: 0px)', // scroll-scrub hero retired: every screen uses the autoplay hero
    '(max-width: 720px)',
    '(orientation: portrait) and (max-width: 1024px)',
    '(orientation: portrait) and (pointer: coarse)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
    '(prefers-reduced-motion: reduce)'
  ];
  function enableScrub() {
    if (scrubOn) return; scrubOn = true;
    makeHeroInit();
    addEventListener('scroll', onScroll, { passive: true });
    bands.forEach(b => { b.op = -1; b.k = -1; b.kl = -1; });
    unpinFinalStates();
    updateCaptions(heroProgress(), performance.now());
    onScroll();
  }
  function disableScrub() {
    if (!scrubOn) return; scrubOn = false;
    removeEventListener('scroll', onScroll);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }
  function applyHeroMode() {
    if (GATES.some(q => matchMedia(q).matches)) disableScrub(); else enableScrub();
  }
  GATES.map(q => matchMedia(q)).forEach(m => m.addEventListener('change', applyHeroMode));
  new IntersectionObserver(([e]) => {
    heroOnScreen = e.isIntersecting;
    if (heroOnScreen && scrubOn) onScroll();
  }, { threshold: 0 }).observe(hero);
  applyHeroMode();

  /* ================= 2. NAV + MENU ================= */
  const nav = $('#nav'), menu = $('#menu'), toggle = $('.nav-toggle');
  /* navbar: shows while scrolling or after a tap, hides after 1 s of no movement;
     always shown at the top and the bottom of the page, while the menu is open, or while hovered/focused */
  let navTick = false, navTimer = 0, navHover = false;
  const navEdge = () => scrollY < 40 || scrollY + innerHeight >= document.documentElement.scrollHeight - 40;
  const navKeep = () => navEdge() || navHover || document.body.classList.contains('menu-open') || nav.contains(document.activeElement);
  const navWake = () => {
    nav.classList.remove('hide');
    clearTimeout(navTimer);
    navTimer = setTimeout(() => { if (!navKeep()) nav.classList.add('hide'); }, 1000);
  };
  nav.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { navHover = true; nav.classList.remove('hide'); } });
  nav.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { navHover = false; navWake(); } });
  addEventListener('pointerdown', navWake, { passive: true });
  addEventListener('keydown', navWake);
  addEventListener('scroll', () => {
    if (navTick) return; navTick = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', scrollY > 40);
      navWake();
      navTick = false;
    });
  }, { passive: true });
  navWake();
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });

  /* ================= 3. REVEALS + LIVING ELEMENTS ================= */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal').forEach(el => io.observe(el));

  const liveIO = new IntersectionObserver(entries => entries.forEach(e => {
    e.target.classList.toggle('in', e.isIntersecting);
    e.target.classList.toggle('live-off', !e.isIntersecting);
  }), { threshold: 0 });
  $$('[data-live]').forEach(el => liveIO.observe(el));
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));
  // marquees: tap toggles pause (hover and focus pause in CSS)
  $$('.marquee, .flipline').forEach(m => {
    m.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') m.classList.toggle('paused'); });
    m.addEventListener('keydown', e => { if (e.key === ' ') { e.preventDefault(); m.classList.toggle('paused'); } });
  });

  /* ================= 4. THEME MIXER: body colour follows the sections ================= */
  const root = document.documentElement;
  const DARK = { canvas: [0, 0, 0], t1: [246, 243, 239], t2: [184, 176, 168], t3: [141, 133, 126], lineC: [255, 255, 255], line: .09, lineS: .16, glass: .045, glass2: .07, panel: [13, 12, 11], panel2: [22, 20, 18] };
  const LIGHT = { canvas: [255, 246, 239], t1: [20, 17, 15], t2: [107, 100, 94], t3: [138, 130, 123], lineC: [20, 17, 15], line: .1, lineS: .2, glass: .7, glass2: .95, panel: [255, 255, 255], panel2: [255, 255, 255] };
  const themed = $$('[data-theme]');
  let bounds = [], lastMix = -1, themeTick = false;
  const lerp = (a, b, t) => a + (b - a) * t;
  const rgb = (a, b, t) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
  function measureTheme() {
    bounds = []; let prev = null;
    themed.forEach(el => {
      if (!el.offsetParent && getComputedStyle(el).display === 'none') return;
      const t = el.dataset.theme;
      if (prev !== null && t !== prev) bounds.push({ y: el.getBoundingClientRect().top + scrollY, to: t === 'light' ? 1 : 0, late: el.dataset.fade === 'late' });
      prev = t;
    });
    lastMix = -1; applyTheme();
  }
  function mixAt(y) {
    const vh = innerHeight; let m = 0;
    for (const b of bounds) {
      // rel: 0 = the boundary sits at the viewport bottom, 1 = at the top.
      // light sections keep their own dark text, so the canvas must be light whenever their content shows:
      // fade to light early (before the boundary scrolls in), fade back to dark late (once it nears the top)
      const rel = (y + vh - b.y) / vh;
      const t = b.to === 1 ? (b.late ? smoothstep(rel, 0.3, 0.75) : smoothstep(rel, -0.25, 0.08)) : smoothstep(rel, 0.68, 0.98);
      m = lerp(m, b.to, t);
    }
    return m;
  }
  function applyTheme() {
    const m = mixAt(scrollY);
    if (Math.abs(m - lastMix) < 0.002 && !(m === 0 && lastMix !== 0) && !(m === 1 && lastMix !== 1)) return;
    lastMix = m;
    const tx = smoothstep(m, 0.42, 0.58); // text flips faster than the background so both stay readable
    const s = root.style;
    const c = rgb(DARK.canvas, LIGHT.canvas, m);
    s.setProperty('--mix', m.toFixed(3));
    s.setProperty('--canvas', `rgb(${c.join(',')})`); s.setProperty('--canvas-rgb', c.join(','));
    s.setProperty('--panel', `rgb(${rgb(DARK.panel, LIGHT.panel, m).join(',')})`);
    s.setProperty('--panel-2', `rgb(${rgb(DARK.panel2, LIGHT.panel2, m).join(',')})`);
    s.setProperty('--text-primary', `rgb(${rgb(DARK.t1, LIGHT.t1, tx).join(',')})`);
    s.setProperty('--text-secondary', `rgb(${rgb(DARK.t2, LIGHT.t2, tx).join(',')})`);
    s.setProperty('--text-tertiary', `rgb(${rgb(DARK.t3, LIGHT.t3, tx).join(',')})`);
    const lc = rgb(DARK.lineC, LIGHT.lineC, tx);
    s.setProperty('--line', `rgba(${lc.join(',')},${lerp(DARK.line, LIGHT.line, tx).toFixed(3)})`);
    s.setProperty('--line-strong', `rgba(${lc.join(',')},${lerp(DARK.lineS, LIGHT.lineS, tx).toFixed(3)})`);
    s.setProperty('--glass', `rgba(255,255,255,${lerp(DARK.glass, LIGHT.glass, m).toFixed(3)})`);
    s.setProperty('--glass-2', `rgba(255,255,255,${lerp(DARK.glass2, LIGHT.glass2, m).toFixed(3)})`);
  }
  function onThemeScroll() { if (themeTick) return; themeTick = true; requestAnimationFrame(() => { themeTick = false; applyTheme(); }); }
  addEventListener('scroll', onThemeScroll, { passive: true });
  addEventListener('resize', measureTheme);
  addEventListener('load', measureTheme);
  if ('ResizeObserver' in window) { let roT = null; new ResizeObserver(() => { clearTimeout(roT); roT = setTimeout(measureTheme, 120); }).observe(document.body); }
  measureTheme();

  /* ================= 5. PROBLEM GRID ================= */
  const tiles = $$('#pgrid .tile');
  if (tiles.length) {
    // the fix cards are sticky, so an anchor jump lands on the stuck position; scroll to the card's natural spot instead
    tiles.forEach(t => t.addEventListener('click', e => {
      const card = $(t.getAttribute('href')); if (!card) return;
      e.preventDefault();
      const stack = card.parentElement, cards = [...stack.children], cs = getComputedStyle(stack);
      const gap = parseFloat(cs.rowGap) || 0, navH = parseFloat(cs.getPropertyValue('--nav-h')) || 88, step = parseFloat(cs.getPropertyValue('--step')) || 14;
      let top = stack.getBoundingClientRect().top + scrollY;
      for (const c of cards) { if (c === card) break; top += c.offsetHeight + gap; }
      scrollTo({ top: Math.round(top - navH - cards.indexOf(card) * step), behavior: RM.matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', t.getAttribute('href'));
    }));
  }

  /* ================= 6. THE STACK ================= */
  const stackCards = $$('.stack-card');
  let stackTick = false;
  function stackUpdate() {
    if (stackTick) return; stackTick = true;
    requestAnimationFrame(() => {
      stackTick = false;
      if (RM.matches) return;
      for (let i = 0; i < stackCards.length - 1; i++) {
        const card = stackCards[i], next = stackCards[i + 1];
        const r = card.getBoundingClientRect(), nr = next.getBoundingClientRect();
        const p = clamp(1 - (nr.top - r.top) / Math.max(1, r.height), 0, 1);
        if (Math.abs(p - (card._p || 0)) > 0.004 || (p === 0 && card._p) || (p === 1 && card._p !== 1)) {
          card._p = p; card.style.setProperty('--p', p.toFixed(3));
        }
      }
      /* the front card: the last one that has reached its sticky position. Only its film plays;
         cards still on their way up sit at half opacity until they arrive */
      let front = -1;
      stackCards.forEach((card, i) => { const top = parseFloat(getComputedStyle(card).top) || 0; if (card.getBoundingClientRect().top <= top + 4) front = i; });
      if (front < 0 && stackCards.length && stackCards[0].getBoundingClientRect().top < innerHeight * .5) front = 0;
      stackCards.forEach((card, i) => {
        const on = i === front;
        card.classList.toggle('is-front', on);
        card.classList.toggle('is-coming', i > front);
        const v = card.querySelector('video');
        if (v) { if (on) { if (v.preload === 'none') { v.preload = 'auto'; v.load(); } v.play().catch(() => {}); } else if (!v.paused) v.pause(); }
      });
    });
  }
  if (stackCards.length) {
    addEventListener('scroll', stackUpdate, { passive: true });
    addEventListener('resize', stackUpdate);
    stackUpdate();
  }

  /* ================= 7. SERVICE IMAGE CYCLING ================= */
  const svcRows = $$('.svc-card').map(row => ({
    row, imgs: $$('.thumb img', row), labels: (row.dataset.labels || '').split('|'), now: $('.now', row), i: 0, vis: false
  }));
  let cycleTimer = null, cyclePos = 0;
  function showRowImage(r, idx) {
    r.i = idx % r.imgs.length;
    r.imgs.forEach((im, k) => im.classList.toggle('on', k === r.i));
    if (r.now) r.now.textContent = r.labels[r.i] || '';
  }
  function cycleTick() {
    if (RM.matches || document.hidden) return;
    const wide = innerWidth >= 900;                                   // wide screens: only the centre card plays
    svcRows.filter(r => r.vis && (!wide || (r.row.closest('[data-pos]') || {}).dataset?.pos === '0')).forEach(r => showRowImage(r, r.i + 1));
  }
  if (svcRows.length) {
    const rowIO = new IntersectionObserver(es => es.forEach(e => { const r = svcRows.find(x => x.row === e.target); if (r) r.vis = e.isIntersecting; }), { threshold: 0.2 });
    svcRows.forEach(r => rowIO.observe(r.row));
    if (!RM.matches) cycleTimer = setInterval(cycleTick, 1000);
  }

  /* ================= 8. ABOUT: statement words, clock ================= */
  const statement = $('#statement');
  let words = [];
  if (statement) {
    const parts = statement.textContent.trim().split(/\s+/);
    statement.textContent = '';
    parts.forEach((w, i) => {
      const s = document.createElement('span'); s.className = 'w'; s.textContent = w; s.style.setProperty('--w', (i / parts.length).toFixed(3));
      statement.appendChild(s); if (i < parts.length - 1) statement.appendChild(document.createTextNode(' '));
      words.push(s);
    });
  }
  let stP = -1;
  function statementUpdate() {
    if (!statement || RM.matches) return;
    const r = statement.getBoundingClientRect();
    const p = clamp((innerHeight * 0.85 - r.top) / (innerHeight * 0.55), 0, 1);
    if (Math.abs(p - stP) > 0.004 || (p === 1 && stP !== 1) || (p === 0 && stP !== 0)) { stP = p; statement.style.setProperty('--p', p.toFixed(3)); }
  }
  const clock = $('#dohaClock');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Qatar', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const tickClock = () => { if (!document.hidden) clock.textContent = 'DOH ' + fmt.format(new Date()); };
    tickClock(); setInterval(tickClock, 1000);
  }
  // one line, flipping through everything we do
  const flipline = $('#flipline'), flipWord = $('#flipWord');
  if (flipline && flipWord) {
    const items = (flipline.dataset.items || '').split('|').map(t => t.replace(/&amp;/g, '&'));
    let fi = 0;
    flipWord.addEventListener('animationiteration', () => { fi = (fi + 1) % items.length; flipWord.textContent = items[fi]; });
    new IntersectionObserver(([e]) => flipline.classList.toggle('in', e.isIntersecting), { threshold: 0 }).observe(flipline);
  }

  /* ================= 8b. THE REEL IN THE PHONE ================= */
  const reel = $('#reel'), reelToggle = $('#reelToggle'), reelStage = $('#reelStage');
  if (reel) {
    const slides = $$('.reel-slide', reel), bars = $$('.reel-bars span', reel), cap = $('#reelCaption');
    let ri = 0, rTimer = 0, playing = !RM.matches, rVisible = false, hover = false;
    const paint = () => {
      slides.forEach((sl, j) => sl.classList.toggle('is-active', j === ri));
      bars.forEach((b, j) => { b.classList.toggle('is-done', j < ri); b.classList.toggle('is-active', j === ri && playing && !hover); });
      if (cap) cap.innerHTML = slides[ri].getAttribute('data-caption');
      reelStage.classList.toggle('reel-paused', !playing || hover);
    };
    const tick = () => { clearTimeout(rTimer); if (playing && rVisible && !hover && !document.hidden) rTimer = setTimeout(() => { ri = (ri + 1) % slides.length; paint(); tick(); }, 4200); };
    const setPlaying = v => { playing = v; reelToggle.textContent = playing ? 'Pause reel' : 'Play reel'; reelToggle.setAttribute('aria-pressed', String(!playing)); paint(); tick(); };
    reelToggle.addEventListener('click', () => setPlaying(!playing));
    reel.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hover = true; paint(); tick(); } });
    reel.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hover = false; paint(); tick(); } });
    reel.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') setPlaying(!playing); });
    new IntersectionObserver(([e]) => { rVisible = e.isIntersecting; tick(); }, { threshold: 0.2 }).observe(reel);
    document.addEventListener('visibilitychange', tick);
    if (RM.matches) reelToggle.textContent = 'Play reel';
    paint(); tick();
  }

  /* ================= 9. QATAR VIDEO: scroll scale + lazy play ================= */
  const qatarMedia = $('#qatarMedia');
  let qP = -1;
  function qatarUpdate() {
    if (!qatarMedia || RM.matches) return;
    const r = qatarMedia.getBoundingClientRect();
    const p = clamp((innerHeight * 0.95 - r.top) / (innerHeight * 0.5), 0, 1);
    if (Math.abs(p - qP) > 0.004 || (p === 1 && qP !== 1) || (p === 0 && qP !== 0)) { qP = p; qatarMedia.style.setProperty('--p', p.toFixed(3)); }
  }
  // videos below the fold: load and play only when near, pause when away
  $$('video.qvid, video.pvid').filter(v => !v.closest('.stack-film')).forEach(v => {   // fix-card films are driven by the stack (front card only)
    v.addEventListener('error', () => v.classList.add('no-src'), true);
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (v.preload === 'none') { v.preload = 'auto'; v.load(); } v.play().catch(() => {}); }
      else v.pause();
    }, { rootMargin: '200px 0px' }).observe(v);
  });

  /* Qatar video titles: start building once the flight starts, then stay */
  const qvt = $('#qvt'), qv = $('#qatarMedia video');
  if (qvt && qv && !RM.matches) qv.addEventListener('playing', () => qvt.classList.add('run'), { once: true });

  /* ================= 10. PHONE STAGE (reveal) ================= */
  const phoneStage = $('#phoneStage');
  if (phoneStage) new IntersectionObserver(([e]) => { if (e.isIntersecting) phoneStage.classList.add('in'); }, { threshold: 0.35 }).observe(phoneStage);

  /* ambient scroll drives (statement, qatar) */
  let ambientTick = false;
  function ambient() {
    if (ambientTick || pinned) return; ambientTick = true;
    requestAnimationFrame(() => { ambientTick = false; statementUpdate(); qatarUpdate(); });
  }
  addEventListener('scroll', ambient, { passive: true });
  addEventListener('resize', ambient);
  ambient();

  /* ================= 11. THE ORBIT: TAP TO FORGE ================= */
  /* Each tap lights the next stop (01-05) and fills the ring to it; the fifth tap forges and shows "Seen to shine". */
  const orbit = $('#orbit'), orbitCore = $('#orbitCore'), orbitSection = $('#orbitSection');
  const coreHint = $('#coreHint'), coreStep = $('#coreStep');
  const onodes = orbit ? $$('.node', orbit) : [], olabels = orbit ? $$('.lbl', orbit) : [];
  const STAGES = olabels.map(l => l.textContent.trim());
  let heat = 0, lit = 0, forged = false, hRaf = null;
  function setLit(n) {
    lit = n;
    onodes.forEach((el, i) => { el.classList.toggle('lit', i < n); });
    olabels.forEach((el, i) => el.classList.toggle('lit', i < n));
  }
  function heatTo(target, done) {
    if (hRaf) cancelAnimationFrame(hRaf);
    const from = heat, t0 = performance.now(), dur = 520;
    const tick = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      heat = from + (target - from) * e;
      orbit.style.setProperty('--heat', heat.toFixed(3));
      if (k < 1) hRaf = requestAnimationFrame(tick); else { hRaf = null; if (done) done(); }
    };
    hRaf = requestAnimationFrame(tick);
  }
  function completeForge() {
    forged = true; heat = 1;
    orbit.style.setProperty('--heat', '1'); setLit(5);
    orbit.classList.add('forged'); orbit.classList.remove('tapped'); orbitSection.classList.add('forged');
    orbitCore.setAttribute('aria-pressed', 'true');
    orbitCore.setAttribute('aria-label', 'Forged. Crafted to last. Seen to shine.');
    if (navigator.vibrate) { try { navigator.vibrate([20, 40, 60]); } catch (e) {} }
  }
  const STAGE_TEXT = [
    'We learn your business, your customers and your goals.',
    'We build your website, brand and content to work as one.',
    'We take you live where customers look: Google, Maps, social and AI search.',
    'We train your team and stay beside them, month after month.',
    'We track what actually brings you business, then improve it. And we keep going.'
  ];
  function showStage(n) {
    const box = document.getElementById('stageExplain'); if (!box) return;
    box.querySelector('.se-step').textContent = 'Step ' + n + ' of 5';
    box.querySelector('.se-title').textContent = STAGES[n - 1] || '';
    box.querySelector('.se-text').textContent = STAGE_TEXT[n - 1] || '';
    box.classList.add('on'); box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
  }
  function tapStep() {
    if (forged || !orbit) return;
    const n = Math.min(5, lit + 1);
    setLit(n);
    orbit.classList.add('tapped');
    if (coreStep) { coreStep.textContent = STAGES[n - 1] || ''; coreStep.classList.remove('pop'); void coreStep.offsetWidth; coreStep.classList.add('pop'); }
    orbitCore.setAttribute('aria-label', 'Stage ' + n + ' of 5: ' + (STAGES[n - 1] || '') + (n < 5 ? '. Tap for the next stage.' : ''));
    if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
    showStage(n);
    heatTo((n - 1) / 5, n === 5 ? () => setTimeout(() => heatTo(1, completeForge), 450) : null);
  }
  if (orbit && orbitCore) {
    if (coreHint) coreHint.textContent = 'Tap';
    orbitCore.setAttribute('aria-label', 'Tap to move through the five stages');
    setLit(0);
    if (RM.matches) completeForge();
    orbitCore.addEventListener('click', tapStep);
    orbitCore.addEventListener('contextmenu', e => e.preventDefault());
  }

  /* ================= 12. STORIES CAROUSEL ================= */
  const car = $('#carousel'), carTrack = $('#carTrack');
  if (car && carTrack && !RM.matches) {
    const items = $$('li', carTrack), n = items.length;
    items.forEach(li => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); carTrack.appendChild(c); });
    let idx = 0, step = 0, x = 0, timer = 0, hover = false, pressed = false, tapPaused = false, vis = false;
    let sx = 0, sy = 0, lx = 0, moved = 0, dragging = false;
    const measure = () => { step = items[1].offsetLeft - items[0].offsetLeft; };
    const setX = (v, ease) => { x = v; carTrack.classList.toggle('ease', ease); carTrack.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)'; };
    const goTo = (i, ease = true) => { idx = i; setX(-idx * step, ease); };
    // the clones let the last card slide into the first without a jump: once the eased move lands on a clone, reset silently
    carTrack.addEventListener('transitionend', e => {
      if (e.target !== carTrack || e.propertyName !== 'transform') return;
      if (idx >= n) goTo(idx - n, false);
    });
    const next = () => goTo(idx + 1);
    const prev = () => { if (idx <= 0) { goTo(n, false); void carTrack.offsetWidth; } goTo(idx - 1); };
    const arm = () => { clearInterval(timer); timer = setInterval(() => { if (vis && !hover && !pressed && !tapPaused && !document.hidden) next(); }, 3000); };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) measure(); }, { threshold: 0 }).observe(car);
    addEventListener('resize', () => { measure(); goTo(idx, false); });
    $$('img', carTrack).forEach(i => i.addEventListener('load', measure, { once: true }));
    measure(); setTimeout(measure, 600); arm();
    car.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
    car.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hover = false; });
    car.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      pressed = true; dragging = false; moved = 0; sx = lx = e.clientX; sy = e.clientY;
      car.setPointerCapture(e.pointerId);
    });
    car.addEventListener('pointermove', e => {
      if (!pressed) return;
      const dx = e.clientX - lx; lx = e.clientX;
      moved = Math.max(moved, Math.abs(e.clientX - sx));
      if (!dragging && Math.abs(e.clientX - sx) > 6 && Math.abs(e.clientX - sx) > Math.abs(e.clientY - sy)) dragging = true;
      if (dragging) { setX(x + dx, false); car.classList.add('dragging'); }
    });
    const release = e => {
      if (!pressed) return; pressed = false; car.classList.remove('dragging');
      if (dragging) {
        const d = e.clientX - sx;
        if (d < -step * 0.18) next(); else if (d > step * 0.18) prev(); else goTo(idx);
        arm();
      } else if (e.pointerType !== 'mouse' && moved < 6) { tapPaused = !tapPaused; car.classList.toggle('paused', tapPaused); }
      dragging = false;
    };
    car.addEventListener('pointerup', release);
    car.addEventListener('pointercancel', release);
    car.addEventListener('click', e => { if (moved > 6) e.preventDefault(); });
    $('#carPrev').addEventListener('click', () => { prev(); arm(); });
    $('#carNext').addEventListener('click', () => { next(); arm(); });
    car.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); arm(); } if (e.key === 'ArrowRight') { e.preventDefault(); next(); arm(); } if (e.key === ' ') { e.preventDefault(); tapPaused = !tapPaused; car.classList.toggle('paused', tapPaused); } });
    car.addEventListener('focusin', () => { hover = true; });
    car.addEventListener('focusout', () => { hover = false; });
  }

  /* ================= 13. WHY ROTATOR ================= */
  const cmp = $('#cmp');
  if (cmp && !RM.matches) {
    const pairs = $$('.pair', cmp);
    let ci = 0, timer = null, paused = false, hover = false, vis = false, outT = null;
    const show = n => {
      const old = ci; ci = (n + pairs.length) % pairs.length;
      if (old === ci) return;
      pairs[old].classList.remove('is-on'); pairs[old].classList.add('is-out');
      clearTimeout(outT); outT = setTimeout(() => pairs[old].classList.remove('is-out'), 700);
      pairs[ci].classList.add('is-on');
    };
    const arm = () => { clearInterval(timer); timer = setInterval(() => { if (vis && !paused && !hover && !document.hidden) show(ci + 1); }, 3000); };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: 0.2 }).observe(cmp);
    arm();
    cmp.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
    cmp.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hover = false; });
    let sx = 0, sy = 0, swiped = false;
    cmp.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; swiped = false; });
    cmp.addEventListener('pointerup', e => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swiped = true; show(dx < 0 ? ci + 1 : ci - 1); arm(); }
      else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) { paused = !paused; cmp.classList.toggle('paused', paused); }
    });
    cmp.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(ci - 1); arm(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(ci + 1); arm(); }
      if (e.key === ' ') { e.preventDefault(); paused = !paused; cmp.classList.toggle('paused', paused); }
    });
    cmp.addEventListener('focusin', () => { hover = true; });
    cmp.addEventListener('focusout', () => { hover = false; });
  }

  /* ================= 14. FORM → GOOGLE SHEET + WHATSAPP ================= */
  /* LEADS_URL: the Apps Script web-app URL (ends in /exec) from assets/leads-sheet.gs. Empty = WhatsApp hand-off only. */
  const LEADS_URL = 'https://script.google.com/macros/s/AKfycbxj8_qcc2A8HBLOF_p7GYVW9iRBQZ4ldqa_-jm75wajHEmQCIbKksbXXIum7D-wcdah/exec';
  const sendLead = fields => {
    if (!LEADS_URL || fields.botcheck) return;
    const body = new URLSearchParams({ ...fields, page: location.pathname + location.hash });
    fetch(LEADS_URL, { method: 'POST', mode: 'no-cors', keepalive: true, body }).catch(() => {});
  };
  window.fhSendLead = sendLead;
  /* interests: dropdown with checkboxes */
  const msBtn = $('#intBtn'), msPanel = $('#intPanel'), msSum = $('#intSum');
  const boxes = $$('#bookForm input[name="interest"]');
  const sumUpdate = () => {
    const on = boxes.filter(b => b.checked).map(b => b.value);
    msSum.textContent = !on.length ? 'Select one or more' : on.length <= 2 ? on.join(', ') : on.length + ' selected';
    msSum.classList.toggle('has', on.length > 0);
  };
  const msOpen = open => { msPanel.hidden = !open; msBtn.setAttribute('aria-expanded', String(open)); };
  if (msBtn) {
    msBtn.addEventListener('click', () => msOpen(msPanel.hidden));
    $('#intDone').addEventListener('click', () => { msOpen(false); msBtn.focus(); });
    boxes.forEach(b => b.addEventListener('change', sumUpdate));
    document.addEventListener('click', e => { if (!msPanel.hidden && !e.target.closest('#intMs')) msOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !msPanel.hidden) { msOpen(false); msBtn.focus(); } });
  }
  $$('[data-interest]').forEach(a => a.addEventListener('click', () => {
    const box = boxes.find(b => b.value === a.dataset.interest);
    if (box) { box.checked = true; sumUpdate(); }
  }));
  const form = $('#bookForm');
  if (form) {
    const fType = $('#f-type');
    const mark = (el, bad) => el.closest('.field').classList.toggle('invalid', bad);
    fType.addEventListener('input', () => mark(fType, false));
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!fType.value) { mark(fType, true); (document.getElementById('typeBtn') || fType).focus(); return; }
      msOpen(false);
      const d = new FormData(form);
      const interests = d.getAll('interest');
      const consent = $('#f-consent');
      if (consent && !consent.checked) { consent.closest('.field').classList.add('invalid'); consent.focus(); return; }
      if (consent) consent.closest('.field').classList.remove('invalid');
      const site = String(d.get('website') || '').trim(), note = String(d.get('message') || '').trim();
      const lines = ['Hi ForgeHype, I would like a free consultation.',
        'Business type: ' + d.get('type'),
        interests.length ? 'Interested in: ' + interests.join(', ') : null,
        site ? 'Website: ' + site : null,
        note ? 'Notes: ' + note : null].filter(Boolean);
      const text = lines.join('\n');
      $('#mailFallback').href = 'mailto:info@forgehype.qa?subject=' + encodeURIComponent('Free consultation request') + '&body=' + encodeURIComponent(text);
      sendLead({ source: 'Booking', type: d.get('type'), interests: interests.join(', '), website: site, message: note, consent: 'yes', botcheck: d.get('botcheck') || '' });
      window.open('https://wa.me/97470069544?text=' + encodeURIComponent(text), '_blank', 'noopener');
      form.classList.add('sent');
    });
  }
  const waFloat = $('#waFloat'), bookSec = $('#book');
  if (waFloat && bookSec) new IntersectionObserver(([e]) => waFloat.classList.toggle('hidden', e.isIntersecting), { threshold: 0.1 }).observe(bookSec);

  /* ================= 15. EMBERS (whisper level) ================= */
  const canvas = $('#embers');
  let embers = null, eRaf = null, eVisible = !document.hidden;
  function startEmbers() {
    if (RM.matches || !canvas || embers) return;
    const ctx = canvas.getContext('2d'); let w, h, dpr;
    const N = 42, pts = [];
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); w = canvas.width = innerWidth * dpr; h = canvas.height = innerHeight * dpr; };
    const spawn = (p, fresh) => { p.x = Math.random() * w; p.y = fresh ? Math.random() * h : h + 10; p.r = (0.6 + Math.random() * 1.6) * dpr; p.v = (0.08 + Math.random() * 0.22) * dpr; p.a = 0.12 + Math.random() * 0.3; p.s = Math.random() * Math.PI * 2; p.d = 0.2 + Math.random() * 0.5; };
    size(); for (let i = 0; i < N; i++) { const p = {}; spawn(p, true); pts.push(p); }
    addEventListener('resize', size);
    let last = 0;
    const frame = now => {
      eRaf = null;
      if (!eVisible || document.hidden) return;
      const dt = Math.min(50, now - (last || now)); last = now;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.y -= p.v * dt / 16.667; p.s += 0.004 * dt / 16.667; p.x += Math.sin(p.s) * p.d * dpr * 0.3;
        if (p.y < -10) spawn(p, false);
        const a = p.a * (0.6 + 0.4 * Math.sin(p.s * 2));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,140,60,' + a.toFixed(3) + ')'; ctx.fill();
      }
      eRaf = requestAnimationFrame(frame);
    };
    embers = { resume() { if (eRaf === null) { last = 0; eRaf = requestAnimationFrame(frame); } }, stop() { if (eRaf !== null) cancelAnimationFrame(eRaf); eRaf = null; ctx.clearRect(0, 0, w, h); } };
    embers.resume();
  }
  startEmbers();
  document.addEventListener('visibilitychange', () => { eVisible = !document.hidden; if (embers) (eVisible ? embers.resume() : embers.stop()); });

  /* ================= 16. REDUCED MOTION, LIVE IN BOTH DIRECTIONS ================= */
  function pinToFinalStates() {
    pinned = true;
    $$('.reveal').forEach(el => { el.classList.add('in'); io.unobserve(el); });
    if (phoneStage) phoneStage.classList.add('in');
    if (orbit && !forged) completeForge();
    if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
    stackCards.forEach(c => { c._p = 0; c.style.setProperty('--p', '0'); });
    if (statement) statement.style.setProperty('--p', '1');
    if (qatarMedia) qatarMedia.style.setProperty('--p', '1');
    if (carTrack) { carTrack.style.transform = ''; carTrack.classList.remove('ease'); }
    if (embers) embers.stop();
    measureTheme();
  }
  function unpinFinalStates() {
    if (!pinned) return; pinned = false;
    ambient(); stackUpdate();
    if (svcRows.length && !cycleTimer) cycleTimer = setInterval(cycleTick, 1000);
    if (embers) embers.resume(); else startEmbers();
    measureTheme();
  }
  RM.addEventListener('change', e => { if (e.matches) pinToFinalStates(); else applyHeroMode(); });
  if (RM.matches) pinToFinalStates();
})();

/* problem cards: one-line answers that expand on tap */
(() => {
  document.querySelectorAll('.stack-text .answer').forEach(p => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'answer-more';
    b.setAttribute('aria-controls', p.id); b.setAttribute('aria-expanded', 'false');
    b.textContent = 'Read more';
    b.addEventListener('click', () => {
      const open = p.classList.toggle('open');
      b.setAttribute('aria-expanded', String(open));
      b.textContent = open ? 'Show less' : 'Read more';
    });
    p.after(b);
  });
})();

/* reels: swipeable stack, muted by default, sound only on the front video */
(() => {
  const stage = document.getElementById('reelStage');
  if (!stage) return;
  const reels = [...stage.querySelectorAll('.reel')], n = reels.length;
  const dots = [...document.querySelectorAll('#reels .reel-dot')];
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  let cur = 0, soundOn = false, inView = false;

  const layout = () => {
    reels.forEach((el, i) => {
      let d = (i - cur + n) % n; if (d > n / 2) d -= n;
      el.dataset.pos = d;
      const on = d === 0, v = el.querySelector('video'), b = el.querySelector('.sound-toggle');
      el.classList.toggle('is-active', on);
      b.tabIndex = on ? 0 : -1;
      b.setAttribute('aria-pressed', String(on && soundOn));
      b.setAttribute('aria-label', soundOn ? 'Turn sound off' : 'Turn sound on');
      if (on) {
        v.muted = !soundOn;
        if (inView && (!RM.matches || soundOn)) v.play().catch(() => {});
      } else { v.muted = true; v.pause(); }
    });
    dots.forEach((d, i) => d.classList.toggle('on', i === cur));
  };
  const go = k => { cur = (cur + k + n) % n; layout(); };

  reels.forEach((el, i) => {
    el.querySelector('.sound-toggle').addEventListener('click', e => {
      e.stopPropagation();
      if (i !== cur) return;
      soundOn = !soundOn;
      const v = el.querySelector('video');
      v.muted = !soundOn; v.volume = 1;
      if (soundOn) v.play().catch(() => {});
      layout();
    });
    el.addEventListener('click', () => {
      if (moved) return;
      if (i !== cur) { cur = i; layout(); }
    });
  });
  dots.forEach((d, i) => d.addEventListener('click', () => { cur = i; layout(); }));
  document.querySelectorAll('#reels .reel-arrow').forEach(b => b.addEventListener('click', () => go(+b.dataset.dir)));
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });

  /* swipe: finger left shows the next reel, right the previous */
  let sx = 0, sy = 0, down = false, moved = false;
  stage.addEventListener('pointerdown', e => { down = true; moved = false; sx = e.clientX; sy = e.clientY; });
  stage.addEventListener('pointermove', e => {
    if (down && Math.abs(e.clientX - sx) > 8 && Math.abs(e.clientX - sx) > Math.abs(e.clientY - sy)) moved = true;
  });
  const end = e => {
    if (!down) return; down = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    setTimeout(() => { moved = false; }, 0);
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', () => { down = false; });

  new IntersectionObserver(([en]) => {
    inView = en.isIntersecting;
    if (inView) layout(); else reels.forEach(el => el.querySelector('video').pause());
  }, { threshold: .35 }).observe(stage);
  document.addEventListener('visibilitychange', () => {
    const v = reels[cur].querySelector('video');
    if (document.hidden) v.pause(); else if (inView) layout();
  });
  layout();
})();

/* team: centred stack, glides one card every 3 s, swipe to move, pauses while touched or hovered */
(() => {
  const track = document.getElementById('teamTrack');
  if (!track) return;
  const cards = [...track.querySelectorAll('.tcard')], n = cards.length;
  const dots = [...document.querySelectorAll('#team .team-dot')];
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  let cur = 0, inView = false, hold = false, resumeAt = 0;
  const layout = () => {
    cards.forEach((el, i) => {
      let d = (i - cur + n) % n; if (d > n / 2) d -= n;
      el.dataset.pos = Math.max(-2, Math.min(2, d));
      el.setAttribute('aria-hidden', String(d !== 0));
    });
    dots.forEach((d, i) => d.classList.toggle('on', i === cur));
  };
  const go = k => { cur = (cur + k + n) % n; layout(); };
  const pause = () => { resumeAt = Date.now() + 6000; };
  setInterval(() => {
    if (RM.matches || !inView || hold || document.hidden || Date.now() < resumeAt) return;
    go(1);
  }, 3000);
  track.addEventListener('mouseenter', () => { hold = true; });
  track.addEventListener('mouseleave', () => { hold = false; });
  track.addEventListener('focusin', () => { hold = true; });
  track.addEventListener('focusout', () => { hold = false; });
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });
  dots.forEach((d, i) => d.addEventListener('click', () => { cur = i; layout(); pause(); }));
  cards.forEach(el => el.addEventListener('click', () => { const d = +el.dataset.pos; if (d === 1 || d === -1) { go(d); pause(); } }));
  let sx = 0, sy = 0, down = false;
  track.addEventListener('pointerdown', e => { down = true; sx = e.clientX; sy = e.clientY; pause(); });
  track.addEventListener('pointerup', e => {
    if (!down) return; down = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    pause();
  });
  track.addEventListener('pointercancel', () => { down = false; });
  new IntersectionObserver(([en]) => { inView = en.isIntersecting; }, { threshold: .4 }).observe(track);
  layout();
})();

/* booking journey: stop 1 lights, line runs to 2, then 3 */
(() => {
  const j = document.getElementById('journey');
  if (!j) return;
  const items = [...j.querySelectorAll('li')];
  const show = () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { items.forEach(li => li.classList.add('on')); j.style.setProperty('--p', 1); return; }
    const t = [0, 1300, 2600];
    items.forEach((li, i) => setTimeout(() => {
      if (i) j.style.setProperty('--p', i / (items.length - 1));
      setTimeout(() => li.classList.add('on'), i ? 700 : 0);
    }, t[i]));

    setTimeout(() => j.classList.add('loop'), 3800);
  };
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); show(); } }, { threshold: .6 });
  io.observe(j);
})();

/* footer: Services and Explore fold into tap-to-open rows on phones */
(() => {
  const mq = matchMedia('(max-width: 560px)');
  const folds = [...document.querySelectorAll('.footer-grid > div')].filter(d => {
    const h = d.querySelector('h2'); return h && d.querySelector('ul, .fbody') && !/contact/i.test(h.textContent);
  });
  folds.forEach(d => {
    const h = d.querySelector('h2');
    d.classList.add('fold'); if (d.dataset.open === '1') d.classList.add('open');
    const toggle = () => { if (!mq.matches) return; const o = d.classList.toggle('open'); btnOf(h).setAttribute('aria-expanded', String(o)); };
    h.addEventListener('click', toggle);
    h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
  /* the toggle role sits on a span inside the heading, so the h2 keeps its heading role */
  const btnOf = h => h.querySelector('.fold-t') || (() => { const t = document.createElement('span'); t.className = 'fold-t'; t.append(...h.childNodes); h.append(t); return t; })();
  const apply = () => folds.forEach(d => {
    const h = d.querySelector('h2'), t = btnOf(h);
    h.removeAttribute('role'); h.removeAttribute('tabindex'); h.removeAttribute('aria-expanded');
    if (mq.matches) { t.setAttribute('role', 'button'); t.tabIndex = 0; t.setAttribute('aria-expanded', String(d.classList.contains('open'))); }
    else { t.removeAttribute('role'); t.removeAttribute('tabindex'); t.removeAttribute('aria-expanded'); }
  });
  mq.addEventListener('change', apply); apply();
})();

/* footer FAQ: three questions, then "Show 3 more" */
document.querySelectorAll('.fq-btn').forEach(b => b.addEventListener('click', () => {
  const box = b.closest('.fbody'), open = box.classList.toggle('more');
  b.textContent = open ? b.dataset.labelLess : b.dataset.labelMore;
  b.setAttribute('aria-expanded', String(open));
}));

/* scroll arrows: up = to the very top, down = one screen further */
(() => {
  const wrap = document.createElement('div');
  wrap.className = 'scroll-arrows';
  wrap.innerHTML = '<button type="button" class="sa sa-up" aria-label="Back to top"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14l6-6 6 6"/></svg></button>' +
                   '<button type="button" class="sa sa-down" aria-label="Scroll down one screen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10l6 6 6-6"/></svg></button>';
  document.body.appendChild(wrap);
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  wrap.querySelector('.sa-up').addEventListener('click', () => scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' }));
  wrap.querySelector('.sa-down').addEventListener('click', () => scrollBy({ top: Math.round(innerHeight * 0.85), behavior: smooth ? 'smooth' : 'auto' }));
  const upd = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    wrap.classList.toggle('at-top', scrollY < 200);
    wrap.classList.toggle('at-end', scrollY > max - 40);
  };
  addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
})();

/* discount code request: email -> Web3Forms (when its key is set) and a WhatsApp hand-off */
(() => {
  const f = document.getElementById('codeForm');
  if (!f) return;
  const inp = f.querySelector('#codeEmail'), msg = f.querySelector('.code-msg');
  f.addEventListener('submit', e => {
    e.preventDefault();
    const email = inp.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { f.classList.add('bad'); msg.textContent = 'Please enter a valid email.'; inp.focus(); return; }
    f.classList.remove('bad');
    const text = 'Hi ForgeHype, I would like my 10% discount code.\nEmail: ' + email + '\nMy challenge: ';
    window.open('https://wa.me/97470069544?text=' + encodeURIComponent(text), '_blank', 'noopener');
    msg.textContent = 'Thanks! Tell us your challenge in WhatsApp and we will send your code.';
    f.reset();
  });
})();

/* problem tiles: one numbered badge travels 1 → 6, every 2 s */
(() => {
  const tiles = [...document.querySelectorAll('#pgrid .tile')];
  if (!tiles.length) return;
  let i = -1;
  const show = () => tiles.forEach((t, k) => t.classList.toggle('num-on', k === i));
  const film = document.querySelector('#painsFilm video');
  if (film) {                                   // chapter row follows the film: 4 s intro, then 6 s per problem
    film.addEventListener('timeupdate', () => { const n = Math.floor((film.currentTime - 4) / 6); const k = n < 0 || n > 5 ? -1 : n; if (k !== i) { i = k; show(); } });
    return;
  }
  i = 0; show();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setInterval(() => { if (document.hidden) return; i = (i + 1) % tiles.length; show(); }, 2000);
})();

/* business type: custom single-choice dropdown in the same style as the interests list (no checkboxes) */
['f-type', 'a-type'].forEach((selId, n) => {
  const sel = document.getElementById(selId);
  if (!sel) return;
  const sfx = n ? '2' : '';
  const opts = [...sel.options].filter(o => o.value || !o.disabled).filter(o => o.value !== '');
  const wrap = document.createElement('div'); wrap.className = 'ms ms-single'; wrap.id = 'typeMs' + sfx;
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'input ms-btn'; btn.id = 'typeBtn' + sfx;
  btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-labelledby', 'typeLbl' + sfx + ' typeSum' + sfx);
  btn.innerHTML = '<span class="ms-sum" id="typeSum' + sfx + '">Select your sector</span>';
  const panel = document.createElement('div'); panel.className = 'ms-panel'; panel.setAttribute('role', 'listbox'); panel.hidden = true;
  opts.forEach(o => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'ms-opt ms-pick'; b.setAttribute('role', 'option'); b.textContent = o.textContent;
    b.addEventListener('click', () => {
      sel.value = o.value || o.textContent; sel.dispatchEvent(new Event('input', { bubbles: true }));
      panel.querySelectorAll('.ms-pick').forEach(x => x.setAttribute('aria-selected', String(x === b)));
      const sum = btn.querySelector('.ms-sum'); sum.textContent = o.textContent; sum.classList.add('has');
      open(false); btn.focus();
    });
    panel.appendChild(b);
  });
  const lbl = document.querySelector('label[for="' + selId + '"]'); if (lbl) lbl.id = 'typeLbl' + sfx;
  const open = v => { panel.hidden = !v; btn.setAttribute('aria-expanded', String(v)); };
  btn.addEventListener('click', () => open(panel.hidden));
  document.addEventListener('click', e => { if (!panel.hidden && !wrap.contains(e.target)) open(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { open(false); btn.focus(); } });
  sel.classList.add('sr-only'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
  wrap.append(btn, panel); sel.after(wrap);
});

/* navbar: full bar only at the very top and the very bottom; in between just a floating menu button */
(() => {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let t = false;
  const upd = () => {
    t = false;
    const edge = scrollY < 40 || scrollY + innerHeight >= document.documentElement.scrollHeight - 40;
    nav.classList.toggle('mini', innerWidth < 900 && !edge && !document.body.classList.contains('menu-open'));
  };
  addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(upd); } }, { passive: true });
  addEventListener('resize', upd);
  new MutationObserver(upd).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  upd();
})();

/* fix cards: one swipe (or wheel flick) pulls exactly one card up and locks it at the top.
   Native scrolling before the first card and after the last; reduced motion keeps native scrolling. */
(() => {
  const stack = document.getElementById('stack'); if (!stack) return;
  const cards = [...stack.children]; if (cards.length < 2) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = () => {                                   // document y at which card i locks at the top
    const cs = getComputedStyle(stack), gap = parseFloat(cs.rowGap) || 0;
    const navH = parseFloat(cs.getPropertyValue('--nav-h')) || 88, step = parseFloat(cs.getPropertyValue('--step')) || 14;
    let top = stack.getBoundingClientRect().top + scrollY; const out = [];
    cards.forEach((c, i) => { out.push(Math.round(top - (navH + i * step))); top += c.offsetHeight + gap; });
    return out;
  };
  let busy = false, lockUntil = 0;
  const ease = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const glideTo = y => {
    const from = scrollY, dist = y - from; if (Math.abs(dist) < 2) return;
    busy = true; const html = document.documentElement, prev = html.style.scrollBehavior; html.style.scrollBehavior = 'auto';
    const dur = Math.min(800, Math.max(450, Math.abs(dist) * .7)), t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / dur); scrollTo(0, from + dist * ease(k)); if (k < 1) requestAnimationFrame(step); else { html.style.scrollBehavior = prev; busy = false; lockUntil = performance.now() + 450; } };
    requestAnimationFrame(step);
  };
  /* where a gesture in direction dir (1 = up/next, -1 = down/previous) should land, or null for native scrolling */
  const plan = dir => {
    if (document.querySelector('dialog[open]')) return null;      // forms pop-up open: leave scrolling alone
    const ts = targets(), y = scrollY, first = ts[0], last = ts[ts.length - 1];
    if (y < first - innerHeight * .7 || y > last + 60) return null;       // not in the stack yet / already past it
    let cur = -1; ts.forEach((t, i) => { if (y >= t - 6) cur = i; });
    const next = cur + dir;
    if (dir > 0 && cur >= ts.length - 1) return null;                    // last card: scroll on normally
    if (dir < 0 && cur <= 0) return cur === 0 && y > first + 6 ? first : null;   // settle back on the first card, else native
    return ts[Math.max(0, Math.min(ts.length - 1, next))];
  };
  let sy = 0, mode = null, target = null;
  addEventListener('touchstart', e => { if (e.touches.length !== 1) { mode = 'native'; return; } sy = e.touches[0].clientY; mode = null; target = null; }, { passive: true });
  addEventListener('touchmove', e => {
    if (busy || mode === 'glide') { e.preventDefault(); return; }
    if (mode === 'native') return;
    const dy = sy - e.touches[0].clientY; if (Math.abs(dy) < 8) return;
    const y = plan(Math.sign(dy)); if (y == null) { mode = 'native'; return; }
    mode = 'glide'; target = y; e.preventDefault();
  }, { passive: false });
  addEventListener('touchend', e => { if (mode === 'glide' && target != null && performance.now() > lockUntil) glideTo(target); mode = null; target = null; }, { passive: true });
  addEventListener('wheel', e => {
    if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX) || Math.abs(e.deltaY) < 4) return;
    if (busy || performance.now() < lockUntil) { if (plan(Math.sign(e.deltaY)) != null) e.preventDefault(); return; }
    const y = plan(Math.sign(e.deltaY)); if (y == null) return;
    e.preventDefault(); glideTo(y); lockUntil = performance.now() + 900;
  }, { passive: false });
})();

/* why us: the compare switch flips every row in place; flips to ForgeHype by itself once on first view */
(() => {
  const box = document.getElementById('compare'); if (!box) return;
  const btns = [...box.querySelectorAll('.compare-switch button')], live = document.getElementById('compareLive');
  const set = side => {
    box.setAttribute('data-side', side);
    btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.side === side)));
    if (live) live.textContent = side === 'forge' ? 'Showing how ForgeHype works' : 'Showing how a typical agency works';
  };
  btns.forEach(b => b.addEventListener('click', () => set(b.dataset.side)));
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  new IntersectionObserver(([e], io) => { if (!e.isIntersecting) return; io.disconnect(); setTimeout(() => { if (box.getAttribute('data-side') === 'typical') set('forge'); }, RM ? 0 : 1400); }, { threshold: .5 }).observe(box);
})();

/* booking section: choose consultation or audit; the audit form goes to the leads Sheet only */
(() => {
  const modal = document.getElementById('formModal');
  const choose = document.getElementById('bookChoose');
  const forms = { bookForm: document.getElementById('bookForm'), auditForm: document.getElementById('auditForm') };
  if (!modal || !forms.bookForm) return;
  const titles = { bookForm: 'Book a free consultation', auditForm: 'Get a free website audit' };
  const show = id => {
    modal.querySelectorAll('.fm-tab').forEach(b => b.classList.toggle('on', b.dataset.form === id));
    document.getElementById('fmTitle').textContent = titles[id];
    Object.entries(forms).forEach(([k, f]) => { if (!f) return; f.hidden = k !== id; if (f.classList.contains('sent')) { f.classList.remove('sent'); f.reset(); } });
  };
  let keepY = 0;
  const open = id => {
    show(id);
    if (!modal.open) { keepY = scrollY; document.documentElement.classList.add('fm-lock'); modal.showModal(); }
    modal.querySelector('.fm-box').scrollTop = 0;
  };
  const close = () => { if (modal.open) modal.close(); };
  modal.addEventListener('close', () => {          // back exactly where the visitor was
    const html = document.documentElement, prev = html.style.scrollBehavior;
    html.classList.remove('fm-lock'); html.style.scrollBehavior = 'auto';
    window.scrollTo(0, keepY); requestAnimationFrame(() => { window.scrollTo(0, keepY); html.style.scrollBehavior = prev; });
  });
  modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close]')) close(); });
  modal.querySelectorAll('.fm-tab').forEach(b => b.addEventListener('click', () => show(b.dataset.form)));
  if (choose) choose.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => open(b.dataset.form)));
  document.querySelectorAll('[data-open-form]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const m = document.getElementById('menu'); if (document.body.classList.contains('menu-open') && m) { const t = document.querySelector('.nav-toggle'); if (t) t.click(); } open(a.dataset.openForm); }));
  const fromHash = () => {
    if (location.hash === '#audit') open('auditForm'); else if (location.hash === '#consult') open('bookForm'); else return;
    history.replaceState(null, '', location.pathname);
  };
  fromHash(); addEventListener('hashchange', fromHash);
  window.fhOpenForm = open;

  const f = forms.auditForm; if (!f) return;
  const bad = (el, on) => el.closest('.field').classList.toggle('invalid', on);
  f.querySelectorAll('.input').forEach(el => el.addEventListener('input', () => bad(el, false)));
  f.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(f);
    const type = String(d.get('type') || ''), site = String(d.get('website') || '').trim(), wa = String(d.get('whatsapp') || '').trim(), email = String(d.get('email') || '').trim();
    let ok = true;
    if (!type) { bad(f.querySelector('#a-type'), true); ok = false; }
    if (!site) { bad(f.querySelector('#a-site'), true); ok = false; }
    if (!wa && !email) { f.querySelector('.a-method').classList.add('invalid'); ok = false; } else f.querySelector('.a-method').classList.remove('invalid');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { bad(f.querySelector('#a-email'), true); ok = false; }
    const consent = f.querySelector('#a-consent');
    if (!consent.checked) { consent.closest('.field').classList.add('invalid'); ok = false; } else consent.closest('.field').classList.remove('invalid');
    if (!ok) { const first = f.querySelector('.invalid .input, .invalid input'); if (first) first.focus(); return; }
    (window.fhSendLead || (() => {}))({ source: 'Free audit', type, website: site, whatsapp: wa, email, online: String(d.get('online') || '').trim(), consent: 'yes', botcheck: d.get('botcheck') || '' });
    f.classList.add('sent');
  });
})();
