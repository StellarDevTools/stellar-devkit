# Stellar DevKit Roadmap

## Vision

Create a production-quality, open-source developer toolbox for building, inspecting, testing, debugging, and understanding Stellar and Soroban applications.

**Not another:** wallet, block explorer, payment app, or Stellar CLI replacement.

**Instead:** A comprehensive diagnostic and inspection platform that improves the Stellar developer experience.

---

## Phase 0: Foundation ✓

**Goal:** Establish project infrastructure and architecture.

**Status:** In Progress

### Tasks
- [x] Research current Stellar/Soroban APIs and SDKs
- [x] Document architecture
- [ ] Initialize monorepo structure
- [ ] Configure TypeScript with strict mode
- [ ] Set up pnpm workspace
- [ ] Configure Turborepo
- [ ] Set up ESLint and Prettier
- [ ] Configure Vitest testing framework
- [ ] Create package scaffolding:
  - [ ] `@stellar-devkit/core`
  - [ ] `@stellar-devkit/diagnostics`
  - [ ] `@stellar-devkit/stellar`
  - [ ] `@stellar-devkit/cli`
  - [ ] `@stellar-devkit/ui` (optional)
- [ ] Create Next.js web application scaffold
- [ ] Set up GitHub Actions CI pipeline
- [ ] Create open-source documentation:
  - [ ] README.md
  - [ ] CONTRIBUTING.md
  - [ ] CODE_OF_CONDUCT.md
  - [ ] SECURITY.md
  - [ ] LICENSE (Apache-2.0 or MIT)
- [ ] Verify all builds pass
- [ ] Commit and validate

**Acceptance Criteria:**
```bash
pnpm install          # ✓ Installs without errors
pnpm build            # ✓ All packages build
pnpm test             # ✓ All tests pass (even if minimal)
pnpm lint             # ✓ No linting errors
pnpm typecheck        # ✓ No type errors
```

**Duration:** 1-2 days

---

## Phase 1: Core Developer Tools (MVP)

**Goal:** Deliver the most valuable developer diagnostics and inspection tools.

**Status:** Not Started

**Target:** 2-3 weeks after Phase 0

### 1.1 Stellar Project Doctor 🏥

**Priority:** Critical (flagship feature)

**Command:**
```bash
stellar-dev doctor [path]
stellar-dev doctor . --json
```

**Checks:**
- ✓ Rust installation
- ✓ Cargo installation
- ✓ Stellar CLI availability and version
- ✓ Project structure (Cargo.toml, lib.rs)
- ✓ Soroban dependencies
- ✓ Contract compilation
- ✓ WASM generation
- ✓ Test execution
- ⚠ Unchecked `panic!` / `unwrap()` usage
- ⚠ Missing tests
- ✓ Network configuration
- ✓ RPC connectivity
- ⚠ Common configuration mistakes
- ⚠ Outdated/incompatible dependencies

**Deliverables:**
- Diagnostic engine architecture
- Rule registry system
- 10-15 initial diagnostic rules
- CLI output (text + JSON)
- Web interface: `/tools/doctor`
- Comprehensive tests
- Documentation

**GitHub Issues:** `#1`, `#2`, `#3`

---

### 1.2 Soroban Error Explainer 🔍

**Priority:** High

**Command:**
```bash
stellar-dev explain "HostError: Error(Storage, MissingValue)"
```

**Features:**
- Extensible error registry
- Pattern-based error matching
- Human-readable explanations
- Possible causes enumeration
- Actionable recommendations
- Documentation references
- Web interface: `/tools/errors`

**Example Registry Entry:**
```typescript
{
  pattern: /Error\(Storage, MissingValue\)/,
  title: 'Storage entry not found',
  explanation: '...',
  causes: ['...'],
  recommendations: ['...'],
  references: ['https://...']
}
```

**Deliverables:**
- Error registry architecture
- 20-30 common error definitions
- CLI integration
- Web interface
- Contribution guide for adding errors
- Tests for pattern matching
- Documentation

