'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import Header from '@/components/Header';
import ReviewForm from '@/components/ReviewForm';
import TxHashBanner from '@/components/TxHashBanner';
import Loading from '@/components/Loading';
import ReviewResult from '@/components/ReviewResult';
import HowItWorks from '@/components/HowItWorks';
import Stats from '@/components/Stats';
import * as gl from '@/lib/genlayer';
import type { Review, WalletChoice } from '@/lib/types';

export default function Page() {
  const [walletChoice, setWalletChoiceState] = useState<WalletChoice>('burner');
  const [burnerAddress, setBurnerAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [totalReviews, setTotalReviews] = useState<number | string>('—');

  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
  const canSubmit =
    walletChoice === 'metamask' ? wagmiConnected && !!wagmiAddress : !!burnerAddress;

  const refreshTotal = useCallback(async () => {
    try {
      const t = await gl.getTotalReviews();
      setTotalReviews(t.toString());
    } catch {
      setTotalReviews('—');
    }
  }, []);

  // Mount: init chain, restore wallet choice, auto-connect burner.
  useEffect(() => {
    (async () => {
      await gl.initChain();
      const w = gl.getWalletChoice();
      setWalletChoiceState(w);
      if (w === 'burner') {
        try {
          const a = await gl.connectWallet();
          setBurnerAddress(a.address);
        } catch (e) {
          console.warn(e);
        }
      }
      refreshTotal();
    })();
  }, [refreshTotal]);

  // Keep genlayer.ts in sync with wagmi for metamask mode
  useEffect(() => {
    if (walletChoice === 'metamask') {
      gl.setConnectedAddress(wagmiAddress ?? null);
    }
  }, [walletChoice, wagmiAddress]);

  const onWalletChoiceChange = (c: WalletChoice) => {
    gl.setWalletChoice(c);
    setWalletChoiceState(c);
    setBurnerAddress(null);
  };

  const onBurnerConnect = async () => {
    setConnecting(true);
    try {
      const a = await gl.connectWallet();
      setBurnerAddress(a.address);
      toast.success('Burner wallet ready');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setConnecting(false);
    }
  };

  const onBurnerDisconnect = () => {
    gl.disconnect();
    setBurnerAddress(null);
  };

  const onSubmit = async (code: string, language: string) => {
    setReview(null);
    setTxHash(null);
    setLoading(true);
    setLoadingStep('Preparing transaction...');
    try {
      const result = await gl.submitCodeForReview(code, language, (msg, hash) => {
        setLoadingStep(msg);
        if (hash) setTxHash(hash);
      });
      setReview(result);
      toast.success(`Review ready · Score ${result.overall_score}/10`);
      refreshTotal();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        walletChoice={walletChoice}
        onWalletChoiceChange={onWalletChoiceChange}
        burnerAddress={burnerAddress}
        onBurnerConnect={onBurnerConnect}
        onBurnerDisconnect={onBurnerDisconnect}
        connecting={connecting}
      />

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-10">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-5 py-6 sm:py-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-slate-300 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span>Powered by GenLayer · Optimistic Democracy consensus</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
            <span className="gradient-text">Trustless</span>
            <br />
            <span className="text-slate-100">AI code reviews.</span>
          </h1>

          <p className="text-slate-400 max-w-xl mx-auto text-[15px] leading-relaxed">
            Paste your code. Multiple LLM validators independently analyze and reach
            consensus on-chain producing a structured, verifiable review in seconds.
          </p>
        </motion.section>

        <Stats totalReviews={totalReviews} />

        <ReviewForm loading={loading} canSubmit={canSubmit} onSubmit={onSubmit} />

        {txHash && <TxHashBanner txHash={txHash} />}
        {loading && <Loading step={loadingStep} />}
        {review && !loading && <ReviewResult review={review} />}

        <HowItWorks />

        <footer className="pt-10 pb-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 border-t border-white/5">
          <span>Built on GenLayer · Studio (chain 61999)</span>
          <span className="font-mono">
            Contract {gl.networkInfo().contractAddress.slice(0, 8)}...
            {gl.networkInfo().contractAddress.slice(-6)}
          </span>
        </footer>
      </main>
    </>
  );
}
