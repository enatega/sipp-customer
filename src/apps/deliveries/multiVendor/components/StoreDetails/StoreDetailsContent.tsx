import React, { useCallback, useMemo, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../../general/theme/theme';
import AppPopup from '../../../../../general/components/AppPopup';
import ScreenHeader from '../../../../../general/components/ScreenHeader';
import ListStateView from '../../../../../general/components/filterablePaginatedList/ListStateView';
import { showToast } from '../../../../../general/components/AppToast';
import type { DeliveryNearbyStore } from '../../../api/types';
import type { DeliveryProductActionTarget } from '../../../cart/productActionTypes';
import { useCart } from '../../../hooks/useCart';
import { requireDeliveriesAuthentication } from '../../../navigation/deliveriesAuthGate';
import type { MultiVendorStackParamList } from '../../navigation/types';
import { useStoreMenuWindow } from '../../hooks/useStoreMenuWindow';
import { useStoreMenuPresentation } from '../../hooks/useStoreMenuPresentation';
import { useToggleFavouriteMutation } from '../../hooks/useToggleFavouriteMutation';
import { isStoreOrderAvailable } from '../../utils/storeMenuPresentation';
import StoreDetailListHeader from './StoreDetailListHeader';
import StoreDetailNavigationHeader from './StoreDetailNavigationHeader';
import StoreDetailCartBar from './StoreDetailCartBar';
import StoreDetailsScreenSkeleton from './StoreDetailsScreenSkeleton';
import StoreMenuViewport from './StoreMenuViewport';

type Props = { selectedStore?: DeliveryNearbyStore };

export default function StoreDetailsContent({ selectedStore }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation('deliveries');
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<MultiVendorStackParamList>>();
  const isFocused = useIsFocused();
  const storeId = selectedStore?.storeId ?? '';
  const menu = useStoreMenuWindow(storeId, isFocused);
  const store = menu.bootstrap.data?.store;
  const { data: cart } = useCart();
  const scrollY = useSharedValue(0);
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [optimisticFav, setOptimisticFav] = useState<boolean | null>(null);
  const display = useStoreMenuPresentation(store, selectedStore, optimisticFav);
  const favourite = useToggleFavouriteMutation({
    storeId,
    onSuccess: (data) => {
      setOptimisticFav(data.isFavorite);
      showToast.success(t(data.isFavorite ? 'favourites_toggle_added' : 'favourites_toggle_removed'));
    },
    onError: () => { setOptimisticFav(null); showToast.error(t('favourites_toggle_error')); },
  });
  const onFavourite = useCallback(async () => {
    if (!await requireDeliveriesAuthentication({ screen: 'StoreDetails', params: { store: selectedStore } })) return;
    setOptimisticFav(!display.isFavourite);
    favourite.mutate({ storeId });
  }, [display.isFavourite, favourite.mutate, selectedStore, storeId]);
  const onBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MultiVendorTabs');
  }, [navigation]);
  const onProduct = useCallback((target: DeliveryProductActionTarget) => {
    if (!isStoreOrderAvailable(store ?? selectedStore)) {
      showToast.info(t('store_details_closed_store_title', { storeName: display.storeName }),
        t('store_details_closed_store_description', { storeName: display.storeName }));
      return;
    }
    navigation.navigate('ProductInfo', { productId: target.productId });
  }, [display.storeName, navigation, selectedStore, store, t]);
  const productAction = useMemo(() => ({ onOpenProduct: onProduct }), [onProduct]);
  const onSearch = useCallback(() => navigation.navigate('StoreMenuSearch', {
    storeId, storeName: display.storeName,
  }), [navigation, storeId, display.storeName]);
  const onShare = useCallback(async () => {
    try { await Share.share({ message: display.storeName, title: display.storeName }); } catch { /* Dismissed. */ }
  }, [display.storeName]);
  const hero = useMemo(() => <StoreDetailListHeader
    coverImageUrl={display.coverImageUrl} logoImageUrl={display.logoImageUrl} storeName={display.storeName}
    deliveryFee={display.deliveryFee} deliveryTime={display.deliveryTime} distance={display.distance}
    minimumOrder={display.minimumOrder} hours={display.hours} rating={display.rating}
    reviewCount={display.reviewCount} isStoreAvailable={display.isStoreAvailable}
    tagLine={display.tagLine} storeType={display.storeType} scrollY={scrollY} onInfoPress={() => setInfoVisible(true)} />,
  [display.coverImageUrl, display.logoImageUrl, display.storeName, display.deliveryFee, display.deliveryTime,
    display.distance, display.minimumOrder, display.hours, display.rating, display.reviewCount,
    display.isStoreAvailable, display.tagLine, display.storeType, scrollY]);

  if (storeId && menu.bootstrap.isPending) return <StoreDetailsScreenSkeleton />;
  if (!store || !storeId) return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScreenHeader showBack onBack={onBack} />
      <ListStateView variant="error" description={t(storeId ? 'store_details_load_error' : 'store_details_store_missing')}
        actionLabel={storeId ? t('generic_list_retry') : undefined}
        onActionPress={storeId ? () => { void menu.bootstrap.refetch(); } : undefined} />
    </View>
  );
  const hasCart = Boolean(cart && !cart.isEmpty && cart.totalItems > 0);
  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <StoreMenuViewport key={`${storeId}:${menu.target?.generation ?? 0}`} storeId={storeId} menu={menu}
        hero={hero} scrollY={scrollY} navigationHeight={insets.top + 60}
        bottomPadding={hasCart ? insets.bottom + 112 : insets.bottom + 24}
        productAction={productAction} onSearch={onSearch} />
      <StoreDetailNavigationHeader isFavourite={display.isFavourite} isFavouriteLoading={favourite.isPending}
        logoImageUrl={display.logoImageUrl} storeName={display.storeName} scrollY={scrollY}
        onBackPress={onBack} onFavouritePress={onFavourite} onSharePress={onShare}
        backAccessibilityLabel={t('store_details_action_back')}
        favouriteAccessibilityLabel={t(display.isFavourite ? 'store_details_action_remove_favorite' : 'store_details_action_favorite')}
        shareAccessibilityLabel={t('store_details_action_share')} />
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <StoreDetailCartBar bottomInset={insets.bottom} cart={cart} horizontalInset={16} />
      </View>
      <AppPopup visible={isInfoVisible} title={t('store_details_about_title')} description={display.infoDescription}
        dismissOnOverlayPress onRequestClose={() => setInfoVisible(false)}
        primaryAction={{ label: t('store_details_close'), onPress: () => setInfoVisible(false) }} />
    </View>
  );
}
