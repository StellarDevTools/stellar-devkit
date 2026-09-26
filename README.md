# Stellar DevKit

**Developer toolbox for building, inspecting, testing, debugging, and understanding Stellar and Soroban applications.**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![CI](https://github.com/stellar-devkit/stellar-devkit/workflows/CI/badge.svg)](https://github.com/stellar-devkit/stellar-devkit/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-8.15-orange)](https://pnpm.io/)

---

## Overview

Stellar DevKit is a comprehensive, open-source developer platform for the Stellar ecosystem. It combines diagnostic tools, inspection utilities, and debugging capabilities into a unified experience for Stellar and Soroban developers.

**Not another:** wallet, block explorer, payment app, or Stellar CLI replacement.

**Instead:** A powerful diagnostic and inspection platform that improves the Stellar developer experience.

---

## Features

### Phase 1 ✅ Complete

- **🏥 Project Doctor** - Comprehensive diagnostics for Stellar/Soroban projects
- **🔍 Error Explainer** - Human-readable explanations for Soroban errors
- **📦 XDR Decoder** - Decode and understand Stellar XDR
- **👤 Account Inspector** - Inspect Stellar accounts and balances
- **🌐 RPC Health Checker** - Monitor Stellar network and RPC health

### Phase 2 ✅ Complete

- **📜 Contract Inspector** - Inspect deployed Soroban contracts
- **🔗 Transaction Inspector** - Detailed transaction analysis with error diagnostics
- **📊 Event Viewer** - Query and inspect contract events (CLI)
- **🤖 MCP Server** - AI assistant integration with 8 read-only tools
- **🚀 GitHub Action** - CI/CD integration for project diagnostics
- **⏳ Transaction Simulation** - Planned for Phase 2.1

### Phase 3 (Future)

- **💻 VS Code Extension** - IDE integration
- **🔒 Security Analysis** - Contract security scanning
- **⚡ Performance Analysis** - Gas optimization recommendations
- **🔌 Plugin Architecture** - Community extensions

---

## Installation

### CLI

```bash
# Using pnpm
pnpm add -g @stellar-devkit/cli

# Using npm
npm install -g @stellar-devkit/cli

# Using yarn
yarn global add @stellar-devkit/cli
```

### Web Application

Visit [stellar-devkit.dev](https://stellar-devkit.dev) (coming soon)

Or run locally:

```bash
git clone https://github.com/stellar-devkit/stellar-devkit.git
cd stellar-devkit
pnpm install
pnpm dev
```

---

## Quick Start

### CLI Usage

```bash
# Check your Stellar/Soroban project
stellar-dev doctor .

# Inspect a Stellar account
stellar-dev account GACCOUNT...

# Decode XDR
stellar-dev xdr decode AAAAAgAAAAD...

# Check RPC health
stellar-dev rpc health --network testnet

# Explain a Soroban error
stellar-dev explain "HostError: Error(Storage, MissingValue)"

# Inspect a contract (Phase 2)
stellar-dev contract CCONTRACT...

# Inspect a transaction (Phase 2)
stellar-dev transaction TXHASH...

# Query contract events (Phase 2)
stellar-dev events --contract-id CCONTRACT...

# Get help
stellar-dev --help
```

### JSON Output

All commands support JSON output for scripting and automation:

```bash
stellar-dev doctor . --json
stellar-dev account GACCOUNT... --json --network testnet
```

---

## Architecture

Stellar DevKit is built as a **monorepo** with reusable packages:

```
stellar-devkit/
├── apps/
│   └── web/                    # Next.js web application
├── packages/
│   ├── core/                  # Core business logic
│   ├── diagnostics/           # Diagnostic engine & rules
│   ├── stellar/               # Stellar SDK abstractions
│   ├── cli/                   # CLI implementation
│   └── ui/                    # Shared UI components
└── integrations/              # MCP Server, GitHub Action (VS Code future)
```

**Key Principle:** Business logic lives in reusable packages, not in React components or CLI handlers.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

---

## Development

### Prerequisites

- Node.js 18+ ([install](https://nodejs.org/))
- pnpm 8+ ([install](https://pnpm.io/installation))
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/stellar-devkit/stellar-devkit.git
cd stellar-devkit

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start web app in development mode
pnpm dev
```

### Useful Commands

```bash
pnpm build          # Build all packages
pnpm dev            # Start development server
pnpm test           # Run tests
pnpm lint           # Lint code
pnpm typecheck      # Type check
pnpm format         # Format code
pnpm clean          # Clean build artifacts
```

### Running Individual Packages

```bash
# Build only the core package
pnpm --filter @stellar-devkit/core build

# Test only the diagnostics package
pnpm --filter @stellar-devkit/diagnostics test

# Run web app
pnpm --filter @stellar-devkit/web dev
```

---

## Supported Networks

- **Testnet** (default) - `https://soroban-testnet.stellar.org`
- **Futurenet** - `https://rpc-futurenet.stellar.org`
- **Mainnet** - Custom RPC endpoint required (no public SDF endpoint)

Configure custom RPC endpoints via CLI flags or web UI.

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- How to contribute
- Development setup
- Code style guidelines
- Pull request process
- Issue templates

### Good First Issues

Looking for a place to start? Check out issues labeled [`good first issue`](https://github.com/stellar-devkit/stellar-devkit/labels/good%20first%20issue).

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the complete project roadmap.

**Current Status:** Phase 2 Complete - 8 CLI tools, 6 web pages, MCP server, GitHub Action

---

## Security

We take security seriously. See [SECURITY.md](SECURITY.md) for our security policy and how to report vulnerabilities.

**Important:** Stellar DevKit never requests, stores, or logs private keys or seed phrases.

---

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System architecture and design principles
- [Roadmap](ROADMAP.md) - Development roadmap and phases
- [Contributing](CONTRIBUTING.md) - Contribution guidelines
- [Security](SECURITY.md) - Security policy
- [API Reference](docs/API.md) - Package API documentation (Phase 1)
- [CLI Reference](docs/CLI.md) - CLI usage guide (Phase 1)

---

## Tech Stack

- **Languages:** TypeScript, Rust (minimal)
- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Build:** Turborepo, pnpm workspaces
- **Testing:** Vitest
- **Stellar:** `@stellar/stellar-sdk` v13+
- **Linting:** ESLint, Prettier

---

## License

Apache License 2.0 - see [LICENSE](LICENSE) for details.

---

## Acknowledgements

Built with ❤️ for the Stellar developer community.

Special thanks to:
- Stellar Development Foundation for the official SDKs
- All contributors and community members

---

## Links

- **Website:** [stellar-devkit.dev](https://stellar-devkit.dev) (coming soon)
- **GitHub:** [github.com/stellar-devkit/stellar-devkit](https://github.com/stellar-devkit/stellar-devkit)
- **Issues:** [github.com/stellar-devkit/stellar-devkit/issues](https://github.com/stellar-devkit/stellar-devkit/issues)
- **Discussions:** [github.com/stellar-devkit/stellar-devkit/discussions](https://github.com/stellar-devkit/stellar-devkit/discussions)
- **Stellar Docs:** [developers.stellar.org](https://developers.stellar.org)

---

## Status

**Phase 0: Foundation** - ✅ Complete

**Phase 1: Core Tools** - ✅ Complete
- 5 diagnostic tools operational
- CLI with 8 commands
- Web application with 6 tool pages
- 27/27 tests passing

**Phase 2: Advanced Tools & Integrations** - ✅ Complete
- Contract, Transaction, and Event inspection
- MCP Server for AI assistants
- GitHub Action for CI/CD

See [ROADMAP.md](ROADMAP.md), [PHASE_1_REPORT.md](PHASE_1_REPORT.md), and [PHASE_2_REPORT.md](PHASE_2_REPORT.md) for complete details.

---

**Built for developers, by developers.**
