'use client';

import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, FastForward } from 'lucide-react';
import { useEffect } from 'react';

export interface TimelineEvent {
  frame: number;
  label: string;
  type: 'critical' | 'warning' | 'info';
}

interface TimelineControlProps {
  currentFrame: number;
  totalFrames: number;
  onFrameChange: (frame: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  gameSpeed: number; // 1, 2, 5
  setGameSpeed: (speed: number) => void;
  events?: TimelineEvent[]; // Array of events to mark on timeline
  startTime: string; // e.g. "06:00"
  endTime: string;   // e.g. "18:00"
}

export default function TimelineControl({
  currentFrame,
  totalFrames,
  onFrameChange,
  isPlaying,
  onPlayPause,
  gameSpeed,
  setGameSpeed,
  events = [],
  startTime,
  endTime
}: TimelineControlProps) {
  
  const handleSkip = (frames: number) => {
    const newFrame = Math.max(0, Math.min(totalFrames - 1, currentFrame + frames));
    onFrameChange(newFrame);
  };

  const calculateProgress = () => (currentFrame / (totalFrames - 1)) * 100;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            e.preventDefault();
            onPlayPause();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-white/10 px-6 py-4 bg-[#0B0F19]/90 backdrop-blur-xl"
    >
      <div className="container mx-auto max-w-6xl flex flex-col gap-4">
        
        {/* Top Row: Time & Controls */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button 
                onClick={onPlayPause}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-primary hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                {isPlaying ? <Pause fill="white" size={20} /> : <Play fill="white" size={20} className="ml-1" />}
              </button>
              
              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                 <button onClick={() => handleSkip(-10)} className="p-2 hover:bg-white/10 rounded transition-colors"><SkipBack size={16} /></button>
                 <button onClick={() => handleSkip(10)} className="p-2 hover:bg-white/10 rounded transition-colors"><SkipForward size={16} /></button>
              </div>

              <div className="h-8 w-px bg-white/10 mx-2" />

              {/* Speed Control */}
              <div className="flex gap-2 text-xs font-mono">
                {[1, 2, 5, 10].map(speed => (
                    <button
                        key={speed}
                        onClick={() => setGameSpeed(speed)}
                        className={`px-3 py-1 rounded border transition-all ${
                            gameSpeed === speed 
                            ? 'bg-white text-black border-white' 
                            : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'
                        }`}
                    >
                        {speed}x
                    </button>
                ))}
              </div>
           </div>

           <div className="text-right">
              <div className="text-2xl font-mono font-bold tracking-tight text-white">{startTime} <span className="text-xs text-gray-500 font-sans align-middle ml-2">CURRENT SIMULATION TIME</span></div>
           </div>
        </div>

        {/* Bottom Row: Scrubber */}
        <div className="relative h-8 flex items-center group">
           {/* Track Background with Risk Bands (Simulated as gradient for now, can be passed as prop) */}
           <div className="absolute inset-x-0 h-2 bg-white/10 rounded-full overflow-hidden">
                {/* Risk Bands Simulation: Safe -> Warning -> Safe -> Critical */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-yellow-500/20 to-red-500/20 opacity-50" />
                
                {/* Progress Fill */}
                <div 
                    className="absolute top-0 left-0 h-full bg-primary origin-left transition-transform duration-100 ease-linear"
                    style={{ width: `${calculateProgress()}%` }}
                />
           </div>

           {/* Event Markers */}
           {events.map((event, idx) => (
               <div 
                 key={idx}
                 className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/50 hover:bg-white hover:h-6 transition-all cursor-help group/marker z-10"
                 style={{ left: `${(event.frame / totalFrames) * 100}%` }}
               >
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 rounded text-[10px] whitespace-nowrap opacity-0 group-hover/marker:opacity-100 pointer-events-none border border-white/20">
                       {event.label}
                   </div>
                   {/* Icon at bottom */}
                   <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-2 h-2 rounded-full ${
                       event.type === 'critical' ? 'bg-red-500 shadow-red-500/50' : 
                       event.type === 'warning' ? 'bg-orange-500 shadow-orange-500/50' : 'bg-blue-400'
                   } shadow-[0_0_8px_currentColor]`} />
               </div>
           ))}

           {/* Thumb (Invisible native input on top) */}
           <input
             type="range"
             min="0"
             max={totalFrames - 1}
             value={currentFrame}
             onChange={(e) => onFrameChange(parseInt(e.target.value))}
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
           />
           
           {/* Visual Thumb */}
           <div 
             className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] pointer-events-none z-10 transition-all duration-75 ease-linear group-hover:scale-125"
             style={{ left: `${calculateProgress()}%`, transform: `translate(-50%, -50%) scale(${isPlaying ? 1 : 1})` }}
           >
                <div className="absolute inset-0 bg-primary rounded-full opacity-20 animate-ping" />
           </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 font-mono -mt-2">
            <span>{startTime}</span>
            <span>{endTime}</span>
        </div>

      </div>
    </motion.div>
  );
}
