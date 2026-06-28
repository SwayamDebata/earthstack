'use client';

import { motion } from 'framer-motion';

const rows = [
  { k: 'Architecture', v: 'API-first · widget-isolated degradation' },
  { k: 'Surface', v: 'Operational command + verified historical replay' },
  { k: 'Geospatial', v: 'District-aware risk maps and basin context' },
  { k: 'Trust', v: 'Explicit empty / loading / retry. No toy metrics' },
];

export default function LandingSpecMatrix() {
  return (
    <section className="relative bg-[#050816] px-4 py-20 md:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] [background-size:28px_28px]" />

      <div className="relative mx-auto max-w-3xl rounded-2xl border border-white/10 bg-slate-950/80 p-1 shadow-[0_0_0_1px_rgba(34,211,238,0.06),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-950/95 px-6 py-8 md:px-10 md:py-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.35em] text-cyan-400/80">Spec matrix</p>
            <ul className="space-y-0 divide-y divide-white/10">
              {rows.map((row, i) => (
                <motion.li
                  key={row.k}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
                >
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{row.k}</span>
                  <span className="text-sm text-slate-200 sm:text-right">{row.v}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
