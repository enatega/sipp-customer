import { Platform, type ViewStyle } from 'react-native';

export type ElevationLevel = 'flat' | 'subtle' | 'raised' | 'floating' | 'overlay';

const iosElevation: Record<ElevationLevel, ViewStyle> = {
  flat: {},
  subtle: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  raised: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  floating: { shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16 },
  overlay: { shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 28 },
};

const androidElevation: Record<ElevationLevel, ViewStyle> = {
  flat: { elevation: 0 },
  subtle: { elevation: 1 },
  raised: { elevation: 2 },
  floating: { elevation: 6 },
  overlay: { elevation: 12 },
};

export function getElevation(
  level: ElevationLevel,
  shadowColor: string,
  isDark: boolean,
): ViewStyle {
  const base = Platform.OS === 'ios' ? iosElevation[level] : androidElevation[level];

  return {
    ...base,
    ...(Platform.OS === 'ios' && level !== 'flat'
      ? {
          shadowColor,
          shadowOpacity: isDark && level === 'subtle'
            ? 0.12
            : isDark
              ? 0.28
              : base.shadowOpacity,
        }
      : {}),
  };
}
