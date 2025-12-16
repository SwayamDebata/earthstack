'use client';

import { motion } from 'framer-motion';
import { 
  Cloud, 
  Droplets, 
  Waves, 
  Flame, 
  Film, 
  Settings, 
  LayoutDashboard,
  Satellite,
  BarChart3,
  Globe as GlobeIcon
} from 'lucide-react';

interface AnimatedIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export default function AnimatedIcon({ icon, size = 24, className = '' }: AnimatedIconProps) {
  const iconMap: Record<string, any> = {
    cloud: Cloud,
    droplets: Droplets,
    waves: Waves,
    flame: Flame,
    film: Film,
    settings: Settings,
    dashboard: LayoutDashboard,
    satellite: Satellite,
    chart: BarChart3,
    globe: GlobeIcon,
  };

  const Icon = iconMap[icon] || GlobeIcon;

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent-end/20 rounded-lg blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <Icon 
        size={size} 
        className="relative z-10 drop-shadow-[0_0_8px_rgba(45,130,255,0.6)]" 
        strokeWidth={1.5}
      />
    </motion.div>
  );
}

// Rotating Globe Component
export function RotatingGlobe({ size = 40 }: { size?: number }) {
  return (
    <motion.div
      className="relative"
      animate={{
        rotateY: [0, 360],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div
        className="relative"
        whileHover={{ scale: 1.15 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary to-accent-end rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <GlobeIcon 
          size={size} 
          className="relative z-10 text-primary drop-shadow-[0_0_15px_rgba(45,130,255,0.8)]" 
          strokeWidth={1.5}
        />
      </motion.div>
    </motion.div>
  );
}

// Pulsing Icon Component
export function PulsingIcon({ icon, size = 24 }: { icon: string; size?: number }) {
  const iconMap: Record<string, any> = {
    cloud: Cloud,
    droplets: Droplets,
    waves: Waves,
    flame: Flame,
    film: Film,
    settings: Settings,
    dashboard: LayoutDashboard,
    satellite: Satellite,
    chart: BarChart3,
  };

  const Icon = iconMap[icon] || GlobeIcon;

  return (
    <motion.div
      className="relative"
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <motion.div
        className="absolute -inset-2 bg-gradient-to-br from-primary/30 to-accent-end/30 rounded-xl blur-lg"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <Icon 
        size={size} 
        className="relative z-10 text-white drop-shadow-[0_0_10px_rgba(45,130,255,0.7)]" 
        strokeWidth={1.5}
      />
    </motion.div>
  );
}
