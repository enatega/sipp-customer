import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import type { FlashListRef } from '@shopify/flash-list';
import type { StoreMenuPage } from '../../api/storeMenuService';
import type { StoreMenuListRow } from '../utils/storeMenuRows';
import type { StoreMenuAnchor, useStoreMenuWindow } from './useStoreMenuWindow';

type Params = {
  list: RefObject<FlashListRef<StoreMenuListRow> | null>;
  rows: StoreMenuListRow[];
  pages: StoreMenuPage[] | undefined;
  ready: RefObject<boolean>;
  toolbarInset: number;
  captureAnchor: () => StoreMenuAnchor | undefined;
  beforePageCommit: ReturnType<typeof useStoreMenuWindow>['beforePageCommit'];
};

type PendingAnchor = {
  anchor: StoreMenuAnchor;
  previousPages: StoreMenuPage[] | undefined;
};

export function useStoreMenuPageAnchor({ list, rows, pages, ready, toolbarInset,
  captureAnchor, beforePageCommit }: Params) {
  const pending = useRef<PendingAnchor | null>(null);
  const frame = useRef<number | null>(null);
  // Layout notifications can schedule a frame before the next React commit.
  // Resolve product IDs against the committed rows, never an old row index.
  const committed = useRef({ rows, pages, toolbarInset });
  useLayoutEffect(() => { committed.current = { rows, pages, toolbarInset }; }, [rows, pages, toolbarInset]);

  const cancelPageAnchor = useCallback(() => {
    pending.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);
  useEffect(() => cancelPageAnchor, [cancelPageAnchor]);

  useLayoutEffect(() => {
    beforePageCommit.current = (preservePosition) => {
      cancelPageAnchor();
      const anchor = ready.current ? captureAnchor() : undefined;
      if (preservePosition && anchor?.productId) {
        pending.current = { anchor, previousPages: committed.current.pages };
      }
      return anchor;
    };
    return () => { beforePageCommit.current = null; };
  }, [beforePageCommit, cancelPageAnchor, captureAnchor, ready]);

  const preservePageAnchor = useCallback(() => {
    if (!pending.current || frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const snapshot = pending.current;
      const current = committed.current;
      const ref = list.current;
      if (!snapshot || !ref || current.pages === snapshot.previousPages) return;
      pending.current = null;
      const index = current.rows.findIndex((row) => row.id === snapshot.anchor.productId);
      const position = index >= 0 ? ref.getLayout(index) : undefined;
      // If the anchor disappeared, leave the native list in place. Do not
      // fall back to the first category during a background page response.
      if (!position) return;
      const expectedTop = current.toolbarInset + (snapshot.anchor.offset ?? 0);
      const targetOffset = Math.max(0, position.y + ref.getFirstItemOffset() - expectedTop);
      if (Math.abs(ref.getAbsoluteLastScrollOffset() - targetOffset) > 1) {
        // The row is already measured. Avoid scrollToIndex's multi-frame
        // navigation, which can compete with scrolling and later responses.
        ref.scrollToOffset({ offset: targetOffset, animated: false, skipFirstItemOffset: true });
      }
    });
  }, [list]);
  useLayoutEffect(preservePageAnchor, [pages, preservePageAnchor]);

  return { preservePageAnchor, cancelPageAnchor };
}
