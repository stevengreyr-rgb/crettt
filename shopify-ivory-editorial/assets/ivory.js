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
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { init(); lights(); }); else { init(); lights(); }
  document.addEventListener('shopify:section:load',init);
})();
