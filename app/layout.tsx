import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'GenLayer · AI Code Reviewer',
  description:
    'Trustless AI code reviews backed by on-chain validator consensus. Running on GenLayer Studio.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-ink-900 text-slate-100 bg-orbs">
        <div className="pointer-events-none fixed inset-0 bg-grid -z-10" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
