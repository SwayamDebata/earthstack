'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MapContainer from '@/components/MapContainer';
import LayerToggle from '@/components/LayerToggle';
import { motion, AnimatePresence } from 'framer-motion';
import DecisionPanel from '@/components/DecisionPanel';
import AlertCenter from '@/components/AlertCenter';
import LiveAssetFeed from '@/components/CommandMode/LiveAssetFeed';
import TelemetryGraph from '@/components/CommandMode/TelemetryGraph';
import { MonitorPlay, LayoutGrid } from 'lucide-react';

export default function DashboardPage() {
  const [activeLayers, setActiveLayers] = useState({
    rainfall: true,
    riverLevels: true,
    floodZones: false,
    clouds: false,
  });

  const [isAlertCenterOpen, setIsAlertCenterOpen] = useState(false);
  const [isCommandMode, setIsCommandMode] = useState(false);

  const handleLayerToggle = (layer: string) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer as keyof typeof prev],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      
      {/* Command Mode Toggle - Floated in Header area ideally, but for now absolute top center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <button
            onClick={() => setIsCommandMode(!isCommandMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                isCommandMode 
                ? 'bg-primary text-white border-primary shadow-[0_0_20px_rgba(37,99,235,0.5)]' 
                : 'bg-black/50 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
        >
            {isCommandMode ? <LayoutGrid size={16} /> : <MonitorPlay size={16} />}
            <span className="text-xs font-bold tracking-wider">{isCommandMode ? 'EXIT COMMAND GRID' : 'COMMAND MODE'}</span>
        </button>
      </div>

      {/* Alert Center Modal */}
      <AnimatePresence>
        {isAlertCenterOpen && (
            <div className="fixed inset-0 z-[100] bg-[#050505]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4">
                {/* Header for Simulation Mode */}
                <div className="absolute top-0 left-0 right-0 h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-mono text-sm tracking-widest text-red-500">LIVE SIMULATION ENVIRONMENT</span>
                    </div>
                    
                    <button 
                        onClick={() => setIsAlertCenterOpen(false)}
                        className="flex items-center gap-2 group text-gray-500 hover:text-white transition-colors"
                    >
                        <span className="text-xs font-mono tracking-widest group-hover:underline decoration-white/30 underline-offset-4">EXIT SIMULATION</span>
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                            <span className="text-lg leading-none">&times;</span>
                        </div>
                    </button>
                </div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full h-full flex items-center justify-center pt-16" 
                >
                    <AlertCenter />
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 relative bg-black p-0 transition-all duration-500 ease-in-out">
            
            {/* Grid Container */}
            <div className={`w-full h-full grid gap-4 transition-all duration-500 ${isCommandMode ? 'grid-cols-3 grid-rows-2 p-4' : 'grid-cols-1 grid-rows-1'}`}>
                
                {/* Map Panel (Quadrant 1 - Main) */}
                <div className={`relative rounded-xl overflow-hidden border border-white/10 ${isCommandMode ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}`}>
                     <MapContainer key="dashboard-map" className="w-full h-full" layers={activeLayers} />
                     
                     {/* Map Controls (Only visible on map) */}
                     <div className="absolute top-6 right-6 z-10">
                        <LayerToggle
                        layers={[
                            { id: 'rainfall', label: 'Rainfall', icon: '🌧', enabled: activeLayers.rainfall },
                            { id: 'riverLevels', label: 'River Levels', icon: '🌊', enabled: activeLayers.riverLevels },
                            { id: 'floodZones', label: 'Flood Zones', icon: '⚠️', enabled: activeLayers.floodZones },
                            { id: 'clouds', label: 'Satellite Clouds', icon: '☁️', enabled: activeLayers.clouds },
                        ]}
                        onToggle={handleLayerToggle}
                        />
                    </div>
                </div>

                {/* Right Column Panels (Only visible in Command Mode) */}
                {isCommandMode && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="col-span-1 row-span-1"
                    >
                        <LiveAssetFeed />
                    </motion.div>
                )}

                {isCommandMode && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="col-span-1 row-span-1"
                    >
                        <TelemetryGraph />
                    </motion.div>
                )}

            </div>

            {/* Decision Intelligence Panel (Mock Trigger when Flood Zones are active) */}
            {/* We adjust visibility based on Command Mode to avoid clutter, or maybe keep it overlaid on Map */}
            <div className={`${isCommandMode ? 'absolute bottom-6 left-6 z-30' : ''}`}> 
                <DecisionPanel 
                    isVisible={activeLayers.floodZones && !isAlertCenterOpen && !isCommandMode} // Hide in grid mode for now to keep grid clean, or move it
                    onInitiate={() => setIsAlertCenterOpen(true)}
                    riskLevel="Critical"
                    riskScore={94}
                    confidence={89}
                    timeToImpact="2h 15m"
                    decisionTitle="Breach Eminent: Mahanadi Sector 4"
                    explanation="Multiple signal convergence indicates a 94% probability of levy breach within 3 hours. Satellite imagery confirms rapid water accumulation exceeding 10-year historical maximums."
                    contributingFactors={[
                        { label: 'River Gauge Levels', value: 92, color: 'bg-red-500' },
                        { label: 'Soil Saturation', value: 85, color: 'bg-orange-500' },
                        { label: 'Upstream Rainfall', value: 78, color: 'bg-yellow-400' },
                        { label: 'Terrain Slope Analysis', value: 45, color: 'bg-emerald-500' },
                    ]}
                />
            </div>

          {/* Footer Timestamp Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 left-0 right-0 glass-card border-t border-white/10 px-6 py-3 z-10"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Last Updated:</span>
                <span className="font-mono text-white">
                  {new Date().toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400">Live Data</span>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
