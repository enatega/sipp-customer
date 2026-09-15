---
type: "ui_layout"
date: "2026-09-15T04:39:56.068722+00:00"
question: "also when there are all of values present of these info and no info is visible completely, we should adjust the store opening info to somewhere else and keep the other three there, or you can do it in a better way with perfect UI and UX and usablity"
contributor: "graphify"
outcome: "useful"
source_nodes: ["StoreDetailListHeader", "StoreDetailInfoRow", "StoreDetailsScreen"]
---

# Q: also when there are all of values present of these info and no info is visible completely, we should adjust the store opening info to somewhere else and keep the other three there, or you can do it in a better way with perfect UI and UX and usablity

## Answer

Expanded from graph vocabulary: [home, section, store, card, nearby, closed, popup, details, info, minimum, distance, delivery]. StoreDetailListHeader now places availability and opening hours in a full-width metadata row, with rating at the trailing edge when present. StoreDetailInfoRow now renders at most three equal-width commerce cells for delivery, distance, and minimum order, removes horizontal scrolling, and tail-truncates each value independently.

## Outcome

- Signal: useful

## Source Nodes

- StoreDetailListHeader
- StoreDetailInfoRow
- StoreDetailsScreen