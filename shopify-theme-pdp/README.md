# SevenCrush PDP rebuild — source of the files uploaded to Shopify

Working theme (unpublished): "SC — PDP rebuild (WIP, no publicar)" — id 167226999003,
duplicated from the live theme "SEVENCRUSH — Studio redesign Sep 30" (167197409499), which was NOT modified.

- sections/product-*.liquid   reusable PDP sections (Theme Editor settings/blocks)
- sections/sc-product.liquid  buy box: full gallery, honest trust row, ETA, payment icons, sticky bar
- snippets/pdp-card.liquid    product card (rating, price, quick add)
- assets/pdp-system.{css,js}  shared styles + behaviour (reviews, FAQ, video, recs, analytics events)
- assets/studio-product.js    variant/cart logic (unchanged behaviour) + sticky variant/thumbnail + events
- templates/product*.json     per-product compositions (beauty / gaming / jewelry / generic)
- sections/home-*.liquid, assets/home-dynamic.*, templates/index.json: redesigned home (video hero kept, ticker + shop-by-need tabs before products). studio-video-hero.liquid: CTA anchor changed to #start.
