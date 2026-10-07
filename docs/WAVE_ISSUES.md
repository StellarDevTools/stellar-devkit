# Drips Wave Ready Issues

These issues are scoped for external contributors participating in the Drips Wave. Each issue is self-contained, has clear acceptance criteria, and includes file locations.

## Documentation

### Issue 1: Add CLI Command Examples to Each Tool's Help Text
**Context**: The CLI help currently shows flags but no usage examples. Adding inline examples would improve discoverability without requiring users to check separate docs.

**Acceptance Criteria**:
- Add 1-2 realistic examples to each command's help text in `packages/cli/src/commands/`
- Examples must use placeholder values (e.g., `$CONTRACT_ID`, not real IDs)
- Include both simple and advanced usage (e.g., with `--json`, `--network`)
- Test with `node dist/stellar-dev.mjs <command> --help`

**Files to Touch**:
- `packages/cli/src/commands/account.ts`
- `packages/cli/src/commands/contract.ts`
- `packages/cli/src/commands/transaction.ts`
- `packages/cli/src/commands/simulate.ts`
- `packages/cli/src/commands/events.ts`

**Labels**: docs, good first issue  
**Complexity**: Trivial

---

### Issue 2: Document TOML Parser Security Boundary
**Context**: Per DEPENDENCY_AUDIT.md, the stellar-sdk uses a `toml` parser with known vulnerabilities. We need to document safe usage and untrusted input warnings.

**Acceptance Criteria**:
- Add a security note to README.md warning against processing untrusted TOML files
- Document in docs/DIAGNOSTICS.md that Doctor parses local Cargo.toml files (trusted)
- Clarify in docs/API.md that stellar.toml fetching (if exposed) has parser risk
- Add a test verifying Doctor rejects symlinks or paths outside the target directory

**Files to Touch**:
- `README.md` (security section or limits)
- `docs/DIAGNOSTICS.md`
- `docs/API.md`
- `packages/diagnostics/src/doctor.ts` (path validation test)

**Labels**: docs, security  
**Complexity**: Medium

---

### Issue 3: Add Troubleshooting Guide for Common Errors
**Context**: Users may encounter RPC timeouts, invalid XDR, or network issues. A troubleshooting doc would reduce support load.

**Acceptance Criteria**:
- Create `docs/TROUBLESHOOTING.md` with sections: RPC errors, XDR decoding failures, network configuration, Doctor issues
- Each section: symptom → diagnosis → resolution
- Link from README and CLI error messages where applicable
- Include `stellar-cli` and Stellar Lab cross-references for unsupported workflows

**Files to Touch**:
- `docs/TROUBLESHOOTING.md` (new file)
- `README.md` (link in "Contribute" or "Run from source")
- Optionally: CLI error handlers to reference the doc

**Labels**: docs, enhancement, good first issue  
**Complexity**: Medium

---

## Testing

### Issue 4: Add Unit Tests for Error Registry Pattern Matching
**Context**: The error explainer uses regex/substring matching (`packages/diagnostics/src/error-registry.ts`). Edge cases (partial matches, case sensitivity, overlapping patterns) need explicit coverage.

**Acceptance Criteria**:
- Add tests to `packages/diagnostics/src/error-registry.test.ts` covering:
  - Exact match
  - Partial match
  - Case-insensitive match
  - No match (unknown error)
  - Overlapping patterns (ensure most-specific wins)
- All tests must pass without changing existing behavior

**Files to Touch**:
- `packages/diagnostics/src/error-registry.test.ts` (new file or extend existing)
- Verify with `pnpm --filter @stellar-devkit/diagnostics test`

**Labels**: tests, good first issue  
**Complexity**: Trivial

---

### Issue 5: Add Fixture-Based XDR Decoder Tests
**Context**: XDR decoding tests exist but lack coverage for edge cases (fee-bump envelopes, v3 transaction metadata, malformed XDR).

**Acceptance Criteria**:
- Add XDR test fixtures to `packages/core/src/__fixtures__/` for:
  - Fee-bump envelope (should warn about limited support)
  - Transaction with v3 metadata (operations, events)
  - Invalid/truncated XDR (should error gracefully)
- Tests in `packages/core/src/xdr/decoder.test.ts` must assert expected warnings/errors
- Document fixture sources (e.g., "generated via stellar-cli" or "from testnet tx X")

**Files to Touch**:
- `packages/core/src/__fixtures__/` (add XDR files)
- `packages/core/src/xdr/decoder.test.ts`
- `packages/core/src/xdr/decoder.ts` (if bug fixes needed)

**Labels**: tests, enhancement  
**Complexity**: Medium

---

### Issue 6: Add MCP Server Transport Test with Mock stdio
**Context**: Issue #10 notes that MCP server lacks deterministic transport tests. We need a test that verifies stdio request/response without a real MCP client.

**Acceptance Criteria**:
- Add test to `integrations/mcp/src/index.test.ts` that:
  - Mocks stdin/stdout
  - Sends a valid MCP `tools/list` request
  - Verifies response structure and tool definitions
- Test must not require external dependencies or network
- Verify with `pnpm --filter @stellar-devkit/mcp-server test`

**Files to Touch**:
- `integrations/mcp/src/index.test.ts` (new file or extend existing)
- `integrations/mcp/src/index.ts` (may need test-only export)

**Labels**: tests, enhancement  
**Complexity**: Medium

---

## Features

