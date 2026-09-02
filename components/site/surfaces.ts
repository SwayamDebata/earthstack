/* ==========================================================================
   The operational surfaces.

   These are the running product, not marketing pages, and every one of them
   already exists under /dashboard. They are defined here once so the footer,
   the closing CTA and the product pages all point at the same places.

   Why this file exists at all: the site argues that you should not take our
   word for anything and should replay a real flood yourself. That argument
   only works if the replay is one click away. Before this, every surface sat
   behind a single generic "Mission Control" link.
   ========================================================================== */

export type Surface = { label: string; href: string; note: string };

export const SURFACES: Surface[] = [
  {
    label: 'Mission Control',
    href: '/dashboard',
    note: 'the operational entry point',
  },
  {
    label: 'War Room',
    href: '/dashboard/ops',
    note: 'today, for the five alerting cities',
  },
  {
    // the tour parameter is what production used: it opens the replay walked
    // through rather than cold
    label: 'Replay proof',
    href: '/dashboard/ops/replay?tour=1',
    note: 'rewind a real flood and watch when it would have fired',
  },
  {
    label: 'Benchmark',
    href: '/dashboard/benchmark',
    note: 'scored against the labelled record',
  },
  {
    label: 'North Odisha',
    href: '/dashboard/shadow',
    note: 'shadow, scored and published, never alerted',
  },
  {
    label: 'Heat field',
    href: '/dashboard/heat',
    note: 'shadow, advisory only',
  },
];

/** the two that carry the argument, used for buttons */
export const REPLAY_TOUR = SURFACES.find((s) => s.label === 'Replay proof')!.href;
export const WAR_ROOM = SURFACES.find((s) => s.label === 'War Room')!.href;
