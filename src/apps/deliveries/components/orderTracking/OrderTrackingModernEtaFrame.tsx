import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";
import { useTranslation } from "react-i18next";

import Text from "../../../../general/components/Text";
import { useReducedMotion } from "../../../../general/hooks/useReducedMotion";
import { useTheme } from "../../../../general/theme/theme";
import type { DeliveryOrderStatus } from "../../api/ordersServiceTypes";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RING_SIZE = 100;
const RING_STROKE = 7.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type Props = {
  arrivalWindowLabel?: string | null;
  etaLabel: string;
  hasLiveEta: boolean;
  showDeliveredTitle: boolean;
  status: DeliveryOrderStatus;
  statusMessage?: string | null;
  statusTitle: string;
};

export default function OrderTrackingModernEtaFrame({
  arrivalWindowLabel,
  etaLabel,
  hasLiveEta,
  showDeliveredTitle,
  status,
  statusMessage,
  statusTitle,
}: Props) {
  const { t } = useTranslation("deliveries");
  const { colors, motion } = useTheme();
  const isReducedMotionEnabled = useReducedMotion();
  const progress = useMemo(() => getStatusProgress(status), [status]);
  const animatedProgress = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    if (isReducedMotionEnabled) {
      animatedProgress.setValue(progress);
      return;
    }

    Animated.spring(animatedProgress, {
      damping: motion.spring.gentle.damping,
      mass: motion.spring.gentle.mass,
      stiffness: motion.spring.gentle.stiffness,
      toValue: progress,
      useNativeDriver: false,
    }).start();
  }, [animatedProgress, isReducedMotionEnabled, motion.spring.gentle, progress]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [RING_CIRCUMFERENCE, 0],
  });
  const isTerminalFailure = ["cancelled", "failed", "rejected"].includes(
    status?.toLowerCase?.() ?? "",
  );
  const accentColor = showDeliveredTitle
    ? colors.success
    : isTerminalFailure
      ? colors.danger
      : status?.toLowerCase?.() === "delayed"
        ? colors.warning
        : colors.primary;
  const compactEtaLabel = hasLiveEta && /\d/.test(etaLabel)
    ? etaLabel
    : t(getCompactEtaKey(status, showDeliveredTitle));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.blue50, colors.surface, colors.surface]}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={styles.backgroundWash}
      />

      <View
        style={[
          styles.ringWrap,
          { shadowColor: accentColor },
        ]}
      >
        <Svg height={RING_SIZE} width={RING_SIZE}>
          <Defs>
            <SvgLinearGradient id="trackingRingGradient" x1="0" x2="1" y1="0" y2="1">
              <Stop offset="0" stopColor={isTerminalFailure ? accentColor : colors.blue500} />
              <Stop offset="1" stopColor={accentColor} />
            </SvgLinearGradient>
          </Defs>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            fill="transparent"
            r={RING_RADIUS}
            stroke={colors.surfaceSunken}
            strokeWidth={RING_STROKE}
          />
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            fill="transparent"
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            r={RING_RADIUS}
            rotation="-90"
            stroke="url(#trackingRingGradient)"
            strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth={RING_STROKE}
          />
        </Svg>
        <View style={styles.ringContent}>
          <Text
            adjustsFontSizeToFit
            color={colors.text}
            numberOfLines={1}
            style={styles.etaValue}
            weight="bold"
          >
            {compactEtaLabel}
          </Text>
          {!showDeliveredTitle && hasLiveEta ? (
            <Text color={colors.textSubtle} style={styles.etaCaption} weight="medium">
              {t("order_tracking_eta_remaining")}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.statusCopy}>
        <View style={styles.eyebrowRow}>
          <View style={[styles.eyebrowDot, { backgroundColor: accentColor }]} />
          <Text color={accentColor} numberOfLines={1} style={styles.eyebrowText} weight="semiBold">
            {t("order_tracking_progress")}
          </Text>
        </View>
        <Text color={colors.text} numberOfLines={2} style={styles.statusTitle} weight="bold">
          {statusTitle}
        </Text>
        {statusMessage ? (
          <Text
            color={colors.mutedText}
            numberOfLines={2}
            style={styles.statusMessage}
            weight="regular"
          >
            {statusMessage}
          </Text>
        ) : null}
        {arrivalWindowLabel ? (
          <Text
            color={accentColor}
            numberOfLines={1}
            style={styles.arrivalWindow}
            weight="semiBold"
          >
            {arrivalWindowLabel}
          </Text>
        ) : null}
      </View>

      {!showDeliveredTitle && !isTerminalFailure ? (
        <Image
          pointerEvents="none"
          resizeMode="contain"
          source={require("../../assets/images/tracking-bag.png")}
          style={styles.deliveryAccent}
        />
      ) : null}
    </View>
  );
}

function getCompactEtaKey(
  status: DeliveryOrderStatus,
  showDeliveredTitle: boolean,
) {
  if (showDeliveredTitle) return "order_tracking_eta_short_delivered";

  const normalizedStatus = status?.toLowerCase?.() ?? "";
  if (["cancelled", "failed", "rejected"].includes(normalizedStatus)) {
    return "order_tracking_eta_short_ended";
  }
  if (normalizedStatus === "arrived") return "order_tracking_eta_short_nearby";
  if (["picked_up", "out_for_delivery"].includes(normalizedStatus)) {
    return "order_tracking_eta_short_on_way";
  }
  if (["preparing", "ready", "rider_assigned"].includes(normalizedStatus)) {
    return "order_tracking_eta_short_preparing";
  }
  if (["pending", "accepted", "scheduled"].includes(normalizedStatus)) {
    return "order_tracking_eta_short_confirming";
  }

  return "order_tracking_eta_short_updating";
}

function getStatusProgress(status: DeliveryOrderStatus) {
  const normalizedStatus = status?.toLowerCase?.() ?? "";

  if (["cancelled", "failed", "rejected"].includes(normalizedStatus)) return 1;
  if (normalizedStatus === "delivered") return 1;
  if (["picked_up", "out_for_delivery", "arrived"].includes(normalizedStatus)) return 0.78;
  if (["preparing", "ready", "rider_assigned"].includes(normalizedStatus)) return 0.52;
  return 0.28;
}

const styles = StyleSheet.create({
  arrivalWindow: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 5,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    minHeight: RING_SIZE,
    paddingBottom: 8,
    paddingTop: 4,
    position: "relative",
    width: "100%",
  },
  backgroundWash: {
    borderRadius: 32,
    bottom: -12,
    left: -10,
    opacity: 0.86,
    position: "absolute",
    right: -18,
    top: -10,
  },
  deliveryAccent: {
    height: 50,
    opacity: 0.96,
    position: "absolute",
    right: 2,
    top: -3,
    width: 50,
  },
  eyebrowDot: {
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  eyebrowRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 3,
  },
  eyebrowText: {
    fontSize: 10,
    lineHeight: 13,
  },
  etaCaption: {
    fontSize: 9,
    lineHeight: 11,
    marginTop: 1,
    textAlign: "center",
  },
  etaValue: {
    fontSize: 16,
    letterSpacing: -0.4,
    lineHeight: 19,
    maxWidth: 82,
    textAlign: "center",
  },
  ringContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  ringWrap: {
    elevation: 4,
    height: RING_SIZE,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    width: RING_SIZE,
  },
  statusCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 56,
  },
  statusMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  statusTitle: {
    fontSize: 20,
    letterSpacing: -0.5,
    lineHeight: 25,
  },
});
