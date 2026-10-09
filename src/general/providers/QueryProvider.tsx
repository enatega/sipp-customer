import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

// ---------------------------------------------------------------------------
// Sync React Query's online manager with device network state
// (native-data-fetching skill §5 – Offline Support)
// ---------------------------------------------------------------------------
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(state.isConnected ?? true);
  });
});

// ---------------------------------------------------------------------------
// QueryClient – sensible defaults following cache-stale-time skill rule
//  • staleTime 60 s globally – override per-query for different volatility
//  • retry 2 for transient failures (network / 5xx only)
//  • gcTime 5 min for inactive query garbage-collection
// ---------------------------------------------------------------------------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,       // 1 minute default
      gcTime: 5 * 60 * 1000,      // 5 minutes
      // Retry up to twice, but only when a retry can help: network failures
      // (status 0) and server errors. 4xx responses won't change on retry.
      retry: (failureCount, error) => {
        const status = (error as { status?: unknown } | null)?.status;
        const isRetryable = typeof status !== 'number' || status === 0 || status >= 500;
        return isRetryable && failureCount < 2;
      },
      refetchOnWindowFocus: false, // Not useful in mobile apps
      refetchOnReconnect: true,    // Refetch on network recovery
    },
    mutations: {
      // Never auto-retry writes: a timed-out request may already have been
      // applied server-side (orders, top-ups, payments), so a retry duplicates it.
      retry: false,
    },
  },
});

// ---------------------------------------------------------------------------
// Provider to wrap the app / sub-app
// ---------------------------------------------------------------------------
interface QueryProviderProps {
  children: ReactNode;
}

export { queryClient };

export default function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
