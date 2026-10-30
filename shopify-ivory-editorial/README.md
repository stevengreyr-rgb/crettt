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
| `sections/sc-editorial-offers.liquid` | Under the landing: the three creatives from the previous cover (`sc-refined-red/daily/gel-oct29.png`) with live prices, then "Before you choose". |

LEZO photos are studio shots only: travertine plinth (`sc-mask-gallery-front-final.png`) first in
the gallery and on the "Single product" card, then the white studio set, the close-up and the model
portrait.

The home opens on the Booster Pro landing; product bar and menu read Booster Pro · LEZO ·
Biodance (`snippets/hb-header.liquid`). LEZO's light-color chips are tappable: one short line
under them says what each color is used for (cosmetic wording, no treatment claims).
