import React, { useMemo } from 'react';
import { FlashList } from '@shopify/flash-list';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';
import type { DeliveryStoreDetailsFilterItem } from '../../../api/types';
import { useStoreDetailTabsScroll } from '../../hooks/useStoreDetailPager';
import StoreDetailTabItem from './StoreDetailTabItem';

type Props = {
  activeCategoryId: string | null;
  categories: DeliveryStoreDetailsFilterItem[];
  loadingCategoryIds?: Set<string>;
  onSelect: (categoryId: string) => void;
};

type TabDescriptor = {
  id: string;
  imageUrl: string | null;
  label: string;
};

export default function StoreDetailTabs({
  activeCategoryId,
  categories,
  loadingCategoryIds,
  onSelect,
}: Props) {
  const { spacing } = useTheme();
  const { gutter } = useWindowClass();
  const { scrollViewRef, ...scrollHandlers } = useStoreDetailTabsScroll({
    activeCategoryId,
    categories,
  });
  const tabs = useMemo<TabDescriptor[]>(() => categories.map((category) => ({
    id: category.id,
    imageUrl: category.imageUrl ?? null,
    label: category.name,
  })), [categories]);

  return (
    <FlashList
      // A large catalog (a supermarket-style store can have dozens of
      // categories) shouldn't mount every chip up front — window the list
      // like any other "load more as you scroll" content, while keeping
      // every category reachable by scrolling the pill bar itself.
      contentContainerStyle={{ paddingHorizontal: gutter, paddingVertical: spacing.sm }}
      data={tabs}
      horizontal
      keyExtractor={(tab) => tab.id}
      {...scrollHandlers}
      maintainVisibleContentPosition={{ disabled: true }}
      ref={scrollViewRef}
      renderItem={({ item: tab }) => {
        const isActive = tab.id === activeCategoryId;
        const isLoading = loadingCategoryIds?.has(tab.id) ?? false;

        return (
          <StoreDetailTabItem
            imageUrl={tab.imageUrl}
            isActive={isActive}
            isLoading={isLoading}
            label={tab.label}
            onPress={() => onSelect(tab.id)}
          />
        );
      }}
      showsHorizontalScrollIndicator={false}
    />
  );
}

