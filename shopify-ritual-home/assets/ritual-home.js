/* LEZO Skin Ritual home: bag drawer on the Ajax Cart API.
   Buy 1 Get 1 runs as automatic discounts; ritual bundles apply code RITUAL20. */
(() => {
  'use strict';
  const root = document.getElementById('RitualHome');
  if (!root) return;
  document.documentElement.classList.add('rh-js');

  const CODE = root.dataset.code || 'RITUAL20';
  const RITUAL_PRODUCTS = [10372429086939, 10379096785115, 10372418928859, 10378972561627];
  const drawer = root.querySelector('[data-rh-drawer]');
  const panel = drawer.querySelector('.rh-drawer__panel');
  const linesEl = drawer.querySelector('[data-rh-lines]');
  const footEl = drawer.querySelector('[data-rh-foot]');
  const toastEl = root.querySelector('[data-rh-toast]');
  const countEls = root.querySelectorAll('[data-rh-count]');
  const currency = (window.Shopify && Shopify.currency && Shopify.currency.active) || 'USD';
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency });
  const money = (cents) => fmt.format((cents || 0) / 100);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let cart = window.RH_CART || null;
  let lastFocus = null;
  let toastTimer = 0;

  const api = async (url, body) => {
    const res = await fetch(url, body ? { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) } : { headers: { Accept: 'application/json' } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.description || data.message || 'Something went wrong. Please try again.');
    return data;
  };

  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2800);
  };

  const hasCode = () => (cart?.discount_codes || []).some((d) => String(d.code).toUpperCase() === CODE);
  const ritualCount = () => (cart?.items || []).filter((i) => RITUAL_PRODUCTS.includes(i.product_id)).reduce((n, i) => n + i.quantity, 0);

  async function applyCode() {
    try {
      cart = await api('/cart/update.js', { discount: CODE });
    } catch {
      // Older carts: the /discount route stores the code for checkout.
      await fetch(`/discount/${encodeURIComponent(CODE)}?redirect=/cart.js`).catch(() => {});
      cart = await api('/cart.js');
    }
  }

  async function refresh() {
    cart = await api('/cart.js');
    render();
  }

  function render() {
    const count = cart?.item_count || 0;
    countEls.forEach((el) => {
      if (el.textContent !== String(count)) {
        el.textContent = count;
        el.classList.remove('is-bump');
        void el.offsetWidth;
        el.classList.add('is-bump');
      }
    });
    if (!cart || !cart.items.length) {
      linesEl.innerHTML = '<div class="rh-empty"><p>Your bag is empty.</p><a class="rh-btn" href="#offers" data-rh-close>Shop Buy 1 Get 1 <span aria-hidden="true">→</span></a></div>';
      footEl.innerHTML = '';
      return;
    }
    linesEl.innerHTML = cart.items.map((item) => {
      const deal = (item.line_level_discount_allocations || []).map((a) => a.discount_application?.title).filter(Boolean)[0];
      const img = item.image ? `${item.image}${item.image.includes('?') ? '&' : '?'}width=160` : '';
      const variant = item.variant_title && item.variant_title !== 'Default Title' ? `<p class="rh-line__variant">${esc(item.variant_title)}</p>` : '';
      const original = item.original_line_price > item.final_line_price ? `<s>${money(item.original_line_price)}</s>` : '';
      return `<div class="rh-line">
        ${img ? `<img src="${esc(img)}" width="76" height="76" alt="" loading="lazy">` : '<span></span>'}
        <div><h3>${esc(item.product_title)}</h3>${variant}${deal ? `<p class="rh-line__deal">${esc(deal.split('·').pop().trim())}</p>` : ''}
          <div class="rh-qty" role="group" aria-label="Quantity for ${esc(item.product_title)}">
            <button type="button" data-rh-qty="${esc(item.key)}" data-q="${item.quantity - 1}" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-rh-qty="${esc(item.key)}" data-q="${item.quantity + 1}" aria-label="Increase quantity">+</button>
          </div></div>
        <p class="rh-line__price">${original}${money(item.final_line_price)}</p>
      </div>`;
    }).join('');

    const saved = cart.original_total_price - cart.total_price;
    const nudge = ritualCount() >= 3 && !hasCode()
      ? `<div class="rh-nudge"><span>You qualify for The Whole Ritual: 20% off.</span><button type="button" data-rh-apply>Apply ${CODE}</button></div>` : '';
    const codeTag = hasCode() ? `<p class="rh-code">Code ${CODE} applied${(cart.discount_codes || []).some((d) => d.code.toUpperCase() === CODE && !d.applicable) ? ' — add 3 ritual items to unlock' : ''}</p>` : '';
    footEl.innerHTML = `${nudge}${codeTag}
      <div class="rh-sum"><span>Subtotal</span><span>${money(cart.original_total_price)}</span></div>
      ${saved > 0 ? `<div class="rh-sum rh-sum--save"><span>You save</span><span>−${money(saved)}</span></div>` : ''}
      <div class="rh-sum rh-sum--total"><span>Total</span><span>${money(cart.total_price)}</span></div>
      <a class="rh-btn" href="/checkout">Secure checkout <span aria-hidden="true">→</span></a>
      <small>Free US shipping · 30-day returns · Taxes calculated at checkout</small>`;
  }

  function open() {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    panel.focus();
  }
  function close() {
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { drawer.hidden = true; }, 450);
    lastFocus?.focus?.();
  }

  root.addEventListener('click', async (e) => {
    const t = e.target.closest('button, a');
    if (!t) return;
    if (t.matches('[data-rh-open]')) { e.preventDefault(); render(); open(); return; }
    if (t.matches('[data-rh-close]')) { if (t.tagName === 'BUTTON') e.preventDefault(); close(); return; }
    if (t.matches('[data-rh-add]')) {
      e.preventDefault();
      t.setAttribute('aria-busy', 'true');
      try {
        await api('/cart/add.js', { items: JSON.parse(t.dataset.rhAdd) });
        if (t.hasAttribute('data-rh-code')) await applyCode();
        await refresh();
        open();
        toast(t.hasAttribute('data-rh-code') ? 'Ritual added — 20% off applied.' : 'Added to your bag.');
      } catch (err) { toast(err.message); }
      t.removeAttribute('aria-busy');
      return;
    }
    if (t.matches('[data-rh-qty]')) {
      try { cart = await api('/cart/change.js', { id: t.dataset.rhQty, quantity: Math.max(0, +t.dataset.q) }); render(); }
      catch (err) { toast(err.message); }
      return;
    }
    if (t.matches('[data-rh-apply]')) {
      try { await applyCode(); render(); toast('20% off applied.'); } catch (err) { toast(err.message); }
    }
  });

  root.addEventListener('change', (e) => {
    const input = e.target.closest('[data-rh-ritual] input[type="radio"], [data-rh-pick] input[type="radio"]');
    if (!input) return;
    const card = input.closest('[data-rh-ritual], [data-rh-pick]');
    const { items, price, total, save, img } = input.dataset;
    const set = (sel, value) => { const el = card.querySelector(sel); if (el && value) el.textContent = value; };
    card.querySelector('[data-rh-add]').dataset.rhAdd = items;
    set('[data-rh-price]', price);
    set('[data-rh-total]', total);
    set('[data-rh-save]', save);
    const pic = card.querySelector('[data-rh-img]');
    if (pic && img) pic.src = img;
  });

  document.addEventListener('keydown', (e) => {
    if (drawer.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = [...panel.querySelectorAll('a[href], button:not([disabled])')];
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });

  // Gentle reveal for cards and panels as they scroll in.
  const targets = root.querySelectorAll('.rh-panel, .rh-step, .rh-card, .rh-ritual, .rh-routine__grid li, .rh-head');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    targets.forEach((el, i) => { el.dataset.rhReveal = ''; el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });
  }

  render();
})();
