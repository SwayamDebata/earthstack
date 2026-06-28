'use client';

import { ReactNode, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/query/query-client';
import SoundProvider from '@/components/audio/SoundProvider';

export default function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <SoundProvider>{children}</SoundProvider>
    </QueryClientProvider>
  );
}
