'use client';

import { motion } from 'framer-motion';
import { Upload, Cpu, ShieldCheck } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Submit',
    description: 'Paste your code and sign a transaction with your wallet.',
    gradient: 'from-brand-500 to-brand-600',
  },
  {
    icon: Cpu,
    title: 'AI Consensus',
    description: 'Multiple LLM validators independently analyze your code.',
    gradient: 'from-sky-500 to-brand-500',
  },
  {
    icon: ShieldCheck,
    title: 'Verifiable Result',
    description: 'Consensus is reached and the review is stored on-chain.',
    gradient: 'from-emerald-500 to-sky-500',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-slate-400 mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          How it works
        </div>
        <h3 className="text-2xl font-semibold">Three steps to a trustless review</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-4 relative">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-[44px] left-[16%] right-[16%] h-px bg-gradient-to-r from-brand-500/0 via-brand-500/40 to-emerald-500/0 -z-10" />

        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.08 * i, duration: 0.5 }}
            className="relative rounded-2xl glass p-5 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center">
              <div className={`absolute h-14 w-14 rounded-full bg-gradient-to-br ${s.gradient} opacity-20 blur-xl`} />
              <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} shadow-glow`}>
                <s.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
              Step {i + 1}
            </div>
            <h4 className="text-base font-semibold mb-1">{s.title}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">{s.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
