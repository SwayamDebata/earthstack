export const UI_MODE_KEY = 'modelearth:ui-mode';

/** Command = cinematic HUD (default). Standard = familiar govt / ops desk UI. */
export type UiMode = 'command' | 'standard';

export function readUiMode(): UiMode {
  if (typeof window === 'undefined') return 'standard';
  const raw = window.localStorage.getItem(UI_MODE_KEY);
  return raw === 'command' ? 'command' : 'standard';
}

export function writeUiMode(mode: UiMode): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(UI_MODE_KEY, mode);
}
