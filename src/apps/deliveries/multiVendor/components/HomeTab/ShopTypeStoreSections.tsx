import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SectionActionHeader from '../../../../../general/components/SectionActionHeader';
import Text from '../../../../../general/components/Text';
import HorizontalList from '../../../../../general/components/HorizontalList';
import { useTheme } from '../../../../../general/theme/theme';
import { useShopTypeStoresSections, useShopTypes } from '../../../hooks';
import StoreCard from '../../../components/storeCard/StoreCard';
import { DeliveriesStackParamList } from '../../../navigation/types';
import { MultiVendorStackParamList } from '../../navigation/types';
import DeliveriesSectionEmptyState from '../../../components/home/DeliveriesSectionEmptyState';
import {
  DiscoveryResultsSkeleton,
  DiscoverySectionState,
} from '../../../components/discovery';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import type { DeliveryNearbyStore } from '../../../api/types';
import { translateShopTypeName } from '../../../utils/shopTypeLocalization';

type NavProp = CompositeNavigationProp<
  NativeStackNavigationProp<MultiVendorStackParamList>,
  NativeStackNavigationProp<DeliveriesStackParamList>
>;

type Props = {
  onClosedStorePress?: (store: DeliveryNearbyStore) => void;
};

export default function ShopTypeStoreSections({ onClosedStorePress }: Props) {
  const { t } = useTranslation('deliveries');
  const { spacing, typography } = useTheme();
  const { gutter } = useWindowClass();
  const navigation = useNavigation<NavProp>();
  const { data: shopTypes = [] } = useShopTypes();
  const shopTypeStoreSections = useShopTypeStoresSections(shopTypes);

  const handleShopTypeSeeAll = useCallback(
    (shopTypeId: string, title: string) => {
      navigation.navigate('SeeAllScreen', {
        queryType: 'shop-type-stores',
        title,
        cardType: 'store',
        shopTypeId,
      });
    },
    [navigation],
  );

  const handleExploreAllStores = useCallback(() => {
    navigation.navigate('MainSeeAllScreen');
  }, [navigation]);

  return (
    <View style={[styles.container, { gap: spacing.lg }]}>
      {shopTypeStoreSections.map(
        ({ shopType, data = [], error, isPending: isStoresPending }) => {
          const resolvedShopTypeName = translateShopTypeName(shopType.name, t);
          const isEmpty = !isStoresPending && !error && data.length === 0;
          const shouldShowSeeAll = !isStoresPending && !error && data.length > 0;

          return (
            <View
              key={shopType.id}
              style={[
                styles.storeSection,
                { gap: spacing.md, paddingHorizontal: gutter },
              ]}
            >
              {!shouldShowSeeAll ? (
                <Text
                  weight="extraBold"
                  accessibilityRole="header"
                  style={typography.role.sectionTitle}
                >
                  {resolvedShopTypeName}
                </Text>
              ) : (
                <SectionActionHeader
                  title={resolvedShopTypeName}
                  actionLabel={t('multi_vendor_see_all')}
                  onActionPress={() => handleShopTypeSeeAll(shopType.id, resolvedShopTypeName)}
                />
              )}

              {isStoresPending ? (
                <DiscoveryResultsSkeleton home />
              ) : error ? (
                <DiscoverySectionState
                  tone="error"
                  title={t('multi_vendor_home_section_error_title')}
                  message={t('multi_vendor_home_section_error_message')}
                />
              ) : isEmpty ? (
                <DeliveriesSectionEmptyState
                  actionLabel={t('multi_vendor_home_empty_explore_action')}
                  message={t('multi_vendor_shop_type_stores_empty')}
                  onActionPress={handleExploreAllStores}
                  title={t('home_no_shop_type_stores_title')}
                  variant="discovery"
                />
              ) : (
                <HorizontalList
                  data={data}
                  keyExtractor={(item) => item.storeId}
                  contentContainerStyle={{
                    paddingBottom: spacing.xs,
                    paddingRight: gutter,
                    paddingTop: spacing.xs,
                  }}
                  ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
                  renderItem={({ item }) => (
                    <StoreCard
                      store={item}
                      layout="home"
                      showClosedOverlay={
                        item.isAvailable === false
                        || ('isClosed' in item && item.isClosed === true)
                      }
                      onClosedPress={
                        item.isAvailable === false
                        || ('isClosed' in item && item.isClosed === true)
                          ? () => onClosedStorePress?.(item)
                          : undefined
                      }
                    />
                  )}
                />
              )}
            </View>
          );
        },
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  storeSection: {},
});
