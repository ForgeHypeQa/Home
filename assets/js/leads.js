/* Lead tools on their own pages: the free check form and the Growth Score quiz.
   Both save to the ForgeHype leads Google Sheet (assets/leads-sheet.gs) through LEADS_URL. Empty = nothing is sent. */
(() => {
  const LEADS_URL = 'https://script.google.com/macros/s/AKfycbxj8_qcc2A8HBLOF_p7GYVW9iRBQZ4ldqa_-jm75wajHEmQCIbKksbXXIum7D-wcdah/exec';   // keep in sync with LEADS_URL in main.js
  const send = fields => {
    if (!LEADS_URL || fields.botcheck) return;
    const body = new URLSearchParams({ ...fields, page: location.pathname });
    fetch(LEADS_URL, { method: 'POST', mode: 'no-cors', keepalive: true, body }).catch(() => {});
    if (window.fhTrack) window.fhTrack('generate_lead', { lead_source: fields.source || '' });
  };
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  /* ---------------- free check ---------------- */
  const cf = document.getElementById('checkForm');
  if (cf) {
    const bad = (el, on) => el.closest('.field').classList.toggle('invalid', on);
    cf.querySelectorAll('.input').forEach(el => el.addEventListener('input', () => bad(el, false)));
    cf.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(cf);
      const type = String(d.get('type') || ''), site = String(d.get('website') || '').trim();
      const wa = String(d.get('whatsapp') || '').trim(), email = String(d.get('email') || '').trim();
      let ok = true;
      if (!type) { bad(cf.querySelector('#c-type'), true); ok = false; }
      if (!site) { bad(cf.querySelector('#c-site'), true); ok = false; }
      const m = cf.querySelector('.a-method');
      if (!wa && !email) { m.classList.add('invalid'); ok = false; } else m.classList.remove('invalid');
      if (email && !emailOk(email)) { bad(cf.querySelector('#c-email'), true); ok = false; }
      const c = cf.querySelector('#c-consent');
      if (!c.checked) { c.closest('.field').classList.add('invalid'); ok = false; } else c.closest('.field').classList.remove('invalid');
      if (!ok) { const f = cf.querySelector('.invalid .input, .invalid input'); if (f) f.focus(); return; }
      send({ source: 'Free check', type, website: site, whatsapp: wa, email, online: String(d.get('online') || '').trim(), consent: 'yes', botcheck: d.get('botcheck') || '' });
      cf.classList.add('sent');
      cf.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }

  /* ---------------- growth score ---------------- */
  const quiz = document.getElementById('quiz');
  if (!quiz) return;
  /* each answer scores 0-12.5 (8 questions = 100); tip shown when the answer is weak */
  const Q = [
    { q: 'Can a customer find you on Google Maps with your hours, photos and a call button?', a: [['Yes, fully set up', 12.5], ['We have a listing, it’s incomplete', 6], ['No / not sure', 0]],
      tip: 'Complete your Google Business Profile: hours, photos, services and a call button. It’s the fastest win for “near me” searches.' },
    { q: 'How fast does your website open on a phone?', a: [['Under 3 seconds', 12.5], ['It’s slow', 4], ['We don’t have a website', 0]],
      tip: 'Get a fast, mobile-first website. Most visitors leave a slow site before it loads.' },
    { q: 'Can customers order, book or message you in one tap from your site or Instagram?', a: [['Yes, one tap', 12.5], ['It takes a few steps', 5], ['No', 0]],
      tip: 'Add one-tap WhatsApp, booking or ordering. Every extra step loses customers.' },
    { q: 'How often do you post content that people actually watch?', a: [['Every week, it performs', 12.5], ['Sometimes, low engagement', 5], ['Rarely or never', 0]],
      tip: 'Plan a steady flow of short reels made for your brand. Consistency beats one big shoot.' },
    { q: 'Do your logo, colours and style look the same everywhere?', a: [['Yes, consistent', 12.5], ['Mostly', 6], ['Every post looks different', 0]],
      tip: 'Lock in one brand identity: logo, colours and templates used everywhere, so customers remember you.' },
    { q: 'How quickly do customers get a reply on WhatsApp or Instagram?', a: [['Within minutes, even after hours', 12.5], ['Within a few hours', 6], ['A day or more', 0]],
      tip: 'Use automation or an AI assistant to reply in seconds. Customers order from whoever answers first.' },
    { q: 'Do you know how many enquiries come from your website and social each month?', a: [['Yes, we track it', 12.5], ['Roughly', 5], ['No idea', 0]],
      tip: 'Set up simple tracking so you can see what brings enquiries and spend only on what works.' },
    { q: 'Who runs your digital side: website, content, ads, replies?', a: [['A team or partner does it', 12.5], ['Me, plus some help', 5], ['Just me, when I find time', 0]],
      tip: 'Hand the digital side to a monthly team so you can focus on running the business.' }
  ];
  const body = document.getElementById('qBody'), count = document.getElementById('qCount'), fill = document.getElementById('qFill'), res = document.getElementById('qResult');
  const answers = [];
  let i = 0;
  const show = () => {
    count.textContent = 'Question ' + (i + 1) + ' of ' + Q.length;
    fill.style.width = (i / Q.length * 100) + '%';
    const q = Q[i];
    body.innerHTML = '<h2 class="q-q t-display">' + q.q + '</h2><div class="q-opts" role="group" aria-label="Answers"></div>' +
      (i ? '<button type="button" class="q-back link">← Back</button>' : '');
    const box = body.querySelector('.q-opts');
    q.a.forEach(([t, v], k) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'q-opt'; b.textContent = t;
      if (answers[i] === k) b.classList.add('on');
      b.addEventListener('click', () => { answers[i] = k; b.classList.add('on'); setTimeout(() => { i++; i < Q.length ? show() : finish(); }, 220); });
      box.appendChild(b);
    });
    const back = body.querySelector('.q-back'); if (back) back.addEventListener('click', () => { i--; show(); });
    body.classList.remove('q-in'); void body.offsetWidth; body.classList.add('q-in');
    const first = box.querySelector('button'); if (first && i > 0) first.focus({ preventScroll: true });
  };
  const finish = () => {
    fill.style.width = '100%'; count.textContent = 'Your result';
    const score = Math.round(answers.reduce((s, k, n) => s + Q[n].a[k][1], 0));
    const weak = answers.map((k, n) => ({ n, v: Q[n].a[k][1] })).sort((a, b) => a.v - b.v).slice(0, 3).filter(x => x.v < 12.5);
    const band = score >= 80 ? ['Strong', 'You’re ahead of most businesses. A few tweaks will keep you there.'] :
      score >= 50 ? ['Getting there', 'The basics are in place, but customers are slipping through the gaps.'] :
      ['At risk', 'Customers are finding your competitors first. The good news: the fixes are clear.'];
    body.hidden = true; res.hidden = false;
    res.innerHTML = '<div class="q-score"><span class="q-num" id="qNum">0</span><span class="q-of">/ 100</span></div>' +
      '<p class="q-band t-display">' + band[0] + '</p><p class="q-sum">' + band[1] + '</p>' +
      (weak.length ? '<h3 class="q-tips-h">Fix these first</h3><ol class="q-tips">' + weak.map(x => '<li>' + Q[x.n].tip + '</li>').join('') + '</ol>' : '') +
      '<form class="q-form" id="qForm" novalidate><input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none">' +
      '<p class="q-cta">Want the full report and a plan for your business? Leave your WhatsApp and we’ll send it.</p>' +
      '<div class="field"><label for="q-wa">WhatsApp number</label><input class="input" id="q-wa" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="+974 …"><p class="err">Please add your WhatsApp number.</p></div>' +
      '<div class="field"><label for="q-site">Business name or website <span class="opt">(optional)</span></label><input class="input" id="q-site" name="website" type="text" placeholder="yourbusiness.qa"></div>' +
      '<div class="field field-consent"><label class="consent-lbl"><input type="checkbox" id="q-consent" required><span>I agree ForgeHype may contact me about my results. <a class="link" href="privacy.html">Privacy Policy</a></span></label></div>' +
      '<button class="btn btn-primary" type="submit">Send me the full report →</button></form>' +
      '<p class="q-alt">Or <a class="link" href="free-check.html">get a free check of your website</a>.</p>';
    /* count up */
    const n = res.querySelector('#qNum'), t0 = performance.now();
    const tick = now => { const k = Math.min(1, (now - t0) / 900); n.textContent = Math.round(score * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    res.classList.add('q-in');
    res.tabIndex = -1; res.focus({ preventScroll: true });
    quiz.scrollIntoView({ block: 'start', behavior: 'smooth' });
    const f = res.querySelector('#qForm');
    f.addEventListener('submit', e => {
      e.preventDefault();
      const wa = f.querySelector('#q-wa'), c = f.querySelector('#q-consent');
      let ok = true;
      if (!wa.value.trim()) { wa.closest('.field').classList.add('invalid'); ok = false; } else wa.closest('.field').classList.remove('invalid');
      if (!c.checked) { c.closest('.field').classList.add('invalid'); ok = false; } else c.closest('.field').classList.remove('invalid');
      if (!ok) return;
      const detail = answers.map((k, m) => (m + 1) + '. ' + Q[m].a[k][0]).join(' | ');
      send({ source: 'Growth Score', type: 'Score ' + score + ' (' + band[0] + ')', website: f.querySelector('#q-site').value.trim(), whatsapp: wa.value.trim(), online: detail, consent: 'yes', botcheck: f.botcheck.checked ? '1' : '' });
      f.outerHTML = '<p class="q-thanks">Thanks. We’ll send your full report on WhatsApp within one working day.</p>';
    });
  };
  show();
})();
