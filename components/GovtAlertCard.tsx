'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, Send, Users, Radio, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface GovtAlertProps {
  title: string;
  region: string;
  populationAffected: string;
  severity: 'Critical' | 'High' | 'Moderate';
  onSend?: () => void;
}

export default function GovtAlertCard({ title, region, populationAffected, severity, onSend }: GovtAlertProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSend = () => {
    setStatus('sending');
    setTimeout(() => {
        setStatus('sent');
        if (onSend) onSend();
    }, 2000);
  };

  return (
    <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card w-full max-w-md border border-red-500/30 overflow-hidden"
    >
        {/* Header */}
        <div className="bg-red-950/30 p-4 border-b border-red-500/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <ShieldAlert className="text-red-500" />
                <span className="font-bold text-red-100 tracking-wider text-sm">GOVERNMENT BROADCAST SYSTEM</span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-red-400 font-mono">LIVE UPLINK</span>
            </div>
        </div>

        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-400">Target Region: <span className="text-white">{region}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Users size={14} />
                        <span className="text-xs">AFFECTED POPULATION</span>
                    </div>
                    <p className="text-lg font-mono font-bold text-white">{populationAffected}</p>
                </div>
                 <div className="bg-white/5 p-3 rounded border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Radio size={14} />
                        <span className="text-xs">CHANNELS</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                       <span className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/30">SMS</span>
                       <span className="bg-green-500/20 text-green-300 text-[10px] px-1.5 py-0.5 rounded border border-green-500/30">WA</span>
                       <span className="bg-yellow-500/20 text-yellow-300 text-[10px] px-1.5 py-0.5 rounded border border-yellow-500/30">CAP</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-200 leading-relaxed font-mono">
                    "SEVERE FLOOD WARNING ISSUED FOR YOUR AREA. EVACUATE TO HIGHER GROUND IMMEDIATELY. DO NOT CROSS FLOWING WATER."
                </div>

                <button 
                  onClick={handleSend}
                  disabled={status !== 'idle'}
                  className={`w-full py-4 rounded font-bold flex items-center justify-center gap-2 transition-all ${
                      status === 'sent' 
                        ? 'bg-green-600 hover:bg-green-600 cursor-default' 
                        : 'bg-red-600 hover:bg-red-700 active:scale-[0.98]'
                  }`}
                >
                   {status === 'idle' && (
                       <>
                         <Send size={18} />
                         BROADCAST ALERT NOW
                       </>
                   )}
                   {status === 'sending' && (
                       <>
                         <Radio className="animate-spin" size={18} />
                         TRANSMITTING...
                       </>
                   )}
                   {status === 'sent' && (
                       <>
                         <CheckCircle size={18} />
                         BROADCAST CONFIRMED
                       </>
                   )}
                </button>
            </div>
        </div>
    </motion.div>
  );
}
