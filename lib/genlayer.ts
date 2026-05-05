'use client';

import { DEFAULT_NETWORK, NETWORKS, type NetworkKey } from './networks';
import type { ProgressFn, Review, WalletChoice } from './types';

// ---------- SDK dynamic import (genlayer-js is ESM-only) ----------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sdk: any;
async function loadSdk() {
  if (!_sdk) _sdk = await import('genlayer-js');
  return _sdk;
}

// ---------- State ----------
let networkKey: NetworkKey = DEFAULT_NETWORK;
let walletChoice: WalletChoice = 'burner';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let burnerAccount: any = null;
let connectedAddress: string | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let chainObject: any = null;

const BURNER_KEY = 'glcr.burner.privateKey';
const WALLET_KEY = 'glcr.walletChoice';
const NETWORK_KEY = 'glcr.networkKey';

function net() {
  return NETWORKS[networkKey];
}

// ---------- Chain detection ----------
async function getChain() {
  if (chainObject) return chainObject;
  const sdk = await loadSdk();
  const cfg = net();
  // Prefer SDK-exported chain (has consensusMainContract + defaultConsensusMaxRotations).
  const chains = sdk.chains || sdk;
  const candidates = ['studionet', 'localnet', 'studio'];
  for (const k of candidates) {
    if (chains[k]) {
      chainObject = chains[k];
      console.log('[GenLayer] using SDK chain:', k, {
        id: chainObject.id,
        rotations: chainObject.defaultConsensusMaxRotations,
        hasConsensusContract: !!chainObject.consensusMainContract,
      });
      return chainObject;
    }
  }
  // Fallback minimal chain — required fields for genlayer-js writeContract.
  console.warn('[GenLayer] SDK chain not found; building fallback');
  chainObject = {
    id: cfg.chainId,
    name: cfg.chainName,
    nativeCurrency: cfg.nativeCurrency,
    rpcUrls: {
      default: { http: [cfg.rpcUrl] },
      public: { http: [cfg.rpcUrl] },
    },
    blockExplorers: { default: { name: 'Studio', url: cfg.explorerUrl } },
    defaultConsensusMaxRotations: 3,
  };
  return chainObject;
}

export async function initChain() {
  if (typeof window !== 'undefined') {
    const w = window.localStorage.getItem(WALLET_KEY);
    if (w === 'burner' || w === 'metamask') walletChoice = w;
    const n = window.localStorage.getItem(NETWORK_KEY);
    if (n === 'studio') networkKey = n;
  }
  await getChain();
}

// ---------- Wallet management ----------
export function setNetworkKey(k: NetworkKey) {
  networkKey = k;
  chainObject = null;
  if (typeof window !== 'undefined') window.localStorage.setItem(NETWORK_KEY, k);
}
export function getNetworkKey(): NetworkKey {
  return networkKey;
}

export function setWalletChoice(c: WalletChoice) {
  if (walletChoice !== c) disconnect();
  walletChoice = c;
  if (typeof window !== 'undefined') window.localStorage.setItem(WALLET_KEY, c);
}
export function getWalletChoice(): WalletChoice {
  return walletChoice;
}

export function disconnect() {
  burnerAccount = null;
  connectedAddress = null;
}

export function getConnectedAddress(): string | null {
  return connectedAddress;
}

/** Bridge for wagmi: when wagmi connects MetaMask, we mirror the address. */
export function setConnectedAddress(addr: string | null) {
  connectedAddress = addr;
}

async function ensureBurner() {
  const sdk = await loadSdk();
  if (burnerAccount) return burnerAccount;
  let pk: string | null = null;
  if (typeof window !== 'undefined') pk = window.localStorage.getItem(BURNER_KEY);
  if (pk && typeof sdk.privateKeyToAccount === 'function') {
    burnerAccount = sdk.privateKeyToAccount(pk as `0x${string}`);
  } else if (typeof sdk.createAccount === 'function') {
    burnerAccount = sdk.createAccount();
    if (typeof window !== 'undefined' && burnerAccount?.privateKey) {
      window.localStorage.setItem(BURNER_KEY, burnerAccount.privateKey);
    }
  } else {
    throw new Error('genlayer-js does not expose createAccount / privateKeyToAccount.');
  }
  return burnerAccount;
}

