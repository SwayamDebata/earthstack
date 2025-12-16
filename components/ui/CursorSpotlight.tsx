'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
}

export default function CursorSpotlight() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for the main spotlight
  const springConfig = { damping: 25, stiffness: 150 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Particle System
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleCount = useRef(0);
  const lastParticleTime = useRef(0);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Spawn particles on move (throttled)
      const now = Date.now();
      if (now - lastParticleTime.current > 20) { // Limit spawn rate
        const newParticle = {
          id: particleCount.current++,
          x: e.clientX,
          y: e.clientY,
        };
        
        setParticles(prev => [...prev.slice(-15), newParticle]); // Keep last 15 particles
        lastParticleTime.current = now;
      }
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Main Spotlight Glow */}
      <motion.div
        className="absolute h-[400px] w-[400px] rounded-full bg-primary/20 blur-[100px]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      
      {/* Particle Trail */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, scale: 1, x: particle.x, y: particle.y }}
            animate={{ 
              opacity: 0, 
              scale: 0,
              x: particle.x + (Math.random() - 0.5) * 20, // Slight random drift
              y: particle.y + (Math.random() - 0.5) * 20
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute h-1.5 w-1.5 rounded-full bg-blue-400/50 blur-[1px]"
            style={{
              left: 0,
              top: 0,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
