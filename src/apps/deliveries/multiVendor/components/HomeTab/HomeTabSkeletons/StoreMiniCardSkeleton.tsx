import React from 'react';
import { StyleSheet, View } from 'react-native';
import HorizontalList from '../../../../../../general/components/HorizontalList';
import Skeleton from '../../../../../../general/components/Skeleton';
import { useTheme } from '../../../../../../general/theme/theme';
import { useWindowClass } from '../../../../../../general/hooks/useWindowClass';

const SKELETON_ITEMS = Array.from({ length: 4 }, (_, index) => ({
  id: `store-mini-card-skeleton-${index}`,
}));

export default function StoreMiniCardSkeleton() {
  const { shape, spacing } = useTheme();
  const { gutter } = useWindowClass();

  return (
    <HorizontalList
      data={SKELETON_ITEMS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingBottom: spacing.lg,
        paddingRight: gutter,
        paddingTop: spacing.xs,
      }}
      ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
      renderItem={() => (
        <View
          style={[styles.card, { borderRadius: shape.radius.surface }]}
        >
          <View style={styles.imageWrapper}>
            <Skeleton height={92} width="100%" borderRadius={0} />
            <Skeleton height={24} width={72} borderRadius={6} style={styles.badge} />
            <Skeleton height={32} width={32} borderRadius={16} style={styles.addButton} />
          </View>

          <View
            style={[styles.content, { gap: spacing.xs, padding: spacing.sm }]}
          >
            <Skeleton height={15} width="42%" borderRadius={4} />
            <Skeleton height={18} width="82%" borderRadius={4} />
            <Skeleton height={15} width="58%" borderRadius={4} />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    width: 140,
  },
  imageWrapper: {
    height: 92,
    overflow: 'hidden',
    position: 'relative',
  },
  badge: {
    left: 8,
    position: 'absolute',
    top: 8,
  },
  addButton: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  content: {},
});
