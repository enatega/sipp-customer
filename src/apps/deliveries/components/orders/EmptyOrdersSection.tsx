import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import PressableScale from "../../../../general/components/PressableScale";
import Text from "../../../../general/components/Text";
import { useReducedMotion } from "../../../../general/hooks/useReducedMotion";
import { useTheme } from "../../../../general/theme/theme";
import type { SvgName } from "../Svg";

type Props = {
  title: string;
  description: string;
  ctaLabel: string;
  svgName?: SvgName;
  onPress?: () => void;
};

const EmptyOrdersSection = ({ title, description, ctaLabel, onPress }: Props) => {
  const { colors, motion, shape, spacing } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const entrance = useRef(new Animated.Value(isReducedMotionEnabled ? 1 : 0)).current;

  useEffect(() => {
    if (isReducedMotionEnabled) {
      entrance.setValue(1);
      return;
    }

    Animated.spring(entrance, {
      damping: motion.spring.gentle.damping,
      mass: motion.spring.gentle.mass,
      stiffness: motion.spring.gentle.stiffness,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrance, isReducedMotionEnabled, motion.spring.gentle]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: shape.radius.hero,
          opacity: entrance,
          padding: spacing.xxl,
          transform: [
            { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
          ],
        },
      ]}
    >
      <View style={styles.artwork}>
        <View
          style={[
            styles.orbit,
            { borderColor: colors.divider, borderRadius: shape.radius.pill },
          ]}
        />
        <View
          style={[
            styles.primaryIcon,
            { backgroundColor: colors.primarySoft, borderRadius: shape.radius.pill },
          ]}
        >
          <MaterialCommunityIcons color={colors.primary} name="shopping-outline" size={30} />
        </View>
        <View
          style={[
            styles.accentIcon,
            styles.accentIconTop,
            { backgroundColor: colors.cardPeach, borderRadius: shape.radius.pill },
          ]}
        >
          <MaterialCommunityIcons color={colors.warningText} name="silverware-fork-knife" size={14} />
        </View>
        <View
          style={[
            styles.accentIcon,
            styles.accentIconBottom,
            { backgroundColor: colors.cardMint, borderRadius: shape.radius.pill },
          ]}
        >
          <MaterialCommunityIcons color={colors.successText} name="map-marker-outline" size={14} />
        </View>
      </View>

      <Text color={colors.textStrong} style={styles.title} variant="cardTitle" weight="bold">
        {title}
      </Text>
      <Text color={colors.textSubtle} style={styles.subtitle} variant="supporting" weight="medium">
        {description}
      </Text>

      <PressableScale
        accessibilityRole="button"
        onPress={onPress}
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            borderRadius: shape.radius.control,
            marginTop: spacing.lg,
          },
        ]}
      >
        <Text color={colors.onPrimary} variant="button" weight="semiBold">
          {ctaLabel}
        </Text>
        <MaterialCommunityIcons color={colors.onPrimary} name="arrow-right" size={19} />
      </PressableScale>
    </Animated.View>
  );
};

export default EmptyOrdersSection;

const styles = StyleSheet.create({
  accentIcon: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    position: "absolute",
    width: 34,
  },
  accentIconBottom: {
    bottom: 2,
    left: 3,
  },
  accentIconTop: {
    right: 2,
    top: 0,
  },
  artwork: {
    height: 118,
    justifyContent: "center",
    marginBottom: 18,
    width: 150,
  },
  button: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 20,
  },
  container: {
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    marginTop: 4,
    overflow: "hidden",
  },
  orbit: {
    alignSelf: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    height: 100,
    position: "absolute",
    width: 100,
  },
  primaryIcon: {
    alignItems: "center",
    alignSelf: "center",
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  subtitle: {
    maxWidth: 300,
    textAlign: "center",
  },
  title: {
    marginBottom: 6,
    textAlign: "center",
  },
});
