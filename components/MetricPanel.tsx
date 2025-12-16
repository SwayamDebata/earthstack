'use client';

import { motion } from 'framer-motion';

interface Metric {
  label: string;
  value: string;
  unit: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
}

interface MetricPanelProps {
  metrics: Metric[];
}

export default function MetricPanel({ metrics }: MetricPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-4 rounded-2xl w-full z-10"
    >
      <h3 className="text-sm font-semibold mb-3 text-gray-300">Live Metrics</h3>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{metric.icon}</span>
                <span className="text-xs text-gray-400">{metric.label}</span>
              </div>
              {metric.trend && (
                <span className={`text-xs ${
                  metric.trend === 'up' ? 'text-red-400' : 
                  metric.trend === 'down' ? 'text-green-400' : 
                  'text-gray-400'
                }`}>
                  {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold gradient-text">{metric.value}</span>
              <span className="text-sm text-gray-500">{metric.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </motion.div>
  );
}
