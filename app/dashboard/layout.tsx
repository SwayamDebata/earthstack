import type { ReactNode } from 'react';
import { MissionProvider } from '@/components/dashboard/MissionContext';
import MissionShell from '@/components/dashboard/MissionShell';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <MissionProvider>
      <MissionShell>{children}</MissionShell>
    </MissionProvider>
  );
}
