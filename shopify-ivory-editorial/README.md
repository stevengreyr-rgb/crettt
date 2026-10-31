# SEVENCRUSH — Ivory Editorial (theme files)

Changed files from the unpublished theme **"SEVENCRUSH — Ivory Editorial — Oct 30"**
(`gid://shopify/OnlineStoreTheme/168390000859`). Everything else in that theme is unchanged.

Preview: `https://sevencrush.com/?preview_theme_id=168390000859`

| File | What it does |
| --- | --- |
| `snippets/hb-kits.liquid` | "Select your ritual" picker. Same offers and prices as before. Tapping a card opens it: the saved photo of everything in it (`sc-white-daily-final.png`, `sc-white-collagen-final.png`, `sc-white-complete-final.png`; product photo for the single option), the finish/skincare choice and a "What's inside" list with each item's price, the 20% saving and the total. "Best value" tag on The Complete Routine. |
| `assets/ivory.js` | Keeps the opened card in view; tapping a card's photo opens it full screen (`<dialog>`, closes with ×, Esc or a tap). |
| `assets/ivory.css` | Styles for the card photo, "What's inside", the full-screen view and the light-color chips. |
| `sections/sk-product.liquid` | The LEZO "Six colors. One mask." explorer section is removed. Under the description, LEZO now lists only its six light colors as chips (red, green, blue, yellow, purple, cyan). |
| `sections/sc-editorial-offers.liquid` | Under the landing: the three creatives from the previous cover (`sc-ed2-lezo.png`, `sc-refined-daily-oct29.png`, `sc-refined-gel-oct29.png`) with live prices, then "Before you choose". |

LEZO photos are studio shots only: travertine plinth (`sc-mask-gallery-front-final.png`) first in
the gallery and on the "Single product" card, then the white studio set, the shell close-up, the LED macro and the strap. No AI-looking
model shots: the floating-mask portrait and the red creative (LEDs drawn on the outside of the
shell) are out.

The home opens on the Booster Pro landing; product bar and menu read Booster Pro · LEZO ·
Biodance (`snippets/hb-header.liquid`). LEZO's light-color chips are tappable: one short line
under them says what each color is used for (cosmetic wording, no treatment claims).

## Light-through-skin infographics (Oct 31)
`infographics/lezo-light-layers.jpg` and `infographics/booster-light-layers.jpg` (also in
Settings › Files). Skin cross-section rendered with Higgsfield (no text), labels set on top with
`infographics/compose.py` so every word is exact. LEZO: 470/520/590/630 nm as listed by the maker,
purple and cyan noted as mixes. Booster Pro: colors only, no wavelengths (the maker lists none).
Cosmetic wording only. Shown uncropped on a matching cream background (`.is-info`): second slide in
the LEZO carousel, after the finishes in the Booster Pro carousel.

## Light & Hydration photo follows the skincare color (Oct 31)
Only Light & Hydration swaps its photo: blue Cera-Nol shows `sc-bundle-collagen-blue` (Settings ›
Files; copy in `bundle-photos/`). Every other card keeps its fixed studio shot.

## Booster Pro "In use" photo (Oct 31)
The "Two minutes, closer." section opens on a wide campaign shot, `sc-booster-campaign-oct31.png`
(Settings › Files): close-up of a model pressing the black Booster Pro to her cheekbone, dewy skin,
red glow with light rings, on a light gray seamless. Rendered with Higgsfield from the product photo.
Full width (`.is-wide`: 16:9, 4:3 on phones) with the text underneath. It replaces the
hands-on-white `sc-white-wand-oct30.png`, which stays as the first gallery slide. No result
percentages: the maker publishes no test data.

## Floating add-to-bag bar (Oct 31)
The old sticky bar never showed in this theme (it watched the hidden native form). `ivory.js` now
adds `.iv-bar`: once the "Add to cart" button is off screen it slides up and follows the scroll,
with the chosen option's photo, name, was/now price (price ticks when the choice changes) and its own
button, which adds exactly what the main button adds and flashes "Added ✓". Floating card on phones,
centered pill on desktop; the page gets bottom padding while it shows so nothing hides behind it.

