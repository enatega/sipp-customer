import { useCallback, useEffect, useRef, type RefObject } from 'react';
import type { GestureResponderEvent } from 'react-native';
import type { FlashListRef } from '@shopify/flash-list';
import type { SharedValue } from 'react-native-reanimated';
import type { StoreMenuListRow } from '../utils/storeMenuRows';

type Params = {
  list: RefObject<FlashListRef<StoreMenuListRow> | null>;
  ready: RefObject<boolean>;
  direction: SharedValue<number>;
  hasPreviousPage: boolean;
  load: (direction: 'forward' | 'backward') => boolean;
};

/** Detect an upward-browsing gesture even when Android clamps the scroll offset at zero. */
export function useStoreMenuTopEdge({ list, ready, direction, hasPreviousPage, load }: Params) {
  const touchOrigin = useRef<{ x: number; y: number } | null>(null);
  const pendingIntent = useRef(false);
  const flushPrevious = useCallback(() => {
    const ref = list.current;
    if (!pendingIntent.current || !ready.current || !ref) return;
    const height = ref.getWindowSize().height;
    if (!hasPreviousPage || (height > 0 && ref.getAbsoluteLastScrollOffset() > height * 0.4)) {
      pendingIntent.current = false;
      return;
    }
    // Keep the intent if another page is still in flight; retry when its
    // query state changes instead of requiring a second drag from the user.
    if (height > 0 && load('backward')) pendingIntent.current = false;
  }, [hasPreviousPage, list, load, ready]);

  const requestPrevious = useCallback(() => {
    pendingIntent.current = true;
    flushPrevious();
  }, [flushPrevious]);
  useEffect(flushPrevious, [flushPrevious]);

  return {
    requestPrevious,
    onTouchStart: (event: GestureResponderEvent) => {
      touchOrigin.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
      pendingIntent.current = false;
    },
    onTouchMove: (event: GestureResponderEvent) => {
      const origin = touchOrigin.current;
      if (!origin) return;
      const dx = event.nativeEvent.pageX - origin.x;
      const dy = event.nativeEvent.pageY - origin.y;
      // Ignore taps and horizontal card interactions. This observes touches;
      // it never takes ownership of the native list's pan gesture.
      if (Math.abs(dy) < 12 || Math.abs(dy) <= Math.abs(dx)) return;
      touchOrigin.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
      direction.value = dy > 0 ? -1 : 1;
      if (dy > 0) requestPrevious();
      else pendingIntent.current = false;
    },
    onTouchEnd: () => { touchOrigin.current = null; },
    onTouchCancel: () => { touchOrigin.current = null; },
  };
}
