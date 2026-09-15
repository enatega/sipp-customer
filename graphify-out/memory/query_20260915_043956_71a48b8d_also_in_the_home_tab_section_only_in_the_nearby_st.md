---
type: "interaction_consistency"
date: "2026-09-15T04:39:56.178098+00:00"
question: "also in the home tab section only in the nearby stores section the closed one clicking showing the show menu popup, no other section is showing the popup for the closed stores"
contributor: "graphify"
outcome: "useful"
source_nodes: ["HomeTab", "NearbyStoreList", "Deals", "ShopTypeStoreSections", "TopBrandsList", "AppPopup"]
---

# Q: also in the home tab section only in the nearby stores section the closed one clicking showing the show menu popup, no other section is showing the popup for the closed stores

## Answer

Expanded from graph vocabulary: [home, section, store, card, nearby, closed, popup, details, info, minimum, distance, delivery]. HomeTab now owns one ClosedStoreMenuPopup and passes a shared closed-store handler to NearbyStoreList, MultiVendorDealsSection, ShopTypeStoreSections, and TopBrandsList. Reusable Deals and Nearby lists retain a local popup fallback outside HomeTab.

## Outcome

- Signal: useful

## Source Nodes

- HomeTab
- NearbyStoreList
- Deals
- ShopTypeStoreSections
- TopBrandsList
- AppPopup