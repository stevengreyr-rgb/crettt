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
