(() => {
  const init = () => document.querySelectorAll('[data-iv-choices]').forEach(root => {
    if (root.dataset.ivReady) return;
    root.dataset.ivReady = 'true';
    const cards = [...root.querySelectorAll('[data-iv-card]')];
    const button = root.querySelector('[data-iv-add]');
    const selected = () => cards.find(card => card.querySelector('[data-iv-radio]').checked);
    const amount = text => Number(text.replace(/[^\d.]/g, '')) || 0;
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
      card.querySelectorAll('select').forEach(select => select.addEventListener('change', () => {card.querySelector('[data-iv-radio]').checked = true; paint();}));
    });
    button.addEventListener('click', () => selected()?.querySelector('[data-hb-kit-add]').click());
    paint();
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