**GitHub Issues:** `#4`, `#5`

---

### 1.3 XDR Decoder 📦

**Priority:** High

**Command:**
```bash
stellar-dev xdr decode <XDR>
stellar-dev xdr decode <XDR> --json
```

**Features:**
- Decode all Stellar XDR types
- Human-readable output
- JSON output
- Detect XDR type automatically
- Display:
  - Source account
  - Operations
  - Destination
  - Assets
  - Amounts
  - Sequence
  - Memo
  - Signatures
  - Preconditions
  - Soroban invocations

**Web Interface:**
- Route: `/tools/xdr`
- Paste XDR input
- Live decoding
- Syntax highlighting
- Copy decoded result
- Share link support (XDR in URL)

**Deliverables:**
- XDR decoding functions
- Type detection
- CLI command
- Web interface
- Tests for valid/invalid XDR
- Documentation

**GitHub Issues:** `#6`, `#7`

---

### 1.4 Account Inspector 👤

**Priority:** High

**Command:**
```bash
stellar-dev account <PUBLIC_KEY>
stellar-dev account <PUBLIC_KEY> --network testnet --json
```

**Features:**
- Display account details:
  - Account ID
  - Network
  - Balances (XLM + assets)
  - Trustlines
  - Signers
  - Thresholds
  - Sequence number
  - Sponsorship info
  - Flags
- Support Testnet and Mainnet
- Graceful error handling for non-existent accounts

**Web Interface:**
- Route: `/tools/account`
- Public key input
- Network selector (prominent)
- Visual balance display
- Asset icons/logos where available
- Responsive tables
- Copy buttons
- QR code display (optional)

**Deliverables:**
- Account inspection functions
- Horizon API integration
- CLI command
- Web interface
- Network selection UI
- Tests (mocked + integration)
- Documentation

**GitHub Issues:** `#8`, `#9`

---

### 1.5 RPC Health Checker 🏥

**Priority:** Medium

**Command:**
```bash
stellar-dev rpc health
stellar-dev rpc health --network testnet --json
```

**Features:**
- Check RPC connectivity
- Display:
  - RPC endpoint
  - Network name
  - Status (healthy/degraded/down)
  - Latest ledger
  - Oldest ledger (retention window)
  - Latency (round-trip time)
  - Protocol version
- Handle custom RPC endpoints

**Web Interface:**
- Route: `/tools/network`
- Network selector
- Real-time health status
- Latency chart (optional)
- Historical uptime (future)

**Deliverables:**
- RPC health check functions
- Soroban RPC integration (`getHealth`, `getLatestLedger`)
- CLI command
- Web interface
- Tests (mocked + integration)
- Documentation

**GitHub Issues:** `#10`, `#11`

---

### 1.6 Web Application Foundation 🌐

**Priority:** Critical

**Routes:**
```
/                       # Homepage
/tools                  # Tools overview
/tools/doctor           # Project Doctor
/tools/account          # Account Inspector
/tools/xdr              # XDR Decoder
/tools/network          # RPC Health
/docs                   # Documentation
/about                  # About page
```

**Design Requirements:**
- Modern, professional developer aesthetic
- Excellent dark mode (default)
- Light mode support
- Responsive (mobile, tablet, desktop)
- Keyboard accessible (WCAG 2.1 AA)
- Strong typography (monospace for code/data)
- Loading states
- Error states
- Empty states
- Copy buttons everywhere
- Syntax highlighting (Shiki/Prism)
- Responsive tables
- Clear network indicators (Testnet/Mainnet)

**Homepage:**
- Hero: "Stellar DevKit - Build. Inspect. Debug. Ship."
- Tool cards grid
- Quick start guide
- GitHub link
- Documentation link

**Inspiration:** Vercel, Linear, GitHub, Stripe (professional developer tools)

**Avoid:** Excessive gradients, glassmorphism, oversized cards, generic AI dashboards

