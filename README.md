# Obsidian Debug

AI-powered Solana transaction debugger. Analyzes failed transactions and provides actionable fixes.

[![Built on Solana](https://img.shields.io/badge/Built%20on-Solana-blueviolet)](https://solana.com)
[![Hackathon](https://img.shields.io/badge/Colosseum-Cypherpunk%202025-yellow)](https://www.colosseum.org/cypherpunk)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **🚀 Powered by [`solana-idls`](https://github.com/tenequm/solana-idls)** - A standalone npm package providing 1,786+ error definitions from 41 Solana protocols. Published for ecosystem-wide use.

## Live Demo

**[soldebug.dev](https://soldebug.dev)**

## Overview

Solana transaction errors are cryptic (`custom program error: 0x1772`, `InstructionError: [2, Custom(6001)]`). This tool translates them into human-readable explanations with specific fixes.

**Key features:**
- **1,786 error definitions** from 41 protocols (extracted directly from IDLs)
- **Multi-source parsing**: Helius (semantic) + raw RPC (blockchain order)
- **AI-powered analysis**: Gemini 2.5 Flash for root cause identification
- **Instruction ordering fix**: Correctly maps errors using blockchain order (not Helius reordered)

## Error Database

The debugger uses [`solana-idls`](https://github.com/tenequm/solana-idls) - a standalone TypeScript package providing error resolution, instruction metadata, and account names for 41 Solana protocols:

| Category | Protocols | Error Count |
|----------|-----------|-------------|
| DeFi & Swaps | Jupiter, Raydium, Meteora, Orca, Phoenix, OpenBook, Serum | 526 |
| Meme Tokens | Pump.fun, Moonshot, Boop, Heaven, BonkSwap | 222 |
| NFTs | Metaplex (Token Metadata, Candy Machine, Bubblegum, etc.) | 604 |
| Infrastructure | SPL Token, Token-2022, Drift, Anchor Framework | 434 |

All data extracted from official program IDLs for 100% accuracy.

## Architecture

```
Transaction Signature
        ↓
Multi-Source Fetch (parallel)
├── Helius SDK → semantic data
└── Raw RPC → blockchain order
        ↓
Three-Stage Pipeline
├── 1. FETCH
├── 2. NORMALIZE → DebugTransaction
└── 3. ENRICH → error resolution, log parsing, program metadata
        ↓
AI Analysis (Gemini 2.5 Flash)
        ↓
Structured Report
├── What went wrong (1 sentence)
├── Why it failed (2-3 bullets)
└── How to fix (specific steps)
```

### Technical Implementation

**Instruction Ordering Bug Fix**: Helius SDK reorders ComputeBudget instructions to the end, but Solana error indices reference the original blockchain order. Our pipeline uses raw RPC `compiledInstructions` to ensure accurate error-to-program mapping.

**IDL-Based Resolution**: Errors are resolved by program ID and error code against a pre-built database extracted from official IDLs, not pattern matching or guessing.

**Multi-Source Strategy**: Combining Helius (high-level actions, token transfers) with raw RPC (exact instruction order, logs) provides complete context while preserving correctness.

## Installation

```bash
git clone https://github.com/tenequm/obsidian-debug
cd obsidian-debug
pnpm install
```

Create `.env.local`:
```bash
cp .env.example apps/frontend/.env.local
```

Add your Helius API key:
```env
HELIUS_API_KEY=your_helius_api_key
```

Get a free API key at [helius.dev](https://helius.dev)

## Development

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Build for production
pnpm lint         # Run Biome linter
pnpm format       # Format code with Biome
```

## Tech Stack

**Frontend**
- Next.js 16.0 (App Router)
- React 19.2
- TypeScript 5.9
- Tailwind CSS 4
- shadcn/ui components

**AI & Data**
- Vercel AI SDK
- Google AI SDK (Gemini 2.5 Flash)
- Helius SDK (transaction parsing)
- @solana/web3.js

**Tooling**
- Biome (linter/formatter)
- pnpm (package manager)
- Turbo (monorepo build system)

## Project Structure

This is a monorepo containing the Obsidian Debug web application. The error resolution library has been published as a separate package on npm.

```
obsidian-protocol/
└── apps/
    └── frontend/          # Next.js web application
```

## Related Projects

**[solana-idls](https://github.com/tenequm/solana-idls)** - TypeScript library providing error resolution and instruction metadata for 41+ Solana protocols. Published on npm, built for this debugger, available for ecosystem-wide use.

## Acknowledgments

Built on top of:
- [helius-labs/xray](https://github.com/helius-labs/xray) - Transaction parsing patterns
- [bitquery/solana-idl-lib](https://github.com/bitquery/solana-idl-lib) - IDL collection

Built for [Colosseum Cypherpunk Hackathon 2025](https://www.colosseum.org/cypherpunk)

## License

MIT - see [LICENSE](LICENSE) for details.

## Contact

- Website: [soldebug.dev](https://soldebug.dev)
- Twitter: [@obsidiandebug](https://x.com/obsidiandebug)
- GitHub: [obsidian-debug](https://github.com/tenequm/obsidian-debug)
