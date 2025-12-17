'use client';

import { MapPin, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Region {
  id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  zoom: number;
}

interface RegionSwitcherProps {
  currentRegion: Region;
  onRegionChange: (region: Region) => void;
}

const AVAILABLE_REGIONS: Region[] = [
  { id: 'odisha', name: 'Odisha, India', coordinates: [85.0985, 20.9517], zoom: 7 },
  { id: 'assam', name: 'Assam, India', coordinates: [92.9376, 26.2006], zoom: 7 },
  { id: 'netherlands', name: 'Rotterdam, NL', coordinates: [4.4777, 51.9225], zoom: 11 },
  { id: 'california', name: 'Napa Valley, CA', coordinates: [-122.2869, 38.2975], zoom: 10 },
];

export default function RegionSwitcher({ currentRegion, onRegionChange }: RegionSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-20">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 glass-card rounded-lg hover:bg-white/10 transition-colors group min-w-[200px]"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
            <MapPin size={18} />
        </div>
        <div className="flex flex-col items-start mr-2">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Monitoring Region</span>
            <span className="text-sm font-bold text-white leading-none">{currentRegion.name}</span>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ml-auto ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
            <>
                {/* Backdrop to close */}
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                
                {/* Dropdown Menu */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full text-left left-0 mt-2 w-full min-w-[240px] glass-card border border-white/10 rounded-xl overflow-hidden z-20 py-2 shadow-2xl"
                >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Select Region</div>
                    {AVAILABLE_REGIONS.map((region) => (
                        <button
                            key={region.id}
                            onClick={() => {
                                onRegionChange(region);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors ${
                                currentRegion.id === region.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                            }`}
                        >
                            <span className={`text-sm ${currentRegion.id === region.id ? 'text-white font-bold' : 'text-gray-300'}`}>
                                {region.name}
                            </span>
                            {currentRegion.id === region.id && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-blue-500/50" />}
                        </button>
                    ))}
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  );
}
