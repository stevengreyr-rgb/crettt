# SEVENCRUSH — Glow Ritual Set (theme files)

Changed files from the unpublished theme **"SEVENCRUSH — Glow Ritual Set (listo para publicar)"**
(`gid://shopify/OnlineStoreTheme/168448884955`). Home and product page both use `glow-set` + `glow-light-science`.

Preview: `https://sevencrush.com/products/sevencrush-glow-ritual-set-led-mask-eye-wand-collagen-duo?preview_theme_id=168448884955`

## Director pass (Nov 1)
Same structure and copy order; finer details and motion.

- **Repeated images out of the gallery.** The "How it works" tile (repeated the "How the ritual works"
  section) is gone, and the LEZO light infographic is skipped in the theme (it repeated the Booster Pro
  one and said "six colors" while the set has seven). The product media itself is untouched. 8 slides now.
- **Type:** Inter Tight for everything, Instrument Serif italic for one accent per headline
  ("Five steps. *Twenty minutes.*"), hairline eyebrows, tabular prices.
- **Details:** SVG gallery arrows, drawn check marks in "Your set", serif step numerals, refined tiles,
  CTA with slow shine, + that turns to × on FAQ/specs, FAQ title no longer repeats "Good to know".
- **Bug fix:** the light beams in "Know your light" were nearly invisible (SVG glow filter clipped on
  vertical lines). Filter now uses user-space units, so the beams glow.
- **Motion** (`assets/glow-motion.js`, styles at the end of `assets/glow-fix.css`): first-screen entrance,
  headlines rise word by word, eyebrows settle, blocks rise staggered on scroll, photos open like a
  curtain, beams draw down into the skin, FAQ/specs slide. Off with reduced motion; a 2.6 s CSS safety
  shows the first screen even if the script never loads.

## Carousel (Nov 1)
Gallery in the format of an editorial skincare carousel: full-width slide, square thumbnails (active one
framed in ink, the rest faded), round arrows with dots underneath. 9 slides: the set, the Booster Pro skin
infographic, the unboxing photo, the three combo photos, the wand and the two collagen duos. The LEZO skin
infographic stays out (it repeats the Booster Pro one).

Unboxing photo: `sc-whats-in-the-box.jpg` (Settings › Files; copy here). Customer flat-lay "everything that
came in the box" with the SEVENCRUSH card removed (fabric patched in). Shown whole, on a blurred copy of itself.

## Cart drawer (Nov 2)
`snippets/sk-cart-drawer.liquid` only (sk.js untouched: prices, quantities, discounts and checkout work as
before). "Your bag" with a count pill, round close button (no square focus box), free-shipping banner with a
filled bar, product photo contained on a soft tile, the Glow Ritual Set's long title shortened and its
options shown as color chips (Wand · Pink / Collagen · Blue) plus what's in it, rounded quantity pill, remove
with an icon, Subtotal / Shipping Free / big Total, pink "Secure checkout" pill with a lock, trust line
(returns, secure payment, Card · PayPal · Shop Pay), designed empty state. Lines rise in when the drawer opens.
The Glow Ritual theme is now live, so this went to the copy "SEVENCRUSH — Glow Ritual · carrito pro (borrador)"
(`gid://shopify/OnlineStoreTheme/168458911963`); publish that copy to put it live.
