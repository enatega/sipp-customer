# SIP Premium UI System

The canonical product and visual direction live in `PRODUCT.md` and `DESIGN.md`. This document records the implementation contract for engineers.

The screen-level composition, priority, motion, and consistency contract lives in `docs/ui-revamp/visual-reference-plan.md`. New or migrated screens must inherit it rather than treating a reference board as an isolated visual concept.

## Token layers

- `colors.ts`: semantic light/dark roles and delivery-configured brand resolution.
- `typography.ts`: semantic text roles plus backwards-compatible size primitives.
- `spacing.ts`: 4pt spatial scale and component/page aliases.
- `shape.ts`: control, surface, hero, sheet, and pill radii.
- `elevation.ts`: platform-aware flat, raised, floating, and overlay depth.
- `motion.ts`: duration, distance, opacity, and spring values.
- `layout.ts`: width classes, gutters, content widths, touch targets, media ratios, and z-index.
- `theme.ts`: immutable theme object consumed through `useTheme()`.
- `useWindowClass.ts`: compact, medium, and expanded composition state plus the matching page gutter.

## Primitive rules

- `Text` owns semantic typography and text accessibility behavior.
- `Button` owns target size, variants, loading/disabled state, Android ripple, and reduced-motion-aware press feedback.
- `Card` and `Surface` own shape, tone, border, and semantic elevation.
- `IconButton` owns icon-only target size and accessibility labeling.
- `PressableScale` owns reduced-motion-safe tactile compression for commerce cards and tiles.
- `ScreenHeader` owns safe-area layout and navigation control geometry.
- `Skeleton` owns reduced-motion-safe loading treatment and animation cleanup.
- `PlatformGlassSurface` owns the platform material contract: native `expo-glass-effect` Liquid Glass on supported iOS 26 builds, system blur on earlier iOS versions, solid accessible material when Reduce Transparency is enabled, and tonal elevation on Android.
- `DeliveriesChromeMaterial` and `DeliveriesTabBarBackground` apply that shared material only to functional delivery navigation and control chrome.
- The delivery dock uses native Liquid Glass's `clear` style on supported iOS devices, with no authored border or highlight line; unsupported devices retain the platform fallback.
- `HomeEntrance` owns the capped three-beat home reveal; it must not be repeated for every individual rail or card.
- `DeliveryHomeIntro` owns the delivery home’s editorial welcome and direct search entry across marketplace, single-vendor, and chain modes.
- `SearchInput` owns the raised search material, animated focus acknowledgement, accessible clear action, and compact/regular sizing. Screens provide context-specific copy; they do not restyle its internal chrome.
- `SeeAllHeader` owns discovery navigation chrome: native Liquid Glass or its platform fallback, adaptive gutters, and shared icon-button geometry.
- Filter chips, address rows, and sheet actions preserve a minimum 44pt target and communicate selected state with semantic color as well as shape or iconography.
- Category and brand indexes choose their column count from the shared window class and calculate item width from the active gutter; fixed phone-only grids are not permitted.

## Motion contract

- The delivery dock is the authored focal material. Selection uses a short expanding capsule and a 2px vertical acknowledgement.
- Home entrances are grouped into at most three beats with a total delay below 400ms.
- Address changes use a quick crossfade and 2px continuity shift.
- Search result changes use one short settle transition that begins visibly and travels no more than 4px; reduced motion resolves immediately.
- Reduced motion resolves all spatial entrances immediately while preserving legible selected and pressed states.
- Loops remain reserved for loading; settled navigation and home content do not animate continuously.

## Cross-screen consistency contract

- Every semantic UI family has one canonical owner: bottom navigation, selection indicator, header variants, buttons, icon buttons, rows, cards/surfaces, sheets, status, media, and commerce action bars.
- Screens compose those owners; they do not restyle their internal radius, color, type, shadow, target size, or animation.
- Tabs, filters, category selectors, segmented controls, and product choices share one selected-state grammar while retaining layout appropriate to their job.
- The same semantic elevation means the same depth everywhere. Elevated wrappers must remain outside clipping containers so shadows are never cut off.
- Liquid Glass is reserved for supported-iOS functional navigation and transient controls. Content cards use opaque or tonal surfaces. Android uses the same hierarchy through tonal material, state layers, native ripple, and elevation.
- Marketplace, single-vendor, and chain modes may change content topology only where behavior requires it; the underlying components and theme remain identical.

## Home atmosphere contract

- One continuous gradient spans the safe-area delivery header, greeting, editorial promise, supporting copy, and search entry before resolving into the content canvas.
- One UI-thread scroll progress value coordinates gradient continuity, editorial fade, minimal translation, compact header state, and search transition.
- The interaction reverses continuously with scroll, remains interruptible, and does not replay the entrance sequence.
- Reduced Motion keeps state and opacity continuity but removes parallax and meaningful spatial travel.

## Migration rule

Migrate from shared structure outward: tokens → primitives → navigation/header/sheets → home/store/product → cart/checkout → tracking → account/support → state and accessibility audit. Avoid broad mechanical replacement when a component's hierarchy needs design judgment.
