import React from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import SearchInput from '../../../../../general/components/search/SearchInput';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';
import type { DeliveryStoreDetailsFilterItem } from '../../../api/types';
import StoreDetailTabs from './StoreDetailTabs';

type Props = {
  activeCategoryId: string | null;
  categories: DeliveryStoreDetailsFilterItem[];
  onCategorySelect: (categoryId: string | null) => void;
  onCategoriesLayout?: (event: LayoutChangeEvent) => void;
  onSearchChange: (value: string) => void;
  searchValue: string;
};

export default function StoreDetailMenuNavigation({
  activeCategoryId,
  categories,
  onCategorySelect,
  onCategoriesLayout,
  onSearchChange,
  searchValue,
}: Props) {
  const { spacing } = useTheme();
  const { gutter } = useWindowClass();
  const { t } = useTranslation('deliveries');

  return (
    <View
      style={[
        styles.navigation,
        {
          paddingBottom: categories.length > 0 ? spacing.xs : spacing.md,
          paddingTop: spacing.xs,
        },
      ]}
    >
      <View style={{ paddingHorizontal: gutter }}>
        <SearchInput
          density="compact"
          onChangeText={onSearchChange}
          placeholder={t('store_details_search_placeholder')}
          surfaceElevation="subtle"
          value={searchValue}
        />
      </View>

      {categories.length > 0 ? (
        <View onLayout={onCategoriesLayout} style={{ paddingTop: spacing.sm }}>
          <StoreDetailTabs
            activeCategoryId={activeCategoryId}
            categories={categories}
            onSelect={onCategorySelect}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  navigation: {
    width: '100%',
  },
});
