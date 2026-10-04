# Contributing to Stellar DevKit

## Finding work

Browse [open technical issues](https://github.com/StellarDevTools/stellar-devkit/issues) and the [backlog index](docs/CONTRIBUTOR_BACKLOG.md). Read the acceptance criteria and discuss scope before starting. GitHub Discussions is not enabled; use the relevant issue. Do not post secrets or security vulnerabilities publicly.

## Setup and validation

Use Node.js 22 and pnpm 8.15.0. Fork the repository, then:

```bash
git clone https://github.com/YOUR_USERNAME/stellar-devkit.git
cd stellar-devkit
git remote add upstream https://github.com/StellarDevTools/stellar-devkit.git
corepack enable
corepack prepare pnpm@8.15.0 --activate
pnpm install --frozen-lockfile
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @stellar-devkit/web dev
```

Windows users can use `pnpm.cmd`. Rust/Stellar CLI is needed only to exercise Doctor's local executable checks; unit tests mock those checks. `doctor --no-check-tools` inspects manifests without probing binaries.

Run one package's tests with `pnpm --filter @stellar-devkit/core test`; use `pnpm --filter @stellar-devkit/core test:watch` for watch mode. After changing dependencies regenerate and commit `pnpm-lock.yaml`; confirm a frozen install succeeds. Format changed files with `pnpm exec prettier --write <files>`.

## Package responsibilities

- `stellar`: RPC endpoint/network helpers, ScVal serialization, error explanations.
- `core`: read-only account, RPC, XDR, contract, transaction, event and simulation APIs.
- `diagnostics`: local filesystem/tool diagnostics; browser-safe error-registry subpath.
- `cli`: argument parsing and output presentation.
- `apps/web`: browser forms using shared APIs, not duplicate inspection logic.
- `integrations/mcp`: tool schemas, runtime validation and protocol dispatch.
- `integrations/github-action`: Doctor inputs, annotations, JSON output and failure policy.
- `ui`: reserved shared UI package; currently a placeholder.

## Adding a tool

Implement the reusable API in `core`, with explicit input validation and JSON-safe output. Add deterministic tests under `packages/core/test`, export it through the package entry, then add thin CLI/MCP/web adapters as appropriate. Keep local filesystem operations in `diagnostics`. Never add signing, submission, arbitrary shell execution, secret-key inputs or unbounded network retries.

For diagnostics follow [DIAGNOSTICS.md](docs/DIAGNOSTICS.md). For error mappings follow [ERROR_REGISTRY.md](docs/ERROR_REGISTRY.md). Current function signatures and limits are in [API.md](docs/API.md).

## Tests

Use Vitest mocks for RPC/Horizon, fixed public addresses and local temporary fixtures. Include success, invalid input, upstream failure, large integer serialization and missing/unsupported metadata cases. Assert methods that sign or submit are never called by read-only tools. Do not depend on live network availability in default tests. No repository-wide coverage percentage is currently claimed.

## Pull requests

Create a focused branch, reference the real issue, describe resulting behavior and run install/lint/typecheck/test/build. Preserve external authorship and include any limitations. Use the existing PR template. Maintainers review scope, safety, regression tests and compatibility before merging. Do not mix unrelated formatting changes into an engineering PR.

Use meaningful conventional commits, for example `feat(events): decode paginated contract events`. Do not fabricate activity or claim a release has shipped before artifacts have been verified.

Participation follows the [Code of Conduct](CODE_OF_CONDUCT.md). Contributions are licensed under [Apache 2.0](LICENSE). Security reports follow [SECURITY.md](SECURITY.md).
