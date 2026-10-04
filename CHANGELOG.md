# Changelog

## Unreleased ? repository reliability work

- Added read-only Soroban invocation simulation in core, CLI and MCP.
- Added shared RPC validation, safe error context and expanded error mappings.
- Replaced Doctor substring checks with TOML parsing, contract layout diagnostics and optional bounded tool probes.
- Fixed WASM hashing, parsed event values/cursors and transaction result-code handling.
- Added behavioral tests for simulation, inspectors, Doctor, error mappings, MCP and Action.
- Repaired MCP runtime validation, Action outputs/build setup and CLI executable packaging.
- Corrected repository links, deployment instructions, API/contributor documentation and phase claims.

This is unreleased work. Core/diagnostics source APIs identify as 0.1.0; their manifests now agree. CLI/stellar/ui/web remain 0.0.1, and integrations remain 0.1.0. Package versions need not imply synchronized publication. No npm package, GitHub release or Marketplace listing was created for this pass.

## Historical foundation

Initial pnpm/Turbo monorepo, Next.js application, TypeScript tooling and initial inspection tools were added in earlier commits. The earlier changelog's v0.0.1 release link was unverified; commit history is the evidence for those changes.