### Issue 7: Add --output-file Flag to CLI Commands
**Context**: Users may want to save JSON output to a file for processing. Currently, they must use shell redirection.

**Acceptance Criteria**:
- Add `--output-file <path>` flag to all CLI commands
- If specified, write JSON output to file instead of stdout
- Non-JSON output (human-readable) still goes to stdout
- Error if file exists unless `--force` is also passed
- Add tests verifying file is written with correct content

**Files to Touch**:
- `packages/cli/src/commands/*.ts` (add flag to each command)
- `packages/cli/src/index.ts` (common flag definition)
- Test with `node dist/stellar-dev.mjs explain "error" --json --output-file out.json`

**Labels**: enhancement, cli  
**Complexity**: Medium

---

### Issue 8: Support Contract ID Short Format (C...)
**Context**: Stellar contract IDs can be displayed as `C...` strings (e.g., `CABC...`). CLI currently requires full StrKey format. Supporting both improves UX.

**Acceptance Criteria**:
- Detect and accept both full StrKey (`CXXXXX...`) and short format (`C...`) for contract IDs
- Add validation helper to `packages/stellar/src/contract.ts`
- Update `contract`, `events`, and `simulate` commands to use the helper
- Add tests for both formats
- Document in CLI help text

**Files to Touch**:
- `packages/stellar/src/contract.ts` (new validation helper)
- `packages/cli/src/commands/contract.ts`
- `packages/cli/src/commands/events.ts`
- `packages/cli/src/commands/simulate.ts`
- `packages/stellar/src/contract.test.ts` (tests)

**Labels**: enhancement, good first issue  
**Complexity**: Medium

---

## Bugs

### Issue 9: Fix Doctor False Negative on Nested Cargo Workspaces
**Context**: Issue #6 notes that Doctor doesn't resolve workspace members. If a Soroban project uses a nested workspace, Doctor may miss the contract crate.

**Acceptance Criteria**:
- Add test fixture: nested Cargo workspace with contract in `contracts/` subdirectory
- Doctor should detect the contract crate via workspace members resolution
- If workspace member parsing fails, emit a warning (don't error)
- Add test to `packages/diagnostics/src/doctor.test.ts`

**Files to Touch**:
- `packages/diagnostics/src/doctor.ts` (parse `[workspace]` members)
- `packages/diagnostics/src/__fixtures__/nested-workspace/` (test fixture)
- `packages/diagnostics/src/doctor.test.ts`

**Labels**: bug, enhancement  
**Complexity**: High

---

### Issue 10: Improve RPC Error Messages for Network Timeouts
**Context**: RPC calls can timeout or fail with cryptic errors. Users need actionable messages (e.g., "Check --rpc-url" or "Verify network connectivity").

**Acceptance Criteria**:
- Wrap RPC call errors in `packages/core/src/rpc/client.ts` with user-friendly messages
- Detect common cases: timeout, connection refused, invalid URL, 404 (wrong endpoint)
- Include troubleshooting hint in error message (e.g., "See docs/TROUBLESHOOTING.md")
- Add tests for each error case with mocked fetch failures

**Files to Touch**:
- `packages/core/src/rpc/client.ts` (error wrapper)
- `packages/core/src/rpc/client.test.ts` (mock error scenarios)
- CLI commands (ensure error is displayed, not swallowed)

**Labels**: bug, ux  
**Complexity**: Medium

---

## Infrastructure

### Issue 11: Add pnpm audit Check to CI
**Context**: Per DEPENDENCY_AUDIT.md, dependency vulnerabilities should be tracked. Adding `pnpm audit` to CI ensures new high/critical issues are flagged.

**Acceptance Criteria**:
- Add a CI job to `.github/workflows/ci.yml` that runs `pnpm audit --audit-level high`
- Job should fail if high or critical vulnerabilities are found
- Document in DEPENDENCY_AUDIT.md how to update the baseline when intentionally accepting a risk
- Job should run after `pnpm install` step

**Files to Touch**:
- `.github/workflows/ci.yml`
- `docs/DEPENDENCY_AUDIT.md` (add CI section)

**Labels**: enhancement, ci  
**Complexity**: Trivial

---

### Issue 12: Add Deployment Verification Checklist
**Context**: docs/DEPLOYMENT.md exists but lacks a pre-deploy checklist. Contributors deploying the web app or updating the Action need a runbook.

**Acceptance Criteria**:
- Add "Pre-Deployment Checklist" section to `docs/DEPLOYMENT.md`:
  - [ ] Run full test suite
  - [ ] Verify Action bundle with `pnpm --filter @stellar-devkit/github-action package`
  - [ ] Test MCP server with `claude-mcp-inspector` or equivalent
  - [ ] Check Vercel preview build
  - [ ] Review CHANGELOG.md
- Add "Rollback Plan" section
- Link from README if deployment is mentioned

**Files to Touch**:
- `docs/DEPLOYMENT.md`

**Labels**: docs, enhancement, good first issue  
**Complexity**: Trivial

---

## Summary

| Complexity | Count |
|------------|-------|
| Trivial    | 4     |
| Medium     | 7     |
| High       | 1     |

**Total**: 12 issues

**Label Distribution**:
- docs: 4
- tests: 3
- enhancement: 7
- bug: 2
- good first issue: 5
- security: 1
- ux: 1
- ci: 1
- cli: 1

All issues are scoped to avoid large rewrites, have clear file paths, and can be completed independently.
