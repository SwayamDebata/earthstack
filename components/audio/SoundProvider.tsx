'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { readSoundEnabled, writeSoundEnabled } from '@/lib/access/sound';
import * as soundscape from '@/lib/audio/soundscape';

type SoundContextValue = {
  enabled: boolean;
  hydrated: boolean;
  toggle: () => void;
  setEnabled: (next: boolean) => void;
  playReplayTick: () => void;
  playReplayAlert: () => void;
  playUiConfirm: () => void;
  startAmbient: () => void;
  stopAmbient: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

export function useSound() {
  const value = useContext(SoundContext);
  if (!value) throw new Error('useSound must be used within SoundProvider');
  return value;
}

export function useSoundOptional() {
  return useContext(SoundContext);
}

export default function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEnabledState(readSoundEnabled());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeSoundEnabled(enabled);
    if (!enabled) soundscape.stopAmbient();
  }, [enabled, hydrated]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) soundscape.pauseAmbientForHiddenTab();
      else soundscape.resumeAmbientForVisibleTab();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
  }, []);

  const toggle = useCallback(() => {
    setEnabledState((prev) => {
      const next = !prev;
      if (next) {
        void soundscape.enableWithFeedback();
      } else {
        soundscape.stopAmbient();
      }
      return next;
    });
  }, []);

  const playReplayTick = useCallback(() => {
    if (!enabled) return;
    void soundscape.playReplayTick();
  }, [enabled]);

  const playReplayAlert = useCallback(() => {
    if (!enabled) return;
    void soundscape.playReplayAlert();
  }, [enabled]);

  const playUiConfirm = useCallback(() => {
    if (!enabled) return;
    void soundscape.playUiConfirm();
  }, [enabled]);

  const startAmbient = useCallback(() => {
    if (!enabled) return;
    void soundscape.startAmbient();
  }, [enabled]);

  const stopAmbient = useCallback(() => {
    soundscape.stopAmbient();
  }, []);

  const value = useMemo(
    () => ({
      enabled,
      hydrated,
      toggle,
      setEnabled,
      playReplayTick,
      playReplayAlert,
      playUiConfirm,
      startAmbient,
      stopAmbient,
    }),
    [
      enabled,
      hydrated,
      toggle,
      setEnabled,
      playReplayTick,
      playReplayAlert,
      playUiConfirm,
      startAmbient,
      stopAmbient,
    ],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
