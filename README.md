# AI Code Reviewer

Decentralized AI powered code review built on **GenLayer**.

## What it does

Paste any code snippet and get an AI review verified by multiple validators through GenLayer's consensus mechanism. Unlike centralized AI services, every review is:

- **Trustless**: Multiple AI validators agree on the review
- **On-chain**: All reviews stored permanently on GenLayer
- **Auditable**: History of reviews accessible to anyone

## How GenLayer fits in

Traditional smart contracts can't run AI. GenLayer's **Intelligent Contracts** can:

1. User submits code via transaction
2. Contract calls LLM through `gl.nondet.exec_prompt()`
3. Multiple validators run the same prompt
4. They reach consensus on the review using the **Equivalence Principle**
5. Final review stored on-chain

## Project Structure

```
.
├── contracts/
│   └── code_reviewer.py    # The Intelligent Contract (deployed)
├── app/                    # Next.js routes, providers, globals
├── components/             # UI components (Header, ReviewForm, …)
├── lib/                    # genlayer.ts, wagmi, networks, utils
├── next.config.js
├── tailwind.config.ts
├── package.json
└── README.md
```

## Features

- [x] Submit code for review
- [x] Structured feedback (bugs, suggestions, security)
- [x] Animated score ring, glass UI, framer-motion
- [x] MetaMask (wagmi) + in-browser burner wallet
- [x] On-chain verification via eq_output polling
- [ ] Review history browser (future)
- [ ] Developer reputation (future)

## Tech Stack

- **Contract**: GenLayer Intelligent Contract (Python)
- **Frontend**: Next.js 14, TailwindCSS, wagmi v2, framer-motion, sonner
- **SDK**: genlayer-js
- **Network**: GenLayer Studio (chainId 61999, hosted)

## Getting Started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The app connects to hosted Studio at
<https://studio.genlayer.com/api> — no local setup needed.

The deployed contract is at
`0x68Fb17020705a70C0943817A6f5870477d453D16`. Its source lives in
`contracts/code_reviewer.py`.
