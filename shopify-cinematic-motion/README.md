# SEVENCRUSH — Cinematic Motion (Nov 16)

Draft theme **"SEVENCRUSH — Cinematic Motion (borrador) — Nov 16"**, a copy of the live theme
"Earbuds landing (Nov 7)". Not published. Home page and the Everyday Earbuds product page are rebuilt as one
scroll-told story; header, footer, side bag logic, checkout and discounts are the live theme's.

## Files in the theme (sources in this folder)
| File | What it is |
|---|---|
| `sections/sc-cinema.liquid` | The whole story: 6 scenes + FAQ + sticky bar. Every word, image and hotspot is a setting in the theme editor. |
| `assets/sc-cinema.css` | Styles (own `cnm-` namespace; the clinical CSS already uses `cx-`). Also refines the side bag's open/close curve. |
| `assets/sc-cinema.js` | Interactions + scroll scenes. GSAP 3.12.5 + ScrollTrigger from cdnjs, deferred. |
| `snippets/sc-cinema-img.liquid` | Responsive `image_tag` helper. |
| `templates/index.json`, `templates/product.json` | Both use the section with the store's own photos. |

## The story
1. **Reveal** — studio packshot opens from a clipped frame, headline rises line by line; on scroll the product sinks back
   and the copy lifts away. Price and "Choose your set" on the first screen.
2. **Details** — sticky stage: scrolling turns between three real studio angles (pair, single earbud, case) and the camera
   moves in on each. Drag/swipe, arrow keys, ticks and a zoom lens (double-click to zoom where you point). Labelled
   *"Studio photos of the product, not a 3D render."*
3. **Experience** — the editorial portrait opens from a circle to full screen (scroll-scrubbed clip-path).
4. **Benefits** — sticky image column; each benefit swaps its own photo with a clip-path wipe and fills a progress line.
5. **Routine** — real unboxing photo with two hotspots, box contents list, then a horizontal rail ("A day with them")
   with arrows and dots. Optional "Pairs well with" products (setting, empty by default).
6. **Offer** — Single / Duo / Complete set (1 / 2 / 3 pairs). Price counts to the new total, ×N badge, savings line,
   reward bar (−15% / −25%), View Transition on change. Add to cart opens the side bag; the button morphs to a check.
   Bundle savings are the real automatic discounts *Earbuds Duo — 15% off 2 pairs* and *Earbuds Trio — 25% off 3+*.

Plus: top scroll progress line, chapter index (desktop), sticky buy bar (after the first screen, hidden at the offer),
animated FAQ (open and close), moving banner.

## Why no 3D model
The product has no 3D model (GLB/USDZ) in Shopify. Generating one would invent geometry, so the "3D" scene uses
the real studio photos as angles and says so. When a faithful model exists, upload it to the product as 3D media and
it can replace scene 2 with `<model-viewer>`.

## Performance & accessibility
- Without JavaScript (or if the CDN is blocked) every scene renders as a normal, complete page; tall sticky scenes are
  only switched on after GSAP loads (`html.cnm-on`).
- `prefers-reduced-motion`: no scroll scenes, no marquee, no count-up, no transitions.
- Animations use transform / opacity / clip-path; one rAF-throttled scroll listener; images lazy except the packshot
  (`fetchpriority=high`).
- Tiers are a radiogroup with arrow keys; the angle viewer is keyboard-operable; live regions for caption, reward and errors.
