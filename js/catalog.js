(function () {
  'use strict';
  var cfg = window.CATALOG_CONFIG, products = window.PRODUCTS || [];
  var grid = document.getElementById('cat-grid');
  var search = document.getElementById('cat-search');
  var chips = document.querySelectorAll('[data-cat]');
  var state = { cat: 'all', q: '' };

  var fmt = new Intl.NumberFormat(cfg.locale, { style: 'currency', currency: cfg.currency, maximumFractionDigits: 0 });
  var labels = { rines: 'Rines', suspension: 'Suspensión', servicios: 'Servicios' };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeUrl(u) { return /^https?:\/\//i.test(u) ? u : ''; }

  function waLink(p) {
    var msg = 'Hola, quiero comprar: ' + p.name + ' (' + fmt.format(p.price) + '). ¿Me envían el link de pago?';
    return 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(msg);
  }

  function card(p) {
    var img = safeUrl(p.image)
      ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">'
      : '<div class="img-placeholder" data-label="Foto del producto"><div class="ph-texture"></div></div>';
    var title = safeUrl(p.url) ? '<a href="' + esc(p.url) + '">' + esc(p.name) + '</a>' : esc(p.name);
    var pay = safeUrl(p.payLink)
      ? '<a class="btn btn-primary" href="' + esc(p.payLink) + '" target="_blank" rel="noopener">Pagar ahora</a>'
      : '';
    return '<article class="product-card">' +
      '<div class="product-media">' + img + '</div>' +
      '<div class="product-body">' +
        '<span class="product-cat">' + esc(labels[p.category] || p.category) + '</span>' +
        '<h3>' + title + '</h3>' +
        '<p class="product-desc">' + esc(p.desc) + '</p>' +
        '<div class="product-price">' + fmt.format(p.price) + '</div>' +
        '<div class="product-actions">' + pay +
          '<a class="btn ' + (pay ? 'btn-outline' : 'btn-primary') + '" href="' + esc(waLink(p)) +
          '" target="_blank" rel="noopener">Pedir link de pago</a>' +
        '</div></div></article>';
  }

  function render() {
    var q = state.q.trim().toLowerCase();
    var list = products.filter(function (p) {
      return (state.cat === 'all' || p.category === state.cat) &&
        (!q || (p.name + ' ' + p.desc).toLowerCase().indexOf(q) !== -1);
    });
    grid.innerHTML = list.length ? list.map(card).join('') : '<p class="cat-empty">No hay productos que coincidan.</p>';
  }

  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      state.cat = c.getAttribute('data-cat');
      chips.forEach(function (x) { x.classList.toggle('is-active', x === c); });
      render();
    });
  });
  search.addEventListener('input', function () { state.q = search.value; render(); });
  render();
})();
