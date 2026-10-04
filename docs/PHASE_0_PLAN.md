> Historical planning document. This is not a current implementation/status report. See [the audit](REPOSITORY_AUDIT.md) and [readiness report](../OPEN_SOURCE_READINESS_REPORT.md).

# Phase 0: Foundation - Implementation Plan

## Overview

Phase 0 establishes the project infrastructure, tooling, and architecture foundation. No features are implemented yet—only the scaffolding that enables feature development.

**Duration:** 1-2 days  
**Status:** In Progress  

---

## Proposed Directory Structure

```
stellar-devkit/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Main CI pipeline
│   │   ├── lint.yml                  # Linting
│   │   └── release.yml               # Release automation (future)
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   ├── diagnostic_rule.md
│   │   └── documentation.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── apps/
│   └── web/                          # Next.js web application
│       ├── public/
│       │   ├── favicon.ico
│       │   └── logo.svg
│       ├── src/
│       │   ├── app/                  # App router
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx         # Homepage
│       │   │   ├── tools/
│       │   │   │   ├── page.tsx     # Tools overview
│       │   │   │   ├── account/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── contract/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── doctor/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── events/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── network/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── transaction/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── xdr/
│       │   │   │       └── page.tsx
│       │   │   ├── docs/
│       │   │   │   └── page.tsx
│       │   │   └── about/
│       │   │       └── page.tsx
│       │   ├── components/           # React components (presentation only)
│       │   │   ├── ui/              # shadcn/ui components
│       │   │   ├── layout/
│       │   │   │   ├── header.tsx
│       │   │   │   ├── footer.tsx
│       │   │   │   └── nav.tsx
│       │   │   ├── tools/
│       │   │   │   ├── account-display.tsx
│       │   │   │   ├── xdr-decoder.tsx
│       │   │   │   ├── network-status.tsx
│       │   │   │   └── diagnostic-report.tsx
│       │   │   └── common/
│       │   │       ├── code-block.tsx
│       │   │       ├── copy-button.tsx
│       │   │       ├── loading-state.tsx
│       │   │       ├── error-state.tsx
│       │   │       └── empty-state.tsx
│       │   └── lib/                  # Web-specific utilities
│       │       └── utils.ts
│       ├── .eslintrc.json
│       ├── next.config.js
│       ├── package.json
│       ├── postcss.config.js
│       ├── tailwind.config.ts
│       └── tsconfig.json
│
├── packages/
│   │
│   ├── core/                         # Core business logic
│   │   ├── src/
│   │   │   ├── account/
│   │   │   │   ├── index.ts
│   │   │   │   ├── inspect.ts
│   │   │   │   └── types.ts
│   │   │   ├── contract/
│   │   │   │   ├── index.ts
│   │   │   │   ├── inspect.ts
│   │   │   │   └── types.ts
│   │   │   ├── transaction/
│   │   │   │   ├── index.ts
│   │   │   │   ├── inspect.ts
│   │   │   │   └── types.ts
│   │   │   ├── xdr/
│   │   │   │   ├── index.ts
│   │   │   │   ├── decode.ts
│   │   │   │   └── types.ts
│   │   │   ├── network/
│   │   │   │   ├── index.ts
│   │   │   │   ├── health.ts
│   │   │   │   └── types.ts
│   │   │   ├── types/
│   │   │   │   ├── index.ts
│   │   │   │   ├── common.ts
│   │   │   │   └── result.ts
│   │   │   ├── utils/
│   │   │   │   ├── index.ts
│   │   │   │   └── validation.ts
│   │   │   └── index.ts
│   │   ├── test/
│   │   │   ├── account.test.ts
│   │   │   ├── xdr.test.ts
│   │   │   └── validation.test.ts
│   │   ├── .eslintrc.json
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   │
│   ├── diagnostics/                  # Diagnostic engine & rules
│   │   ├── src/
│   │   │   ├── engine/
│   │   │   │   ├── index.ts
│   │   │   │   ├── runner.ts
│   │   │   │   └── types.ts
│   │   │   ├── rules/
│   │   │   │   ├── index.ts
│   │   │   │   ├── check-rust.ts
│   │   │   │   ├── check-cargo.ts
│   │   │   │   ├── check-stellar-cli.ts
│   │   │   │   └── registry.ts
│   │   │   ├── errors/
│   │   │   │   ├── index.ts
│   │   │   │   ├── registry.ts
│   │   │   │   ├── explainer.ts
│   │   │   │   └── definitions.ts
│   │   │   ├── doctor/
│   │   │   │   ├── index.ts
│   │   │   │   └── runner.ts
│   │   │   └── index.ts
│   │   ├── test/
│   │   │   ├── engine.test.ts
│   │   │   ├── rules.test.ts
│   │   │   └── errors.test.ts
│   │   ├── .eslintrc.json
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   │
│   ├── stellar/                      # Stellar SDK abstractions
│   │   ├── src/
│   │   │   ├── client/
│   │   │   │   ├── index.ts
│   │   │   │   ├── rpc.ts           # Soroban RPC client
│   │   │   │   └── horizon.ts       # Horizon client
│   │   │   ├── xdr/
│   │   │   │   ├── index.ts
│   │   │   │   └── utils.ts
│   │   │   ├── contracts/
│   │   │   │   ├── index.ts
│   │   │   │   └── utils.ts
│   │   │   ├── networks/
│   │   │   │   ├── index.ts
│   │   │   │   └── config.ts
│   │   │   └── index.ts
│   │   ├── test/
│   │   │   ├── rpc.test.ts
│   │   │   └── horizon.test.ts
│   │   ├── .eslintrc.json
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   │
│   ├── cli/                          # CLI implementation
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── index.ts
│   │   │   │   ├── doctor.ts
│   │   │   │   ├── account.ts
│   │   │   │   ├── contract.ts
│   │   │   │   ├── transaction.ts
│   │   │   │   ├── xdr.ts
│   │   │   │   ├── events.ts
│   │   │   │   ├── rpc.ts
│   │   │   │   └── explain.ts
│   │   │   ├── output/
│   │   │   │   ├── index.ts
│   │   │   │   ├── text.ts
│   │   │   │   └── json.ts
│   │   │   ├── utils/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── bin/
│   │   │   └── stellar-dev.ts       # CLI entry point
│   │   ├── test/
│   │   │   ├── commands.test.ts
│   │   │   └── output.test.ts
│   │   ├── .eslintrc.json
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   │
│   └── ui/                           # Shared UI components (optional)
│       ├── src/
│       │   ├── components/
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── .eslintrc.json
│       ├── package.json
│       └── tsconfig.json
│
├── integrations/                     # Future integrations (Phase 2+)
│   ├── github-action/
│   │   └── .gitkeep
│   ├── mcp/
│   │   └── .gitkeep
│   └── vscode/
│       └── .gitkeep
│
├── examples/                         # Example Soroban projects
│   ├── hello-world/
│   │   └── .gitkeep
│   └── token/
│       └── .gitkeep
│
├── docs/
│   ├── ARCHITECTURE.md               # ✅ Created
│   ├── API.md                        # Phase 1
│   ├── CLI.md                        # Phase 1
│   ├── DIAGNOSTICS.md                # Phase 1
│   ├── ERROR_REGISTRY.md             # Phase 1
│   └── PHASE_0_PLAN.md               # ✅ Created (this file)
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .gitignore
├── .eslintrc.json                    # Root ESLint config
├── .prettierrc                       # Prettier config
├── .prettierignore
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE                           # Apache-2.0 or MIT
├── README.md
├── ROADMAP.md                        # ✅ Created
├── SECURITY.md
├── package.json                      # Root package.json
├── pnpm-workspace.yaml
├── turbo.json                        # Turborepo config
└── tsconfig.json                     # Base TypeScript config
```

