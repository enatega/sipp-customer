import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import VerticalList from '../VerticalList';
import Text from '../Text';
import { useTheme } from '../../theme/theme';
import type { FilterChip, GenericFilterablePaginatedListScreenProps } from './types';
import ListStateView from './ListStateView';
import { useWindowClass } from '../../hooks/useWindowClass';

export default function GenericFilterablePaginatedListScreen<
  TItem,
  TChip extends FilterChip = FilterChip,
>({
  title,
  data,
  totalCount,
  isPending,
  isError,
  error,
  refetch,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isRefetching,
  itemKeyExtractor,
  chips = [],
  clearAllLabel,
  onRemoveChip,
  onClearAll,
  renderSelectedFilters,
  emptyTitle,
  emptyDescription,
  loadingComponent,
  paginationLoadingComponent,
  header,
  filterSheet,
  listContentContainerStyle,
  renderItemCard,
}: GenericFilterablePaginatedListScreenProps<TItem, TChip>) {
  const { colors, layout, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const { t } = useTranslation('general');

  void error;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const keyExtractor = useCallback(
    (item: TItem, index: number) =>
      itemKeyExtractor ? itemKeyExtractor(item, index) : String(index),
    [itemKeyExtractor],
  );

  const renderItem = useCallback(
    ({ item }: { item: TItem }) => renderItemCard(item),
    [renderItemCard],
  );

  const items = useMemo(() => data ?? [], [data]);
  const isInitialLoading = isPending && items.length === 0;
  const hasInitialError = isError && items.length === 0;
  const isEmpty = !isInitialLoading && !isError && items.length === 0;
  const canRenderChips = chips.length > 0 && onRemoveChip && onClearAll;

  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
      {header}
      <View
        style={[
          styles.content,
          {
            maxWidth: layout.contentMaxWidth.commerce,
            paddingHorizontal: gutter,
          },
        ]}
      >
        {canRenderChips && renderSelectedFilters ? (
          renderSelectedFilters({
            chips,
            clearAllLabel: clearAllLabel ?? t('clear_all'),
            onRemoveChip,
            onClearAll,
          })
        ) : null}

        <View
          style={[
            styles.titleRow,
            {
              gap: spacing.md,
              marginBottom: spacing.md,
              marginTop: canRenderChips ? spacing.lg : spacing.sm,
            },
          ]}
        >
          <Text accessibilityRole="header" variant="sectionTitle" weight="extraBold" style={styles.title}>
            {title}
          </Text>
          {typeof totalCount === 'number' ? (
            <Text color={colors.textSubtle} variant="caption" weight="medium">
              {t('generic_list_results_count', { count: totalCount })}
            </Text>
          ) : null}
        </View>

        {isInitialLoading ? (
          loadingComponent ?? <ListStateView variant="loading" />
        ) : hasInitialError ? (
          <ListStateView
            variant="error"
            title={t('generic_list_error_title')}
            description={t('generic_list_error_description')}
            actionLabel={t('generic_list_retry')}
            onActionPress={() => {
              void refetch();
            }}
          />
        ) : isEmpty ? (
          <ListStateView
            variant="empty"
            title={emptyTitle ?? t('generic_list_empty_title')}
            description={emptyDescription ?? t('generic_list_empty_description')}
          />
        ) : (
          <VerticalList
            data={items}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: spacing.section.default },
              listContentContainerStyle,
            ]}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.35}
            refreshing={isRefetching && !isPending}
            onRefresh={handleRefresh}
            onScrollBeginDrag={Keyboard.dismiss}
            ListFooterComponent={
              isFetchingNextPage ? (
                paginationLoadingComponent ? (
                  <View style={[styles.footerContent, { paddingVertical: spacing.lg }]}>
                    {paginationLoadingComponent}
                  </View>
                ) : (
                  <View style={[styles.footerLoader, { paddingVertical: spacing.lg }]}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                )
              ) : null
            }
          />
        )}
      </View>

      {filterSheet}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    flex: 1,
    width: '100%',
  },
  footerLoader: {
    alignItems: 'center',
  },
  footerContent: {},
  listContent: {},
  screen: {
    flex: 1,
  },
  title: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
