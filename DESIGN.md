# SIP Customer Design Direction

## Status

This document is the visual source of truth for the premium revamp. The repository is in **Operate** mode: extend this system, migrate existing delivery UI into it, and update this document before introducing a new visual language.

## Pinned visual world

**Premium urban delivery concierge** — precise, calm, tactile, fast, and trustworthy.

The interface uses quiet neutral canvases, crisp typography, confident brand color, softly separated surfaces, strong imagery, and small moments of kinetic feedback. Premium means restraint and coherence, not ornament or excessive translucency.

## Platform expression

- iOS: use native hierarchy, safe-area behavior, and material only where navigation or controls genuinely support it. Glass is reserved for floating navigation/control surfaces and must never reduce legibility.
- Android: use Material 3-style tonal surfaces, state layers, and elevation. Do not imitate iOS glass.
- Both: keep information architecture, semantics, and brand consistent while allowing platform-native feedback.

## Visual hierarchy

1. The active task and primary action.
2. Merchant/product imagery and essential commerce information.
3. Delivery timing, availability, price, status, and selection state.
4. Supporting metadata and secondary actions.

Avoid nested decorative containers. Prefer spacing, type, subtle tone changes, and hairline separation before adding another card.

## Color

- Use semantic theme roles only in components: canvas, surface, elevated surface, primary, text, muted text, border, status, overlay, and state-layer roles.
- Delivery configuration may supply brand colors; the resolver must retain readable foreground contrast.
- Light and dark modes are designed independently, not mechanically inverted.
- Strong color is reserved for priority, selection, status, and key commerce moments.

## Typography

- System typefaces remain the default for platform performance and familiarity.
- Roles: display, screen title, section title, card title, body, supporting body, label, caption, numeric emphasis, and button label.
- Headings use compact negative tracking sparingly. Body and transactional text prioritize readability.
- Price, quantity, ETA, and order state align clearly and do not rely on color alone.

## Spatial system

- Base unit: 4.
- Compact page gutter: 16; medium: 24; expanded: 32.
- Standard section rhythm: 24; dense content rhythm: 12–16.
- Touch targets: at least 44pt on iOS and 48dp on Android.
- Content is width-bounded on medium and expanded screens rather than stretched edge to edge.

## Shape and depth

- Controls: 10–12 radius.
- Standard surfaces: 16 radius.
- Hero media and major sheets: 20–24 radius.
- Pills are used only for true chips, status, or compact segmented choices.
- Elevation has semantic levels: flat, subtle, raised, floating, overlay. Subtle is the default for repeated commerce rows; dark mode relies more on tonal separation and borders than heavy shadows.

## Motion

- Instant: 100ms — state layers and tiny feedback.
- Quick: 160ms — press, icon, chip, and selection feedback.
- Standard: 240ms — content reveal, card transition, and navigation-adjacent changes.
- Deliberate: 340ms — sheet or major state transition only.
- Movement stays small (typically 2–8px) and interruptible. Prefer opacity and transform.
- Reduced-motion mode removes loops and meaningful spatial travel while keeping immediate state feedback.
- Skeletons pulse softly only when motion is allowed. No perpetual decorative motion on settled screens.

## Signature systems

- Adaptive delivery header: location/context, search entry, and account/cart actions share one clear hierarchy.
- Merchant journey header: hero media collapses into a compact, useful header without losing merchant identity.
- Commerce confirmation chain: product choice → cart update → checkout → order confirmation feels continuous and causally connected.
- Context-preserving search: entering and leaving search retains query, filters, scroll, and origin.
- Live order surface: map, ETA, state, courier contact, and order detail form one legible tracking composition.
- Adaptive navigation: compact bottom navigation; wider layouts use a rail or width-aware alternative. Floating materials remain platform appropriate.

## Non-negotiables

- Preserve business behavior and navigation contracts during visual migration.
- No hardcoded user-facing strings; update English and French together.
- No raw color, radius, spacing, or animation duration when an appropriate token exists.
- Every reusable interactive primitive owns accessibility state, target size, disabled/loading behavior, and press feedback.
- Every media surface defines aspect ratio, loading, fallback, error, crop, and accessibility behavior.
- Validate loading, empty, error, offline, disabled, success, light, dark, compact, medium, expanded, and reduced-motion states.