---

## Phase 0 Task List

### 1. Initialize Monorepo Structure ✅ (Partial)
- [x] Create root directory
- [x] Create docs/ folder
- [x] Create ARCHITECTURE.md
- [x] Create ROADMAP.md
- [ ] Create directory structure
- [ ] Add .gitkeep files for empty directories

### 2. Configure Package Manager
- [ ] Create `pnpm-workspace.yaml`
- [ ] Create root `package.json`
- [ ] Install pnpm dependencies

### 3. Configure TypeScript
- [ ] Create root `tsconfig.json` (strict mode)
- [ ] Create package-specific `tsconfig.json` files
- [ ] Configure path aliases

### 4. Configure Linting & Formatting
- [ ] Create `.eslintrc.json` (root)
- [ ] Install ESLint plugins (TypeScript, React, etc.)
- [ ] Create `.prettierrc`
- [ ] Create `.prettierignore`
- [ ] Add lint scripts to package.json

### 5. Configure Testing
- [ ] Install Vitest
- [ ] Create `vitest.config.ts` for each package
- [ ] Add test scripts to package.json
- [ ] Create sample test files

### 6. Configure Turborepo
- [ ] Create `turbo.json`
- [ ] Configure build pipeline
- [ ] Configure test pipeline
- [ ] Configure lint pipeline

### 7. Create Package Scaffolds
- [ ] `packages/core/`
  - [ ] package.json
  - [ ] tsconfig.json
  - [ ] src/index.ts (empty export)
  - [ ] test/ directory
- [ ] `packages/diagnostics/`
  - [ ] package.json
  - [ ] tsconfig.json
  - [ ] src/index.ts (empty export)
  - [ ] test/ directory
