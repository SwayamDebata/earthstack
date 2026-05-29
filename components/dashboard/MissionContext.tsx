'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { LOCATIONS, type Location } from '@/lib/config';

const LOC_KEY = 'modelearth:location';
const FILTER_KEY = 'modelearth:active-only';
const PROFILE_KEY = 'modelearth:mission-profile';

/** Operational = decision workflows; Analytics = existing telemetry dashboard (unchanged). */
export type MissionProfile = 'operational' | 'analytics';

type MissionContextValue = {
  location: string;
  setLocation: (loc: string) => void;
  activeOnly: boolean;
  setActiveOnly: (v: boolean) => void;
  latencyMs: number;
  missionProfile: MissionProfile;
  setMissionProfile: (profile: MissionProfile) => void;
};

const MissionContext = createContext<MissionContextValue | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<string>(LOCATIONS[0]);
  const [activeOnly, setActiveOnlyState] = useState<boolean>(true);
  const [latencyMs, setLatencyMs] = useState(0);
  const [missionProfile, setMissionProfileState] = useState<MissionProfile>('operational');

  // Hydrate from localStorage after mount (avoids SSR/CSR mismatch).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedLoc = window.localStorage.getItem(LOC_KEY);
    if (storedLoc && (LOCATIONS as readonly string[]).includes(storedLoc)) {
      setLocationState(storedLoc);
    }
    const storedFilter = window.localStorage.getItem(FILTER_KEY);
    if (storedFilter !== null) {
      setActiveOnlyState(storedFilter === '1');
    }
    const storedProfile = window.localStorage.getItem(PROFILE_KEY);
    if (storedProfile === 'operational' || storedProfile === 'analytics') {
      setMissionProfileState(storedProfile);
    }
  }, []);

  // Listen for API latency events emitted by the API client.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ latency: number }>).detail;
      setLatencyMs(Math.round(detail.latency));
    };
    window.addEventListener('earthstack:latency', listener);
    return () => window.removeEventListener('earthstack:latency', listener);
  }, []);

  const setLocation = (loc: string) => {
    setLocationState(loc);
    if (typeof window !== 'undefined') window.localStorage.setItem(LOC_KEY, loc);
  };

  const setActiveOnly = (v: boolean) => {
    setActiveOnlyState(v);
    if (typeof window !== 'undefined') window.localStorage.setItem(FILTER_KEY, v ? '1' : '0');
  };

  const setMissionProfile = (profile: MissionProfile) => {
    setMissionProfileState(profile);
    if (typeof window !== 'undefined') window.localStorage.setItem(PROFILE_KEY, profile);
  };

  return (
    <MissionContext.Provider
      value={{
        location,
        setLocation,
        activeOnly,
        setActiveOnly,
        latencyMs,
        missionProfile,
        setMissionProfile,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error('useMission must be used within <MissionProvider>');
  return ctx;
}

export type { Location };
