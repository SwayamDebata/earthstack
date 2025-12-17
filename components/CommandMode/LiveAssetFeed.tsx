'use client';

import { motion } from 'framer-motion';
import { Battery, Signal, Target, Maximize2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LiveAssetFeed() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate connection sequence
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full bg-black border border-white/10 rounded-xl overflow-hidden relative group">
        {/* Viewport content */}
        <div className="absolute inset-0 bg-gray-900">
            {/* Simulated Video Feed Background */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity grayscale" />
            
            {/* Scanlines Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-10" />
            
            {/* Interference/Glitch Animation */}
            <motion.div 
                className="absolute inset-0 bg-white/5"
                animate={{ opacity: [0, 0.1, 0, 0.05, 0] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
            />
        </div>

        {/* HUD Overlay */}
        <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between font-mono text-[10px] tracking-widest text-green-400/80">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded border border-red-500/50 flex items-center gap-2 animate-pulse">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        LIVE
                    </div>
                    <span>CAM-04 [N. SECTOR]</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Signal size={12} />
                        <span>5G UW</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Battery size={12} />
                        <span>84%</span>
                    </div>
                </div>
            </div>

            {/* Center Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                <Target size={48} strokeWidth={1} className="text-white/50" />
            </div>

            {/* Bottom Bar */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div>ALT: 1450 FT</div>
                    <div>SPD: 24 KNOTS</div>
                    <div>HDG: 345° N</div>
                </div>
                <div>
                   <span className="text-green-400">UPLINK STABLE (12ms)</span>
                </div>
            </div>
        </div>

        {/* Loading State Overlay */}
        {loading && (
            <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono text-xs text-green-500">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <span>ESTABLISHING SECURE LINK</span>
                </div>
                <div className="text-gray-500 text-[10px]">ENCRYPTING FEED // 256-BIT</div>
            </div>
        )}
    </div>
  );
}
