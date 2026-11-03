# Additional Substantial Wave Issues

These are medium-to-high complexity engineering issues that add real value to the Stellar DevKit project. Contributors working on these will gain deep experience with Stellar/Soroban development.

## Issue 13: Implement Transaction Simulation Web Interface

**Context**: The CLI and MCP have read-only transaction simulation (`simulate` command), but there's no web interface for it. This is a key diagnostic feature missing from the web app.

**Acceptance Criteria**:
- Create `apps/web/src/app/tools/simulate/page.tsx` with a form for transaction XDR input
- Support network selection (testnet/futurenet) and custom RPC URLs
- Display simulation results: success/failure, fees, resource usage, auth requirements, events
- Show restore preamble when contract instance/code TTLs are expired
- Parse and display any simulation errors with helpful context
- Add loading states and error handling for malformed XDR or RPC failures
- Update `apps/web/src/app/tools/page.tsx` to mark simulation as "Available"

**Files to Create/Modify**:
- `apps/web/src/app/tools/simulate/page.tsx` (new)
- `apps/web/src/app/tools/page.tsx` (update status)

**Skills Required**: TypeScript, React/Next.js, Stellar transaction simulation, XDR handling

**Labels**: enhancement, web, high-value  
**Complexity**: High

---

## Issue 14: Add Contract Function Specification Extraction

**Context**: Issue #2 (from CONTRIBUTOR_BACKLOG.md) - Soroban contracts embed their function specifications in the WASM. Extracting and displaying these would help developers understand contract interfaces without needing source code.

**Acceptance Criteria**:
- Parse `ScSpecEntry` from contract WASM using `@stellar/stellar-sdk`
- Extract function names, parameters, return types, and doc comments
- Add to contract inspector result type: `functions: ContractFunction[]`
- Display in CLI output (human-readable and JSON format)
- Add MCP tool: `stellar_contract_spec` with contract ID input
- Add web interface section in Contract Inspector page showing functions
- Handle contracts without embedded specs gracefully (show "No specification found")

**Files to Touch**:
- `packages/core/src/contract/inspector.ts` (add spec extraction)
- `packages/core/src/contract/types.ts` (add `ContractFunction` type)
- `packages/core/test/contract/inspector.test.ts` (add tests)
- `packages/cli/src/commands/contract.ts` (display spec)
- `integrations/mcp/src/tools/contract.ts` (add tool)
- `apps/web/src/app/tools/contract/page.tsx` (display spec)

