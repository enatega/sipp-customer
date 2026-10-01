import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton from '../../../../../general/components/Skeleton';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';
import StoreDetailHeroCurve from './StoreDetailHeroCurve';
import StoreDetailMenuCardSkeleton from './StoreDetailMenuCardSkeleton';
import { STORE_DETAIL_HERO_HEIGHT } from './StoreDetailNavigationHeader';

export default function StoreDetailsScreenSkeleton() {
  const { colors, elevation, isDark, layout, shape, spacing } = useTheme();
  const pageBackground = isDark ? colors.canvas : colors.surface;
  const { gutter } = useWindowClass();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: pageBackground }]}>
      <View style={{ height: STORE_DETAIL_HERO_HEIGHT }}>
        <Skeleton height={STORE_DETAIL_HERO_HEIGHT} width="100%" borderRadius={0} />
        <StoreDetailHeroCurve fillColor={pageBackground} />
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

      <View style={[elevation.subtle, {
        backgroundColor: colors.surfaceElevated,
        borderRadius: shape.radius.sheet,
        gap: spacing.md,
        marginHorizontal: gutter,
        marginTop: -spacing.hero,
        padding: spacing.xl,
      }]}>
        <View style={[styles.identity, { gap: spacing.md }]}>
          <Skeleton height={68} width={68} borderRadius={shape.radius.control} />
          <View style={{ flex: 1, gap: spacing.sm }}>
            <Skeleton height={24} width="68%" borderRadius={shape.radius.xs} />
            <Skeleton height={16} width="42%" borderRadius={shape.radius.xs} />
          </View>
          <Skeleton height={layout.touchTarget.minimum} width={layout.touchTarget.minimum}
            borderRadius={shape.radius.pill} />
        </View>
        <View style={[styles.status, { gap: spacing.xs }]}>
          <Skeleton height={9} width={9} borderRadius={shape.radius.pill} />
          <Skeleton height={14} width={52} borderRadius={shape.radius.xs} />
          <Skeleton height={14} width="34%" borderRadius={shape.radius.xs} />
        </View>
        <Skeleton height={1} width="100%" borderRadius={0} />
        <View style={[styles.metrics, { borderColor: colors.border, borderRadius: shape.radius.control }]}>
          <Skeleton height={16} width="24%" borderRadius={shape.radius.xs} />
          <Skeleton height={16} width="22%" borderRadius={shape.radius.xs} />
          <Skeleton height={16} width="24%" borderRadius={shape.radius.xs} />
        </View>
      </View>

      <View style={{ paddingHorizontal: gutter, paddingTop: spacing.xl }}>
        <View style={[styles.searchRow, { gap: spacing.sm }]}>
          <View style={[styles.searchField, {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
            borderRadius: shape.radius.control,
            gap: spacing.sm,
            minHeight: layout.touchTarget.comfortable,
            paddingHorizontal: spacing.md,
          }]}>
            <Skeleton height={20} width={20} borderRadius={shape.radius.pill} />
            <Skeleton height={16} width="58%" borderRadius={shape.radius.xs} />
          </View>
          <Skeleton height={layout.touchTarget.minimum} width={layout.touchTarget.minimum}
            borderRadius={shape.radius.pill} />
        </View>
        <View style={[styles.categories, { gap: spacing.sm, paddingVertical: spacing.sm }]}>
          <Skeleton height={layout.touchTarget.minimum} width={104} borderRadius={shape.radius.pill} />
          <Skeleton height={layout.touchTarget.minimum} width={88} borderRadius={shape.radius.pill} />
          <Skeleton height={layout.touchTarget.minimum} width={80} borderRadius={shape.radius.pill} />
        </View>
        <Skeleton height={24} width="38%" borderRadius={shape.radius.xs}
          style={{ marginBottom: spacing.md, marginTop: spacing.lg }} />
        <StoreDetailMenuCardSkeleton />
        <View style={{ height: spacing.md }} />
        <StoreDetailMenuCardSkeleton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  identity: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  status: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  metrics: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: 56,
  },
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  searchField: {
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    flexDirection: 'row',
  },
  categories: {
    flexDirection: 'row',
    overflow: 'hidden',
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
