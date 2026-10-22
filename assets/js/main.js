// main.js: navigation, reveals, and the interactive sections. No dependencies.
(function () {
  'use strict';

  var CONTACT = { whatsapp: '97455879325', email: 'info@forgehype.qa' };
  var TEAMS_URL = ''; // Optional: paste a Microsoft Bookings / Teams scheduling link to send visitors there instead of WhatsApp.

  window.__fh = 1; // tells the head script that JS loaded, so reveal animations stay on
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.classList.add('js');
  if (!reduce && 'IntersectionObserver' in window) doc.classList.add('motion');

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var onView = function (els, cb, opts) {
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { cb(el); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { cb(e.target); io.unobserve(e.target); } });
    }, opts || { threshold: 0, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  };

  /* ---------- Header: glass on scroll, tuck away while reading down ---------- */
  var header = $('[data-header]');
  var lastY = window.scrollY, menuOpen = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle('is-scrolled', y > 24);
      var goingDown = y > lastY + 4, goingUp = y < lastY - 4;
      if (!menuOpen && !header.contains(document.activeElement)) {
        if (goingDown && y > 520) header.classList.add('is-hidden');
        else if (goingUp || y < 520) header.classList.remove('is-hidden');
      }
    }
    var wa = $('.wa-float');
    if (wa) wa.classList.toggle('is-on', y > window.innerHeight * 0.6);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (header) header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });

  /* ---------- Services mega menu (hover on desktop, button for keyboard/touch) ---------- */
  $$('.has-mega').forEach(function (item) {
    var btn = $('.mega-toggle', item);
    if (!btn) return;
    var setOpen = function (open) {
      item.classList.toggle('is-open', open);
      item.classList.toggle('is-closed', !open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    item.addEventListener('mouseenter', function () { item.classList.remove('is-closed'); });
    item.addEventListener('mouseleave', function () { if (btn.getAttribute('aria-expanded') !== 'true') item.classList.remove('is-closed'); });
    item.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setOpen(false); btn.focus(); } });
    document.addEventListener('click', function (e) { if (!item.contains(e.target)) { item.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); } });
  });

  /* ---------- Mobile menu sheet ---------- */
  var menu = $('#menu'), menuBtn = $('.menu-btn');
  if (menu && menuBtn) {
    var closeBtn = $('.menu-close', menu);
    $$('nav li', menu).forEach(function (li, i) { li.style.setProperty('--i', i); });
    var openMenu = function () {
      menuOpen = true; menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
      menuBtn.setAttribute('aria-expanded', 'true');
      doc.style.overflow = 'hidden';
      setTimeout(function () { closeBtn.focus(); }, 60);
    };
    var closeMenu = function (returnFocus) {
      menuOpen = false; menu.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      doc.style.overflow = '';
      setTimeout(function () { if (!menuOpen) menu.hidden = true; }, 300);
      if (returnFocus !== false) menuBtn.focus();
    };
    menuBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', function () { closeMenu(); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(false); });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
      if (e.key === 'Tab') { // keep focus inside the sheet
        var f = $$('a, button', menu).filter(function (el) { return el.offsetParent !== null; });
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Reveals ---------- */
  $$('[data-stagger]').forEach(function (group) {
    $$('[data-reveal]', group).forEach(function (el, i) { el.style.setProperty('--i', i); });
  });
  onView($$('[data-reveal]'), function (el) { el.classList.add('is-in'); });
  // Safety net: when scrolling settles (after an anchor jump or a fast flick), reveal anything
  // that is in view or already above it, so no content is ever left hidden.
  var settle = 0;
  var sweep = function () {
    var limit = window.innerHeight;
    $$('[data-reveal]:not(.is-in)').forEach(function (el) { if (el.getBoundingClientRect().top < limit) el.classList.add('is-in'); });
  };
  window.addEventListener('scroll', function () { clearTimeout(settle); settle = setTimeout(sweep, 160); }, { passive: true });
  window.addEventListener('load', sweep);
  onView($$('[data-viz], .pipeline-bar'), function (el) { el.classList.add('is-in'); }, { threshold: 0.3 });

  var hero = $('.hero');
  if (hero) {
    var start = function () { setTimeout(function () { hero.classList.add('is-in'); }, 30); };
    if (document.fonts && document.fonts.ready) {
      var done = false; var go = function () { if (!done) { done = true; start(); } };
      document.fonts.ready.then(go); setTimeout(go, 700);
    } else start();
  }

  /* ---------- Pointer-driven light on buttons and cards ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var t = e.target.closest && e.target.closest('.btn, .svc-card');
      if (!t) return;
      var r = t.getBoundingClientRect();
      if (t.classList.contains('btn')) t.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      else { t.style.setProperty('--px', (e.clientX - r.left) + 'px'); t.style.setProperty('--py', (e.clientY - r.top) + 'px'); }
    }, { passive: true });
  }

  /* ---------- Problem picker ---------- */
  var ICON = {
    web: '<svg viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect pathLength="1" x="8" y="14" width="56" height="42" rx="6"/><line pathLength="1" x1="8" y1="24" x2="64" y2="24"/><path pathLength="1" d="M20 44l8-8 7 6 10-12 8 8"/></svg>',
    media: '<svg viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect pathLength="1" x="22" y="6" width="28" height="60" rx="6"/><path pathLength="1" d="M32 28v16l13-8z"/></svg>',
    search: '<svg viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle pathLength="1" cx="31" cy="31" r="19"/><line pathLength="1" x1="45" y1="45" x2="62" y2="62"/><path pathLength="1" d="M23 31h16M31 23v16"/></svg>',
    brand: '<svg viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M36 8l26 14-26 14-26-14z"/><path pathLength="1" d="M10 36l26 14 26-14"/><path pathLength="1" d="M10 50l26 14 26-14"/></svg>',
    auto: '<svg viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle pathLength="1" cx="36" cy="36" r="10"/><path pathLength="1" d="M36 8v8M36 56v8M8 36h8M56 36h8M16 16l6 6M50 50l6 6M16 56l6-6M50 22l6-6"/></svg>',
    support: '<svg viewBox="0 0 72 72" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" d="M12 40v-4a24 24 0 0 1 48 0v4"/><rect pathLength="1" x="8" y="40" width="12" height="18" rx="4"/><rect pathLength="1" x="52" y="40" width="12" height="18" rx="4"/><path pathLength="1" d="M58 58c0 5-6 8-14 8h-6"/></svg>'
  };
  var PROBLEMS = [
    { t: 'Your website isn’t working', f: 'A fast, custom site that turns visits into sales.', p: 'Website & e-commerce', i: 'web', href: 'services/website-ecommerce.html' },
    { t: 'Your content gets scrolled past', f: 'Reels, UGC and demos people watch. As many as you need, every month.', p: 'Media production', i: 'media', href: 'services/media-production.html' },
    { t: 'Nobody finds you', f: 'Be found when customers search.', p: 'Search & AI visibility', i: 'search', href: 'services/search-ai-visibility.html' },
    { t: 'Nobody remembers you', f: 'Logo, menus, catalogs and packaging that stick.', p: 'Brand media kit', i: 'brand', href: 'services/brand-media-kit.html' },
    { t: 'Everything depends on you', f: 'AI, automation and apps. Your routines, handled.', p: 'AI, automation & apps', i: 'auto', href: 'services/ai-automation-apps.html' },
    { t: 'You’re falling behind', f: 'Backend experts beside your team. Always.', p: 'Monthly support', i: 'support', href: 'services/monthly-support.html' }
  ];
  var picker = $('[data-picker]');
  if (picker) {
    var tabs = $$('[role="tab"]', picker), panel = $('[data-picker-panel]', picker);
    var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    var show = function (i, focus) {
      var p = PROBLEMS[i];
      tabs.forEach(function (b, j) { b.setAttribute('aria-selected', j === i ? 'true' : 'false'); b.tabIndex = j === i ? 0 : -1; });
      panel.setAttribute('aria-labelledby', tabs[i].id);
      panel.dataset.step = i;
      var wa = 'https://wa.me/' + CONTACT.whatsapp + '?text=' + encodeURIComponent('Hi ForgeHype, I need help with: ' + p.t);
      panel.innerHTML =
        '<div class="picker-swap"><div class="picker-icon" aria-hidden="true">' + ICON[p.i] + '</div></div>' +
        '<div class="picker-swap"><p class="picker-problem">' + esc(p.t) + '</p><h3 class="picker-fix">' + esc(p.f) + '</h3></div>' +
        '<div class="picker-swap picker-go"><a class="btn btn-primary" href="#book" data-plan="' + esc(p.p) + '">Get a free audit</a>' +
        '<a class="link" href="' + p.href + '">See the service</a>' +
        '<a class="link" href="' + wa + '" target="_blank" rel="noopener">Or ask us on WhatsApp</a></div>';
      panel.classList.remove('is-swapping'); void panel.offsetWidth; panel.classList.add('is-swapping');
      if (focus) tabs[i].focus();
    };
    tabs.forEach(function (b, i) {
      b.addEventListener('click', function () { show(i); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, n = tabs.length, cur = tabs.indexOf(b);
        if (k === 'ArrowDown' || k === 'ArrowRight') { e.preventDefault(); show((cur + 1) % n, true); }
        if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); show((cur - 1 + n) % n, true); }
        if (k === 'Home') { e.preventDefault(); show(0, true); }
        if (k === 'End') { e.preventDefault(); show(n - 1, true); }
      });
    });
    show(0);
  }
  // Any link with data-plan pre-selects the "What do you need?" field.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-plan]');
    if (!a) return;
    var sel = $('#f-plan');
    if (sel) sel.value = a.getAttribute('data-plan');
  });

  /* ---------- Phone reel ---------- */
  $$('[data-reel]').forEach(function (reel) {
    var slides = $$('.reel-slide', reel), bars = $$('.reel-bars span', reel), cap = $('[data-reel-caption]', reel);
    var btn = reel.parentElement.querySelector('[data-reel-toggle]');
    var i = 0, timer = 0, playing = !reduce, visible = false;
    var paint = function () {
      slides.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
      bars.forEach(function (b, j) { b.classList.toggle('is-done', j < i); b.classList.toggle('is-active', j === i && playing); });
      if (cap) cap.innerHTML = slides[i].getAttribute('data-caption');
    };
    var tick = function () { clearTimeout(timer); if (playing && visible) timer = setTimeout(function () { i = (i + 1) % slides.length; paint(); tick(); }, 4200); };
    if (btn) {
      if (reduce) btn.textContent = 'Play reel';
      btn.addEventListener('click', function () {
        playing = !playing; btn.textContent = playing ? 'Pause reel' : 'Play reel';
        btn.setAttribute('aria-pressed', playing ? 'false' : 'true'); paint(); tick();
      });
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; tick(); }).observe(reel);
    else { visible = true; }
    paint(); tick();
  });

  /* ---------- Count-up numbers ---------- */
  onView($$('[data-count]'), function (el) {
    var to = parseFloat(el.getAttribute('data-count')), from = parseFloat(el.getAttribute('data-from') || '0');
    if (reduce) { el.textContent = to; return; }
    var t0 = performance.now(), dur = 1600;
    var step = function (now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = from; requestAnimationFrame(step);
  }, { threshold: 0.6 });

  /* ---------- Typical agency vs ForgeHype ---------- */
  $$('[data-compare]').forEach(function (box) {
    var btns = $$('.compare-switch button', box);
    $$('.compare-rows li', box).forEach(function (li, i) { li.style.setProperty('--i', i); });
    var set = function (side) {
      box.setAttribute('data-side', side);
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-side') === side ? 'true' : 'false'); });
      var live = $('[data-compare-live]', box);
      if (live) live.textContent = side === 'forge' ? 'Showing how ForgeHype works' : 'Showing how a typical agency works';
    };
    btns.forEach(function (b) { b.addEventListener('click', function () { set(b.getAttribute('data-side')); }); });
    // Flip to ForgeHype once on first view, so the contrast plays out without a click.
    onView([box], function () { setTimeout(function () { if (box.getAttribute('data-side') === 'typical') set('forge'); }, reduce ? 0 : 1100); }, { threshold: 0.5 });
  });

  /* ---------- Process loop ---------- */
  $$('[data-process]').forEach(function (proc) {
    var steps = $$('.step', proc), nodes = $$('.loop-node', proc);
    var prog = $('.loop-progress', proc), spark = $('.loop-spark', proc), track = $('.loop-track', proc);
    if (!prog || !track) return;
    var L = track.getTotalLength();
    prog.style.strokeDasharray = L; prog.style.strokeDashoffset = L;
    var anim = { v: 0, to: 0, raf: 0 };
    var draw = function () {
      anim.v += (anim.to - anim.v) * (reduce ? 1 : 0.08);
      prog.style.strokeDashoffset = L * (1 - anim.v);
      if (spark) { var pt = track.getPointAtLength(L * anim.v); spark.setAttribute('cx', pt.x); spark.setAttribute('cy', pt.y); spark.style.opacity = anim.v > 0.01 ? 1 : 0; }
      if (Math.abs(anim.to - anim.v) > 0.0005) anim.raf = requestAnimationFrame(draw);
    };
    var activate = function (n) {
      steps.forEach(function (s, j) { s.classList.toggle('is-on', j <= n); });
      nodes.forEach(function (s, j) { s.classList.toggle('is-on', j <= n); });
      anim.to = (n + 1) / steps.length; cancelAnimationFrame(anim.raf); draw();
    };
    // The active step is the last one whose top has passed just below the middle of the screen.
    // Reading positions on scroll (instead of a thin observer band) means fast flicks never skip a step.
    var current = -2, ticking = false;
    var update = function () {
      ticking = false;
      var line = window.innerHeight * 0.58, n = -1;
      steps.forEach(function (s, j) { if (s.getBoundingClientRect().top < line) n = j; });
      if (n !== current) { current = n; activate(n); }
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Before / after grading ---------- */
  $$('[data-ba]').forEach(function (ba) {
    var r = $('.ba-range', ba);
    var set = function () { ba.style.setProperty('--pos', r.value + '%'); };
    r.addEventListener('input', set); set();
    // A gentle sweep the first time it comes into view hints that it can be dragged.
    onView([ba], function () {
      if (reduce) return;
      var t0 = performance.now();
      var sweep = function (now) {
        var p = Math.min(1, (now - t0) / 1800), v = 50 + Math.sin(p * Math.PI * 2) * 22 * (1 - p);
        r.value = v; set(); if (p < 1) requestAnimationFrame(sweep);
      };
      requestAnimationFrame(sweep);
    }, { threshold: 0.6 });
  });

  /* ---------- Monthly volume meter ---------- */
  $$('[data-volume]').forEach(function (v) {
    var input = $('input', v), scale = $('.volume-scale', v), out = $('[data-volume-out]', v);
    var bars = [];
    for (var i = 1; i <= 60; i++) {
      var b = document.createElement('i');
      b.style.setProperty('--h', (18 + (i / 60) * 82) + '%');
      scale.appendChild(b); bars.push(b);
    }
    var set = function () {
      var n = +input.value;
      bars.forEach(function (b, j) { b.classList.toggle('is-on', j < n); });
      out.textContent = n;
      input.setAttribute('aria-valuetext', n + ' videos a month');
    };
    input.addEventListener('input', set); set();
  });

  /* ---------- Typing search (service page visual) ---------- */
  $$('[data-type]').forEach(function (el) {
    var text = el.getAttribute('data-type');
    if (reduce) { el.textContent = text; return; }
    onView([el], function () {
      var i = 0;
      var next = function () { el.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(next, 45 + Math.random() * 60); };
      setTimeout(next, 500);
    }, { threshold: 0.6 });
  });

  /* ---------- FAQ: smooth open / close on native <details> ---------- */
  $$('.faq-item').forEach(function (d) {
    var sum = $('summary', d), ans = $('.ans', d);
    if (!sum || !ans || reduce || !ans.animate) return;
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.open) {
        var h = ans.offsetHeight;
        ans.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 260, easing: 'cubic-bezier(.65,0,.35,1)' })
          .onfinish = function () { d.open = false; };
      } else {
        d.open = true;
        var h2 = ans.offsetHeight;
        ans.animate([{ height: '0px', opacity: 0 }, { height: h2 + 'px', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    });
  });

  /* ---------- Booking form: validate, then hand off to WhatsApp (or Teams) ---------- */
  var form = $('#bookForm');
  if (form) {
    var status = $('#formStatus'), summary = $('#errSummary');
    var params = new URLSearchParams(window.location.search);
    if (params.get('need')) { var s = $('#f-plan'); if (s) s.value = params.get('need'); }
    var rules = {
      'f-name': function (v) { return v.trim() ? '' : 'Add your name so we know who to invite.'; },
      'f-email': function (v) { return !v.trim() ? 'Add your work email. The Teams invite goes there.' : (/^\S+@\S+\.\S+$/.test(v.trim()) ? '' : 'That email looks incomplete. Check for a missing @ or domain.'); },
      'f-phone': function (v) { return !v.trim() || /^[+\d][\d\s()-]{6,}$/.test(v.trim()) ? '' : 'Use digits only, for example +974 5555 5555.'; }
    };
    var check = function (id) {
      var el = document.getElementById(id), msg = rules[id](el.value), err = document.getElementById(id + '-err');
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) { err.classList.toggle('is-on', !!msg); $('span', err).textContent = msg; }
      return msg;
    };
    Object.keys(rules).forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener('blur', function () { if (el.value) check(id); });
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') check(id); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errors = Object.keys(rules).map(function (id) { return [id, check(id)]; }).filter(function (x) { return x[1]; });
      if (errors.length) {
        $('ul', summary).innerHTML = errors.map(function (x) { return '<li><a href="#' + x[0] + '">' + x[1] + '</a></li>'; }).join('');
        summary.classList.add('is-on'); summary.focus();
        status.textContent = ''; return;
      }
      summary.classList.remove('is-on');
      var kind = form.querySelector('input[name="kind"]:checked').value;
      var msg = 'Hi ForgeHype, I’d like ' + kind.toLowerCase() + ' on Microsoft Teams.\n' +
        'Name: ' + form.name.value.trim() + '\n' +
        'Company: ' + (form.company.value.trim() || '-') + '\n' +
        'Email: ' + form.email.value.trim() + '\n' +
        'Phone: ' + (form.phone.value.trim() || '-') + '\n' +
        'Need: ' + form.plan.value;
      var btn = $('button[type="submit"]', form);
      btn.disabled = true; btn.querySelector('.lbl').textContent = 'Opening WhatsApp…';
      setTimeout(function () {
        if (TEAMS_URL) { window.location.href = TEAMS_URL; return; }
        window.open('https://wa.me/' + CONTACT.whatsapp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
        status.className = 'form-status is-ok';
        status.textContent = 'Almost done. Send the WhatsApp message and we’ll reply with a Teams invite.';
        btn.disabled = false; btn.querySelector('.lbl').textContent = 'Book a free audit';
      }, 450);
    });
  }

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
