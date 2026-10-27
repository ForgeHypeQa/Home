/* ForgeHype analytics + cookie consent.
   OFF until launch: put the GA4 Measurement ID (G-XXXXXXXXXX) in GA_ID below.
   With GA_ID empty, nothing loads and no banner shows.
   Google Analytics loads only after the visitor taps "Accept". The choice is remembered on that device. */
(() => {
  const GA_ID = location.hostname === 'forgehype.qa' ? 'G-0QGMWTDB54' : '';   // only the live domain is measured, never the test site
  if (!GA_ID) {
    document.addEventListener('click', e => { if (e.target.closest('[data-cookie-settings]')) e.preventDefault(); });
    return;
  }

  const KEY = 'fh-consent';
  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const save = v => { try { localStorage.setItem(KEY, v); } catch (e) {} };
  const base = document.currentScript ? document.currentScript.src.replace(/assets\/js\/analytics\.js.*$/, '') : '';

  const loadGA = () => {
    if (window.gtag) return;
    const s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  };

  const choice = read();
  if (choice === 'yes') { loadGA(); }
  const showBar = () => {
    if (document.getElementById('consentBar')) return;
    const bar = document.createElement('div');
    bar.className = 'consent'; bar.id = 'consentBar';
    bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Cookie choice');
    bar.innerHTML = '<p>We use cookies to see how visitors use this site, so we can improve it. <a class="link" href="' + base + 'privacy.html">Privacy policy</a></p>' +
      '<div class="consent-btns"><button type="button" class="btn btn-ghost" data-c="no">Decline</button><button type="button" class="btn btn-primary" data-c="yes">Accept</button></div>';
    bar.addEventListener('click', e => {
      const b = e.target.closest('[data-c]'); if (!b) return;
      save(b.dataset.c); if (b.dataset.c === 'yes') loadGA();
      bar.remove();
    });
    document.body.appendChild(bar);
  };
  if (!choice) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBar); else showBar();
  }
  /* lead actions as GA4 events (sent only if the visitor accepted) */
  const ev = (name, params) => { if (window.gtag) gtag('event', name, params || {}); };
  window.fhTrack = ev;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a) return;
    const h = a.getAttribute('href');
    if (h.startsWith('https://wa.me')) ev('whatsapp_click', { link_url: h });
    else if (h.startsWith('tel:')) ev('phone_click', { link_url: h });
    else if (h.startsWith('mailto:')) ev('email_click', { link_url: h });
  });
  /* any link or button with data-cookie-settings reopens the choice */
  document.addEventListener('click', e => {
    if (e.target.closest('[data-cookie-settings]')) { e.preventDefault(); try { localStorage.removeItem(KEY); } catch (x) {} showBar(); }
  });
})();
