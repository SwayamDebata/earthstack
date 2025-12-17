'use client';

import { motion } from 'framer-motion';
import { CloudRain, Droplets, AlertTriangle, Wind, Thermometer } from 'lucide-react';

interface ReplayFrameData {
    timestamp: string;
    rainfall: number;
    riverLevel: number;
    riskScore: number;
    temperature: number;
    windSpeed: number;
    primaryEvent?: string; // e.g., "Levy Breach"
}

interface ReplayMetadataProps {
    data: ReplayFrameData;
}

export default function ReplayMetadata({ data }: ReplayMetadataProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-4 rounded-xl space-y-4 min-w-[200px]"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Frame Intelligence</span>
        <span className="font-mono text-sm text-primary">{data.timestamp}</span>
      </div>

      <div className="space-y-3">
        {/* Rainfall */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
                <CloudRain size={16} className="text-blue-400" />
                <span className="text-xs">Rainfall</span>
            </div>
            <span className="text-sm font-bold text-white">{data.rainfall} mm/h</span>
        </div>

        {/* River Level */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
                <Droplets size={16} className="text-cyan-400" />
                <span className="text-xs">River Lvl</span>
            </div>
            <span className="text-sm font-bold text-white">{data.riverLevel} m</span>
        </div>

        {/* Wind Speed */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
                <Wind size={16} className="text-slate-400" />
                <span className="text-xs">Wind</span>
            </div>
            <span className="text-sm font-bold text-white">{data.windSpeed} km/h</span>
        </div>

        {/* Risk Score */}
        <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className={data.riskScore > 7 ? 'text-red-500' : 'text-yellow-500'} />
                    <span className="text-xs text-gray-300">Net Risk Score</span>
                </div>
                <span className={`text-lg font-black ${data.riskScore > 7 ? 'text-red-500' : 'text-yellow-500'}`}>
                    {data.riskScore}/10
                </span>
            </div>
            {data.primaryEvent && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs px-2 py-1 rounded text-center animate-pulse">
                    ⚠ {data.primaryEvent}
                </div>
            )}
        </div>
      </div>
    </motion.div>
  );
}
