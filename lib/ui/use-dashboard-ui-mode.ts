'use client';

import { useEffect, useState } from 'react';
import { useMissionOptional } from '@/components/dashboard/MissionContext';
import { readUiMode, type UiMode } from '@/lib/access/ui-mode';

/** UI mode for dashboard widgets that may render outside MissionProvider (e.g. marketing pilot modal). */
export function useDashboardUiMode(): UiMode {
  const mission = useMissionOptional();
  const [fallback, setFallback] = useState<UiMode>('standard');

  useEffect(() => {
    if (!mission) setFallback(readUiMode());
  }, [mission]);

  return mission?.uiMode ?? fallback;
}
