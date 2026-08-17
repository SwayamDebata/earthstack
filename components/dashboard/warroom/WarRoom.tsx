'use client';

import { useCallback, useState } from 'react';
import StateBriefing from '@/components/dashboard/warroom/StateBriefing';
import EvidenceMode from '@/components/dashboard/warroom/EvidenceMode';

/**
 * Flood Ops War Room only.
 * Heat lives on /dashboard/heat as a separate product surface.
 * Advisory only. Does not override IMD or CWC official warnings.
 */
export default function WarRoom() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = useCallback((location: string) => setSelected(location), []);
  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <>
      <StateBriefing onSelectDistrict={handleSelect} activeDistrict={selected} />
      <EvidenceMode location={selected} onClose={handleClose} />
    </>
  );
}
