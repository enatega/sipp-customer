import React from 'react';
import { StyleSheet, View } from 'react-native';
import HorizontalList from '../HorizontalList';
import Skeleton from '../Skeleton';
import { useTheme } from '../../theme/theme';
import { useWindowClass } from '../../hooks/useWindowClass';

const SKELETON_ITEMS = Array.from({ length: 3 }, (_, index) => ({
  id: `discovery-results-skeleton-${index}`,
}));

export default function DiscoveryResultsSkeleton({ home = false }: { home?: boolean }) {
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
          style={[styles.card, home && styles.homeCard, { borderRadius: shape.radius.surface }]}
        >
          <Skeleton height={home ? 150 : 156} borderRadius={shape.radius.surface} />
          <View
            style={[styles.content, { gap: home ? spacing.xs : spacing.sm, padding: spacing.md }]}
          >
            <Skeleton height={home ? 18 : 18} width="70%" />
            <Skeleton height={home ? 14 : 14} width="55%" />
            {!home ? <Skeleton height={1} width="100%" /> : null}
            {home ? <Skeleton height={14} width="35%" /> : null}
            <Skeleton height={home ? 14 : 14} width="85%" />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    width: 280,
  },
  homeCard: {
    width: 268,
  },
  content: {
  },
});
