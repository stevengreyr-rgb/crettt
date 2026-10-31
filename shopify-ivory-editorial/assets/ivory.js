(() => {
  const init = () => document.querySelectorAll('[data-iv-choices]').forEach(root => {
    if (root.dataset.ivReady) return;
    root.dataset.ivReady = 'true';
    const cards = [...root.querySelectorAll('[data-iv-card]')];
    const button = root.querySelector('[data-iv-add]');
    const selected = () => cards.find(card => card.querySelector('[data-iv-radio]').checked);
    const amount = text => Number(text.replace(/[^\d.]/g, '')) || 0;
    // Floating add-to-bag bar: follows the screen once the main button is out of view and mirrors the chosen ritual.
    const bar = document.createElement('div');
    bar.className = 'iv-bar';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<button type="button" class="iv-bar__info" tabindex="-1" aria-label="See your ritual"><span class="iv-bar__img"><img alt=""></span><span class="iv-bar__t"><b></b><span><s></s> <em></em></span></span></button><button type="button" class="iv-bar__btn" tabindex="-1"><span>' + button.querySelector('span').textContent + '</span></button>';
    document.body.append(bar);
    const barBtn = bar.querySelector('.iv-bar__btn');
    const barLabel = barBtn.querySelector('span').textContent;
    barBtn.addEventListener('click', () => button.click());
    bar.querySelector('.iv-bar__info').addEventListener('click', () => (selected() || root).scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
    const paintBar = (card, now, was) => {
      const img = card.querySelector('.iv-choice__photo img');
      const thumb = bar.querySelector('.iv-bar__img');
      thumb.hidden = !img;
      if (img) bar.querySelector('img').src = img.currentSrc || img.src;
      // The single option reads as the product itself ("Booster Pro Wand"), not "Single product".
      const single = card.querySelector('[data-iv-radio]').value === 'single';
      bar.querySelector('b').textContent = single ? card.querySelector('.iv-choice__what').textContent.replace(/^1\s*×\s*/, '').trim() : card.querySelector('.iv-choice__copy strong').textContent;
      const em = bar.querySelector('em');
      if (em.textContent !== now.textContent) { em.textContent = now.textContent; em.classList.remove('is-tick'); void em.offsetWidth; em.classList.add('is-tick'); }
      bar.querySelector('s').textContent = was.hidden ? '' : was.textContent;
      barBtn.disabled = button.disabled;
      const busy = button.getAttribute('aria-busy') === 'true';
      if (barBtn.dataset.busy === 'true' && !busy && !button.disabled) {
        barBtn.classList.add('is-done'); barBtn.querySelector('span').textContent = 'Added ✓';
        setTimeout(() => { barBtn.classList.remove('is-done'); barBtn.querySelector('span').textContent = barLabel; }, 1800);
      }
      barBtn.dataset.busy = String(busy);
      barBtn.setAttribute('aria-busy', String(busy));
    };
    let barRaf = 0;
    const placeBar = () => {
      const r = button.getBoundingClientRect();
      const on = scrollY > 160 && (r.bottom < 0 || r.top > innerHeight);
      if (bar.classList.contains('is-on') === on) return;
      bar.classList.toggle('is-on', on);
      document.body.classList.toggle('iv-bar-on', on);
      bar.setAttribute('aria-hidden', String(!on));
      bar.querySelectorAll('button').forEach(b => b.tabIndex = on ? 0 : -1);
    };
    const queueBar = () => { cancelAnimationFrame(barRaf); barRaf = requestAnimationFrame(placeBar); };
    addEventListener('scroll', queueBar, { passive: true });
    addEventListener('resize', queueBar);
    const paint = () => {
      cards.forEach(card => {
        card.classList.toggle('is-selected', card === selected());
        const now = card.querySelector('[data-hb-kit-now]');
        const was = card.querySelector('[data-hb-kit-was]');
        const save = card.querySelector('[data-iv-saving]');
        const difference = amount(was.textContent) - amount(now.textContent);
        save.textContent = difference > 0 ? 'Save $' + difference.toFixed(2) : '';
      });
      const card = selected();
      if (!card) return;
      const now = card.querySelector('[data-hb-kit-now]');
      const was = card.querySelector('[data-hb-kit-was]');
      root.querySelector('[data-iv-now]').textContent = now.textContent;
      root.querySelector('[data-iv-was]').textContent = was.textContent;
      root.querySelector('[data-iv-was]').hidden = was.hidden;
      const source = card.querySelector('[data-hb-kit-add]');
      button.disabled = card.dataset.ivAvailable === 'false' || source.disabled;
      button.setAttribute('aria-busy', source.getAttribute('aria-busy') === 'true' ? 'true' : 'false');
      paintBar(card, now, was);
      const sticky = document.querySelector('[data-sk-sticky-btn]');
      if(sticky) { sticky.disabled = button.disabled; const price = sticky.querySelector('[data-sk-sticky-price]'); if(price) price.textContent = now.textContent; }
    };
    root.addEventListener('change', (e) => {
      paint();
      // The card that just opened shows its photo: keep it in view on small screens.
      if (e.target.matches('[data-iv-radio]')) {
        const card = e.target.closest('[data-iv-card]');
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        requestAnimationFrame(() => card.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }));
      }
    });
    // Tap a card's photo to see everything in it full screen.
    const zoom = root.querySelector('[data-iv-zoom-dialog]');
    if (zoom && zoom.showModal) {
      const img = zoom.querySelector('[data-iv-zoom-img]');
      const cap = zoom.querySelector('[data-iv-zoom-cap]');
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-iv-zoom]');
        if (!b) return;
        img.src = b.dataset.ivZoom;
        img.alt = b.dataset.ivZoomAlt || '';
        cap.textContent = b.dataset.ivZoomAlt || '';
        zoom.showModal();
      });
      zoom.addEventListener('click', (e) => { if (e.target === zoom || e.target === img) zoom.close(); });
    } else if (zoom) {
      root.addEventListener('click', (e) => { const b = e.target.closest('[data-iv-zoom]'); if (b) window.open(b.dataset.ivZoom, '_blank', 'noopener'); });
    }
    cards.forEach(card => {
      new MutationObserver(paint).observe(card.querySelector('[data-hb-kit-now]'), {childList:true,subtree:true,characterData:true});
      new MutationObserver(paint).observe(card.querySelector('[data-hb-kit-add]'), {attributes:true,attributeFilter:['disabled','aria-busy']});
      // The card photo follows the chosen finish / skincare: key = each select's value in slot order.
      const photo = card.querySelector('[data-iv-photos]');
      const swap = () => {
        if (!photo) return;
        let map; try { map = JSON.parse(photo.dataset.ivPhotos); } catch { return; }
        const key = [...card.querySelectorAll('select[data-slot]')].sort((a, b) => a.dataset.slot - b.dataset.slot).map(x => x.value).join('-');
        const hit = map[key]; if (!hit) return;
        const img = photo.querySelector('img');
        img.removeAttribute('srcset'); img.src = hit[0]; photo.dataset.ivZoom = hit[1];
      };
      card.querySelectorAll('select').forEach(select => select.addEventListener('change', () => {card.querySelector('[data-iv-radio]').checked = true; swap(); paint();}));
      swap();
    });
    // "What's inside" sits on the card photo instead of a list under it; the list stays for screen readers.
    const inside = card => {
      const photo = card.querySelector('.iv-choice__photo');
      const items = [...card.querySelectorAll('.iv-inside li:not(.iv-inside__off):not(.iv-inside__total)')];
      if (!photo || !items.length) return;
      card.classList.add('has-in');
      card.querySelector('.iv-inside').classList.add('iv-vh');
      const box = document.createElement('span');
      box.className = 'iv-in';
      box.setAttribute('aria-hidden', 'true');
      photo.append(box);
      const draw = () => {
        box.innerHTML = '';
        items.forEach(li => {
          const row = document.createElement('span');
          row.textContent = li.querySelector('span').textContent.replace(/^\s*1\s*×\s*/, '').replace(/Biodance |Hydro |Gel Toner |Booster Pro /g, '');
          if (/FREE/.test(li.querySelector('b').textContent)) { const f = document.createElement('em'); f.textContent = 'Free'; row.append(f); }
          box.append(row);
        });
      };
      draw();
      new MutationObserver(draw).observe(card.querySelector('.iv-inside'), { childList: true, characterData: true, subtree: true });
    };
    cards.forEach(inside);
    // The big gallery photo at the top follows the chosen card and combo, with what's inside on it.
    const hero = document.querySelector('[data-iv-hero]');
    if (hero) {
      const heroImg = hero.querySelector('img');
      const heroIn = document.createElement('span');
      heroIn.className = 'iv-in iv-in--hero';
      heroIn.setAttribute('aria-hidden', 'true');
      heroIn.hidden = true;
      hero.append(heroIn);
      let shown = heroImg && (heroImg.currentSrc || heroImg.src);
      let first = true;
      const follow = () => {
        const card = selected(); if (!card || !heroImg) return;
        const photo = card.querySelector('.iv-choice__photo');
        const src = photo && photo.dataset.ivZoom;
        const box = card.querySelector('.iv-choice__photo .iv-in');
        heroIn.innerHTML = box ? box.innerHTML : '';
        heroIn.hidden = !box;
        hero.classList.toggle('is-combo', !!box);
        // Same file at another size (the server-rendered first photo) counts as already shown.
        const file = u => (u || '').split('?')[0].split('/').pop();
        if (first) { first = false; if (file(src) === file(shown)) { shown = src; return; } }
        if (!src || src === shown) return;
        shown = src;
        hero.classList.add('is-swap');
        const done = () => hero.classList.remove('is-swap');
        heroImg.addEventListener('load', done, { once: true }); setTimeout(done, 900);
        heroImg.removeAttribute('srcset'); heroImg.removeAttribute('sizes'); heroImg.src = src;
        const track = hero.closest('[data-sk-gal-track]');
        if (track && track.scrollLeft) track.scrollTo({ left: 0, behavior: reduce() ? 'auto' : 'smooth' });
      };
      new MutationObserver(follow).observe(root, { subtree: true, attributes: true, attributeFilter: ['data-iv-zoom'] });
      root.addEventListener('change', () => requestAnimationFrame(follow));
      cards.forEach(c => { const b = c.querySelector('.iv-in'); if (b) new MutationObserver(follow).observe(b, { childList: true }); });
      follow();
    }
    button.addEventListener('click', () => selected()?.querySelector('[data-hb-kit-add]').click());
    paint();
    placeBar();
  });
  // LEZO light colors: tap a chip to read what that color is used for, in one short line.
  const lights = () => document.querySelectorAll('[data-iv-lights]').forEach(box => {
    if (box.dataset.ivReady) return;
    box.dataset.ivReady = 'true';
    const tip = box.querySelector('[data-iv-lights-tip]');
    box.addEventListener('click', e => {
      const b = e.target.closest('button[data-tip]');
      if (!b) return;
      box.querySelectorAll('button[data-tip]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      tip.innerHTML = '';
      const name = document.createElement('b');
      name.textContent = b.textContent.trim();
      tip.append(name, ' ' + b.dataset.tip);
    });
  });
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Finish / skincare dropdowns become tap targets: one button per option, with a color dot.
  // The hidden <select> stays the source of truth, so sk.js and the photo swap work unchanged.
  const swatch = t => /pink/i.test(t) ? '#f2c3cd' : /black/i.test(t) ? '#25211d' : /blue/i.test(t) ? '#a8c8e8' : '';
  const opts = () => document.querySelectorAll('.iv-choice select[data-slot]').forEach(select => {
    if (select.dataset.ivOpts) return;
    select.dataset.ivOpts = 'true';
    const label = select.id && document.querySelector('label[for="' + select.id + '"]');
    const group = document.createElement('div');
    group.className = 'iv-opts';
    group.setAttribute('role', 'radiogroup');
    if (label) { label.id = label.id || select.id + '-l'; group.setAttribute('aria-labelledby', label.id); }
    [...select.options].forEach(o => {
      const [name, sub] = o.textContent.split(/\s+[—·]\s+/);
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'iv-opt'; b.value = o.value; b.disabled = o.disabled;
      b.setAttribute('role', 'radio');
      const c = swatch(name);
      b.innerHTML = (c ? '<i style="--c:' + c + '"></i>' : '') + '<span><b></b>' + (sub ? '<small></small>' : '') + '</span>';
      b.querySelector('b').textContent = name.trim();
      if (sub) b.querySelector('small').textContent = sub.trim();
      group.append(b);
    });
    const sync = () => {
      group.querySelectorAll('.iv-opt').forEach(b => { const on = b.value === select.value; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
      // "What's inside" names the finish / skincare that was picked.
      select.closest('.iv-choice').querySelectorAll('[data-iv-slot="' + select.dataset.slot + '"][data-iv-names]').forEach(li => {
        let names; try { names = JSON.parse(li.dataset.ivNames); } catch { return; }
        const span = li.querySelector('span'); const name = names[+select.value];
        if (span && name && span.textContent !== name) { span.textContent = name; li.classList.remove('is-tick'); void li.offsetWidth; li.classList.add('is-tick'); }
      });
    };
    group.addEventListener('click', e => {
      const b = e.target.closest('.iv-opt');
      if (!b || b.disabled || b.value === select.value) return;
      const photo = select.closest('.iv-choice').querySelector('[data-iv-photos] img');
      if (photo) { photo.parentNode.classList.add('is-swap'); const done = () => photo.parentNode.classList.remove('is-swap'); photo.addEventListener('load', done, { once: true }); setTimeout(done, 700); }
      select.value = b.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    group.addEventListener('keydown', e => {
      if (!/^Arrow/.test(e.key)) return;
      const all = [...group.querySelectorAll('.iv-opt:not(:disabled)')];
      const i = all.indexOf(document.activeElement); if (i < 0) return;
      e.preventDefault();
      const next = all[(i + (/Right|Down/.test(e.key) ? 1 : -1) + all.length) % all.length];
      next.click(); next.focus();
    });
    select.addEventListener('change', sync);
    select.classList.add('iv-vh');
    select.tabIndex = -1;
    select.after(group);
    sync();
  });
  // Main "Add to cart": price pill ticks on change, the button confirms "Added ✓" like the floating bar.
  const addFeedback = () => document.querySelectorAll('[data-iv-add]').forEach(btn => {
    if (btn.dataset.ivFx) return;
    btn.dataset.ivFx = 'true';
    const label = btn.querySelector('span');
    const text = label.textContent;
    const now = btn.querySelector('[data-iv-now]');
    let busy = false;
    new MutationObserver(() => {
      const b = btn.getAttribute('aria-busy') === 'true';
      if (busy && !b && !btn.disabled) {
        btn.classList.add('is-done'); label.textContent = 'Added ✓';
        setTimeout(() => { btn.classList.remove('is-done'); label.textContent = text; }, 1800);
      }
      busy = b;
    }).observe(btn, { attributes: true, attributeFilter: ['aria-busy'] });
    let last = now.textContent;
    new MutationObserver(() => {
      if (now.textContent === last) return;
      last = now.textContent;
      now.classList.remove('is-tick'); void now.offsetWidth; now.classList.add('is-tick');
    }).observe(now, { childList: true, characterData: true, subtree: true });
  });
  // Accordions open and close by sliding instead of snapping.
  const smooth = () => document.querySelectorAll('.iv-faq details, .hb-acc details').forEach(d => {
    if (d.dataset.ivSmooth) return;
    d.dataset.ivSmooth = 'true';
    const s = d.querySelector('summary');
    const body = document.createElement('div');
    body.className = 'iv-acc';
    [...d.childNodes].filter(n => n !== s).forEach(n => body.append(n));
    d.append(body);
    if (!body.animate) return;
    let run = null;
    s.addEventListener('click', e => {
      if (reduce()) return;
      e.preventDefault();
      if (run) run.cancel();
      body.style.overflow = 'hidden';
      const end = () => { body.style.overflow = ''; run = null; };
      if (d.open) {
        d.classList.add('is-closing');
        run = body.animate([{ height: body.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 600, easing: 'cubic-bezier(.4,0,.2,1)' });
        run.onfinish = () => { d.open = false; d.classList.remove('is-closing'); end(); };
      } else {
        d.open = true;
        run = body.animate([{ height: '0px', opacity: 0, transform: 'translateY(-6px)' }, { height: body.offsetHeight + 'px', opacity: 1, transform: 'none' }], { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)' });
        run.onfinish = end;
      }
    });
  });
  // Scroll reveal: blocks below the fold rise in slowly as they reach the screen, a few at a time.
  const REVEAL = '.hb-story figure, .hb-story__grid > div > *, .iv-choices > h2, .iv-choice, .iv-add, .iv-checknote, .hb-acc details, .hb-rows, .iv-lights, .iv-faq > h2, .iv-faq details, .iv-faq__cta, .hb-news, .hb-foot__top > div, .hb-foot__base';
  let io = null;
  const reveal = () => {
    if (reduce() || !('IntersectionObserver' in window)) return;
    io = io || new IntersectionObserver(es => {
      es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top).forEach((e, i) => {
        const el = e.target;
        io.unobserve(el);
        el.style.setProperty('--iv-d', Math.min(i, 6) * 130 + 'ms');
        el.classList.add('is-in');
        el.addEventListener('transitionend', function done(t) {
          if (t.target !== el || t.propertyName !== 'transform') return;
          el.removeEventListener('transitionend', done);
          el.classList.remove('iv-rv', 'is-in'); el.style.removeProperty('--iv-d');
        });
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll(REVEAL).forEach(el => {
      if (el.dataset.ivRv) return;
      el.dataset.ivRv = 'true';
      if (el.getBoundingClientRect().top < innerHeight * .9) return;
      el.classList.add('iv-rv');
      io.observe(el);
    });
    // The editorial banners keep their own reveal; once in, they get their quick hover back.
    document.querySelectorAll('.sc-ed__b').forEach(b => b.addEventListener('transitionend', t => { if (t.propertyName === 'transform' && b.classList.contains('is-in')) b.classList.add('iv-settled'); }));
  };
  const all = () => { init(); lights(); opts(); addFeedback(); smooth(); reveal(); };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', all); else all();
  document.addEventListener('shopify:section:load', all);
})();
