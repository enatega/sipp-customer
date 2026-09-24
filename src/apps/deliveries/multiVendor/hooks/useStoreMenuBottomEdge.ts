import { useCallback, useEffect, useRef, type RefObject } from 'react';
import type { FlashListRef } from '@shopify/flash-list';
import type { SharedValue } from 'react-native-reanimated';
import type { StoreMenuListRow } from '../utils/storeMenuRows';

type Params = {
  list: RefObject<FlashListRef<StoreMenuListRow> | null>;
  rows: StoreMenuListRow[];
  ready: RefObject<boolean>;
  direction: SharedValue<number>;
  bottomPadding: number;
  pageCount: number;
  hasNextPage: boolean;
  load: (direction: 'forward' | 'backward') => boolean;
};

/** Fill short menus without relying on a scroll or a second onEndReached event. */
export function useStoreMenuBottomEdge({ list, rows, ready, direction, bottomPadding,
  pageCount, hasNextPage, load }: Params) {
  const frame = useRef<number | null>(null);
  const check = useCallback(() => {
    const ref = list.current;
    if (!ref || !ready.current || !hasNextPage || !pageCount || pageCount >= 12) return;
    // Measure menu content, excluding the loading footer and bottom padding.
    // Those can make a short menu appear tall enough even with no more items.
    let index = rows.length - 1;
    while (index >= 0 && !('sectionId' in rows[index])) index -= 1;
    const lastRow = index >= 0 ? ref.getLayout(index) : undefined;
    if (!lastRow) return;
    const height = ref.getWindowSize().height;
    if (height <= 0) return;
    const visibleBottom = ref.getAbsoluteLastScrollOffset() + Math.max(0, height - bottomPadding);
    const remaining = lastRow.y + lastRow.height + ref.getFirstItemOffset() - visibleBottom;
    // Match normal end prefetching, including near-fit menus. An overscroll
    // bounce must not block filling a viewport that still has empty space.
    if (remaining <= height * 0.4 && (remaining <= 1 || direction.value >= 0)) load('forward');
  }, [bottomPadding, direction, hasNextPage, list, load, pageCount, ready, rows]);
  const latestCheck = useRef(check);
  latestCheck.current = check;
  const fillViewport = useCallback(() => {
    if (frame.current !== null) return;
    // Coalesce layout notifications and read the committed geometry, not the
    // previous render's measurements during a content-size callback.
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      latestCheck.current();
    });
  }, []);
  useEffect(fillViewport, [check, fillViewport]);
  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  return {
    fillViewport,
    onEndReached: () => {
      if (ready.current && direction.value >= 0) load('forward');
      fillViewport();
    },
  };
}
