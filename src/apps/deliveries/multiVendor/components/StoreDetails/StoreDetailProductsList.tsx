import React from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import PagerView, { type PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../../../general/theme/theme';
import { useWindowClass } from '../../../../../general/hooks/useWindowClass';
import type {
  DeliveryStoreDetailsFilterItem,
  DeliveryStoreDetailsProduct,
} from '../../../api/types';
import ListStateView from '../../../../../general/components/filterablePaginatedList/ListStateView';
import ProductCard from '../../../components/productCard/ProductCard';
import type { ProductCardActionOverrides } from '../../../components/productCard/types';
import {
  buildStoreDetailCategoryIds,
  getStoreDetailCategoryIdAtPageIndex,
  getStoreDetailCategoryPageIndex,
} from '../../hooks/useStoreDetailPager';
import StoreDetailMenuCardSkeleton from './StoreDetailMenuCardSkeleton';

const STORE_DETAIL_PRODUCT_SKELETON_ITEMS = Array.from({ length: 4 }, (_, index) => ({
  id: `store-detail-product-skeleton-${index}`,
  isSkeleton: true as const,
}));
const MIN_PAGER_HEIGHT = 1;
const LIST_STATE_MIN_HEIGHT = 180;
const OFFERS_PAGE_KEY = 'offers';
const STORE_MENU_ROW_ESTIMATED_HEIGHT = 136;

type StoreDetailSkeletonItem = (typeof STORE_DETAIL_PRODUCT_SKELETON_ITEMS)[number];
type StoreDetailListItem = DeliveryStoreDetailsProduct | StoreDetailSkeletonItem;

type Props = {
  activeCategoryId: string | null;
  categories: DeliveryStoreDetailsFilterItem[];
  contentLayoutKey?: string;
  emptyText: string;
  errorText?: string | null;
  hasError?: boolean;
  hasFetchedProducts?: boolean;
  onCategorySelect: (categoryId: string | null) => void;
  onRetry?: () => void;
  products: DeliveryStoreDetailsProduct[];
  productAction?: ProductCardActionOverrides;
  shouldShowProductSkeletons: boolean;
  storeId?: string | null;
};

function isStoreDetailSkeletonItem(item: StoreDetailListItem): item is StoreDetailSkeletonItem {
  return (item as StoreDetailSkeletonItem).isSkeleton === true;
}

function getPageKey(categoryId: string | null) {
  return categoryId ?? OFFERS_PAGE_KEY;
}

export default function StoreDetailProductsList({
  activeCategoryId,
  categories,
  contentLayoutKey,
  emptyText,
  errorText,
  hasError = false,
  hasFetchedProducts = false,
  onCategorySelect,
  onRetry,
  products,
  productAction,
  shouldShowProductSkeletons,
  storeId,
}: Props) {
  const { spacing } = useTheme();
  const { gutter } = useWindowClass();
  const { t } = useTranslation('deliveries');
  const { width } = useWindowDimensions();
  const pagerViewRef = React.useRef<PagerView>(null);
  const [pageHeights, setPageHeights] = React.useState<Record<string, number>>({});
  const pageCategoryIds = React.useMemo(
    () => buildStoreDetailCategoryIds(categories),
    [categories],
  );
  const activePageIndex = React.useMemo(
    () => getStoreDetailCategoryPageIndex({ activeCategoryId, categories }),
    [activeCategoryId, categories],
  );
  const activePageIndexRef = React.useRef(activePageIndex);
  const activePageKey = getPageKey(activeCategoryId);
  const activeListData = React.useMemo<StoreDetailListItem[]>(
    () => (shouldShowProductSkeletons ? STORE_DETAIL_PRODUCT_SKELETON_ITEMS : products),
    [products, shouldShowProductSkeletons],
  );
  const estimatedRowHeight = React.useMemo(() => {
    return Math.min(width, STORE_MENU_ROW_ESTIMATED_HEIGHT);
  }, [width]);
  const shouldShowActiveErrorState =
    hasFetchedProducts && hasError && products.length === 0 && !shouldShowProductSkeletons;
  const shouldShowActiveEmptyState =
    hasFetchedProducts &&
    products.length === 0 &&
    !shouldShowProductSkeletons &&
    !shouldShowActiveErrorState;
  const activeContentMinHeight = activeListData.length > 0
    ? estimatedRowHeight
    : shouldShowActiveErrorState || shouldShowActiveEmptyState
      ? LIST_STATE_MIN_HEIGHT
      : MIN_PAGER_HEIGHT;
  const activePageHeight = Math.max(
    pageHeights[activePageKey] ?? 0,
    activeContentMinHeight,
    MIN_PAGER_HEIGHT,
  );
  const activeContentStateKey = React.useMemo(() => {
    const stateKey = shouldShowProductSkeletons
      ? 'loading'
      : shouldShowActiveErrorState
        ? 'error'
        : shouldShowActiveEmptyState
          ? 'empty'
          : `products-${products.length}`;

    return `${contentLayoutKey ?? activePageKey}:${stateKey}`;
  }, [
    activePageKey,
    contentLayoutKey,
    products.length,
    shouldShowActiveEmptyState,
    shouldShowActiveErrorState,
    shouldShowProductSkeletons,
  ]);

  React.useEffect(() => {
    if (activePageIndexRef.current === activePageIndex) {
      return;
    }

    pagerViewRef.current?.setPage(activePageIndex);
    activePageIndexRef.current = activePageIndex;
  }, [activePageIndex]);

  const handlePageSelected = React.useCallback(
    (event: PagerViewOnPageSelectedEvent) => {
      const nextPageIndex = event.nativeEvent.position;
      const nextCategoryId = getStoreDetailCategoryIdAtPageIndex(nextPageIndex, categories) ?? null;

      activePageIndexRef.current = nextPageIndex;

      if (nextCategoryId !== activeCategoryId) {
        onCategorySelect(nextCategoryId);
      }
    },
    [activeCategoryId, categories, onCategorySelect],
  );

  const handlePageLayout = React.useCallback(
    (categoryId: string | null, event: LayoutChangeEvent) => {
      const nextHeight = event.nativeEvent.layout.height;
      const pageKey = getPageKey(categoryId);

      if (nextHeight <= 0) {
        return;
      }

      setPageHeights((currentHeights) => {
        if (currentHeights[pageKey] === nextHeight) {
          return currentHeights;
        }

        return {
          ...currentHeights,
          [pageKey]: nextHeight,
        };
      });
    },
    [],
  );

  return (
    <PagerView
      initialPage={activePageIndex}
      offscreenPageLimit={1}
      onPageSelected={handlePageSelected}
      ref={pagerViewRef}
      style={[styles.pager, { height: activePageHeight }]}
    >
      {pageCategoryIds.map((pageCategoryId) => {
        const pageKey = getPageKey(pageCategoryId);
        const isActivePage = pageCategoryId === activeCategoryId;
        const pageData: StoreDetailListItem[] = isActivePage ? activeListData : [];
        const shouldShowErrorState = isActivePage && shouldShowActiveErrorState;
        const shouldShowEmptyState = isActivePage && shouldShowActiveEmptyState;
        const pageContentKey = isActivePage ? activeContentStateKey : `${pageKey}:inactive`;

        return (
          <View
            collapsable={false}
            key={pageKey}
            style={{
              backgroundColor: 'transparent',
              paddingBottom: spacing.xl,
              paddingHorizontal: gutter,
              paddingTop: spacing.xs,
            }}
          >
            <View
              key={pageContentKey}
              onLayout={(event) => handlePageLayout(pageCategoryId, event)}
            >
              {pageData.length > 0 ? (
                <View style={{ gap: spacing.md }}>
                  {pageData.map((item) =>
                    isStoreDetailSkeletonItem(item) ? (
                      <StoreDetailMenuCardSkeleton key={item.id} />
                    ) : (
                      <ProductCard
                        product={item}
                        key={item.id}
                        productAction={productAction}
                        storeId={storeId}
                        variant="storeMenu"
                      />
                    ),
                  )}
                </View>
              ) : shouldShowErrorState ? (
                <ListStateView
                  actionLabel={t('generic_list_retry')}
                  containerStyle={styles.stateView}
                  description={errorText ?? t('store_details_load_error')}
                  onActionPress={onRetry}
                  title={t('generic_list_error_title')}
                  variant="error"
                />
              ) : shouldShowEmptyState ? (
                <ListStateView
                  containerStyle={styles.stateView}
                  description={emptyText}
                  variant="empty"
                />
              ) : null}
            </View>
          </View>
        );
      })}
    </PagerView>
  );
}

const styles = StyleSheet.create({
  pager: {
    width: '100%',
  },
  stateView: {
    flex: 0,
  },
});
