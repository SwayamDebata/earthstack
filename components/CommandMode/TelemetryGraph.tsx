'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function TelemetryGraph() {
  const [dataPoints, setDataPoints] = useState<number[]>(Array(20).fill(50));

  useEffect(() => {
    const interval = setInterval(() => {
        setDataPoints(prev => {
            const last = prev[prev.length - 1];
            // Random walk tailored to look like sensor data
            const change = (Math.random() - 0.5) * 20; 
            let next = last + change;
            // Clamp
            if (next > 90) next = 90;
            if (next < 10) next = 10;
            
            const newData = [...prev.slice(1), next];
            return newData;
        });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const points = dataPoints.map((val, i) => {
    const x = (i / (dataPoints.length - 1)) * 100;
    const y = 100 - val;
    return `${x},${y}`;
  }).join(' ');

  const fillPath = `0,100 ${points} 100,100`;

  return (
    <div className="w-full h-full bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h3 className="text-xs font-mono text-gray-400 tracking-wider">RIVER DISCHARGE RATE (m³/s)</h3>
                <div className="text-2xl font-bold font-mono text-white flex items-end gap-2">
                    {Math.round(dataPoints[dataPoints.length - 1] * 12.5)} 
                    <span className="text-xs text-green-400 mb-1">▲ +2.4%</span>
                </div>
            </div>
            <div className="flex gap-1">
                {[1,2,3].map(i => (
                    <div key={i} className="w-1 h-1 bg-green-500 rounded-full animate-ping" style={{ animationDelay: `${i * 200}ms` }} />
                ))}
            </div>
        </div>

        <div className="flex-1 relative w-full overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2" />
                
                {/* Area Fill */}
                <motion.polygon 
                    points={fillPath}
                    fill="url(#gradient)"
                    className="opacity-20"
                />
                
                {/* Line */}
                <motion.polyline 
                    points={points}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    </div>
  );
}