async function ensureMetamaskChain() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eth = (typeof window !== 'undefined' ? (window as any).ethereum : null) as any;
  if (!eth) throw new Error('MetaMask not detected.');
  const cfg = net();
  const hexId = '0x' + cfg.chainId.toString(16);
  try {
    await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexId }] });
  } catch (err: unknown) {
    // 4902 = chain not added
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const code = (err as any)?.code;
    if (code === 4902) {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: hexId,
            chainName: cfg.chainName,
            rpcUrls: [cfg.rpcUrl],
            nativeCurrency: cfg.nativeCurrency,
            blockExplorerUrls: [cfg.explorerUrl],
          },
        ],
      });
    } else {
      throw err;
    }
  }
  return eth;
}

export async function connectWallet(): Promise<{ address: string }> {
  if (walletChoice === 'burner') {
    const a = await ensureBurner();
    connectedAddress = a.address;
    return { address: a.address };
  }
  const eth = await ensureMetamaskChain();
  const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
  if (!accounts?.length) throw new Error('No MetaMask account selected.');
  connectedAddress = accounts[0];
  return { address: accounts[0] };
}

// ---------- Clients ----------
async function getReadClient() {
  const sdk = await loadSdk();
  const chain = await getChain();
  const endpoint = net().rpcUrl;
  if (typeof sdk.createClient === 'function') {
    return sdk.createClient({ chain, endpoint });
  }
  // Fallback to viem public client.
  const viem = await import('viem');
  return viem.createPublicClient({ chain, transport: viem.http(endpoint) });
}

async function getWriteClient() {
  const sdk = await loadSdk();
  const chain = await getChain();
  const endpoint = net().rpcUrl;
  if (walletChoice === 'burner') {
    const account = await ensureBurner();
    if (typeof sdk.createClient === 'function') {
      return sdk.createClient({ chain, account, endpoint });
    }
    const viem = await import('viem');
    return viem.createWalletClient({ account, chain, transport: viem.http(endpoint) });
  }
  // MetaMask path
  const eth = await ensureMetamaskChain();
  const viem = await import('viem');
  const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
  const address = accounts[0] as `0x${string}`;
  if (typeof sdk.createClient === 'function') {
    return sdk.createClient({
      chain,
      endpoint,
      account: address,
      transport: viem.custom(eth),
    });
  }
  return viem.createWalletClient({
    account: address,
    chain,
    transport: viem.custom(eth),
  });
}

// ---------- Reads ----------
export async function getTotalReviews(): Promise<bigint> {
  const client = await getReadClient();
  try {
    // genlayer-js style read
    if (typeof client.readContract === 'function') {
      const v = await client.readContract({
        address: net().contractAddress,
        functionName: 'get_total_reviews',
        args: [],
      });
      return BigInt(v as string | number | bigint);
    }
  } catch (e) {
    console.warn('[GenLayer] get_total_reviews failed:', e);
  }
  return 0n;
}

export async function getReview(id: bigint): Promise<Partial<Review>> {
  const client = await getReadClient();
  try {
    const v = await client.readContract({
      address: net().contractAddress,
      functionName: 'get_review',
      args: [id],
    });
    return normalizeStored(v);
  } catch (e) {
    console.warn('[GenLayer] get_review failed:', e);
    return {};
  }
}