- [ ] `packages/stellar/`
  - [ ] package.json
  - [ ] tsconfig.json
  - [ ] src/index.ts (empty export)
  - [ ] test/ directory
- [ ] `packages/cli/`
  - [ ] package.json
  - [ ] tsconfig.json
  - [ ] src/index.ts (empty export)
  - [ ] bin/stellar-dev.ts
  - [ ] test/ directory
- [ ] `packages/ui/` (optional)
  - [ ] package.json
  - [ ] tsconfig.json
  - [ ] src/index.ts (empty export)

### 8. Create Next.js Web Application
- [ ] Initialize Next.js in `apps/web/`
- [ ] Configure Tailwind CSS
- [ ] Install shadcn/ui
- [ ] Create basic layout
- [ ] Create placeholder pages
- [ ] Add dark/light mode

### 9. Configure CI/CD
- [ ] Create `.github/workflows/ci.yml`
- [ ] Add install step
- [ ] Add lint step
- [ ] Add typecheck step
- [ ] Add test step
- [ ] Add build step

### 10. Create Open-Source Documentation
- [ ] `README.md`
  - [ ] Project overview
  - [ ] Installation instructions
  - [ ] Quick start
  - [ ] Features (planned)
  - [ ] Architecture overview
  - [ ] Contributing
  - [ ] License
- [ ] `CONTRIBUTING.md`
  - [ ] How to contribute
  - [ ] Development setup
  - [ ] Code style
  - [ ] Pull request process
  - [ ] Issue templates
- [ ] `CODE_OF_CONDUCT.md`
  - [ ] Contributor Covenant
- [ ] `SECURITY.md`
  - [ ] Reporting vulnerabilities
  - [ ] Security policy
- [ ] `CHANGELOG.md`
  - [ ] Version history (v0.0.1 - Phase 0)
- [ ] `LICENSE`
  - [ ] Choose: Apache-2.0 or MIT
- [ ] `.github/ISSUE_TEMPLATE/`
  - [ ] bug_report.md
  - [ ] feature_request.md
  - [ ] diagnostic_rule.md
  - [ ] documentation.md
- [ ] `.github/PULL_REQUEST_TEMPLATE.md`

### 11. Create .gitignore
- [ ] Node.js
- [ ] Build outputs
- [ ] IDE files
- [ ] OS files
- [ ] Environment files

### 12. Install Core Dependencies
- [ ] `@stellar/stellar-sdk` (latest)
- [ ] TypeScript
- [ ] React & Next.js
- [ ] Tailwind CSS
- [ ] Vitest
- [ ] ESLint & Prettier
- [ ] Development utilities

### 13. Validation
- [ ] Run `pnpm install`
- [ ] Run `pnpm build`
- [ ] Run `pnpm test`
- [ ] Run `pnpm lint`
- [ ] Run `pnpm typecheck`
- [ ] Fix any errors
- [ ] Commit changes

### 14. Git Setup
- [ ] Initialize git repository
- [ ] Create initial commit
- [ ] Create development branch
- [ ] Push to GitHub (optional)

---

## Technical Risks & Mitigations

### Risk 1: RPC Historical Data Limitations
**Description:** Soroban RPC only retains ~7 days of historical data.

**Impact:**
- Cannot query old events
- Cannot inspect old transactions
- Limited historical analysis

**Mitigation:**
- Document limitation clearly in README and UI
- Use Horizon for older non-Soroban data where applicable
- Consider third-party indexers for production use
- Focus Phase 1 on recent/live data
- Add warning messages when querying near retention limit

**Status:** Accepted limitation

---

### Risk 2: No Public Mainnet RPC from SDF
**Description:** Stellar Development Foundation doesn't provide public mainnet Soroban RPC endpoint.

**Impact:**
- Cannot default to mainnet
- Users must configure third-party RPC
- Additional setup friction

**Mitigation:**
- Default to Testnet in Phase 1
- Allow custom RPC endpoint configuration
- Document well-known third-party RPC providers
- Make network selection very prominent in UI
- Add RPC health check before operations

**Status:** Accepted; configuration approach ready

---

### Risk 3: Horizon API End-of-Life
**Description:** Horizon API is being phased out in favor of Soroban RPC.

**Impact:**
- Account queries may need migration
- Legacy API dependencies
- Breaking changes possible

**Mitigation:**
- Minimize Horizon dependencies
- Prioritize RPC methods where available
- Abstract network layer behind interfaces
- Monitor Stellar announcements
- Plan migration path in architecture

**Status:** Mitigated via abstraction layer

---

### Risk 4: Limited Contract Introspection
**Description:** Deployed contracts expose limited metadata and interface information.

**Impact:**
- Cannot always determine function signatures
- Cannot show full contract documentation
- Limited automated analysis

