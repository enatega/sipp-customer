import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HorizontalList from '../../../../../general/components/HorizontalList';
import SectionActionHeader from '../../../../../general/components/SectionActionHeader';
import { DiscoveryResultsSkeleton, DiscoverySectionState } from '../../../components/discovery';
import StoreCard from '../../../components/storeCard/StoreCard';
import ClosedStoreMenuPopup from '../../../components/storeCard/ClosedStoreMenuPopup';
import type { DeliveryNearbyStore } from '../../../api/types';
import type { MultiVendorStackParamList } from '../../navigation/types';
import { pushStoreDetails } from '../../../navigation/storeDetailsNavigation';
import { useTheme } from '../../../../../general/theme/theme';

type NavProp = NativeStackNavigationProp<MultiVendorStackParamList>;

function isStoreClosed(store: DeliveryNearbyStore) {
  return store.isAvailable === false || ('isClosed' in store && store.isClosed === true);
}

type Props = {
  title: string;
  actionLabel: string;
  items: DeliveryNearbyStore[];
  isPending: boolean;
  isError: boolean;
  isVertical?: boolean;
  onSeeAllPress: () => void;
  emptyTitle: string;
  emptyMessage: string;
  errorTitle: string;
  errorMessage: string;
};

export default function MainSeeAllRestaurantsSection({
  title,
  actionLabel,
  items,
  isPending,
  isError,
  isVertical = false,
  onSeeAllPress,
  emptyTitle,
  emptyMessage,
  errorTitle,
  errorMessage,
}: Props) {
  const { spacing } = useTheme();
  const navigation = useNavigation<NavProp>();
  const [selectedClosedStore, setSelectedClosedStore] = useState<DeliveryNearbyStore | null>(null);
  const isEmpty = !isPending && !isError && items.length === 0;
  const shouldShowSeeAll = !isPending && !isError && items.length > 0;

  const handleClosedStorePress = useCallback((store: DeliveryNearbyStore) => {
    setSelectedClosedStore(store);
  }, []);

  const handleCloseClosedStorePopup = useCallback(() => {
    setSelectedClosedStore(null);
  }, []);

  const handleSeeMenu = useCallback((store: DeliveryNearbyStore) => {
    pushStoreDetails(navigation, store);
    setSelectedClosedStore(null);
  }, [navigation]);

  return (
    <View style={styles.section}>
      <SectionActionHeader
        title={title}
        actionLabel={shouldShowSeeAll ? actionLabel : undefined}
        onActionPress={onSeeAllPress}
      />

      {isPending ? (
        <DiscoveryResultsSkeleton />
      ) : isError ? (
        <DiscoverySectionState tone="error" title={errorTitle} message={errorMessage} />
      ) : isEmpty ? (
        <DiscoverySectionState title={emptyTitle} message={emptyMessage} />
      ) : isVertical ? (
        <View style={styles.verticalContent}>
          {items.map((item) => (
            <StoreCard
              key={item.storeId}
              store={item}
              layout="fullWidth"
              showClosedOverlay={isStoreClosed(item)}
              onClosedPress={isStoreClosed(item) ? () => handleClosedStorePress(item) : undefined}
            />
          ))}
        </View>
      ) : (
        <HorizontalList
          data={items}
          keyExtractor={(item) => item.storeId}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: spacing.lg, paddingTop: spacing.xs },
          ]}
          renderItem={({ item }) => (
            <StoreCard
              store={item}
              showClosedOverlay={isStoreClosed(item)}
              onClosedPress={isStoreClosed(item) ? () => handleClosedStorePress(item) : undefined}
            />
          )}
        />
      )}

      <ClosedStoreMenuPopup
        onClose={handleCloseClosedStorePopup}
        onSeeMenu={handleSeeMenu}
        store={selectedClosedStore}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingRight: 16,
  },
  section: {
    gap: 12,
    paddingHorizontal: 16,
  },
  separator: {
    width: 12,
  },
  verticalContent: {
    gap: 12,
  },
});
