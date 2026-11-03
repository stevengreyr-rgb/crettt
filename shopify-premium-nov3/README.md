# SEVENCRUSH — Premium Experience (Nov 3)

Exact copy of the live theme **"SEVENCRUSH — Glow Ritual Set"** (`168448884955`), edited as
**"SEVENCRUSH — Premium Experience (borrador) — Nov 3"** (`gid://shopify/OnlineStoreTheme/168504754395`, unpublished).
Same look (Inter Tight + Instrument Serif, pink #e8508a, ink), tighter and more honest buying path.

Preview: `https://sevencrush.com/products/sevencrush-glow-ritual-set-led-mask-eye-wand-collagen-duo?preview_theme_id=168504754395`

## What changed
- **The 40% offer is visible before the bag.** The automatic discount "40% OFF - Oferta 4 dias" (ends 2026-11-07 04:59 UTC)
  was only revealed in the cart. Now: $114.00 ~~$189.99~~ −40%, a line with a live countdown, the CTA and sticky bar show
  $114.00, the top strip and the collection card show the offer. Controlled in **Theme settings › SC Offer**
  (on/off, %, name, end time); it switches itself off at the end time, also on cached pages (`snippets/sc-offer.liquid`).
  It only *displays* the offer: the discount itself lives in Shopify admin › Discounts.
- **Compare-at price on the product page** ($290.96 / Save $100.97) when no offer runs — the collection already showed it.
- **Add to bag no longer reloads to /cart**: it opens the side bag (`window.SK.addItems`), with spinner and "Added ✓".
  Buy it now still goes straight to checkout. Errors show under the button.
- **Premium bag drawer** (from the "carrito pro" draft): free-shipping banner, option chips, Subtotal / Discount / Free shipping / Total, secure checkout pill, trust line.
- **Phone first screen**: thumbnails and arrow row hidden on phones (swipe + pill dots + 1/9 counter), so name, price and the
  offer are visible without scrolling.
- **5% popup no longer interrupts**: was opening after 8 s on every page (covering the buy box on phones). Now only after
  half the page is read and 15 s, or exit intent on desktop; never on /cart, never with something in the bag, never during the offer.
- **Less filler**: removed "Raise your frequency. Restore your ritual."; steps compacted into one list on phones;
  "What's inside" tiles lose the overlapping small print on phones; the "Get 5% off" link/price hides during the offer.
- **Collection**: the single product shows as a feature card (proper name "The Glow *Ritual Set.*", not an uppercase SKU title), CTA "Build my set".
- **Empty bag page**: was "Shop the line-up / See the rituals / save 20%" (dead links, old offer). Now a designed card back to the set.
- **Cart page**: Shipping Free row, "Secure checkout", returns + payment line.

## Files (all in the copy theme; checksums verified after upload)
`layout/theme.liquid` (loads `glow-premium.css`), `assets/glow-premium.css` (new), `sections/glow-set.liquid`,
`sections/hb-footer.liquid`, `sections/hb-cart.liquid`, `snippets/hb-card.liquid`, `snippets/hb-header.liquid`,
`snippets/sc-offer.liquid` (new), `snippets/sk-cart-drawer.liquid`, `config/settings_schema.json`, `config/settings_data.json`.

## Clean pass (round 2)
Feedback: "se ve desordenado y amontonado". Buy box rebuilt as one clear path:
name › one-line promise › price (one row: $114.00 ~~$189.99~~ −40%) › one quiet line with the countdown ›
2 choices › 1 button.
- Removed: eyebrow over the title, "Free US shipping" chip in the price row, the offer box (now one line),
  step 1 "Your LED mask · included" (not a choice; it's in the promise line), the "Your set" summary (repeated the tiles),
  the 1/9 counter (dots already show it), the three trust boxes (now one quiet line), the sticky bar's variant text,
  the footer sign-up perks list.
- "Buy it now" is a quiet text button under the main CTA instead of a second big button.
- Choice tiles: color name first ("Pink / Booster Pro"), roomier, selected = ink outline (calmer than pink everywhere).
- "Is it right for you?" section folded into the FAQ ("Is it right for me?"), same safety text.
- No more mixed prices: the "Mask + wand" tile shows "3-in-1" instead of $189.99, and the clinic table shows the offer price while it runs.
- One gap between the landing and "Know your light"; that section now shares the same left edge.
Phone page: 7,268 → 6,351 px tall.
