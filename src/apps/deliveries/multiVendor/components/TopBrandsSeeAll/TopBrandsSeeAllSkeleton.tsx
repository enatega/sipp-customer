import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from '../../../../../general/components/Skeleton';
import { useTheme } from '../../../../../general/theme/theme';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';

export default function TopBrandsSeeAllSkeleton() {
  const { layout, shape, spacing } = useTheme();
  const { gutter, isCompact, isMedium, width } = useWindowClass();
  const columns = isCompact ? 2 : isMedium ? 3 : 4;
  const contentWidth = Math.min(width, layout.contentMaxWidth.commerce) - gutter * 2;
  const cardWidth = (contentWidth - spacing.md * (columns - 1)) / columns;

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
        <View key={index} style={[styles.card, { marginBottom: spacing.lg, width: cardWidth }]}>
          <Skeleton width="100%" height={156} borderRadius={shape.radius.surface} />
          <View style={styles.content}>
            <Skeleton width="58%" height={18} borderRadius={shape.radius.xs} />
            <Skeleton width="42%" height={16} borderRadius={shape.radius.xs} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
  },
  content: {
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  grid: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 24,
    width: '100%',
  },
});
