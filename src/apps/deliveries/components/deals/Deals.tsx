import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../general/theme/theme';
import HorizontalList from '../../../../general/components/HorizontalList';
import SectionActionHeader from '../../../../general/components/SectionActionHeader';
import Text from '../../../../general/components/Text';
import type { SearchStoreItem } from '../../api/searchServiceTypes';
import type {
  DeliveryNearbyStore,
  DeliveryShopTypeProduct,
} from '../../api/types';
import type { DeliveriesStoreDetailsParamList } from '../../navigation/sharedTypes';
import DeliveriesSectionEmptyState from '../home/DeliveriesSectionEmptyState';
import {
  DiscoveryResultsSkeleton,
  DiscoverySectionState,
} from '../discovery';
import StoreCard from '../storeCard/StoreCard';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { pushStoreDetails } from '../../navigation/storeDetailsNavigation';
import ClosedStoreMenuPopup from '../storeCard/ClosedStoreMenuPopup';

type DealsItem = DeliveryNearbyStore | SearchStoreItem | DeliveryShopTypeProduct;
type NavigationProp = NativeStackNavigationProp<DeliveriesStoreDetailsParamList>;

type Props = {
  title: string;
  items: DealsItem[];
  isPending: boolean;
  isError: boolean;
  actionLabel?: string;
  onActionPress?: () => void;
  onClosedStorePress?: (store: DeliveryNearbyStore) => void;
  onItemPress?: (item: DealsItem) => void;
};

function isProductItem(item: DealsItem): item is DeliveryShopTypeProduct {
  return 'productId' in item && 'productName' in item;
}

function getItemKey(item: DealsItem, index: number) {
  if (isProductItem(item)) {
    return `${item.productId}-${item.storeId}`;
  }

  return `${item.storeId}-${item.deal ?? item.dealAmount ?? index}`;
}

export default function Deals({
  title,
  items,
  isPending,
  isError,
  actionLabel,
  onActionPress,
  onClosedStorePress,
  onItemPress,
}: Props) {
  const { spacing, typography } = useTheme();
  const { gutter } = useWindowClass();
  const { t } = useTranslation('deliveries');
  const navigation = useNavigation<NavigationProp>();
  const [selectedClosedStore, setSelectedClosedStore] = useState<DeliveryNearbyStore | null>(null);
  const isEmpty = !isPending && !isError && items.length === 0;
  const shouldShowAction = Boolean(actionLabel) && !isPending && !isError && items.length > 0;
  const handleClosedStorePress = useCallback((store: DeliveryNearbyStore) => {
    if (onClosedStorePress) {
      onClosedStorePress(store);
      return;
    }

    setSelectedClosedStore(store);
  }, [onClosedStorePress]);

  const handleCloseClosedStorePopup = useCallback(() => {
    setSelectedClosedStore(null);
  }, []);

  const handleSeeMenu = useCallback(() => {
    if (!selectedClosedStore) {
      return;
    }

    pushStoreDetails(navigation, selectedClosedStore);
    setSelectedClosedStore(null);
  }, [navigation, selectedClosedStore]);
  const renderItem = useCallback(
    ({ item }: { item: DealsItem }) => {
      const isClosedStore =
        !isProductItem(item)
        && (
          item.isAvailable === false
          || ('isClosed' in item && item.isClosed === true)
        );

      return (
        <StoreCard
          store={item}
          showClosedOverlay={isClosedStore}
          onClosedPress={isClosedStore ? () => handleClosedStorePress(item) : undefined}
          onPress={onItemPress ? () => onItemPress(item) : undefined}
        />
      );
    },
    [handleClosedStorePress, onItemPress],
  );

  return (
    <View style={[styles.section, { gap: spacing.md, paddingHorizontal: gutter }]}>
      {shouldShowAction ? (
        <SectionActionHeader
          actionLabel={actionLabel!}
          onActionPress={onActionPress}
          title={title}
        />
      ) : (
        <Text
          weight="extraBold"
          accessibilityRole="header"
          style={typography.role.sectionTitle}
        >
          {title}
        </Text>
      )}

      {isPending ? (
        <DiscoveryResultsSkeleton />
      ) : isError ? (
        <DiscoverySectionState
          tone="error"
          title={t('multi_vendor_home_section_error_title')}
          message={t('multi_vendor_home_section_error_message')}
        />
      ) : isEmpty ? (
        <DeliveriesSectionEmptyState
          title={t('multi_vendor_home_section_empty_title')}
          message={t('multi_vendor_home_section_empty_message')}
          variant="offers"
        />
      ) : (
        <HorizontalList
          data={items}
          keyExtractor={getItemKey}
          contentContainerStyle={{
            paddingBottom: spacing.lg,
            paddingRight: gutter,
            paddingTop: spacing.xs,
          }}
          ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          renderItem={renderItem}
        />
      )}

      {onClosedStorePress ? null : (
        <ClosedStoreMenuPopup
          onClose={handleCloseClosedStorePopup}
          onSeeMenu={handleSeeMenu}
          store={selectedClosedStore}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {},
});