**Deliverables:**
- Next.js application structure
- Layout components
- Navigation
- Tool pages (5 pages)
- Homepage
- Responsive design
- Dark/light mode
- Accessibility features
- Documentation pages
- Tests (component tests)

**GitHub Issues:** `#12`, `#13`, `#14`, `#15`

---

### 1.7 CLI Foundation ⚡

**Priority:** Critical

**Commands:**
```bash
stellar-dev --version
stellar-dev --help
stellar-dev doctor [path]
stellar-dev account <key> [--network <net>] [--json]
stellar-dev xdr decode <xdr> [--json]
stellar-dev rpc health [--network <net>] [--json]
stellar-dev explain <error>
```

**Features:**
- Argument parsing (yargs/commander)
- Global options: `--json`, `--network`, `--help`, `--version`
- Output formatters (text/JSON)
- Error handling
- Colors/formatting (chalk)
- Progress indicators (ora)
- Autocomplete (optional Phase 2)

**Deliverables:**
- CLI entry point
- Command router
- Output formatters
- Global option handling
- Tests (argument parsing, output)
- Documentation
- npm package configuration

**GitHub Issues:** `#16`, `#17`

---

### 1.8 Testing & Quality 🧪

**Priority:** High

**Coverage Targets:**
- Core functions: >80%
- Diagnostic rules: 100%
- XDR decoder: >90%
- CLI commands: >70%

**Test Types:**
- Unit tests (Vitest)
- Integration tests (Stellar Testnet)
- Component tests (Testing Library)
- CLI tests

**Mock Strategy:**
- Mock Stellar RPC/Horizon in unit tests (MSW)
- Real Testnet calls in integration tests (minimal)
- Separate integration tests (can be skipped in CI)

**Deliverables:**
- Test infrastructure
- Unit test suite
- Integration test suite (minimal)
- Component test suite
- Mocking utilities
- CI integration

**GitHub Issues:** `#18`

---

### 1.9 Documentation 📚

**Priority:** High

**Documents:**
- README.md (comprehensive)
- CONTRIBUTING.md
- docs/API.md
- docs/CLI.md
- docs/DIAGNOSTICS.md
- docs/ERROR_REGISTRY.md
- Code comments (minimal, where needed)

**Deliverables:**
- Complete documentation
- Usage examples
- API reference
- Contribution guide
- Screenshots/GIFs

**GitHub Issues:** `#19`

---

## Phase 1 Success Criteria

✅ A new developer can:
1. Clone the repository
2. Run `pnpm install && pnpm build && pnpm test`
3. Use `stellar-dev doctor .` on a Soroban project
4. Visit the web interface and:
   - Inspect a Stellar account
   - Decode XDR
   - Check RPC health
   - Understand Soroban errors
5. Read the documentation and understand the architecture
6. Contribute a new diagnostic rule without asking how

✅ All validation commands pass:
```bash
pnpm install   # ✓
pnpm build     # ✓
pnpm test      # ✓
pnpm lint      # ✓
pnpm typecheck # ✓
```

✅ Open-source quality:
- Clear README
- Contribution guide
- Security policy
- License
- Issue templates
- Good commit history

---

## Phase 2: Advanced Inspection & Integrations

**Status:** Future (3-6 weeks after Phase 1)

**Target:** Add more advanced tools and external integrations

### 2.1 Contract Inspector 📜

**Command:**
```bash
stellar-dev contract <CONTRACT_ID>
stellar-dev contract <CONTRACT_ID> --network testnet --json
```

**Features:**
- Contract metadata
- Function signatures/interface
- Recent events
- Deployment information
- Storage inspection (limited)
- WASM bytecode info

**Web Interface:** `/tools/contract`

**GitHub Issues:** `#20`, `#21`

---

### 2.2 Transaction Inspector 🔗

**Command:**
```bash
stellar-dev tx <HASH>
stellar-dev tx <HASH> --network testnet --json
```

