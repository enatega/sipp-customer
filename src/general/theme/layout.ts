import { Platform } from 'react-native';

export const layout = Object.freeze({
  breakpoint: {
    compactMax: 599,
    mediumMax: 839,
  },
  gutter: {
    compact: 16,
    medium: 24,
    expanded: 32,
  },
  contentMaxWidth: {
    readable: 680,
    commerce: 960,
    expanded: 1200,
  },
  touchTarget: {
    minimum: Platform.select({ ios: 44, default: 48 }),
    compact: 44,
    comfortable: 52,
  },
  mediaRatio: {
    square: 1,
    product: 4 / 3,
    hero: 16 / 9,
  },
  layer: {
    content: 0,
    sticky: 10,
    floating: 20,
    navigation: 30,
    modal: 40,
    toast: 50,
  },
} as const);

