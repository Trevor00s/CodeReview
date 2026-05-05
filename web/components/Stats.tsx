'use client';

import { motion } from 'framer-motion';
import { Activity, Network, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  totalReviews: number | string;
}

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!Number.isFinite(target)) return;
    const start = performance.now();
    const from = value;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

export default function Stats({ totalReviews }: Props) {
  const num = Number(totalReviews);
  const count = useCountUp(Number.isFinite(num) ? num : 0);

  const items = [
    {
      icon: <Activity className="h-4 w-4" />,
      label: 'Total Reviews',
      value: Number.isFinite(num) ? count.toLocaleString() : '—',
      accent: 'text-brand-300',
      bg: 'bg-brand-500/10',
      border: 'border-brand-500/20',
    },
    {
      icon: <Network className="h-4 w-4" />,
      label: 'Network',
      value: 'GenLayer Studio',
      accent: 'text-emerald-300',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: 'Consensus',
      value: 'Optimistic Democracy',
      accent: 'text-sky-300',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: 'Avg. Latency',
      value: '~10s',
      accent: 'text-amber-300',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((it, i) => (
        <motion.div
          key={it.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i, duration: 0.4 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
              {it.label}
            </span>
            <span className={`rounded-md ${it.bg} ${it.border} border p-1 ${it.accent}`}>
              {it.icon}
            </span>
          </div>
          <div className="text-lg font-semibold tabular-nums">{it.value}</div>
        </motion.div>
      ))}
    </div>
  );
}
