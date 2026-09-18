import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  Share,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ViewProps,
  type ViewToken,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
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
import { requireDeliveriesAuthentication } from '../../../navigation/deliveriesAuthGate';
// import { data } from './storedetaiolsData';

type StoreDetailsParamList = {
  StoreDetails: {
    store?: DeliveryNearbyStore;
  };
};

const SEARCH_DEBOUNCE_MS = 450;
const MIN_SEARCH_QUERY_LENGTH = 2;
const STORE_DETAIL_PRODUCT_SKELETON_COUNT = 4;
const STORE_DETAIL_CATEGORY_HEADING_ESTIMATED_HEIGHT = 66;
const CATEGORY_ACTIVATION_EPSILON = 1;

type StoreDetailScreenListItem =
  | { id: 'store-detail-menu'; type: 'menu' }
  | { id: 'store-detail-section'; type: 'section' }
  | { id: string; type: 'category'; categoryId: string | null; title: string }
  | { id: string; type: 'subcategory'; categoryId: string; subcategoryId: string; title: string }
  | {
      id: string;
      type: 'product';
      product: DeliveryStoreDetailsProduct;
      categoryId: string | null;
      subcategoryId: string | null;
      isLast: boolean;
    }
  | { id: string; type: 'skeleton'; isLast: boolean }
  | { id: 'store-detail-error'; type: 'error' }
  | { id: 'store-detail-empty'; type: 'empty' };

