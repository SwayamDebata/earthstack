'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import 3D component to avoid SSR issues
const EarthScene = dynamic(() => import('../3d/EarthScene'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] to-[#0F1424]" />,
});

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#080B14]">
      {/* 3D Earth Background */}
      <div className="absolute inset-0 z-0">
        <EarthScene />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-[#080B14]/30 to-[#080B14]" />

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 z-10 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(45, 130, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(45, 130, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Header / Logo */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent-end/20 backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05, borderColor: 'rgba(45, 130, 255, 0.5)' }}
          >
            <span className="text-2xl">🌍</span>
          </motion.div>
          <span className="text-xl font-bold gradient-text group-hover:opacity-80 transition-opacity">EarthStack</span>
        </Link>
        
        <a href="/dashboard">
          <motion.button
            className="hidden md:block rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Launch App
          </motion.button>
        </a>
      </div>

      {/* Content */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center">
        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 backdrop-blur-sm"
        >
          <Sparkles size={16} className="text-primary" />
          <span className="text-sm font-medium text-gray-300">Earth Intelligence Platform</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-6 max-w-5xl text-5xl font-bold leading-tight md:text-7xl lg:text-8xl"
        >
          The Operating System
          <br />
          for a{' '}
          <span className="relative inline-block">
            <span className="gradient-text">Climate-Resilient</span>
            <motion.div
              className="absolute -bottom-2 left-0 h-1 w-full bg-gradient-to-r from-primary to-accent-end"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            />
          </span>
          <br />
          Future
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12 max-w-3xl text-xl text-gray-300 md:text-2xl"
        >
          Get real-time climate intelligence for rainfall, floods, rivers & extreme weather.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          {/* Primary CTA */}
          <a href="/dashboard">
            <motion.button
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent-end px-8 py-4 font-semibold text-white shadow-lg"
              whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(45, 130, 255, 0.6)' }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  translateX: ['100%', '-100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />
              
              {/* Button Content */}
              <span className="relative z-10 flex items-center gap-2">
                Product Demo
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </span>

              {/* Gradient Border */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(90deg, #2D82FF, #22C1EE, #2D82FF)',
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </a>

          {/* Secondary CTA */}
          <motion.button
            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm"
            whileHover={{ scale: 1.03, borderColor: 'rgba(45, 130, 255, 0.5)' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">Learn More</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent-end/20 opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-sm text-gray-400">Scroll to explore</span>
            <div className="h-12 w-6 rounded-full border-2 border-white/20 p-1">
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-primary"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
