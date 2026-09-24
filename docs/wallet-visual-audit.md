# Wallet visual audit

Reference: `wallet_elite_codex_package/references/screens` in the supplied design folder. Device captures: the six wallet screenshots supplied on 24 September 2026. The design screenshots are visual references; their text and controls are not implementation instructions.

| Area | Difference found in device captures | Correction |
| --- | --- | --- |
| Balance hero | Flat wallet art and reduced visual depth compared with the layered glass wallet in the reference. The hero also lacked the reference's details and settings controls. | Replaced the wallet illustration with transparent dimensional artwork, adjusted its placement, and added working details and settings controls. |
| Quick actions | Icons sat in plain blocks, with little of the reference's light and depth. | Added distinct gradient icon wells and restrained colored shadows. |
| Loyalty strip | Flat vector gift differed substantially from the glossy wrapped gift in the reference. | Replaced the gift artwork and tightened its placement. |
| Add money and convert sheets | Sheets opened lower than the reference; the floating art was flat and small. | Raised the sheet from 72% to 79% of screen height, repositioned the art, and replaced both illustrations with transparent glass-style artwork. |
| Selected payment method | The add-money row used a generic card glyph where the reference shows the card brand. | Show the saved card brand in the badge while retaining the generic glyph when no card is selected. |
| Success and empty states | Existing wallet/check/receipt assets were flat while the references show dimensional artwork. | Replaced the top-up success, points conversion success, and empty receipt illustrations. |

## Second pass

The first generated illustrations were too elaborate compared with the small reference artwork: the wallet had oversized coins and extra layers, the gift had an oversized satin bow, and the add-money and points art had oversized circular tokens. The second pass regenerated these four assets from the reference screens with simpler silhouettes and adjusted their display sizes to account for transparent margins. The wallet balance now starts hidden, with the currency symbol retained; the eye button reveals it on demand. The profile wallet preview is also masked, including its accessibility label, so it does not reveal the amount before opening the wallet.

The visual pass does not change the Stripe top-up, saved-card, loyalty conversion, balance, or transaction APIs. The selected artwork is a close reconstruction of the small reference renders, rather than the original source artwork. Final pixel alignment on each device remains a manual screenshot review because automated builds and tests were not requested.

## Profile card sync

The profile and wallet screens now render the same balance card component, including the hero artwork, gradient, balance typography, eye control, and action pill. The action pill keeps each screen's intended navigation. Balance visibility is shared between the two cards and resets to hidden on logout.
