'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OverviewView from '@/components/dashboard/views/OverviewView';
import { useMission } from '@/components/dashboard/MissionContext';

/**
 * Analytics theatre (unchanged view). Preview users always land on operational command.
 */
export default function DashboardPage() {
  const { missionProfile, hasPilotAccess } = useMission();
  const router = useRouter();

  useEffect(() => {
    if (!hasPilotAccess || missionProfile === 'operational') {
      router.replace('/dashboard/ops');
    }
  }, [missionProfile, hasPilotAccess, router]);

  if (!hasPilotAccess || missionProfile === 'operational') {
    return (
      <div className="flex h-40 items-center justify-center font-mono text-[10px] uppercase tracking-widest text-slate-500">
        Loading operational command…
      </div>
    );
  }

  return <OverviewView />;
}
