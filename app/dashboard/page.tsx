'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MapContainer from '@/components/MapContainer';
import LayerToggle from '@/components/LayerToggle';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [activeLayers, setActiveLayers] = useState({
    rainfall: true,
    riverLevels: true,
    floodZones: false,
    clouds: false,
  });

  const handleLayerToggle = (layer: string) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer as keyof typeof prev],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 relative">
          {/* Map Container */}
          <div className="absolute inset-0">
            <MapContainer key="dashboard-map" className="w-full h-full" layers={activeLayers} />
          </div>

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
