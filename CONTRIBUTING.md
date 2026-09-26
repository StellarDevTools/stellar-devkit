# Contributing to Stellar DevKit

Thank you for your interest in contributing to Stellar DevKit! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs. actual behavior**
- **Environment details** (OS, Node version, etc.)
- **Screenshots** (if applicable)
- **Error messages or logs**

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

### Suggesting Features

Feature suggestions are welcome! Before creating a feature request:

- Check if it aligns with the [project goals](README.md#overview)
- Search existing feature requests
- Provide clear use cases and examples

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

### Adding Diagnostic Rules

One of the easiest ways to contribute! Diagnostic rules help developers identify issues in their Stellar/Soroban projects.

Use the [diagnostic rule template](.github/ISSUE_TEMPLATE/diagnostic_rule.md).

See [docs/DIAGNOSTICS.md](docs/DIAGNOSTICS.md) for implementation guide (Phase 1).

### Improving Documentation

Documentation improvements are always appreciated:

- Fix typos or unclear explanations
- Add examples
- Improve API documentation
- Write tutorials

Use the [documentation template](.github/ISSUE_TEMPLATE/documentation.md).

### Code Contributions

We welcome code contributions! See [Development Setup](#development-setup) below.

---

## Development Setup

### Prerequisites

- **Node.js** 18+ ([install](https://nodejs.org/))
- **pnpm** 8+ ([install](https://pnpm.io/installation))
- **Git**
- **Code editor** (VS Code recommended)

### Initial Setup

1. **Fork the repository**

   Click the "Fork" button on GitHub.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/stellar-devkit.git
   cd stellar-devkit
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/stellar-devkit/stellar-devkit.git
   ```

4. **Install dependencies**

   ```bash
   pnpm install
   ```

5. **Build all packages**

   ```bash
   pnpm build
   ```

6. **Run tests**

   ```bash
   pnpm test
   ```

7. **Start development server**

   ```bash
   pnpm dev
   ```

   The web app will be available at `http://localhost:3000`.

### Keeping Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

---

## Project Structure

```
stellar-devkit/
├── apps/
│   └── web/                    # Next.js web application
├── packages/
│   ├── core/                  # Core business logic (network-agnostic)
│   ├── diagnostics/           # Diagnostic engine & rules
│   ├── stellar/               # Stellar SDK abstractions
│   ├── cli/                   # CLI implementation
│   └── ui/                    # Shared UI components
├── integrations/              # External integrations (MCP, GitHub Action, VS Code)
├── examples/                  # Example Soroban projects
├── docs/                      # Documentation
└── .github/                   # GitHub configuration
```

### Package Responsibilities

- **`@stellar-devkit/core`** - Core business logic, tool implementations
- **`@stellar-devkit/diagnostics`** - Diagnostic engine, rules, error registry
- **`@stellar-devkit/stellar`** - Stellar SDK wrapper, network abstractions
- **`@stellar-devkit/cli`** - CLI interface, output formatters
- **`@stellar-devkit/ui`** - Shared React components

**Key Rule:** Business logic must NOT live in React components or CLI handlers. All logic should be in reusable packages.

---

## Coding Guidelines

### TypeScript

- **Strict mode enabled** - No `any` without justification
- **Explicit types** - Export public API types
- **No `ts-ignore`** - Fix the type error instead
- **Prefer functional** - Avoid classes unless necessary

### Code Style

We use ESLint and Prettier. Your code will be automatically formatted.

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check

# Lint
pnpm lint
```

### Naming Conventions

- **Files:** `kebab-case.ts`
- **Components:** `PascalCase.tsx`
- **Functions:** `camelCase`
- **Constants:** `SCREAMING_SNAKE_CASE`
- **Types/Interfaces:** `PascalCase`

### File Organization

```typescript
// 1. Imports (external, then internal)
import { useState } from 'react';
import { inspectAccount } from '@stellar-devkit/core';

// 2. Types/Interfaces
interface Props {
  publicKey: string;
}

// 3. Constants
const DEFAULT_NETWORK = 'testnet';

// 4. Main code
export function Component({ publicKey }: Props) {
  // ...
}

// 5. Helper functions (if not extracted to utils)
function helperFunction() {
  // ...
}
```

### Comments

- **Default to writing no comments** - Well-named code is self-documenting
- **Only comment WHY, not WHAT** - Explain non-obvious reasoning
- **Avoid outdated comments** - Update or remove when code changes

**When to comment:**
- Hidden constraints
- Subtle invariants
- Workarounds for specific bugs
- Behavior that would surprise a reader

**When NOT to comment:**
- What the code does (naming should explain this)
- Current task or fix (belongs in PR description)
- Obvious operations

### Error Handling

- **Validate inputs** - Never trust user input
- **Return structured errors** - Use `ToolResult<T>` pattern
- **No silent failures** - Always surface errors
- **Provide context** - Error messages should be actionable

```typescript
// ✅ Good
export async function inspectAccount(
  publicKey: string
): Promise<ToolResult<AccountInfo>> {
  if (!isValidPublicKey(publicKey)) {
    return {
      success: false,
      errors: [{
        code: 'INVALID_PUBLIC_KEY',
        message: 'Public key must start with G and be 56 characters',
        suggestion: 'Verify the account address format'
      }]
    };
  }
  
  try {
    const account = await fetchAccount(publicKey);
    return { success: true, data: account, warnings: [], errors: [] };
  } catch (error) {
    return {
      success: false,
      errors: [{
        code: 'NETWORK_ERROR',
        message: 'Failed to fetch account',
        suggestion: 'Check network connection and RPC endpoint'
      }]
    };
  }
}
```

### Security

- **Never log secrets** - No private keys, seed phrases, or sensitive data
- **Validate all inputs** - Sanitize user input
- **No eval()** - Never execute arbitrary code
- **Rate limiting** - Prevent abuse of RPC endpoints
- **Dependencies** - Keep dependencies updated

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @stellar-devkit/core test

# Watch mode
pnpm test:watch
```

### Writing Tests

We use **Vitest** for testing.

```typescript
// packages/core/test/account.test.ts
import { describe, it, expect } from 'vitest';
import { inspectAccount } from '../src/account';

describe('inspectAccount', () => {
  it('should reject invalid public keys', async () => {
    const result = await inspectAccount('INVALID');
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
  });

  it('should return account info for valid keys', async () => {
    const result = await inspectAccount('GACCOUNT...');
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});
```

### Test Coverage

- **Core functions:** >80%
- **Diagnostic rules:** 100%
- **XDR decoder:** >90%
- **CLI commands:** >70%

### Mocking

Use **Mock Service Worker (MSW)** for mocking Stellar APIs:

```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('https://soroban-testnet.stellar.org', () => {
    return HttpResponse.json({ result: { status: 'healthy' } });
  })
);
```

---

## Pull Request Process

### Before Submitting

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   Follow the [Coding Guidelines](#coding-guidelines).

3. **Write tests**

   All new features must include tests.

4. **Run validation**

   ```bash
   pnpm build      # Must pass
   pnpm test       # Must pass
   pnpm lint       # Must pass
   pnpm typecheck  # Must pass
   ```

5. **Commit your changes**

   Use conventional commits:

   ```bash
   feat: add XDR decoding for transaction envelopes
   fix: handle expired ledger entries correctly
   docs: update CLI usage guide
   test: add tests for account inspector
   chore: update dependencies
   ```

6. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**

   Use the PR template and provide:
   - Clear description of changes
   - Related issue number (if applicable)
   - Screenshots (for UI changes)
   - Testing notes

### PR Review Process

1. **Automated checks** - CI must pass
2. **Code review** - At least one maintainer approval required
3. **Testing** - Reviewers may test functionality
4. **Revisions** - Address feedback in new commits
5. **Merge** - Maintainer will merge when approved

### After Merge

Your contribution will be included in the next release and credited in the changelog.

---

## Issue Guidelines

### Before Creating an Issue

- Search existing issues
- Check documentation
- Verify it's not a duplicate

### Issue Templates

We provide templates for:
- **Bug reports** - Something isn't working
- **Feature requests** - Suggest new functionality
- **Diagnostic rules** - Add new diagnostic checks
- **Documentation** - Improve or fix docs

### Issue Labels

- `bug` - Something isn't working
- `feature` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `rust` - Rust-related
- `typescript` - TypeScript-related
- `frontend` - Web UI
- `stellar` - Stellar integration
- `soroban` - Soroban contracts
- `diagnostics` - Diagnostic rules

---

## Development Workflow

### Typical Workflow

1. Find or create an issue
2. Comment that you're working on it
3. Fork and create a branch
4. Make changes
5. Write tests
6. Run validation
7. Commit with conventional commits
8. Push and open PR
9. Address review feedback
10. Celebrate when merged! 🎉

### Working on Packages

```bash
# Work on a specific package
cd packages/core

# Watch mode for development
pnpm dev

# Run tests
pnpm test

# Build
pnpm build
```

### Working on Web App

```bash
# Start development server
pnpm dev

# Access at http://localhost:3000
```

### Adding Dependencies

```bash
# Add to root
pnpm add -w <package>

# Add to specific package
pnpm --filter @stellar-devkit/core add <package>

# Add dev dependency
pnpm --filter @stellar-devkit/core add -D <package>
```

---

## Getting Help

- **Discussions:** [GitHub Discussions](https://github.com/stellar-devkit/stellar-devkit/discussions)
- **Issues:** [GitHub Issues](https://github.com/stellar-devkit/stellar-devkit/issues)
- **Stellar Discord:** [Join here](https://discord.gg/stellardev)

---

## Recognition

All contributors will be:
- Listed in the project contributors
- Mentioned in release notes
- Credited in the changelog

---

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

---

**Thank you for contributing to Stellar DevKit!** 🚀

Your contributions help make the Stellar developer experience better for everyone.
