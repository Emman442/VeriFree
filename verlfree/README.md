# VeriFree

### Submit your work. AI judges. Get paid. No middlemen.

VeriFree is a decentralized freelance escrow platform built on GenLayer. 
Clients post jobs, freelancers submit deliverables, and an Intelligent 
Contract automatically verifies work quality and releases payment. 
No human arbitrators. No payment delays. No trust required.

Built for the **Bradbury Builders Hackathon** on GenLayer.

---

## The Problem

Freelance platforms today have a trust problem.

Clients worry about paying for work that never gets delivered. Freelancers 
worry about delivering work that never gets paid. Platforms like Upwork 
sit in the middle taking 20% and still get disputes wrong. Cross-border 
payments add another layer of friction, delays, and fees.

Traditional smart contract escrows don't solve this either. They can check 
if a file was uploaded. They cannot check if the work is actually good.

---

## The Solution

VeriFree uses GenLayer's Intelligent Contracts to bring AI-powered judgment 
into the payment layer.

When a freelancer submits their deliverable URL, the contract fetches the 
content directly from the web, evaluates it against the agreed criteria 
written in plain English, and automatically releases or returns the escrowed 
payment based on the verdict.

Multiple independent LLM validators run the evaluation simultaneously and 
reach consensus through GenLayer's Optimistic Democracy mechanism. No single 
AI makes the call. No human can manipulate the outcome. The result and full 
reasoning are stored permanently on-chain.

---

## How It Works

**1. Post a Job**
Client creates a job with a title, description, success criteria in plain 
English, and deposits GEN tokens into the escrow contract.

**2. Accept and Deliver**
Freelancer accepts the job, completes the work, and submits a proof URL 
directly to the contract.

**3. AI Verification**
The Intelligent Contract fetches the deliverable, reads the content, and 
evaluates it against every agreed criterion. Multiple LLM validators reach 
consensus on a verdict with a score and written reasoning.

**4. Automatic Payout**
If the work passes, payment goes to the freelancer instantly. If it fails, 
funds return to the client. No waiting. No disputes. No platform support tickets.

**5. Dispute Round**
If a freelancer believes the verdict was wrong, they can raise a dispute with 
additional context. The contract re-evaluates with the new evidence and issues 
a final ruling. This mirrors GenLayer's Optimistic Democracy appeal mechanism.

---

## GenLayer Integration

VeriFree demonstrates two core GenLayer primitives:

**Optimistic Democracy Consensus**
Every verification call runs across multiple independent LLM validators. They 
each evaluate the deliverable independently, propose a verdict, and reach 
consensus before any payment moves. This makes the judgment trustless and 
resistant to manipulation.

**Equivalence Principle**
Success criteria are written in natural language. The contract understands 
semantic equivalence, not just exact string matching. "The article should be 
well structured and easy to read" is evaluated for meaning, not keywords.

---

## Features

- On-chain job creation with GEN token escrow
- Plain English success criteria per job
- AI-powered deliverable verification via Intelligent Contract
- Milestone-based payment splitting for larger projects
- Dispute resolution with re-evaluation on new evidence
- On-chain reputation scores for freelancers and clients
- Public job board for open applications
- Direct hire by wallet address for existing relationships
- Verified on-chain portfolio for every freelancer
- Real-time chat per job stored as part of the job record
- Leaderboard for top freelancers and clients

---

## Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | GenLayer (Testnet Bradbury) |
| Intelligent Contract | Python (GenLayer IC) |
| Frontend | Next.js 15, Tailwind CSS, Framer Motion |
| Database | Firebase Firestore |
| Auth | Firebase Auth + MetaMask |
| Wallet | MetaMask (EVM) |
| SDK | GenLayer JS SDK |

---

## Contract Functions

| Function | Description |
|---|---|
| `create_job` | Client posts a job and deposits GEN into escrow |
| `submit_deliverable` | Freelancer submits proof URL for verification |
| `verify_and_pay` | AI fetches, evaluates, and auto-releases payment |
| `add_milestone` | Split job payment into verifiable milestones |
| `verify_milestone` | AI verification per milestone with partial payout |
| `raise_dispute` | Freelancer challenges verdict with new evidence |
| `create_profile` | Register as client or freelancer on-chain |
| `get_leaderboard_freelancers` | Returns ranked freelancer list by completed jobs |

---

## Getting Started

**Prerequisites**
- Node.js 18+
- MetaMask browser extension
- GenLayer testnet GEN tokens from the faucet

**Clone the repo**
```bash
git clone https://github.com/Emman442/verifree.git
cd verifree
```

**Install dependencies**
```bash
npm install
```

**Set up environment variables**
```bash
cp .env.example .env.local
```

Add your Firebase config and GenLayer contract address to `.env.local`.

**Run the development server**
```bash
npm run dev
```

**Deploy the Intelligent Contract**

Open the `contracts/` folder in GenLayer Studio, deploy to Testnet Bradbury, 
and paste the contract address into your `.env.local`.

---

## Get Test GEN

Claim free testnet GEN tokens from the official faucet:
[https://testnet-faucet.genlayer.foundation](https://testnet-faucet.genlayer.foundation)

---

## Why GenLayer

Every other escrow platform either relies on a centralized arbitration team 
or binary deterministic checks that can only verify if a file exists, not if 
it is good. GenLayer is the only platform where a contract can read a live URL, 
understand natural language criteria, and make a reasoned judgment that multiple 
independent validators agree on.

VeriFree would not be possible without GenLayer. That is not a marketing 
claim. It is an architectural fact.

---

## Built By

Emmanuel | [@EmmanuelNdema1](https://twitter.com/EmmanuelNdema1)

Bradbury Builders Hackathon | March 2026# verifree-client
