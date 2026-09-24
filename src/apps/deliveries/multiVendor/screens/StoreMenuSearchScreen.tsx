import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useIsFocused, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '../../../../general/components/ScreenHeader';
import SearchInput from '../../../../general/components/search/SearchInput';
import ListStateView from '../../../../general/components/filterablePaginatedList/ListStateView';
import { showToast } from '../../../../general/components/AppToast';
import { useTheme } from '../../../../general/theme/theme';
import { useWindowClass } from '../../../../general/hooks/useWindowClass';
import { deliveryKeys } from '../../api/queryKeys';
import type { StoreMenuBootstrap } from '../../api/storeMenuService';
import { discoveryService } from '../../api/discoveryService';
import type { DeliveryStoreDetailsProduct } from '../../api/types';
import type { DeliveryProductActionTarget } from '../../cart/productActionTypes';
import ProductCard from '../../components/productCard/ProductCard';
import { useStoreMenuSearch } from '../hooks/useStoreMenuSearch';
import { isStoreOrderAvailable } from '../utils/storeMenuPresentation';
import type { MultiVendorStackParamList } from '../navigation/types';

export default function StoreMenuSearchScreen() {
  const { params } = useRoute<RouteProp<MultiVendorStackParamList, 'StoreMenuSearch'>>();
  const navigation = useNavigation<NativeStackNavigationProp<MultiVendorStackParamList>>();
  const isFocused = useIsFocused();
  const { colors, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('deliveries');
  const [value, setValue] = useState('');
  const search = useStoreMenuSearch(params.storeId, value, isFocused);
  const list = useRef<FlashListRef<DeliveryStoreDetailsProduct>>(null);
  const queryClient = useQueryClient();
  const metadata = useQuery({
    queryKey: deliveryKeys.storeView(params.storeId),
    queryFn: ({ signal }) => discoveryService.getStoreView(params.storeId, signal),
    initialData: () => queryClient.getQueryData<StoreMenuBootstrap>(deliveryKeys.storeMenu(params.storeId))?.store,
    enabled: isFocused,
    staleTime: 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const onProduct = useCallback((target: DeliveryProductActionTarget) => {
    if (!isStoreOrderAvailable(metadata.data)) {
      showToast.info(t('store_details_closed_store_title', { storeName: params.storeName }),
        t('store_details_closed_store_description', { storeName: params.storeName }));
      return;
    }
    navigation.navigate('ProductInfo', { productId: target.productId });
  }, [metadata.data, navigation, params.storeName, t]);
  const productAction = useMemo(() => ({ onOpenProduct: onProduct }), [onProduct]);
  const isPrompt = search.normalized.length < 2;
  const isLoading = !isPrompt && (search.isDebouncing || search.query.isPending);
  const items = isPrompt || search.isDebouncing ? [] : search.items;
  const retry = useCallback(() => {
    if (search.query.isFetchNextPageError) void search.query.fetchNextPage();
    else if (search.query.isFetchPreviousPageError) void search.query.fetchPreviousPage();
    else void search.query.refetch();
  }, [search.query.fetchNextPage, search.query.fetchPreviousPage, search.query.refetch,
    search.query.isFetchNextPageError, search.query.isFetchPreviousPageError]);
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.canvas }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={params.storeName} />
      <View style={{ paddingHorizontal: gutter, paddingVertical: spacing.sm }}>
        <SearchInput value={value} onChangeText={setValue} autoFocus density="compact"
          placeholder={t('store_details_search_placeholder')} surfaceElevation="subtle" />
      </View>
      <FlashList key={`${search.term}:${search.resetVersion}`} ref={list} data={items}
        keyExtractor={(product) => product.id} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
        onEndReached={() => {
          if (isFocused && !search.isDebouncing && !search.query.isFetching && !search.query.isError && search.query.hasNextPage) void search.query.fetchNextPage();
        }} onEndReachedThreshold={0.4}
        onStartReached={() => {
          if (isFocused && !search.query.isFetching && !search.query.isError && search.query.hasPreviousPage) void search.query.fetchPreviousPage();
        }} onStartReachedThreshold={0.4}
        ListEmptyComponent={<ListStateView variant={isLoading ? 'loading' : search.query.isError && !isPrompt ? 'error' : 'empty'}
          description={t(isPrompt ? 'store_menu_search_hint' : search.query.isError ? 'store_menu_search_error' : isLoading ? 'store_menu_search_loading' : 'store_menu_search_empty')}
          actionLabel={search.query.isError && !isPrompt ? t('generic_list_retry') : undefined}
          onActionPress={search.query.isError ? retry : undefined} />}
        ListFooterComponent={search.query.isFetchingNextPage ? <ActivityIndicator color={colors.primary} />
          : items.length > 0 && search.query.isError ? <ListStateView variant="error" description={t('store_menu_search_error')}
            actionLabel={t('generic_list_retry')} onActionPress={retry} /> : null}
        renderItem={({ item }) => <View style={{ paddingHorizontal: gutter, paddingVertical: spacing.sm }}>
          <ProductCard product={item} productAction={productAction} storeId={params.storeId} variant="storeMenu" />
        </View>} />
    </KeyboardAvoidingView>
  );
}
