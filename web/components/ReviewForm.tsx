'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Code2, FileCode, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  loading: boolean;
  canSubmit: boolean;
  onSubmit: (code: string, language: string) => void;
}

const LANGUAGES = [
  { key: 'python', label: 'Python', icon: '🐍' },
  { key: 'javascript', label: 'JavaScript', icon: '🟨' },
  { key: 'typescript', label: 'TypeScript', icon: '🟦' },
  { key: 'solidity', label: 'Solidity', icon: '⬡' },
  { key: 'rust', label: 'Rust', icon: '🦀' },
  { key: 'go', label: 'Go', icon: '🐹' },
  { key: 'java', label: 'Java', icon: '☕' },
  { key: 'cpp', label: 'C++', icon: '⚙️' },
];

const SAMPLE = `def calculate_discount(price, discount_percent):
    # Calculate discounted price
    discount = price * discount_percent / 100
    final_price = price - discount
    return final_price

# Process user input
user_input = input("Enter price: ")
price = float(user_input)
discount = calculate_discount(price, 20)
print(f"Final price: {discount}")`;

export default function ReviewForm({ loading, canSubmit, onSubmit }: Props) {
  const [code, setCode] = useState(SAMPLE);
  const [language, setLanguage] = useState('python');

  const lines = useMemo(() => code.split('\n').length, [code]);
  const chars = code.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;
    onSubmit(code, language);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl glass gradient-border p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-brand-500/15 border border-brand-500/20 p-2">
            <Code2 className="h-4 w-4 text-brand-300" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Submit code for review</h2>
            <p className="text-xs text-slate-500">
              Multiple AI validators will analyze and reach consensus on-chain
            </p>
          </div>
        </div>
      </div>

      {/* Language pills */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {LANGUAGES.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => setLanguage(l.key)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition',
              language === l.key
                ? 'border-brand-500/50 bg-brand-500/15 text-brand-200 shadow-[0_0_0_1px_rgba(139,92,246,0.2)]'
                : 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/5 hover:text-slate-200',
            )}
          >
            <span className="mr-1">{l.icon}</span>
            {l.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="relative rounded-xl border border-white/10 bg-ink-900/60 overflow-hidden">
        {/* macOS-style top bar */}
        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
            <FileCode className="ml-3 h-3.5 w-3.5 text-slate-500" />
            <span className="text-[11px] text-slate-500 font-mono">
              snippet.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'solidity' ? 'sol' : language === 'rust' ? 'rs' : language === 'cpp' ? 'cpp' : language}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {lines} lines · {chars} chars
          </div>
        </div>

        <div className="relative flex">
          {/* Line numbers gutter */}
          <div
            aria-hidden
            className="select-none bg-white/[0.015] px-3 py-3 text-right text-[12px] leading-[1.65] text-slate-600 font-mono border-r border-white/5"
            style={{ minWidth: 48 }}
          >
            {Array.from({ length: Math.max(lines, 8) }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="code-editor flex-1 bg-transparent p-3 text-slate-100 placeholder-slate-600 focus:outline-none resize-y min-h-[280px]"
            placeholder={`// Paste your ${language} code here...`}
          />
        </div>
      </div>

      {/* Action bar */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span>Result typically in 10–30 seconds</span>
        </div>
        <motion.button
          type="submit"
          disabled={loading || !code.trim() || !canSubmit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'group relative overflow-hidden rounded-lg px-5 py-2.5 text-sm font-semibold text-white',
            'gradient-bg shadow-glow',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          )}
        >
          <span className="relative flex items-center gap-2">
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Reviewing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                Request AI Review
                <Sparkles className="h-3.5 w-3.5 opacity-80" />
              </>
            )}
          </span>
        </motion.button>
      </div>

      {!canSubmit && !loading && (
        <p className="mt-3 text-center text-xs text-amber-400/80">
          Connect a wallet to submit a review
        </p>
      )}
    </motion.form>
  );
}
