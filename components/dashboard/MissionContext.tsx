'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { LOCATIONS, type Location } from '@/lib/config';
import {
  readPilotAccess,
  WELCOME_SEEN_KEY,
  type AccessTier,
} from '@/lib/access/pilot';
import { readUiMode, writeUiMode, type UiMode } from '@/lib/access/ui-mode';

const LOC_KEY = 'modelearth:location';
const FILTER_KEY = 'modelearth:active-only';
const PROFILE_KEY = 'modelearth:mission-profile';

export type MissionProfile = 'operational' | 'analytics';

type MissionContextValue = {
  location: string;
  setLocation: (loc: string) => void;
  activeOnly: boolean;
  setActiveOnly: (v: boolean) => void;
  latencyMs: number;
  missionProfile: MissionProfile;
  setMissionProfile: (profile: MissionProfile) => void;
  accessTier: AccessTier;
  hasPilotAccess: boolean;
  refreshPilotAccess: () => void;
  pilotRequestOpen: boolean;
  pilotRequestReason: string | null;
  openPilotRequest: (reason?: string) => void;
  closePilotRequest: () => void;
  welcomeOpen: boolean;
  dismissWelcome: () => void;
  uiMode: UiMode;
  setUiMode: (mode: UiMode) => void;
};

const MissionContext = createContext<MissionContextValue | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<string>(LOCATIONS[0]);
  const [activeOnly, setActiveOnlyState] = useState<boolean>(true);
  const [latencyMs, setLatencyMs] = useState(0);
  const [missionProfile, setMissionProfileState] = useState<MissionProfile>('operational');
  const [hasPilotAccess, setHasPilotAccess] = useState(false);
  const [pilotRequestOpen, setPilotRequestOpen] = useState(false);
  const [pilotRequestReason, setPilotRequestReason] = useState<string | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [uiMode, setUiModeState] = useState<UiMode>('standard');
  const [hydrated, setHydrated] = useState(false);

  const refreshPilotAccess = useCallback(() => {
    setHasPilotAccess(readPilotAccess());
  }, []);

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
    setHasPilotAccess(readPilotAccess());
    setUiModeState(readUiMode());
    setWelcomeOpen(window.localStorage.getItem(WELCOME_SEEN_KEY) !== '1');
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!hasPilotAccess && missionProfile === 'analytics') {
      setMissionProfileState('operational');
      if (typeof window !== 'undefined') window.localStorage.setItem(PROFILE_KEY, 'operational');
    }
  }, [hasPilotAccess, missionProfile, hydrated]);

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

  const openPilotRequest = useCallback((reason?: string) => {
    setPilotRequestReason(reason ?? null);
    setPilotRequestOpen(true);
  }, []);

  const closePilotRequest = useCallback(() => {
    setPilotRequestOpen(false);
    setPilotRequestReason(null);
  }, []);

  const dismissWelcome = useCallback(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(WELCOME_SEEN_KEY, '1');
    setWelcomeOpen(false);
  }, []);

  const setUiMode = useCallback((mode: UiMode) => {
    setUiModeState(mode);
    writeUiMode(mode);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-ui-mode', uiMode);
  }, [uiMode, hydrated]);

  const accessTier: AccessTier = hasPilotAccess ? 'pilot' : 'preview';

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
        accessTier,
        hasPilotAccess,
        refreshPilotAccess,
        pilotRequestOpen,
        pilotRequestReason,
        openPilotRequest,
        closePilotRequest,
        welcomeOpen,
        dismissWelcome,
        uiMode,
        setUiMode,
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
