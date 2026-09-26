# Contributor Backlog

This document lists genuine, actionable issues for external contributors. Issues are categorized by type and difficulty.

**Legend:**
- 🟢 **Good First Issue** - Great for newcomers
- 🟡 **Moderate** - Requires some codebase familiarity
- 🔴 **Advanced** - Requires deep understanding

---

## 🐛 Bug Fixes

### 🟢 #1: Fix latency calculation precision in RPC health checker

**Description:** The RPC health checker sometimes reports 0ms latency for very fast responses. Improve precision using `performance.now()` instead of `Date.now()`.

**Files:** `packages/core/src/network/rpc-health.ts`

**Acceptance Criteria:**
- Use `performance.now()` for sub-millisecond precision
- Update tests to verify precision
- Latency should never be exactly 0 for successful requests

**Labels:** `good first issue`, `bug`, `enhancement`

---

### 🟡 #2: Account Inspector fails gracefully for non-existent accounts

**Description:** When inspecting a non-existent account, error message could be more helpful.

**Files:** `packages/core/src/account/inspector.ts`, `packages/cli/src/commands/account.ts`

**Acceptance Criteria:**
- Clear error message: "Account not found on [network]"
- Suggest checking network selection
- Return appropriate error code in CLI

**Labels:** `bug`, `cli`, `enhancement`

---

## ✨ New Features

### 🟢 #3: Add syntax highlighting to XDR decoder web UI

**Description:** XDR decoder output in the web UI should have syntax highlighting for better readability.

**Files:** `apps/web/src/app/tools/xdr/page.tsx`

**Acceptance Criteria:**
- Use a syntax highlighter (Shiki or Prism)
- Highlight JSON output with proper colors
- Support dark and light themes

**Labels:** `good first issue`, `feature`, `frontend`, `enhancement`

---

### 🟢 #4: Add copy-to-clipboard button for all web tool outputs

**Description:** Add a "Copy" button to easily copy results from web tools.

**Files:** `apps/web/src/app/tools/*/page.tsx`

**Acceptance Criteria:**
- Copy button appears next to output
- Shows "Copied!" feedback when clicked
- Works for all tool pages

**Labels:** `good first issue`, `feature`, `frontend`

---

### 🟡 #5: Implement Event Viewer web UI

**Description:** Event Viewer currently only has CLI. Add web UI at `/tools/events`.

**Files:** `apps/web/src/app/tools/events/page.tsx` (new)

**Acceptance Criteria:**
- Input fields for contract ID, start ledger, limit
- Display events in a table
- Pagination support
- Match CLI functionality

**Labels:** `feature`, `frontend`, `Phase 2`

---

### 🟡 #6: Add Transaction Simulation (Phase 2.1)

**Description:** Implement transaction simulation using `simulateTransaction()` RPC method.

**Files:** `packages/core/src/transaction/simulator.ts` (new), CLI and web UI

**Acceptance Criteria:**
- Simulate contract invocations without submission
- Display resource costs and fees
- Show expected events
- Handle auth requirements
- No signing or private keys required

**Labels:** `feature`, `Phase 2.1`, `soroban`

---

### 🔴 #7: Add contract method signature extraction

**Description:** Enhance Contract Inspector to extract and display contract method signatures from WASM.

**Files:** `packages/core/src/contract/inspector.ts`

**Acceptance Criteria:**
- Parse WASM to extract contract spec
- Display method names and parameters
- Show return types
- Handle contracts without embedded specs

**Labels:** `feature`, `advanced`, `soroban`, `rust`

---

### 🟡 #8: Add event decoding for common event types

**Description:** Decode known contract event types (e.g., transfers, approvals) into human-readable format.

**Files:** `packages/core/src/events/decoder.ts` (new)

**Acceptance Criteria:**
- Detect common event patterns
- Decode topics and data fields
- Display decoded values with types
- Extensible decoder registry

**Labels:** `feature`, `enhancement`, `soroban`

---

## 📚 Documentation

### 🟢 #9: Add screenshots to README

**Description:** README would benefit from screenshots showing the web UI in action.

**Files:** `README.md`, `docs/images/` (new)

