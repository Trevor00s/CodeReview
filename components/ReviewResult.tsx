'use client';

import { motion } from 'framer-motion';
import { Bug, Lightbulb, Lock, ShieldCheck, TrendingUp, CheckCircle2 } from 'lucide-react';
import type { Review } from '@/lib/types';
import { NETWORKS } from '@/lib/networks';
import { cn, shortHash } from '@/lib/utils';

interface Props {
  review: Review;
}

export default function ReviewResult({ review }: Props) {
  const score = Number(review.overall_score ?? 0);
  const scoreColor =
    score >= 8
      ? 'text-emerald-400'
      : score >= 5
        ? 'text-amber-400'
        : 'text-rose-400';
  const ringGradient =
    score >= 8
      ? ['#10b981', '#34d399']
      : score >= 5
        ? ['#f59e0b', '#fbbf24']
        : ['#f43f5e', '#fb7185'];
  const verdict =
    score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Needs work' : 'Critical issues';

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      {/* Top row: score + summary */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Score ring */}
        <div className="lg:col-span-2 relative rounded-2xl glass gradient-border p-6 flex flex-col items-center justify-center text-center">
          <ScoreRing score={score} colors={ringGradient} />
          <div className={cn('mt-3 text-xs font-semibold uppercase tracking-widest', scoreColor)}>
            {verdict}
          </div>
          {review.id && (
            <div className="mt-1 text-[11px] text-slate-500 font-mono">
              Review #{review.id}
            </div>
          )}
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 rounded-2xl glass p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-slate-200">AI Analysis Summary</h3>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-300">{review.summary || '—'}</p>

          {review._txHash && (
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Verified by validator consensus</span>
              </div>
              <a
                href={`${NETWORKS.studio.explorerUrl}/?tx=${review._txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-slate-500 hover:text-brand-300"
              >
                {shortHash(review._txHash)}
              </a>
            </div>
          )}
        </motion.div>
      </div>

      {/* Categories */}
      <div className="grid md:grid-cols-3 gap-4">
        <Category
          icon={<Bug className="h-4 w-4" />}
          label="Bugs Found"
          accent="rose"
          items={review.bugs_found}
          delay={0.15}
        />
        <Category
          icon={<Lightbulb className="h-4 w-4" />}
          label="Suggestions"
          accent="sky"
          items={review.suggestions}
          delay={0.2}
        />
        <Category
          icon={<Lock className="h-4 w-4" />}
          label="Security"
          accent="violet"
          items={review.security_issues}
          delay={0.25}
        />
      </div>
    </motion.section>
  );
}

function ScoreRing({ score, colors }: { score: number; colors: [string, string] | string[] }) {
  const clamped = Math.max(0, Math.min(10, score));
  const pct = clamped / 10;
  const size = 180;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - pct * c;
  const gradId = `score-grad-${colors.join('-')}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(148,163,184,0.1)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${colors[0]}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="text-5xl font-bold tabular-nums"
          style={{ color: colors[0] }}
        >
          {clamped.toFixed(1)}
        </motion.div>
        <div className="text-xs text-slate-500 font-medium">out of 10</div>
      </div>
    </div>
  );
}

function Category({
  icon,
  label,
  accent,
  items,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  accent: 'rose' | 'sky' | 'violet';
  items?: string[];
  delay?: number;
}) {
  const colorMap = {
    rose: {
      text: 'text-rose-300',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      dot: 'bg-rose-400',
    },
    sky: {
      text: 'text-sky-300',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      dot: 'bg-sky-400',
    },
    violet: {
      text: 'text-violet-300',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      dot: 'bg-violet-400',
    },
  };
  const c = colorMap[accent];
  const count = items?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl glass p-5 hover:border-white/10 transition"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn('rounded-lg p-2', c.bg, 'border', c.border)}>
            <span className={c.text}>{icon}</span>
          </div>
          <h4 className="text-sm font-semibold text-slate-200">{label}</h4>
        </div>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-xs font-mono font-semibold',
            c.bg,
            c.border,
            c.text,
          )}
        >
          {count}
        </span>
      </div>

      {count === 0 ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-500/60" />
          <span>None found</span>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items!.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.05 * i }}
              className="flex gap-2.5 text-sm"
            >
              <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', c.dot)} />
              <span className="text-slate-300 leading-relaxed">{item}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
