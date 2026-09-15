import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import PressableScale from '../../../../general/components/PressableScale';
import Text from '../../../../general/components/Text';
import { useReducedMotion } from '../../../../general/hooks/useReducedMotion';
import { useTheme } from '../../../../general/theme/theme';

export type DeliveriesEmptyStateVariant = 'discovery' | 'offers' | 'orderAgain';

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
  variant?: DeliveriesEmptyStateVariant;
};

type VisualConfig = {
  mainIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  orbitIconTop: keyof typeof MaterialCommunityIcons.glyphMap;
  orbitIconBottom: keyof typeof MaterialCommunityIcons.glyphMap;
};

const VISUALS: Record<DeliveriesEmptyStateVariant, VisualConfig> = {
  discovery: {
    mainIcon: 'store-search-outline',
    orbitIconTop: 'map-marker-outline',
    orbitIconBottom: 'compass-outline',
  },
  offers: {
    mainIcon: 'tag-outline',
    orbitIconTop: 'percent-outline',
    orbitIconBottom: 'shopping-outline',
  },
  orderAgain: {
    mainIcon: 'history',
    orbitIconTop: 'receipt-text-outline',
    orbitIconBottom: 'shopping-outline',
  },
};

export default function DeliveriesSectionEmptyState({
  title,
  message,
  actionLabel,
  onActionPress,
  variant = 'discovery',
}: Props) {
  const { colors, motion, shape, spacing } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const entrance = useRef(new Animated.Value(isReducedMotionEnabled ? 1 : 0)).current;
  const visual = VISUALS[variant];
  const endColor = variant === 'orderAgain'
    ? colors.cardPeach
    : variant === 'offers'
      ? colors.cardLavender
      : colors.cardMint;

  useEffect(() => {
    if (isReducedMotionEnabled) {
      entrance.setValue(1);
      return;
    }

    Animated.spring(entrance, {
      toValue: 1,
      damping: motion.spring.gentle.damping,
      stiffness: motion.spring.gentle.stiffness,
      mass: motion.spring.gentle.mass,
      useNativeDriver: true,
    }).start();
  }, [entrance, isReducedMotionEnabled, motion.spring.gentle]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.divider,
          borderRadius: shape.radius.surface,
          opacity: entrance,
          transform: [{
            translateY: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [motion.distance.medium, 0],
            }),
          }],
        },
      ]}
    >
      <View
        style={[
          styles.surface,
          {
            borderRadius: shape.radius.surface,
            gap: spacing.md,
            padding: spacing.md,
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.visual,
            {
              transform: [
                {
                  scale: entrance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[colors.primarySoft, endColor]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: shape.radius.surface }]}
          />
          <View
            style={[
              styles.orbit,
              { borderColor: colors.primary, borderRadius: shape.radius.pill },
            ]}
          />
          <View
            style={[
              styles.mainIcon,
              { backgroundColor: colors.surfaceElevated, borderRadius: shape.radius.pill },
            ]}
          >
            <MaterialCommunityIcons color={colors.primary} name={visual.mainIcon} size={22} />
          </View>
          <View
            style={[
              styles.orbitIcon,
              styles.orbitIconTop,
              { backgroundColor: colors.cardPeach, borderRadius: shape.radius.pill },
            ]}
          >
            <MaterialCommunityIcons color={colors.warningText} name={visual.orbitIconTop} size={12} />
          </View>
          <View
            style={[
              styles.orbitIcon,
              styles.orbitIconBottom,
              { backgroundColor: colors.cardLavender, borderRadius: shape.radius.pill },
            ]}
          >
            <MaterialCommunityIcons color={colors.secondary} name={visual.orbitIconBottom} size={12} />
          </View>
        </Animated.View>

        <View style={[styles.copy, { gap: spacing.xs }]}>
          <Text color={colors.textStrong} variant="label" weight="semiBold">
            {title}
          </Text>
          <Text color={colors.textSubtle} numberOfLines={2} variant="caption">
            {message}
          </Text>

          {actionLabel && onActionPress ? (
            <PressableScale
              accessibilityLabel={actionLabel}
              accessibilityRole="button"
              onPress={onActionPress}
              pressedScale={0.96}
              style={[
                styles.action,
                {
                  backgroundColor: colors.primarySoft,
                  borderRadius: shape.radius.control,
                  gap: spacing.xs,
                  marginTop: spacing.sm,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              <Text
                color={colors.primary}
                numberOfLines={1}
                style={styles.actionLabel}
                variant="label"
                weight="bold"
              >
                {actionLabel}
              </Text>
              <MaterialCommunityIcons color={colors.primary} name="arrow-right" size={15} />
            </PressableScale>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
    maxWidth: '100%',
    minHeight: 36,
  },
  actionLabel: {
    flexShrink: 1,
  },
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 116,
  },
  surface: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 116,
    overflow: 'hidden',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  mainIcon: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  orbit: {
    borderStyle: 'dashed',
    borderWidth: StyleSheet.hairlineWidth,
    height: 66,
    opacity: 0.32,
    position: 'absolute',
    width: 66,
  },
  orbitIcon: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    width: 24,
  },
  orbitIconBottom: {
    bottom: 4,
    left: 3,
  },
  orbitIconTop: {
    right: 3,
    top: 4,
  },
  visual: {
    alignItems: 'center',
    height: 84,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 84,
  },
});
