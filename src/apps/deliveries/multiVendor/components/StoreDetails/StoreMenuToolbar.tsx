import React from 'react';
import { View, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from '../../../../../general/components/Icon';
import IconButton from '../../../../../general/components/IconButton';
import PressableScale from '../../../../../general/components/PressableScale';
import Text from '../../../../../general/components/Text';
import { useTheme } from '../../../../../general/theme/theme';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import type { DeliveryStoreDetailsFilterItem } from '../../../api/types';
import StoreDetailTabs from './StoreDetailTabs';
import StoreDetailSectionNavigation from './StoreDetailSectionNavigation';

type Props = {
  categories: DeliveryStoreDetailsFilterItem[];
  subcategories: DeliveryStoreDetailsFilterItem[];
  activeCategoryId: string | null;
  activeSubcategoryId: string | null;
  onCategorySelect: (id: string) => void;
  onSubcategorySelect: (id: string) => void;
  onSearch: () => void;
  onAllCategories: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
};

export default function StoreMenuToolbar(props: Props) {
  const { colors, spacing, layout, shape } = useTheme();
  const { gutter } = useWindowClass();
  const { t } = useTranslation('deliveries');
  return (
    <View onLayout={props.onLayout} style={{ backgroundColor: colors.canvas, paddingBottom: spacing.xs }}>
      <View style={[styles.actions, { paddingHorizontal: gutter, gap: spacing.sm }]}>
        <PressableScale accessibilityRole="button" accessibilityLabel={t('store_details_search_placeholder')}
          onPress={props.onSearch} style={[styles.search, {
            backgroundColor: colors.surfaceElevated, borderRadius: shape.radius.control,
            minHeight: layout.touchTarget.comfortable, paddingHorizontal: spacing.md, gap: spacing.sm,
          }]}>
          <Icon name="search" type="Feather" size={20} color={colors.iconMuted} />
          <Text color={colors.textSubtle} variant="body" style={styles.label}>{t('store_details_search_placeholder')}</Text>
        </PressableScale>
        {props.categories.length > 0 ? <IconButton accessibilityLabel={t('store_menu_all_categories')}
          onPress={props.onAllCategories} icon={<Icon name="list" type="Feather" size={22} color={colors.text} />} /> : null}
      </View>
      {props.categories.length > 0 ? <StoreDetailTabs categories={props.categories}
        activeCategoryId={props.activeCategoryId} onSelect={props.onCategorySelect} /> : null}
      <StoreDetailSectionNavigation subcategories={props.subcategories}
        activeSubcategoryId={props.activeSubcategoryId} onSubcategorySelect={props.onSubcategorySelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', alignItems: 'center' },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  label: { flex: 1 },
});
