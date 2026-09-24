import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import Animated, { type SharedValue } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import ListStateView from '../../../../../general/components/filterablePaginatedList/ListStateView';
import { useTheme } from '../../../../../general/theme/theme';
import type { ProductCardActionOverrides } from '../../../components/productCard/types';
import { buildStoreMenuRows, type StoreMenuListRow as Row } from '../../utils/storeMenuRows';
import type { useStoreMenuWindow } from '../../hooks/useStoreMenuWindow';
import StoreMenuToolbar from './StoreMenuToolbar';
import StoreMenuCategoriesSheet from './StoreMenuCategoriesSheet';
import StoreMenuProductRow from './StoreMenuProductRow';
import StoreDetailMenuCardSkeleton from './StoreDetailMenuCardSkeleton';
import { useStoreMenuPosition } from '../../hooks/useStoreMenuPosition';

const AnimatedMenuList = Animated.createAnimatedComponent(FlashList<Row>);

type Props = {
  storeId: string;
  menu: ReturnType<typeof useStoreMenuWindow>;
  hero: React.ReactElement;
  scrollY: SharedValue<number>;
  navigationHeight: number;
  bottomPadding: number;
  productAction: ProductCardActionOverrides;
  onSearch: () => void;
};

export default function StoreMenuViewport({ storeId, menu, hero, scrollY, navigationHeight, bottomPadding, productAction, onSearch }: Props) {
  const { colors, spacing, layout } = useTheme();
  const { t } = useTranslation('deliveries');
  const list = useRef<FlashListRef<Row>>(null);
  const [heroHeight, setHeroHeight] = useState(0);
  const [toolbarHeight, setToolbarHeight] = useState(0);
  const [isCategoriesOpen, setCategoriesOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(menu.sectionId);
  const store = menu.bootstrap.data!.store;
  const sections = menu.bootstrap.data!.sections;
  const pages = menu.query.data?.pages;
  const firstPage = pages?.[0];
  const hasHero = Boolean(firstPage && firstPage.sectionId === sections[0]?.id && !firstPage.hasPrevious)
    || (!pages && !menu.target);
  // At a truncated window's top edge, pulling reveals earlier menu pages.
  // Refresh belongs only at the actual beginning of the restaurant menu.
  const canRefresh = !sections.length || Boolean(firstPage && !menu.query.hasPreviousPage
    && !firstPage.hasPrevious && firstPage.sectionId === sections[0]?.id);
  const activeSection = sections.find((section) => section.id === activeSectionId)
    ?? sections.find((section) => section.id === menu.sectionId);
  const subcategories = useMemo(() => {
    const category = store.categories.find((item) => item.id === activeSection?.categoryId);
    return store.subcategories.filter((item) => category?.subcategoryIds?.includes(item.id));
  }, [activeSection?.categoryId, store.categories, store.subcategories]);
  const rows = useMemo<Row[]>(() => {
    const data: Row[] = hasHero ? [{ id: 'hero', type: 'hero' }] : [];
    data.push({ id: 'toolbar', type: 'toolbar' });
    // A heading is available from the index before its products arrive.
    const visiblePages = pages ?? (menu.sectionId ? [{
      sectionId: menu.sectionId, items: [], previousCursor: null, nextCursor: null,
      hasNext: false, hasPrevious: false,
    }] : []);
    data.push(...buildStoreMenuRows(visiblePages, sections, store.categories));
    if (!pages && menu.query.isPending && sections.length) data.push({ id: 'loading', type: 'loading' });
    else if (!pages && menu.query.isError) data.push({ id: 'error', type: 'error' });
    else if (!sections.length) data.push({ id: 'empty', type: 'empty' });
    else if (pages?.every((page) => !page.items.length)) data.push({ id: 'section-empty', type: 'empty' });
    return data;
  }, [hasHero, pages, menu.sectionId, menu.query.isPending, menu.query.isError, sections, store.categories]);

  const position = useStoreMenuPosition({ list, rows, menu, activeSection, hasHero, heroHeight,
    toolbarHeight, navigationHeight, bottomPadding, scrollY, onActiveSection: setActiveSectionId });

  const retryPage = useCallback(() => menu.retryPage(position.captureAnchor()), [menu.retryPage, position.captureAnchor]);

  const jumpCategory = useCallback((id: string) => {
    const section = sections.find((item) => item.categoryId === id);
    if (section) menu.jump({ sectionId: section.id });
  }, [menu.jump, sections]);
  const jumpSubcategory = useCallback((id: string) => {
    const section = sections.find((item) => item.subcategoryId === id);
    if (section) menu.jump({ sectionId: section.id });
  }, [menu.jump, sections]);

  return (
    <View style={{ flex: 1 }} onLayout={position.fillViewport}>
      <AnimatedMenuList ref={list} data={rows} keyExtractor={(row) => row.id} getItemType={(row) => row.type}
        onScroll={position.onScroll} scrollEventThrottle={16}
        onLoad={() => { position.restore(); position.fillViewport(); }}
        onContentSizeChange={position.fillViewport}
        onCommitLayoutEffect={() => { position.preservePageAnchor(); position.fillViewport(); }}
        {...position.topEdgeTouches}
        onStartReached={position.onStartReached} onStartReachedThreshold={0.4}
        onEndReached={position.onEndReached} onEndReachedThreshold={0.4}
        maintainVisibleContentPosition={{ disabled: false }}
        contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        refreshControl={canRefresh
          ? <RefreshControl refreshing={menu.isRefreshing} tintColor={colors.primary}
              onRefresh={() => { void menu.refresh(position.captureAnchor()); }} />
          : undefined}
        ListHeaderComponent={menu.query.isFetchingPreviousPage ? <ActivityIndicator color={colors.primary} />
          : menu.query.isFetchPreviousPageError ? <ListStateView variant="error" description={t('store_menu_page_error')}
            actionLabel={t('generic_list_retry')} onActionPress={retryPage} /> : null}
        ListFooterComponent={menu.bootstrap.isError ? <ListStateView variant="error" description={t('store_menu_refresh_error')}
          actionLabel={t('generic_list_retry')} onActionPress={() => { void menu.refresh(position.captureAnchor()); }} />
          : menu.query.isFetchingNextPage ? <ActivityIndicator style={{ padding: spacing.lg }} color={colors.primary} />
          : menu.query.isFetchNextPageError && pages ? <ListStateView variant="error" description={t('store_menu_page_error')}
              actionLabel={t('generic_list_retry')} onActionPress={retryPage} /> : null}
        renderItem={({ item }) => {
          if (item.type === 'hero') return <View onLayout={(event) => setHeroHeight(event.nativeEvent.layout.height)}>{hero}</View>;
          if (item.type === 'toolbar') return <View style={{ height: toolbarHeight + (hasHero ? 0 : navigationHeight) }} />;
          if (item.type === 'loading') return <View style={{ padding: spacing.lg }}><StoreDetailMenuCardSkeleton /></View>;
          if (item.type === 'error') return <ListStateView variant="error" description={t('store_menu_page_error')}
            actionLabel={t('generic_list_retry')} onActionPress={retryPage} />;
          if (item.type === 'empty') return <ListStateView variant="empty" description={t(sections.length ? 'store_menu_no_section_items' : 'store_details_no_items')} />;
          return <StoreMenuProductRow item={item} storeId={storeId} productAction={productAction} />;
        }} />
      <Animated.View style={[{ position: 'absolute', top: navigationHeight, left: 0, right: 0, zIndex: layout.layer.navigation - 1 }, position.toolbarStyle]}>
        <StoreMenuToolbar categories={store.categories} subcategories={subcategories}
          activeCategoryId={activeSection?.categoryId ?? null} activeSubcategoryId={activeSection?.subcategoryId ?? null}
          onCategorySelect={jumpCategory} onSubcategorySelect={jumpSubcategory} onSearch={onSearch}
          onAllCategories={() => setCategoriesOpen(true)} onLayout={(event) => setToolbarHeight(event.nativeEvent.layout.height)} />
      </Animated.View>
      <StoreMenuCategoriesSheet visible={isCategoriesOpen} categories={store.categories}
        activeCategoryId={activeSection?.categoryId ?? null} onSelect={jumpCategory} onClose={() => setCategoriesOpen(false)} />
    </View>
  );
}
