import React from 'react';
import { StyleSheet, View } from 'react-native';
import HorizontalList from '../../../../../general/components/HorizontalList';
import SectionActionHeader from '../../../../../general/components/SectionActionHeader';
import {
  DiscoveryCategoryCard,
  DiscoveryCategorySkeleton,
  DiscoverySectionState,
} from '../../../components/discovery';
import DeliveriesSectionEmptyState from '../../../components/home/DeliveriesSectionEmptyState';
import type { DeliveryShopTypeCategory } from '../../../api/categoriesServicesTypes';
import { useTheme } from '../../../../../general/theme/theme';
import { useTranslation } from 'react-i18next';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';

type Props = {
  categories: DeliveryShopTypeCategory[];
  isPending: boolean;
  isError?: boolean;
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  onSeeAllPress: () => void;
  sectionTitle: string;
  actionLabel: string;
};

export default function MainSeeAllCategoriesSection({
  categories,
  isPending,
  isError = false,
  selectedCategoryId,
  onSelectCategory,
  onSeeAllPress,
  sectionTitle,
  actionLabel,
}: Props) {
  const { colors, shape, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const { t } = useTranslation('deliveries');
  const isEmpty = !isPending && !isError && categories.length === 0;
  const shouldShowSeeAll = !isPending && !isError && categories.length > 0;

  return (
    <View style={[styles.section, { gap: spacing.md, paddingHorizontal: gutter }]}> 
      <SectionActionHeader
        title={sectionTitle}
        actionLabel={shouldShowSeeAll ? actionLabel : undefined}
        onActionPress={onSeeAllPress}
      />

      {isPending ? (
        <DiscoveryCategorySkeleton />
      ) : isError ? (
        <DiscoverySectionState
          tone="error"
          title={t('multi_vendor_home_section_error_title')}
          message={t('multi_vendor_shop_type_stores_error')}
        />
      ) : isEmpty ? (
        <DeliveriesSectionEmptyState
          title={t('multi_vendor_home_section_empty_title')}
          message={t('multi_vendor_shop_types_empty')}
        />
      ) : (
        <HorizontalList
          data={categories}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          contentContainerStyle={{ paddingRight: gutter }}
          renderItem={({ item }) => {
            const isSelected = selectedCategoryId === item.id;
            return (
                <DiscoveryCategoryCard
                  imageUrl={item.imageUrl}
                  title={item.name}
                  onPress={() => onSelectCategory(item.id)}
                  imageWrapStyle={
                    isSelected
                      ? [
                          styles.imageWrapBase,
                          styles.selectedImageWrap,
                          {
                            backgroundColor: colors.primarySoft,
                            borderColor: colors.primary,
                            borderRadius: shape.radius.surface,
                          },
                        ]
                      : [styles.imageWrapBase, { borderRadius: shape.radius.surface }]
                  }
                  imageStyle={[styles.categoryImage, { borderRadius: shape.radius.control }]}
                  titleStyle={isSelected ? { ...styles.selectedTitle, color: colors.primary } : undefined}
                />
              );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  categoryImage: {
    height: 60,
    width: 60,
  },
  imageWrapBase: {
    height: 80,
    width: 80,
  },
  section: {},
  selectedImageWrap: {
    alignItems: 'center',
    borderWidth: 2,
    justifyContent: 'center',
  },
  selectedTitle: {},
});
