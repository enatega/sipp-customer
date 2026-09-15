import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import PressableScale from '../../../../../general/components/PressableScale';
import Text from '../../../../../general/components/Text';
import { useTheme } from '../../../../../general/theme/theme';
import type { DeliveryStoreDetailsFilterItem } from '../../../api/types';

type Props = {
  activeSubcategoryId: string | null;
  onSelect: (subcategoryId: string) => void;
  subcategories: DeliveryStoreDetailsFilterItem[];
};

export default function StoreDetailSubcategory({
  activeSubcategoryId,
  onSelect,
  subcategories,
}: Props) {
  const { colors, layout, shape, spacing } = useTheme();

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { gap: spacing.sm }]}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {subcategories.map((subcategory) => {
        const isActive = subcategory.id === activeSubcategoryId;

        return (
          <PressableScale
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={subcategory.id}
            onPress={() => onSelect(subcategory.id)}
            style={[
              styles.chip,
              {
                borderRadius: shape.radius.pill,
                minHeight: layout.touchTarget.minimum,
              },
            ]}
          >
            <View
              style={[
                styles.chipSurface,
                {
                  backgroundColor: isActive ? colors.primarySoft : 'transparent',
                  borderRadius: shape.radius.pill,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              <Text
                color={isActive ? colors.primary : colors.textSubtle}
                variant="label"
                weight={isActive ? 'bold' : 'medium'}
              >
                {subcategory.name}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSurface: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
  },
  content: {
    alignItems: 'center',
  },
});
