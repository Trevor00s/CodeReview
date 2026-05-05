# GenLayer AI Code Reviewer — Next.js Frontend

Production-ready Next.js 14 frontend for an AI-powered code review dApp running on **GenLayer Studio**.

## Quick start

```bash
cd web
npm install   # or pnpm / bun / yarn
npm run dev
```

Then open <http://localhost:3000>.

## Requirements

- A running **GenLayer Studio** at `http://localhost:4000/api` (and explorer at `http://localhost:8080`).
- Contract `0x68Fb17020705a70C0943817A6f5870477d453D16` deployed on studionet (chain id `61999`).

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- TailwindCSS (dark slate theme)
- `genlayer-js` (dynamic ESM import)
- `viem` for MetaMask + chain types
- `lucide-react` icons

## Wallets

- **Burner** — local random key persisted in `localStorage`.
- **MetaMask** — auto-adds the Studio chain on first tx.

## What gets shown

A polished review card (score, summary, bugs, suggestions, security issues) plus a small "Verified by GenLayer validator consensus" pill. **No raw blockchain data is rendered.** Internal raw fields (`_rawEqOutput`, `_rawTx`, `_eqOutputPath`, `_txHash`) are attached to the Review object for developer inspection via console only.
