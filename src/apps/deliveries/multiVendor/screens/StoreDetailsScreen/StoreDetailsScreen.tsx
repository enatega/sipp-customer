import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  Share,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeliveriesCurrencyLabel } from '../../../../../general/stores/useAppConfigStore';
import AppPopup from '../../../../../general/components/AppPopup';
import ListStateView from '../../../../../general/components/filterablePaginatedList/ListStateView';
import Text from '../../../../../general/components/Text';
import { showToast } from '../../../../../general/components/AppToast';
import useDebouncedValue from '../../../../../general/hooks/useDebouncedValue';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import { useTheme } from '../../../../../general/theme/theme';
import { useStoreProducts, useStoreView } from '../../../hooks';
import { useCart } from '../../../hooks/useCart';
import type {
  DeliveryNearbyStore,
  DeliveryStoreDetailsProduct,
  DeliveryStoreTimings,
} from '../../../api/types';
import StoreDetailListHeader from '../../components/StoreDetails/StoreDetailListHeader';
import StoreDetailNavigationHeader from '../../components/StoreDetails/StoreDetailNavigationHeader';
import StoreDetailsScreenSkeleton from '../../components/StoreDetails/StoreDetailsScreenSkeleton';
import StoreDetailCartBar from '../../components/StoreDetails/StoreDetailCartBar';
import StoreDetailMenuNavigation from '../../components/StoreDetails/StoreDetailMenuNavigation';
import StoreDetailSectionNavigation from '../../components/StoreDetails/StoreDetailSectionNavigation';
import StoreDetailStickyCategories from '../../components/StoreDetails/StoreDetailStickyCategories';
import StoreDetailMenuCardSkeleton from '../../components/StoreDetails/StoreDetailMenuCardSkeleton';
import ProductCard from '../../../components/productCard/ProductCard';
import { useToggleFavouriteMutation } from '../../hooks/useToggleFavouriteMutation';
import type { MultiVendorStackParamList } from '../../navigation/types';
import type { DeliveryProductActionTarget } from '../../../cart/productActionTypes';
// import { data } from './storedetaiolsData';

type StoreDetailsParamList = {
  StoreDetails: {
    store?: DeliveryNearbyStore;
  };
};

const SEARCH_DEBOUNCE_MS = 450;
const MIN_SEARCH_QUERY_LENGTH = 2;
const STORE_DETAIL_PRODUCT_SKELETON_COUNT = 4;

type StoreDetailScreenListItem =
  | { id: 'store-detail-menu'; type: 'menu' }
  | { id: 'store-detail-section'; type: 'section' }
  | { id: string; type: 'product'; product: DeliveryStoreDetailsProduct; isLast: boolean }
  | { id: string; type: 'skeleton'; isLast: boolean }
  | { id: 'store-detail-error'; type: 'error' }
  | { id: 'store-detail-empty'; type: 'empty' };

const STORE_DETAIL_BASE_LIST_DATA: StoreDetailScreenListItem[] = [
  { id: 'store-detail-menu', type: 'menu' },
  { id: 'store-detail-section', type: 'section' },
];

function getTodayStoreHours(
  storeTimings?: DeliveryStoreTimings | null,
) {
  if (!storeTimings) {
    return null;
  }

  const dayKey = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
    .format(new Date())
    .toLowerCase();
  const daySchedule = storeTimings[dayKey];

  if (!daySchedule) {
    return null;
  }

  if (!daySchedule.is_active || daySchedule.slots.length === 0) {
    return null;
  }

  const firstSlot = daySchedule.slots[0];

  if (!firstSlot?.open || !firstSlot?.close) {
    return null;
  }

  return `${firstSlot.open} - ${firstSlot.close}`;
}

function isStoreOrderAvailable(store?: {
  isAvailable?: boolean;
  storeTimings?: DeliveryStoreTimings | null;
} | null) {
  if (!store) {
    return true;
  }

  if (store.isAvailable === false) {
    return false;
  }

  const dayKey = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
    .format(new Date())
    .toLowerCase();
  const daySchedule = store.storeTimings?.[dayKey];

  if (!daySchedule) {
    return true;
  }

  return daySchedule.is_active && daySchedule.slots.length > 0;
}

