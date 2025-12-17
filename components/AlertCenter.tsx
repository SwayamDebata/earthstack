'use client';

import { motion } from 'framer-motion';
import GovtAlertCard from './GovtAlertCard';
import CitizenAlertCard from './CitizenAlertCard';
import { ArrowRight } from 'lucide-react';

export default function AlertCenter() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl mx-auto p-8 w-full">
        {/* Left: The Government View (Input) */}
        <div className="relative w-full max-w-md">
             <div className="absolute -top-10 left-0 text-xs font-mono text-gray-500 mb-2 tracking-widest">SENDER VIEW (ADMIN)</div>
             <GovtAlertCard 
                title="Immediate Evacuation Order"
                region="Mahanadi Delta: Sector 4"
                populationAffected="42,500"
                severity="Critical"
             />
        </div>

        {/* Center: Connection Visual (Desktop only) */}
        <div className="hidden lg:flex flex-col items-center justify-center text-gray-700 space-y-2 shrink-0">
             <div className="text-[10px] font-mono tracking-widest opacity-50">LATENCY: 12ms</div>
             <ArrowRight size={32} strokeWidth={1.5} className="animate-pulse text-primary/50" />
             <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* Right: The Citizen View (Output) */}
        <div className="relative flex justify-center w-full max-w-md">
             <div className="absolute -top-10 left-0 lg:left-8 text-xs font-mono text-gray-500 mb-2 tracking-widest">RECIPIENT VIEW (CITIZEN)</div>
             <CitizenAlertCard 
                title="Flood Warning Level 4"
                message="Critical water levels detected in your sector. Evacuation shelters open at Sector 4 School. Proceed immediately."
                timeSent="Now"
                recipients="Sector 4 residents"
             />
        </div>
    </div>
  );
}
