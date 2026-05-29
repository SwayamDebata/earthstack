'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OverviewView from '@/components/dashboard/views/OverviewView';
import { useMission } from '@/components/dashboard/MissionContext';

/**
 * Analytics theatre (unchanged view). When mission profile is Operational,
 * redirect to /dashboard/ops without modifying OverviewView.
 */
export default function DashboardPage() {
  const { missionProfile } = useMission();
  const router = useRouter();

  useEffect(() => {
    if (missionProfile === 'operational') {
      router.replace('/dashboard/ops');
    }
  }, [missionProfile, router]);

  if (missionProfile === 'operational') {
    return (
      <div className="flex h-40 items-center justify-center font-mono text-[10px] uppercase tracking-widest text-slate-500">
        Loading operational command…
      </div>
    );
  }

  return <OverviewView />;
}
