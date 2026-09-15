import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import type { DeliveryDiscoveryCategoryItem } from '../discovery';
import CategorySeeAllGridEmptyState from './CategorySeeAllGridEmptyState';
import CategorySeeAllGridErrorState from './CategorySeeAllGridErrorState';
import CategorySeeAllGridItem from './CategorySeeAllGridItem';
import CategorySeeAllGridListHeader from './CategorySeeAllGridListHeader';
import CategorySeeAllGridSkeleton from './CategorySeeAllGridSkeleton';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../general/theme/theme';

type Props = {
  data: DeliveryDiscoveryCategoryItem[];
  fetchNextPage: () => Promise<unknown> | unknown;
  hasNextPage?: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  isRefetching: boolean;
  onItemPress: (item: DeliveryDiscoveryCategoryItem) => void;
  refetch: () => Promise<unknown> | unknown;
  title: string;
};

export default function CategorySeeAllGrid({
  data,
  fetchNextPage,
  hasNextPage,
  isError,
  isFetchingNextPage,
  isPending,
  isRefetching,
  onItemPress,
  refetch,
  title,
}: Props) {
  const { layout, spacing } = useTheme();
  const { gutter, isCompact, isMedium, width } = useWindowClass();
  const columns = isCompact ? (width < 360 ? 2 : 3) : isMedium ? 4 : 6;
  const contentWidth = Math.min(width, layout.contentMaxWidth.commerce) - gutter * 2;
  const itemSize = (contentWidth - spacing.md * (columns - 1)) / columns;
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isPending) {
    return <CategorySeeAllGridSkeleton />;
  }

  if (isError) {
    return (
      <CategorySeeAllGridErrorState
        isRetrying={isRefetching}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <FlatList
      key={`category-grid-${columns}`}
      data={data}
      numColumns={columns}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<CategorySeeAllGridListHeader title={title} />}
      ListEmptyComponent={<CategorySeeAllGridEmptyState />}
      renderItem={({ item }) => (
        <CategorySeeAllGridItem item={item} onPress={onItemPress} size={itemSize} />
      )}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4}
      contentContainerStyle={[
        styles.listContent,
        {
          maxWidth: layout.contentMaxWidth.commerce,
          paddingBottom: spacing.section.default,
          paddingHorizontal: gutter,
        },
      ]}
      columnWrapperStyle={[styles.row, { gap: spacing.md, marginBottom: spacing.xl }]}
      style={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    alignSelf: 'center',
    width: '100%',
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 4,
  },
  row: {
    justifyContent: 'flex-start',
  },
});
