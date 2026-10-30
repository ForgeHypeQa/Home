/* Forge hero (homepage): a particle hologram that shapes itself into what ForgeHype builds —
   Qatar in a ring → website → media (play) → app (phone) → e-commerce (bag) → AI (chip) → growth (chart).
   Canvas 2D, no libraries: about 1,100 particles on phones, 1,800 on desktop, brand orange on black.
   First visit: a cinematic intro — the hologram plays one full cycle large in the centre with its captions,
   then glides to its resting place while the headline text flows in. Any scroll, tap or key skips it;
   it plays once per browser session (sessionStorage 'fh-intro'). ?intro=1 forces it, ?forge=N jumps to a shape.
   Pauses when off screen or the tab is hidden; a single still frame with reduced motion.
   Tune: HOLD / MORPH (ms), HOLD_I / MORPH_I for the intro, and place() for where the object sits. */
(() => {
  const cv = document.getElementById('forge'); if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = () => innerWidth < 721;
  const N = phone() ? 1800 : innerWidth >= 1600 ? 3400 : 2700;
  const HOLD = 2600, MORPH = 1300, HOLD_I = 1280, MORPH_I = 760, TRANS = 1200;   // ms per shape / per change; intro pace; glide to rest
  const ACC = '217,104,46', LIT = '255,158,96', HOT = '255,238,224';

  /* ---------- shapes drawn in unit space (-1..1, y down), then sampled into points ---------- */
  const rr = (c, x, y, w, h, r) => {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  const dot = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
  const QATAR = [[.063,.616],[-.004,.633],[-.065,.65],[-.118,.65],[-.158,.643],[-.188,.626],[-.241,.556],[-.278,.467],[-.257,.417],[-.249,.386],[-.3,.148],[-.315,-.033],[-.31,-.07],[-.281,-.113],[-.23,-.207],[-.206,-.299],[-.132,-.509],[-.055,-.59],[.06,-.65],[.153,-.533],[.268,-.444],[.289,-.345],[.254,-.264],[.225,-.136],[.244,-.076],[.249,-.025],[.281,.062],[.31,.173],[.315,.251],[.3,.323],[.26,.383],[.182,.566],[.158,.585]];
  const CAPS = ['', 'Websites\nthat convert', 'Media\nproduction', 'Web portal\n& app', 'E-commerce', 'AI integration', 'Business\ngrowth'];
  const DRAW = [
    c => {                                                    // 0: Qatar in a ring, Doha marked (Natural Earth 1:50m outline)
      c.lineWidth = .07; c.beginPath(); c.arc(0, 0, .95, 0, 7); c.stroke();
      c.save(); c.scale(1.16, 1.16); c.lineWidth = .06;
      c.beginPath(); QATAR.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); c.stroke();
      c.lineWidth = .05; c.beginPath(); c.arc(.258, .06, .15, 0, 7); c.stroke(); dot(c, .258, .06, .07); c.restore();
    },
    c => {                                                    // 1: websites — browser window
      c.lineWidth = .07; rr(c, -1, -.72, 2, 1.44, .14); c.stroke();
      c.beginPath(); c.moveTo(-1, -.4); c.lineTo(1, -.4); c.stroke();
      [-.8, -.64, -.48].forEach(x => dot(c, x, -.56, .05));
      c.lineWidth = .065;
      c.beginPath(); c.moveTo(-.72, -.1); c.lineTo(.2, -.1); c.stroke();
      c.beginPath(); c.moveTo(-.72, .12); c.lineTo(-.12, .12); c.stroke();
      rr(c, -.72, .32, .52, .2, .1); c.fill();
      c.save(); c.translate(.38, .02); c.scale(.62, .62);     // cursor
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, .78); c.lineTo(.2, .6); c.lineTo(.34, .9); c.lineTo(.47, .84); c.lineTo(.34, .55); c.lineTo(.58, .55); c.closePath(); c.fill(); c.restore();
    },
    c => {                                                    // 2: media production — play
      c.lineWidth = .08; c.beginPath(); c.arc(0, 0, .9, 0, 7); c.stroke();
      c.beginPath(); c.moveTo(-.28, -.46); c.lineTo(-.28, .46); c.lineTo(.52, 0); c.closePath(); c.fill();
    },
    c => {                                                    // 3: web portal & app — phone with app grid
      c.lineWidth = .07; rr(c, -.52, -.98, 1.04, 1.96, .18); c.stroke();
      c.lineWidth = .06; c.beginPath(); c.moveTo(-.16, -.8); c.lineTo(.16, -.8); c.stroke();
      [[-.36, -.5], [.04, -.5], [-.36, -.1], [.04, -.1]].forEach(p => { rr(c, p[0], p[1], .32, .32, .08); c.fill(); });
      c.lineWidth = .065; c.beginPath(); c.moveTo(-.34, .42); c.lineTo(.34, .42); c.moveTo(-.34, .62); c.lineTo(.1, .62); c.stroke();
    },
    c => {                                                    // 4: e-commerce — shopping bag
      c.lineWidth = .07; rr(c, -.72, -.22, 1.44, 1.12, .14); c.stroke();
      c.beginPath(); c.arc(0, -.22, .4, Math.PI, 0); c.stroke();
      c.lineWidth = .065; c.beginPath(); c.moveTo(-.2, .28); c.lineTo(-.04, .46); c.lineTo(.26, .1); c.stroke();
    },
    c => {                                                    // 5: AI integration — chip with a spark
      c.lineWidth = .07; rr(c, -.55, -.55, 1.1, 1.1, .12); c.stroke();
      c.lineWidth = .065;
      [-.3, 0, .3].forEach(t => {
        c.beginPath(); c.moveTo(t, -.55); c.lineTo(t, -.86); c.moveTo(t, .55); c.lineTo(t, .86);
        c.moveTo(-.55, t); c.lineTo(-.86, t); c.moveTo(.55, t); c.lineTo(.86, t); c.stroke();
      });
      c.beginPath(); c.moveTo(0, -.34); c.quadraticCurveTo(0, 0, .34, 0); c.quadraticCurveTo(0, 0, 0, .34);
      c.quadraticCurveTo(0, 0, -.34, 0); c.quadraticCurveTo(0, 0, 0, -.34); c.fill();
    },
    c => {                                                    // 6: business growth — rising chart with arrow
      c.lineWidth = .08; c.beginPath(); c.moveTo(-.95, .62); c.lineTo(-.45, .25); c.lineTo(-.05, .44); c.lineTo(.4, -.2); c.lineTo(.78, -.58); c.stroke();
      c.beginPath(); c.moveTo(.47, -.53); c.lineTo(.78, -.58); c.lineTo(.73, -.27); c.stroke();
      [[-.95, .62], [-.45, .25], [-.05, .44], [.4, -.2]].forEach(p => dot(c, p[0], p[1], .085));
      c.lineWidth = .05; c.beginPath(); c.moveTo(-.95, .92); c.lineTo(.95, .92); c.stroke();
    }
  ];
  const byAngle = (a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x);
  /* sample(draw, count): rasterise a drawing in unit space and pick `count` points on it */
  const S = 480, m = S / 2.3;
  const sample = (draw, count, sortBy) => {
    const oc = document.createElement('canvas'); oc.width = oc.height = S;
    const c = oc.getContext('2d', { willReadFrequently: true });
    c.translate(S / 2, S / 2); c.scale(m, m); c.lineCap = c.lineJoin = 'round'; c.fillStyle = c.strokeStyle = '#fff';
    draw(c);
    const d = c.getImageData(0, 0, S, S).data, pts = [];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (d[(y * S + x) * 4 + 3] > 90) pts.push([(x + .5 - S / 2) / m, (y + .5 - S / 2) / m]);
    if (!pts.length) pts.push([0, 0]);
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const t = pts[i]; pts[i] = pts[j]; pts[j] = t; }
    const out = [];
    for (let i = 0; i < count; i++) { const p = pts[i % pts.length]; out.push({ x: p[0] + (Math.random() - .5) * .006, y: p[1] + (Math.random() - .5) * .006, z: (Math.random() - .5) * .05 }); }
    return out.sort(sortBy || byAngle);
  };
  /* each state = the icon (smaller, upper part) + its caption as particles below it; Qatar has no caption and fills the space */
  const FONT = (getComputedStyle(document.documentElement).getPropertyValue('--font-display') || 'sans-serif').trim();
  const NT = 0;                                        // captions are crisp text, not particles
  const CAPL = [];                                     // caption layout per state, in unit space (for the crisp text layer)
  const text = (str, c, i) => {                        // drawn in pixel space so the font size is not scaled by m
    c.save(); c.setTransform(1, 0, 0, 1, S / 2, S / 2);
    const lines = str.split('\n'); let px = lines.length > 1 ? 54 : 60; c.font = '700 ' + px + 'px ' + FONT; if ('letterSpacing' in c) c.letterSpacing = (-.03 * px) + 'px';
    const w = Math.max(...lines.map(l => c.measureText(l).width)), maxW = 2.1 * m; if (w > maxW) { px *= maxW / w; c.font = '700 ' + px + 'px ' + FONT; }
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const lh = px * 1.02, y0 = (lines.length > 1 ? .78 : .86) * m - (lines.length - 1) * lh / 2;
    lines.forEach((l, n) => c.fillText(l, 0, y0 + n * lh)); c.restore();
    CAPL[i] = { lines, fs: px / m, ys: lines.map((l, n) => (y0 + n * lh) / m) };
  };
  const build = withCaps => DRAW.map((draw, i) => {
    if (!withCaps || !CAPS[i]) return sample(draw, N);
    sample(c => text(CAPS[i], c, i), 1);                 // measures the caption layout only
    return sample(c => { c.translate(0, -.42); c.scale(.56, .56); draw(c); }, N);   // icon above, room for the caption
  });
  const sec = cv.parentElement.parentElement;
  const q0 = /[?&]forge=(\d)/.exec(location.search);
  let intro = !RM && !q0 && (/[?&]intro=1/.test(location.search) || !(() => { try { return sessionStorage.getItem('fh-intro'); } catch (e) { return 0; } })());
  window.__forge = true;
  const SETS = { cap: build(true), full: build(false) };
  let SHAPES = intro ? SETS.cap : SETS.full;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { SETS.cap = build(true); SETS.full = build(false); SHAPES = intro ? SETS.cap : SETS.full; });

  /* ---------- particles ---------- */
  const sprite = (rgb, size) => {
    const s = document.createElement('canvas'); s.width = s.height = size; const c = s.getContext('2d');
    const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(' + rgb + ',1)'); g.addColorStop(.16, 'rgba(' + rgb + ',.95)'); g.addColorStop(.34, 'rgba(' + rgb + ',.25)'); g.addColorStop(.7, 'rgba(' + rgb + ',.04)'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    c.fillStyle = g; c.fillRect(0, 0, size, size); return s;
  };
  const SPR = [sprite(ACC, 64), sprite(LIT, 64), sprite(HOT, 64)];
  const P = [];
  for (let i = 0; i < N; i++) {
    const r = Math.random();
    P.push({ k: r < .8 ? 0 : r < .96 ? 1 : 2, s: .8 + Math.random() * .45, ph: Math.random() * 6.28, d: i / N, x: 0, y: 0, z: 0 });
  }
  const EMB = []; for (let i = 0; i < (phone() ? 12 : 22); i++) EMB.push({ x: 0, y: 0, v: 1, a: 0, t: 1, s: 2, w: 0 });
  const ember = e => { e.v = 3200 + Math.random() * 3200; e.x = cx + (Math.random() - .5) * R * 2.6; e.y = floorY + R * .1; e.s = 1.5 + Math.random() * 1.8; e.a = .15 + Math.random() * .3; e.w = Math.random() * 6.28; };

  /* ---------- layout ---------- */
  let W = 0, H = 0, DPR = 1, cx = 0, cy = 0, R = 0, floorY = 0, lx = 0, ly = 0, LS = 0, mix = intro ? 0 : 1;   // mix: 0 = intro (centre, large), 1 = resting place
  const G0 = { cx: 0, cy: 0, R: 0 }, G1 = { cx: 0, cy: 0, R: 0 };
  const ease = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const layer = document.createElement('canvas'), lc = layer.getContext('2d');
  const refl = document.createElement('canvas'), rc = refl.getContext('2d');
  const place = () => {
    const host = cv.parentElement, sec = host.parentElement; W = host.clientWidth; H = host.clientHeight;
    DPR = Math.min(devicePixelRatio || 1, phone() ? 1.5 : 2);   // soft sprites: 1.5x is plenty on phones
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const portrait = phone() || innerHeight > innerWidth;
    if (portrait && !phone()) {                              // portrait tablets: like desktop, on the right, centred on the headline block
      const hb = host.getBoundingClientRect(), t = sec.querySelector('.hero-title'), btn = sec.querySelector('.btn-row');
      const top = t ? t.getBoundingClientRect().top - hb.top : H * .35, bot = btn ? btn.getBoundingClientRect().bottom - hb.top : H * .6;
      const pad = Math.max(24, (W - Math.min(W - 48, 1380)) / 2);
      G1.R = Math.max(60, Math.min(W * .16, (bot - top) * .42)); G1.cx = W - pad - G1.R * 1.1; G1.cy = (top + bot) / 2;
    } else if (portrait) {                                   // resting place, phones: between the navbar and the kicker
      const k = sec.querySelector('.kicker'), top = 104, bottom = (k ? k.offsetTop : H * .54) - 10;
      G1.R = Math.max(40, Math.min(W * .44, (bottom - top) / 2.45)); G1.cx = W / 2; G1.cy = top + G1.R * 1.05;
    } else { G1.R = Math.min(H * .30, W * .17); G1.cx = W - Math.max(46, (W - Math.min(W - 92, 1380)) / 2) - G1.R * 1.05; G1.cy = H * .44; }   // desktop: against the right edge of the content
    G0.cx = W / 2; G0.cy = H * .46; G0.R = portrait ? Math.min(W * .42, H * .21) : Math.min(W * .42, H * .28);   // intro: centre stage
    geo(); const LSmax = Math.ceil(Math.max(G0.R, G1.R) * 3.2);
    layer.width = refl.width = Math.round(LSmax * DPR); layer.height = refl.height = Math.round(LSmax * DPR);
  };
  const geo = () => {                                        // current geometry from the intro → rest mix
    const e = ease(mix);
    cx = G0.cx + (G1.cx - G0.cx) * e; cy = G0.cy + (G1.cy - G0.cy) * e; R = G0.R + (G1.R - G0.R) * e;
    floorY = cy + R * (1.14 - .06 * e); LS = Math.ceil(R * 3.2); lx = cx - LS / 2; ly = cy - LS / 2;
  };

  /* ---------- animation state ---------- */
  let idx = q0 ? Math.min(+q0[1], DRAW.length - 1) : 0, nxt = 0, morphing = false, t = 0, hold = intro ? HOLD_I : HOLD, last = 0, mx = 0, my = 0, tx = 0, ty = 0, inView = true, raf = 0;
  let cycle = 0, trans = -1, transDur = TRANS, revealed = false;   // intro bookkeeping
  const reveal = () => {
    if (revealed) return; revealed = true;
    sec.classList.remove('intro'); sec.classList.add('hero-in');
    try { sessionStorage.setItem('fh-intro', '1'); } catch (e) {}
  };
  const endIntro = fast => { if (!intro || trans >= 0) return; trans = 0; transDur = fast ? 700 : TRANS; };
  if (!intro) reveal();
  else ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(ev => addEventListener(ev, () => endIntro(true), { passive: true, once: false }));
  const tmp = { x: 0, y: 0, z: 0 };
  const at = (shape, i, time, o) => {
    const p = SHAPES[shape][i]; o.x = p.x; o.y = p.y; o.z = p.z;
  };

  const frame = now => {
    const dt = Math.min(50, now - (last || now)); last = now;
    if (!RM) {
      const M = intro ? MORPH_I : MORPH;
      if (morphing) { t += dt / M; if (t >= 1) { t = 1; morphing = false; idx = nxt; hold = intro ? HOLD_I : HOLD; if (idx === 0) cycle++; } }
      else { hold -= dt; if (hold <= 0) { nxt = (idx + 1) % SHAPES.length; morphing = true; t = 0; if (intro && nxt === 0) endIntro(false); } }
      if (trans >= 0) {                                      // glide from centre stage to the resting place
        trans += dt / transDur; mix = Math.min(1, trans);
        if (mix > .2) reveal();
        if (trans >= 1) { intro = false; trans = -1; mix = 1; SHAPES = SETS.full; if (!morphing) { idx = idx; } }
        geo();
      }
    }
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    const yaw = (RM ? 0 : Math.sin(now * .00045) * .3) + mx * .5, pitch = .14 + my * .3;
    const cy1 = Math.cos(yaw), sy1 = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), F = 2.6;
    const base = Math.max(5.5, R * .044);
    const dim = ease(mix);                                   // 0 = intro, 1 = at rest: 50% opacity, darker light
    cv.style.opacity = (1 - .5 * dim).toFixed(3);

    /* particles → layer (additive) */
    lc.setTransform(DPR, 0, 0, DPR, 0, 0); lc.clearRect(0, 0, LS, LS); lc.globalCompositeOperation = 'lighter';
    const ox = LS / 2, oy = LS / 2;
    for (let i = 0; i < N; i++) {
      const q = P[i];
      if (morphing) {
        const k = ease(Math.max(0, Math.min(1, (t - q.d * .42) / .58)));
        at(idx, i, now, tmp); const x0 = tmp.x, y0 = tmp.y, z0 = tmp.z; at(nxt, i, now, tmp);
        q.x = x0 + (tmp.x - x0) * k; q.y = y0 + (tmp.y - y0) * k; q.z = z0 + (tmp.z - z0) * k;
      } else { at(idx, i, now, tmp); q.x = tmp.x; q.y = tmp.y; q.z = tmp.z; }
      let x = q.x * cy1 + q.z * sy1, z = -q.x * sy1 + q.z * cy1, y = q.y;      // yaw
      const y2 = y * cp - z * sp; z = y * sp + z * cp; y = y2;                 // pitch
      const s = F / (F - z), sz = base * q.s * Math.pow(s, 1.4);
      const tw = .55 + .45 * Math.sin(now * .003 + q.ph);
      const lit = .42 + .58 * Math.max(0, (-x * .32 - y * .62 + z * .72));       // key light: top-left-front
      lc.globalAlpha = Math.min(1, (.3 + .7 * lit) * (q.k === 2 ? tw : .8 + .2 * tw)) * (1 - .35 * dim);
      lc.drawImage(SPR[q.k], ox + x * R * s - sz / 2, oy + y * R * s - sz / 2, sz, sz);
    }
    lc.globalAlpha = 1;

    /* reflection = layer flipped and faded */
    rc.setTransform(DPR, 0, 0, DPR, 0, 0); rc.clearRect(0, 0, LS, LS); rc.globalCompositeOperation = 'source-over';
    rc.save(); rc.translate(0, LS); rc.scale(1, -1); rc.drawImage(layer, 0, 0, Math.round(LS * DPR), Math.round(LS * DPR), 0, 0, LS, LS); rc.restore();
    rc.globalCompositeOperation = 'destination-in';
    const fr = LS - (floorY - ly);           // the floor line, in flipped-layer rows
    const g = rc.createLinearGradient(0, fr - 2, 0, fr + R * (.55 - .17 * ease(mix)));
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.01, 'rgba(0,0,0,.32)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    rc.fillStyle = g; rc.fillRect(0, 0, LS, LS);

    /* compose */
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
    const glow = ctx.createRadialGradient(cx, cy + R * .15, 0, cx, cy + R * .15, R * 1.75);
    glow.addColorStop(0, 'rgba(' + ACC + ',' + (.24 - .16 * dim) + ')'); glow.addColorStop(.45, 'rgba(' + ACC + ',' + (.07 - .05 * dim) + ')'); glow.addColorStop(1, 'rgba(' + ACC + ',0)');
    ctx.fillStyle = glow; ctx.fillRect(cx - R * 1.8, cy - R * 1.7, R * 3.6, R * 3.6);
    ctx.save(); ctx.translate(cx, floorY); ctx.scale(1, .11);
    const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.35);
    pool.addColorStop(0, 'rgba(' + ACC + ',' + (.34 - .22 * dim) + ')'); pool.addColorStop(1, 'rgba(' + ACC + ',0)');
    ctx.fillStyle = pool; ctx.fillRect(-R * 1.4, -R * 1.4, R * 2.8, R * 2.8); ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    const LP = Math.round(LS * DPR);
    ctx.drawImage(layer, 0, 0, LP, LP, lx, ly, LS, LS);
    ctx.drawImage(refl, 0, 0, LP, LP, lx, ly + 2 * (floorY - ly) - LS, LS, LS);

    /* crisp caption on top of its particles: fades out as a change starts, in as the letters settle */
    ctx.globalCompositeOperation = 'source-over';
    const drawCap = (i, k) => {                        // k: 0 → 1 pop-in (negative = fading out)
      const L = CAPL[i]; if (!L || k === 0) return;
      const a = Math.abs(k), e = 1 - Math.pow(1 - a, 3), sc = k > 0 ? .9 + .1 * e : .97 + .03 * a, dy = k > 0 ? (1 - e) * R * .08 : 0;
      const Rk = Math.round(R / 8) * 8;
      if (!L.img || L.imgR !== Rk || L.imgD !== DPR) {        // glow text is costly: render each caption once per size
        const fs = L.fs * Rk, pad = Rk * .2, w = Math.ceil(Rk * 2.6 + pad * 2), h = Math.ceil(L.lines.length * fs * 1.02 + pad * 2);
        const o = L.img || document.createElement('canvas'); o.width = Math.round(w * DPR); o.height = Math.round(h * DPR);
        const c = o.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0);
        c.fillStyle = '#f4efe9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 ' + fs + 'px ' + FONT;
        if ('letterSpacing' in c) c.letterSpacing = (-.03 * fs) + 'px';
        L.lines.forEach((l, n) => c.fillText(l, w / 2, pad + fs * .51 + n * fs * 1.02));
        L.img = o; L.imgR = Rk; L.imgD = DPR; L.imgW = w; L.imgH = h; L.imgPad = pad; L.imgFs = fs;
      }
      const yc = (L.ys[0] + L.ys[L.ys.length - 1]) / 2, y2 = yc * cp, z = yc * sp, s = F / (F - z);
      ctx.save(); ctx.globalAlpha = e; ctx.translate(cx, cy + y2 * R * s + dy); ctx.scale(Math.cos(yaw) * s * sc, s * sc);
      const kk = R / Rk; ctx.drawImage(L.img, -L.imgW * kk / 2, -L.imgH * kk / 2, L.imgW * kk, L.imgH * kk); ctx.restore();
    };
    if (intro && trans < 0) {
      if (morphing) { drawCap(idx, -(1 - Math.min(1, t * 4))); drawCap(nxt, Math.max(0, (t - .55) / .45)); }
      else drawCap(idx, 1);
    } else if (intro) drawCap(idx === 0 && morphing ? idx : idx, -(1 - Math.min(1, mix * 3)));
    ctx.globalCompositeOperation = 'lighter';

    /* embers rising from the floor */
    if (!RM) for (const e of EMB) {
      e.t += dt / e.v;
      if (e.t >= 1) { e.t = 0; ember(e); }
      const y = e.y - e.t * R * 1.5, x = e.x + Math.sin(e.t * 4 + e.w) * R * .06;
      ctx.globalAlpha = e.a * Math.sin(e.t * Math.PI);
      ctx.drawImage(SPR[1], x - e.s * 1.5, y - e.s * 1.5, e.s * 3, e.s * 3);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';

    raf = (!RM && inView && !document.hidden) ? requestAnimationFrame(frame) : 0;
  };
  const kick = () => { if (!raf && !RM) { last = 0; raf = requestAnimationFrame(frame); } };

  place(); EMB.forEach(e => { ember(e); e.t = Math.random(); }); frame(performance.now());
  if ('ResizeObserver' in window) new ResizeObserver(() => { place(); if (RM) frame(performance.now()); }).observe(cv.parentElement);
  else addEventListener('resize', () => { place(); if (RM) frame(performance.now()); });
  new IntersectionObserver(([en]) => { inView = en.isIntersecting; if (inView) kick(); }, { threshold: .05 }).observe(cv);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || phone()) return; tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
})();
