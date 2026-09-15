import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../../../../general/components/Text';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';
import type { DeliveryStoreDetailsFilterItem } from '../../../api/types';
import StoreDetailSubcategory from './StoreDetailSubcategory';

type Props = {
  activeSubcategoryId: string | null;
  onSubcategorySelect: (subcategoryId: string) => void;
  sectionTitle: string;
  subcategories: DeliveryStoreDetailsFilterItem[];
};

export default function StoreDetailSectionNavigation({
  activeSubcategoryId,
  onSubcategorySelect,
  sectionTitle,
  subcategories,
}: Props) {
  const { spacing } = useTheme();
  const { gutter } = useWindowClass();

  return (
    <View
      style={[
        styles.container,
        {
          gap: spacing.sm,
          paddingHorizontal: gutter,
          paddingTop: spacing.lg,
        },
      ]}
    >
      <Text
        maxFontSizeMultiplier={1.3}
        style={styles.sectionTitle}
        variant="sectionTitle"
        weight="bold"
      >
        {sectionTitle}
      </Text>

      {subcategories.length > 0 ? (
        <StoreDetailSubcategory
          activeSubcategoryId={activeSubcategoryId}
          onSelect={onSubcategorySelect}
          subcategories={subcategories}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    letterSpacing: -0.45,
    lineHeight: 30,
  },
});
