'use client';

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import MapContainer from '@/components/MapContainer';

export default function LaptopDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Simple 3D Rotation based on scroll
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [20, 0, -20]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="min-h-screen flex items-center justify-center py-24 perspective-1000">
      <div className="relative w-full max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold gradient-text mb-6"
          >
            Mission Control for Earth
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Real-time environmental intelligence at your fingertips. 
            Monitor floods, track storms, and predict risks with military-grade precision.
          </motion.p>
        </div>

        {/* 3D Laptop Frame */}
        <motion.div
          style={{ 
            rotateX,
            scale,
            opacity,
            transformStyle: 'preserve-3d',
          }}
          className="relative mx-auto w-full max-w-4xl aspect-[16/10]"
        >
          {/* Laptop Lid (Screen) */}
          <div className="absolute inset-0 bg-[#1a1a1a] rounded-t-2xl p-2 shadow-2xl border border-white/10">
            {/* Bezel */}
            <div className="absolute inset-0 bg-black rounded-t-xl border-[4px] border-[#2a2a2a] overflow-hidden">
              {/* Camera Dot */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#333] rounded-full z-20" />
              
              {/* Screen Content (Map) */}
              <div className="w-full h-full relative bg-[#0F1424]">
                <MapContainer 
                  className="w-full h-full"
                  aggressiveResize={true}
                  layers={{
                    rainfall: true,
                    riverLevels: true,
                    floodZones: true,
                    clouds: true
                  }}
                />
                
                {/* UI Overlay Mockup */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
              </div>
            </div>
          </div>

          {/* Laptop Base (Keyboard area - simplified for perspective) */}
          <div 
            className="absolute -bottom-4 left-[-5%] right-[-5%] h-4 bg-[#2a2a2a] rounded-b-xl transform-gpu origin-top"
            style={{ transform: 'rotateX(-90deg)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
          </div>

          {/* Reflection/Glow below */}
          <div className="absolute -bottom-20 left-10 right-10 h-20 bg-primary/20 blur-3xl rounded-[100%]" />
        </motion.div>
      </div>
    </section>
  );
}
