'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface TimelineControlProps {
  currentFrame: number;
  totalFrames: number;
  onFrameChange: (frame: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  frameData?: {
    timestamp: string;
    rainfall: number;
    riverLevel: number;
    riskScore: number;
  };
}

export default function TimelineControl({
  currentFrame,
  totalFrames,
  onFrameChange,
  isPlaying,
  onPlayPause,
  frameData,
}: TimelineControlProps) {
  const handleSkip = (seconds: number) => {
    const frameChange = Math.floor(seconds / 5); // Assuming 5s per frame
    const newFrame = Math.max(0, Math.min(totalFrames - 1, currentFrame + frameChange));
    onFrameChange(newFrame);
  };

  const formatTime = (frame: number) => {
    const totalSeconds = frame * 5;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/10"
    >
      <div className="container mx-auto px-6 py-4">
        {/* Timeline Slider */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={totalFrames - 1}
            value={currentFrame}
            onChange={(e) => onFrameChange(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #2D82FF ${(currentFrame / (totalFrames - 1)) * 100}%, rgba(255,255,255,0.1) ${(currentFrame / (totalFrames - 1)) * 100}%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{formatTime(0)}</span>
            <span>{formatTime(currentFrame)}</span>
            <span>{formatTime(totalFrames - 1)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6">
          {/* Playback Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSkip(-5)}
              className="p-3 rounded-md glass-card hover:bg-white/10 transition-all duration-300 border border-white/10"
              title="Back 5s"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>

            <button
              onClick={onPlayPause}
              className="p-4 rounded-md bg-gradient-to-r from-primary to-accent-end hover:shadow-[0_0_20px_rgba(45,130,255,0.5)] transition-all duration-300"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <button
              onClick={() => handleSkip(5)}
              className="p-3 rounded-md glass-card hover:bg-white/10 transition-all duration-300 border border-white/10"
              title="Forward 5s"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
              </svg>
            </button>
          </div>

          {/* Frame Metadata */}
          {frameData && (
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">🕒</span>
                <span className="font-mono text-white">{frameData.timestamp}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">🌧</span>
                <span className="text-white">{frameData.rainfall}mm</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">🌊</span>
                <span className="text-white">{frameData.riverLevel}m</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">⚠️</span>
                <span className={`font-semibold ${
                  frameData.riskScore > 7 ? 'text-red-400' :
                  frameData.riskScore > 4 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  Risk: {frameData.riskScore}/10
                </span>
              </div>
            </div>
          )}

          {/* Frame Counter */}
          <div className="text-sm text-gray-400 font-mono">
            Frame {currentFrame + 1} / {totalFrames}
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #2D82FF;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(45, 130, 255, 0.5);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #2D82FF;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(45, 130, 255, 0.5);
        }
      `}</style>
    </motion.div>
  );
}
