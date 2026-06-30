import type { UiMode } from '@/lib/access/ui-mode';

export function isStandardMode(mode: UiMode) {
  return mode === 'standard';
}

/** Panel chrome: white card in standard, HUD in command. */
export function panelShell(mode: UiMode, command: string, standard: string) {
  return isStandardMode(mode) ? standard : command;
}

export const opsCopy = {
  command: {
    opsEyebrow: 'Operational Intelligence',
    opsTitle: 'Active Incident Command Center',
    opsSubtitle: 'Decision support for district operations · clarity over telemetry · all metrics from live APIs',
    mapTitle: 'Impact · Operational map theatre',
    situationLabel: 'Situation · What is happening?',
    actionLabel: 'Action · What should be done?',
    evidenceLabel: 'Evidence · Why does the system believe this?',
    replayLinkTitle: 'Historical replay evidence',
    replayLinkSub: 'T-72h to flood onset · verified historical simulation',
    profileLabel: 'Mission profile',
    profileOps: 'Operational Intelligence',
    profileAnalytics: 'Analytics & Telemetry',
    tickerLabel: 'TELEMETRY',
  },
  standard: {
    opsEyebrow: 'District operations',
    opsTitle: 'Flood situation dashboard',
    opsSubtitle: 'Live rainfall, river levels, and recommended actions for your district.',
    mapTitle: 'District risk map',
    situationLabel: 'Current situation',
    actionLabel: 'Recommended actions',
    evidenceLabel: 'Supporting indicators',
    replayLinkTitle: 'Historical early warning proof',
    replayLinkSub: 'See when the system would have alerted before past floods',
    profileLabel: 'View',
    profileOps: 'Operations',
    profileAnalytics: 'Analytics',
    tickerLabel: 'Status',
  },
} as const;

export function opsText(mode: UiMode, key: keyof typeof opsCopy.command) {
  return isStandardMode(mode) ? opsCopy.standard[key] : opsCopy.command[key];
}
