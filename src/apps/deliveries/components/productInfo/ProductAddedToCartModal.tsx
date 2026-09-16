import React, { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useReducedMotion } from '../../../../general/hooks/useReducedMotion';
import Button from '../../../../general/components/Button';
import PlatformGlassSurface from '../../../../general/components/PlatformGlassSurface';
import Text from '../../../../general/components/Text';
import { useTheme } from '../../../../general/theme/theme';

const successIllustration = require('../../../../../assets/illustrations/cart-success.png');

type Props = {
  continueLabel: string;
  goToCartLabel: string;
  message: string;
  onContinueShopping: () => void;
  onGoToCart: () => void;
  title: string;
  visible: boolean;
};

export default function ProductAddedToCartModal({
  continueLabel,
  goToCartLabel,
  message,
  onContinueShopping,
  onGoToCart,
  title,
  visible,
}: Props) {
  const { colors, elevation, isDark, motion, shape, spacing } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardTranslateY = useRef(new Animated.Value(0)).current;
  const artworkScale = useRef(new Animated.Value(1)).current;
  const artworkTranslateY = useRef(new Animated.Value(0)).current;
  const haloPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    if (isReducedMotionEnabled) {
      cardScale.setValue(1);
      cardTranslateY.setValue(0);
      artworkScale.setValue(1);
      artworkTranslateY.setValue(0);
      haloPulse.setValue(1);
      return undefined;
    }

    cardScale.setValue(0.92);
    cardTranslateY.setValue(18);
    artworkScale.setValue(0.72);
    artworkTranslateY.setValue(10);
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
        Animated.parallel([
          Animated.spring(artworkScale, {
            damping: motion.spring.responsive.damping,
            mass: motion.spring.responsive.mass,
            stiffness: motion.spring.responsive.stiffness,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.spring(artworkTranslateY, {
            damping: motion.spring.responsive.damping,
            mass: motion.spring.responsive.mass,
            stiffness: motion.spring.responsive.stiffness,
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
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
    artworkScale,
    artworkTranslateY,
    cardScale,
    cardTranslateY,
    haloPulse,
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
      onRequestClose={onContinueShopping}
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
          onPress={onContinueShopping}
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
                borderColor: isDark ? colors.glassBorder : `${colors.primary}1F`,
                borderRadius: shape.radius.sheet,
                paddingBottom: spacing.lg,
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.md,
              },
            ]}
          >
            <LinearGradient
              colors={[
                isDark ? `${colors.primary}2B` : `${colors.primary}18`,
                'transparent',
              ]}
              end={{ x: 0.78, y: 1 }}
              pointerEvents="none"
              start={{ x: 0.22, y: 0 }}
              style={styles.ambientGradient}
            />

            <View style={styles.closeRow}>
              <Pressable
                accessibilityLabel={continueLabel}
                accessibilityRole="button"
                hitSlop={6}
                onPress={onContinueShopping}
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
                    backgroundColor: `${colors.primary}1F`,
                    borderColor: `${colors.primary}2E`,
                    opacity: haloOpacity,
                    transform: [{ scale: haloScale }],
                  },
                ]}
              />
              <Animated.View
                style={{
                  transform: [
                    { translateY: artworkTranslateY },
                    { scale: artworkScale },
                  ],
                }}
              >
                <Image
                  accessible={false}
                  accessibilityIgnoresInvertColors
                  resizeMode="contain"
                  source={successIllustration}
                  style={styles.artwork}
                />
              </Animated.View>
              <View
                pointerEvents="none"
                style={[
                  styles.sparkle,
                  styles.sparkleLeft,
                  { backgroundColor: colors.secondary },
                ]}
              />
              <View
                pointerEvents="none"
                style={[
                  styles.sparkle,
                  styles.sparkleRight,
                  { backgroundColor: colors.success },
                ]}
              />
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
                icon={
                  <Ionicons
                    color={colors.onPrimary}
                    name="cart-outline"
                    size={20}
                  />
                }
                label={goToCartLabel}
                onPress={onGoToCart}
                size="large"
              />
              <Button
                fullWidth
                label={continueLabel}
                onPress={onContinueShopping}
                variant="ghost"
              />
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
  artwork: {
    height: 140,
    width: 140,
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
  message: {
    maxWidth: 320,
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  sparkle: {
    borderRadius: 6,
    height: 10,
    position: 'absolute',
    width: 10,
  },
  sparkleLeft: {
    left: '22%',
    top: 38,
  },
  sparkleRight: {
    right: '21%',
    top: 82,
  },
  title: {
    textAlign: 'center',
  },
});
