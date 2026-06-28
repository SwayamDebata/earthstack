export const SOUND_ENABLED_KEY = 'modelearth:sound-enabled';

export function readSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(SOUND_ENABLED_KEY) === '1';
}

export function writeSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SOUND_ENABLED_KEY, enabled ? '1' : '0');
}
