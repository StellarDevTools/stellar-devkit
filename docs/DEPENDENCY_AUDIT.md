# Dependency Audit Triage

**Date**: 2026-10-07  
**Context**: Pre-Drips Wave preparation

## Summary

The current audit reports **30+ advisories** across multiple severity levels. This document triages each finding for runtime applicability versus development-only exposure.

## Critical Findings

### 1. Vitest UI Server Vulnerability (GHSA-5xrq-8626-4rwp)
- **Package**: `vitest@1.6.1`
- **Issue**: Arbitrary file read/execute when UI server is listening
- **Severity**: Critical
- **Paths**: Dev dependency in root and all test packages
- **Applicability**: ❌ **NOT APPLICABLE**
  - CI uses `vitest run` (no UI server)
  - No UI server enabled in package scripts
  - Test-only dependency, never shipped to production
- **Recommendation**: Upgrade to `vitest@3.2.6+` when compatible with current setup
- **Mitigation**: Documented — UI server is not used

### 2. Tinypool Prototype Pollution RCE (GHSA-5gmw-xhrv-c9v3, GHSA-5xrq-8626-4rwp)
- **Package**: `tinypool@0.8.4` (transitive via vitest)
- **Issue**: Prototype pollution leading to RCE in worker options
- **Severity**: Critical
- **Applicability**: ❌ **NOT APPLICABLE**
  - Transitive test-only dependency
  - Tests use mocks and fixtures, no untrusted worker options
- **Recommendation**: Resolved by upgrading vitest
- **Mitigation**: Test environment isolation

## High Findings

### 3. MCP SDK DNS Rebinding (GHSA-w48q-cv73-mx4w, CVE-2025-66414)
- **Package**: `@modelcontextprotocol/sdk@0.5.0`
- **Issue**: HTTP-based servers lack DNS rebinding protection
- **Severity**: High
- **Applicability**: ⚠️ **PARTIAL**
  - MCP server uses stdio transport (unaffected)
  - HTTP transports not used in current implementation
  - Issue only affects unauthenticated localhost HTTP servers
- **Recommendation**: ✅ **SAFE TO UPGRADE** to `1.24.0+`
- **Action Required**: Upgrade and verify MCP integration tests pass

### 4-15. Undici Vulnerabilities (Multiple CVEs)
- **Package**: `undici@5.29.0` (transitive via @actions/http-client)
- **Issues**: Decompression DoS, request smuggling, various HTTP issues
- **Severity**: High/Moderate
- **Paths**: `@actions/core` → `@actions/http-client` → `undici`
- **Applicability**: ⚠️ **PARTIAL**
  - Only affects GitHub Action integration
  - Action runs in controlled GitHub runner environment
  - Not exposed to untrusted network inputs
- **Recommendation**: Blocked by upstream `@actions/core` dependency
- **Mitigation**: GitHub Actions runner environment provides isolation
- **Action**: Monitor for @actions/core update

## Moderate Findings

### 16. esbuild CORS Bypass (GHSA-67mh-4wv8-2f99)
- **Package**: `esbuild@0.21.5` (transitive via vite)
- **Issue**: Dev server allows cross-origin requests
- **Severity**: Moderate
- **Applicability**: ❌ **NOT APPLICABLE**
  - Affects dev server only
  - Not used in production builds
- **Recommendation**: Resolved by upgrading vite/vitest

### 17-20. Vite Vulnerabilities
- **Package**: `vite` (transitive via vitest)
- **Issues**: Various dev server and build issues
- **Applicability**: ❌ **NOT APPLICABLE** (test-only)
- **Recommendation**: Upgrade vitest to resolve

### 21-24. PostCSS Vulnerabilities
- **Package**: `postcss` (transitive via Next.js and Tailwind)
- **Issues**: Parser vulnerabilities
- **Severity**: Moderate
- **Applicability**: ⚠️ **PARTIAL**
  - Affects web app build process
  - Input controlled (local CSS files only)
  - Not exposed to untrusted CSS
