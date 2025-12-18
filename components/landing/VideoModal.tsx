'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Signal, Disc } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc?: string; // Optional custom source, otherwise defaults
}

export default function VideoModal({ isOpen, onClose, videoSrc = "https://cdn.coverr.co/videos/coverr-storm-clouds-timelapse-5364/1080p.mp4" }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
                {/* Backdrop / Overlay */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                />

                {/* Modal Container */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] group"
                >
                    {/* Header / HUD */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 rounded bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-mono tracking-widest animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                LIVE FEED
                            </div>
                            <div className="text-xs font-mono text-gray-400">
                                SOURCE: SAT-VEO-3 // ORBIT: LEO-9
                            </div>
                        </div>
                        
                        <button 
                            onClick={onClose}
                            className="pointer-events-auto bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors group-hover:scale-110 active:scale-95"
                        >
                            <X className="text-white" size={24} />
                        </button>
                    </div>

                    {/* Video Player */}
                    <div className="absolute inset-0 z-10 bg-gray-900">
                        <video 
                            ref={videoRef}
                            className="w-full h-full object-cover opacity-80"
                            autoPlay 
                            loop 
                            muted
                            playsInline
                            src={videoSrc}
                        />
                        {/* Scanlines Overlay for "Satellite" look */}
                        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Scan_lines_pattern.png/20px-Scan_lines_pattern.png')] opacity-10 pointer-events-none mix-blend-overlay" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Bottom HUD */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex justify-between items-end pointer-events-none">
                        <div>
                             <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Climate Impact: Sector 7</h2>
                             <p className="text-gray-400 max-w-lg text-sm leading-relaxed">
                                AI-generated simulation of projected flood risks in coastal urban zones. 
                                EarthStack models predict a 45% increase in surge events by 2030.
                             </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 text-xs font-mono text-white/50">
                            <div className="flex items-center gap-2">
                                <Signal size={14} />
                                <span>BITRATE: 450 MBPS</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <Disc size={14} className="animate-spin duration-[3s]" />
                                <span>RECORDING...</span>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        )}
    </AnimatePresence>
  );
}
