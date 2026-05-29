'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { Film, MapPin } from 'lucide-react';
import { api } from '@/lib/api/endpoints';
import { isAlertOpen } from '@/lib/api/alerts';
import { POLLING_INTERVALS, withJitter } from '@/lib/config';
import {
  buildSituation,
  buildDrivers,
  buildRecommendedActions,
  historicalEvidenceLine,
} from '@/lib/operational/narrative';
import { useMission } from '@/components/dashboard/MissionContext';
import RegionChips from '@/components/dashboard/RegionChips';
import RiskMapPanel from '@/components/dashboard/RiskMapPanel';
import SituationSummaryCard from '@/components/dashboard/operational/SituationSummaryCard';
import ExplainabilityPanel from '@/components/dashboard/operational/ExplainabilityPanel';
import ActionRecommendations from '@/components/dashboard/operational/ActionRecommendations';
import LiveIncidentFeed from '@/components/dashboard/operational/LiveIncidentFeed';
import { ErrorBlock } from '@/components/dashboard/Atoms';
import { toArray } from '@/components/dashboard/util';

/**
 * Operational Intelligence Mode - Incident Command Center (Sprint 1).
 * Decision layer: Situation → Impact → Action → Evidence → Escalation → Coordination.
 * Does not replace analytics views; uses same live APIs with human-centered hierarchy.
 */
export default function OpsCommandView() {
  const { location, activeOnly } = useMission();

  const [risk, riskMap, alerts] = useQueries({
    queries: [
      {
        queryKey: ['risk', location],
        queryFn: () => api.risk(location),
        refetchInterval: () => withJitter(POLLING_INTERVALS.risk),
      },
      {
        queryKey: ['risk-map'],
        queryFn: () => api.riskMap(),
        refetchInterval: () => withJitter(POLLING_INTERVALS.map),
      },
      {
        queryKey: ['alerts', activeOnly],
        queryFn: () => api.alerts(activeOnly, 20),
        refetchInterval: () => withJitter(POLLING_INTERVALS.alerts),
      },
    ],
  });

  const riskData = (risk.data ?? {}) as Record<string, unknown>;
  const alertsList = toArray<Record<string, unknown>>(alerts.data);
  const activeAlerts = alertsList.filter((a) => isAlertOpen(a)).length;
  const riskMapList = toArray<Record<string, unknown>>(riskMap.data);

  const situation = useMemo(
    () => (risk.isSuccess ? buildSituation(riskData, location) : null),
    [risk.isSuccess, riskData, location],
  );
  const drivers = useMemo(
    () => (risk.isSuccess ? buildDrivers(riskData) : []),
    [risk.isSuccess, riskData],
  );
  const actions = useMemo(
    () => (risk.isSuccess ? buildRecommendedActions(riskData, location, activeAlerts) : []),
    [risk.isSuccess, riskData, location, activeAlerts],
  );
  const evidenceLine = risk.isSuccess ? historicalEvidenceLine(riskData) : null;

  return (
    <div className="space-y-4 p-3 md:p-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-emerald-400/90">
            Operational Intelligence
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Active Incident Command Center
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Decision support for district operations · clarity over telemetry · all metrics from live APIs
          </p>
        </div>
        <RegionChips />
      </header>

      {risk.isError ? (
        <ErrorBlock message="risk assessment unavailable" onRetry={() => void risk.refetch()} />
      ) : risk.isLoading || !situation ? (
        <div className="h-32 animate-pulse rounded-lg border border-white/5 bg-slate-950/40" />
      ) : (
        <SituationSummaryCard situation={situation} />
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-5">
          {risk.isSuccess ? (
            <>
              <ActionRecommendations actions={actions} />
              <ExplainabilityPanel drivers={drivers} evidenceLine={evidenceLine} />
              <Link
                href="/dashboard/ops/replay"
                className="group flex items-center justify-between rounded-md border border-cyan-400/25 bg-cyan-500/5 px-4 py-3 transition hover:border-cyan-400/45 hover:bg-cyan-500/10"
              >
                <div className="flex items-center gap-3">
                  <Film size={18} className="text-cyan-300" />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-300">
                      Historical replay evidence
                    </p>
                    <p className="text-sm text-slate-300">
                      T−72h to flood onset · verified IndoFloods simulation
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-200 group-hover:underline">
                  Open replay →
                </span>
              </Link>
            </>
          ) : null}
          <LiveIncidentFeed alerts={alertsList} isLoading={alerts.isLoading} />
        </div>

        <div className="xl:col-span-7">
          <section className="rounded-md border border-cyan-400/15 bg-[#060b18]/95 p-1">
            <div className="flex items-center gap-2 border-b border-cyan-400/10 px-3 py-2">
              <MapPin size={14} className="text-cyan-300" />
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200">
                Impact · Operational map theatre
              </p>
              <span className="ml-auto font-mono text-[10px] text-slate-500">
                {riskMapList.length} regions tracked
              </span>
            </div>
            <div className="h-[min(52vh,520px)] min-h-[320px]">
              <RiskMapPanel
                rows={riskMapList}
                activeLocation={location}
                isLoading={riskMap.isLoading}
                isError={riskMap.isError}
                onRetry={() => void riskMap.refetch()}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
