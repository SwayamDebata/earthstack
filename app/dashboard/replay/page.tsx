'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MapContainer from '@/components/MapContainer';
import TimelineControl from '@/components/TimelineControl';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReplayModePage() {
  const [replayData, setReplayData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch('/api/mock/replay')
      .then((res) => res.json())
      .then((data) => {
        setReplayData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching replay data:', error);
        setLoading(false);
      });
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !replayData) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= replayData.frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000); // 1 second per frame

    return () => clearInterval(interval);
  }, [isPlaying, replayData]);

  const handleFrameChange = useCallback((frame: number) => {
    setCurrentFrame(frame);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const currentFrameData = replayData?.frames[currentFrame];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-gray-400">Loading replay data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Full Map Canvas */}
              <div className="absolute inset-0">
                <MapContainer
                  className="w-full h-full"
                  layers={{ rainfall: true, riverLevels: true, floodZones: true, clouds: false }}
                  replayFrame={currentFrameData}
                />
              </div>

              {/* Frame Metadata Panel - Top Right */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFrame}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-6 right-6 z-10 w-80"
                >
                  <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold gradient-text">Replay Mode</h3>
                      <span className="text-xs text-gray-400 font-mono">
                        {isPlaying ? '▶ PLAYING' : '⏸ PAUSED'}
                      </span>
                    </div>

                    {currentFrameData && (
                      <>
                        {/* Timestamp */}
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400">Timestamp</p>
                          <p className="text-lg font-mono text-white">
                            {new Date(currentFrameData.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-400">🌧 Rainfall</p>
                            <p className="text-xl font-bold text-white">
                              {currentFrameData.rainfall.toFixed(1)} mm
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-400">🌊 River Level</p>
                            <p className="text-xl font-bold text-white">
                              {currentFrameData.riverLevel.toFixed(1)} m
                            </p>
                          </div>
                        </div>

                        {/* Risk Score */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400">⚠️ Risk Score</p>
                            <p className={`text-2xl font-bold ${
                              currentFrameData.riskScore > 7 ? 'text-red-400' :
                              currentFrameData.riskScore > 4 ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {currentFrameData.riskScore.toFixed(1)}/10
                            </p>
                          </div>
                          
                          {/* Risk Progress Bar */}
                          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(currentFrameData.riskScore / 10) * 100}%` }}
                              transition={{ duration: 0.5 }}
                              className={`h-full rounded-full ${
                                currentFrameData.riskScore > 7 ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                                currentFrameData.riskScore > 4 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                'bg-gradient-to-r from-green-500 to-emerald-500'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Data Points */}
                        <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Data Points</span>
                            <span className="text-white">{currentFrameData.rainfallLayer?.length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Frame ID</span>
                            <span className="text-white font-mono">#{currentFrameData.frameId}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Timeline Control - Bottom */}
              {replayData && currentFrameData && (
                <TimelineControl
                  currentFrame={currentFrame}
                  totalFrames={replayData.frames.length}
                  onFrameChange={handleFrameChange}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  frameData={{
                    timestamp: new Date(currentFrameData.timestamp).toLocaleTimeString(),
                    rainfall: currentFrameData.rainfall,
                    riverLevel: currentFrameData.riverLevel,
                    riskScore: currentFrameData.riskScore,
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
