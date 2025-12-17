'use client';

import { motion } from 'framer-motion';

interface Layer {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
}

interface LayerToggleProps {
  layers: Layer[];
  onToggle: (layerId: string) => void;
}

export default function LayerToggle({ layers, onToggle }: LayerToggleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-4 rounded-2xl w-64 z-10"
    >
      <h3 className="text-sm font-semibold mb-3 text-gray-300">Map Layers</h3>
      <div className="space-y-2">
        {layers.map((layer) => (
          <button
            key={layer.id}
            onClick={() => onToggle(layer.id)}
            className={`
              w-full flex items-center justify-between px-3 py-2 rounded-lg
              transition-all duration-300
              ${layer.enabled 
                ? 'bg-gradient-to-r from-primary/30 to-accent-end/30 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{layer.icon}</span>
              <span className="text-sm font-medium">{layer.label}</span>
            </div>
            <div className={`
              w-10 h-5 rounded-full transition-colors duration-300 relative
              ${layer.enabled ? 'bg-primary' : 'bg-gray-600'}
            `}>
              <div className={`
                absolute top-0.5 w-4 h-4 rounded-full bg-white
                transition-transform duration-300
                ${layer.enabled ? 'translate-x-5' : 'translate-x-0.5'}
              `} />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
