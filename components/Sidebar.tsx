'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Cloud, Flame, Film, Settings, Activity } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Cloud, label: 'ClimateObserve', href: '/dashboard/climate' },
  { icon: Flame, label: 'FloodPredict', href: '/dashboard/predict' },
  { icon: Film, label: 'Replay Mode', href: '/dashboard/replay' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 glass-card flex flex-col rounded-none border-l-0 border-y-0">
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex items-center gap-3 px-4 py-3 rounded-md
                transition-all duration-300 group overflow-hidden
                ${isActive 
                  ? 'bg-gradient-to-r from-primary/20 to-accent-end/20 text-white' 
                  : 'hover:bg-white/5 text-gray-400 hover:text-white'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent-end/20 rounded-md"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <motion.div
                className="relative z-10"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <motion.div
                  className={`p-1.5 rounded-sm ${isActive ? 'bg-primary/20' : 'bg-white/5 group-hover:bg-white/10'}`}
                  animate={isActive ? {
                    boxShadow: ['0 0 0px rgba(45, 130, 255, 0)', '0 0 15px rgba(45, 130, 255, 0.6)', '0 0 0px rgba(45, 130, 255, 0)'],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon size={20} strokeWidth={1.5} />
                </motion.div>
              </motion.div>
              
              <span className="relative z-10 font-medium tracking-wide text-sm">{item.label}</span>
              
              {isActive && (
                <motion.div
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent-end rounded-l-sm"
                  layoutId="activeIndicator"
                />
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <motion.div
          className="glass-card p-4 rounded-md border border-white/10"
          whileHover={{ borderColor: 'rgba(45, 130, 255, 0.3)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-xs text-gray-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
            <Activity size={12} className="text-green-400" />
            System Status
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <span className="text-sm font-medium">Operational</span>
          </div>
        </motion.div>
      </div>
    </aside>
  );
}
