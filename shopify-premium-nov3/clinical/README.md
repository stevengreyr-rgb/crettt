# SEVENCRUSH — Clinical Edit (Nov 3)

Draft theme **"SEVENCRUSH — Clinical Edit (borrador) — Nov 3"** (`gid://shopify/OnlineStoreTheme/168541618395`),
a copy of "Premium Clean". Whole storefront re-dressed in a quiet clinical-editorial language
(inspired by the style of a reference the merchant shared; own brand, own copy, nothing copied):

- **Type:** Bodoni Moda for display (italic for the benefit line), Jost tracked for text and buttons.
- **Color:** slate `#4F6168` and navy `#1D2236` on white, mist `#F2F4F4`. No gradients, square corners, hairlines.
- **Header** (`snippets/hb-header.liquid`): slate announcement bar with arrows (offer countdown → free shipping →
  returns), wordmark between "At-home light skincare" and "The Glow Ritual", navy assurance bar.
- **Product / home** (`sections/glow-set.liquid`, rewritten): gallery with thin ← | → arrows (+ thumbnails on desktop),
  serif title, real price with compare-at, offer note, square option tiles, navy "Add to bag", outlined "Buy it now",
  fact list. Slate story block: 4 italic benefits + "Most at-home routines stop halfway." problem → solution copy.
  The ritual (roman numerals), In the box (3 photo cards with captions), Clinic or home table, FAQ, sticky bar.
- **Everything else** (`assets/sc-clinical.css`, loaded last): bag drawer, bag page, collection card, footer + sign-up,
  "Know your light", policy pages — same palette and type. Variant logic, bag drawer, offer settings unchanged.
- `layout/theme.liquid`: loads Bodoni Moda + Jost and `sc-clinical.css`.

Preview: https://sevencrush.com/products/sevencrush-glow-ritual-set-led-mask-eye-wand-collagen-duo?preview_theme_id=168541618395
