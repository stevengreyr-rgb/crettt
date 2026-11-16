/* SEVENCRUSH — Cinematic Motion. Works without GSAP (selector, cart, viewer, sticky bar, FAQ);
   with GSAP + ScrollTrigger and no reduced-motion preference it adds the scroll-driven scenes. */
(() => {
  const root = document.querySelector('[data-cnm]');
  if (!root) return;
  const $ = (q, el = root) => el.querySelector(q);
  const $$ = (q, el = root) => [...el.querySelectorAll(q)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => reduce.matches;
  const unit = Number(root.dataset.unit);
  const fmtTpl = root.dataset.money || '${{amount}}';
  const money = (c) => {
    const n = (c / 100).toFixed(2);
    const withCommas = n.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return fmtTpl.replace(/\{\{\s*(\w+)\s*\}\}/, (_, k) => k === 'amount_no_decimals' ? String(Math.round(c / 100)) : k === 'amount_with_comma_separator' ? n.replace('.', ',') : withCommas);
  };

  /* Header height → CSS var, so the first screen and sticky offsets fit under it */
  const header = document.querySelector('.hb-head, header, .sk-head');
  const setH = () => root.style.setProperty('--cnm-header', (header ? Math.round(header.getBoundingClientRect().height) : 64) + 'px');
  setH(); window.addEventListener('resize', setH, { passive: true });

  /* Smooth in-page jumps */
  $$('[data-cnm-jump]').forEach((a) => a.addEventListener('click', (e) => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
  }));

  /* Scroll progress bar (transform only, one rAF per frame) */
  const bar = $('[data-cnm-progress]');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const r = root.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      bar.style.transform = `scaleX(${p})`;
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Chapter index */
  const dots = $('[data-cnm-dots]');
  const dotBtns = $$('button', dots);
  dotBtns.forEach((b) => b.addEventListener('click', () => document.getElementById(b.dataset.to)?.scrollIntoView({ behavior: still() ? 'auto' : 'smooth' })));
  const scenes = $$('[data-cnm-scene]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      dotBtns.forEach((b) => b.setAttribute('aria-current', String(b.dataset.to === id)));
      dots.classList.toggle('is-shown', id !== 'cnm-s1');
    }), { rootMargin: '-50% 0px -50% 0px' });
    scenes.forEach((s) => io.observe(s));
  }

  /* ───── Scene 2: angle viewer (real photos; scroll, drag, swipe, keys, ticks) ───── */
  const ang = $('[data-cnm-angles]');
  const angles = (() => {
    if (!ang) return null;
    const stage = $('[data-cnm-angles-stage]', ang);
    const frames = $$('[data-cnm-frame]', ang), caps = $$('[data-cnm-cap]', ang), ticks = $$('[data-cnm-ticks] button', ang);
    const zoom = $('[data-cnm-zoom]', ang);
    let i = 0;
    const show = (n) => {
      n = (n + frames.length) % frames.length;
      if (n === i) return;
      i = n;
      frames.forEach((f, k) => { f.classList.toggle('is-active', k === i); f.setAttribute('aria-hidden', String(k !== i)); });
      caps.forEach((c, k) => c.classList.toggle('is-active', k === i));
      ticks.forEach((t, k) => t.setAttribute('aria-current', String(k === i)));
    };
    ticks.forEach((t, k) => t.addEventListener('click', () => show(k)));
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1); }
    });
    let sx = null, moved = 0;
    stage.addEventListener('pointerdown', (e) => {
      if (e.target.closest('[data-cnm-zoom]')) return;
      sx = e.clientX; moved = 0; stage.classList.add('is-dragging');
      stage.setPointerCapture?.(e.pointerId);
    });
    stage.addEventListener('pointermove', (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 56) { show(i + (dx < 0 ? 1 : -1)); sx = e.clientX; moved++; }
    });
    const end = () => { sx = null; stage.classList.remove('is-dragging'); };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    const setZoom = (on, e) => {
      stage.classList.toggle('is-zoomed', on);
      zoom.setAttribute('aria-pressed', String(on));
      if (on && e && e.clientX) {
        const r = stage.getBoundingClientRect();
        stage.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100) + '%');
        stage.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100) + '%');
      } else { stage.style.setProperty('--zx', '50%'); stage.style.setProperty('--zy', '42%'); }
    };
    zoom.addEventListener('click', () => setZoom(!stage.classList.contains('is-zoomed')));
    stage.addEventListener('dblclick', (e) => setZoom(!stage.classList.contains('is-zoomed'), e));
    return { show, get i() { return i; }, n: frames.length, frames, stage };
  })();

  /* ───── Scene 4: active benefit follows the reader ───── */
  const bitems = $$('[data-cnm-bitem]'), bimgs = $$('[data-cnm-bimg]');
  if ('IntersectionObserver' in window && bitems.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const k = bitems.indexOf(e.target);
      bitems.forEach((b, j) => b.classList.toggle('is-active', j === k));
      bimgs.forEach((b, j) => b.classList.toggle('is-active', j === k));
    }), { rootMargin: '-45% 0px -45% 0px' });
    bitems.forEach((b) => io.observe(b));
  }

  /* ───── Scene 5: hotspots + rail ───── */
  $$('[data-cnm-pin]').forEach((p) => p.addEventListener('click', () => {
    const open = p.getAttribute('aria-expanded') !== 'true';
    $$('[data-cnm-pin]').forEach((x) => x.setAttribute('aria-expanded', 'false'));
    p.setAttribute('aria-expanded', String(open));
  }));
  const track = $('[data-cnm-rail-track]');
  if (track) {
    const cards = [...track.children], dotsEl = $('[data-cnm-rail-dots]');
    dotsEl.innerHTML = cards.map(() => '<i></i>').join('');
    const ds = [...dotsEl.children];
    const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);
    const mark = () => {
      const k = Math.round(track.scrollLeft / step());
      ds.forEach((d, j) => d.classList.toggle('is-active', j === Math.min(k, ds.length - 1)));
    };
    track.addEventListener('scroll', () => requestAnimationFrame(mark), { passive: true }); mark();
    const go = (d) => track.scrollBy({ left: d * step(), behavior: still() ? 'auto' : 'smooth' });
    $('[data-cnm-rail-prev]')?.addEventListener('click', () => go(-1));
    $('[data-cnm-rail-next]')?.addEventListener('click', () => go(1));
  }

  /* ───── FAQ: animate close as well as open ───── */
  $$('[data-cnm-faq] details').forEach((d) => {
    const s = $('summary', d);
    s.addEventListener('click', (e) => {
      if (!d.open || still()) return;
      e.preventDefault();
      d.querySelector('.cnm-faq__body').style.gridTemplateRows = '0fr';
      setTimeout(() => { d.open = false; d.querySelector('.cnm-faq__body').style.gridTemplateRows = ''; }, 200);
    });
  });

  /* ───── Scene 6: bundles, live price, reward progress, add to cart ───── */
  const form = $('[data-cnm-form]');
  const tiers = $$('.cnm-tier');
  const qtyIn = $('[data-cnm-qty]'), idIn = $('[data-cnm-id]');
  const totalEl = $('[data-cnm-total]'), totalBtn = $('[data-cnm-total-btn]'), saveEl = $('[data-cnm-save]');
  const count = $('[data-cnm-count]'), reward = $('[data-cnm-reward]'), rmsg = $('[data-cnm-reward-msg]');
  const stickySub = $('[data-cnm-sticky-sub]');
  const rw = { 1: rmsg?.textContent, 2: root.dataset.rw2, 3: root.dataset.rw3 };
  let shown = unit;
  const countTo = (to) => {
    const from = shown; shown = to;
    if (still() || from === to) { totalEl.textContent = money(to); return; }
    const t0 = performance.now(), d = 420;
    const ease = (x) => 1 - Math.pow(1 - x, 4);
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / d);
      totalEl.textContent = money(Math.round(from + (to - from) * ease(k)));
      if (k < 1 && shown === to) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const paint = (t) => {
    const q = Number(t.dataset.q), off = Number(t.dataset.off);
    const full = unit * q, total = Math.round(full * (100 - off) / 100);
    qtyIn.value = q;
    countTo(total);
    if (totalBtn) totalBtn.textContent = money(total);
    if (saveEl) {
      saveEl.hidden = !(full - total > 0);
      saveEl.textContent = (root.dataset.saveLabel || 'You save [amount]').replace('[amount]', money(full - total));
    }
    if (count) {
      count.textContent = '×' + q;
      if (!still()) { count.classList.remove('is-bump'); void count.offsetWidth; count.classList.add('is-bump'); setTimeout(() => count.classList.remove('is-bump'), 360); }
    }
    if (reward) {
      $('.cnm-reward__bar i', reward).style.setProperty('--p', String(q / 3));
      $$('.cnm-reward__steps span', reward).forEach((s, j) => s.classList.toggle('is-on', j < q));
      if (rmsg && rw[q]) rmsg.textContent = rw[q];
    }
    if (stickySub) stickySub.textContent = t.dataset.name + ' · ' + money(total);
  };
  tiers.forEach((t) => {
    t.addEventListener('click', () => {
      tiers.forEach((x) => x.setAttribute('aria-checked', String(x === t)));
      const swap = () => paint(t);
      // View Transitions where available: the offer image and the count morph together
      if (document.startViewTransition && !still()) document.startViewTransition(swap); else swap();
    });
    t.addEventListener('keydown', (e) => {
      const k = tiers.indexOf(t);
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); tiers[(k + 1) % tiers.length].focus(); tiers[(k + 1) % tiers.length].click(); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); tiers[(k + 2) % tiers.length].focus(); tiers[(k + 2) % tiers.length].click(); }
    });
  });
  const atc = $('[data-cnm-atc]'), err = $('[data-cnm-err]');
  if (form && atc) form.addEventListener('submit', async (e) => {
    if (!window.SK || !window.SK.addItems) return; // falls back to the normal /cart/add post
    e.preventDefault();
    if (atc.classList.contains('is-busy')) return;
    err.textContent = '';
    atc.classList.add('is-busy'); atc.setAttribute('aria-busy', 'true');
    try {
      await window.SK.addItems([{ id: Number(idIn.value), quantity: Number(qtyIn.value) }]);
      atc.classList.add('is-done');
      setTimeout(() => atc.classList.remove('is-done'), 1800);
    } catch (x) {
      err.textContent = (x && x.message) || 'Something went wrong. Please try again.';
    } finally { atc.classList.remove('is-busy'); atc.removeAttribute('aria-busy'); }
  });

  /* ───── Sticky bar: after the first screen, hidden while the offer is on screen ───── */
  const sticky = $('[data-cnm-sticky]'), hero = $('#cnm-s1'), offer = $('#cnm-offer');
  if (sticky && 'IntersectionObserver' in window) {
    let heroIn = true, offerIn = false;
    const upd = () => {
      const on = !heroIn && !offerIn;
      sticky.classList.toggle('is-shown', on);
      sticky.setAttribute('aria-hidden', String(!on));
      $('a', sticky).tabIndex = on ? 0 : -1;
    };
    new IntersectionObserver(([e]) => { heroIn = e.isIntersecting; upd(); }).observe(hero);
    new IntersectionObserver(([e]) => { offerIn = e.isIntersecting; upd(); }, { threshold: .15 }).observe(offer);
  }

  /* ───── Scroll-driven scenes (GSAP) ───── */
  const start = () => {
    const gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST || still()) return false;
    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    document.documentElement.classList.add('cnm-on');
    root.classList.add('cnm-on');
    const mm = gsap.matchMedia();
    const desk = '(min-width: 900px)';

    // Scene 1: the packshot sinks back and the copy lifts away as the reveal leaves
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .6 } })
      .to('[data-cnm-hero-media]', { yPercent: 18, scale: .9, ease: 'none' }, 0)
      .to('[data-cnm-hero-copy]', { yPercent: -30, opacity: 0, ease: 'none' }, 0);

    // Headlines: line-by-line mask reveal (split by words into masked lines)
    $$('[data-cnm-lines]').forEach((h) => {
      if (h.dataset.split) return;
      const words = h.textContent.trim().split(/\s+/);
      h.dataset.split = '1';
      h.setAttribute('aria-label', h.textContent.trim());
      h.innerHTML = words.map((w) => `<span class="cnm-line" aria-hidden="true" style="display:inline-block;vertical-align:top"><span style="display:inline-block">${w}&nbsp;</span></span>`).join('');
      gsap.from($$('.cnm-line > span', h), { yPercent: 108, duration: .9, ease: 'expo.out', stagger: .045, scrollTrigger: { trigger: h, start: 'top 85%', once: true } });
    });

    // Masked image reveals (clip-path), staggered lists
    $$('[data-cnm-mask]').forEach((m) => gsap.fromTo(m, { clipPath: 'inset(12% 8% 12% 8% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: m, start: 'top 80%', once: true } }));
    $$('[data-cnm-stagger]').forEach((l) => gsap.from(l.children, { y: 18, opacity: 0, duration: .6, ease: 'power3.out', stagger: .06, scrollTrigger: { trigger: l, start: 'top 85%', once: true } }));
    $$('[data-cnm-par]').forEach((p) => gsap.fromTo(p, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: p.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

    // Scene 2: scroll turns the angles and moves the camera closer within each
    if (angles && angles.n > 1) {
      ST.create({
        trigger: '[data-cnm-details]', start: 'top top', end: 'bottom bottom',
        onUpdate: (s) => {
          const f = Math.min(angles.n - 1, Math.floor(s.progress * angles.n));
          angles.show(f);
          const local = s.progress * angles.n - f;
          const img = angles.frames[f].querySelector('img');
          if (img && !angles.stage.classList.contains('is-zoomed')) img.style.setProperty('--z', (1 + local * .14).toFixed(3));
        }
      });
    }

    // Scene 3: the portrait opens from a circle into the full frame, copy rises after
    const exp = $('[data-cnm-exp]'), em = $('[data-cnm-exp-media]');
    if (exp && em) {
      const st = { r: 14, s: 1.18 };
      gsap.timeline({ scrollTrigger: { trigger: exp, start: 'top top', end: 'bottom bottom', scrub: .5 } })
        .to(st, { r: 115, s: 1, ease: 'none', duration: .6, onUpdate: () => { em.style.setProperty('--r', st.r + '%'); em.style.setProperty('--s', st.s); } })
        .from('[data-cnm-exp-copy] > *', { y: 50, opacity: 0, stagger: .08, duration: .3, ease: 'power2.out' }, .45);
    }

    // Scene 4: each benefit fills its own progress line while it is read
    bitems.forEach((b) => {
      const i = $('[data-cnm-bbar]', b);
      if (i) gsap.fromTo(i, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: b, start: 'top 60%', end: 'bottom 40%', scrub: true } });
    });

    // Scene 5: hotspots pop in once the photo is revealed
    gsap.from('[data-cnm-pin]', { scale: .4, opacity: 0, duration: .6, ease: 'back.out(2)', stagger: .15, scrollTrigger: { trigger: '.cnm-rt__photo', start: 'top 60%', once: true } });

    // Rail: day moments slide in from the right
    mm.add(desk, () => {
      gsap.from('[data-cnm-rail-track] > *', { x: 80, opacity: 0, duration: .9, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: '[data-cnm-rail]', start: 'top 75%', once: true } });
    });

    // Scene 6: the packshot settles in as the offer arrives
    gsap.fromTo('[data-cnm-offer-img]', { scale: 1.12, yPercent: 6 }, { scale: 1, yPercent: 0, ease: 'none', scrollTrigger: { trigger: offer, start: 'top bottom', end: 'top 30%', scrub: .6 } });
    gsap.from('.cnm-tier', { y: 24, opacity: 0, duration: .7, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '[data-cnm-tiers]', start: 'top 85%', once: true } });

    ST.refresh();
    return true;
  };
  if (!start()) {
    // GSAP is deferred before this file; if it arrives late (slow CDN), try once more on load
    window.addEventListener('load', () => { if (!document.documentElement.classList.contains('cnm-on')) start(); }, { once: true });
  }
  reduce.addEventListener?.('change', () => location.reload());
})();
