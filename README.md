# Stellar DevKit

Read-only inspection and diagnostics for Stellar and Soroban developers.

[![CI](https://github.com/StellarDevTools/stellar-devkit/actions/workflows/ci.yml/badge.svg)](https://github.com/StellarDevTools/stellar-devkit/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

[Web application](https://stellar-devkit-eta.vercel.app) • [Contributor issues](https://github.com/StellarDevTools/stellar-devkit/issues) • [CLI reference](docs/CLI.md)

## Why Stellar DevKit?

Stellar DevKit complements Stellar Lab and stellar-cli with read-only diagnostics for local and deployed contracts. It provides Project Doctor for validating Soroban project structure, MCP integration for Claude and other AI tools, and read-only transaction simulation without signing or submitting. The web interface decodes XDR and inspects accounts/contracts without managing keys or production workflows.

<!-- TODO: Add screenshot/GIF demonstrating CLI + web interface -->

## What works

| Tool                  | Capability                                                                                               | Interface                     |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Project Doctor        | Parse Cargo manifests, check contract crate/source layout and local tooling                              | CLI, MCP (files only), Action |
| Error Explainer       | Pattern-based host, storage, budget, authorization, transaction and RPC explanations                     | CLI, web, MCP                 |
| XDR Decoder           | Transaction envelope and transaction decoding; operation summaries                                       | CLI, web, MCP                 |
| Account Inspector     | Horizon balances, signers, thresholds and flags                                                          | CLI, web, MCP                 |
| RPC Health            | Health, latest ledger and bounded request time                                                           | CLI, web, MCP                 |
| Contract Inspector    | Validated ID, WASM SHA-256/size, instance modification and TTL ledgers                                   | CLI, web, MCP                 |
| Transaction Inspector | Status, sequence, operation/result codes, v3 events and raw metadata                                     | CLI, web, MCP                 |
| Event Viewer          | Contract/type filters, ledger/cursor pagination and decoded ScVals                                       | CLI, MCP                      |
| Simulation            | Read-only invokeHostFunction simulation, fees/resources, auth, return value, events and restore preamble | CLI, MCP                      |

Simulation never signs or submits transactions. An unsigned envelope still needs a valid source account and invocation. Results are estimates at the returned ledger, not a guarantee of later execution.

## Run from source

Use Node.js 22 and the pinned pnpm 8.15.0. npm publication has not been verified; source installation is the supported path for this development snapshot.

```bash
git clone https://github.com/StellarDevTools/stellar-devkit.git
cd stellar-devkit
corepack enable
corepack prepare pnpm@8.15.0 --activate
pnpm install --frozen-lockfile
pnpm build
node packages/cli/dist/stellar-dev.mjs --help
pnpm --filter @stellar-devkit/web dev
```

On Windows PowerShell with script execution disabled, use `pnpm.cmd`. The web app runs at http://localhost:3000.

```bash
node packages/cli/dist/stellar-dev.mjs doctor ./contracts/hello --no-check-tools --json
node packages/cli/dist/stellar-dev.mjs rpc health --network testnet
node packages/cli/dist/stellar-dev.mjs explain "Error(Auth, InvalidAction)"
node packages/cli/dist/stellar-dev.mjs simulate "$TRANSACTION_XDR" --network testnet --json
node packages/cli/dist/stellar-dev.mjs events --start-ledger 12345 --contract-id "$CONTRACT_ID" --json
```

Replace variables with public identifiers/XDR. Never provide a secret key or seed phrase. XDR and RPC responses can contain application data; inspect them before sharing.

## Architecture and validation

This is one pnpm/Turborepo monorepo. `packages/stellar` provides network/XDR/error helpers; `core` implements remote inspection and simulation; `diagnostics` implements local Doctor and re-exports the error registry. CLI, web, MCP and Action consume these packages. `ui` remains a placeholder.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Tests use mocks and local fixtures; normal CI does not require live Stellar networks or private keys. See the [readiness report](docs/archive/OPEN_SOURCE_READINESS_REPORT.md) for measured results rather than inferred coverage percentages.

## Limits and remaining work

- Event Viewer and simulation web interfaces are not implemented.
- Contract function specifications and arbitrary storage inspection are not implemented. The modification ledger is not a deployment ledger.
- Transaction metadata beyond v3 is preserved as XDR with a warning; fee-bump inner result analysis needs further work.
- Doctor does not compile contracts, execute project tests, resolve all workspace dependency inheritance, or audit contract security.
- Error matching is advisory; custom contract error numbers require the contract's own definitions.
- RPC history depends on the provider's retention window. Mainnet RPC tools require `--rpc-url` (health uses `--endpoint`). Account Inspector uses Horizon.
- Dependency audit findings remain open; see [upgrade/triage issue #14](https://github.com/StellarDevTools/stellar-devkit/issues/14) and [audit triage document](docs/DEPENDENCY_AUDIT.md).
- There is no built-in rate limiter, broad browser E2E suite, or verified npm/Marketplace release.

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md), [the real backlog](docs/CONTRIBUTOR_BACKLOG.md), [architecture](docs/ARCHITECTURE.md), [API](docs/API.md), [diagnostic guide](docs/DIAGNOSTICS.md), [error registry guide](docs/ERROR_REGISTRY.md), [roadmap](ROADMAP.md), and [deployment guide](docs/DEPLOYMENT.md).

Report vulnerabilities privately using [SECURITY.md](SECURITY.md). Contributions remain under [Apache 2.0](LICENSE). Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
