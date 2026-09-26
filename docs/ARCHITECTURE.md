# Stellar DevKit Architecture

## Overview

Stellar DevKit is a developer toolbox for building, inspecting, testing, debugging, and understanding Stellar and Soroban applications. The system is designed as a **monorepo** containing reusable packages consumed by multiple interfaces: CLI, web application, and future integrations (MCP server, GitHub Actions, VS Code extension).

## Core Architectural Principles

### 1. Business Logic Separation
**Critical Rule**: Business logic must NOT live inside React components or CLI command handlers.

All core functionality resides in reusable packages that can be imported by any interface:

```typescript
// ✅ CORRECT
import { inspectAccount } from '@stellar-devkit/core';

// ❌ WRONG
function AccountInspector() {
  const [data, setData] = useState();
  // 200 lines of Stellar API logic here...
}
```

### 2. Stateless & Local-First
Phase 1 requires no authentication, databases, or cloud infrastructure. All operations should be:
- Stateless (no server-side session management)
- Local-first (run entirely on developer's machine where possible)
- Privacy-preserving (never request private keys or seed phrases)

### 3. Structured Results
Every tool returns structured data internally:

```typescript
interface ToolResult<T> {
  success: boolean;
  data?: T;
  warnings: Diagnostic[];
  errors: Diagnostic[];
  metadata: {
    tool: string;
    network: 'testnet' | 'mainnet' | 'futurenet';
    timestamp: string;
  };
}
```

This enables:
- JSON output for CLI (`--json`)
- Consistent error handling
- Future AI agent integration
- Testability

### 4. Modular & Extensible
Features should be modular to enable:
- Independent development by contributors
- Easy addition of new diagnostic rules
- Plugin architecture (future)
- Selective package imports

## Technology Stack

### Core Languages
- **TypeScript** (primary) - All application logic, CLI, web
- **Rust** (optional) - Only where lower-level Soroban functionality genuinely benefits

### Frameworks & Tools
- **Next.js 15** - Web application framework
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **pnpm** - Package manager
- **Turborepo** - Monorepo build system
- **Vitest** - Testing framework

### Stellar Integration
- **@stellar/stellar-sdk v17+** - Official Stellar JavaScript SDK
  - Network communication (Horizon & Soroban RPC)
  - Transaction building/simulation
  - XDR encoding/decoding (built-in)
  - Contract interaction
- **stellar-cli v28.0.0** - CLI integration for diagnostics
- **Soroban RPC** - Primary API for smart contract operations
- **Horizon API** - Legacy operations (account queries)

### Testing
- **Vitest** - Unit tests
- **Testing Library** - React component tests
- **Mock Service Worker** - API mocking
- **Integration tests** - Against Stellar Testnet (minimal, clearly separated)

### CI/CD
- **GitHub Actions** - Automated testing, linting, builds
- **ESLint** - Linting
- **Prettier** - Formatting
- **TypeScript** - Type checking

## Monorepo Structure

```
stellar-devkit/
├── apps/
│   └── web/                    # Next.js web application
│       ├── src/
│       │   ├── app/           # App router pages
│       │   ├── components/    # React components (presentation only)
│       │   └── lib/           # Web-specific utilities
│       ├── public/
│       └── package.json
│
├── packages/
│   ├── core/                  # Core business logic (network-agnostic)
│   │   ├── src/
│   │   │   ├── account/       # Account inspection
│   │   │   ├── contract/      # Contract inspection
│   │   │   ├── transaction/   # Transaction inspection
│   │   │   ├── xdr/           # XDR decoding
│   │   │   ├── network/       # Network health checks
│   │   │   ├── types/         # Shared TypeScript types
│   │   │   └── utils/         # Utilities
│   │   ├── test/
│   │   └── package.json
│   │
│   ├── diagnostics/           # Diagnostic engine & rules
│   │   ├── src/
│   │   │   ├── engine/        # Diagnostic runner
│   │   │   ├── rules/         # Individual diagnostic rules
│   │   │   ├── errors/        # Soroban error registry
│   │   │   └── doctor/        # Project doctor implementation
│   │   ├── test/
│   │   └── package.json
│   │
│   ├── stellar/               # Stellar SDK abstractions
│   │   ├── src/
│   │   │   ├── client/        # RPC/Horizon client wrappers
│   │   │   ├── xdr/           # XDR utilities
│   │   │   ├── contracts/     # Contract interaction helpers
│   │   │   └── networks/      # Network configuration
│   │   ├── test/
│   │   └── package.json
│   │
│   ├── cli/                   # CLI implementation
│   │   ├── src/
│   │   │   ├── commands/      # Command implementations
│   │   │   ├── output/        # Output formatters (text/JSON)
│   │   │   └── index.ts       # CLI entry point
│   │   ├── test/
│   │   └── package.json
│   │
│   └── ui/                    # Shared UI components (optional)
│       ├── src/
│       │   ├── components/    # Reusable React components
│       │   └── styles/        # Shared styles
│       └── package.json
│
├── integrations/              # Future integrations (Phase 2+)
│   ├── github-action/         # GitHub Action
│   ├── mcp/                   # MCP server
│   └── vscode/                # VS Code extension
│
├── examples/                  # Example Soroban projects for testing
│   ├── hello-world/
│   └── token/
│
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── CONTRIBUTING.md
│
├── .github/
│   ├── workflows/             # CI/CD
│   └── ISSUE_TEMPLATE/        # Issue templates
│
├── ROADMAP.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
├── LICENSE
├── README.md
├── package.json               # Root package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json              # Base TypeScript config
```

## Package Dependency Graph

```
┌─────────────┐
│     cli     │
└──────┬──────┘
       │
       ├──────────────┐
       ▼              ▼
┌─────────────┐ ┌─────────────┐
│ diagnostics │ │    core     │
└──────┬──────┘ └──────┬──────┘
       │               │
       └───────┬───────┘
               ▼
        ┌─────────────┐
        │   stellar   │
        └──────┬──────┘
               │
               ▼
     @stellar/stellar-sdk
```

```
┌─────────────┐
│     web     │
└──────┬──────┘
       │
       ├──────────────┐
       ▼              ▼
┌─────────────┐ ┌─────────────┐
│     ui      │ │    core     │
└─────────────┘ └──────┬──────┘
                       │
                       ├──────────────┐
                       ▼              ▼
                ┌─────────────┐ ┌─────────────┐
                │ diagnostics │ │   stellar   │
                └─────────────┘ └─────────────┘
```

**Key Principle**: `web` and `cli` never directly import each other. They share logic through `core`, `diagnostics`, and `stellar` packages.

## Core Package APIs

### @stellar-devkit/core

Primary business logic package. Exports functions for all major operations:

```typescript
// Account inspection
export async function inspectAccount(
  publicKey: string,
  network: Network
): Promise<ToolResult<AccountInfo>>;

// Contract inspection
export async function inspectContract(
  contractId: string,
  network: Network
): Promise<ToolResult<ContractInfo>>;

// Transaction inspection
export async function inspectTransaction(
  hash: string,
  network: Network
): Promise<ToolResult<TransactionInfo>>;

// XDR decoding
export function decodeXdr(
  xdr: string,
  type: XdrType
): ToolResult<DecodedXdr>;

// Network health
export async function checkNetworkHealth(
  network: Network
): Promise<ToolResult<NetworkHealth>>;
```

### @stellar-devkit/diagnostics

Diagnostic engine and rules:

```typescript
// Run project diagnostics
export async function runProjectDiagnostics(
  projectPath: string,
  options?: DiagnosticOptions
): Promise<DiagnosticReport>;

// Explain Soroban error
export function explainError(
  error: string | Error
): ErrorExplanation;

// Diagnostic rule registry
export interface DiagnosticRule {
  code: string;
  severity: 'error' | 'warning' | 'info';
  check: (context: ProjectContext) => Promise<DiagnosticResult[]>;
}

export function registerRule(rule: DiagnosticRule): void;
```

### @stellar-devkit/stellar

Stellar SDK abstractions:

```typescript
// RPC client
export class SorobanRpcClient {
  async getHealth(): Promise<RpcHealth>;
  async getLatestLedger(): Promise<LedgerInfo>;
  async simulateTransaction(tx: Transaction): Promise<SimulationResult>;
  async getEvents(filter: EventFilter): Promise<ContractEvent[]>;
  async getLedgerEntries(keys: LedgerKey[]): Promise<LedgerEntry[]>;
}

// Horizon client
export class HorizonClient {
  async getAccount(publicKey: string): Promise<AccountResponse>;
  async getTransaction(hash: string): Promise<TransactionResponse>;
}

// Network configuration
export const NETWORKS: Record<NetworkName, NetworkConfig>;
```

### @stellar-devkit/cli

CLI implementation:

```typescript
// Command structure
export interface Command {
  name: string;
  description: string;
  options: CommandOption[];
  action: (args: CommandArgs) => Promise<void>;
}

// Output formatters
export function formatText(result: ToolResult<any>): string;
export function formatJson(result: ToolResult<any>): string;
```

## Data Flow

### CLI Flow
```
User Input
    ↓
CLI Parser (yargs/commander)
    ↓
Command Handler
    ↓
@stellar-devkit/core (business logic)
    ↓
@stellar-devkit/stellar (Stellar SDK wrapper)
    ↓
Stellar Network (RPC/Horizon)
    ↓
Structured Result
    ↓
Output Formatter (text/JSON)
    ↓
Console Output
```

### Web Flow
```
User Interaction
    ↓
React Component (presentation)
    ↓
@stellar-devkit/core (business logic)
    ↓
@stellar-devkit/stellar (Stellar SDK wrapper)
    ↓
Stellar Network (RPC/Horizon)
    ↓
Structured Result
    ↓
React Component (display)
```

## API Integration Strategy

### Soroban RPC (Primary)
Used for:
- Contract inspection (`getLedgerEntries`)
- Event querying (`getEvents`)
- Transaction simulation (`simulateTransaction`)
- Network health (`getHealth`, `getLatestLedger`)

**Endpoints:**
- Testnet: `https://soroban-testnet.stellar.org`
- Futurenet: `https://rpc-futurenet.stellar.org`
- Mainnet: Third-party providers (configurable)

**Limitations:**
- ~7 days of historical data
- Not suitable for comprehensive indexing
- No public mainnet endpoint from SDF

### Horizon API (Secondary)
Used for:
- Account queries (until fully migrated to RPC)
- Legacy transaction history

**Status:** Approaching end-of-life, minimize dependencies

### stellar-cli Integration
Used for:
- Project diagnostics (checking installation)
- Contract compilation verification
- WASM generation checks

**Strategy:** Shell out to `stellar` CLI, parse output

## Error Handling Strategy

### Diagnostic Registry
```typescript
interface ErrorDefinition {
  pattern: RegExp | string;
  title: string;
  explanation: string;
  causes: string[];
  recommendations: string[];
  references?: string[];
}

const ERROR_REGISTRY: ErrorDefinition[] = [
  {
    pattern: /Error\(Storage, MissingValue\)/,
    title: 'Storage entry not found',
    explanation: 'The contract attempted to read a storage entry that does not exist.',
    causes: [
      'Contract state has not been initialized',
      'Wrong storage key was requested',
      'Expected ledger entry expired',
      'Wrong contract/network is being queried'
    ],
    recommendations: [
      'Verify the contract ID',
      'Check initialization',
      'Inspect storage assumptions',
      'Check ledger TTL'
    ],
    references: ['https://developers.stellar.org/docs/storage']
  }
  // ... more error definitions
];
```

### Network Error Handling
```typescript
try {
  const result = await stellarOperation();
  return { success: true, data: result, warnings: [], errors: [] };
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    return {
      success: false,
      errors: [{
        code: 'NETWORK_UNREACHABLE',
        severity: 'error',
        message: 'Cannot connect to Stellar network',
        suggestion: 'Check your network connection and RPC endpoint'
      }]
    };
  }
  // ... handle other errors
}
```

## Testing Strategy

### Unit Tests
- Every core function in `@stellar-devkit/core`
- Every diagnostic rule in `@stellar-devkit/diagnostics`
- XDR decoding edge cases
- Error registry mappings

**Mocking:** Use MSW to mock Stellar RPC/Horizon responses

### Integration Tests
- Small number of tests against Stellar Testnet
- Clearly separated from unit tests
- Use test accounts with known state
- Can be skipped in CI if needed

### Component Tests
- React components in isolation
- Test presentation logic only
- Mock core package functions

### CLI Tests
- Argument parsing
- Output formatting (text/JSON)
- Error handling

## Security Considerations

### Private Key Handling
**Phase 1 Rule:** NEVER request, store, or log private keys/seed phrases.

- All operations are read-only
- No transaction signing in Phase 1
- No custodial key storage ever

### Future Transaction Signing (Phase 2+)
If added:
- Use Freighter wallet integration
- Use hardware wallet integration
- Explicit user approval for every signature
- Never store keys

### Input Validation
```typescript
// Validate all user inputs
export function isValidPublicKey(key: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(key) && validateChecksum(key);
}

export function isValidContractId(id: string): boolean {
  return /^C[A-Z0-9]{55}$/.test(id) && validateChecksum(id);
}

export function sanitizeXdr(xdr: string): string {
  // Remove potentially dangerous characters
  return xdr.replace(/[^A-Za-z0-9+/=]/g, '');
}
```

### Rate Limiting
For web application:
- Client-side rate limiting for RPC calls
- Prevent abuse of public endpoints
- Respect RPC provider limits

### Dependency Security
- Regular `npm audit` in CI
- Dependabot alerts enabled
- Manual review of critical dependencies

## Extensibility

### Adding New Diagnostic Rules
```typescript
// packages/diagnostics/src/rules/check-panics.ts
import { DiagnosticRule } from '../engine';

export const checkPanicsRule: DiagnosticRule = {
  code: 'UNCHECKED_PANIC',
  severity: 'warning',
  async check(context) {
    const results = [];
    
    const rustFiles = await context.findFiles('**/*.rs');
    for (const file of rustFiles) {
      const content = await context.readFile(file);
      const panics = findPanics(content);
      
      if (panics.length > 0) {
        results.push({
          file,
          line: panics[0].line,
          message: 'Unchecked panic! found',
          suggestion: 'Consider using Result<T, E> for error handling'
        });
      }
    }
    
    return results;
  }
};

// Register in packages/diagnostics/src/index.ts
registerRule(checkPanicsRule);
```

### Adding New Error Explanations
```typescript
// packages/diagnostics/src/errors/registry.ts
export function registerError(definition: ErrorDefinition): void {
  ERROR_REGISTRY.push(definition);
}

// Contributors can add new errors
registerError({
  pattern: /Error\(Auth, InvalidAction\)/,
  title: 'Invalid authorization action',
  explanation: '...',
  causes: ['...'],
  recommendations: ['...']
});
```

## Future Integration Points

### MCP Server (Phase 2)
```typescript
// integrations/mcp/src/index.ts
import { createMcpServer } from '@stellar-devkit/mcp';
import * as core from '@stellar-devkit/core';

const server = createMcpServer({
  tools: [
    {
      name: 'stellar_get_account',
      handler: core.inspectAccount
    },
    {
      name: 'stellar_inspect_contract',
      handler: core.inspectContract
    }
    // ... more tools
  ]
});
```

### GitHub Action (Phase 2)
```yaml
# integrations/github-action/action.yml
name: 'Stellar DevKit'
description: 'Run Stellar DevKit diagnostics'
inputs:
  command:
    description: 'DevKit command to run'
    required: true
runs:
  using: 'node20'
  main: 'dist/index.js'
```

### VS Code Extension (Phase 3)
```typescript
// integrations/vscode/src/extension.ts
import * as vscode from 'vscode';
import { runProjectDiagnostics } from '@stellar-devkit/diagnostics';

export function activate(context: vscode.ExtensionContext) {
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('stellar');
  
  // Run diagnostics on save
  vscode.workspace.onDidSaveTextDocument(async (document) => {
    const report = await runProjectDiagnostics(vscode.workspace.rootPath);
    // Convert to VS Code diagnostics...
  });
}
```

## Build & Development

### Local Development
```bash
# Install dependencies
pnpm install

# Start web app
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm typecheck
```

### Package Scripts
Each package should have:
- `build` - Compile TypeScript
- `test` - Run tests
- `lint` - Run linter
- `typecheck` - Run TypeScript compiler

### Turborepo Configuration
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

## Deployment

### CLI Distribution
- npm registry: `@stellar-devkit/cli`
- Optional: standalone binaries (pkg/ncc)

### Web Application
- Static export: `next build && next export`
- Deploy to: Vercel, Netlify, Cloudflare Pages, GitHub Pages
- No server-side rendering required (Phase 1)

## Technical Risks & Mitigations

### Risk 1: RPC Historical Data Limitations
**Risk:** 7-day RPC retention limits event/transaction history

**Mitigation:**
- Document limitation clearly
- Use Horizon for older data where applicable
- Consider third-party indexers for production deployments
- Focus Phase 1 on recent/live data

### Risk 2: No Public Mainnet RPC
**Risk:** SDF doesn't provide public mainnet RPC endpoint

**Mitigation:**
- Default to testnet in Phase 1
- Allow custom RPC endpoint configuration
- Document third-party RPC providers
- Clear network selection UI

### Risk 3: Horizon End-of-Life
**Risk:** Horizon is being phased out

**Mitigation:**
- Minimize Horizon dependencies
- Prioritize RPC methods
- Abstract network layer for easy migration
- Monitor Stellar developer announcements

### Risk 4: Contract Introspection Limits
**Risk:** Limited metadata available from deployed contracts

**Mitigation:**
- Set realistic expectations
- Show only verifiable data
- Don't fabricate missing information
- Clearly label data source limitations

### Risk 5: Cross-Platform CLI Compatibility
**Risk:** stellar-cli integration may behave differently on Windows/Mac/Linux

**Mitigation:**
- Test on all platforms
- Use cross-platform path handling
- Document platform-specific requirements
- Provide fallback when CLI unavailable

## Performance Considerations

### RPC Rate Limiting
- Implement client-side request queuing
- Cache responses where appropriate (with TTL)
- Batch requests using `getLedgerEntries` (up to 200 keys)

### XDR Parsing
- Stream large XDR data
- Lazy decode (only decode requested fields)

### Large Contract States
- Paginate contract storage queries
- Warn users about large data sets
- Implement progressive loading in web UI

## Conclusion

This architecture provides:

✅ **Modularity** - Reusable packages for CLI, web, and future integrations  
✅ **Testability** - Clear boundaries, easy to mock  
✅ **Extensibility** - Plugin-friendly diagnostic system  
✅ **Maintainability** - Separation of concerns, typed interfaces  
✅ **Security** - No private key handling, input validation  
✅ **Developer Experience** - Consistent APIs, structured results  

The design prioritizes **correctness over features** and **maintainability over speed of initial development**.
