'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Loading({ step }: { step: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl glass p-6"
    >
      {/* Animated shimmer bar on top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent animate-shimmer" />

      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-brand-500/30 blur-xl rounded-full" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl gradient-bg shadow-glow">
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-100">
              AI validators are working
            </span>
            <span className="flex gap-0.5">
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                className="h-1 w-1 rounded-full bg-brand-400"
              />
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                className="h-1 w-1 rounded-full bg-brand-400"
              />
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                className="h-1 w-1 rounded-full bg-brand-400"
              />
            </span>
          </div>
          <div className="text-xs text-slate-400 truncate font-mono">{step || 'Initializing...'}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: '10%' }}
          animate={{ width: ['10%', '70%', '85%', '95%'] }}
          transition={{ duration: 30, ease: 'easeOut' }}
          className="h-full rounded-full gradient-bg"
        />
      </div>
    </motion.div>
  );
}
