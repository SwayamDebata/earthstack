'use client';

import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, BrainCircuit } from 'lucide-react';
import { useState } from 'react';

interface Factor {
  label: string;
  value: number; // 0-100
  color: string;
}

interface AgentReasoningProps {
  explanation: string;
  factors: Factor[];
  triggerTimeline?: string[];
}

export default function AgentReasoning({ explanation, factors, triggerTimeline }: AgentReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="w-full space-y-3">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mt-4 text-xs font-medium text-gray-400 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <BrainCircuit size={14} className="text-secondary" />
          <span>AGENT REASONING</span>
        </div>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isExpanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          {/* Explanation Text */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-gray-300 leading-relaxed font-light">
            {explanation}
          </div>

          {/* Influence Factors */}
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-2">PRIMARY SIGNAL CONTRIBUTORS</p>
            {factors.map((factor, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">{factor.label}</span>
                  <span className="text-white font-mono">{factor.value}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.value}%` }}
                    transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                    className={`h-full ${factor.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Optional simplified timeline/trigger list could go here */}
          {triggerTimeline && triggerTimeline.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/10">
               <p className="text-xs text-slate-500 mb-2">TRIGGER SEQUENCE</p>
               <div className="pl-2 border-l border-slate-700 space-y-2">
                  {triggerTimeline.map((event, i) => (
                    <div key={i} className="text-xs text-gray-400 relative">
                       <span className="absolute -left-[13px] top-1 w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                       {event}
                    </div>
                  ))}
               </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
