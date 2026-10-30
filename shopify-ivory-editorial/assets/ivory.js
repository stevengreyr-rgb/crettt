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
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  document.addEventListener('shopify:section:load',init);
})();