**Features:**
- Transaction details
- Status (success/failed)
- Operations breakdown
- Contract calls
- Events emitted
- Failure explanation (via error registry)
- Fee analysis
- Ledger/timestamp

**Web Interface:** `/tools/transaction`

**GitHub Issues:** `#22`, `#23`

---

### 2.3 Event Viewer 📊

**Command:**
```bash
stellar-dev events <CONTRACT_ID>
stellar-dev events <CONTRACT_ID> --filter <topic> --limit 100 --json
```

**Features:**
- Query contract events
- Filter by topic
- Pagination
- Time range filtering
- Event decoding
- Export to JSON/CSV

**Web Interface:** `/tools/events`

**GitHub Issues:** `#24`, `#25`

---

### 2.4 Transaction Simulation 🎯

**Command:**
```bash
stellar-dev simulate <TRANSACTION_XDR>
stellar-dev simulate <TRANSACTION_XDR> --network testnet --json
```

**Features:**
- Simulate transaction execution
- Show likely outcome
- Display resource costs
- Show emitted events
- Detect authorization issues
- No actual submission

**Important:** Read-only, no signing required

**Web Interface:** `/tools/simulate`

**GitHub Issues:** `#26`

---

### 2.5 MCP Server Integration 🤖

**Goal:** Enable AI coding agents to use Stellar DevKit

**Tools Exposed:**
```
stellar_get_account
stellar_inspect_contract
stellar_get_transaction
stellar_decode_xdr
stellar_get_events
stellar_check_rpc
stellar_explain_error
stellar_project_diagnostics
```

**Package:** `@stellar-devkit/mcp`

**Architecture:**
- Consume same core APIs as CLI/web
- MCP server implementation
- Tool schemas
- Documentation for AI agents

**GitHub Issues:** `#27`, `#28`

---

### 2.6 GitHub Action 🚀

**Goal:** Run DevKit diagnostics in CI/CD

**Usage:**
```yaml
- uses: stellar-devkit/action@v1
  with:
    command: doctor
    working-directory: ./contracts
```

**Features:**
- Run project diagnostics
- Check contract compilation
- Run tests
- Verify WASM generation
- Post results as PR comments
- Fail CI on errors

**Package:** `integrations/github-action`

**GitHub Issues:** `#29`, `#30`

---

## Phase 3: Advanced Features & Ecosystem

**Status:** Future (3-6 months after Phase 2)

**Target:** Advanced diagnostics, security analysis, and broader ecosystem integration

### 3.1 VS Code Extension 💻

**Features:**
- Inline diagnostics
- Error explanations on hover
- Quick actions
- Contract deployment
- Account inspection sidebar
- XDR decoder panel

**GitHub Issues:** `#31`

---

### 3.2 Security Analysis 🔒

**Features:**
- Reentrancy detection
- Integer overflow checks
- Authorization validation
- Storage access patterns
- Gas optimization suggestions

**GitHub Issues:** `#32`

---

### 3.3 Contract Performance Analysis ⚡

**Features:**
- Gas profiling
- Storage efficiency
- Optimization recommendations
- Benchmark comparisons

**GitHub Issues:** `#33`

---

### 3.4 Plugin Architecture 🔌

**Goal:** Allow community to extend DevKit

**Features:**
- Custom diagnostic rules
- Custom error definitions
- Custom output formatters
- Custom integrations

**GitHub Issues:** `#34`

---

### 3.5 Advanced AI Integrations 🧠

**Features:**
- Natural language queries
- Code generation
- Smart contract auditing
- Documentation generation

**GitHub Issues:** `#35`

---

## Technical Debt & Maintenance

**Ongoing:**
- Dependency updates
- Security patches
- Stellar SDK updates
- API compatibility
- Bug fixes
- Documentation improvements
- Community support

---

## Success Metrics

### Phase 1 (MVP)
- [ ] 100+ GitHub stars
- [ ] 10+ external contributors
- [ ] 50+ weekly CLI downloads
- [ ] 500+ web app users
- [ ] 5+ community-contributed diagnostic rules

