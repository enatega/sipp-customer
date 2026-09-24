import React from 'react';
import type { FlashListRef } from '@shopify/flash-list';
import type { DeliveryStoreDetailsFilterItem } from '../../api/types';
import { useReducedMotion } from '../../../../general/hooks/useReducedMotion';

type Params = { activeCategoryId: string | null; categories: DeliveryStoreDetailsFilterItem[] };

export function useStoreDetailTabsScroll({ activeCategoryId, categories }: Params) {
  const scrollViewRef = React.useRef<FlashListRef<{ id: string; label: string; imageUrl: string | null }>>(null);
  const isDragging = React.useRef(false);
  const reducedMotion = useReducedMotion();
  const activeIndex = categories.findIndex((category) => category.id === activeCategoryId);
  React.useEffect(() => {
    if (activeIndex < 0 || isDragging.current) return;
    void scrollViewRef.current?.scrollToIndex({ index: activeIndex, animated: !reducedMotion, viewPosition: 0.5 });
  }, [activeIndex, activeCategoryId, reducedMotion]);
  return {
    scrollViewRef,
    onScrollBeginDrag: () => { isDragging.current = true; },
    onScrollEndDrag: () => { isDragging.current = false; },
    onMomentumScrollBegin: () => { isDragging.current = true; },
    onMomentumScrollEnd: () => { isDragging.current = false; },
  };
}
