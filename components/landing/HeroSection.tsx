'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, Database, ShieldCheck, Globe, Sparkles } from 'lucide-react';
import HoloEarth from './HoloEarth';
import VideoModal from './VideoModal';

// Video sources for random playback
const VIDEO_SOURCES = [
  "/videos/1766052690351.mp4",
  "/videos/1766052873555.mp4",
  "/videos/1766053030926.mp4"
];

export default function HeroSection() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoSrc, setActiveVideoSrc] = useState(VIDEO_SOURCES[0]);

  const handleOpenVideo = () => {
    // Select a random video from the sources
    const randomIndex = Math.floor(Math.random() * VIDEO_SOURCES.length);
    setActiveVideoSrc(VIDEO_SOURCES[randomIndex]);
    setIsVideoModalOpen(true);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      
      <VideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
        videoSrc={activeVideoSrc}
      />

      {/* Navigation Header */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center backdrop-blur-md">
                <Globe className="text-blue-400" size={24} />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
                EarthStack
            </span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Platform</a>
            <a href="#" className="hover:text-white transition-colors">Solutions</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/dashboard" className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all backdrop-blur-md">
                Login
            </Link>
        </div>
      </nav>

      {/* 3D Background */}
      <HoloEarth />

      {/* Hero Content */}
      <div className="container mx-auto px-4 z-10 relative">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          
          {/* Animated Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-green-400 tracking-wider">SYSTEM OPERATIONAL // V.2.4</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tight mb-8"
          >
            <span className="block text-white mb-2 filter drop-shadow-2xl">Planetary Scale</span>
            <span className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 filter drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                  Resilience Intelligence
                </span>
                <motion.div
                    className="absolute -bottom-2 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.0, delay: 0.5, ease: "circOut" }}
                />
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed"
          >
            Predict flood risks, monitor climate anomalies, and coordinate rapid response with the world's most advanced hyperlocal digital twin platform.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/dashboard" className="group relative px-8 py-4 bg-primary rounded-full font-bold text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] hover:scale-105 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 sm:duration-500" />
                <span className="flex items-center gap-2 relative z-10">
                    Launch Dashboard <ArrowRight size={20} />
                </span>
            </Link>
            
            <button 
                onClick={handleOpenVideo}
                className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-gray-300 font-medium group"
            >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Play size={14} fill="currentColor" />
                </div>
                <span>Watch Climate Intel</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Floating Info Cards - Absolute positioned elements for depth */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute left-4 lg:left-8 top-[30%] -translate-y-1/2 hidden xl:block z-20"
      >
        <div className="glass-card p-4 w-64 border-l-4 border-l-blue-500 backdrop-blur-md bg-black/40">
            <div className="flex items-center gap-3 mb-2 text-blue-400">
                <Database size={18} />
                <span className="text-xs font-bold tracking-widest">INGESTING DATA</span>
            </div>
            <div className="space-y-2">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-blue-500" animate={{ width: ["0%", "100%"] }} transition={{ duration: 2, repeat: Infinity }} />
                </div>
                 <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>SENTINEL-2A</span>
                    <span>14.5 GB/s</span>
                </div>
            </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute right-4 lg:right-8 top-[70%] -translate-y-1/2 hidden xl:block z-20"
      >
        <div className="glass-card p-4 w-64 border-r-4 border-r-green-500 text-right backdrop-blur-md bg-black/40">
             <div className="flex items-center justify-end gap-3 mb-2 text-green-400">
                <span className="text-xs font-bold tracking-widest">RISK ANALYSIS</span>
                <ShieldCheck size={18} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">99.9%</div>
            <div className="text-xs text-gray-400">Prediction Accuracy (Last 24h)</div>
        </div>
      </motion.div>

      {/* Bottom fade for smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080B14] to-transparent z-20 pointer-events-none" />
    </section>
  );
}
