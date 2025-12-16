'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
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
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  return (
    <section ref={containerRef} className="relative py-32 px-6 bg-gradient-to-b from-[#080B14] to-[#0B0F19]">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mb-20 text-center"
      >
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Next-Generation <span className="gradient-text">Climate Intelligence</span>
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Three powerful platforms working in harmony to protect communities and infrastructure
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
            <div className="relative h-full rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-xl overflow-hidden">
              {/* Gradient Background on Hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Neon Edge Glow */}
              <motion.div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, ${platform.iconColor.replace('text-', 'rgb(var(--color-')})}, transparent)`,
                  filter: 'blur(20px)',
                }}
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

                {/* Floating Animation */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.3,
                  }}
                  className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent-end/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
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