- **Recommendation**: Blocked by Next.js/Tailwind upstream
- **Mitigation**: No untrusted CSS processed

### 25. Toml Parser (transitive via @stellar/stellar-sdk)
- **Package**: `toml` (transitive via stellar-sdk)
- **Issues**: Parser vulnerabilities
- **Severity**: Moderate
- **Applicability**: ⚠️ **REVIEW NEEDED**
  - stellar-sdk uses toml for stellar.toml parsing
  - Doctor tool parses Cargo.toml (TOML format)
  - May be exposed to untrusted TOML files
- **Recommendation**: Blocked by stellar-sdk
- **Mitigation**: Validate TOML file sources in documentation
- **Action**: Check if Doctor uses the same toml parser

### 26-27. Turbo Build Tool
- **Package**: `turbo` (dev dependency)
- **Issues**: Build tool vulnerabilities
- **Applicability**: ❌ **NOT APPLICABLE** (dev-only)

### 28. Source-map-js
- **Package**: `source-map-js` (transitive via postcss)
- **Issue**: Parser issue
- **Severity**: Moderate
- **Recommendation**: Update available via `pnpm update source-map-js`

### 29. Braces
- **Package**: `braces` (deep transitive via eslint)
- **Severity**: Moderate
- **Applicability**: ❌ **NOT APPLICABLE** (linter dependency)

### 30. @fastify/busboy
- **Package**: `@fastify/busboy` (transitive via undici)
- **Severity**: Moderate
- **Applicability**: Covered by undici triage above

### 31. postcss-selector-parser
- **Package**: `postcss-selector-parser` (transitive via tailwindcss)
- **Severity**: Moderate
- **Applicability**: ❌ **NOT APPLICABLE** (build-time, controlled input)

## Recommended Actions

### Immediate (Safe Upgrades)

1. **✅ Upgrade @modelcontextprotocol/sdk**
   ```bash
   cd integrations/mcp
   pnpm add @modelcontextprotocol/sdk@^1.24.0
   ```
   - High severity, direct dependency
   - Backward compatible (stdio transport unaffected)
   - Test: Run MCP integration tests

2. **✅ Upgrade source-map-js (if possible)**
   ```bash
   pnpm update source-map-js --recursive
   ```
   - Moderate severity, transitive
   - Low risk

### Medium Priority (Test Before Merging)

3. **⚠️ Upgrade vitest to 3.2.6+**
   - Resolves: Critical vitest + tinypool, moderate esbuild/vite
   - Risk: Major version bump may have breaking changes
   - Test: Full test suite must pass
   ```bash
   # In root package.json
   pnpm add -D vitest@^3.2.6 -w
   ```

### Blocked by Upstream

4. **Undici** (via @actions/core) — Monitor GitHub Actions for updates
5. **PostCSS** (via Next.js/Tailwind) — Monitor for framework updates
6. **Toml** (via stellar-sdk) — Document untrusted input risks

## Testing Protocol

After any dependency upgrade:

```bash
pnpm install --frozen-lockfile  # Should fail if lockfile needs update
pnpm install                     # Update lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
# Test packaged Action
cd integrations/github-action && pnpm package
# Test MCP server
cd integrations/mcp && node dist/index.js
```

## Documentation Updates

- Add warning in README: "Do not process untrusted TOML files with Doctor"
- Document that stellar-sdk uses toml parser for stellar.toml
- Note that Action runs in GitHub's controlled environment

## Future Work

- Set up Dependabot or Renovate for automated dependency PRs
- Add `pnpm audit --audit-level high` to CI (fail on high/critical)
- Consider vendoring critical parsers if upstream patches lag

---

**Status**: Triage complete. Safe upgrade path identified. MCP SDK upgrade ready. Vitest upgrade needs testing.
