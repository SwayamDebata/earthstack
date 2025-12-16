'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const footerLinks = {
  product: [
    { name: 'ClimateObserve', href: '/dashboard/climate' },
    { name: 'FloodPredict', href: '/dashboard/predict' },
    { name: 'Replay Mode', href: '/dashboard/replay' },
    { name: 'Pricing', href: '#pricing' },
  ],
  company: [
    { name: 'About', href: '#about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Contact', href: '#contact' },
    { name: 'Blog', href: '#blog' },
  ],
  resources: [
    { name: 'API Docs', href: '#api' },
    { name: 'Data Sources', href: '#data' },
    { name: 'Privacy', href: '#privacy' },
    { name: 'Terms', href: '#terms' },
  ],
};

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Mail, href: '#', label: 'Email' },
];

export default function PremiumFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-[#080B14] px-6 py-16">
      {/* Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="mx-auto max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-end flex items-center justify-center">
                <span className="text-lg">🌍</span>
              </div>
              <span className="text-xl font-bold gradient-text">EarthStack</span>
            </Link>
            <p className="mt-4 text-gray-400 max-w-sm">
              The Operating System for a Climate-Resilient Future. Real-time intelligence for rainfall, floods, and extreme weather.
            </p>
            
            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="group relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative z-10 rounded-lg border border-white/10 bg-white/5 p-2 backdrop-blur-sm transition-all group-hover:border-primary/50 group-hover:bg-primary/10">
                    <social.icon size={20} className="text-gray-400 group-hover:text-primary" strokeWidth={1.5} />
                  </div>
                  
                  {/* Neon Glow */}
                  <div className="absolute inset-0 rounded-lg bg-primary/20 opacity-0 blur-lg transition-opacity group-hover:opacity-100" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-gray-400">
            © 2024 EarthStack. Climate Intelligence Platform.
          </p>
          <p className="text-sm text-gray-500">
            Powered by Satellite Data & Advanced AI
          </p>
        </div>
      </div>
    </footer>
  );
}
