# Changelog

## [Unreleased] - 2026-11-03

### Added
- **Event Viewer Web Interface**: Implemented full web UI for contract event viewing (`apps/web/src/app/tools/events/page.tsx`)
- **7 New Contributor Issues**: Added high-value contributor issues (Medium-High complexity) in `docs/WAVE_ISSUES_SUBSTANTIAL.md`:
  - Transaction Simulation Web UI
  - Contract Specification Extraction
  - Storage Key Inspection with TTL
  - Error Recovery Guidance System
  - Account History Viewer
  - Real-time RPC Health Monitoring Dashboard  
  - Contract Deployment Verification Tool
- **Enhanced Documentation**: Improved README with concrete use cases and clearer positioning

### Changed
- **Security Upgrades**: 
  - Upgraded Vitest from ^1.2.0 → ^5.1.0 (resolves CRITICAL vulnerabilities CVE-2025-xxxx)
  - Upgraded @types/node from ^20.11.0 → ^22.0.0 (peer dependency compatibility)
  - MCP SDK already at 1.24.0 (DNS rebinding fix verified)
- **Node.js Version Alignment**: Engines requirement now properly reflects Node.js 22 baseline (PR #85)
- **GitHub Action Input Validation**: Strict boolean validation for fail-on-error and check-tools (PR #87)

### Fixed
- Event Viewer now available in web interface (was CLI/MCP only)
- All dependency peer warnings resolved
- Build passes with upgraded dependencies

### Security
- **Resolved all CRITICAL severity vulnerabilities** from prior dependency audit
- Vitest UI Server arbitrary file read/execute vulnerability patched
- Tinypool prototype pollution RCE vulnerability patched
- MCP SDK DNS rebinding protection verified (stdio transport unaffected)

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
