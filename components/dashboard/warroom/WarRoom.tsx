'use client';

import { useCallback, useState } from 'react';
import StateBriefing from '@/components/dashboard/warroom/StateBriefing';
import EvidenceMode, { type EvidenceHazardTab } from '@/components/dashboard/warroom/EvidenceMode';
import HeatStrip from '@/components/dashboard/heat/HeatStrip';

/**
 * Decision Engine / War Room.
 * Flood briefing + Heat SHADOW strip. District click opens Evidence Mode
 * with Flood | Heat tabs. Advisory only. Does not override IMD or CWC.
 */
export default function WarRoom() {
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<EvidenceHazardTab>('flood');

  const openDistrict = useCallback((location: string, hazard: EvidenceHazardTab = 'flood') => {
    setSelected(location);
    setTab(hazard);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
    setTab('flood');
  }, []);

  return (
    <>
      <HeatStrip onSelectCity={(city) => openDistrict(city, 'heat')} />
      <div className="mt-4">
        <StateBriefing
          onSelectDistrict={(city) => openDistrict(city, 'flood')}
          activeDistrict={selected}
          onSelectHeat={(city) => openDistrict(city, 'heat')}
        />
      </div>
      <EvidenceMode location={selected} onClose={handleClose} tab={tab} onTabChange={setTab} />
    </>
  );
}
