(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Smooth scroll (Lenis if it loaded, native fallback otherwise)
  --------------------------------------------------------- */
  var lenis = null;
  if (!reduceMotion && window.Lenis) {
    try {
      lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
      var raf = function (time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    } catch (e) { lenis = null; }
  }
  if (!lenis && !reduceMotion) {
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  function scrollToEl(el) {
    if (!el) return;
    if (lenis) { lenis.scrollTo(el, { offset: 0 }); }
    else { el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); }
  }

  /* ---------------------------------------------------------
     Sticky header
  --------------------------------------------------------- */
  var header = document.getElementById('site-header');
  if (header) {
    var onScrollHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    onScrollHeader();
    window.addEventListener('scroll', onScrollHeader, { passive: true });
  }

  /* ---------------------------------------------------------
     Mobile menu
  --------------------------------------------------------- */
  var menuToggle = document.getElementById('menu-toggle');
  var menuClose = document.getElementById('menu-close');
  var mobileMenu = document.getElementById('mobile-menu');
  var mobileScrim = document.getElementById('mobile-menu-scrim');

  function openMenu() {
    mobileMenu.classList.add('is-open');
    mobileScrim.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    mobileScrim.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (menuToggle && mobileMenu && mobileScrim) {
    menuToggle.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    mobileScrim.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------------------------------------------------------
     In-page nav links → smooth scroll with header offset
  --------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href.length < 2) return;
    a.addEventListener('click', function (e) {
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        scrollToEl(target);
        history.pushState(null, '', href);
      }
    });
  });

  /* ---------------------------------------------------------
     Scroll reveal (IntersectionObserver + CSS transitions)
  --------------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-reveal], [data-reveal-stagger], [data-reveal-text]');

  // Stagger: index siblings that share a parent so groups (cards/grids) cascade in.
  var groups = new Map();
  revealEls.forEach(function (el) {
    if (!el.hasAttribute('data-reveal-stagger')) return;
    var parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });
  groups.forEach(function (list) {
    list.forEach(function (el, i) {
      el.style.setProperty('--reveal-delay', Math.min(i * 0.08, 0.48) + 's');
    });
  });

  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------
     Hero parallax (subtle, lightweight, no external lib)
  --------------------------------------------------------- */
  var heroMedia = document.querySelector('.hero-media');
  var heroSection = document.querySelector('.hero');
  if (heroMedia && heroSection && !reduceMotion) {
    var heroVisible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
      }).observe(heroSection);
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!heroVisible || ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY * 0.32;
        heroMedia.style.transform = 'translate3d(0,' + y + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Fitment form: year options + chip select + hand-off to quote form
  --------------------------------------------------------- */
  var yearSelect = document.getElementById('fit-year');
  if (yearSelect) {
    var thisYear = new Date().getFullYear();
    for (var y = thisYear + 1; y >= 1990; y--) {
      var opt = document.createElement('option');
      opt.value = String(y);
      opt.textContent = String(y);
      yearSelect.appendChild(opt);
    }
  }

  var chipGroup = document.getElementById('fitment-chips');
  var activeChip = null;
  if (chipGroup) {
    chipGroup.querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        chipGroup.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        activeChip = chip.getAttribute('data-chip');
      });
    });
  }

  var fitmentForm = document.getElementById('fitment-form');
  if (fitmentForm) {
    fitmentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var year = document.getElementById('fit-year').value;
      var make = document.getElementById('fit-make').value;
      var model = document.getElementById('fit-model').value;

      var qYear = document.getElementById('q-year');
      var qMake = document.getElementById('q-make');
      var qModel = document.getElementById('q-model');
      if (qYear) qYear.value = year;
      if (qMake) qMake.value = make;
      if (qModel) qModel.value = model;

      if (activeChip) {
        var service = activeChip === 'Both' ? 'Both' : activeChip;
        var radio = document.querySelector('.quote-form input[name="service"][value="' + service + '"]');
        if (radio) radio.checked = true;
      }

      var contact = document.getElementById('contact');
      scrollToEl(contact);
      setTimeout(function () {
        var name = document.getElementById('q-name');
        if (name) name.focus();
      }, reduceMotion ? 0 : 500);
    });
  }

  /* ---------------------------------------------------------
     Quote form: file names + submit handling
     NOTE: this is a static front end. Wire the fetch() call below
     to a real endpoint (Formspree, Netlify Forms, your own API)
     before launch — see README for options.
  --------------------------------------------------------- */
  var photosInput = document.getElementById('q-photos');
  var filenamesEl = document.getElementById('upload-filenames');
  if (photosInput && filenamesEl) {
    photosInput.addEventListener('change', function () {
      var files = Array.prototype.slice.call(photosInput.files).map(function (f) { return f.name; });
      filenamesEl.textContent = files.length ? files.join(', ') : '';
    });
  }

  var quoteForm = document.getElementById('quote-form');
  var formStatus = document.getElementById('form-status');
  if (quoteForm && formStatus) {
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!quoteForm.checkValidity()) {
        quoteForm.reportValidity();
        return;
      }
      // TODO: replace with a real submission, e.g.:
      // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(quoteForm), headers: { Accept: 'application/json' } })
      formStatus.textContent = 'Thanks — your request is in. We’ll be in touch shortly.';
      quoteForm.reset();
      if (filenamesEl) filenamesEl.textContent = '';
    });
  }

  /* ---------------------------------------------------------
     Gallery lightbox
  --------------------------------------------------------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightbox-image');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(item) {
    var label = item.querySelector('.img-placeholder').getAttribute('data-label');
    var caption = item.getAttribute('data-caption') || '';
    lightboxImage.setAttribute('data-label', label);
    lightboxCaption.textContent = caption;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  if (lightbox && lightboxClose) {
    document.querySelectorAll('.gallery-item').forEach(function (item) {
      item.addEventListener('click', function () { openLightbox(item); });
    });
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ---------------------------------------------------------
     Before / After slider
  --------------------------------------------------------- */
  var baFrame = document.getElementById('ba-frame');
  var baRange = document.getElementById('ba-range');
  if (baFrame && baRange) {
    var setPos = function (pct) {
      pct = Math.max(0, Math.min(100, pct));
      baFrame.style.setProperty('--pos', pct + '%');
      baRange.value = pct;
    };

    baRange.addEventListener('input', function () { setPos(parseFloat(baRange.value)); });

    var dragging = false;
    var pctFromClientX = function (clientX) {
      var rect = baFrame.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    };
    baFrame.addEventListener('pointerdown', function (e) {
      dragging = true;
      setPos(pctFromClientX(e.clientX));
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      setPos(pctFromClientX(e.clientX));
    });
    window.addEventListener('pointerup', function () { dragging = false; });

    setPos(50);
  }

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
