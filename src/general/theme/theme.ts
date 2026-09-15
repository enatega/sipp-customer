import type { DeliveriesAppSettings } from '../stores/useAppConfigStore';
import { resolveThemeColors, type ThemeColors, type ThemedMiniAppId } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shape } from './shape';
import { motion } from './motion';
import { layout } from './layout';
import { getElevation, type ElevationLevel } from './elevation';
import type { ViewStyle } from 'react-native';

export type Theme = {
  isDark: boolean;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  shape: typeof shape;
  motion: typeof motion;
  layout: typeof layout;
  elevation: Record<ElevationLevel, ViewStyle>;
};

export const buildTheme = (
  scheme: 'light' | 'dark' | null,
  activeMiniApp: ThemedMiniAppId = 'general',
  deliveriesAppSettings?: DeliveriesAppSettings | null,
): Theme => {
  const isDark = scheme === 'dark';
  const colors = resolveThemeColors(
    isDark ? 'dark' : 'light',
    activeMiniApp,
    deliveriesAppSettings,
  );

  return {
    isDark,
    colors,
    typography,
    spacing,
    shape,
    motion,
    layout,
    elevation: {
      flat: getElevation('flat', colors.shadowColor, isDark),
      subtle: getElevation('subtle', colors.shadowColor, isDark),
      raised: getElevation('raised', colors.shadowColor, isDark),
      floating: getElevation('floating', colors.shadowColor, isDark),
      overlay: getElevation('overlay', colors.shadowColor, isDark),
    },
  };
};

export const useTheme = (): Theme => {
  const context = require('./ThemeProvider').useAppTheme();
  return context.theme;
};
