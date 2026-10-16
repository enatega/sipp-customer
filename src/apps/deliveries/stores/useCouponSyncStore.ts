import { create } from 'zustand';

// Only uncertain writes live locally. Selected coupons always come from the cart.
export const useCouponSyncStore = create<{
  userId: string | null;
  pending: boolean;
  setPending: (userId: string, pending: boolean) => void;
}>((set) => ({
  userId: null,
  pending: false,
  setPending: (userId, pending) => set({ userId, pending }),
}));
