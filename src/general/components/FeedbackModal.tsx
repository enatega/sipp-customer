import React, { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import Button from './Button';
import PlatformGlassSurface from './PlatformGlassSurface';
import Text from './Text';
import { useTheme } from '../theme/theme';

export type FeedbackModalVariant = 'success' | 'warning' | 'error' | 'info';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  message: string;
  onClose: () => void;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  primaryLabel: string;
  secondaryLabel?: string;
  title: string;
  variant?: FeedbackModalVariant;
  visible: boolean;
};

const VARIANT_ICONS: Record<FeedbackModalVariant, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle-outline',
  warning: 'alert-circle-outline',
  error: 'close-circle-outline',
  info: 'information-circle-outline',
};

export default function FeedbackModal({
  icon,
  message,
  onClose,
  onPrimaryPress,
  onSecondaryPress,
  primaryLabel,
  secondaryLabel,
  title,
  variant = 'info',
  visible,
}: Props) {
  const { colors, elevation, isDark, motion, shape, spacing } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardTranslateY = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const haloPulse = useRef(new Animated.Value(0)).current;

  const accentColor = {
    success: colors.success,
    warning: colors.warning,
    error: colors.danger,
    info: colors.primary,
  }[variant];

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    if (isReducedMotionEnabled) {
      cardScale.setValue(1);
      cardTranslateY.setValue(0);
      iconScale.setValue(1);
      haloPulse.setValue(1);
      return undefined;
    }

    cardScale.setValue(0.92);
    cardTranslateY.setValue(18);
    iconScale.setValue(0.72);
    haloPulse.setValue(0);

    const entrance = Animated.parallel([
      Animated.spring(cardScale, {
        damping: motion.spring.gentle.damping,
        mass: motion.spring.gentle.mass,
        stiffness: motion.spring.gentle.stiffness,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        damping: motion.spring.gentle.damping,
        mass: motion.spring.gentle.mass,
        stiffness: motion.spring.gentle.stiffness,
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(70),
        Animated.spring(iconScale, {
          damping: motion.spring.responsive.damping,
          mass: motion.spring.responsive.mass,
          stiffness: motion.spring.responsive.stiffness,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    ]);

    const pulse = Animated.sequence([
      Animated.delay(140),
      Animated.timing(haloPulse, {
        duration: motion.duration.deliberate,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(haloPulse, {
        duration: motion.duration.deliberate,
        toValue: 0.35,
        useNativeDriver: true,
      }),
      Animated.timing(haloPulse, {
        duration: motion.duration.deliberate,
        toValue: 0.72,
        useNativeDriver: true,
      }),
    ]);

    entrance.start();
    pulse.start();

    return () => {
      entrance.stop();
      pulse.stop();
    };
  }, [
    cardScale,
    cardTranslateY,
    haloPulse,
    iconScale,
    isReducedMotionEnabled,
    motion.duration.deliberate,
    motion.spring.gentle.damping,
    motion.spring.gentle.mass,
    motion.spring.gentle.stiffness,
    motion.spring.responsive.damping,
    motion.spring.responsive.mass,
    motion.spring.responsive.stiffness,
    visible,
  ]);

  const haloScale = haloPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1.08],
  });
  const haloOpacity = haloPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.14, 0.5],
  });

  return (
    <Modal
      animationType={isReducedMotionEnabled ? 'none' : 'fade'}
      hardwareAccelerated
      navigationBarTranslucent
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        accessibilityViewIsModal
        style={[
          styles.overlay,
          {
            backgroundColor: colors.scrim,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <Pressable
          accessible={false}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          style={[
            styles.cardMotion,
            elevation.overlay,
            {
              borderRadius: shape.radius.sheet,
              transform: [
                { translateY: cardTranslateY },
                { scale: cardScale },
              ],
            },
          ]}
        >
          <PlatformGlassSurface
            effectStyle="regular"
            style={[
              styles.card,
              {
                borderColor: isDark ? colors.glassBorder : `${accentColor}1F`,
                borderRadius: shape.radius.sheet,
                paddingBottom: spacing.lg,
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.md,
              },
            ]}
          >
            <LinearGradient
              colors={[
                isDark ? `${accentColor}2B` : `${accentColor}18`,
                'transparent',
              ]}
              end={{ x: 0.78, y: 1 }}
              pointerEvents="none"
              start={{ x: 0.22, y: 0 }}
              style={styles.ambientGradient}
            />

            <View style={styles.closeRow}>
              <Pressable
                accessibilityLabel={primaryLabel}
                accessibilityRole="button"
                hitSlop={6}
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  {
                    backgroundColor: pressed
                      ? colors.statePressed
                      : colors.surfaceSunken,
                    borderColor: colors.border,
                    borderRadius: shape.radius.pill,
                  },
                ]}
              >
                <Ionicons color={colors.text} name="close" size={20} />
              </Pressable>
            </View>

            <View style={[styles.artworkStage, { marginBottom: spacing.md }]}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.halo,
                  {
                    backgroundColor: `${accentColor}1F`,
                    borderColor: `${accentColor}2E`,
                    opacity: haloOpacity,
                    transform: [{ scale: haloScale }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.iconWell,
                  {
                    backgroundColor: `${accentColor}14`,
                    borderRadius: 999,
                    transform: [{ scale: iconScale }],
                  },
                ]}
              >
                <Ionicons
                  color={accentColor}
                  name={icon ?? VARIANT_ICONS[variant]}
                  size={56}
                />
              </Animated.View>
            </View>

            <View style={[styles.copy, { gap: spacing.sm }]}>
              <Text
                accessibilityRole="header"
                style={styles.title}
                variant="title"
                weight="bold"
              >
                {title}
              </Text>
              <Text
                color={colors.textSubtle}
                style={styles.message}
                variant="supporting"
                weight="medium"
              >
                {message}
              </Text>
            </View>

            <View style={[styles.actions, { gap: spacing.sm, marginTop: spacing.xl }]}>
              <Button
                fullWidth
                label={primaryLabel}
                onPress={onPrimaryPress}
                size="large"
              />
              {secondaryLabel && onSecondaryPress ? (
                <Button
                  fullWidth
                  label={secondaryLabel}
                  onPress={onSecondaryPress}
                  variant="ghost"
                />
              ) : null}
            </View>
          </PlatformGlassSurface>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    width: '100%',
  },
  ambientGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  artworkStage: {
    alignItems: 'center',
    height: 154,
    justifyContent: 'center',
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    width: '100%',
  },
  cardMotion: {
    maxWidth: 420,
    width: '100%',
  },
  closeButton: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  closeRow: {
    alignItems: 'flex-end',
    height: 40,
    zIndex: 2,
  },
  copy: {
    alignItems: 'center',
  },
  halo: {
    borderRadius: 88,
    borderWidth: StyleSheet.hairlineWidth,
    height: 176,
    position: 'absolute',
    width: 176,
  },
  iconWell: {
    alignItems: 'center',
    height: 112,
    justifyContent: 'center',
    width: 112,
  },
  message: {
    maxWidth: 320,
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
});
