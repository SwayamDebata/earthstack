'use client';

import { useEffect, useState } from 'react';

/**
 * Returns a boolean[] of length `count`. Each entry flips from `false` to
 * `true` after `idx * stepMs` ms. Use it to stagger expensive parallel
 * `useQueries` so they don't all hit the upstream DB on the same tick.
 *
 *   const enabled = useStagger(LOCATIONS.length, 250);
 *   useQueries({ queries: LOCATIONS.map((loc, i) => ({
 *     queryKey: ['risk', loc],
 *     queryFn: () => api.risk(loc),
 *     enabled: enabled[i],
 *   })) });
 *
 * Once enabled the queries refetch normally on their interval.
 */
export function useStagger(count: number, stepMs = 250): boolean[] {
  const [enabled, setEnabled] = useState<boolean[]>(() =>
    Array.from({ length: count }, (_, i) => i === 0),
  );

  useEffect(() => {
    if (count <= 1) {
      setEnabled([true]);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    setEnabled(Array.from({ length: count }, (_, i) => i === 0));
    for (let i = 1; i < count; i += 1) {
      timers.push(
        setTimeout(() => {
          setEnabled((prev) => {
            const next = prev.slice();
            next[i] = true;
            return next;
          });
        }, i * stepMs),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [count, stepMs]);

  return enabled;
}
