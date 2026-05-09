'use client';

import { motion } from 'framer-motion';
import { Cloud, Flame, Film } from 'lucide-react';
import { useRef } from 'react';

const platforms = [
  {
    icon: Cloud,
    title: 'ClimateObserve',
    subtitle: 'Live Rainfall & River Intelligence',
    description: 'Real-time monitoring of precipitation patterns, river levels, and water flow dynamics across regions.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Flame,
    title: 'FloodPredict',
    subtitle: 'AI-Powered Flood Risk Forecast',
    description: 'Advanced machine learning models predict flood risks with confidence scoring and early warning systems.',
    gradient: 'from-orange-500/20 to-red-500/20',
    iconColor: 'text-orange-400',
  },
  {
    icon: Film,
    title: 'Replay Mode',
    subtitle: 'Time-travel through weather events',
    description: 'Historical climate data visualization with interactive timeline and event playback capabilities.',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
];

export default function PlatformCards() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="platforms" ref={containerRef} className="relative scroll-mt-24 bg-gradient-to-b from-[#080B14] to-[#0B0F19] px-6 py-32">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mb-20 text-center"
      >
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.35em] text-cyan-400/80">ModelEarth stack</p>
        <h2 className="mb-6 text-5xl font-bold md:text-6xl">
          Next-gen <span className="gradient-text">climate intelligence</span>
        </h2>
        <p className="mx-auto max-w-2xl text-xl text-gray-400">
          Three composable surfaces. Observe, predict, and replay, orchestrated for real operations.
        </p>
      </motion.div>

      {/* Platform Cards */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {platforms.map((platform, index) => (
          <motion.div
            key={platform.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            whileHover={{ y: -12, scale: 1.02 }}
            className="group relative"
          >
            {/* Card */}
            <div className="relative h-full rounded-3xl border border-white/10 bg-slate-900/60 p-8 overflow-hidden">
              {/* Gradient Background on Hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  className="mb-6 inline-block"
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${platform.gradient} border border-white/10`}>
                    <platform.icon size={32} className={platform.iconColor} strokeWidth={1.5} />
                  </div>
                </motion.div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-2 group-hover:gradient-text transition-all">
                  {platform.title}
                </h3>

                {/* Subtitle */}
                <p className="text-sm text-primary mb-4 font-medium">
                  {platform.subtitle}
                </p>

                {/* Description */}
                <p className="text-gray-400 leading-relaxed">
                  {platform.description}
                </p>

                <div className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-accent-end/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 to-accent-end/20 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
