export type NetworkKey = 'studio';

export interface NetworkConfig {
  key: NetworkKey;
  label: string;
  rpcUrl: string;
  chainId: number;
  chainName: string;
  explorerUrl: string;
  contractAddress: `0x${string}`;
  nativeCurrency: { name: string; symbol: string; decimals: number };
}

export const NETWORKS: Record<NetworkKey, NetworkConfig> = {
  studio: {
    key: 'studio',
    label: 'Studio',
    rpcUrl: 'https://studio.genlayer.com/api',
    chainId: 61999,
    chainName: 'GenLayer Studio Network',
    explorerUrl: 'https://explorer-studio.genlayer.com',
    contractAddress: '0x68Fb17020705a70C0943817A6f5870477d453D16',
    nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  },
};

export const DEFAULT_NETWORK: NetworkKey = 'studio';