### Phase 2 (Growth)
- [ ] 500+ GitHub stars
- [ ] 50+ external contributors
- [ ] 500+ weekly CLI downloads
- [ ] 5,000+ web app users
- [ ] 3+ integrations (MCP, GitHub Action, VS Code)

### Phase 3 (Maturity)
- [ ] 1,000+ GitHub stars
- [ ] 100+ external contributors
- [ ] 2,000+ weekly CLI downloads
- [ ] 20,000+ web app users
- [ ] Official Stellar ecosystem recognition

---

## Community Growth Strategy

**Phase 1:**
- Submit to Stellar developer newsletter
- Post on Stellar Discord/forums
- Write blog post on dev.to
- Create demo video
- Present at Stellar meetups

**Phase 2:**
- Submit talks to Stellar conferences
- Create tutorial series
- Partner with Stellar educators
- Contributor recognition program

**Phase 3:**
- Annual contributor summit
- Swag for contributors
- Bounty program for features
- Official Stellar partnership

---

## Non-Goals

**We will NOT build:**
- ❌ Another wallet
- ❌ Block explorer
- ❌ Payment application
- ❌ Stellar CLI replacement
- ❌ Token launchpad
- ❌ DeFi protocol
- ❌ NFT marketplace

**We will NOT:**
- ❌ Store private keys
- ❌ Handle user funds
- ❌ Provide financial advice
- ❌ Replace official Stellar tooling
- ❌ Prioritize features over quality
- ❌ Sacrifice security for convenience

---

## Decision Log

**Why monorepo?**
- Share code between CLI and web
- Easier dependency management
- Atomic cross-package changes
- Better developer experience

**Why TypeScript over Rust for core?**
- Faster development
- Easier contribution (larger community)
- Official Stellar SDK is JavaScript
- Rust only where genuinely beneficial

**Why Next.js over plain React?**
- Better DX (routing, API routes)
- Static export for Phase 1
- Server components for Phase 2+
- Strong ecosystem

**Why not build our own XDR parser?**
- Official Stellar SDK already handles this
- Avoid reinventing the wheel
- Maintain compatibility
- Focus on value-add features

**Why no authentication in Phase 1?**
- All tools are read-only
- No private data
- Simpler architecture
- Faster shipping

---

## Release Strategy

**Phase 0:** Internal validation only

**Phase 1:**
- v0.1.0-alpha.1 (internal testing)
- v0.1.0-beta.1 (limited public beta)
- v0.1.0 (public release)

**Phase 2:**
- v0.2.0 (MCP + GitHub Action)
- v0.3.0 (Contract Inspector + TX Inspector)

**Phase 3:**
- v1.0.0 (stable, production-ready)

**Versioning:** Semantic Versioning 2.0.0

---

## Questions & Risks

### Open Questions
- Should we support custom RPC providers in Phase 1?
  - **Answer:** Yes, via configuration
- Should we cache RPC responses?
  - **Answer:** Yes, with short TTL (5 minutes)
- Should we support Freighter wallet in Phase 1?
  - **Answer:** No, Phase 2+ only

### Technical Risks
- ⚠️ RPC 7-day retention limits historical data
- ⚠️ No public mainnet RPC from SDF
- ⚠️ Horizon API being phased out
- ⚠️ Limited contract introspection metadata
- ⚠️ stellar-cli cross-platform compatibility

### Mitigation Strategies
- Document limitations clearly
- Allow custom RPC endpoints
- Abstract network layer
- Set realistic expectations
- Test on all platforms

---

## Contributing to This Roadmap

Have ideas? Open an issue or discussion on GitHub!

We prioritize:
1. **Correctness** over features
2. **Developer usefulness** over complexity
3. **Maintainability** over cleverness
4. **Security** over convenience
5. **Documentation** over assumptions

---

**Last Updated:** 2026-09-26  
**Status:** Phase 0 in progress  
**Next Milestone:** Phase 0 completion + validation
