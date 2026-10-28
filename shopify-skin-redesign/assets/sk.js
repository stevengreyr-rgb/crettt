/* SEVENCRUSH skin — cart drawer, bundle builder, product landing and LED explorer.
   Plain JS, no dependencies. Uses Shopify's Ajax Cart API; checkout stays native. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
  const ELIGIBLE = [10372429086939, 10379096785115, 10378972561627]; // LEZO, Booster Pro, Biodance
  // Short names for the drawer; checkout keeps the full Shopify titles.
  const NAMES = { 10372429086939: 'LEZO 7-Color LED Mask', 10379096785115: 'Booster Pro LED Wand', 10378972561627: 'Biodance Collagen', 10372418928859: 'LED Face & Neck Massager' };
  const VNAMES = { 50956618858715: 'Collagen Gel Toner Pads · pink', 50956618891483: 'Collagen Ampoule · pink', 50956618629339: 'Cera-Nol Gel Toner Pads · blue', 50956618825947: 'Hydro Cera-Nol Ampoule · blue' };
  const PAIRS = { 50956618858715: 50956618891483, 50956618629339: 50956618825947 }; // pads → matching ampoule
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function money(cents, format = window.SK_MONEY || '${{amount}}') {
    const n = Number(cents) / 100;
    const fmt = (d, t = ',', dec = '.') => {
      const [i, f] = n.toFixed(d).split('.');
      return i.replace(/\B(?=(\d{3})+(?!\d))/g, t) + (f ? dec + f : '');
    };
    return format.replace(/\{\{\s*(\w+)\s*\}\}/, (_, k) => ({
      amount: fmt(2), amount_no_decimals: fmt(0), amount_with_comma_separator: fmt(2, '.', ','),
      amount_no_decimals_with_comma_separator: fmt(0, '.', ','), amount_with_apostrophe_separator: fmt(2, "'")
    }[k] ?? fmt(2)));
  }

  /* ---------------- Cart ---------------- */
  let cart = window.SK_CART || null;
  let busy = false;
  let lastFocus = null;

  async function api(path, body) {
    const res = await fetch(root + path, body ? {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body)
    } : { headers: { Accept: 'application/json' } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.description || data.message || 'Something went wrong. Please try again.');
    return data;
  }
  const refresh = async () => { cart = await api('cart.js'); paintCount(); return cart; };

  function paintCount() {
    if (!cart) return;
    $$('[data-sk-count], .cart-count').forEach((el) => { el.textContent = cart.item_count; });
  }

  async function addItems(items, { open = true } = {}) {
    await api('cart/add.js', { items });
    await refresh();
    if (open) openCart(); else renderCart();
    document.dispatchEvent(new CustomEvent('sk:cart', { detail: cart }));
  }

  const drawer = () => $('#sk-cart');

  function renderCart() {
    const d = drawer();
    if (!d || !cart) return;
    const body = $('[data-sk-cart-body]', d), foot = $('[data-sk-cart-foot]', d);
    $('[data-sk-cart-n]', d).textContent = cart.item_count ? `(${cart.item_count})` : '';
    if (!cart.item_count) {
      body.innerHTML = `<div class="sk-cart__empty"><p>Your cart is empty.</p><a class="sk-btn" href="${root}#sk-shop" data-sk-cart-close>Shop the line-up</a></div>`;
      foot.hidden = true;
      return;
    }
    body.innerHTML = cart.items.map((it) => {
      const discounted = it.final_line_price < it.original_line_price;
      const names = (it.line_level_discount_allocations || []).map((a) => a.discount_application && a.discount_application.title).filter(Boolean);
      const img = it.featured_image && it.featured_image.url ? it.featured_image.url : it.image;
      const src = img ? img + (img.includes('?') ? '&' : '?') + 'width=200' : '';
      const variant = VNAMES[it.variant_id || it.id] || (it.variant_title && it.variant_title !== 'Default Title' ? it.variant_title : '');
      const title = NAMES[it.product_id] || it.product_title;
      const bundle = it.properties && it.properties._bundle ? it.properties._bundle : '';
      return `<div class="sk-line" data-key="${esc(it.key)}">
        ${src ? `<img src="${esc(src)}" alt="" width="84" height="84" loading="lazy">` : '<span></span>'}
        <div>
          <div class="sk-line__row" style="margin:0;align-items:flex-start">
            <div><a class="sk-line__t" href="${esc(it.url)}">${esc(title)}</a>
              ${variant ? `<div class="sk-line__v">${esc(variant)}</div>` : ''}
              ${bundle ? `<div class="sk-line__v">${esc(bundle)}</div>` : ''}
              ${names.length ? `<div class="sk-line__d">${esc(names.join(' · '))}</div>` : ''}</div>
            <div class="sk-line__p">${discounted ? `<s>${money(it.original_line_price)}</s>` : ''}${money(it.final_line_price)}</div>
          </div>
          <div class="sk-line__row">
            <div class="sk-qty">
              <button type="button" data-sk-line="-1" aria-label="Decrease quantity of ${esc(title)}">−</button>
              <input type="number" value="${it.quantity}" min="0" max="99" aria-label="Quantity of ${esc(title)}" data-sk-line-input>
              <button type="button" data-sk-line="1" aria-label="Increase quantity of ${esc(title)}">+</button>
            </div>
            <button type="button" class="sk-line__rm" data-sk-line-rm>Remove</button>
          </div>
        </div>
      </div>`;
    }).join('');
    foot.hidden = false;
    const off = cart.original_total_price - cart.total_price;
    $('[data-sk-cart-orig]', d).textContent = money(cart.original_total_price);
    $('[data-sk-cart-total]', d).textContent = money(cart.total_price);
    const offRow = $('[data-sk-cart-offrow]', d);
    offRow.hidden = off <= 0;
    if (off > 0) {
      const titles = new Set();
      cart.items.forEach((it) => (it.line_level_discount_allocations || []).forEach((a) => a.discount_application && titles.add(a.discount_application.title)));
      (cart.cart_level_discount_applications || []).forEach((a) => titles.add(a.title));
      $('[data-sk-cart-offname]', d).textContent = titles.size ? [...titles].join(' · ') : 'Discounts';
      $('[data-sk-cart-off]', d).textContent = '−' + money(off);
    }
    const eligible = cart.items.reduce((n, it) => n + (ELIGIBLE.includes(it.product_id) ? it.quantity : 0), 0);
    const hint = $('[data-sk-cart-hint]', d);
    hint.hidden = true;
    if (eligible === 1) {
      hint.textContent = 'Add one more of the LEZO mask, Booster Pro or a Biodance step and 20% comes off both at checkout.';
      hint.hidden = false;
    } else if (eligible >= 2 && off <= 0) {
      hint.textContent = 'Your bundle saving of 20% is applied at checkout.';
      hint.hidden = false;
    }
  }

  async function changeLine(key, quantity) {
    if (busy) return;
    busy = true;
    const d = drawer();
    d.setAttribute('aria-busy', 'true');
    try {
      cart = await api('cart/change.js', { id: key, quantity });
      paintCount();
      renderCart();
      if (!d.contains(document.activeElement)) { const x = $('.sk-x', d); x && x.focus(); }
    } catch (e) {
      $('[data-sk-cart-msg]', d).textContent = e.message;
    } finally {
      busy = false;
      d.removeAttribute('aria-busy');
    }
  }

  function openCart() {
    const d = drawer();
    if (!d) { location.href = root + 'cart'; return; }
    lastFocus = document.activeElement;
    renderCart();
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => { const x = $('.sk-x', d); x && x.focus(); }, 50);
    refresh().then(renderCart).catch(() => {});
  }
  function closeCart() {
    const d = drawer();
    if (!d || !d.classList.contains('is-open')) return;
    d.classList.remove('is-open');
    d.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    lastFocus && lastFocus.focus && lastFocus.focus();
  }

  function bindCart() {
    const d = drawer();
    if (!d) return;
    d.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('[data-sk-cart-close]')) { closeCart(); return; }
      const line = t.closest('.sk-line');
      if (!line) return;
      const input = $('[data-sk-line-input]', line);
      if (t.closest('[data-sk-line]')) changeLine(line.dataset.key, Math.max(0, Number(input.value) + Number(t.closest('[data-sk-line]').dataset.skLine)));
      if (t.closest('[data-sk-line-rm]')) changeLine(line.dataset.key, 0);
    });
    d.addEventListener('change', (e) => {
      if (e.target.matches('[data-sk-line-input]')) changeLine(e.target.closest('.sk-line').dataset.key, Math.max(0, Math.min(99, parseInt(e.target.value, 10) || 0)));
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });
    d.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = $$('a[href],button:not([disabled]),input', $('.sk-cart__panel', d)).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    document.addEventListener('click', (e) => {
      const o = e.target.closest('[data-sk-cart-open]');
      if (o) { e.preventDefault(); openCart(); }
    });
  }

  /* Quick add buttons (home cards). data-sk-add='[{"id":1,"quantity":1}]' */
  function bindQuickAdd() {
    document.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-sk-add]');
      if (!b || b.disabled) return;
      e.preventDefault();
      const label = b.textContent;
      b.setAttribute('aria-busy', 'true');
      b.disabled = true;
      try {
        await addItems(JSON.parse(b.dataset.skAdd));
      } catch (err) {
        b.textContent = 'Try again';
        setTimeout(() => { b.textContent = label; }, 2500);
        console.warn(err);
      } finally {
        b.disabled = false;
        b.removeAttribute('aria-busy');
      }
    });
  }

  /* ---------------- Bundles ---------------- */
  function initBundle(el) {
    let data;
    try { data = JSON.parse($('[data-sk-bundle-data]', el).textContent); } catch { return; }
    const pick = {}; // product key → variant id
    Object.entries(data.products).forEach(([k, p]) => {
      const v = p.variants.find((x) => x.available) || p.variants[0];
      if (v) pick[k] = v.id;
    });
    let current = data.bundles.find((b) => b.key === el.dataset.selected) || data.bundles[0];
    const tabs = $$('.sk-tab', el);
    const items = $('[data-sk-bitems]', el);
    const btn = $('[data-sk-badd]', el);
    const msg = $('[data-sk-bmsg]', el);
    const variantOf = (k) => data.products[k].variants.find((v) => v.id === pick[k]) || data.products[k].variants[0];

    function paint() {
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.key === current.key)));
      items.style.setProperty('--n', current.items.length);
      items.innerHTML = current.items.map((k) => {
        const p = data.products[k], v = variantOf(k);
        const select = p.variants.length > 1
          ? `<label class="sk-vh" for="${el.id}-${k}">${esc(p.label)}</label><select id="${el.id}-${k}" data-k="${k}">${p.variants.map((x) => `<option value="${x.id}"${x.id === v.id ? ' selected' : ''}${x.available ? '' : ' disabled'}>${esc(x.name)}${x.available ? '' : ' · sold out'}</option>`).join('')}</select>`
          : '';
        return `<div class="sk-bitem"><a class="sk-frame" href="${esc(p.url)}"><img src="${esc(v.img)}" alt="${esc(p.title)}" width="500" height="500" loading="lazy"></a>
          <div class="sk-bitem__b"><span class="sk-bitem__t">${esc(p.title)}</span><span class="sk-bitem__p">${money(v.price, data.money)}</span>${select}</div></div>`;
      }).join('');
      const vs = current.items.map(variantOf);
      const orig = vs.reduce((s, v) => s + v.price, 0);
      // Matches checkout: the percentage is taken per line and rounded down to the cent.
      const off = vs.reduce((s, v) => s + Math.floor(v.price * data.pct / 100), 0);
      const ok = vs.every((v) => v.available);
      $('[data-sk-bcount]', el).textContent = `${current.items.length} products · 20% off`;
      $('[data-sk-bname]', el).textContent = current.name;
      $('[data-sk-bfor]', el).textContent = current.for;
      $('[data-sk-borig]', el).textContent = money(orig, data.money);
      $('[data-sk-borig2]', el).textContent = money(orig, data.money);
      $('[data-sk-boff]', el).textContent = '−' + money(off, data.money);
      $('[data-sk-bfinal]', el).textContent = money(orig - off, data.money);
      $('[data-sk-bsave]', el).textContent = `You save ${money(off, data.money)}`;
      btn.disabled = !ok;
      btn.textContent = ok ? `Add bundle to cart · ${money(orig - off, data.money)}` : 'One item is sold out';
      msg.textContent = '';
    }
    tabs.forEach((t) => t.addEventListener('click', () => { current = data.bundles.find((b) => b.key === t.dataset.key); paint(); }));
    el.addEventListener('keydown', (e) => {
      if (!e.target.matches('.sk-tab') || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const i = tabs.indexOf(e.target) + (e.key === 'ArrowRight' ? 1 : -1);
      const t = tabs[(i + tabs.length) % tabs.length];
      t.focus(); t.click();
    });
    items.addEventListener('change', (e) => {
      if (e.target.matches('select[data-k]')) { pick[e.target.dataset.k] = Number(e.target.value); paint(); }
    });
    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      msg.classList.remove('is-err');
      try {
        await addItems(current.items.map((k) => ({ id: pick[k], quantity: 1, properties: { _bundle: current.name } })));
        msg.textContent = `${current.name} is in your cart.`;
      } catch (err) {
        msg.textContent = err.message;
        msg.classList.add('is-err');
      } finally {
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
      }
    });
    paint();
  }

  /* ---------------- LED explorer ---------------- */
  function initLed(el) {
    const modes = $$('.sk-mode', el);
    const visual = $('[data-sk-led-visual]', el);
    modes.forEach((b) => b.addEventListener('click', () => {
      modes.forEach((m) => m.setAttribute('aria-pressed', String(m === b)));
      const nm = b.dataset.nm.split('+');
      $('[data-sk-led-name]', el).innerHTML = `${esc(b.dataset.name)} <em>light</em>`;
      $('[data-sk-led-nm]', el).textContent = nm.length === 1 ? `${nm[0]} nm channel` : `${nm.join(' + ')} nm channels`;
      $$('.sk-ch', el).forEach((c) => c.classList.toggle('is-on', nm.includes(c.dataset.ch)));
      visual && visual.style.setProperty('--sk-glow', b.dataset.c);
    }));
  }

  /* ---------------- Product landing ---------------- */
  function initPdp(el) {
    let variants = [];
    try { variants = JSON.parse($('[data-sk-variants]', el).textContent); } catch {}
    const form = $('[data-sk-form]', el);
    const qty = $('[data-sk-qty-input]', el);
    const atc = $('[data-sk-atc]', el), buy = $('[data-sk-buynow]', el), msg = $('[data-sk-msg]', el);
    const sticky = $('[data-sk-sticky]', el), stickyBtn = $('[data-sk-sticky-btn]', el);
    const track = $('[data-sk-gal-track]', el), dots = $('[data-sk-gal-dots]', el);
    const vid = () => Number((form.querySelector('input[name=id]:checked') || form.querySelector('input[name=id]')).value);
    const current = () => variants.find((v) => v.id === vid()) || variants[0];

    function paintVariant(scroll) {
      const v = current();
      if (!v) return;
      $('[data-sk-price-now]', el).textContent = money(v.price);
      const was = $('[data-sk-price-was]', el), off = $('[data-sk-price-off]', el);
      const disc = v.compare > v.price;
      was.hidden = off.hidden = !disc;
      if (disc) { was.textContent = money(v.compare); off.textContent = 'Save ' + money(v.compare - v.price); }
      const st = $('[data-sk-stock]', el);
      st.classList.toggle('is-out', !v.available);
      $('span', st).textContent = v.available ? 'In stock, ready to ship' : 'Sold out';
      [atc, buy, stickyBtn].forEach((b) => b && (b.disabled = !v.available));
      atc.textContent = v.available ? 'Add to cart' : 'Sold out';
      const sp = $('[data-sk-sticky-price]', el); sp && (sp.textContent = money(v.price));
      const checked = form.querySelector('input[name=id]:checked');
      const lab = $('[data-sk-vlabel]', el); lab && checked && (lab.textContent = checked.dataset.label);
      const pair = $('[data-sk-pair]', el);
      if (pair) {
        const isPads = PAIRS[v.id] !== undefined;
        pair.textContent = isPads ? 'Add pads + free matching ampoule' : 'Add matching pads + this ampoule';
      }
      if (scroll && v.media && track) {
        const slide = $(`[data-media-id="${v.media}"]`, track);
        if (slide && getComputedStyle(track).overflowX !== 'visible') track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
      }
      if (scroll) { const u = new URL(location.href); u.searchParams.set('variant', v.id); history.replaceState(null, '', u); }
    }

    form.addEventListener('change', (e) => { if (e.target.name === 'id') paintVariant(true); });
    $$('[data-sk-qty]', el).forEach((b) => b.addEventListener('click', () => {
      qty.value = Math.max(1, Math.min(20, (parseInt(qty.value, 10) || 1) + Number(b.dataset.skQty)));
    }));

    async function add(goCheckout) {
      msg.textContent = ''; msg.classList.remove('is-err');
      const q = Math.max(1, Math.min(20, parseInt(qty.value, 10) || 1));
      [atc, buy].forEach((b) => b.setAttribute('aria-busy', 'true'));
      try {
        if (goCheckout) { await api('cart/add.js', { items: [{ id: vid(), quantity: q }] }); location.href = root + 'checkout'; return; }
        await addItems([{ id: vid(), quantity: q }]);
      } catch (err) {
        msg.textContent = err.message; msg.classList.add('is-err');
      } finally {
        [atc, buy].forEach((b) => b.removeAttribute('aria-busy'));
      }
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      add(e.submitter && e.submitter.name === 'return_to');
    });
    stickyBtn && stickyBtn.addEventListener('click', () => add(false));

    const pair = $('[data-sk-pair]', el);
    pair && pair.addEventListener('click', async () => {
      const id = vid();
      const pads = PAIRS[id] !== undefined ? id : Number(Object.keys(PAIRS).find((k) => PAIRS[k] === id));
      if (!pads) return;
      pair.setAttribute('aria-busy', 'true');
      try { await addItems([{ id: pads, quantity: 1 }, { id: PAIRS[pads], quantity: 1 }]); }
      catch (err) { msg.textContent = err.message; msg.classList.add('is-err'); }
      finally { pair.removeAttribute('aria-busy'); }
    });

    // Gallery dots (mobile carousel)
    if (track && dots) {
      const slides = $$('.sk-gal__slide', track);
      dots.innerHTML = slides.map((_, i) => `<button type="button" aria-label="Image ${i + 1} of ${slides.length}"${i ? '' : ' aria-current="true"'}><i></i></button>`).join('');
      const btns = $$('button', dots);
      btns.forEach((b, i) => b.addEventListener('click', () => track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: 'smooth' })));
      let raf = 0;
      track.addEventListener('scroll', () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
          btns.forEach((b, j) => j === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'));
        });
      }, { passive: true });
    }

    // Sticky add-to-cart once the main button has scrolled above the viewport
    if (sticky) {
      let raf2 = 0, was = null;
      const check = () => {
        const on = atc.getBoundingClientRect().bottom < 0;
        if (on === was) return;
        was = on;
        sticky.classList.toggle('is-on', on);
        sticky.setAttribute('aria-hidden', String(!on));
        stickyBtn.tabIndex = on ? 0 : -1;
      };
      addEventListener('scroll', () => { cancelAnimationFrame(raf2); raf2 = requestAnimationFrame(check); }, { passive: true });
      check();
    }
    paintVariant(false);
  }

  /* ---------------- Home: keep only the LEZO hero from the app ---------------- */
  function initHome() {
    if (!document.body.classList.contains('sk-home')) return;
    const prune = () => {
      const main = $('#app #main');
      if (main) [...main.children].forEach((c) => { if (c.id !== 'mask3d') c.remove(); });
    };
    prune();
    const main = $('#app #main');
    if (main) {
      const mo = new MutationObserver(prune);
      mo.observe(main, { childList: true });
      setTimeout(() => mo.disconnect(), 8000);
    }
    // One cart for the whole page: the hero's own "Add to bag" and bag button open this drawer.
    const lz = document.getElementById('cart');
    if (lz && lz.showModal) {
      lz.showModal = () => openCart();
      lz.show = () => openCart();
    }
    document.addEventListener('click', (e) => {
      if (e.target.closest('#app [data-cart]')) { e.preventDefault(); e.stopImmediatePropagation(); openCart(); }
    }, true);
  }

  function initMenu() {
    const b = $('[data-sk-menu]');
    if (!b) return;
    b.addEventListener('click', () => {
      const n = document.getElementById(b.getAttribute('aria-controls'));
      const open = n.classList.toggle('is-open');
      b.setAttribute('aria-expanded', String(open));
    });
  }

  function boot() {
    bindCart();
    bindQuickAdd();
    initMenu();
    initHome();
    $$('[data-sk-bundle]').forEach(initBundle);
    $$('[data-sk-led]').forEach(initLed);
    $$('[data-sk-pdp]').forEach(initPdp);
    paintCount();
    window.SK = { openCart, closeCart, addItems, refresh };
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
