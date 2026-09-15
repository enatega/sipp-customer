import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton from '../../../../../general/components/Skeleton';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';
import StoreDetailHeroCurve from './StoreDetailHeroCurve';
import StoreDetailMenuCardSkeleton from './StoreDetailMenuCardSkeleton';
import { STORE_DETAIL_HERO_HEIGHT } from './StoreDetailNavigationHeader';

export default function StoreDetailsScreenSkeleton() {
  const { colors, layout, shape, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.canvas }]}>
      <LinearGradient
        colors={[colors.primarySoft, colors.canvas, colors.surface]}
        end={{ x: 0.82, y: 1 }}
        locations={[0, 0.54, 1]}
        pointerEvents="none"
        start={{ x: 0.18, y: 0 }}
        style={[StyleSheet.absoluteFill, styles.atmosphere]}
      />
      <View style={{ height: STORE_DETAIL_HERO_HEIGHT }}>
        <Skeleton height={STORE_DETAIL_HERO_HEIGHT} width="100%" borderRadius={0} />
        <StoreDetailHeroCurve fillColor={colors.canvas} />
      </View>

      <View
        style={[
          styles.navigationSkeleton,
          {
            paddingHorizontal: gutter,
            paddingTop: insets.top + spacing.sm,
          },
        ]}
      >
        <Skeleton
          borderRadius={shape.radius.pill}
          height={layout.touchTarget.minimum}
          width={layout.touchTarget.minimum}
        />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
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
      </View>

      <View
        style={[
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: shape.radius.sheet,
            gap: spacing.md,
            marginHorizontal: gutter,
            marginTop: -spacing.hero,
            padding: spacing.xl,
          },
        ]}
      >
        <View style={[styles.identity, { gap: spacing.md }]}>
          <Skeleton height={68} width={68} borderRadius={shape.radius.control} />
          <View style={{ flex: 1, gap: spacing.sm }}>
            <Skeleton height={24} width="68%" borderRadius={shape.radius.xs} />
            <Skeleton height={16} width="42%" borderRadius={shape.radius.xs} />
          </View>
        </View>
        <Skeleton height={1} width="100%" borderRadius={0} />
        <Skeleton height={56} width="100%" borderRadius={shape.radius.control} />
      </View>

      <View style={{ gap: spacing.lg, paddingHorizontal: gutter, paddingTop: spacing.xl }}>
        <Skeleton height={52} width="100%" borderRadius={shape.radius.surface} />
        <Skeleton height={44} width="100%" borderRadius={shape.radius.control} />
        <StoreDetailMenuCardSkeleton />
        <StoreDetailMenuCardSkeleton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  atmosphere: {
    opacity: 0.42,
  },
  container: {
    flex: 1,
  },
  identity: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  navigationSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
});
