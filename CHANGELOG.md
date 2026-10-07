# Changelog

## [0.1.0] - 2026-10-07

### Added
- Read-only Soroban invocation simulation in core, CLI and MCP
- Shared RPC validation, safe error context and expanded error mappings
- Doctor now uses TOML parsing, contract layout diagnostics and optional bounded tool probes
- Behavioral tests for simulation, inspectors, Doctor, error mappings, MCP and Action
- Dependency audit triage document (docs/DEPENDENCY_AUDIT.md)
- Wave-ready contributor issues (docs/WAVE_ISSUES.md)
- "Why Stellar DevKit?" section in README
- packages/ui marked as planned with clear documentation

### Fixed
- WASM hashing, parsed event values/cursors and transaction result-code handling
- MCP runtime validation, Action outputs/build setup and CLI executable packaging
- Repository links, deployment instructions, API/contributor documentation and phase claims
- README link separators and readiness report path
- Archived phase reports to docs/archive/

### Changed
- Upgraded @modelcontextprotocol/sdk from 0.5.0 to 1.24.0 (resolves CVE-2025-66414)
- Moved test-xdr-gen.js to archive (unused development script removed)

### Security
- Triaged 30+ dependency advisories; documented applicability and safe upgrade paths
- MCP SDK upgrade addresses DNS rebinding vulnerability (high severity, not applicable to stdio transport)

**Status**: Development snapshot. Core/diagnostics identify as 0.1.0. CLI/stellar/ui/web remain 0.0.1, integrations remain 0.1.0. Package versions need not imply synchronized publication. No npm release, GitHub release, or Marketplace listing has been created yet.

## Historical foundation

Initial pnpm/Turbo monorepo, Next.js application, TypeScript tooling and initial inspection tools were added in earlier commits. The earlier changelog's v0.0.1 release link was unverified; commit history is the evidence for those changes.
