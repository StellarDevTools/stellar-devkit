# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Phase 0 - Foundation

#### Added
- Initial monorepo structure with pnpm workspaces
- Turborepo build system
- TypeScript configuration (strict mode)
- ESLint and Prettier setup
- Package structure:
  - `@stellar-devkit/core` - Core business logic
  - `@stellar-devkit/diagnostics` - Diagnostic engine
  - `@stellar-devkit/stellar` - Stellar SDK abstractions
  - `@stellar-devkit/cli` - CLI implementation
  - `@stellar-devkit/ui` - Shared UI components
- Next.js web application scaffold
- CLI entry point scaffold
- Documentation:
  - README.md
  - CONTRIBUTING.md
  - SECURITY.md
  - ROADMAP.md
  - docs/ARCHITECTURE.md
- CI/CD pipeline (GitHub Actions)
- Testing infrastructure (Vitest)

## [0.0.1] - 2026-09-26

### Phase 0 - Foundation

Initial project setup and architecture.

[Unreleased]: https://github.com/stellar-devkit/stellar-devkit/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/stellar-devkit/stellar-devkit/releases/tag/v0.0.1
