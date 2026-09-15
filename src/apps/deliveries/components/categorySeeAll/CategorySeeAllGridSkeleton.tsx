import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '../../../../general/components/Skeleton';
import { useTheme } from '../../../../general/theme/theme';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';

export default function CategorySeeAllGridSkeleton() {
  const { layout, shape, spacing } = useTheme();
  const { gutter, isCompact, isMedium, width } = useWindowClass();
  const columns = isCompact ? (width < 360 ? 2 : 3) : isMedium ? 4 : 6;
  const contentWidth = Math.min(width, layout.contentMaxWidth.commerce) - gutter * 2;
  const itemSize = (contentWidth - spacing.md * (columns - 1)) / columns;

  return (
    <View
      style={[
        styles.grid,
        {
          gap: spacing.md,
          maxWidth: layout.contentMaxWidth.commerce,
          paddingHorizontal: gutter,
        },
      ]}
    >
      {Array.from({ length: columns * 2 }).map((_, index) => (
        <View key={index} style={[styles.card, { marginBottom: spacing.lg, width: itemSize }]}>
          <Skeleton width={itemSize} height={itemSize} borderRadius={shape.radius.surface} />
          <Skeleton width="76%" height={16} borderRadius={shape.radius.xs} />
          <Skeleton width="62%" height={16} borderRadius={shape.radius.xs} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 8,
  },
  grid: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 4,
    paddingBottom: 24,
    width: '100%',
  },
});
