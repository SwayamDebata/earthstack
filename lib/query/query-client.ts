'use client';

import { QueryClient } from '@tanstack/react-query';

/**
 * Hardened defaults so dashboard navigation, focus events, and reconnects
 * do not amplify load on the upstream DB. Polling cadence is the only
 * regular driver of fetches; everything else relies on the cache.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchIntervalInBackground: false,
        retry: (failureCount, error) => {
          if (failureCount >= 1) return false;
          const status = (error as { status?: number } | undefined)?.status;
          if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
            return false;
          }
          return true;
        },
        retryDelay: (attempt) => Math.min(2_000 * 2 ** attempt, 15_000),
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
