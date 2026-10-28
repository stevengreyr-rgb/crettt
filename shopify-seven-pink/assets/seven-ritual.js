/* Sevencrush ritual shop: adds to the cart, applies RITUAL20 for bundles and opens the pink bag (#sp-cart). */
(() => {
  'use strict';
  const shop = document.getElementById('sr-shop');
  if (!shop) return;
  const root = window.Shopify?.routes?.root || '/';
  const code = shop.dataset.code || 'RITUAL20';
  const toastEl = shop.querySelector('[data-sr-toast]');
  let toastTimer = 0;

  // Home: sit right under the mask cards and add tabs. LEZO landing page: stay above the app footer.
  const homeShop = document.getElementById('sp-shop');
  if (homeShop) {
    homeShop.after(shop);
    const tabs = document.querySelector('.sp-tabs');
    if (tabs && !tabs.querySelector('[href="#sr-bogo"]')) {
      tabs.insertAdjacentHTML('beforeend', '<a href="#sr-bogo">BUY 1 GET 1</a><a href="#sr-rituals">RITUALS −20%</a>');
    }
  }
  const app = document.getElementById('app');
  if (app) {
    // Swap the landing page's old lifestyle shots for the new campaign photos of the real LEZO mask.
    const files = 'https://cdn.shopify.com/s/files/1/0833/3485/6923/files/';
    const swaps = {
      'lezo-u-a': 'sp-mask-bed.png', 'lezo-u-b': 'sp-mask-blue.png', 'lezo-u-c': 'sp-mask-green.png', 'lezo-u-d': 'sp-mask-sofa.png',
      'lezo-pdp-worn-2026': 'sp-mask-sofa.png', 'lezo-ritual-2026': 'sp-mask-bed.png', 'lezo-portrait-2026': 'sp-mask-portrait.png', 'lezo-editorial-movement': 'sp-mask-blue.png',
    };
    const swap = () => {
      app.querySelectorAll('img, source').forEach((el) => {
        const current = el.getAttribute('src') || el.getAttribute('srcset') || '';
        const key = Object.keys(swaps).find((k) => current.includes(k));
        if (!key) return;
        const next = `${files}${swaps[key]}?width=1400`;
        if (el.hasAttribute('srcset')) el.setAttribute('srcset', next);
        if (el.tagName === 'IMG') el.setAttribute('src', next);
      });
    };
    const place = () => {
      const footer = app.querySelector('footer');
      if (footer && footer.previousElementSibling !== shop) footer.before(shop);
      swap();
    };
    place();
    new MutationObserver(place).observe(app, { childList: true, subtree: true });
  }

  const request = async (path, body) => {
    const res = await fetch(root + path, { method: 'POST', credentials: 'same-origin', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.description || data.message || 'Please try again.');
    return data;
  };
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
  };
  const openBag = () => {
    const pink = document.getElementById('sp-cart');
    if (pink) shop.querySelector('[data-sr-open]').click();
    else location.assign(root + 'cart');
  };

  shop.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-sr-add]');
    if (!btn) return;
    e.preventDefault();
    btn.setAttribute('aria-busy', 'true');
    try {
      await request('cart/add.js', { items: JSON.parse(btn.dataset.srAdd) });
      if (btn.hasAttribute('data-sr-code')) {
        try { await request('cart/update.js', { discount: code }); }
        catch { await fetch(`${root}discount/${encodeURIComponent(code)}?redirect=${encodeURIComponent(root + 'cart.js')}`).catch(() => {}); }
      }
      toast(btn.hasAttribute('data-sr-code') ? 'Ritual added. 20% off applied.' : 'Added to your bag.');
      openBag();
    } catch (err) {
      toast(err.message);
    } finally {
      btn.removeAttribute('aria-busy');
    }
  });

  shop.addEventListener('change', (e) => {
    const input = e.target.closest('[data-sr-pick] input[type="radio"]');
    if (!input) return;
    const card = input.closest('[data-sr-pick]');
    const { items, price, total, img } = input.dataset;
    card.querySelector('[data-sr-add]').dataset.srAdd = items;
    const set = (sel, value) => { const el = card.querySelector(sel); if (el && value) el.textContent = value; };
    set('[data-sr-price]', price);
    set('[data-sr-total]', total);
    const pic = card.querySelector('[data-sr-img]');
    if (pic && img) pic.src = img;
  });
})();
