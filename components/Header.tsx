'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import BrandMark from '@/components/landing/BrandMark';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="h-16 border-b border-white/10 glass-card flex items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-3 group">
        <motion.div
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-sm"
          whileHover={{ scale: 1.05, borderColor: 'rgba(45, 130, 255, 0.5)' }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <BrandMark size={36} className="h-8 w-8 object-contain" />
        </motion.div>
        <h1 className="text-xl font-bold gradient-text group-hover:opacity-80 transition-opacity">
          ModelEarth
        </h1>
      </Link>
      
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-400 hidden md:block">
          Climate Intelligence Platform
        </div>
        <motion.div
          className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent-end flex items-center justify-center cursor-pointer border border-white/20"
          whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(45, 130, 255, 0.6)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <User size={20} className="text-white" strokeWidth={2} />
        </motion.div>
      </div>
    </header>
  );
}
