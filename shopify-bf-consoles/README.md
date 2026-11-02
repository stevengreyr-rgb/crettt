# SEVENCRUSH — Black Friday consoles v2 (Nintendo Switch 2 · PlayStation Portal)

Replaces `../shopify-switch2-bf/` and `../shopify-ps-portal-bf/` (those copied the Glow Ritual layout).
One new section, `sections/bf-console.liquid`, with its own dark Black Friday look (scoped `.bfx`, no
dependency on the Glow Ritual CSS/JS). The **Product** setting switches copy between Switch 2 and Portal;
the Switch 2 page is red/coral, the Portal page is blue/violet.

| File | Use |
| --- | --- |
| `sections/bf-console.liquid` | The landing. Settings: product (Switch 2 / Portal), handle, sale end date, low-stock threshold. |
| `templates/product.bf-switch2.json` | Assign to the Switch 2 product. |
| `templates/product.bf-portal.json` | Assign to the PlayStation Portal product. |
| `preview/` | Full-page screenshots rendered with placeholder drawings. |

## What's new compared to v1
1. **Hero**: product photo on a light plate, follows the pointer (tilt). Tap opens it full screen. A rotating -30% sticker and a sticky top strip with a live countdown.
2. **Price**: on load it counts down from the original price to the Black Friday price. "You save $X" pill. Shop Pay installments line from Shopify.
3. **Picker**: one row per edition/finish with photo, color dot, now/was price. Arrow keys work. A sold-out variant is marked and can't be added.
4. **Low stock**: "Only N left at this price" appears only when Shopify tracks the stock (deny overselling) and it's at or under the threshold (default 10). It never invents a number.
5. **Add to bag without leaving the page** (`/cart/add.js`): green "Added ✓" toast, then the theme's cart drawer opens. "Buy now" still goes to checkout.
6. **Savings receipt**: original price, -30%, free shipping, you pay. Updates with the selected variant.
7. **Quiz**: Switch 2, "What do you want to play first?" picks the bundle. Portal, "Do you have a PS5?" warns if not, then picks the finish. The answer selects the variant above.
8. **Comparison table**: what each edition includes, prices, and a "Choose" button that selects it and scrolls to the button.
9. **Feature grid, box/how-it-works steps, "No surprises after checkout"** (requirements up front), **searchable FAQ**.
10. **Closing countdown, mobile sticky bar** with price and Add button, reveal on scroll. Everything turns off with reduced motion.

## Products to create (price = Black Friday, compare-at = original US MSRP)
| Product / handle | Variant (option value) | Compare-at | Price |
| --- | --- | --- | --- |
| Nintendo Switch 2 · `nintendo-switch-2-black-friday` (option **Edition**) | `Console` | $449.99 | $314.99 |
| | `Mario Kart World Bundle` | $499.99 | $349.99 |
| | `Pokémon Legends: Z-A Bundle` | $499.99 | $349.99 |
| PlayStation Portal · `playstation-portal-black-friday` (option **Finish**) | `White` | $199.99 | $139.99 |
| | `Midnight Black` | $199.99 | $139.99 |
| | `30th Anniversary Limited Edition` | $219.99 | $153.99 |

Option values must contain `Mario` / `Pok` (Switch) or `Black` / `30` (Portal): labels, color dots, the
comparison table and the quiz read them. Give every variant its own photo (white background works best).

## Images
Higgsfield was checked on Nov 2: 300 image generations, the latest 100 uploads and all 10 projects are
skincare (LEZO, Booster Pro, Biodance). There are no Switch 2 or Portal photos there, and the account
has 0.12 credits. The page uses the product photos uploaded to Shopify instead.