**Mitigation:**
- Set realistic user expectations
- Show only verifiable data
- Don't fabricate missing information
- Clearly label data source and limitations
- Use contract specs where available

**Status:** Managed via clear communication

---

### Risk 5: Cross-Platform stellar-cli Integration
**Description:** stellar-cli may behave differently on Windows/macOS/Linux.

**Impact:**
- Path handling issues
- Command execution differences
- Shell escaping problems

**Mitigation:**
- Use Node.js `child_process.spawn()` with proper escaping
- Test on all platforms (Windows, macOS, Linux)
- Use cross-platform path utilities (`path` module)
- Provide fallback when CLI unavailable
- Document platform-specific requirements

**Status:** Testing required after implementation

---

### Risk 6: TypeScript/Stellar SDK Version Compatibility
**Description:** Stellar SDK updates may introduce breaking changes.

**Impact:**
- Build failures
- Runtime errors
- API incompatibilities

**Mitigation:**
- Pin exact Stellar SDK version in Phase 1
- Test thoroughly before version bumps
- Monitor Stellar SDK release notes
- Abstract SDK behind our own interfaces
- Maintain compatibility layer if needed

**Status:** Mitigated via version pinning

---

### Risk 7: XDR Decoding Edge Cases
**Description:** Invalid or malformed XDR may cause crashes or incorrect decoding.

**Impact:**
- Application errors
- Poor user experience
- Security issues (if exploited)

**Mitigation:**
- Comprehensive input validation
- Try-catch around all XDR operations
- Show clear error messages
- Test with malformed inputs
- Never trust user input

**Status:** Test coverage required

---

### Risk 8: RPC Rate Limiting
**Description:** Public RPC endpoints may rate limit requests.

**Impact:**
- Failed operations
- Poor user experience
- Errors in web UI

**Mitigation:**
- Implement client-side request queuing
- Add retry logic with exponential backoff
- Cache responses where appropriate (with TTL)
- Batch requests using `getLedgerEntries`
- Show rate limit errors clearly

**Status:** Implementation needed in Phase 1

---

### Risk 9: Large Monorepo Build Times
**Description:** As project grows, build times may increase significantly.

**Impact:**
- Slower development
- Longer CI times
- Developer frustration

**Mitigation:**
- Use Turborepo for incremental builds
- Configure proper caching
- Use `--filter` for selective builds
- Optimize TypeScript config
- Consider splitting packages if needed

**Status:** Turborepo configuration critical

---

### Risk 10: Community Contribution Friction
**Description:** Complex architecture may discourage external contributions.

**Impact:**
- Fewer contributors
- Slower feature development
- Limited community growth

**Mitigation:**
- Write excellent documentation
- Create "good first issue" labels
- Provide detailed contribution guide
- Keep architecture modular
- Respond quickly to contributor questions
- Celebrate contributions publicly

**Status:** Documentation priority

---

## Acceptance Criteria

Phase 0 is complete when:

✅ **Directory structure exists**
- All folders created
- Packages scaffolded
- Web app initialized

✅ **Build system works**
```bash
pnpm install          # Installs all dependencies
pnpm build            # Builds all packages
```

✅ **Tests run**
```bash
pnpm test             # Runs all tests (even if minimal)
```

✅ **Linting works**
```bash
pnpm lint             # No errors
```

✅ **Type checking works**
```bash
pnpm typecheck        # No type errors
```

✅ **Documentation exists**
- README.md (comprehensive)
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- SECURITY.md
- LICENSE
- CHANGELOG.md

✅ **CI pipeline configured**
- GitHub Actions workflow
- All checks pass

✅ **Git repository initialized**
- Initial commit made
- Clean working tree

---

## Next Steps After Phase 0

1. **Review & Validation**
   - Run all validation commands
   - Fix any errors
   - Review architecture
   - Get approval

2. **Phase 1 Kickoff**
   - Create GitHub issues for Phase 1 features
   - Prioritize features
   - Assign work (if team)
   - Begin implementation

3. **Focus Areas**
   - Start with Project Doctor (flagship)
   - Then XDR Decoder (high value, lower complexity)
   - Then Account Inspector
   - Continue per roadmap

---

## Time Estimates

**Conservative Estimate:** 2 days
- Day 1: Monorepo setup, packages, tooling
- Day 2: Documentation, CI, validation

**Optimistic Estimate:** 1 day
- Experienced with monorepo setup
- Familiar with tools
- No blockers

**Realistic Estimate:** 1.5 days
- Some troubleshooting
- Documentation takes time
- Testing on multiple platforms

---

## Definition of Done

- [ ] All validation commands pass
- [ ] Documentation complete
- [ ] CI pipeline green
- [ ] Git repository clean
- [ ] Ready for Phase 1
- [ ] Approval received

---

**Status:** Ready to implement  
**Next Action:** Begin task execution
