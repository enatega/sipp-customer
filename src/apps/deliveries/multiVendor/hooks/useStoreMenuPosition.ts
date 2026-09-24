import React, { useCallback, useRef } from 'react';
import type { FlashListRef } from '@shopify/flash-list';
import { runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { StoreMenuSection } from '../../api/storeMenuService';
import type { StoreMenuListRow as Row } from '../utils/storeMenuRows';
import type { StoreMenuAnchor, useStoreMenuWindow } from './useStoreMenuWindow';
import { useStoreMenuTopEdge } from './useStoreMenuTopEdge';
import { useStoreMenuBottomEdge } from './useStoreMenuBottomEdge';
import { useStoreMenuPageAnchor } from './useStoreMenuPageAnchor';
import { STORE_DETAIL_HERO_HEIGHT } from '../components/StoreDetails/StoreDetailNavigationHeader';

type Params = {
  list: React.RefObject<FlashListRef<Row> | null>;
  rows: Row[];
  menu: ReturnType<typeof useStoreMenuWindow>;
  activeSection: StoreMenuSection | undefined;
  hasHero: boolean;
  heroHeight: number;
  toolbarHeight: number;
  navigationHeight: number;
  bottomPadding: number;
  scrollY: SharedValue<number>;
  onActiveSection: (id: string) => void;
};

export function useStoreMenuPosition({ list, rows, menu, activeSection, hasHero, heroHeight,
  toolbarHeight, navigationHeight, bottomPadding, scrollY, onActiveSection }: Params) {
  const rawScrollY = useSharedValue(0);
  const hasDragged = useRef(false);
  const hasRestored = useRef(false);
  const lastSelectionTime = useSharedValue(0);
  const scrollDirection = useSharedValue(0);
  const isUserScrolling = useSharedValue(false);
  const isDragging = useSharedValue(false);
  const { requestPrevious, ...topEdgeTouches } = useStoreMenuTopEdge({
    list, ready: hasRestored, direction: scrollDirection,
    hasPreviousPage: menu.query.hasPreviousPage, load: menu.load,
  });
  const sections = menu.bootstrap.data!.sections;
  const pages = menu.query.data?.pages;
  const { fillViewport, onEndReached } = useStoreMenuBottomEdge({
    list, rows, ready: hasRestored, direction: scrollDirection, bottomPadding,
    pageCount: pages?.length ?? 0, hasNextPage: menu.query.hasNextPage, load: menu.load,
  });
  const toolbarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: hasHero ? Math.max(0, heroHeight - navigationHeight - rawScrollY.value) : 0 }],
    opacity: hasHero && !heroHeight ? 0 : 1,
  }), [hasHero, heroHeight, navigationHeight]);

  const captureAnchor = useCallback((): StoreMenuAnchor | undefined => {
    const ref = list.current;
    if (!ref) return undefined;
    const offset = ref.getAbsoluteLastScrollOffset();
    if (hasHero && offset < heroHeight - navigationHeight && sections[0]) {
      return { sectionId: sections[0].id, showHero: true };
    }
    const inset = navigationHeight + toolbarHeight;
    const visible = ref.computeVisibleIndices();
    for (let index = Math.max(0, visible.startIndex); index <= visible.endIndex; index += 1) {
      const row = rows[index];
      const position = ref.getLayout(index);
      if (row?.type === 'product' && position && position.y + ref.getFirstItemOffset() + position.height > offset + inset) {
        return { sectionId: row.sectionId, productId: row.product.id, offset: position.y + ref.getFirstItemOffset() - offset - inset };
      }
    }
    return activeSection ? { sectionId: activeSection.id } : undefined;
  }, [activeSection, hasHero, heroHeight, navigationHeight, rows, sections, toolbarHeight]);

  const { preservePageAnchor, cancelPageAnchor } = useStoreMenuPageAnchor({
    list, rows, pages, ready: hasRestored, toolbarInset: navigationHeight + toolbarHeight,
    captureAnchor, beforePageCommit: menu.beforePageCommit,
  });

  const syncActiveSection = useCallback(() => {
    if (!hasDragged.current || !list.current) return;
    const offset = list.current.getAbsoluteLastScrollOffset();
    const top = offset + navigationHeight + toolbarHeight;
    const visible = list.current.computeVisibleIndices();
    for (let index = Math.max(0, visible.startIndex); index <= visible.endIndex; index += 1) {
      const row = rows[index];
      const position = list.current.getLayout(index);
      if (row && 'sectionId' in row && position && position.y + list.current.getFirstItemOffset() + position.height > top + 1) {
        onActiveSection(row.sectionId);
        return;
      }
    }
  }, [navigationHeight, onActiveSection, rows, toolbarHeight]);

  const sampleScroll = useCallback((y: number, viewportHeight: number, direction: number) => {
    syncActiveSection();
    if (hasDragged.current && direction < 0 && y < viewportHeight * 0.4) requestPrevious();
    if (direction >= 0) fillViewport();
  }, [fillViewport, requestPrevious, syncActiveSection]);
  const beginDrag = useCallback(() => {
    cancelPageAnchor();
    hasDragged.current = true;
    // Native scrolling may claim the touch before JS receives a move event.
    if (hasRestored.current && list.current && list.current.getAbsoluteLastScrollOffset() <= 0) requestPrevious();
  }, [cancelPageAnchor, list, requestPrevious]);
  const onScroll = useAnimatedScrollHandler({
    onBeginDrag: () => {
      isDragging.value = true;
      isUserScrolling.value = true;
      runOnJS(beginDrag)();
    },
    onEndDrag: () => { isDragging.value = false; isUserScrolling.value = false; },
    onMomentumBegin: () => { isUserScrolling.value = true; },
    onMomentumEnd: () => { isUserScrolling.value = false; runOnJS(syncActiveSection)(); },
    onScroll: (event) => {
      const delta = event.contentOffset.y - rawScrollY.value;
      // Offset corrections and page eviction are not user direction changes.
      // Momentum keeps the direction established by the preceding drag.
      if (isDragging.value && Math.abs(delta) > 1) scrollDirection.value = delta > 0 ? 1 : -1;
      rawScrollY.value = event.contentOffset.y;
      scrollY.value = hasHero ? event.contentOffset.y : event.contentOffset.y + STORE_DETAIL_HERO_HEIGHT;
      const now = Date.now();
      if (isUserScrolling.value && now - lastSelectionTime.value > 100) {
        lastSelectionTime.value = now;
        runOnJS(sampleScroll)(event.contentOffset.y, event.layoutMeasurement.height, scrollDirection.value);
      }
    },
  }, [beginDrag, hasHero, sampleScroll, syncActiveSection]);
  React.useEffect(() => {
    if (!hasHero) scrollY.value = rawScrollY.value + STORE_DETAIL_HERO_HEIGHT;
  }, [hasHero, rawScrollY, scrollY]);

  const restore = useCallback(() => {
    if (hasRestored.current || !pages || !toolbarHeight || (hasHero && !heroHeight)) return;
    const anchor = menu.target;
    if (!anchor) { hasRestored.current = true; return; }
    if (anchor.showHero && hasHero) {
      hasRestored.current = true;
      list.current?.scrollToOffset({ offset: 0, animated: false });
      return;
    }
    const productIndex = anchor.productId ? rows.findIndex((row) => row.id === anchor.productId) : -1;
    const index = productIndex >= 0 ? productIndex : rows.findIndex((row) => 'sectionId' in row && row.sectionId === anchor.sectionId);
    if (index < 0) return;
    hasRestored.current = true;
    void list.current?.scrollToIndex({
      index, animated: false, viewPosition: 0,
      // FlashList v2 ADDS viewOffset to the content offset. A negative
      // value places the heading/product below the overlay toolbar.
      viewOffset: -(navigationHeight + toolbarHeight + (productIndex >= 0 ? anchor.offset ?? 0 : 0)),
    });
    if (!hasHero) scrollY.value = STORE_DETAIL_HERO_HEIGHT;
  }, [pages, toolbarHeight, hasHero, heroHeight, menu.target, rows, navigationHeight, scrollY]);
  React.useEffect(() => { restore(); fillViewport(); }, [restore, fillViewport]);


  return {
    toolbarStyle, captureAnchor, preservePageAnchor, syncActiveSection, onScroll, restore, fillViewport,
    topEdgeTouches: {
      ...topEdgeTouches,
      onTouchStart: (event: Parameters<typeof topEdgeTouches.onTouchStart>[0]) => {
        cancelPageAnchor();
        topEdgeTouches.onTouchStart(event);
      },
    },
    onStartReached: () => {
      if (isUserScrolling.value && scrollDirection.value < 0) requestPrevious();
    },
    onEndReached,
  };
}