## Booster Pro variant photos, FAQ markers, footer colors (Oct 31)
- "Single product" on Booster Pro now shows the product alone, no hands: `sc-booster-pink-hd.png` /
  `sc-booster-black-hd.png` (Settings › Files, 1800×2400, upscaled and sharpened from the studio
  shots). The photo follows "Choose your option" (`data-iv-photos` keyed by variant index), and the
  floating bar picks it up.
- "Before you choose": iOS drew the `<summary>` marker as a blue ▶️ emoji. The marker is hidden and
  replaced with a thin +, which turns into × when open.
- Footer: the base theme colored its text for a dark footer (white headings, near-white links), so on
  the ivory background it read as blank. Headings, links, the tagline, the bottom line and the list's
  fine print now use the ivory ink colors.

## Clearer buttons and a slow scroll reveal (Oct 31)
`ivory.js` / `ivory.css` only, no Liquid changes.
- Finish and skincare dropdowns are now buttons, one per option, with a color dot (pink, black, blue)
  and the price or contents underneath. The hidden `<select>` still drives `sk.js` and the photo swap;
  arrow keys move between options. The card photo fades while it swaps.
- Closed ritual cards say "Tap to choose →", press in slightly on tap and lift on hover; the chosen card
  unfolds slowly and its radio pops.
- "Add to cart" lifts on hover, presses in on tap, has a slow shine, ticks its price when it changes and
  confirms "Added ✓" in green.
- FAQ and product-info accordions slide open (0.9 s) and closed instead of snapping.
- Scroll reveal: blocks below the fold (story, ritual cards, accordions, FAQ, newsletter, footer columns)
  rise 34 px and fade in over ~1.5 s, staggered 130 ms when several arrive together. The editorial
  banners use the same slower timing. Nothing above the fold is hidden, and reduced-motion turns it all off.

## Ritual photos follow every choice (Oct 31)
Each ritual's photo now matches the wand finish and skincare picked (Settings › Files; copies in
`bundle-photos/`):

| Ritual | Black / Pink Collagen | Black / Blue Cera-Nol | Pink / Pink Collagen | Pink / Blue Cera-Nol |
| --- | --- | --- | --- | --- |
| The Daily Ritual | `sc-white-daily-final` | — | `sc-white-daily-pinkwand` | — |
| The Complete Routine | `sc-white-complete-final` | `sc-white-complete-black-blue` | `sc-white-complete-pink-pink` | `sc-white-complete-pink-blue` |
| Light & Hydration | `sc-white-collagen-final` | `sc-bundle-collagen-blue` | | |

The new shots are edits of the existing studio photos, not new renders: the wand body recolored to the
pink finish (display kept black), the pads, jar and ampoule shifted to the Cera-Nol blue, and the labels
rewritten to the real Cera-Nol wording (CERA-NOL GEL TONER PADS, HYDRO CERA-NOL AMPOULE, Moisturizing,
Strengthening). Scripts in `bundle-photos/tools/`. On the Biodance page the pads + free ampoule card
swaps between `sk-cut-collagen-duo` and `sk-cut-ceranol-duo`.
"What's inside" names the picked items too (Booster Pro Wand · Pink, Cera-Nol Gel Toner Pads, Hydro
Cera-Nol Ampoule) via `data-iv-names`. Checked on the preview: all 8 combinations swap photo and names,
and pink wand + blue Cera-Nol adds exactly those variants to the cart ($232.80).

## Pink wand redone with the real product photo; welcome offer photo (Oct 31)
- The pink-wand ritual shots (`sc-white-daily-pinkwand`, `sc-white-complete-pink-pink`,
  `sc-white-complete-pink-blue`) no longer recolor the black wand, which looked gray and rough. The real
  pink product cutout (`sk-cut-booster-pink.png`, same shape as the black one) is fitted onto the black
  wand's exact position and size (`tools/fit.py`), the old wand's rim is filled from the background, and
  a soft contact shadow sits it on the plinth (`tools/place.py`). Same filenames, replaced in Files.
- The 5% welcome pop-up (`sections/hb-footer.liquid`, now in this folder) shows the live store's cover
  shot, `sc-mask-reference-hero-final.png`: the model with the lit LEZO mask over her face. Framed at
  `50% 28%` so the mask and her face both stay in on phones.
