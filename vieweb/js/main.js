(function () {
  'use strict';
  var D = window.NEXO_I18N, KEY = 'nexo-lang', WA = '17042267049';
  var d = document, $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var lang = 'es';
  try { var sv = localStorage.getItem(KEY); if (sv === 'en' || sv === 'es') lang = sv; } catch (e) {}
  var bill = 'month', vert = 0, timers = [];

  var wa = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var ic = function (n, c) { return '<svg class="ico' + (c ? ' ' + c : '') + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; };
  // headline parts: [{text, em}] -> html
  var parts = function (a) { return a.map(function (p, i) { var tx = esc(p.text); if (i && !/\s$/.test(a[i - 1].text) && !/^\s/.test(p.text)) tx = ' ' + tx; return p.em ? (tx !== esc(p.text) ? ' ' : '') + '<em>' + esc(p.text) + '</em>' : tx; }).join(''); };
  var money = function (c, n) { return c + Number(n).toLocaleString('en-US'); };

  var X = {
    es: { r1: 'ortodoncista cerca de mí', t1: 'Clínica Sonrisa', t1s: 'Ortodoncia · Abierto ahora · 4.9', t2: 'Otra clínica', t3: 'Otro resultado',
          chat: ['Hola, vi su página en Google. ¿Tienen cita para mañana?', '¡Hola! Sí, a las 10:00 o 15:30. ¿Cuál prefiere?', '10:00, por favor.'],
          ex: 'Ejemplo ilustrativo', a: 'Te encuentran', b: 'Te escriben', n: 'Mensaje nuevo' },
    en: { r1: 'orthodontist near me', t1: 'Smile Clinic', t1s: 'Orthodontics · Open now · 4.9', t2: 'Other clinic', t3: 'Another result',
          chat: ['Hi, I found your site on Google. Any openings tomorrow?', 'Hi! Yes, 10:00 or 15:30. Which do you prefer?', '10:00, please.'],
          ex: 'Illustrative example', a: 'You get found', b: 'You get messaged', n: 'New message' },
  };
  var waOther = function (L, v) {
    return wa(L === 'es'
      ? (v ? 'Hola, tengo un negocio de ' + v + ' y quiero saber cómo trabajarían conmigo.' : 'Hola, quiero saber cómo trabajarían con mi tipo de negocio.')
      : (v ? "Hi, I have a " + v + " business and want to know how you'd work with me." : 'Hi, I want to know how you\'d work with my type of business.'));
  };
  var WAICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.6 6.3A8.9 8.9 0 0 0 3.1 16.9L2 22l5.2-1.1A8.9 8.9 0 1 0 17.6 6.3zM12 20.4a7.5 7.5 0 0 1-3.8-1l-.3-.2-2.8.7.7-2.7-.2-.3A7.5 7.5 0 1 1 12 20.4zm4.1-5.6c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1s-.6.7-.8.9-.3.2-.6.1a6.1 6.1 0 0 1-1.8-1.1 6.8 6.8 0 0 1-1.2-1.6c-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4c-.1-.1-.5-1.2-.7-1.7-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3a2.1 2.1 0 0 0-.6 1.5c0 .9.6 1.8.7 1.9.1.2 1.5 2.3 3.6 3.2.5.2.9.4 1.2.5.5.1 1 .1 1.3.1.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1z"/></svg>';
  var SPRITE = '<svg style="display:none" aria-hidden="true">' +
    '<symbol id="i-arrow" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></g></symbol>' +
    '<symbol id="i-check" viewBox="0 0 24 24"><polyline points="5 13 10 18 19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
    '<symbol id="i-search" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><line x1="16" y1="16" x2="21" y2="21"/></g></symbol>' +
    '<symbol id="i-menu" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></g></symbol>' +
    '<symbol id="i-close" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></g></symbol>' +
    '<symbol id="i-cube" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></g></symbol>' +
    '<symbol id="i-chat" viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></symbol>' +
    '</svg>';

  function render() {
    var t = D[lang], x = X[lang], h = t.hero, hm = t.home, w = t.work, p = t.pricing, f = t.footer;
    var sub = p.model === 'subscription', c = p.currency;
    var marq = f.marquee.concat(f.marquee).map(function (m) { return '<span>' + esc(m) + '</span><i>✦</i>'; }).join('');
    var exCols = [['#134e4a', '#0f766e'], ['#1c1917', '#44403c'], ['#1e3a5f', '#2563eb'], ['#4a1d3b', '#be185d']];

    var html = SPRITE +
    '<a class="skip" href="#main">' + esc(t.skip) + '</a>' +
    '<header class="nav" id="nav"><div class="nav__inner">' +
      '<a href="#home" class="brand" aria-label="Nexo"><span class="brand__mark">N</span><span class="t">Nexo<small>' + esc(t.brandTagline) + '</small></span></a>' +
      '<nav class="nav__links" id="nav-links" aria-label="Primary"><a href="#home">' + esc(t.nav.home) + '</a><a href="#work">' + esc(t.nav.work) + '</a><a href="#pricing">' + esc(t.nav.pricing) + '</a></nav>' +
      '<div class="nav__cta"><div class="lang" role="group" aria-label="' + esc(t.langLabel) + '"><button data-lang="es" aria-pressed="' + (lang === 'es') + '">ES</button><button data-lang="en" aria-pressed="' + (lang === 'en') + '">EN</button></div>' +
      '<a class="btn btn--primary btn--sm magnetic" href="' + t.waSample + '" target="_blank" rel="noopener"><span>' + esc(t.sampleCta) + '</span></a>' +
      '<button class="nav__toggle" id="nav-toggle" aria-label="' + esc(t.menuOpen) + '" aria-expanded="false" aria-controls="nav-links">' + ic('menu') + '</button></div>' +
    '</div></header>' +

    '<main id="main">' +
    '<section class="hero" id="home"><div class="container hero__grid">' +
      '<div class="hero__copy"><span class="eyebrow">' + esc(h.eyebrow) + '</span>' +
        '<h1 class="display">' + h.words.map(function (wd, i) { return '<span class="w" style="--i:' + i + '"><span class="' + (wd.accent ? 'a' : '') + '">' + esc(wd.t) + '</span></span> '; }).join('') + '</h1>' +
        '<p class="lead">' + esc(h.sub) + '</p>' +
        '<div class="hero__btns"><a class="btn btn--primary magnetic" href="#pricing"><span>' + esc(h.seePlans) + '</span>' + ic('arrow') + '</a><a class="btn btn--ghost" href="#work">' + esc(h.howWeWork) + '</a></div>' +
        '<div class="proof">' + hm.points.map(function (q) { return '<span>' + ic('check') + esc(q.title) + '</span>'; }).join('') + '</div>' +
      '</div>' +
      '<div class="hero__stage" aria-hidden="true"><div class="phone" id="tilt"><div class="phone__screen"><span class="phone__notch"></span>' +
        '<div class="scr on" data-s="0"><div class="gbar">' + ic('search') + '<b>' + esc(x.r1) + '</b></div>' +
          '<div class="res res--top"><span class="stars">★★★★★</span><b>' + esc(x.t1) + '</b><span>' + esc(x.t1s) + '</span><u>nexo-sample.page</u></div>' +
          '<div class="res"><b>' + esc(x.t2) + '</b><span>···</span></div><div class="res"><b>' + esc(x.t3) + '</b><span>···</span></div></div>' +
        '<div class="scr" data-s="1"><div class="chat-head"><i></i><div>' + esc(x.t1) + '<small>' + esc(x.n) + '</small></div></div>' +
          '<div class="chat"><div class="bub bub--out">' + esc(x.chat[0]) + '</div><div class="bub bub--in">' + esc(x.chat[1]) + '</div><div class="bub bub--out">' + esc(x.chat[2]) + '</div></div></div>' +
        '<div class="steps-dots" style="padding:0 0 14px"><i class="on"></i><i></i></div>' +
      '</div></div>' +
      '<div class="float float--a"><span class="float__ic">' + ic('search') + '</span><div><b>' + esc(x.a) + '</b><small>' + esc(x.ex) + '</small></div></div>' +
      '<div class="float float--b"><span class="float__ic">' + ic('chat') + '</span><div><b>' + esc(x.b) + '</b><small>WhatsApp</small></div></div></div>' +
    '</div><a class="scrollhint" href="#system" aria-label="' + esc(h.scroll) + '"><span></span></a></section>' +

    '<section class="marquee" aria-hidden="true"><div class="marquee__track"><div class="marquee__row">' + marq + '</div></div></section>' +

    '<section class="section" id="system"><div class="container">' +
      '<header class="section__head reveal"><span class="eyebrow">' + esc(hm.eyebrow) + '</span><h2 class="h2">' + parts(hm.h2) + '</h2><p class="lead">' + esc(hm.lead) + '</p></header>' +
      '<div class="points">' + hm.points.map(function (q, i) { return '<article class="point spot reveal"><span class="point__n">0' + (i + 1) + '</span><h3>' + esc(q.title) + '</h3><p>' + esc(q.text) + '</p></article>'; }).join('') + '</div>' +
      '<div class="examples">' + hm.examples.map(function (e, i) { return '<figure class="ex spot reveal"><div class="ex__img" style="--c1:' + exCols[i][0] + ';--c2:' + exCols[i][1] + '"><i></i></div><figcaption><span class="tag">' + esc(e.tag) + '</span><p>' + esc(e.text) + '</p></figcaption></figure>'; }).join('') + '</div>' +
    '</div></section>' +

    '<section class="section" id="work"><div class="container">' +
      '<header class="section__head reveal"><span class="eyebrow">' + esc(w.eyebrow) + '</span><h2 class="h2">' + parts(w.h1) + '</h2><p class="lead">' + esc(w.lead) + '</p></header>' +
      '<div class="services">' + w.services.map(function (s, i) { return '<article class="svc spot reveal"><span class="svc__n">0' + (i + 1) + '</span><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></article>'; }).join('') + '</div>' +

      '<header class="section__head reveal" style="margin-top:clamp(80px,10vw,130px)"><span class="eyebrow">' + esc(w.forWhoEyebrow) + '</span><h2 class="h2">' + parts(w.forWhoH2) + '</h2><p class="lead">' + esc(w.forWhoSub) + '</p></header>' +
      '<div class="vert reveal"><div class="chips" role="tablist">' +
        w.verticals.map(function (v, i) { return '<button class="chip" role="tab" data-v="' + i + '" aria-selected="' + (i === vert) + '">' + esc(v.name) + '</button>'; }).join('') +
        '<button class="chip" role="tab" data-v="other" aria-selected="false">' + esc(w.otherLabel) + '</button></div>' +
        '<div class="vert__panel spot" id="vpanel" aria-live="polite"></div></div>' +
      '<div class="threed spot reveal"><span class="threed__ic">' + ic('cube') + '</span><div><h3>' + esc(w.threeDTitle) + '</h3><p>' + esc(w.threeDText) + '</p></div></div>' +

      '<header class="section__head reveal" style="margin-top:clamp(80px,10vw,130px)"><span class="eyebrow">' + esc(w.processEyebrow) + '</span><h2 class="h2">' + esc(w.processH2) + '</h2></header>' +
      '<div class="process">' + w.steps.map(function (s, i) { return '<article class="step spot reveal"><span class="step__n">0' + (i + 1) + '</span><div><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></div></article>'; }).join('') + '</div>' +
      '<p class="pnote">' + esc(w.processNote) + '</p>' +
    '</div></section>' +

    '<section class="section" id="pricing"><div class="container">' +
      '<header class="section__head reveal"><span class="eyebrow">' + esc(p.eyebrow) + '</span><h2 class="h2">' + parts(p.h1) + '</h2><p class="lead">' + esc(p.lead) + '</p>' +
        (sub ? '<div class="billing" role="group" aria-label="Billing"><button data-bill="month" aria-pressed="' + (bill === 'month') + '">' + esc(p.billMonthlyShort) + '</button><button data-bill="year" aria-pressed="' + (bill === 'year') + '">' + esc(p.billAnnual) + ' <small>' + esc(p.billAnnualBadge) + '</small></button></div>' : '') +
      '</header>' +
      '<div class="plans">' + p.plans.map(function (pl, i) {
        var feat = i === 1, n = sub && bill === 'year' ? pl.yearlyPrice : pl.price;
        return '<article class="plan spot reveal' + (feat ? ' plan--featured' : '') + '">' + (feat ? '<span class="plan__badge">' + esc(p.mostChosen) + '</span>' : '') +
          '<h3>' + esc(pl.name) + '</h3><p class="plan__d">' + esc(pl.audience) + '</p>' +
          '<div class="price"><b data-m="' + pl.price + '" data-y="' + (pl.yearlyPrice || pl.price) + '">' + money(c, n) + '</b><small>' + esc(sub ? p.monthlyShort : p.oneTimeLabel) + '</small></div>' +
          (pl.setup ? '<div class="setup">' + esc(p.upfrontShort) + ' <b>' + money(c, pl.setup) + '</b> · ' + esc(lang === 'es' ? 'una vez' : 'once') + '</div>' : '') +
          '<ul class="ticks">' + pl.features.map(function (ft) { return '<li>' + ic('check') + esc(ft) + '</li>'; }).join('') + '</ul>' +
          '<a class="btn ' + (feat ? 'btn--primary magnetic' : 'btn--ghost') + '" href="' + pl.href + '" target="_blank" rel="noopener"><span>' + esc(pl.buttonText) + '</span>' + ic('arrow') + '</a></article>';
      }).join('') + '</div>' +
      '<p class="plan__note">' + esc(p.planNote) + '</p>' + (p.hourly ? '<p class="plan__note">' + esc(p.hourly) + '</p>' : '') + '<p class="plan__note lim">' + esc(p.limitedNote) + '</p>' +

      '<div class="compare reveal"><h3>' + esc(p.compareTitle) + '</h3><div class="table-wrap"><table><thead><tr><th>' + esc(p.compareIncludes) + '</th>' +
        p.plans.map(function (pl, i) { return '<th' + (i === 1 ? ' class="f"' : '') + '>' + esc(pl.name) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        p.compare.map(function (r) { return '<tr><td>' + esc(r.label) + '</td>' + r.values.map(function (v) { return '<td>' + (v === true ? ic('check') : v === false ? '<span class="no">—</span>' : esc(v)) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div></div>' +

      '<header class="section__head center reveal" style="margin-top:clamp(80px,10vw,130px);margin-bottom:40px"><span class="eyebrow center">' + esc(p.faqEyebrow) + '</span><h2 class="h2">' + esc(p.faqH2) + '</h2></header>' +
      '<div class="faq reveal">' + p.faqs.map(function (q, i) { return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(q.q) + '<i></i></summary><p>' + esc(q.a) + '</p></details>'; }).join('') + '</div>' +
      '<p class="faq__close">' + esc(p.faqClose) + '</p>' +
    '</div></section>' +

    '<section class="section"><div class="container"><div class="cta__box spot reveal"><span class="eyebrow center">Nexo</span><h2 class="h2">' + parts(f.heading) + '</h2>' +
      '<a class="btn btn--primary magnetic" href="' + t.waGeneric + '" target="_blank" rel="noopener"><span>' + esc(f.talkBtn) + '</span>' + ic('arrow') + '</a></div></div></section>' +
    '</main>' +

    '<footer class="footer"><div class="container footer__inner"><a href="#home" class="brand"><span class="brand__mark">N</span><span class="t">Nexo<small>' + esc(f.taglinePre + ' ' + f.taglinePost) + '</small></span></a>' +
      '<nav aria-label="Footer"><a href="#work">' + esc(t.nav.work) + '</a><a href="#pricing">' + esc(t.nav.pricing) + '</a><a class="up" href="#home">' + esc(t.backToTop) + '</a></nav>' +
      '<p>© ' + new Date().getFullYear() + ' Nexo</p></div></footer>' +
    '<a class="fab" href="' + t.waGeneric + '" target="_blank" rel="noopener" aria-label="' + esc(t.waFabLabel) + '">' + WAICON + '</a>';

    $('#app').innerHTML = html;
    d.documentElement.lang = lang;
    d.title = t.home.seoTitle + ' — Nexo';
    var md = $('meta[name=description]'); if (md) md.setAttribute('content', t.home.seoDesc);
    paintVert(); wire();
  }

  function paintVert() {
    var w = D[lang].work, pn = $('#vpanel'); if (!pn) return;
    if (vert === 'other') {
      pn.innerHTML = '<h3>' + esc(w.otherLabel) + '</h3><p>' + esc(w.otherText) + '</p><form class="other" id="other"><label class="sr" for="oin">' + esc(w.otherLabel) + '</label><input id="oin" placeholder="' + esc(w.otherPlaceholder) + '"><button class="btn btn--primary btn--sm" type="submit"><span>' + esc(w.otherButton) + '</span></button></form>';
      $('#other').addEventListener('submit', function (e) { e.preventDefault(); window.open(waOther(lang, $('#oin').value.trim()), '_blank', 'noopener'); });
    } else {
      var v = w.verticals[vert];
      pn.innerHTML = '<h3>' + esc(v.name) + '</h3><p>' + esc(v.info) + '</p>';
    }
    pn.classList.remove('swap'); void pn.offsetWidth; pn.classList.add('swap');
  }

  var io;
  function wire() {
    timers.forEach(clearInterval); timers = [];
    var nav = $('#nav'), links = $('#nav-links'), tgl = $('#nav-toggle');
    tgl.addEventListener('click', function () { var o = links.classList.toggle('open'); tgl.setAttribute('aria-expanded', String(o)); });
    $$('a', links).forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); tgl.setAttribute('aria-expanded', 'false'); }); });
    $$('[data-lang]').forEach(function (b) { b.addEventListener('click', function () {
      lang = b.dataset.lang; try { localStorage.setItem(KEY, lang); } catch (e) {} vert = vert === 'other' ? 'other' : Math.min(vert, 5); render();
    }); });
    $$('.chip').forEach(function (b) { b.addEventListener('click', function () {
      vert = b.dataset.v === 'other' ? 'other' : +b.dataset.v;
      $$('.chip').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); }); paintVert();
    }); });
    $$('[data-bill]').forEach(function (b) { b.addEventListener('click', function () {
      bill = b.dataset.bill; var c = D[lang].pricing.currency;
      $$('[data-bill]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('.price b').forEach(function (n) { n.classList.add('swap'); setTimeout(function () { n.textContent = c + Number(bill === 'year' ? n.dataset.y : n.dataset.m).toLocaleString('en-US'); n.classList.remove('swap'); }, 200); });
    }); });

    // phone: alternate search result -> chat
    var scr = $$('.scr'), dots = $$('.steps-dots i');
    if (scr.length && !reduce) {
      var k = 0;
      timers.push(setInterval(function () {
        k = (k + 1) % 2;
        scr.forEach(function (s, i) { s.classList.toggle('on', i === k); });
        dots.forEach(function (s, i) { s.classList.toggle('on', i === k); });
        if (k === 1) $$('.bub').forEach(function (b) { b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; });
      }, 4800));
    } else if (scr.length) { scr[1].classList.add('on'); }

    // 3D tilt
    var tilt = $('#tilt');
    if (tilt && fine && !reduce) {
      var st = tilt.parentNode;
      st.addEventListener('pointermove', function (e) { var r = st.getBoundingClientRect(); tilt.style.transform = 'rotateY(' + (((e.clientX - r.left) / r.width - .5) * 14) + 'deg) rotateX(' + (-((e.clientY - r.top) / r.height - .5) * 10) + 'deg)'; });
      st.addEventListener('pointerleave', function () { tilt.style.transform = ''; });
    }

    // reveal
    if (io) io.disconnect();
    var rev = $$('.reveal');
    if ('IntersectionObserver' in window && !reduce) {
      io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
      rev.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
    } else rev.forEach(function (el) { el.classList.add('in'); });
    onScroll();
  }

  function onScroll() {
    var nav = $('#nav'), bar = $('#progress'); if (!nav) return;
    var s = window.pageYOffset, m = d.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('scrolled', s > 20);
    bar.style.transform = 'scaleX(' + (m > 0 ? s / m : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var l = $('#nav-links'); if (l) l.classList.remove('open'); } });

  // delegated pointer effects (survive re-render)
  var glow = $('#cursor-glow');
  d.addEventListener('pointermove', function (e) {
    var sp = e.target.closest && e.target.closest('.spot');
    if (sp) { var r = sp.getBoundingClientRect(); sp.style.setProperty('--mx', (e.clientX - r.left) + 'px'); sp.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
    if (fine && !reduce) {
      glow.classList.add('on'); glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      var mg = e.target.closest && e.target.closest('.magnetic');
      $$('.magnetic').forEach(function (b) { if (b !== mg) b.style.transform = ''; });
      if (mg) { var q = mg.getBoundingClientRect(); mg.style.transform = 'translate(' + ((e.clientX - q.left - q.width / 2) * .16) + 'px,' + ((e.clientY - q.top - q.height / 2) * .26) + 'px)'; }
    }
  }, { passive: true });

  render();
})();
