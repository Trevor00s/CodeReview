'use client';

import { Sparkles, Wallet, ChevronDown, LogOut, Check, Copy, ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { toast } from 'sonner';
import * as gl from '@/lib/genlayer';
import { NETWORKS } from '@/lib/networks';
import { cn, shortAddr } from '@/lib/utils';
import type { WalletChoice } from '@/lib/types';

interface Props {
  walletChoice: WalletChoice;
  onWalletChoiceChange: (c: WalletChoice) => void;
  burnerAddress: string | null;
  onBurnerConnect: () => void;
  onBurnerDisconnect: () => void;
  connecting: boolean;
}

export default function Header({
  walletChoice,
  onWalletChoiceChange,
  burnerAddress,
  onBurnerConnect,
  onBurnerDisconnect,
  connecting,
}: Props) {
  const net = NETWORKS.studio;
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
  const { connectors, connect, isPending: wagmiConnecting } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const address = walletChoice === 'metamask' ? wagmiAddress : burnerAddress;
  const isConnected =
    walletChoice === 'metamask' ? wagmiConnected && !!wagmiAddress : !!burnerAddress;

  // Bridge wagmi → genlayer.ts
  useEffect(() => {
    if (walletChoice !== 'metamask') return;
    gl.setConnectedAddress(wagmiAddress ?? null);
  }, [wagmiAddress, walletChoice]);

  const handleConnect = () => {
    if (walletChoice === 'burner') return onBurnerConnect();
    const c =
      connectors.find((x: { id: string }) => x.id === 'metaMaskSDK' || x.id === 'metaMask') ||
      connectors.find((x: { id: string }) => x.id === 'injected') ||
      connectors[0];
    if (!c) return toast.error('No wallet connector available.');
    connect({ connector: c });
  };

  const handleDisconnect = () => {
    if (walletChoice === 'burner') return onBurnerDisconnect();
    wagmiDisconnect();
  };

  const [copied, setCopied] = useState(false);
  const copyAddr = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 glass-soft">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <motion.a
          href="/"
          className="flex items-center gap-2.5 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative">
            <div className="absolute inset-0 gradient-bg rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="relative rounded-xl gradient-bg p-2 shadow-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold gradient-text">CodeReview.ai</span>
            <span className="text-[10px] text-slate-500 tracking-wider uppercase">
              on GenLayer
            </span>
          </div>
        </motion.a>

        <div className="flex items-center gap-2">
          {/* Network pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs">
            <span className="pulse-dot" />
            <span className="text-emerald-300 font-medium">Studio</span>
            <span className="text-emerald-300/50">·</span>
            <span className="text-emerald-300/70 font-mono">{net.chainId}</span>
          </div>

          {/* Wallet choice */}
          <WalletPicker value={walletChoice} onChange={onWalletChoiceChange} />

          {/* Connect / connected */}
          {isConnected && address ? (
            <div className="flex items-center gap-1">
              <button
                onClick={copyAddr}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-mono hover:bg-white/10"
                title="Copy address"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                {shortAddr(address)}
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 opacity-50" />
                )}
              </button>
              <a
                href={`${net.explorerUrl}/?address=${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 hover:bg-white/10"
                title="View on explorer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={handleDisconnect}
                className="rounded-lg border border-white/10 bg-white/5 p-1.5 hover:bg-rose-500/10 hover:border-rose-500/30"
                title="Disconnect"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <motion.button
              onClick={handleConnect}
              disabled={connecting || wagmiConnecting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'relative overflow-hidden rounded-lg gradient-bg px-4 py-2 text-sm font-semibold text-white shadow-glow',
                'disabled:opacity-60 disabled:cursor-not-allowed',
              )}
            >
              <span className="relative flex items-center gap-1.5">
                <Wallet className="h-4 w-4" />
                {connecting || wagmiConnecting ? 'Connecting...' : 'Connect Wallet'}
              </span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}

function WalletPicker({
  value,
  onChange,
}: {
  value: WalletChoice;
  onChange: (v: WalletChoice) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const options: { key: WalletChoice; label: string; hint: string }[] = [
    { key: 'burner', label: 'Burner', hint: 'Local wallet, no setup' },
    { key: 'metamask', label: 'MetaMask', hint: 'Browser extension' },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
      >
        <Wallet className="h-3.5 w-3.5 opacity-70" />
        <span className="capitalize">{value}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 opacity-60 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-xl glass p-1.5 shadow-card"
          >
            {options.map((o) => (
              <button
                key={o.key}
                onClick={() => {
                  onChange(o.key);
                  setOpen(false);
                }}
                className={cn(
                  'w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2',
                  value === o.key && 'bg-white/5',
                )}
              >
                <div className="flex-1">
                  <div className="font-medium">{o.label}</div>
                  <div className="text-[11px] text-slate-500">{o.hint}</div>
                </div>
                {value === o.key && <Check className="h-4 w-4 text-brand-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
