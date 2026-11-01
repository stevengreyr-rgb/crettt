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

## Editorial carousel (Nov 1)
Gallery in the format of an editorial skincare carousel: full-width slide, square thumbnails (active one
framed in ink, the rest faded), round arrows with dots underneath. Order (14 slides):
set on white → **Hands-free, any night** (sofa, red) → Booster Pro light infographic → **Sized for the eye
area** (wand in use) → **One LED in every cell** (LED macro) → **Stays put, no hands** (strap) → **Out of the
box** (unboxing) → **Fits your night routine** (bed, blue) → the three combo photos → wand and collagen cutouts.
The six added slides are existing photos from Settings › Files with a cream title band; titled thumbnails.
None of them repeat photos used further down the page. Edit the list in `ed_a` / `ed_b` at the top of the gallery.
