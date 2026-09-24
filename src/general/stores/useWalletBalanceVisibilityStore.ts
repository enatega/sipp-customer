import { create } from 'zustand';

type WalletBalanceVisibilityState = {
  isVisible: boolean;
  toggleVisibility: () => void;
  hideBalance: () => void;
};

export const useWalletBalanceVisibilityStore = create<WalletBalanceVisibilityState>((set) => ({
  isVisible: false,
  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
  hideBalance: () => set({ isVisible: false }),
}));
