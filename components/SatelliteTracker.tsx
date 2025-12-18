'use client';

import { motion } from 'framer-motion';
import { Satellite, Globe, Zap, Radio } from 'lucide-react';

export default function SatelliteTracker() {
  return (
    <div className="glass-card p-4 space-y-4">
        <h3 className="font-semibold text-white text-sm uppercase tracking-wide border-b border-white/10 pb-2 flex justify-between items-center">
            <span>Satellites Overhead</span>
            <span className="text-[10px] bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">3 ACTIVE</span>
        </h3>
        
        <div className="space-y-3">
            {[
                { name: 'SENTINEL-2A', type: 'Optical', az: '142°', el: '45°', signal: 92 },
                { name: 'LANDSAT-9', type: 'Multispectral', az: '284°', el: '72°', signal: 88 },
                { name: 'JASON-3', type: 'Altimetry', az: '012°', el: '33°', signal: 65 },
            ].map((sat, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:border-blue-400/50 transition-colors">
                        <Satellite size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-bold text-gray-200">{sat.name}</span>
                            <span className="text-[10px] font-mono text-green-400 bg-green-500/10 px-1 rounded">{sat.signal}%</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500">
                             <span className="flex items-center gap-1"><Radio size={8} /> {sat.type}</span>
                             <span>AZ:{sat.az} EL:{sat.el}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        <div className="h-32 rounded-lg bg-black/40 border border-white/10 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-20">
                 {/* Simplified Grid */}
                 <svg className="w-full h-full" width="100%" height="100%">
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                 </svg>
            </div>
            {/* Orbits */}
            <motion.div 
                className="absolute w-40 h-40 border border-dashed border-white/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            />
            <motion.div 
                className="absolute w-28 h-28 border border-white/10 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, ease: "linear", repeat: Infinity }}
            />
             <Globe size={24} className="text-blue-500/80 relative z-10" />
             
             {/* Sat Markers */}
             <motion.div 
                className="absolute top-1/2 left-1/2 w-40 h-1 bg-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, ease: "linear", repeat: Infinity }}
             >
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_blue]" />
             </motion.div>
        </div>
    </div>
  );
}