**Acceptance Criteria:**
- Screenshots of 3-4 main tool pages
- Dark theme preferred
- High quality (1920x1080 or higher)
- Stored in `docs/images/`

**Labels:** `good first issue`, `documentation`

---

### 🟢 #10: Create tutorial: Using MCP with Claude Desktop

**Description:** Write a step-by-step tutorial for setting up Stellar DevKit MCP server with Claude Desktop.

**Files:** `docs/MCP_SETUP.md` (new)

**Acceptance Criteria:**
- Installation steps
- Configuration file example
- Testing the integration
- Common troubleshooting
- Screenshots

**Labels:** `good first issue`, `documentation`, `MCP`

---

### 🟢 #11: Document all CLI commands with examples

**Description:** Create comprehensive CLI reference with examples for each command.

**Files:** `docs/CLI.md` (exists but incomplete)

**Acceptance Criteria:**
- All 8 commands documented
- Real-world examples for each
- Common use cases
- JSON output examples
- Error handling examples

**Labels:** `good first issue`, `documentation`, `cli`

---

### 🟡 #12: Create video demo of core features

**Description:** Record a 3-5 minute video demonstrating Stellar DevKit's main features.

**Deliverables:**
- Screen recording showing CLI and web UI
- Demonstrate 3-4 core tools
- Voice narration explaining use cases
- Upload to YouTube
- Embed in README

**Labels:** `documentation`, `video`, `marketing`

---

## 🧪 Testing

### 🟢 #13: Add integration tests for Account Inspector

**Description:** Add integration tests that call live Horizon API (optional, can be skipped in CI).

**Files:** `packages/core/test/account/inspector.integration.test.ts` (new)

**Acceptance Criteria:**
- Test with real testnet accounts
- Verify balances, signers, thresholds
- Graceful handling of network errors
- Can be skipped with `--run` flag

**Labels:** `good first issue`, `testing`, `integration-test`

---

### 🟡 #14: Increase test coverage for diagnostics package

**Description:** Diagnostics package has minimal tests. Add more comprehensive test coverage.

**Files:** `packages/diagnostics/test/`

**Acceptance Criteria:**
- Test all diagnostic rules
- Mock filesystem operations
- Test error explainer pattern matching
- Coverage >80%

**Labels:** `testing`, `diagnostics`

---

### 🟡 #15: Add E2E tests for web application

**Description:** Add end-to-end tests using Playwright to test web UI workflows.

**Files:** `apps/web/e2e/` (new)

**Acceptance Criteria:**
- Test XDR decoder workflow
- Test account inspector workflow
- Test network selection
- Test error states
- Run in CI

**Labels:** `testing`, `frontend`, `e2e`

---

## 🎨 UI/UX Improvements

### 🟢 #16: Add loading spinners to all async operations

**Description:** Web UI should show loading indicators when fetching data.

**Files:** `apps/web/src/app/tools/*/page.tsx`

**Acceptance Criteria:**
- Spinner appears during API calls
- Disable submit button while loading
- Clear visual feedback
- Consistent across all tools

**Labels:** `good first issue`, `frontend`, `ui/ux`

---

### 🟢 #17: Improve error message styling in web UI

**Description:** Error messages should be more prominent and actionable.

**Files:** `apps/web/src/app/tools/*/page.tsx`

**Acceptance Criteria:**
- Red/destructive styling for errors
- Clear error icon
- Suggestion text if available
- Dismissible error messages

**Labels:** `good first issue`, `frontend`, `ui/ux`

---

### 🟡 #18: Add mobile responsiveness improvements

**Description:** Some tool pages don't render well on mobile devices.

**Files:** `apps/web/src/app/tools/*/page.tsx`

**Acceptance Criteria:**
- Test all pages on mobile viewport
- Improve form layouts for small screens
- Ensure tables scroll horizontally
- Touch-friendly buttons

**Labels:** `frontend`, `ui/ux`, `mobile`

---

### 🟡 #19: Add keyboard shortcuts for common actions

**Description:** Add keyboard shortcuts to improve power user experience.

**Files:** `apps/web/src/app/tools/*/page.tsx`

**Acceptance Criteria:**
- `Ctrl/Cmd + Enter` to submit forms
- `Ctrl/Cmd + K` for command palette
- `Escape` to clear inputs
- Display shortcuts in UI

