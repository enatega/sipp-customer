import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HorizontalList from '../../../../../general/components/HorizontalList';
import SectionActionHeader from '../../../../../general/components/SectionActionHeader';
import { useTopBrands } from '../../../hooks';
import TopBrandsListSkeleton from './HomeTabSkeletons/TopBrandsListSkeleton';
import TopBrandCard from '../../../components/storeCard/TopBrandCard';
import type { MultiVendorStackParamList } from '../../navigation/types';
import useTopBrandNavigation from '../../hooks/useTopBrandNavigation';
import PressableScale from '../../../../../general/components/PressableScale';
import { useTheme } from '../../../../../general/theme/theme';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import type { DeliveryNearbyStore } from '../../../api/types';

type NavigationProp = NativeStackNavigationProp<
  MultiVendorStackParamList,
  'TopBrandsSeeAll'
>;

type Props = {
  onClosedStorePress?: (store: DeliveryNearbyStore) => void;
};

export default function TopBrandsList({ onClosedStorePress }: Props) {
  const { t } = useTranslation('deliveries');
  const { shape, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const navigation = useNavigation<NavigationProp>();
  const { data: topBrands = [], isPending: isTopBrandsPending } = useTopBrands();
  const { canOpenBrand, openTopBrand } = useTopBrandNavigation();
  const handleSeeAllPress = useCallback(() => {
    navigation.navigate('TopBrandsSeeAll');
  }, [navigation]);

  return (
    <View style={[styles.section, { gap: spacing.sm, paddingHorizontal: gutter }]}>
      <SectionActionHeader
        actionLabel={t('multi_vendor_see_all')}
        title={t('multi_vendor_top_brands_title')}
        onActionPress={handleSeeAllPress}
      />

      {isTopBrandsPending ? (
        <TopBrandsListSkeleton />
      ) : (
        <HorizontalList
          data={topBrands}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          contentContainerStyle={{
            paddingBottom: spacing.lg,
            paddingRight: gutter,
            paddingTop: spacing.xs,
          }}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          renderItem={({ item }) => (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={item.name}
              onPress={() => openTopBrand(item, onClosedStorePress)}
              disabled={!canOpenBrand(item)}
              pressedScale={0.97}
              style={{ borderRadius: shape.radius.surface }}
            >
              <TopBrandCard brand={item} />
            </PressableScale>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {},
});
