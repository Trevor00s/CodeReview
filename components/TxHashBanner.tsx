'use client';

import { motion } from 'framer-motion';
import { Copy, ExternalLink, Check, Hash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { NETWORKS } from '@/lib/networks';
import { shortHash } from '@/lib/utils';

export default function TxHashBanner({ txHash }: { txHash: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(txHash);
    setCopied(true);
    toast.success('Transaction hash copied');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30">
          <Hash className="h-4 w-4 text-emerald-300" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-emerald-300">Transaction submitted</div>
          <div className="text-[11px] text-slate-400 truncate font-mono">{shortHash(txHash)}</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={copy}
          className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/10"
          title="Copy"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">Copy</span>
        </button>
        <a
          href={`${NETWORKS.studio.explorerUrl}/?tx=${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/10"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Explorer</span>
        </a>
      </div>
    </motion.div>
  );
}
