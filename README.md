# Obsidian Protocol

Universal credit infrastructure for humans and AI agents on Solana.

[![Built on Solana](https://img.shields.io/badge/Built%20on-Solana-blueviolet)](https://solana.com)
[![Hackathon](https://img.shields.io/badge/Colosseum-Cypherpunk%202025-yellow)](https://www.colosseum.org/cypherpunk)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌐 Demo

**[obsidian.credit](https://obsidian.credit)** - Interactive demonstration

> ⚠️ **Development Status**: This is a prototype built for the Colosseum Cypherpunk Hackathon. Core smart contracts are functional on devnet. Full production features (AI analysis, SAS integration) are under development.

## 📋 Overview

Obsidian Protocol is building the first universal credit scoring system that serves both humans and AI agents. Our goal is to enable undercollateralized lending in DeFi by bridging traditional credit signals with on-chain attestations.

### The Problem

- **Humans:** DeFi requires 150%+ collateralization, excluding billions from accessing credit
- **AI Agents:** Despite managing millions in assets, autonomous agents have no path to credit
- Traditional credit scores are black boxes with no transparency or user control

### Our Vision

Obsidian Protocol creates verifiable credit attestations:
- **For Humans:** AI-powered analysis of financial documents with privacy preservation (planned)
- **For AI Agents:** On-chain performance metrics and revenue analysis (planned)
- **Universal:** One protocol serving all forms of intelligence

> We believe credit infrastructure must evolve to serve both human and artificial economic actors as AI agents become autonomous financial entities.

## ✨ Current Features

### 🔗 On-Chain Credit Attestations
- Separate attestation types for humans and AI agents
- Credit score storage with expiration timestamps
- PDA-based account architecture for gas efficiency
- Framework type tracking for AI agents (ElizaOS, AI16Z, Custom)

### 👥 Dual Entity Support
- Human credit profiles with employment verification placeholders
- AI agent profiles with framework type and operational metrics
- Universal schema supporting both entity types

### 💰 Basic Lending Infrastructure
- Loan request functionality linked to credit scores
- Status tracking (Requested, Approved, Funded, Repaid)
- Foundation for undercollateralized lending protocols

### 🎨 Interactive Frontend
- Next.js 15 web application
- Separate user flows for humans and AI agents
- Wallet integration with Solana Wallet Adapter
- Demo mode with simulated credit assessments

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐
│   Human Path    │     │  AI Agent Path   │
│   (Demo Mode)   │     │  (Demo Mode)     │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────┐
│         Mock Analysis Layer              │
│     (Development/Demonstration)          │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    Solana Smart Contracts (Devnet)      │
│    • Create/Update Attestations         │
│    • Request Loans                      │
│    • Close Attestations                 │
└─────────────────────────────────────────┘
```

### Planned Architecture

```
┌─────────────────────────────────────────┐
│         Credit Analysis Engine           │
│    • LLM based Document Analysis (Humans)   │
│    • On-Chain Metrics (AI Agents)       │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    Solana Attestation Service (SAS)     │
│         Full CPI Integration            │
└────────────────┬─────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      Undercollateralized Lending        │
│          Protocol Partners              │
└─────────────────────────────────────────┘
```

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tenequm/obsidian-protocol
cd obsidian-protocol
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example packages/app/.env.local
```

4. Build the project:
```bash
pnpm run setup
```

### Development

#### Run the web app:
```bash
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and add `?dev=true` to the URL for development mode.

#### Build Anchor program:
```bash
pnpm run build:anchor
```

#### Run tests:
```bash
pnpm run test
```

#### Start local validator:
```bash
pnpm run localnet
```

#### Deploy to Devnet:
```bash
pnpm run deploy:anchor
```

## 📁 Project Structure

```
obsidian-protocol/
├── packages/
│   ├── anchor/              # Solana program (Rust/Anchor)
│   │   ├── programs/        # Smart contracts
│   │   │   └── obsidianprotocol/
│   │   │       └── src/
│   │   │           └── lib.rs       # Main program logic
│   │   └── tests/           # Program tests
│   └── app/                 # Next.js frontend
│       ├── src/
│       │   ├── app/         # App routes & pages
│       │   ├── components/  # UI components
│       │   ├── lib/         # Utilities & test data
│       │   └── generated/   # TypeScript clients from IDL
│       └── public/
├── package.json             # Workspace root
└── pnpm-workspace.yaml      # pnpm workspace config
```

## 🛠️ Tech Stack

### Blockchain
- **Solana** - High-performance blockchain
- **Anchor 0.30** - Rust framework for Solana programs
- **Solana Web3.js** - Client-side interactions

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Component library
- **Solana Wallet Adapter** - Multi-wallet support

### Development Tools
- **pnpm** - Fast, efficient package manager
- **Anchor IDL** - Auto-generated TypeScript types
- **Vercel** - Frontend deployment

## 🎯 Smart Contract Instructions

### Credit Attestations
- `create_human_attestation` - Create credit attestation for humans
- `create_agent_attestation` - Create credit attestation for AI agents
- `update_human_attestation` - Update existing human attestation
- `update_agent_attestation` - Update existing agent attestation
- `close_attestation` - Close attestation and reclaim rent

### Lending
- `request_loan` - Request loan based on credit score

### Account Types
- `Attestation` - Stores credit score, entity type, timestamps
- `LoanAccount` - Tracks loan requests and status


## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
pnpm run test

# Run app tests only
pnpm run test:app

# Build everything
pnpm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

Built for the [Colosseum Cypherpunk Hackathon](https://www.colosseum.org/cypherpunk) 2025

Special thanks to:
- Solana Foundation for the blockchain infrastructure and Attestation Service
- Colosseum for the hackathon opportunity and support
- The Solana developer community for tools and guidance

## 📬 Contact

- Website: [obsidian.credit](https://obsidian.credit)
- Twitter: [@obsidiancredit](https://x.com/obsidiancredit)
- GitHub: [obsidian-protocol](https://github.com/tenequm/obsidian-protocol)

## ⚠️ Disclaimers

- **Experimental Software**: This is a prototype under active development
- **Not Audited**: Smart contracts have not undergone security audits
- **Demo Mode**: Current credit analysis uses simulated data
- **Devnet Only**: Not deployed to mainnet
- **No Financial Advice**: This is experimental technology

---

**Built with ❤️ on Solana**
