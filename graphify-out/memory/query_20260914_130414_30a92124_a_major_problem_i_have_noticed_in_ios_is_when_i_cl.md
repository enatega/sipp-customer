---
type: "bug_diagnosis"
date: "2026-09-14T13:04:14.721168+00:00"
question: "a major problem i have noticed in ios is when i clicked on a store from the home tab, and then used gesture back which is of the system in ios the swipe right gesture to go back, and then clicking again on the store not opening the store or not navigating to any page, this happens sometimes not everytime"
contributor: "graphify"
outcome: "useful"
source_nodes: ["StoreCard", "MultiVendorNavigator", "HomeTab", "StoreDetailsScreen", "DeliveriesNavigator"]
---

# Q: a major problem i have noticed in ios is when i clicked on a store from the home tab, and then used gesture back which is of the system in ios the swipe right gesture to go back, and then clicking again on the store not opening the store or not navigating to any page, this happens sometimes not everytime

## Answer

Expanded query: home card store navigation navigator route stack screen details. The home store cards used navigate('StoreDetails'), which can reuse the StoreDetails route still being removed during an iOS interactive-pop transition. Replaced direct StoreDetails navigate calls with a shared StackActions.push helper so every open receives a fresh route key and cannot be removed by completion of the prior pop.

## Outcome

- Signal: useful

## Source Nodes

- StoreCard
- MultiVendorNavigator
- HomeTab
- StoreDetailsScreen
- DeliveriesNavigator