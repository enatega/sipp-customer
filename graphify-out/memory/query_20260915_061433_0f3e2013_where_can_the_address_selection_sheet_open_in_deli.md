---
type: "query"
date: "2026-09-15T06:14:33.500200+00:00"
question: "Where can the address selection sheet open in deliveries, and which hosts have a visible bottom tab bar?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["AddressSelectionBottomSheet()", "SearchMainContainer()", "MultiVendorBottomTabNavigator()", "ChainBottomTabNavigator()", "DeliveriesTabBar()"]
---

# Q: Where can the address selection sheet open in deliveries, and which hosts have a visible bottom tab bar?

## Answer

Expanded from the project graph via: address, selection, bottom, sheet, search, home, navigation, tab, deliveries, cart, container, bar. Tab-hosted address selection appears in multi-vendor Home, single-vendor Home, chain Home, and the shared SearchMainContainer used by all three Search tabs. Checkout also hosts AddressSelectionBottomSheet but is a stack screen without the bottom dock, so it remains edge-anchored. A shared deliveries tab-sheet offset now keeps all tab-hosted sheets above the dock.

## Outcome

- Signal: useful

## Source Nodes

- AddressSelectionBottomSheet()
- SearchMainContainer()
- MultiVendorBottomTabNavigator()
- ChainBottomTabNavigator()
- DeliveriesTabBar()