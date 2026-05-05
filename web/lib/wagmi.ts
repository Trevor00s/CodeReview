'use client';

import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import type { Chain } from 'viem';
import { NETWORKS, DEFAULT_NETWORK } from './networks';

const cfg = NETWORKS[DEFAULT_NETWORK];

export const studionet: Chain = {
  id: cfg.chainId,
  name: cfg.chainName,
  nativeCurrency: cfg.nativeCurrency,
  rpcUrls: {
    default: { http: [cfg.rpcUrl] },
    public: { http: [cfg.rpcUrl] },
  },
  blockExplorers: {
    default: { name: 'Studio', url: cfg.explorerUrl },
  },
  testnet: true,
};

export const wagmiConfig = createConfig({
  chains: [studionet],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [studionet.id]: http(cfg.rpcUrl),
  },
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
