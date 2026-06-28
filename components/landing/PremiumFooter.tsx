'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, Instagram } from 'lucide-react';
import BrandMark from '@/components/landing/BrandMark';

const footerLinks = {
  product: [
    { name: 'Command center', href: '/dashboard/ops' },
    { name: 'Replay proof', href: '/dashboard/ops/replay?tour=1' },
    { name: 'Rainfall & rivers', href: '/dashboard/rainfall' },
    { name: 'Risk surface', href: '/dashboard/risk' },
  ],
  company: [
    { name: 'District pilot', href: '#horizon' },
    { name: 'Contact', href: 'mailto:swayamdebata2003@gmail.com' },
    { name: 'Website', href: 'https://www.modelearth.in' },
  ],
  resources: [
    { name: 'API', href: 'https://api.modelearth.in' },
    { name: 'Capabilities', href: '#capabilities' },
    { name: 'Platform', href: '#platforms' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/modelearth.ai/', label: 'Instagram' },
  { icon: Mail, href: 'mailto:swayamdebata2003@gmail.com', label: 'Email' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
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
            <Link href="/" className="mb-4 inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-900/80">
                <BrandMark size={40} className="h-8 w-8 object-contain" />
              </div>
              <span className="text-xl font-bold gradient-text">ModelEarth</span>
            </Link>
            <p className="mt-4 text-gray-400 max-w-sm">
              Early warning and flood operations for districts that need lead time, not another dashboard. Live command preview with verified historical replay.
            </p>
            
            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
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
            © {new Date().getFullYear()} ModelEarth. Climate intelligence platform.
          </p>
          <p className="text-sm text-gray-500">
            ModelEarth · verified historical replay · api.modelearth.in
          </p>
        </div>
      </div>
    </footer>
  );
}
