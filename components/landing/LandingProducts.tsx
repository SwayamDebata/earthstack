'use client';

import Link from 'next/link';
import { ArrowUpRight, MapPinned, Shield, Thermometer } from 'lucide-react';

/**
 * Product lines stay separate: Flood Ops (alerting), Heat Ops (shadow),
 * North Odisha flood (shadow validation - never alerted).
 */
const products = [
  {
    href: '/dashboard/ops',
    icon: Shield,
    name: 'Flood Ops',
    status: 'Live',
    statusClass: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
    blurb: 'War Room briefing and evidence for five alerting cities. River honesty when gauges are live; rainfall-only when they are not.',
    cta: 'Open Flood Ops',
  },
  {
    href: '/dashboard/heat',
    icon: Thermometer,
    name: 'Heat Ops',
    status: 'Shadow',
    statusClass: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
    blurb: 'Odisha heat field and city scores. Advisory only. Does not replace IMD heat warnings.',
    cta: 'Open Heat Ops',
  },
  {
    href: '/dashboard/shadow',
    icon: MapPinned,
    name: 'North Odisha',
    status: 'Shadow',
    statusClass: 'border-slate-400/35 bg-white/5 text-slate-200',
    blurb: 'Baitarani · Brahmani · Budhabalanga. Scored and published with DoWR gauges, never alerted. Validation, not product alerts.',
    cta: 'Open shadow surface',
  },
] as const;

export default function LandingProducts() {
  return (
    <section
      id="products"
      className="relative scroll-mt-24 border-y border-white/[0.06] bg-[#050816] px-4 py-16 md:px-8 md:py-20"
      aria-label="ModelEarth products"
    >
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-medium tracking-wide text-slate-500">Products</p>
        <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-white md:text-3xl">
          One engine. Separate surfaces for each decision.
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
          Alerting stays on five flood cities. Heat and north Odisha are published as shadow,
          scored for trust, never mixed into the alert map.
        </p>

        <ul className="mt-8 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {products.map((p) => {
            const Icon = p.icon;
            return (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="group flex flex-col gap-3 py-5 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-1"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-slate-300 group-hover:border-white/20 group-hover:text-white">
                      <Icon size={16} strokeWidth={1.6} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-white">{p.name}</span>
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${p.statusClass}`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-400">{p.blurb}</p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-slate-300 group-hover:text-white sm:pr-1">
                    {p.cta}
                    <ArrowUpRight size={14} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
