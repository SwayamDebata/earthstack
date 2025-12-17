'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Activity, CheckCircle2 } from 'lucide-react';
import AgentReasoning from './AgentReasoning';

interface DecisionPanelProps {
  isVisible: boolean;
  onClose?: () => void;
  onInitiate?: () => void;
  // Data props
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScore: number; // 0-100
  confidence: number; // 0-100
  timeToImpact: string;
  decisionTitle: string;
  explanation: string;
  contributingFactors: Array<{ label: string; value: number; color: string }>;
}

export default function DecisionPanel({
  isVisible,
  riskLevel,
  riskScore,
  confidence,
  timeToImpact,
  decisionTitle,
  explanation,
  contributingFactors,
  onInitiate
}: DecisionPanelProps) {

  // Styling helpers
  const getRiskColor = () => {
    switch (riskLevel) {
      case 'Critical': return { text: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/50', gradient: 'from-red-600 to-rose-600' };
      case 'High': return { text: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500/50', gradient: 'from-orange-500 to-amber-600' };
      case 'Medium': return { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', gradient: 'from-yellow-400 to-orange-400' };
      default: return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', gradient: 'from-emerald-400 to-teal-500' };
    }
  };

  const style = getRiskColor();

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="absolute top-[280px] right-6 bottom-24 w-96 glass-card border-none overflow-hidden flex flex-col shadow-2xl z-40 rounded-xl"
    >
        {/* Header Ribbon */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${style.gradient} shrink-0`} />
        
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
            {/* Top Risk Badge & Score */}
            <div className="flex justify-between items-start mb-6">
                <div>
                   <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${style.border} ${style.bg} mb-2`}>
                      <AlertTriangle size={14} className={style.text} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>{riskLevel} RISK DETECTED</span>
                   </div>
                   <h2 className="text-2xl font-bold text-white tracking-tight">{decisionTitle}</h2>
                </div>
                
                <div className="flex flex-col items-end">
                    <span className="text-4xl font-black bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                        {riskScore}
                    </span>
                    <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Risk Score</span>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Activity size={14} />
                        <span className="text-xs font-medium">CONFIDENCE</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white">{confidence}%</span>
                        <span className="text-xs text-gray-500">AI Certainty</span>
                    </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Clock size={14} />
                        <span className="text-xs font-medium">IMPACT TIME</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white">{timeToImpact}</span>
                        <span className="text-xs text-gray-500">Est. Arrival</span>
                    </div>
                </div>
            </div>

            {/* Primary Action Button */}
            <button 
                onClick={onInitiate}
                className={`w-full py-3.5 rounded-lg bg-gradient-to-r ${style.gradient} hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-orange-900/20 group relative overflow-hidden mb-2`}
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <div className="relative flex items-center justify-center gap-2 font-bold text-white">
                    <span>INITIATE RESPONSE PROTOCOLS</span>
                    <CheckCircle2 size={18} />
                </div>
            </button>
            <p className="text-center text-[10px] text-gray-400 mb-5">
                Authorizes automatic notification distribution to affected regions.
            </p>

            {/* Divider */}
            <div className="h-px w-full bg-white/10 my-4" />

            {/* Agent Reasoning Section */}
            <AgentReasoning 
                explanation={explanation}
                factors={contributingFactors}
                triggerTimeline={['Satellite anomaly detected (T-4h)', 'River gauge overflow (T-2h)', 'Predictive model threshold breached (Now)']}
            />
        </div>
    </motion.div>
  );
}
