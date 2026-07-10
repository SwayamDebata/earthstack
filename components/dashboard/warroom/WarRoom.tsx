'use client';

import { useCallback, useState } from 'react';
import StateBriefing from '@/components/dashboard/warroom/StateBriefing';
import EvidenceMode from '@/components/dashboard/warroom/EvidenceMode';

/**
 * Decision Engine / War Room.
 * Leads Mission Control with a proactive, state-wide "Today's Situation" briefing,
 * and lets an officer drill into any district for evidence and a suggested action.
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
