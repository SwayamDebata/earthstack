'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isPilotOnlyPath } from '@/lib/access/pilot';
import { useMission } from '@/components/dashboard/MissionContext';

/** Redirect preview users away from analytics / settings routes. */
export default function PilotRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPilotAccess, openPilotRequest } = useMission();

  useEffect(() => {
    if (hasPilotAccess) return;
    if (!isPilotOnlyPath(pathname)) return;

    openPilotRequest('Analytics telemetry and full mission control require district pilot access.');
    router.replace('/dashboard/ops');
  }, [hasPilotAccess, pathname, router, openPilotRequest]);

  return null;
}