type StoreDetailCellRendererProps = {
  cellKey: string;
  children: React.ReactNode;
  index: number;
  item: StoreDetailScreenListItem;
  onFocusCapture?: ViewProps['onFocusCapture'];
  onLayout?: ViewProps['onLayout'];
  style?: ViewProps['style'];
};

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
  const [stickyCategoriesHeight, setStickyCategoriesHeight] = useState<number | null>(null);
  const listRef = React.useRef<FlatList<StoreDetailScreenListItem>>(null);
  const categoryLayoutsRef = React.useRef(new Map<string, { height: number; y: number }>());
  const selectedCategoryIdRef = React.useRef<string | null>(null);
  const selectedStore = route.params?.store;
  const storeId = selectedStore?.storeId ?? '';
  const [optimisticFav, setOptimisticFav] = useState<boolean | null>(null);
  const scrollY = useSharedValue(0);
  const programmaticCategoryTargetKey = useSharedValue('');
  const navigationHeaderHeight = insets.top + 60;

  const handleListHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    setListHeaderHeight(event.nativeEvent.layout.height);
  }, []);

  const handleCategoriesLayout = useCallback((event: LayoutChangeEvent) => {
    setCategoryRowOffset(event.nativeEvent.layout.y);
  }, []);

  const handleStickyCategoriesLayout = useCallback((event: LayoutChangeEvent) => {
    setStickyCategoriesHeight(event.nativeEvent.layout.height);
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

  const handleFavouritePress = useCallback(async () => {
    if (!await requireDeliveriesAuthentication({
      screen: 'StoreDetails',
      params: { store: selectedStore },
    })) {
      return;
    }

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
      limit: 40,
      search: effectiveSearchValue || undefined,
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
    setStickyCategoriesHeight(null);
    selectedCategoryIdRef.current = null;
    categoryLayoutsRef.current.clear();
    programmaticCategoryTargetKey.value = '';
  }, [
    programmaticCategoryTargetKey,
    storeId,
  ]);

  const store = storeData;
  const categories = store?.categories ?? [];
  const subcategories = store?.subcategories ?? [];
  const products = useMemo(
    () => productsData?.pages.flatMap((page) => page.items) ?? [],
    [productsData],
  );
  // Products load a page at a time and aren't guaranteed to cover every
  // category yet, so only show pills/sections for categories that actually
  // have a loaded product — a category with none simply hasn't scrolled
  // into view yet rather than being genuinely empty (categories the store
  // returns are already guaranteed to have at least one active product).
  const visibleCategories = useMemo(
    () => categories.filter((category) =>
      products.some((product) =>
        (product.categoryId ?? product.category?.id) === category.id,
      ),
    ),
    [categories, products],
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

  const updateSelectedCategory = useCallback((categoryId: string | null) => {
    selectedCategoryIdRef.current = categoryId;
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

  const updateSelectedSubcategory = useCallback((subcategoryId: string) => {
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

    const categoryRows: StoreDetailScreenListItem[] = [];
    const appendProductRows = (
      categoryProducts: DeliveryStoreDetailsProduct[],
      categoryId: string | null,
    ) => {
      const categorySubcategories = categoryId
        ? subcategories.filter((subcategory) => {
            const category = categories.find((item) => item.id === categoryId);
            return !category?.subcategoryIds?.length
              || category.subcategoryIds.includes(subcategory.id);
          })
        : [];
      const appendedProductIds = new Set<string>();

      categorySubcategories.forEach((subcategory) => {
        const subsectionProducts = categoryProducts.filter((product) =>
          (product.subcategoryId ?? product.subcategory?.id) === subcategory.id,
        );

        if (subsectionProducts.length === 0) {
          return;
        }

        categoryRows.push({
          id: `store-detail-subcategory-${subcategory.id}`,
          type: 'subcategory',
          categoryId: categoryId ?? '',
          subcategoryId: subcategory.id,
          title: subcategory.name,
        });
        subsectionProducts.forEach((product) => {
          appendedProductIds.add(product.id);
          categoryRows.push({
            id: `store-detail-product-${product.id}`,
            type: 'product',
            product,
            categoryId,
            subcategoryId: subcategory.id,
            isLast: false,
          });
        });
      });

      categoryProducts
        .filter((product) => !appendedProductIds.has(product.id))
        .forEach((product) => {
          categoryRows.push({
            id: `store-detail-product-${product.id}`,
            type: 'product',
            product,
            categoryId,
            subcategoryId: product.subcategoryId ?? product.subcategory?.id ?? null,
            isLast: false,
          });
        });
    };

    visibleCategories.forEach((category) => {
      const categoryProducts = products.filter((product) =>
        (product.categoryId ?? product.category?.id) === category.id,
      );

      categoryRows.push({
        id: `store-detail-category-${category.id}`,
        type: 'category',
        categoryId: category.id,
        title: category.name,
      });

      appendProductRows(categoryProducts, category.id);
    });

    const categorizedProductIds = new Set(
      categoryRows
        .filter((item): item is Extract<StoreDetailScreenListItem, { type: 'product' }> => item.type === 'product')
        .map((item) => item.product.id),
    );
    const uncategorizedProducts = products.filter((product) => !categorizedProductIds.has(product.id));

    if (uncategorizedProducts.length > 0 || categories.length === 0) {
      categoryRows.push({
        id: 'store-detail-category-all',
        type: 'category',
        categoryId: null,
        title: t('store_details_all_offered_items'),
      });
      appendProductRows(uncategorizedProducts, null);
    }

    for (let index = categoryRows.length - 1; index >= 0; index -= 1) {
      const item = categoryRows[index];
      if (item.type === 'product') {
        item.isLast = true;
        break;
      }
    }

    return [...STORE_DETAIL_BASE_LIST_DATA, ...categoryRows];
  }, [
    categories,
    products,
    shouldShowProductEmpty,
    shouldShowProductError,
    shouldShowProductSkeletons,
    subcategories,
    t,
    visibleCategories,
  ]);
  const categoryActivationInset = navigationHeaderHeight + (stickyCategoriesHeight ?? 52);
  const handleCategoryCellLayout = useCallback((
    item: StoreDetailScreenListItem,
    event: LayoutChangeEvent,
  ) => {
    if (item.type !== 'category') {
      return;
    }

    const { height, y } = event.nativeEvent.layout;
    categoryLayoutsRef.current.set(item.id, { height, y });
  }, []);
  const renderCell = useCallback(({
    children,
    item,
    onFocusCapture,
    onLayout,
    style,
  }: StoreDetailCellRendererProps) => (
    <View
      onFocusCapture={onFocusCapture}
      onLayout={(event) => {
        onLayout?.(event);
        handleCategoryCellLayout(item, event);
      }}
      style={style}
    >
      {children}
    </View>
  ), [handleCategoryCellLayout]);
  const setActiveCategoryFromScroll = useCallback((categoryId: string | null) => {
    if (selectedCategoryIdRef.current !== categoryId) {
      updateSelectedCategory(categoryId);
    }
  }, [updateSelectedCategory]);
  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const scrollToMenuItem = useCallback((index: number) => {
    const item = screenListData[index];
    const categoryHeight = item?.type === 'category'
      ? categoryLayoutsRef.current.get(item.id)?.height
        ?? STORE_DETAIL_CATEGORY_HEADING_ESTIMATED_HEIGHT
      : 0;

    listRef.current?.scrollToIndex({
      animated: true,
      index,
      viewOffset: item?.type === 'category'
        ? Math.max(
            0,
            categoryActivationInset - categoryHeight - CATEGORY_ACTIVATION_EPSILON,
          )
        : categoryActivationInset,
      viewPosition: 0,
    });
  }, [categoryActivationInset, screenListData]);
  const handleCategorySelect = useCallback((categoryId: string | null) => {
    updateSelectedCategory(categoryId);
    const targetIndex = categoryId === null
      ? screenListData.findIndex((item) => item.type === 'category')
      : screenListData.findIndex(
          (item) => item.type === 'category' && item.categoryId === categoryId,
        );
    if (targetIndex >= 0) {
      const targetItem = screenListData[targetIndex];
      if (targetItem?.type === 'category') {
        programmaticCategoryTargetKey.value = targetItem.id;
      }
      scrollToMenuItem(targetIndex);
    }
  }, [
    programmaticCategoryTargetKey,
    screenListData,
    scrollToMenuItem,
    updateSelectedCategory,
  ]);
  const handleSubcategorySelect = useCallback((subcategoryId: string) => {
    updateSelectedSubcategory(subcategoryId);
    const targetIndex = screenListData.findIndex(
      (item) => item.type === 'subcategory' && item.subcategoryId === subcategoryId,
    );
    if (targetIndex >= 0) {
      scrollToMenuItem(targetIndex);
    }
  }, [screenListData, scrollToMenuItem, updateSelectedSubcategory]);
  // A 1%-visible / 0ms-debounce config re-fires this callback (and its
  // resulting setState + full-screen re-render) on nearly every scroll
  // frame as rows cross the viewport edge — a major source of the jank
  // reported on Android. A higher threshold plus a short debounce still
  // feels responsive for category highlighting while cutting that down to
  // roughly once per settled scroll position.
  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 25,
    minimumViewTime: 100,
  }).current;
  const handleViewableItemsChanged = React.useRef(({
    viewableItems,
  }: {
    viewableItems: ViewToken<StoreDetailScreenListItem>[];
  }) => {
    // Suppressed while a tapped pill is still animating the list to its
    // target, so the tap's own selection isn't overridden mid-scroll.
    if (programmaticCategoryTargetKey.value) {
      return;
    }

    const visibleMenuItem = viewableItems.find((token) =>
      token.isViewable
      && ['category', 'subcategory', 'product'].includes(token.item.type),
    )?.item;

    if (!visibleMenuItem || !('categoryId' in visibleMenuItem)) {
      return;
    }

    setActiveCategoryFromScroll(visibleMenuItem.categoryId);

    if (
      visibleMenuItem.type !== 'category'
      && 'subcategoryId' in visibleMenuItem
      && visibleMenuItem.subcategoryId
      && visibleMenuItem.categoryId === selectedCategoryIdRef.current
    ) {
      setSelectedSubcategoryId(visibleMenuItem.subcategoryId);
    }
  }).current;
  const storeMenuProductAction = useMemo(
    () => ({ onOpenProduct: handleStoreProductOpen }),
    [handleStoreProductOpen],
  );
  const productRowStyles = useMemo(() => ({
    last: { paddingBottom: spacing.xxl, paddingHorizontal: gutter, paddingTop: spacing.xs },
    regular: { paddingBottom: spacing.md, paddingHorizontal: gutter, paddingTop: spacing.xs },
  }), [gutter, spacing]);
  const renderListItem = useCallback(({ item }: { item: StoreDetailScreenListItem }) => {
    if (item.type === 'menu') {
      return (
        <StoreDetailMenuNavigation
          activeCategoryId={activeCategoryId}
          categories={visibleCategories}
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
        <View style={item.isLast ? productRowStyles.last : productRowStyles.regular}>
          <StoreDetailMenuCardSkeleton />
        </View>
      );
    }

    if (item.type === 'category') {
      return (
        <View style={[styles.categoryHeading, { paddingHorizontal: gutter }]}>
          <Text variant="sectionTitle" weight="bold">{item.title}</Text>
        </View>
      );
    }

    if (item.type === 'subcategory') {
      return (
        <View style={[styles.subcategoryHeading, { paddingHorizontal: gutter }]}>
          <Text variant="subtitle" weight="semiBold">{item.title}</Text>
        </View>
      );
    }

    return (
      <View style={item.isLast ? productRowStyles.last : productRowStyles.regular}>
        <ProductCard
          product={item.product}
          productAction={storeMenuProductAction}
          storeId={storeId}
          variant="storeMenu"
        />
      </View>
    );
  }, [
    activeCategoryId,
    activeSubcategoryId,
    gutter,
    handleCategoriesLayout,
    handleCategorySelect,
    handleSubcategorySelect,
    productRowStyles,
    productsError,
    refetchProducts,
    sectionTitle,
    searchValue,
    storeId,
    storeMenuProductAction,
    t,
    visibleCategories,
    visibleSubcategories,
  ]);
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
        ref={listRef}
        CellRendererComponent={renderCell}
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
        maintainVisibleContentPosition={{ minIndexForVisible: 2 }}
        onEndReached={handleLoadMoreProducts}
        onEndReachedThreshold={0.4}
        onMomentumScrollEnd={() => {
          programmaticCategoryTargetKey.value = '';
        }}
        onScrollToIndexFailed={({ index }) => {
          requestAnimationFrame(() => scrollToMenuItem(index));
        }}
        onScroll={handleScroll}
        onScrollBeginDrag={() => {
          programmaticCategoryTargetKey.value = '';
        }}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
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
        renderItem={renderListItem}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        updateCellsBatchingPeriod={Platform.OS === 'android' ? 32 : 50}
        windowSize={Platform.OS === 'android' ? 7 : 9}
      />
      <StoreDetailStickyCategories
        activeCategoryId={activeCategoryId}
        categories={visibleCategories}
        onLayout={handleStickyCategoriesLayout}
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
  categoryHeading: {
    paddingBottom: 12,
    paddingTop: 24,
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
  subcategoryHeading: {
    paddingBottom: 10,
    paddingTop: 8,
  },
});
