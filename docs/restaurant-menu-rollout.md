# Restaurant menu rollout and manual acceptance

## Deployment order

1. Deploy the server with the additive menu endpoints and search continuation support.
2. Apply `1790007000000-AddStoreMenuPaginationIndex` using the normal server migration process. The index is not applied by this client change. Schedule index creation for an appropriate database maintenance window; this migration uses a regular transactional index creation.
3. Release the customer app after the endpoints are available. Older clients continue using `/view` and `/view/products`.

Migration status: on 2026-09-22, `AddStoreMenuPaginationIndex1790007000000` was applied through TypeORM to the configured Neon database `sipp-migration-v1`. Its migration record was confirmed, and `idx_products_active_store_menu` was confirmed valid and ready with the expected columns and active-product predicate. Other databases still need their normal migration rollout.

No builds, type checks, linters, automated tests, device profiling, or performance benchmarks were executed. Performance remains to be measured on physical devices and representative server data.

## API contracts

All routes below are under `/api/v1/apps/deliveries/stores/:storeId` and use the existing optional customer authentication.

- `GET /view/menu`: `{ store, sections, firstPage }`. `store` retains the existing restaurant metadata shape, including the current user's favorite status. Its category list is complete and ordered, with product counts. Each section has `id`, `categoryId`, nullable `subcategoryId`, `name`, and `productCount`.
- Section IDs are `categoryId:subcategoryId`, or `categoryId:none` for products without a subcategory. Category and subcategory names sort alphabetically with ID tie-breakers; the `none` section comes last.
- `GET /view/menu/sections/:sectionId/products`: accepts `limit` (default 24, maximum 48), `direction=forward|backward`, and an optional opaque `cursor`. Without a cursor, enter at the start/end respectively. Optional `anchorProductId` restores a refresh position and cannot be combined with a cursor. A missing anchor falls back to the section boundary.
- A page returns `sectionId`, lightweight `items`, `previousCursor`, `nextCursor`, `hasPrevious`, `hasNext`, and optional `anchorFound`. Rows are always returned in display order. Invalid/mismatched cursors return 400; a missing/inactive category or subcategory returns 404.
- `GET /view/products?search=...`: retains offset pagination and adds `continuation`, `previousContinuation`, and `restart`. Continuations bind store, query, category filters, page size, offset, and provider. If an Algolia continuation falls back to the database, the server returns database page zero with `restart: true`; the new client replaces its results instead of appending incompatible rankings.

Every page checks current public-store eligibility and active taxonomy. Cursors are pagination positions, not authorization. Catalog changes are not a transaction snapshot; refresh reconciles edits and removals. Prices and checkout eligibility remain subject to the existing product/checkout validation.

## Client behavior

- One window controller fetches sections in either direction. Pages contain 24 products and the window retains at most 12 pages. Superseded windows have zero cache retention; the bootstrap separately holds its initial page. Edge requests are serialized, with at most a metadata request and a product request in flight. A completed edge request is discarded if it would evict the product currently under the toolbar after the user reverses direction.
- Category/subcategory taps open their own section immediately. Unloaded earlier sections have no fabricated height. Upward browsing fetches the previous section from its end; downward browsing fetches the next section from its start. Short sections recheck the last menu row after committed layouts and completed requests, loading until content extends beyond the viewport loading threshold. The check accounts for the cart/safe-area padding and does not require a first scroll event.
- One toolbar follows the hero and pins below the navigation header. The category strip supports direct swiping; All categories opens a virtualized chooser.
- Pagination stops at the final section; there is no wrap to the first category. Ordinary forward appends issue no scroll command. Only prepends/page eviction may correct the visible product after the new rows commit, and new user touches cancel pending corrections. Automatic offset adjustments do not start backward paging.
- Position preservation uses the visible product ID and distance below the toolbar. Pull-to-refresh restores that product, or its section if the product disappeared. Refresh from the hero retains the hero position.
- Dedicated restaurant search has one input, a 300 ms debounce, a two-character minimum, independent pagination, and cancellation. The underlying menu stays mounted and stops fetching while unfocused. Both the shared deliveries stack and the multi-vendor stack register the search route.

## Manual acceptance matrix

Use an approved store with 100 categories, 10,000 products overall, and 2,000 products in one category. Include subcategories, products without subcategories, equal names, deals, missing images, and long French names. Do not seed production with test products.

1. Open the store from the marketplace and from a shared deliveries route. Jump to the final category before the initial category finishes loading. Only the requested section should load; tap several pills rapidly and confirm the last one wins.
2. Browse beyond item 60 and past twelve pages in the large category. Reverse direction and cross category/subcategory boundaries. Confirm earlier pages reload without duplicate products, missing boundary products, or a shifting visible product. Reverse rapidly while a page request is in flight, and check sections too short to fill the screen. Open a restaurant whose first category has only one or two products, without touching the list: following sections should load automatically on both iOS and Android, with and without a cart. Repeat with several consecutive short categories, an almost-full viewport, a failed next-page request followed by retry, and a final category with no following section.
3. Immediately after jumping to a distant category, confirm its heading remains below the toolbar. Pull toward earlier sections without first scrolling farther down; repeat on Android with overscroll clamped, on iOS, and while a forward page is loading. Earlier sections should prepend without moving the visible product; pull-to-refresh should be available at the actual beginning of the menu. Check categories with and without subcategories and large text. Swipe the category strip from first to last, including while the vertical list coasts. Open All categories and choose a far section. Jump directly to an unloaded subcategory.
4. Search from deep in the menu. Type rapidly, clear, enter a one-character query, try no matches, open a result, return, then leave search. Confirm the menu position and selected category remain unchanged and browse products never appear as search results.
5. Disconnect the network during initial load, a category jump, previous/next paging, search, and refresh. Confirm a usable retry state at the affected edge and that loaded content remains usable.
6. During browsing, remove the anchored product, deactivate a subcategory, and change a product name/price. Refresh and check section fallback and fresh values. Try equal product names spanning a cursor boundary.
7. Force Algolia fallback after page one in a non-production environment. Confirm the server sets `restart`, results return to database page zero, and subsequent requests remain on the database provider. Verify category/subcategory filters under both providers.
8. With a deliberately delayed next-page response, keep scrolling and then release at the bottom. Confirm the completed page does not send the list to the first category. Reach the final product and wait: no first-category request or reset should occur. Repeat beyond twelve retained pages, reverse direction, and retry a missing section while positioned away from the original entry category. Check logged-out favorites, favorite toggling, closed stores, product options, cart navigation, and return from product details. These flows should retain their existing behavior.
9. On a low-end physical Android phone and an iPhone, check light/dark themes, large text, TalkBack/VoiceOver, reduced motion, safe areas, and the keyboard. Also check orientation changes and the smallest supported screen.

Record device/model, app mode, network conditions, menu size, API request count, compressed payload size, p50/p95 server response time, frame stalls, and peak/settled memory before and after. Check query plans for first, deep, and backward section pages against the new index. Keep measurements separate from emulator or debug-build observations.
