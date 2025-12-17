'use client';

import { motion } from 'framer-motion';
import { X, Sliders, RefreshCw, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface ScenarioBuilderProps {
  onApply: (params: ScenarioParams) => void;
  onClose: () => void;
  isOpen: boolean;
}

export interface ScenarioParams {
  rainfallIntensity: number; // 0-200%
  dischargeDelay: number; // 0-12 hours
  drainageBlockage: number; // 0-100%
}

export default function ScenarioBuilder({ onApply, onClose, isOpen }: ScenarioBuilderProps) {
  const [params, setParams] = useState<ScenarioParams>({
    rainfallIntensity: 100,
    dischargeDelay: 0,
    drainageBlockage: 0,
  });

  const [isSimulating, setIsSimulating] = useState(false);

  const handleApply = () => {
    setIsSimulating(true);
    // Simulate calculation delay
    setTimeout(() => {
        setIsSimulating(false);
        onApply(params);
        onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-[500px] overflow-hidden shadow-2xl rounded-2xl border border-white/10 relative"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
                <Sliders size={20} className="text-secondary" />
                <h2 className="text-xl font-bold text-white">Scenario Simulator</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                <X size={20} />
            </button>
        </div>

        {/* Sliders */}
        <div className="p-8 space-y-8">
            {/* Rainfall Intensity */}
            <div className="space-y-3">
                <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-300">Rainfall Severity</label>
                    <span className="text-sm font-mono text-primary">{params.rainfallIntensity}%</span>
                </div>
                <input 
                    type="range" 
                    min="50" max="200" step="10"
                    value={params.rainfallIntensity}
                    onChange={(e) => setParams({...params, rainfallIntensity: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Dry Season (50%)</span>
                    <span>Extreme Event (200%)</span>
                </div>
            </div>

            {/* River Discharge Delay */}
            <div className="space-y-3">
                <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-300">Upstream Discharge Peak</label>
                    <span className="text-sm font-mono text-primary">+{params.dischargeDelay} hrs</span>
                </div>
                <input 
                    type="range" 
                    min="0" max="24" step="1"
                    value={params.dischargeDelay}
                    onChange={(e) => setParams({...params, dischargeDelay: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                 <div className="flex justify-between text-xs text-gray-500">
                    <span>Baseline</span>
                    <span>+24h Delay</span>
                </div>
            </div>

            {/* Drainage Efficiency (Blockage) */}
            <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-300">Urban Drainage Blockage</label>
                    <span className={`text-sm font-mono font-bold ${params.drainageBlockage > 50 ? 'text-red-400' : 'text-green-400'}`}>
                        {params.drainageBlockage}%
                    </span>
                 </div>
                 <input 
                    type="range" 
                    min="0" max="100" step="5"
                    value={params.drainageBlockage}
                    onChange={(e) => setParams({...params, drainageBlockage: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                 <div className="flex justify-between text-xs text-gray-500">
                    <span>Fully Operational</span>
                    <span>Total Obstruction</span>
                </div>
            </div>

            {/* Warning Message if risk high */}
            {(params.rainfallIntensity > 150 || params.drainageBlockage > 60) && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-200 text-xs">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p>Current parameters indicate a <strong>Catastrophic Failure</strong> scenario exceeding 100-year flood plain models.</p>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-black/20 flex gap-4">
             <button 
                onClick={onClose}
                className="flex-1 py-3 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                disabled={isSimulating}
             >
                Cancel
             </button>
             <button 
                onClick={handleApply}
                disabled={isSimulating}
                className="flex-1 py-3 rounded-lg font-bold bg-primary hover:bg-blue-600 active:scale-95 transition-all text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
             >
                {isSimulating ? (
                    <>
                        <RefreshCw size={18} className="animate-spin" />
                        Generating Model...
                    </>
                ) : (
                    'Run Simulation'
                )}
             </button>
        </div>

      </motion.div>
    </div>
  );
}
