# Maxi Motor — Website

A premium, single-page dark-luxury automotive site for Maxi Motor (luxury
wheels, performance suspension, custom fitment). Static HTML/CSS/JS —
no build step, no framework, deploy anywhere that serves static files.

## Running locally

```
python3 -m http.server 8000
# open http://localhost:8000
```

Any static file server works (Netlify, Vercel, GitHub Pages, S3, etc.) —
just point it at the repo root.

## Project structure

```
index.html        one-page site, anchor nav (Home/Rims/Suspension/Services/Gallery/About/Contact)
css/styles.css     design system + all component/section styles
js/main.js         nav, gallery lightbox, before/after slider, forms
```

No bundler. `js/main.js` is vanilla JS so the core experience —
navigation, forms, gallery, before/after — works with zero external
dependencies. [Lenis](https://github.com/darkroomengineering/lenis)
loads from a CDN purely as a smooth-scroll enhancement; if it fails to load
(offline, blocked CDN, ad blocker) the site falls back to native smooth
scrolling automatically — nothing breaks.

## ⚠️ Before launch: content checklist

This build ships with clearly-labeled placeholders instead of invented
photos, reviews, or business details — replace all of the following with
real content:

### Photos / video
Every gray panel with a caption like "Wheel detail photo" is a placeholder —
swap the `.img-placeholder` div for a real `<img class="bg-photo">` (or
background video) in the same slot. Priority order:
1. ~~Hero background~~ and ~~closing CTA background~~ — **done**: both now
   use real Maxi Motor vehicle photos (AI-upscaled to 2K from the source
   photos), hotlinked from Higgsfield's CDN
   (`d8j0ntlcm91z4.cloudfront.net`). **Verify these render correctly and
   don't show phone/Instagram UI chrome** — the sandbox this was built in
   couldn't reach that CDN domain to visually confirm the crop, since the
   source uploads were full-screen phone screenshots (one clearly included
   Instagram's UI — status bar, search bar, like/comment icons). If either
   image shows anything other than a clean truck photo, re-crop the source
   and re-run, or download+crop the current result. For durability, also
   download both and self-host them under `assets/img/` instead of
   hotlinking the generation CDN long-term.
2. Gallery (`#gallery`) — 8 slots, editorial masonry layout.
3. Rims / Suspension / Services card images.
4. Before/After slider (`#ba-before`, `.ba-img--after`) — needs a real
   matched before/after pair of the same vehicle.

### Business details (currently placeholder values)
- Phone number — `tel:+10000000000` (header, mobile sticky bar, footer, contact section — search-and-replace)
- WhatsApp number — `https://wa.me/10000000000` (same locations)
- Email — `info@maximotor.example`
- Street address — contact section currently says "Address on request"
- Hours — currently marked `(placeholder hours)`
- Instagram / Facebook — `href="#"` placeholders in the contact section and footer
- Google Maps embed — see the `TODO: MAP` comment in `index.html`'s contact
  section for a ready-to-uncomment `<iframe>` once you have a confirmed address

### Content intentionally left out (per the brief's own instructions)
- **No invented testimonials/reviews.** The "Recent Builds" section stands
  in for social proof until real reviews exist — swap it for a testimonials
  section once you have them.
- **No invented fitment/compatibility data.** The Fitment section collects
  the visitor's vehicle and routes it into the quote form instead of
  claiming automated compatibility it can't back up.
- **No Instagram feed section** — add one once a real account/feed is
  connected (the brief's own fallback for "no real social proof yet").
- Rim product names (Forged/Monoblock/Multi-Piece Series) are illustrative
  categories, not a real catalog — replace with actual inventory.

### Quote form
`#quote-form` currently validates client-side and shows a success message,
but has no backend — it doesn't actually send anywhere yet. Wire the
`fetch()` call noted in `js/main.js` (search `TODO: replace with a real
submission`) to one of:
- [Formspree](https://formspree.io) or similar form-to-email service
- Netlify Forms (if hosting on Netlify — the form already has `name="quote-request"`)
- A custom endpoint

## Design notes

- **Single page, anchor nav.** All seven nav items (Home/Rims/Suspension/
  Services/Gallery/About/Contact) scroll to sections on one page rather than
  separate pages — standard for this style of cinematic scroll-driven brand
  site. "About" maps to the "Why Maxi Motor" section.
- **Palette**: near-black/carbon/graphite base with a single champagne-gold
  accent (`--gold` in `css/styles.css`) — intentionally always-dark
  regardless of OS light/dark preference, as a brand choice (per the brief).
- **Type**: Oswald (condensed display headlines) + Inter (body), loaded from
  Google Fonts with system-font fallback if that fails to load.
- **Motion**: deliberately minimal — content is visible immediately as you
  scroll, no reveal/parallax effects. Hover states on cards/links and an
  interactive before/after drag slider are the only motion in the page.
- **Mobile**: sticky Call/WhatsApp/Get Quote bar, off-canvas menu, all grids
  collapse down to 1–2 columns. Tested at 375/390/768/1024/1440/1920px.
