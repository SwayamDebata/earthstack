import { ReactNode } from 'react';
import AppProviders from '@/components/providers/AppProviders';
import AppErrorBoundary from '@/components/system/AppErrorBoundary';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AppErrorBoundary>
      <AppProviders>{children}</AppProviders>
    </AppErrorBoundary>
  );
}