**Reference**: [Stellar Docs - Contract Spec](https://developers.stellar.org/docs/build/smart-contracts/getting-started/storing-data#contract-specification)

**Labels**: enhancement, feature, soroban  
**Complexity**: High

---

## Issue 15: Implement Storage Key Inspection and TTL Display

**Context**: Issue #3 (from CONTRIBUTOR_BACKLOG.md) - Soroban contracts store data with TTL (time-to-live) ledger counts. Being able to inspect storage keys and their TTLs is critical for debugging contract state.

**Acceptance Criteria**:
- Use RPC `getLedgerEntries` to fetch contract storage entries
- Parse and decode storage keys (instance, persistent, temporary)
- Display key type, decoded key (if possible), value, and TTL ledger
- Add CLI command: `stellar-dev storage <contract-id> [options]`
- Support filtering by key type (--instance, --persistent, --temporary)
- Add MCP tool: `stellar_contract_storage` with contract ID and filters
- Add pagination support for contracts with many storage entries
- Show warnings for entries close to expiration (TTL < 100 ledgers)

**Files to Create/Modify**:
- `packages/core/src/contract/storage.ts` (new)
- `packages/core/src/contract/types.ts` (add storage types)
- `packages/core/src/contract/index.ts` (export)
- `packages/cli/src/commands/storage.ts` (new)
- `packages/cli/src/commands/index.ts` (register command)
- `integrations/mcp/src/tools/storage.ts` (new)
- `integrations/mcp/src/index.ts` (register tool)
- Tests for each layer

**Reference**: [Stellar Docs - Storage and State Expiration](https://developers.stellar.org/docs/learn/smart-contract-internals/state-archival)

**Labels**: enhancement, feature, soroban, high-value  
**Complexity**: High

---

## Issue 16: Add Comprehensive Error Context with Recovery Suggestions

**Context**: The current error explainer pattern-matches common errors, but doesn't provide actionable recovery steps. Enhance error diagnostics with concrete "what to do next" guidance.

**Acceptance Criteria**:
- Extend `packages/diagnostics/src/error-registry.ts` with `recovery` field
- Add recovery suggestions for all existing error patterns (auth, budget, storage, RPC)
- Include example commands or code snippets in recovery text where applicable
- Add test coverage for recovery suggestions
- Display recovery steps in CLI, web, and MCP outputs prominently
- Add new error patterns for common transaction failures (e.g., insufficient balance, invalid sequence number, bad auth)
- Create documentation page: `docs/ERROR_RECOVERY.md` with examples

**Example Recovery**:
```typescript
{
  pattern: 'Error(Budget, LimitExceeded)',
  context: 'Transaction exceeded the compute or memory budget',
  recovery: `
1. Optimize contract logic to reduce complexity
2. Split operation across multiple transactions
3. Increase resource limits (if testing): --fee <higher-fee> --instructions <higher-limit>
4. Review contract for infinite loops or expensive operations
  `.trim()
}
```

**Files to Modify**:
- `packages/diagnostics/src/error-registry.ts` (add recovery)
- `packages/diagnostics/src/types.ts` (add `recovery?: string`)
- `packages/cli/src/commands/explain.ts` (display recovery)
- `apps/web/src/app/tools/errors/page.tsx` (display recovery)
- `integrations/mcp/src/tools/explain.ts` (include recovery)
- `docs/ERROR_RECOVERY.md` (new)

**Labels**: enhancement, ux, diagnostics, good-for-contributors  
**Complexity**: Medium

---

## Issue 17: Add Horizon Account History and Operations Viewer

**Context**: Current Account Inspector shows balances/signers/thresholds but not transaction history. Add operation history viewing similar to Stellar Expert.

**Acceptance Criteria**:
- Use Horizon API `/accounts/{id}/operations` endpoint
- Display last N operations (default 10, max 100)
- Show operation type, timestamp, transaction hash, and key details
- Support pagination (cursor-based)
- Filter by operation type (payments, create_account, manage_data, etc.)
- Add CLI command: `stellar-dev account history <account-id> [--limit N] [--type TYPE]`
- Add MCP tool: `stellar_account_history`
- Add web interface tab in Account Inspector: "History"
- Link transaction hashes to Stellar Expert / StellarChain for deeper investigation

**Files to Create/Modify**:
- `packages/core/src/account/history.ts` (new)
- `packages/core/src/account/types.ts` (add operation types)
- `packages/core/src/account/index.ts` (export)
- `packages/cli/src/commands/account.ts` (add history subcommand)
- `integrations/mcp/src/tools/account.ts` (add history tool)
- `apps/web/src/app/tools/account/page.tsx` (add History tab)

**Skills Required**: TypeScript, Horizon API, pagination, React tabs/state management

**Labels**: enhancement, feature, stellar, medium-value  
**Complexity**: Medium

---

## Issue 18: Implement Real-time RPC Health Monitoring Dashboard

**Context**: Current RPC health check is one-shot. For production monitoring, developers need continuous health checks with alerting thresholds.

**Acceptance Criteria**:
- Create web dashboard: `apps/web/src/app/tools/monitor/page.tsx`
- Poll multiple RPC endpoints (user-configurable list) every N seconds
- Display: health status, latest ledger, response time, uptime %
- Color-code status: green (healthy), yellow (slow), red (down)
- Show historical graph of response times (last 60 data points)
- Alert indicators: response time > 2s, or unhealthy status
- Support testnet, futurenet, custom mainnet endpoints
- Add export to CSV for monitoring logs
- Persist endpoint list in localStorage

**Files to Create**:
- `apps/web/src/app/tools/monitor/page.tsx` (new dashboard)
- `apps/web/src/app/tools/page.tsx` (add monitor tool)

**Dependencies**: Consider using a charting library (e.g., recharts) for time-series graph

**Skills Required**: TypeScript, React hooks (useEffect, useState), polling, charting, localStorage

**Labels**: enhancement, web, monitoring, infrastructure  
**Complexity**: Medium-High

---

## Issue 19: Add Contract Deployment Verification Tool

**Context**: After deploying a contract, developers need to verify the deployed WASM matches their local build. This prevents supply chain attacks and deployment errors.

**Acceptance Criteria**:
- CLI command: `stellar-dev verify <contract-id> <wasm-file> [--network testnet]`
- Fetch deployed contract WASM from RPC
- Compute SHA-256 of both local and deployed WASM
- Compare hashes and report: ✓ Match or ✗ Mismatch
- If mismatch, show both hashes and warn about potential issues
- Add MCP tool: `stellar_verify_contract` with contract ID and local WASM path
- Add web interface: upload local WASM, input contract ID, verify
- Include in Project Doctor: if Cargo.toml has contract ID in comments, auto-verify

**Files to Create/Modify**:
- `packages/core/src/contract/verifier.ts` (new)
- `packages/core/src/contract/index.ts` (export)
- `packages/cli/src/commands/verify.ts` (new)
- `packages/cli/src/commands/index.ts` (register)
- `integrations/mcp/src/tools/verify.ts` (new)
- `apps/web/src/app/tools/verify/page.tsx` (new)
- `packages/diagnostics/src/doctor.ts` (add verification check)

**Security Note**: This tool helps prevent "rug pulls" where deployed code differs from public source.

**Labels**: security, enhancement, verification, high-value  
**Complexity**: Medium

---

## Summary

| Issue | Complexity | Value | Skills |
|-------|------------|-------|--------|
| #13: Transaction Simulation Web UI | High | High | React, Stellar SDK, XDR |
| #14: Contract Spec Extraction | High | High | WASM parsing, Soroban |
| #15: Storage Key Inspection | High | High | RPC, TTL, State archival |
| #16: Error Recovery Guidance | Medium | Medium-High | Diagnostics, UX |
| #17: Account History Viewer | Medium | Medium | Horizon API, React |
| #18: RPC Health Dashboard | Medium-High | Medium | Real-time polling, Charts |
| #19: Contract Verification | Medium | High | Security, WASM hashing |

**Total**: 7 issues  
**Complexity Distribution**:  
- High: 3  
- Medium-High: 1  
- Medium: 3

All issues require meaningful engineering work, add user-facing value, and provide contributors with real Stellar/Soroban development experience.
