'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MapContainer from '@/components/MapContainer';
import TimelineControl, { TimelineEvent } from '@/components/TimelineControl';
import ReplayMetadata from '@/components/ReplayMetadata';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReplayModePage() {
  const [replayData, setReplayData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1);

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

  // Auto-play functionality with speed
  useEffect(() => {
    if (!isPlaying || !replayData) return;

    const intervalTime = 1000 / gameSpeed;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= replayData.frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, replayData, gameSpeed]);

  const handleFrameChange = useCallback((frame: number) => {
    setCurrentFrame(frame);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const currentFrameData = replayData?.frames[currentFrame];

  // Mock Events
  const mockEvents: TimelineEvent[] = [
      { frame: 12, label: 'Heavy Rainfall Onset', type: 'info' },
      { frame: 28, label: 'River Surge', type: 'warning' },
      { frame: 45, label: 'CRITICAL BREACH', type: 'critical' },
  ];

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
              <div className="absolute top-6 right-6 z-10 w-72">
                 {currentFrameData && (
                    <ReplayMetadata data={{
                        timestamp: new Date(currentFrameData.timestamp).toLocaleString(),
                        rainfall: Number(currentFrameData.rainfall.toFixed(1)),
                        riverLevel: Number(currentFrameData.riverLevel.toFixed(1)),
                        riskScore: Number(currentFrameData.riskScore.toFixed(1)),
                        temperature: 28, // Mock
                        windSpeed: 45, // Mock
                        primaryEvent: currentFrame === 45 ? 'LEVEE FAILURE' : undefined
                    }} />
                 )}
              </div>

              {/* Timeline Control - Bottom */}
              {replayData && currentFrameData && (
                <TimelineControl
                  currentFrame={currentFrame}
                  totalFrames={replayData.frames.length}
                  onFrameChange={handleFrameChange}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  gameSpeed={gameSpeed}
                  setGameSpeed={setGameSpeed}
                  events={mockEvents}
                  startTime="06:00"
                  endTime="18:00"
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
