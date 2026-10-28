# LED product refinement — Oct 28

Draft theme: **SEVENCRUSH — LED gallery refinement Oct 28 (DRAFT, no publicar)**
(`gid://shopify/OnlineStoreTheme/168304640219`), a duplicate of the live theme
"LEZO — Home editorial + rotation — Oct 27" (`168258666715`). Nothing on the live theme, the
product catalog, prices, discounts or bundles was changed. The live theme is the rollback point.

Preview: `https://sevencrush.com/products/lezo-7-color-led-face-mask?preview_theme_id=168304640219`

Note: the existing unpublished theme "SEVENCRUSH — LED Editorial Refinement — Working…"
(`168291107035`) is an older snapshot of live (it still has the removed LEZO light-mode block and
lacks the "Shop all" title). It was left untouched; don't publish it.

## What changed (draft theme only)

| File | Change |
| --- | --- |
| `sections/sk-product.liquid` | Galleries curated in the theme (product media untouched). Booster Pro leads with the clean pink/black cutouts, keeping variant sync; its light-mode image follows; the duplicate cutouts and the image already used in the story section are gone. The neck massager drops the two supplier infographics with unsupported claims ("collagen production", "deep cleansing") and the image the story section reuses. Descriptive alt text replaces "LEZO front — original product visualization" and identical product-name alts. Neck: the 160° head image is shown uncropped and labelled "Design"; unverified certifications (RoHS/FCC/CE) and the raw AliExpress description (Chinese text, hot-linked images, unsupported claims) are no longer shown. Booster and neck how-to steps now include the button behavior shown on the suppliers' own device diagrams. |
| `layout/theme.liquid` | Written meta descriptions for the neck massager, Booster Pro and Biodance, whose descriptions open with "SPECIFICATIONS Brand Name: NONE…" or an internal "SEVENCRUSH / …" label. |
| `assets/sk.js` | The mobile sticky "Add to bag" bar waits until the main button has scrolled away. Before, it showed on load and covered the product name and price on iPhone. |
| `assets/hb.css` | `.hb-story figure.is-product`: square, white, uncropped product images in story sections. |

Verified on the draft (iPhone 13 and 1440 px desktop): no horizontal overflow on any of the four
skincare pages; Booster Pro finish switch updates price and scrolls the gallery to the matching
cutout; add to bag adds the chosen variant; LEZO color explorer lights the right channels; "Buy it
now" reaches Shopify checkout; no theme script errors.

## Image generation

Not run: the Higgsfield account has 0.09 credits. Per the brief, the existing images were kept
and the briefs below were written instead. Before any image is generated or shot, the LEZO
product question under "Needs real product information" has to be settled, because every LEZO
image depends on it.

### Rules for every image

- Reference: the physical product, or the supplier photos named per product. Never the current
  LEZO renders (see below).
- 1:1 for gallery slides (2048 × 2048 master, exported as WebP), 4:5 for story sections.
  The theme crops galleries to 1:1 on mobile.
