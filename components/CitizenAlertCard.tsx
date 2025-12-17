'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Smartphone, CheckCheck } from 'lucide-react';

interface AlertProps {
  title: string;
  message: string;
  timeSent: string;
  recipients: string; // e.g., "All residents in Block A, B"
}

export default function CitizenAlertCard({ title, message, timeSent, recipients }: AlertProps) {
  return (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm bg-black border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative"
    >
        {/* Mobile Status Bar Simulation */}
        <div className="h-6 w-full flex justify-between items-center px-4 pt-2">
            <span className="text-[10px] text-gray-400">12:41</span>
            <div className="flex gap-1">
                <div className="w-3 h-3 bg-gray-600 rounded-full" />
                <div className="w-3 h-3 bg-gray-600 rounded-full" />
            </div>
        </div>

        {/* Floating Alert Notification */}
        <div className="p-4 pt-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
                <div className="flex items-start gap-3">
                    <div className="bg-red-500 rounded-lg p-2 shrink-0">
                        <AlertCircle className="text-white" size={20} />
                    </div>
                    <div>
                        <div className="flex justify-between items-start w-full">
                            <h4 className="font-semibold text-white text-sm">EMERGENCY ALERT</h4>
                            <span className="text-[10px] text-gray-400">now</span>
                        </div>
                        <p className="text-white font-bold text-sm mt-1">{title}</p>
                        <p className="text-gray-300 text-xs mt-1 leading-snug">{message}</p>
                    </div>
                </div>
            </div>
            
            {/* Phone Context Background Elements */}
            <div className="mt-8 space-y-4 opacity-30 blur-[1px] pointer-events-none select-none">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-blue-500" />
                     <div className="space-y-2">
                         <div className="h-2 w-24 bg-gray-700 rounded" />
                         <div className="h-2 w-32 bg-gray-600 rounded" />
                     </div>
                 </div>
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-green-500" />
                     <div className="space-y-2">
                         <div className="h-2 w-20 bg-gray-700 rounded" />
                         <div className="h-2 w-40 bg-gray-600 rounded" />
                     </div>
                 </div>
            </div>
        </div>

        {/* Navigation Bar simulation */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white/20 rounded-full" />
    </motion.div>
  );
}
