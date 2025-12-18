'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MapContainer from '@/components/MapContainer';
import MetricPanel from '@/components/MetricPanel';
import SatelliteTracker from '@/components/SatelliteTracker';
import ForecastPanel from '@/components/ForecastPanel';
import { motion } from 'framer-motion';

export default function ClimateObservePage() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mock/weather')
      .then((res) => res.json())
      .then((data) => {
        setWeatherData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error);
        setLoading(false);
      });
  }, []);

  const metrics = weatherData
    ? [
        {
          label: 'Temperature',
          value: `${weatherData.temperature}`,
          unit: '°C',
          icon: '🌡',
          trend: 'up' as const,
          change: '+2.3°C',
        },
        {
          label: 'Humidity',
          value: `${weatherData.humidity}`,
          unit: '%',
          icon: '💧',
          trend: 'stable' as const,
          change: '0%',
        },
        {
          label: 'Rainfall',
          value: `${weatherData.rainfall.current}`,
          unit: 'mm',
          icon: '🌧',
          trend: 'up' as const,
          change: '+5.2mm',
        },
        {
          label: 'Wind Speed',
          value: `${weatherData.wind.speed}`,
          unit: 'km/h',
          icon: '💨',
          trend: 'down' as const,
          change: '-2.1 km/h',
        },
      ]
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 relative">
          {/* Map Container - Full Screen Background */}
          <div className="absolute inset-0 z-0">
            <MapContainer
              className="w-full h-full"
              layers={{ rainfall: true, riverLevels: true, floodZones: false, clouds: false }}
            />
          </div>

          {/* Overlay Content */}
          <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col">
            {/* Main Grid Layout */}
            <div className="flex-1 grid grid-cols-12 gap-6">
              {/* Left - Map Area & Header */}
              <div className="col-span-9 relative">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 pointer-events-auto inline-block"
                >
                  <h2 className="text-xl font-bold gradient-text mb-1">Climate Observe</h2>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Live Environmental Monitoring</p>
                </motion.div>
              </div>

              {/* Right Panel - Metrics */}
              <div className="col-span-3 space-y-4 pointer-events-auto max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-6 custom-scrollbar">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4" 
                >
                  {loading ? (
                    <div className="glass-card p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-white/10 rounded w-1/2" />
                        <div className="h-8 bg-white/10 rounded w-full" />
                        <div className="h-4 bg-white/10 rounded w-3/4" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <MetricPanel metrics={metrics} />
                      
                      <div className="grid grid-cols-1 gap-4">
                        <ForecastPanel />
                        <SatelliteTracker />
                      </div>

                      {/* Detailed Stats Card */}
                      <div className="glass-card p-4 space-y-3">
                        <h3 className="font-semibold text-white text-sm uppercase tracking-wide border-b border-white/10 pb-2">
                          Atmospheric Conditions
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Pressure</span>
                            <span className="text-white font-mono">{weatherData?.pressure} hPa</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Visibility</span>
                            <span className="text-white font-mono">{weatherData?.visibility} km</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Wind Dir</span>
                            <span className="text-white font-mono">{weatherData?.wind.direction}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">24h Rain</span>
                            <span className="text-white font-mono text-blue-400">{weatherData?.rainfall.last24h} mm</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
