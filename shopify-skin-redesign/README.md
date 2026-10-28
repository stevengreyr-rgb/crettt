# SEVENCRUSH — premium skincare redesign (theme files)

Source for the draft theme **"SEVENCRUSH — Premium skincare redesign (DRAFT, no publicar)"**
(`gid://shopify/OnlineStoreTheme/168283472091`), a duplicate of the live theme. Only the files
below were added or changed; everything else in that theme is identical to live.

| File | What it does |
| --- | --- |
| `layout/theme.liquid` | Routes the 4 skincare products to the new landing; adds `sk.css`/`sk.js`, the footer and the cart drawer to the home page. All other branches are unchanged. |
| `templates/index.json` | Home: the existing LEZO hero (`main`) followed by the five new sections. |
| `sections/sk-home-products.liquid` | Intro + six product cards (live prices, quick add). |
| `sections/sk-home-led.liquid` | LEZO three-channel / seven-mode explorer + the 5-step guide (`#como-usar`). |
| `sections/sk-home-lifestyle.liquid` | Editorial photos (`#ritual`, linked from the hero nav). |
| `sections/sk-home-bundles.liquid` | Bundle builder (`#sk-bundles`). |
| `sections/sk-home-journal.liquid` | Routine notes + WhatsApp / email support. |
| `sections/sk-footer.liquid` | Footer for home and landings. |
| `sections/sk-product.liquid` | Product landing for all four products (copy and image file names per product live in its `case`). |
| `snippets/sk-bundles.liquid` | The Daily Ritual / Light & Collagen / The Complete Routine. |
| `snippets/sk-cart-drawer.liquid`, `snippets/sk-header.liquid`, `snippets/sk-img.liquid` | Shared pieces. |
| `assets/sk.css`, `assets/sk.js` | Styles and behavior (cart drawer, bundles, variants, sticky add to cart, LED explorer). |

## LED product refinement (Oct 28)
See `LED-REFINEMENT.md`: gallery curation, copy and mobile fixes on the draft theme
`168304640219`, eight-image production briefs per LED product, and the open product questions.

## Hero is kept as is
The home hero is still rendered by `lezo-studio.js` / `lezo-premium.js`. `sk.js` removes the
app's own chapters below the hero (`#main > :not(#mask3d)`) and routes its "Add to bag" and bag
button into the new cart drawer, so the page has one cart.

## Bundle discount
Automatic discount **"Ritual bundle · 20% off 2+"**: 20% off the LEZO mask, Booster Pro and
Biodance pads/ampoules when the cart holds 2 or more of them. It does not combine with other
product or order discounts. The storefront only displays prices computed from live variant
prices; checkout applies the discount.

## Swapping photos
Home sections expose image pickers in the theme editor. Landing-page images are referenced by
file name (Settings › Files) in `sections/sk-product.liquid`; upload a new file and change the
name in that product's `case` branch.
