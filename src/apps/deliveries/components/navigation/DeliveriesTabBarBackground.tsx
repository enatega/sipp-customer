import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../../../general/theme/theme';
import PlatformGlassSurface from '../../../../general/components/PlatformGlassSurface';
import { DELIVERIES_TAB_BAR_HEIGHT } from './DeliveriesTabBar';

export default function DeliveriesTabBarBackground() {
  const { shape } = useTheme();

  return (
    <PlatformGlassSurface
      effectStyle="clear"
      style={[
        styles.dock,
        styles.material,
        {
          borderRadius: shape.radius.pill,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dock: {
    height: DELIVERIES_TAB_BAR_HEIGHT,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  material: {
    overflow: 'hidden',
  },
});
