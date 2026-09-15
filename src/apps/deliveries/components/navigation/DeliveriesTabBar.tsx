import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import React, { memo, useContext, useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import PlatformGlassSurface from '../../../../general/components/PlatformGlassSurface';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../general/theme/theme';
import DeliveriesFloatingCartButton from './DeliveriesFloatingCartButton';

export const DELIVERIES_TAB_BAR_HEIGHT = 78;
export const DELIVERIES_TAB_BAR_SAFE_PADDING = 8;

function DeliveriesTabBar({ descriptors, insets, navigation, state }: BottomTabBarProps) {
  const { colors, elevation, layout, motion, shape, spacing } = useTheme();
  const { gutter, width } = useWindowClass();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const safeBottom = Math.max(insets.bottom, DELIVERIES_TAB_BAR_SAFE_PADDING);
  const dockWidth = Math.min(width - gutter * 2, layout.contentMaxWidth.readable);
  const dockLeft = Math.max(gutter, (width - dockWidth) / 2);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true),
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleLayout = (event: LayoutChangeEvent) => {
    onHeightChange?.(event.nativeEvent.layout.height);
  };

  const renderTab = (index: number) => {
    const route = state.routes[index];
    const descriptor = descriptors[route.key];
    const options = descriptor.options;
    const isFocused = state.index === index;
    const color = isFocused
      ? options.tabBarActiveTintColor ?? colors.primary
      : options.tabBarInactiveTintColor ?? colors.iconMuted;
    const label = typeof options.tabBarLabel === 'string'
      ? options.tabBarLabel
      : options.title ?? route.name;

    const handlePress = () => {
      const event = navigation.emit({
        canPreventDefault: true,
        target: route.key,
        type: 'tabPress',
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.dispatch({
          ...CommonActions.navigate(route.name, route.params),
          target: state.key,
        });
      }
    };

    const handleLongPress = () => {
      navigation.emit({ target: route.key, type: 'tabLongPress' });
    };

    return (
      <PressableScale
        accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        key={route.key}
        onLongPress={handleLongPress}
        onPress={handlePress}
        pressedScale={motion.scale.pressed}
        style={[
          styles.tab,
          {
            borderRadius: shape.radius.control,
            gap: spacing.xxs,
          },
        ]}
        testID={options.tabBarTestID}
      >
        <View style={styles.iconWrap}>
          {options.tabBarIcon?.({ color, focused: isFocused, size: 26 })}
          {isFocused ? (
            <View
              pointerEvents="none"
              style={[
                styles.activeDot,
                { backgroundColor: colors.primary, borderRadius: shape.radius.pill },
              ]}
            />
          ) : null}
        </View>
        <Text
          allowFontScaling={false}
          color={color}
          numberOfLines={1}
          variant="caption"
          weight={isFocused ? 'semiBold' : 'regular'}
        >
          {label}
        </Text>
      </PressableScale>
    );
  };

  if (isKeyboardVisible) {
    return null;
  }

  return (
    <View
      onLayout={handleLayout}
      pointerEvents="box-none"
      style={[
        styles.positioner,
        {
          bottom: safeBottom,
          height: DELIVERIES_TAB_BAR_HEIGHT,
          left: dockLeft,
          width: dockWidth,
          zIndex: layout.layer.navigation,
        },
      ]}
    >
      <View
        style={[
          styles.dockShadow,
          elevation.overlay,
          {
            backgroundColor: Platform.OS === 'ios' ? colors.glassSurface : colors.surfaceElevated,
            borderRadius: shape.radius.pill,
          },
        ]}
      >
        <View pointerEvents="none" style={styles.glassLayer}>
          <PlatformGlassSurface
            effectStyle="clear"
            style={[
              styles.glass,
              {
                borderColor: Platform.OS === 'ios' ? colors.glassBorder : colors.border,
                borderRadius: shape.radius.pill,
              },
            ]}
          />
        </View>

        <View style={[styles.row, { paddingHorizontal: spacing.sm }]}>
          {renderTab(0)}
          {renderTab(1)}
          <View pointerEvents="box-none" style={styles.cartSlot}>
            <DeliveriesFloatingCartButton style={styles.cartButton} />
          </View>
          {renderTab(2)}
          {renderTab(3)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    bottom: -1,
    height: 3,
    position: 'absolute',
    width: 3,
  },
  cartButton: {
    position: 'absolute',
    top: -11,
  },
  cartSlot: {
    alignItems: 'center',
    height: DELIVERIES_TAB_BAR_HEIGHT,
    justifyContent: 'center',
    width: 76,
    zIndex: 2,
  },
  dockShadow: {
    flex: 1,
  },
  glass: {
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    overflow: 'hidden',
  },
  glassLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  iconWrap: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    position: 'relative',
  },
  positioner: {
    position: 'absolute',
  },
  row: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    zIndex: 1,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    height: 64,
    justifyContent: 'center',
    minWidth: 0,
  },
});

export default memo(DeliveriesTabBar);
