import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../../general/theme/theme';
import StoreCard from '../storeCard/StoreCard';
import ClosedStoreMenuPopup from '../storeCard/ClosedStoreMenuPopup';
import type { StoreCardScrollerProps } from './types';
import type { SearchStoreItem } from '../../api/searchServiceTypes';
import type { DeliveryNearbyStore } from '../../api/types';
import type { DeliveriesStoreDetailsParamList } from '../../navigation/sharedTypes';
import { pushStoreDetails } from '../../navigation/storeDetailsNavigation';
import SectionActionHeader from '../../../../general/components/SectionActionHeader';

type NavigationProp = NativeStackNavigationProp<DeliveriesStoreDetailsParamList>;

function isStoreClosed(store: SearchStoreItem) {
  return store.isAvailable === false || ('isClosed' in store && store.isClosed === true);
}

export default function StoreCardScroller({
  stores,
  onSeeAllPress,
  onLoadMore,
  isLoadingMore,
  onStorePress,
}: StoreCardScrollerProps) {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation('deliveries');
  const navigation = useNavigation<NavigationProp>();
  const [selectedClosedStore, setSelectedClosedStore] = useState<SearchStoreItem | null>(null);

  const handleClosedStorePress = useCallback((store: SearchStoreItem) => {
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
    <View style={styles.container}>
      <SectionActionHeader
        actionLabel={onSeeAllPress ? t('see_all') : undefined}
        onActionPress={onSeeAllPress}
        title={t('stores')}
      />
      <FlatList
        data={stores}
        renderItem={({ item }) => {
          const isClosed = isStoreClosed(item);

          return (
            <StoreCard
              layout="resultRow"
              store={item}
              showClosedOverlay={isClosed}
              onClosedPress={isClosed ? () => handleClosedStorePress(item) : undefined}
              onPress={!isClosed && onStorePress ? () => onStorePress(item) : undefined}
            />
          );
        }}
        keyExtractor={(item) => item.storeId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: spacing.lg,
          paddingHorizontal: spacing.xs,
          paddingTop: spacing.md,
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        scrollEnabled={false}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoadingMore ? (
          <View style={[styles.loader, { paddingVertical: spacing.lg }]}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        ) : null}
      />

      <ClosedStoreMenuPopup
        onClose={handleCloseClosedStorePopup}
        onSeeMenu={handleSeeMenu}
        store={selectedClosedStore}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  loader: {
    alignItems: 'center',
  },
});
