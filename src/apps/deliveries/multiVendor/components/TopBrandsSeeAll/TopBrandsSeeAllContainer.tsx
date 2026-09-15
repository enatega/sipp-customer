import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import useDebouncedValue from '../../../../../general/hooks/useDebouncedValue';
import type { DeliveryTopBrand } from '../../../api/types';
import { usePaginatedTopBrands } from '../../../hooks';
import TopBrandsSeeAllEmptyState from './TopBrandsSeeAllEmptyState';
import TopBrandsSeeAllErrorState from './TopBrandsSeeAllErrorState';
import TopBrandsSeeAllItem from './TopBrandsSeeAllItem';
import TopBrandsSeeAllSkeleton from './TopBrandsSeeAllSkeleton';
import useTopBrandNavigation from '../../hooks/useTopBrandNavigation';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';

type TopBrandsSeeAllContainerProps = {
  searchValue: string;
};

export default function TopBrandsSeeAllContainer({
  searchValue,
}: TopBrandsSeeAllContainerProps) {
  const { layout, spacing } = useTheme();
  const { gutter, isCompact, isMedium } = useWindowClass();
  const columns = isCompact ? 2 : isMedium ? 3 : 4;
  const debouncedSearchValue = useDebouncedValue(searchValue.trim(), 500);
  const { canOpenBrand, openTopBrand } = useTopBrandNavigation();
  const {
    data: topBrands = [],
    isPending,
    isError,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    fetchNextPage,
  } = usePaginatedTopBrands({
    mode: 'paginated',
    search: debouncedSearchValue,
  });

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleBrandPress = useCallback(
    (brand: DeliveryTopBrand) => {
      openTopBrand(brand);
    },
    [openTopBrand],
  );

  if (isPending) {
    return <TopBrandsSeeAllSkeleton />;
  }

  if (isError) {
    return (
      <TopBrandsSeeAllErrorState
        isRetrying={isRefetching}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <FlatList
      key={`top-brands-${columns}`}
      data={topBrands}
      numColumns={columns}
      keyExtractor={(item, index) => `${item.name}-${index}`}
      renderItem={({ item }) => (
        <TopBrandsSeeAllItem
          brand={item}
          onPress={handleBrandPress}
          isDisabled={!canOpenBrand(item)}
        />
      )}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={<TopBrandsSeeAllEmptyState />}
      contentContainerStyle={[
        styles.emptyContent,
        {
          maxWidth: layout.contentMaxWidth.commerce,
          paddingBottom: spacing.section.default,
          paddingHorizontal: gutter,
        },
      ]}
      columnWrapperStyle={[styles.row, { gap: spacing.md, marginBottom: spacing.lg }]}
      style={styles.list}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  emptyContent: {
    flexGrow: 1,
  },
  list: {
    alignSelf: 'center',
    width: '100%',
  },
  row: {
    justifyContent: 'flex-start',
  },
});