**Labels:** `feature`, `frontend`, `ui/ux`, `accessibility`

---

## 🔧 Developer Experience

### 🟢 #20: Add VSCode snippets for common patterns

**Description:** Create VSCode snippets for adding diagnostic rules and error definitions.

**Files:** `.vscode/stellar-devkit.code-snippets` (new)

**Acceptance Criteria:**
- Snippet for diagnostic rule
- Snippet for error registry entry
- Snippet for CLI command
- Document in CONTRIBUTING.md

**Labels:** `good first issue`, `developer-experience`, `tooling`

---

### 🟡 #21: Set up GitHub Actions CI pipeline

**Description:** Add CI pipeline to run tests, lint, and typecheck on every PR.

**Files:** `.github/workflows/ci.yml` (new)

**Acceptance Criteria:**
- Run on push to main and PRs
- Execute: install, build, test, lint, typecheck
- Cache dependencies
- Fail on any errors
- Display status badge in README

**Labels:** `ci/cd`, `tooling`, `infrastructure`

---

### 🟡 #22: Add pre-commit hooks with Husky

**Description:** Set up Husky to run linting and type checking before commits.

**Files:** `.husky/` directory, `package.json`

**Acceptance Criteria:**
- Install Husky
- Pre-commit: lint staged files
- Pre-push: run tests
- Document in CONTRIBUTING.md

**Labels:** `tooling`, `developer-experience`

---

## 📦 Distribution

### 🟡 #23: Publish packages to npm

**Description:** Prepare and publish core packages to npm registry.

**Files:** `packages/*/package.json`, release scripts

**Acceptance Criteria:**
- Verify package.json metadata
- Add npm publish workflow
- Test installation from npm
- Document versioning strategy
- Publish @stellar-devkit/cli, core, diagnostics

**Labels:** `distribution`, `npm`, `release`

---

### 🟡 #24: Publish MCP server to npm

**Description:** Package and publish MCP server as standalone npm package.

**Files:** `integrations/mcp/package.json`

**Acceptance Criteria:**
- Resolve dependency issues
- Test standalone installation
- Update MCP README with install instructions
- Publish to npm as @stellar-devkit/mcp-server

**Labels:** `distribution`, `MCP`, `npm`

---

### 🔴 #25: Publish GitHub Action to Marketplace

**Description:** Build, bundle, and publish GitHub Action to GitHub Marketplace.

**Files:** `integrations/github-action/`, build scripts

**Acceptance Criteria:**
- Bundle with @vercel/ncc
- Create dist/ directory
- Update action.yml metadata
- Test from marketplace
- Add marketplace badge to README

**Labels:** `distribution`, `github-action`, `ci/cd`

---

## 🏗️ Infrastructure

### 🟡 #26: Deploy web application to Vercel

**Description:** Set up automatic deployments of web app to Vercel.

**Files:** `vercel.json` (new), deployment config

**Acceptance Criteria:**
- Connect GitHub repo to Vercel
- Deploy on merge to main
- Preview deployments for PRs
- Custom domain setup (if available)
- Update README with live URL

**Labels:** `infrastructure`, `deployment`, `frontend`

---

## 🔍 Enhancements

### 🟡 #27: Add caching for RPC responses

**Description:** Cache RPC responses (5min TTL) to reduce API calls and improve performance.

**Files:** `packages/core/src/network/cache.ts` (new)

**Acceptance Criteria:**
- In-memory cache with TTL
- Cache RPC health checks
- Cache account data
- Configurable TTL
- Clear cache option

**Labels:** `enhancement`, `performance`, `caching`

---

## Notes for Contributors

- Pick an issue that matches your skill level
- Comment on the issue before starting work
- Reference issue number in PR title: `feat: add copy button (#4)`
- Follow the [Contributing Guidelines](../CONTRIBUTING.md)
- Ask questions in GitHub Discussions if unclear

**Priority Issues for First Release:**
- #21 (CI pipeline)
- #23 (npm publishing)
- #5 (Event Viewer UI)
- #6 (Transaction Simulation)
- #11 (CLI docs)

---

**Last Updated:** 2026-09-26  
**Total Issues:** 27