export default function StoreDetailsScreen() {
  const { colors, spacing } = useTheme();
  const { gutter } = useWindowClass();
  const { t } = useTranslation('deliveries');
  const insets = useSafeAreaInsets();
  const currencyLabel = useDeliveriesCurrencyLabel();
  const navigation = useNavigation<NativeStackNavigationProp<MultiVendorStackParamList>>();
  const route = useRoute<RouteProp<StoreDetailsParamList, 'StoreDetails'>>();
  const [searchValue, setSearchValue] = useState('');
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [listHeaderHeight, setListHeaderHeight] = useState<number | null>(null);
  const [categoryRowOffset, setCategoryRowOffset] = useState<number | null>(null);
  const selectedStore = route.params?.store;
  const storeId = selectedStore?.storeId ?? '';
  const [optimisticFav, setOptimisticFav] = useState<boolean | null>(null);
  const scrollY = useSharedValue(0);
  const navigationHeaderHeight = insets.top + 60;

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleListHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    setListHeaderHeight(event.nativeEvent.layout.height);
  }, []);

  const handleCategoriesLayout = useCallback((event: LayoutChangeEvent) => {
    setCategoryRowOffset(event.nativeEvent.layout.y);
  }, []);

  const { mutate: toggleFavourite, isPending: isTogglingFavourite } = useToggleFavouriteMutation({
    storeId,
    onSuccess: (data) => {
      // Clear optimistic state — storeView refetch will provide truth
      setOptimisticFav(null);
      showToast.success(
        data.isFavorite
          ? t('favourites_toggle_added')
          : t('favourites_toggle_removed'),
      );
    },
    onError: () => {
      setOptimisticFav(null);
      showToast.error(t('favourites_toggle_error'));
    },
  });

  const normalizedSearchValue = useMemo(
    () => searchValue.replace(/\s+/g, ' ').trim(),
    [searchValue],
  );
  const debouncedSearchValue = useDebouncedValue(normalizedSearchValue, SEARCH_DEBOUNCE_MS);
  const effectiveSearchValue =
    normalizedSearchValue.length >= MIN_SEARCH_QUERY_LENGTH ? debouncedSearchValue : '';

  const {
    data: storeData,
    error: storeError,
    isPending: isStorePending,
    isRefetching: isStoreRefetching,
    refetch: refetchStore,
  } = useStoreView(storeId, { enabled: Boolean(storeId) });

  const handleFavouritePress = useCallback(() => {
    setOptimisticFav((prev) => {
      const current = prev ?? storeData?.isFavorited ?? selectedStore?.isFavorite ?? false;
      return !current;
    });
    toggleFavourite({ storeId });
  }, [storeId, storeData, selectedStore, toggleFavourite]);

  const {
    data: productsData,
    error: productsError,
    fetchNextPage,
    hasNextPage,
    isFetched: hasFetchedProducts,
    isFetchingNextPage,
    isRefetching: isProductsRefetching,
    refetch: refetchProducts,
  } = useStoreProducts(
    storeId,
    {
      search: effectiveSearchValue || undefined,
      selectedCategoryId: selectedCategoryId ?? undefined,
      selectedSubcategoryId: selectedSubcategoryId ?? undefined,
    },
    {
      enabled: Boolean(storeId),
    },
  );
  const { data: cart } = useCart();

  useEffect(() => {
    setIsInfoModalVisible(false);
    setSearchValue('');
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setListHeaderHeight(null);
    setCategoryRowOffset(null);
  }, [storeId]);

  const store = storeData;
  const categories = store?.categories ?? [];
  const subcategories = store?.subcategories ?? [];
  const products = useMemo(
    () => productsData?.pages.flatMap((page) => page.items) ?? [],
    [productsData],
  );
  const activeCategoryId = selectedCategoryId;
  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? null,
    [activeCategoryId, categories],
  );
  const visibleSubcategories = useMemo(() => {
    if (activeCategory == null) {
      return [];
    }

    const activeCategorySubcategoryIds = Array.isArray(activeCategory.subcategoryIds)
      ? activeCategory.subcategoryIds
      : null;

    return activeCategorySubcategoryIds
      ? subcategories.filter((subcategory) =>
        activeCategorySubcategoryIds.includes(subcategory.id),
      )
      : subcategories;
  }, [activeCategory, subcategories]);
  const activeSubcategoryId = selectedSubcategoryId;

  useEffect(() => {
    if (visibleSubcategories.length === 0) {
      if (selectedSubcategoryId !== null) {
        setSelectedSubcategoryId(null);
      }

      return;
    }

    const hasSelectedVisibleSubcategory = visibleSubcategories.some(
      (subcategory) => subcategory.id === selectedSubcategoryId,
    );

    if (!hasSelectedVisibleSubcategory) {
      setSelectedSubcategoryId(visibleSubcategories[0].id);
    }
  }, [selectedSubcategoryId, visibleSubcategories]);

  const handleCategorySelect = useCallback((categoryId: string | null) => {
    setSelectedCategoryId(categoryId);

    if (!categoryId) {
      setSelectedSubcategoryId(null);
      return;
    }

    const nextCategory = categories.find((category) => category.id === categoryId) ?? null;
    const nextCategorySubcategoryIds = Array.isArray(nextCategory?.subcategoryIds)
      ? nextCategory.subcategoryIds
      : null;
    const nextVisibleSubcategories = nextCategorySubcategoryIds
      ? subcategories.filter((subcategory) =>
        nextCategorySubcategoryIds.includes(subcategory.id),
      )
      : subcategories;

    setSelectedSubcategoryId(nextVisibleSubcategories[0]?.id ?? null);
  }, [categories, subcategories]);

  const handleSubcategorySelect = useCallback((subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
  }, []);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MultiVendorTabs');
  }, [navigation]);

  const handleOpenInfoModal = useCallback(() => {
    setIsInfoModalVisible(true);
  }, []);

  const handleSharePress = useCallback(async () => {
    try {
      const resolvedStoreName =
        store?.name ?? selectedStore?.name ?? t('store_details_store_name');
      await Share.share({
        message: resolvedStoreName,
        title: resolvedStoreName,
      });
    } catch {
      // Ignore canceled/failed share action.
    }
  }, [selectedStore?.name, store?.name, t]);

  const handleCloseInfoModal = useCallback(() => {
    setIsInfoModalVisible(false);
  }, []);

  const handleStoreProductOpen = useCallback((target: DeliveryProductActionTarget) => {
    if (!isStoreOrderAvailable(store ?? selectedStore)) {
      showToast.info(
        t('store_details_closed_store_title', {
          storeName: store?.name?.trim() || t('store_details_closed_store_fallback_name'),
        }),
        t('store_details_closed_store_description', {
          storeName: store?.name?.trim() || t('store_details_closed_store_fallback_name'),
        }),
      );
      return;
    }

    navigation.navigate('ProductInfo', { productId: target.productId });
  }, [navigation, selectedStore, store, t]);

  const handleLoadMoreProducts = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchStore(),
      refetchProducts(),
    ]);
  }, [refetchProducts, refetchStore]);

  const storeName = store?.name ?? selectedStore?.name ?? t('store_details_store_name');
  const rawRating = store?.averageRating ?? selectedStore?.averageRating ?? null;
  const rating =
    typeof rawRating === 'number' && Number.isFinite(rawRating) && rawRating > 0
      ? rawRating
      : null;
  const rawReviewCount = store?.reviewCount ?? selectedStore?.reviewCount ?? null;
  const reviewCount =
    typeof rawReviewCount === 'number' && Number.isFinite(rawReviewCount) && rawReviewCount > 0
      ? rawReviewCount
      : null;
  const deliveryFee =
    typeof store?.baseFee === 'number' && store.baseFee > 0
      ? `${currencyLabel} ${store.baseFee}`
      : typeof selectedStore?.baseFee === 'number' && selectedStore.baseFee > 0
        ? `${currencyLabel} ${selectedStore.baseFee}`
        : null;
  const rawDistanceKm = store?.distanceKm ?? selectedStore?.distanceKm ?? null;
  const distance =
    typeof rawDistanceKm === 'number' && Number.isFinite(rawDistanceKm) && rawDistanceKm > 0
      ? `${rawDistanceKm.toFixed(1)} km`
      : null;
  const rawMinimumOrder = store?.minimumOrder ?? selectedStore?.minimumOrder ?? null;
  const minimumOrder =
    typeof rawMinimumOrder === 'number' && Number.isFinite(rawMinimumOrder) && rawMinimumOrder > 0
      ? t('store_details_minimum_order', {
          amount: `${currencyLabel} ${rawMinimumOrder.toFixed(2)}`,
        })
      : null;
  const rawDeliveryTime = store?.deliveryTime ?? selectedStore?.deliveryTime ?? null;
  const deliveryTime =
    typeof rawDeliveryTime === 'number' && Number.isFinite(rawDeliveryTime) && rawDeliveryTime > 0
      ? t('store_details_delivery_minutes', { minutes: rawDeliveryTime })
      : typeof rawDeliveryTime === 'string' && rawDeliveryTime.trim()
        ? rawDeliveryTime.trim()
        : null;
  const coverImageUrl =
    store?.coverImage ?? selectedStore?.coverImage ?? 'https://placehold.co/1400x800.png';
  const logoImageUrl = store?.logo ?? selectedStore?.logo ?? 'https://placehold.co/176x176.png';
  const isStoreAvailable = isStoreOrderAvailable(store ?? selectedStore);
  const hours = getTodayStoreHours(store?.storeTimings) ?? (
    t('store_details_hours_unavailable')
  );
  const isFavourite = optimisticFav ?? storeData?.isFavorited ?? selectedStore?.isFavorite ?? false;
  const storeType = store?.shopTypeName ?? selectedStore?.shopTypeName ?? null;
  const phone = store?.contact?.phone ?? null;
  const email = store?.contact?.email ?? null;
  const address = store?.address ?? selectedStore?.address ?? null;
  const tagLine = store?.tagLine ?? null;
  const sectionTitle = activeCategory?.name ?? t('store_details_all_offered_items');
  const infoDescription = [
    store?.description?.trim() || null,
    address?.trim() ? t('store_details_info_address', { address: address.trim() }) : null,
    phone?.trim() ? t('store_details_info_phone', { phone: phone.trim() }) : null,
    email?.trim() ? t('store_details_info_email', { email: email.trim() }) : null,
  ].filter((line): line is string => Boolean(line)).join('\n\n') || t('store_details_about_fallback');
  const shouldShowCartBar = Boolean(cart && !cart.isEmpty && cart.totalItems > 0);
  const shouldShowProductSkeletons = !hasFetchedProducts && !productsData && !productsError;
  const shouldShowProductError =
    hasFetchedProducts && Boolean(productsError) && products.length === 0;
  const shouldShowProductEmpty =
    hasFetchedProducts && !productsError && products.length === 0;
  const screenListData = useMemo<StoreDetailScreenListItem[]>(() => {
    if (shouldShowProductSkeletons) {
      return [
        ...STORE_DETAIL_BASE_LIST_DATA,
        ...Array.from({ length: STORE_DETAIL_PRODUCT_SKELETON_COUNT }, (_, index) => ({
          id: `store-detail-product-skeleton-${index}`,
          isLast: index === STORE_DETAIL_PRODUCT_SKELETON_COUNT - 1,
          type: 'skeleton' as const,
        })),
      ];
    }

    if (shouldShowProductError) {
      return [...STORE_DETAIL_BASE_LIST_DATA, { id: 'store-detail-error', type: 'error' }];
    }

    if (shouldShowProductEmpty) {
      return [...STORE_DETAIL_BASE_LIST_DATA, { id: 'store-detail-empty', type: 'empty' }];
    }

    return [
      ...STORE_DETAIL_BASE_LIST_DATA,
      ...products.map((product, index) => ({
        id: `store-detail-product-${product.id}`,
        isLast: index === products.length - 1,
        product,
        type: 'product' as const,
      })),
    ];
  }, [products, shouldShowProductEmpty, shouldShowProductError, shouldShowProductSkeletons]);
  const storeMenuProductAction = useMemo(
    () => ({ onOpenProduct: handleStoreProductOpen }),
    [handleStoreProductOpen],
  );
  const stickyCategoriesRevealOffset = listHeaderHeight != null && categoryRowOffset != null
    ? Math.max(0, listHeaderHeight + categoryRowOffset - navigationHeaderHeight)
    : Number.POSITIVE_INFINITY;
  const headerComponent = useMemo(
    () => (
      <StoreDetailListHeader
        coverImageUrl={coverImageUrl}
        deliveryFee={deliveryFee}
        deliveryTime={deliveryTime}
        distance={distance}
        hours={hours}
        isStoreAvailable={isStoreAvailable}
        logoImageUrl={logoImageUrl}
        minimumOrder={minimumOrder}
        onInfoPress={handleOpenInfoModal}
        onLayout={handleListHeaderLayout}
        rating={rating}
        reviewCount={reviewCount}
        scrollY={scrollY}
        storeName={storeName}
        tagLine={tagLine}
        storeType={storeType}
      />
    ),
    [
      coverImageUrl,
      deliveryFee,
      deliveryTime,
      distance,
      hours,
      logoImageUrl,
      minimumOrder,
      handleOpenInfoModal,
      handleListHeaderLayout,
      isStoreAvailable,
      rating,
      reviewCount,
      scrollY,
      storeName,
      tagLine,
      storeType,
    ],
  );

  if (!storeId) {
    return (
      <View style={[styles.centeredState, { backgroundColor: colors.canvas }]}>
        <Text style={{ color: colors.mutedText }}>{t('store_details_store_missing')}</Text>
      </View>
    );
  }

  if (isStorePending && !storeData) {
    return <StoreDetailsScreenSkeleton />;
  }

  if (storeError && !storeData) {
    return (
      <View style={[styles.centeredState, { backgroundColor: colors.canvas }]}>
        <Text style={{ color: colors.mutedText }}>{t('store_details_load_error')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <LinearGradient
        colors={[colors.primarySoft, colors.canvas, colors.surface]}
        end={{ x: 0.82, y: 1 }}
        locations={[0, 0.54, 1]}
        pointerEvents="none"
        start={{ x: 0.18, y: 0 }}
        style={[StyleSheet.absoluteFill, styles.atmosphere]}
      />
      <Animated.FlatList
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.primary} size="small" />
            </View>
          ) : null
        }
        ListHeaderComponent={headerComponent}
        contentContainerStyle={[
          styles.content,
          {
            backgroundColor: 'transparent',
            paddingBottom: shouldShowCartBar ? insets.bottom + 112 : 24,
          },
        ]}
        contentInsetAdjustmentBehavior="never"
        data={screenListData}
        initialNumToRender={Platform.OS === 'android' ? 5 : 7}
        keyExtractor={(item) => item.id}
        maxToRenderPerBatch={Platform.OS === 'android' ? 5 : 7}
        onEndReached={handleLoadMoreProducts}
        onEndReachedThreshold={0.4}
        onScroll={handleScroll}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={(
          <RefreshControl
            refreshing={(isStoreRefetching || isProductsRefetching) && !isStorePending}
            onRefresh={() => {
              void handleRefresh();
            }}
            tintColor={colors.primary}
          />
        )}
        renderItem={({ item }) => {
          if (item.type === 'menu') {
            return (
              <StoreDetailMenuNavigation
                activeCategoryId={activeCategoryId}
                categories={categories}
                onCategorySelect={handleCategorySelect}
                onCategoriesLayout={handleCategoriesLayout}
                onSearchChange={setSearchValue}
                searchValue={searchValue}
              />
            );
          }

          if (item.type === 'section') {
            return (
              <StoreDetailSectionNavigation
                activeSubcategoryId={activeSubcategoryId}
                onSubcategorySelect={handleSubcategorySelect}
                sectionTitle={sectionTitle}
                subcategories={visibleSubcategories}
              />
            );
          }

          if (item.type === 'error') {
            return (
              <View style={[styles.stateCell, { paddingHorizontal: gutter }]}>
                <ListStateView
                  actionLabel={t('generic_list_retry')}
                  description={productsError?.message ?? t('store_details_load_error')}
                  onActionPress={() => {
                    void refetchProducts();
                  }}
                  title={t('generic_list_error_title')}
                  variant="error"
                />
              </View>
            );
          }

          if (item.type === 'empty') {
            return (
              <View style={[styles.stateCell, { paddingHorizontal: gutter }]}>
                <ListStateView
                  description={t('store_details_no_items')}
                  variant="empty"
                />
              </View>
            );
          }

          if (item.type === 'skeleton') {
            return (
              <View
                style={{
                  paddingBottom: item.isLast ? spacing.xxl : spacing.md,
                  paddingHorizontal: gutter,
                  paddingTop: spacing.xs,
                }}
              >
                <StoreDetailMenuCardSkeleton />
              </View>
            );
          }

          return (
            <View
              style={{
                paddingBottom: item.isLast ? spacing.xxl : spacing.md,
                paddingHorizontal: gutter,
                paddingTop: spacing.xs,
              }}
            >
              <ProductCard
                product={item.product}
                productAction={storeMenuProductAction}
                storeId={storeId}
                variant="storeMenu"
              />
            </View>
          );
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        updateCellsBatchingPeriod={Platform.OS === 'android' ? 32 : 50}
        windowSize={Platform.OS === 'android' ? 7 : 9}
      />
      <StoreDetailStickyCategories
        activeCategoryId={activeCategoryId}
        categories={categories}
        onSelect={handleCategorySelect}
        revealOffset={stickyCategoriesRevealOffset}
        scrollY={scrollY}
        top={navigationHeaderHeight}
      />
      <StoreDetailNavigationHeader
        backAccessibilityLabel={t('store_details_action_back')}
        favouriteAccessibilityLabel={t(
          isFavourite
            ? 'store_details_action_remove_favorite'
            : 'store_details_action_favorite',
        )}
        isFavourite={isFavourite}
        isFavouriteLoading={isTogglingFavourite}
        logoImageUrl={logoImageUrl}
        onBackPress={handleBackPress}
        onFavouritePress={handleFavouritePress}
        onSharePress={handleSharePress}
        scrollY={scrollY}
        shareAccessibilityLabel={t('store_details_action_share')}
        storeName={storeName}
      />
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <StoreDetailCartBar
          bottomInset={insets.bottom}
          cart={cart}
          horizontalInset={16}
        />
      </View>

      <AppPopup
        description={infoDescription}
        dismissOnOverlayPress
        onRequestClose={handleCloseInfoModal}
        primaryAction={{
          label: t('store_details_close'),
          onPress: handleCloseInfoModal,
        }}
        title={t('store_details_about_title')}
        visible={isInfoModalVisible}

      />
    </View>
  );
}

const styles = StyleSheet.create({
  atmosphere: {
    opacity: 0.42,
  },
  content: {
    flexGrow: 1,
  },
  centeredState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  footerLoader: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  list: {
    backgroundColor: 'transparent',
  },
  screen: {
    flex: 1,
  },
  stateCell: {
    minHeight: 180,
    paddingBottom: 24,
    paddingTop: 4,
  },
});
