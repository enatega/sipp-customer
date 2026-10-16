import React from 'react';
import type { CartItem } from '../../api/cartServiceTypes';

type Props = {
  item: CartItem;
  isUpdating: boolean;
  onPendingChange?: (itemId: string, isPending: boolean) => void;
  onSetNote: (note: string) => Promise<void>;
  onSetQuantity: (quantity: number) => Promise<void>;
};

const QUANTITY_DEBOUNCE_MS = 500;
const NOTE_DEBOUNCE_MS = 700;

export function useCartItemDraft({
  item,
  isUpdating,
  onPendingChange,
  onSetNote,
  onSetQuantity,
}: Props) {
  const [quantity, setQuantity] = React.useState(item.quantity);
  const [note, setNote] = React.useState(item.itemNote ?? '');
  const [isQuantitySaving, setIsQuantitySaving] = React.useState(false);
  const [isNoteSaving, setIsNoteSaving] = React.useState(false);
  const noteRef = React.useRef(note);
  const savedNoteRef = React.useRef(item.itemNote ?? '');
  const mutationInFlightRef = React.useRef(false);
  const lastPendingRef = React.useRef(false);

  React.useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  React.useEffect(() => {
    const savedNote = item.itemNote ?? '';
    const previousSavedNote = savedNoteRef.current;
    savedNoteRef.current = savedNote;
    if (noteRef.current.trim() === previousSavedNote.trim()) {
      noteRef.current = savedNote;
      setNote(savedNote);
    }
  }, [item.itemNote]);

  React.useEffect(() => {
    if (quantity === item.quantity || isQuantitySaving || isNoteSaving) return;
    const timeout = setTimeout(() => {
      if (mutationInFlightRef.current) return;
      mutationInFlightRef.current = true;
      setIsQuantitySaving(true);
      void onSetQuantity(quantity)
        .catch(() => setQuantity(item.quantity))
        .finally(() => {
          mutationInFlightRef.current = false;
          setIsQuantitySaving(false);
        });
    }, QUANTITY_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [quantity, item.quantity, isQuantitySaving, isNoteSaving, onSetQuantity]);

  React.useEffect(() => {
    if (note.trim() === (item.itemNote ?? '') || isNoteSaving || isQuantitySaving) return;
    const timeout = setTimeout(() => {
      if (mutationInFlightRef.current) return;
      mutationInFlightRef.current = true;
      const submittedNote = note;
      setIsNoteSaving(true);
      void onSetNote(submittedNote)
        .catch(() => {
          if (noteRef.current !== submittedNote) return;
          noteRef.current = savedNoteRef.current;
          setNote(savedNoteRef.current);
        })
        .finally(() => {
          mutationInFlightRef.current = false;
          setIsNoteSaving(false);
        });
    }, NOTE_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [note, item.itemNote, isNoteSaving, isQuantitySaving, onSetNote]);

  const isPending = isUpdating || isQuantitySaving || isNoteSaving ||
    quantity !== item.quantity || note.trim() !== (item.itemNote ?? '');

  React.useEffect(() => {
    if (!onPendingChange || lastPendingRef.current === isPending) return;
    lastPendingRef.current = isPending;
    onPendingChange(item.id, isPending);
  }, [isPending, item.id, onPendingChange]);

  React.useEffect(() => () => {
    if (onPendingChange && lastPendingRef.current) onPendingChange(item.id, false);
  }, [item.id, onPendingChange]);

  const changeNote = React.useCallback((value: string) => {
    noteRef.current = value;
    setNote(value);
  }, []);

  const discardDrafts = React.useCallback(() => {
    noteRef.current = savedNoteRef.current;
    setNote(savedNoteRef.current);
    setQuantity(item.quantity);
  }, [item.quantity]);

  return {
    changeNote,
    discardDrafts,
    isQuantitySaving,
    note,
    quantity,
    setQuantity,
  };
}
