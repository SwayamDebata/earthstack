import type { ReactNode } from 'react';
import OpsShell from '@/components/ops/OpsShell';
import OpsQueryProvider from '@/components/ops/OpsQueryProvider';
import '@/app/ops.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Flood Operations · ModelEarth',
};

export default function OpsLayout({ children }: { children: ReactNode }) {
  return (
    <OpsQueryProvider>
      <OpsShell>{children}</OpsShell>
    </OpsQueryProvider>
  );
}