- Seamless warm-grey or bone background (#ECE7E2 to #F4F0EC), one large soft key light from
  camera-left, a fill card on the right, a soft contact shadow. Daylight white balance (5200–5600 K)
  across the whole set.
- LED glow is shot in camera (dim ambient, true LED color, no added bloom or particles).
- No text baked into gallery images. Labels live in HTML next to the image.
- Models: real skin texture, no retouching beyond blemishes, natural poses, mask or device
  positioned as the manual shows.

### LEZO LED Mask (8 images)

Product reference: the physical unit. If it is the SUOLAER mask (see below), it has a round
power button with a logo at the top of the forehead, grey/silver housings at the temples, a grey
elastic strap, and ships with a USB cable and a manual.

1. **Hero** — mask at a three-quarter angle, LEDs off, on the seamless background. Forehead button,
   eye/nose/mouth openings and strap housings sharp. Second take with red on, same position.
2. **In use** — model reclined on a sofa or bed, mask on, strap adjusted, red light on, eyes
   closed. Hands relaxed, not holding the mask.
3. **Materials** — macro triptych: shell surface at the eye opening, strap and housing joint,
   inner LED layout (only if the inside is visible on the real unit).
4. **Light explained** — clean editorial cross-section of skin (epidermis, dermis, hypodermis)
   with three restrained beams labelled 470, 520 and 630 nm. No depth arrows, no claims of what
   each beam does. The explanation goes in HTML below the image.
5. **Seven modes** — the real mask photographed in each of its seven colors, same framing, as a
   7-up grid (or seven gallery frames). Color name only; wavelengths only where verified.
6. **Daily use** — evening routine scene: bathroom vanity or bedside, mask, folded towel,
   a cleanser. Model putting the mask on.
7. **Details** — flat lay of exactly what is in the box (mask, strap, cable, manual) on the
   seamless background.
8. **Routine** — model reading in an armchair with the mask on, used with an HTML block that
   states the manual's session time and frequency. Leave the routine copy out until the manual
   is in hand.

### Booster Pro Wand (8 images)

Product reference: supplier cutouts `sc-booster-pink.jpg` and `sc-booster-black.jpg`.
Teardrop head with a red ring, silver collar, digital display, round power button, charging port
at the base.

1. **Hero** — pink and black standing side by side, three-quarter view, heads lit red.
2. **In use** — model gliding the wand along the cheekbone, head flat against the skin.
3. **Materials** — macro of the teardrop head and collar, and of the display showing a number.
4. **Light explained** — head lit in each available color in a clean row; label the colors only.
   The listing gives no wavelengths, so none are shown.
5. **Light modes** — the head photographed in each color the manual lists. The supplier images
   disagree (one lists orange, another yellow), so take the list from the manual.
6. **Daily use** — vanity scene with the wand standing next to a serum.
7. **Details** — box contents flat lay (wand, charging cable, manual, anything else actually
   included).
8. **Routine** — hand pressing the power button, with the manual's steps in HTML.

Don't show or mention microcurrent, EMS or "electroporation" (claimed on the supplier images)
unless the manual confirms them and the claim can be substantiated.

### Face & Neck Massager (8 images)

Product reference: the two real photos (box and unboxed). Curved white head with a chrome edge
and a strip of LEDs, black mode display, M button and power button, white handle with a chrome
base.

1. **Hero** — device at a three-quarter angle on the seamless background, LED strip lit purple
   (as in the supplier lead image).
2. **In use** — model gliding the head upward along the neck, chin slightly raised.
3. **Materials** — macro of the chrome edge and the LED strip, and of the display and buttons.
4. **Light explained** — the head lit in each color in a row, color names only.
5. **Modes** — display close-ups for the seven modes, in HTML or as one clean frame.
6. **Daily use** — vanity or travel-bag scene: the device fits next to everyday items (it is
   13.9 × 8.8 × 3.8 cm).
7. **Details** — box contents flat lay: device, USB-C cable, manual.
8. **Routine** — the three manual steps photographed, with the steps written in HTML.

## Needs real product information

1. **Which mask is LEZO?** All five LEZO product images and the four editorial images are AI
   visualizations (their alt text said so). They show a smooth shell with no forehead button and a
   woven strap. The supplier listing for the "Rechargeable Facial LED Mask" (SUOLAER, created the
   same day, 690 in stock, not on the online store) shows a different design with a forehead
   power button. Confirm which physical mask LEZO customers receive, and send photos of it. Until
   then the current images stay, but they may not represent the product accurately.
2. **LEZO wavelengths.** LEZO copy says every mode mixes three channels (470, 520, 630 nm). The
   SUOLAER listing gives yellow as 590 nm and lists purple, cyan and a "laser" mode. The manual
   or the supplier must confirm which is right before the color explorer or a wavelength
   graphic is final.
3. **Session time and frequency** for all three devices. None of the listings states them
   reliably (one SUOLAER image says 15 minutes). The how-to copy points to the manual until the
   numbers are known.
4. **Neck massager certifications.** RoHS/FCC/CE appear only in the supplier listing. They were
   removed from the specs; add them back only with documents.
5. **Booster Pro price.** Pink is $175.68, black $175.60. Probably unintended; not changed.
6. **Delivery time.** The LEZO description says "delivery in 5–12 days"; the shipping policy and
   the theme say 11–16 business days in total. Update the description.
7. **Spanish storefront pieces.** The cookie banner and checkout (`/checkouts/…/es-us`) appear in
   Spanish for US visitors; the privacy policy is in Spanish too. Check Settings › Languages
   (default language) and the customer privacy banner.
8. **Product titles in cart and checkout** are still the supplier SEO strings ("NEW Booster Pro
   Led Facial Light Therapy 7 Colors Eye Beauty Wand…"). The theme shows short names on product
   pages, but the cart, checkout and order emails use the product title. Renaming is a catalog
   change on the live store, so it was left for approval.
9. **Neck massager description** in admin is still the raw supplier import. The theme no longer
   shows it, but it remains the source for Google Shopping and any other channel.
