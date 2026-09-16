import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Skeleton from "../../../../general/components/Skeleton";
import { useWindowClass } from "../../../../general/hooks/useWindowClass";
import { useTheme } from "../../../../general/theme/theme";
import ProductInfoCustomizationsLoadingSkeleton from "./ProductInfoCustomizationsLoadingSkeleton";

export default function ProductInfoLoadingSkeleton() {
  const { colors, elevation, layout, shape, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { gutter } = useWindowClass();
  const headerHeight = Math.min(Math.max(width * 0.82, 300), 420);
  const surfaceWidth = Math.min(width - gutter * 2, layout.contentMaxWidth.readable);
  const surfaceInset = (width - surfaceWidth) / 2;

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      <LinearGradient
        colors={[colors.primarySoft, colors.canvas, colors.canvas]}
        end={{ x: 0.82, y: 1 }}
        locations={[0, 0.42, 1]}
        pointerEvents="none"
        start={{ x: 0.18, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.hero, { height: headerHeight }]}>
        <Skeleton borderRadius={0} height="100%" width="100%" />
      </View>

      <View
        style={[
          styles.mediaActions,
          { left: gutter, right: gutter, top: insets.top + spacing.sm },
        ]}
      >
        <Skeleton
          borderRadius={shape.radius.pill}
          height={layout.touchTarget.minimum}
          width={layout.touchTarget.minimum}
        />
        <Skeleton
          borderRadius={shape.radius.pill}
          height={layout.touchTarget.minimum}
          width={layout.touchTarget.minimum}
        />
      </View>

      <View
        style={[
          styles.detailsSurface,
          elevation.raised,
          {
            backgroundColor: colors.surface,
            borderRadius: shape.radius.hero,
            gap: spacing.lg,
            padding: spacing.lg,
            width: surfaceWidth,
          },
        ]}
      >
        <View style={[styles.titleRow, { gap: spacing.md }]}>
          <View style={[styles.titleCopy, { gap: spacing.sm }]}>
            <Skeleton borderRadius={8} height={30} width="72%" />
            <Skeleton borderRadius={6} height={16} width="44%" />
          </View>
          <Skeleton borderRadius={8} height={26} width={74} />
        </View>

        <View style={[styles.badges, { gap: spacing.sm }]}>
          <Skeleton borderRadius={shape.radius.pill} height={26} width={82} />
          <Skeleton borderRadius={shape.radius.pill} height={26} width={94} />
        </View>

        <Skeleton borderRadius={6} height={16} width="92%" />
        <Skeleton borderRadius={6} height={16} width="76%" />
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <ProductInfoCustomizationsLoadingSkeleton />
      </View>

      <View
        style={[
          styles.footer,
          elevation.overlay,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.glassBorder,
            borderRadius: shape.radius.sheet,
            bottom: insets.bottom + spacing.sm,
            gap: spacing.sm,
            left: surfaceInset,
            padding: spacing.sm,
            width: surfaceWidth,
          },
        ]}
      >
        <Skeleton borderRadius={shape.radius.control} height={48} width={116} />
        <Skeleton borderRadius={shape.radius.control} height={48} style={styles.cta} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: "row",
  },
  container: {
    flex: 1,
  },
  cta: {
    flex: 1,
  },
  detailsSurface: {
    alignSelf: "center",
    marginTop: -28,
    paddingBottom: 140,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  footer: {
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    position: "absolute",
  },
  hero: {
    overflow: "hidden",
    width: "100%",
  },
  mediaActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    zIndex: 2,
  },
  titleCopy: {
    flex: 1,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
  },
});
