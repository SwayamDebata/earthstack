'use client';

import { motion } from 'framer-motion';

interface RiskCardProps {
  riskLevel: 'Low' | 'Medium' | 'High';
  confidence: number;
  location?: string;
}

export default function RiskCard({ riskLevel, confidence, location }: RiskCardProps) {
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'Low':
        return 'from-green-500 to-emerald-500';
      case 'Medium':
        return 'from-yellow-500 to-orange-500';
      case 'High':
        return 'from-red-500 to-rose-600';
    }
  };

  const getRiskBgColor = () => {
    switch (riskLevel) {
      case 'Low':
        return 'bg-green-500/10 border-green-500/30';
      case 'Medium':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'High':
        return 'bg-red-500/10 border-red-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-300">Flood Risk Assessment</h3>
        {location && (
          <span className="text-sm text-gray-400">📍 {location}</span>
        )}
      </div>

      {/* Risk Level Badge */}
      <div className="flex items-center gap-4">
        <div className={`px-6 py-3 rounded-2xl border ${getRiskBgColor()}`}>
          <span className={`text-2xl font-bold bg-gradient-to-r ${getRiskColor()} bg-clip-text text-transparent`}>
            {riskLevel} Risk
          </span>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Confidence Score</span>
          <span className="font-semibold text-white">{confidence}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${getRiskColor()} rounded-full`}
          />
        </div>
      </div>

      {/* Risk Score */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
        <div className="space-y-1">
          <p className="text-xs text-gray-400">Risk Score</p>
          <p className="text-2xl font-bold gradient-text">
            {riskLevel === 'High' ? '8.5' : riskLevel === 'Medium' ? '5.2' : '2.1'}/10
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-gray-400">Probability</p>
          <p className="text-2xl font-bold gradient-text">
            {riskLevel === 'High' ? '75%' : riskLevel === 'Medium' ? '45%' : '15%'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
