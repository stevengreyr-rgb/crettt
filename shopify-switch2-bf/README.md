# SEVENCRUSH — Nintendo Switch 2 · Black Friday (theme files)

Same landing as the Glow Ritual Set (`../shopify-glow-ritual/sections/glow-set.liquid`): same layout,
same `.gr-*` classes, so the live theme's `glow-fix.css` and `glow-motion.js` style and animate it
exactly the same. Added on top: black Black Friday strip with a countdown, struck-through original
price, "-30%" badge on the first photo and "You save $X".

| File | What it does |
| --- | --- |
| `sections/switch2-bf.liquid` | The landing. Settings: product handle (for the home page) and "Sale ends" date for the countdown (default `2026-11-30T23:59:00-05:00`). |
| `templates/product.switch2-bf.json` | Product template that uses only this section. Assign it to the Switch 2 product. |
| `preview/` | Screenshots rendered locally with placeholder art (no real photos yet). |

## The product to create in Shopify

Handle `nintendo-switch-2-black-friday`, one option **Edition**, prices in the product (the page reads them):

| Edition (option value) | Compare-at (original, US MSRP) | Price (-30%) | You save |
| --- | --- | --- | --- |
| `Console` | $449.99 | **$314.99** | $135.00 |
| `Mario Kart World Bundle` | $499.99 | **$349.99** | $150.00 |
| `Pokémon Legends: Z-A Bundle` | $499.99 | **$349.99** | $150.00 |

Option values must contain "Mario" / "Pok" / "Bundle" for the right names and the "download code" line.
Give each variant its own photo (variant image): the gallery jumps to it when the edition changes.
Optional: an unboxing photo named `sw2-whats-in-the-box.jpg` in Settings › Files becomes slide 2 and the
"What's in the box" photo.

## Sections (same order as the Glow Ritual Set)
1. Gallery + buy box: console included (step 1), choose your edition (step 2, each with now/was price),
   "Your bundle", Add to bag / Buy it now, delivery dates, trust row.
2. What's in the box (5 numbered items, from Nintendo's box contents).
3. The editions: three dark cards, each picks its edition and scrolls to the form. Specs at a glance.
4. Original price vs. Black Friday table (built from the variants).
5. Before you buy (microSD Express, Switch Online, download codes).
6. FAQ, trademark note, sticky add-to-bag bar.
