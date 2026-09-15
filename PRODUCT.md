# SIP Customer Product

## Platform

adaptive

## Product definition

SIP Customer is a deliveries-only mobile commerce application. It helps a customer discover a merchant, choose products, configure an order, pay, and follow the delivery through completion without losing context or confidence.

The current product supports three delivery operating modes—single vendor, multi-vendor marketplace, and store chain—behind one customer experience. The redesign must preserve those flows and the existing API, store, navigation, authentication, checkout, payment, and tracking behavior.

## Primary users

- Customers ordering food, groceries, pharmacy, retail, or other local goods.
- Repeat customers who value speed, saved preferences, predictable checkout, and live delivery confidence.
- Customers using compact phones, tablets, accessibility settings, light mode, or dark mode in English or French.

## Core jobs

1. Understand what can be delivered and to which address.
2. Find a relevant merchant or product quickly.
3. Evaluate price, availability, delivery timing, and options with low cognitive load.
4. Build and revise a cart without losing place.
5. Complete checkout with clear totals, fulfillment, payment, and recovery states.
6. Track an active order and contact support or the courier when appropriate.
7. Review order history, favorites, addresses, profile, and settings.

## Experience promise

SIP should feel like a premium urban delivery concierge: precise, calm, tactile, fast, and trustworthy. The interface should have warmth and life without slowing down the ordering task. Motion confirms cause and effect; it never makes the customer wait.

## Product principles

- Delivery first: no ride-sharing, appointments, home services, or developer-mode product surfaces.
- Context is precious: search, cart, checkout, and tracking transitions preserve the customer's place.
- Confidence before delight: totals, status, availability, and next actions stay explicit.
- Fast by construction: native primitives, short animations, bounded effects, stable layouts, and efficient lists.
- Adaptive, not stretched: compact, medium, and expanded layouts are deliberately composed.
- Accessible by default: meaningful labels, large targets, readable contrast, dynamic text tolerance, reduced motion, and localized English/French copy.
- One system, three operating modes: shared foundations and primitives with only behavior-driven mode variation.

## Success signals

- Customers can identify the primary action on every screen immediately.
- Navigation and feedback feel responsive under real network conditions.
- Loading, empty, offline, error, disabled, and success states look intentional.
- The delivery journey feels visually continuous from discovery through tracking.
- New delivery screens can be assembled from shared tokens and primitives without introducing one-off visual rules.
