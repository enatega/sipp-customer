export const motion = Object.freeze({
  duration: {
    instant: 100,
    quick: 160,
    standard: 240,
    deliberate: 340,
  },
  distance: {
    press: 2,
    small: 4,
    medium: 8,
  },
  scale: {
    pressed: 0.98,
    emphasized: 1.02,
  },
  opacity: {
    disabled: 0.48,
    pressed: 0.88,
    scrim: 0.44,
    subtle: 0.72,
  },
  spring: {
    responsive: { damping: 18, stiffness: 280, mass: 0.8 },
    gentle: { damping: 22, stiffness: 220, mass: 0.9 },
  },
} as const);

