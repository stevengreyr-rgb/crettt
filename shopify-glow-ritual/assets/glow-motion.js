/* Glow Ritual Set: motion layer (Nov 1).
   - Headlines rise word by word; eyebrows settle their tracking.
   - Blocks below the fold rise in as they reach the screen, staggered a few at a time.
   - Photos open like a curtain; light beams draw down into the skin.
   - FAQ / specs accordions slide instead of snapping.
   Everything is skipped with reduced motion; nothing is hidden if this file never runs
   (the CSS has a 2.6 s safety reveal for the first screen). */
(() => {
  const html = document.documentElement;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm || !('IntersectionObserver' in window)) { html.classList.remove('gm-js'); return; }

  const HEAD = '.gr-h1, .gr-h2, .gl-h, .hb-news__h, .gr-quote';
  const EYE = '.gr-eye, .gl-eye';
  const BLOCK = [
    '.gr-sec > .gr-sub', '.gr-steps > li', '.gr-specs', '.gr-tr', '.gr-safe > div',
    '.gr-faq', '.gr-sec > .gr-fine', '.gl-sub', '.gl-labels > button', '.gl-tip', '.gl-combo', '.gl-fine'
  ].join(',');
  const IMG = '.gr-rit__ph, .gr-ed__b';

  // Split a heading into words, keeping <em>, <br> and other inline elements in place.
  const split = (el) => {
    if (el.dataset.gmSplit) return;
    el.dataset.gmSplit = '1';
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { frag.append(document.createTextNode(' ')); return; }
            const o = document.createElement('span');
            o.className = 'gm-w';
            const inner = document.createElement('span');
            inner.textContent = w;
            inner.style.setProperty('--w', i++);
            o.append(inner);
            frag.append(o);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('gm-w')) {
          walk(n);
        }
      });
    };
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    el.querySelectorAll('.gm-w').forEach((w) => w.setAttribute('aria-hidden', 'true'));
    el.classList.add('gm-split');
  };

  // Elements with a reveal finish → drop the helper classes so their own hover transitions return.
  const settle = (el, ms) => setTimeout(() => {
    el.classList.remove('gm-rv', 'gm-img', 'gm-in');
    el.style.removeProperty('--d');
  }, ms);

  const io = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
      .forEach((e, n) => {
        const el = e.target;
        io.unobserve(el);
        const d = Math.min(n, 6) * 110;
        el.style.setProperty('--d', d + 'ms');
        requestAnimationFrame(() => el.classList.add('gm-in'));
        if (el.classList.contains('gm-rv')) settle(el, 1500 + d);
        if (el.classList.contains('gm-img')) settle(el, 2200 + d);
      });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });

  const below = (el) => el.getBoundingClientRect().top > innerHeight * 0.92;

  // First screen: a short choreographed entrance instead of scroll triggers.
  const hero = () => {
    const top = document.querySelector('.gr-top');
    if (!top) { html.classList.remove('gm-js'); return; }
    const gal = top.querySelector('.gr-gal');
    const eye = top.querySelector('.gr-eye');
    const h1 = top.querySelector('.gr-h1');
    if (gal) gal.classList.add('gm-hero');
    if (eye) eye.classList.add('gm-eye');
    if (h1) { split(h1); h1.style.setProperty('--d', '120ms'); }
    const seq = [...top.querySelectorAll('.gr-sub, .gr-price, .gr-pay, .gr-form > .gr-step, .gr-sum, .gr-cta, .gr-eta, .gr-trust, .gr-5')];
    requestAnimationFrame(() => requestAnimationFrame(() => {
      gal && gal.classList.add('gm-in');
      eye && eye.classList.add('gm-in');
      h1 && h1.classList.add('gm-in');
      seq.forEach((el, i) => {
        // Items far below the first screen just appear; the ones in view cascade.
        el.style.setProperty('--d', (below(el) ? 0 : 380 + Math.min(i, 8) * 90) + 'ms');
        el.classList.add('gm-in');
      });
    }));
    // Hand control back to the page's own hover / press transitions.
    setTimeout(() => {
      html.classList.remove('gm-js');
      seq.forEach((el) => { el.classList.remove('gm-in'); el.style.removeProperty('--d'); });
    }, 2400);
  };

  const arm = () => {
    document.querySelectorAll(HEAD).forEach((el) => {
      if (el.closest('.gr-top') || el.dataset.gmArm) return;
      el.dataset.gmArm = '1';
      split(el);
      if (below(el)) io.observe(el); else el.classList.add('gm-in');
    });
    document.querySelectorAll(EYE).forEach((el) => {
      if (el.closest('.gr-top') || el.dataset.gmArm) return;
      el.dataset.gmArm = '1';
      if (!below(el)) return;
      el.classList.add('gm-eye');
      io.observe(el);
    });
    document.querySelectorAll(BLOCK).forEach((el) => {
      if (el.dataset.gmArm) return;
      el.dataset.gmArm = '1';
      if (!below(el)) return;
      el.classList.add('gm-rv');
      io.observe(el);
    });
    document.querySelectorAll(IMG).forEach((el) => {
      if (el.dataset.gmArm) return;
      el.dataset.gmArm = '1';
      if (!below(el)) return;
      el.classList.add('gm-img');
      io.observe(el);
    });
    const art = document.querySelector('.gl-art');
    if (art && !art.dataset.gmArm) {
      art.dataset.gmArm = '1';
      if (below(art)) { art.classList.add('gm-arm'); io.observe(art); }
    }
  };

  // Light picker: the explanation line cross-fades when a light is tapped.
  const tip = document.querySelector('[data-gl-tip]');
  if (tip) {
    let last = tip.innerHTML;
    new MutationObserver(() => {
      if (tip.innerHTML === last) return;
      last = tip.innerHTML;
      tip.classList.remove('gm-swap'); void tip.offsetWidth; tip.classList.add('gm-swap');
    }).observe(tip, { childList: true, subtree: true });
  }

  // FAQ + specs: slide open and closed.
  const accordions = () => document.querySelectorAll('.gr-faq, .gr-specs').forEach((d) => {
    if (d.dataset.gmAcc) return;
    d.dataset.gmAcc = '1';
    const s = d.querySelector('summary');
    if (!s) return;
    const body = document.createElement('div');
    body.className = 'gm-acc';
    [...d.childNodes].filter((n) => n !== s).forEach((n) => body.append(n));
    d.append(body);
    if (!body.animate) return;
    let run = null;
    s.addEventListener('click', (e) => {
      e.preventDefault();
      if (run) run.cancel();
      if (d.open) {
        run = body.animate([{ height: body.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 480, easing: 'cubic-bezier(.4,0,.2,1)' });
        run.onfinish = () => { d.open = false; run = null; };
      } else {
        d.open = true;
        run = body.animate([{ height: '0px', opacity: 0, transform: 'translateY(-6px)' }, { height: body.offsetHeight + 'px', opacity: 1, transform: 'none' }], { duration: 720, easing: 'cubic-bezier(.16,1,.3,1)' });
        run.onfinish = () => { run = null; };
      }
    });
  });

  const start = () => { hero(); arm(); accordions(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  document.addEventListener('shopify:section:load', () => { arm(); accordions(); });
  addEventListener('pagehide', () => io.disconnect(), { once: true });
})();