function safeJsonList(s: unknown): string[] {
  if (Array.isArray(s)) return s.map(String);
  if (typeof s !== 'string' || !s.trim()) return [];
  try {
    const v = JSON.parse(s);
    if (Array.isArray(v)) return v.map(String);
  } catch {
    /* ignore */
  }
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeStored(v: any): Partial<Review> {
  if (!v) return {};
  return {
    code_snippet: v.code_snippet,
    language: v.language,
    submitter: v.submitter,
    overall_score: Number(v.overall_score ?? 0),
    summary: String(v.summary ?? ''),
    bugs_found: safeJsonList(v.bugs_found),
    suggestions: safeJsonList(v.suggestions),
    security_issues: safeJsonList(v.security_issues),
  };
}

// ---------- Submit + poll ----------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function rpcCall(method: string, params: unknown[]) {
  const res = await fetch(net().rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  });
  if (!res.ok) throw new Error(`RPC ${method} HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`RPC ${method}: ${json.error.message}`);
  return json.result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchTx(txHash: string): Promise<any> {
  const methods = [
    'gen_getTransactionByHash',
    'sim_getTransactionByHash',
    'eth_getTransactionByHash',
  ];
  for (const m of methods) {
    try {
      const r = await rpcCall(m, [txHash]);
      if (r) return r;
    } catch {
      /* try next */
    }
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPath(obj: any, path: (string | number)[]): unknown {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = obj;
  for (const p of path) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractEqOutput(tx: any): { value: string | null; path: string } {
  if (!tx) return { value: null, path: '' };
  const candidates: { path: (string | number)[]; label: string }[] = [
    { path: ['consensus_data', 'leader_receipt', 0, 'eq_outputs', '0'], label: 'consensus_data.leader_receipt[0].eq_outputs["0"]' },
    { path: ['consensus_data', 'leader_receipt', 0, 'eq_outputs', 0], label: 'consensus_data.leader_receipt[0].eq_outputs[0]' },
    { path: ['consensus_data', 'leader_receipt', 'eq_outputs', '0'], label: 'consensus_data.leader_receipt.eq_outputs["0"]' },
    { path: ['leader_receipt', 'eq_outputs', '0'], label: 'leader_receipt.eq_outputs["0"]' },
    { path: ['eq_outputs', '0'], label: 'eq_outputs["0"]' },
    { path: ['eq_outputs', 0], label: 'eq_outputs[0]' },
  ];
  for (const c of candidates) {
    const v = getPath(tx, c.path);
    if (typeof v === 'string' && v.length > 4) return { value: v, path: c.label };
  }
  // Deep-scan fallback for first long string.
  let found: { value: string; path: string } | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visit = (node: any, path: string) => {
    if (found || node == null) return;
    if (typeof node === 'string') {
      if (node.length > 50) found = { value: node, path };
      return;
    }
    if (typeof node !== 'object') return;
    for (const k of Object.keys(node)) {
      visit(node[k], path ? `${path}.${k}` : k);
      if (found) return;
    }
  };
  visit(tx, '');
  if (found) return found;
  return { value: null, path: '' };
}

async function pollTxForEqOutput(
  txHash: string,
  onProgress: ProgressFn,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ eqOutput: string; rawTx: any; path: string }> {
  const max = 120;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lastTx: any = null;
  for (let i = 0; i < max; i++) {
    await sleep(2000);
    const tx = await fetchTx(txHash);
    lastTx = tx ?? lastTx;
    if (i % 5 === 0) {
      const status = tx?.status || tx?.tx_status || 'pending';
      onProgress(`Status: ${status} · ${i * 2}s elapsed`, txHash);
    }
    const found = extractEqOutput(tx);
    if (found.value !== null) return { eqOutput: found.value, rawTx: tx, path: found.path };
  }
  console.warn('[GenLayer] timed out, last tx:', lastTx);
  throw new Error('Timeout: eq_output did not appear on-chain.');
}

function b64decode(s: string): string {
  try {
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      const bin = window.atob(s);
      try {
        // UTF-8 decode
        const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
        return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      } catch {
        return bin;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (Buffer as any).from(s, 'base64').toString('utf-8');
  } catch {
    return s;
  }
}

function findJsonObject(text: string, key: string): string | null {
  const idx = text.indexOf(`"${key}"`);
  if (idx < 0) return null;
  // walk back to the nearest '{'
  let start = idx;
  while (start >= 0 && text[start] !== '{') start--;
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function parseEqOutput(eqOutput: string): Review {
  const fallback: Review = {
    overall_score: 0,
    summary: '',
    bugs_found: [],
    suggestions: [],
    security_issues: [],
  };
  if (!eqOutput) return fallback;
  let text = eqOutput;
  // Try base64 decode; if it doesn't decode to ASCII-ish, keep original.
  const decoded = b64decode(eqOutput);
  if (decoded && decoded.includes('overall_score')) text = decoded;
  else if (eqOutput.includes('overall_score')) text = eqOutput;
  else text = decoded || eqOutput;

  const json = findJsonObject(text, 'overall_score');
  if (!json) return fallback;
  try {
    const obj = JSON.parse(json);
    return {
      overall_score: Number(obj.overall_score ?? 0),
      summary: String(obj.summary ?? ''),
      bugs_found: safeJsonList(obj.bugs_found),
      suggestions: safeJsonList(obj.suggestions),
      security_issues: safeJsonList(obj.security_issues),
    };
  } catch {
    return fallback;
  }
}

export async function submitCodeForReview(
  code: string,
  language: string,
  onProgress: ProgressFn,
): Promise<Review> {
  console.log('[GenLayer] submitCodeForReview start', {
    walletChoice,
    connectedAddress,
    contract: net().contractAddress,
    rpc: net().rpcUrl,
    chainId: net().chainId,
    codeLen: code.length,
    language,
  });
  if (!connectedAddress) throw new Error('Connect a wallet first.');

  let client;
  try {
    client = await getWriteClient();
    console.log('[GenLayer] write client ready:', {
      hasWriteContract: typeof client.writeContract === 'function',
      chainId: client.chain?.id,
      account: client.account?.address || client.account,
    });
  } catch (e) {
    console.error('[GenLayer] getWriteClient failed:', e);
    throw e;
  }

  onProgress('Preparing transaction...');

  let txHash: string;
  try {
    txHash = await client.writeContract({
      address: net().contractAddress,
      functionName: 'submit_code',
      args: [code, language],
      value: 0n,
    });
    console.log('[GenLayer] tx submitted:', txHash);
  } catch (e) {
    console.error('[GenLayer] writeContract failed:', e);
    throw e;
  }

  onProgress('Transaction submitted. Polling for validator output...', txHash);

  const { eqOutput, rawTx, path } = await pollTxForEqOutput(txHash, onProgress);
  const review = parseEqOutput(eqOutput);
  review._rawEqOutput = eqOutput;
  review._rawTx = rawTx;
  review._eqOutputPath = path;
  review._txHash = txHash;

  // Storage enrichment.
  try {
    const total = await getTotalReviews();
    if (total > 0n) {
      const stored = await getReview(total - 1n);
      const merged: Review = {
        ...review,
        ...stored,
        // Prefer parsed lists if storage is empty.
        bugs_found: (stored.bugs_found?.length ? stored.bugs_found : review.bugs_found) ?? [],
        suggestions: (stored.suggestions?.length ? stored.suggestions : review.suggestions) ?? [],
        security_issues:
          (stored.security_issues?.length ? stored.security_issues : review.security_issues) ?? [],
        overall_score: stored.overall_score ?? review.overall_score,
        summary: stored.summary || review.summary,
        id: (total - 1n).toString(),
        _rawEqOutput: eqOutput,
        _rawTx: rawTx,
        _eqOutputPath: path,
        _txHash: txHash,
      };
      console.debug('[GenLayer] enriched review:', merged);
      return merged;
    }
  } catch (e) {
    console.warn('[GenLayer] storage enrichment failed:', e);
  }

  console.debug('[GenLayer] parsed review:', review);
  return review;
}

export function explorerTxUrl(hash: string) {
  return `${net().explorerUrl}/?tx=${hash}`;
}

export function networkInfo() {
  return net();
}
