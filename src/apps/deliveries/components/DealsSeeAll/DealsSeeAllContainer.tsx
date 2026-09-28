import React, { useCallback } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import type { DeliveryDealItem, DeliveryDealsTabType } from "../../api/dealsServiceTypes";
import DealsSeeAllEmptyState from "./DealsSeeAllEmptyState";
import DealsSeeAllErrorState from "./DealsSeeAllErrorState";
import DealsSeeAllItem from "./DealsSeeAllItem";
import DealsSeeAllListHeader from "./DealsSeeAllListHeader";
import DealsSeeAllSkeleton from "./DealsSeeAllSkeleton";
import { useTheme } from "../../../../general/theme/theme";
import { useWindowClass } from "../../../../general/hooks/useWindowClass";

type DealsSeeAllContainerProps = {
  data: DeliveryDealItem[];
  fetchNextPage: () => Promise<unknown> | unknown;
  hasNextPage?: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  onDealPress: (deal: DeliveryDealItem) => void;
  onTabChange: (tab: DeliveryDealsTabType) => void;
  isPending: boolean;
  isRefetching: boolean;
  isTabsVisible?: boolean;
  refetch: () => Promise<unknown> | unknown;
  selectedTab: DeliveryDealsTabType;
  title: string;
};

const DealsSeeAllContainer = ({
  data,
  fetchNextPage,
  hasNextPage,
  isError,
  isFetchingNextPage,
  onDealPress,
  onTabChange,
  isPending,
  isRefetching,
  isTabsVisible = true,
  refetch,
  selectedTab,
  title,
}: DealsSeeAllContainerProps) => {
  const { colors, layout } = useTheme();
  const { gutter } = useWindowClass();
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isPending) {
    return <DealsSeeAllSkeleton isTabsVisible={isTabsVisible} />;
  }

  if (isError) {
    return (
      <DealsSeeAllErrorState
        isRetrying={isRefetching}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.dealId}
      ListHeaderComponent={
        <DealsSeeAllListHeader
          isTabsVisible={isTabsVisible}
          onTabChange={onTabChange}
          selectedTab={selectedTab}
          title={title}
        />
      }
      ListEmptyComponent={<DealsSeeAllEmptyState />}
      renderItem={({ item }) => (
        <DealsSeeAllItem item={item} onPress={onDealPress} />
      )}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4}
      refreshing={isRefetching && !isFetchingNextPage}
      onRefresh={() => { void refetch(); }}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={styles.footer} /> : null}
      contentContainerStyle={[styles.listContent, { maxWidth: layout.contentMaxWidth.commerce, paddingHorizontal: gutter }]}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default DealsSeeAllContainer;

const styles = StyleSheet.create({
  listContent: {
    alignSelf: 'center',
    flexGrow: 1,
    paddingBottom: 40,
    width: '100%',
  },
  separator: { height: 12 },
  footer: { paddingVertical: 20 },
});
