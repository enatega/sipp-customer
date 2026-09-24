import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';
import type { DeliveryStoreDetailsFilterItem } from '../../../api/types';
import StoreDetailSubcategory from './StoreDetailSubcategory';

type Props = {
  activeSubcategoryId: string | null;
  onSubcategorySelect: (subcategoryId: string) => void;
  subcategories: DeliveryStoreDetailsFilterItem[];
};

// This row sits at a fixed spot near the top of the menu, right below the
// category chips, and only ever has one useful job: surface the active
// category's subcategory chips. It used to also repeat the active
// category's name as a heading — redundant with (and, right after a jump,
// visually stacked on top of) that category's own inline heading further
// down, so it's been dropped here.
export default function StoreDetailSectionNavigation({
  activeSubcategoryId,
  onSubcategorySelect,
  subcategories,
}: Props) {
  const { spacing } = useTheme();
  const { gutter } = useWindowClass();

  if (subcategories.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: gutter,
          paddingTop: spacing.sm,
        },
      ]}
    >
      <StoreDetailSubcategory
        activeSubcategoryId={activeSubcategoryId}
        onSelect={onSubcategorySelect}
        subcategories={subcategories}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
});
