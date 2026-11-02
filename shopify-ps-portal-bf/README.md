# SEVENCRUSH — PlayStation Portal · Black Friday (theme files)

Same landing as the Glow Ritual Set and the Switch 2 Black Friday page (`../shopify-switch2-bf/`):
same layout and `.gr-*` classes, so `glow-fix.css` and `glow-motion.js` style it the same. Black strip with
countdown, struck-through original price, "-30%" badge, "You save $X".

| File | What it does |
| --- | --- |
| `sections/ps-portal-bf.liquid` | The landing. Settings: product handle and "Sale ends" date (default `2026-11-30T23:59:00-05:00`). |
| `templates/product.ps-portal-bf.json` | Product template with only this section. |
| `preview/` | Screenshots with placeholder art. |

## The product to create in Shopify

Handle `playstation-portal-black-friday`, one option **Finish**:

| Finish (option value) | Compare-at (Sony US MSRP) | Price (-30%) | You save |
| --- | --- | --- | --- |
| `White` | $199.99 | **$139.99** | $60.00 |
| `Midnight Black` | $199.99 | **$139.99** | $60.00 |
| `30th Anniversary Limited Edition` | $219.99 | **$153.99** | $66.00 |

Option values must contain "Black" / "30" for the right names on the tiles and cards. Give each variant its
own photo. Optional unboxing photo: `psp-whats-in-the-box.jpg` in Settings › Files.
The 30th Anniversary was a limited run: only list it if you have units.

## Sections
Gallery + buy box (remote player included, choose your finish, "Your Portal") · How it works (Remote Play in
5 steps, cloud streaming with PS Plus Premium) · The finishes (3 cards) + specs · Original vs. Black Friday
table · Before you buy (needs a PS5, internet speed, no Bluetooth audio, no PS VR2) · FAQ · sticky bar.
