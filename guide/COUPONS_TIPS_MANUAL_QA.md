# Customer offers, tips, and inventory — manual acceptance

No automated validation was run for this change. Verify on physical Android and iOS devices.

## Release prerequisite

- Confirm the deployed server has `1791452000003-AddMultipleAppliedCoupons` applied and returns cart `appliedCouponIds` and preview `coupons`. Deployment/database status has not been verified in this task.
- No new migrations, packages, native configuration, or prebuild are needed for these client changes.

## Offers

- Claim a valid code with lowercase letters/surrounding spaces. It is saved without being selected. Try invalid, duplicate, expired, and unknown codes.
- Load more than 12 claimed offers; select an offer from a later page. Reopen the sheet: selected offers remain removable even before their full card has loaded.
- Select two offers and remove only one. Reopen checkout and restart the app; server selection is retained. Switch accounts and confirm no previous customer's offers appear.
- Check wrong store, minimum subtotal, products, card/wallet, delivery/pickup, premium store, new-customer, inactive/upcoming/expired, global usage and personal usage limits.
- Verify percentage caps, fixed and percentage stacking, product deals, and discounts exceeding the item value. Compare totals and individual savings with web. Tax stays included.
- Apply offers that push the discounted subtotal below the store minimum: show the server reason and block placement until corrected or removed.
- Change payment method, fulfillment, quantities, or address while an offer is selected. Never label stale savings as confirmed. Failed previews must block ordering and offer Retry.
- Tap Use/Remove rapidly, lose the response after a saved mutation, and close/reopen the sheet mid-request. Selections must reconcile and must never replace/remove unrelated coupons.
- Exhaust a coupon on another device before placement. Show the refusal and open offers; do not remain on payment recovery after this definite refusal.
- Review the sheet and Coupons screen in both themes, large text, and small screens. Scrolling must keep the keyboard open. Close, Android Back, backdrop, and handle dismissal must work.

## Tips

- CRC: No tip, 500, 1,000, 2,000, Custom. Other currencies: No tip, 5, 10, 20, Custom.
- Verify grouped currency labels, custom decimal amounts, server totals, and No tip default.
- Switch to pickup with a tip selected: preview and placement exclude the tip. Return to delivery: the selected amount is retained.

## Inventory changes

- Add a product, then mark it out of stock before opening checkout. Show the named product and Review cart; block placement.
- Reduce available quantity below the cart quantity, including multiple customized lines of the same product. Show the server's available/requested quantities.
- Change stock after preview but before Place order. Show the same useful message and refresh cart/preview. A definite rejection must not leave a saved card attempt stuck on Checking payment.
- Remove unavailable items or reduce quantities, return to checkout, and confirm updated pricing allows placement.
- Keep timeout/unknown payment recovery intact: an ambiguous network response must not be treated as a definite stock rejection.
