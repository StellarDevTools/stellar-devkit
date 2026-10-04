# Roadmap

This is an engineering backlog, not a completion or delivery guarantee.

## Implemented foundation

- pnpm/Turbo monorepo and typed reusable packages.
- CLI, six web tool pages, MCP server and Project Doctor Action.
- XDR/account/RPC inspection, contract WASM identification, transaction diagnostics.
- Read-only simulation and typed event decoding with pagination.
- Manifest-aware Doctor and shared error explanations.

## Current contributor priorities

The [public issue backlog](CONTRIBUTING.md#finding-work) is authoritative. Important remaining areas include contract specifications/storage, metadata version coverage, event and simulation web interfaces, workspace-aware diagnostics, broader transport/CLI/browser tests and reliable release automation.

Phase 0 established the foundation. Phase 1 delivered initial tools with limited coverage. Phase 2 was only partially implemented in the original reports; this pass adds simulation and repairs the integrations. It does not make all roadmap features complete.

## Future exploration

VS Code integration, optional live-network smoke tests and richer contract diagnostics. Security scanning, performance recommendations and plugin APIs require separate designs and validation. No signing or transaction submission is planned in this work.
