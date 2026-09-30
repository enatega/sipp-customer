import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { POPULAR_ADDRESSES } from '../../../general/data/popularAddresses';
import type { DeliveryAddress } from '../../../general/api/addressService';

export type BrowseCityName = 'Santa Teresa' | 'Tamarindo';

const STORAGE_KEY = 'deliveries.browseCity';

type BrowseCityState = {
  cityName: BrowseCityName | null;
  browseAddress: DeliveryAddress | null;
  isHydrated: boolean;
  isPickerVisible: boolean;
  isConfirmedForLaunch: boolean;
  pendingAddedAddressBaseline: DeliveryAddress | null | undefined;
  hydrate: () => Promise<void>;
  openPicker: () => void;
  dismissPicker: () => void;
  selectCity: (name: BrowseCityName) => Promise<void>;
  selectAddress: (address: DeliveryAddress) => Promise<void>;
  markAddAddressPending: (baseline: DeliveryAddress | null) => void;
  clearAddAddressPending: () => void;
  resetUnavailableAddress: () => Promise<void>;
};

export const BROWSE_CITIES = POPULAR_ADDRESSES.filter(
  (place): place is typeof place & { name: BrowseCityName } =>
    place.name === 'Santa Teresa' || place.name === 'Tamarindo',
);

export const useBrowseCityStore = create<BrowseCityState>((set, get) => ({
  cityName: 'Santa Teresa',
  browseAddress: null,
  isHydrated: false,
  isPickerVisible: true,
  isConfirmedForLaunch: false,
  pendingAddedAddressBaseline: undefined,
  hydrate: async () => {
    if (get().isHydrated) return;
    try {
      const saved = await SecureStore.getItemAsync(STORAGE_KEY);
      const stored = saved?.startsWith('{') ? JSON.parse(saved) : saved;
      if (stored && typeof stored === 'object' && stored.kind === 'address') {
        const address = stored.address as DeliveryAddress;
        if (address?.id && Number.isFinite(address.latitude) && Number.isFinite(address.longitude)) {
          set({ cityName: null, browseAddress: address, isHydrated: true });
          return;
        }
      }
      const savedCity = typeof stored === 'string' ? stored : stored?.name;
      const cityName = BROWSE_CITIES.find((city) => city.name === savedCity)?.name ?? 'Santa Teresa';
      set({ cityName, browseAddress: null, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },
  openPicker: () => set({ isPickerVisible: true }),
  dismissPicker: () => set({ isPickerVisible: false, isConfirmedForLaunch: true }),
  selectCity: async (cityName) => {
    set({ cityName, browseAddress: null, isPickerVisible: false, isConfirmedForLaunch: true, pendingAddedAddressBaseline: undefined });
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, cityName);
    } catch {
      // The choice remains active for this session if storage is unavailable.
    }
  },
  selectAddress: async (browseAddress) => {
    set({ cityName: null, browseAddress, isPickerVisible: false, isConfirmedForLaunch: true, pendingAddedAddressBaseline: undefined });
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ kind: 'address', address: browseAddress }));
    } catch {
      // Keep the address active for this session if storage is unavailable.
    }
  },
  markAddAddressPending: (baseline) => set({ pendingAddedAddressBaseline: baseline }),
  clearAddAddressPending: () => set({ pendingAddedAddressBaseline: undefined }),
  resetUnavailableAddress: async () => {
    set({ cityName: 'Santa Teresa', browseAddress: null });
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, 'Santa Teresa');
    } catch {
      // The fallback remains active for this session.
    }
  },
}));

export function useBrowseCity() {
  const cityName = useBrowseCityStore((state) => state.cityName);
  const browseAddress = useBrowseCityStore((state) => state.browseAddress);
  if (browseAddress) {
    return {
      name: browseAddress.locationName?.trim() || browseAddress.address,
      address: browseAddress.address,
      latitude: browseAddress.latitude,
      longitude: browseAddress.longitude,
    };
  }
  return BROWSE_CITIES.find((city) => city.name === cityName) ?? null;
}
