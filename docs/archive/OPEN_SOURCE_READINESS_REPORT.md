# Stellar DevKit readiness review

Review date: 2026-10-04. Repository: [StellarDevTools/stellar-devkit](https://github.com/StellarDevTools/stellar-devkit).
Branch: `main`. Starting commit: `4e83e9b1b48a3ba7f2e6c61878f24d44fa14ed3c`.
The ending revision is the commit containing this report; the task handoff records its exact SHA. This report supersedes the earlier unsupported completion and coverage claims.

## Engineering changes

- Added shared network/endpoint validation, bounded caller waiting, JSON-safe ScVal/event serialization and 19 error registry mappings. Core tools reuse these abstractions; diagnostics retains its error-registry export.
- Added core, CLI and MCP invocation simulation. Outputs include instruction/IO/footprint estimates, minimum resource fee, authorization entries, decoded return value, diagnostic events and restore preamble. No signing, submission or restoration is performed.
- Replaced Doctor substring matching with TOML parsing. Added reliable manifest/crate/source/layout findings, virtual-workspace recognition and optional fixed executable probes with timeouts. MCP runs manifest-only checks.
- Corrected WASM hashing to SHA-256, added instance modification/TTL metadata, preserved SDK event values and server cursors, and decoded transaction result/operation codes and sequence. Unsupported metadata versions are explicitly reported.
- Added MCP runtime schema checks, unknown-field rejection, normalized tool failures, custom RPC options and handler tests. MCP build/typecheck now succeeds locally.
- Repaired CLI executable output/path and version display; ordered package type exports correctly. Core/diagnostics manifests now agree with their existing 0.1.0 APIs; other packages retain their own development versions.
- Added Action report output, manifest-only mode, isolated tsconfig, behavior tests and a checked-in ncc bundle. CI exercises that bundle against a committed manifest fixture.
- Updated CI to Node 22, pinned pnpm 8.15.0 and current major setup/cache actions. Install remains frozen, and no failing tests or assertions were removed.

## Bugs fixed

The prior code reported WASM bytes as a hash; treated parsed SDK event values as raw response JSON; lost response cursors; discarded parsed transaction result XDR; cast unvalidated MCP arguments; pointed the CLI bin to a missing file; and inferred Soroban dependencies from comments. The Action had no distributable bundle and its typecheck lacked a local tsconfig. These defects are addressed in this pass.

## Documentation and contributor readiness

Repository owner links, CI badge, homepage, clone commands and issue URLs now target the real repository. Missing API/CLI/diagnostic/error guides were added. The roadmap and phase summaries distinguish delivered capabilities from remaining work. Unverified npm/release/Marketplace claims, disabled Discussions links, guessed coverage percentages and the unverified security mailbox were removed. GitHub private vulnerability reporting was enabled and verified.

Apache 2.0 remains unchanged. A project Code of Conduct was added. The contributor guide explains package responsibilities, tool/rule/error development, deterministic tests and PR validation. No fake release, PR, contributor or activity was created.

## Validation evidence

Validation uses real package scripts and deterministic local fixtures. No measured code-coverage percentage is claimed.

| Check | Result |
| --- | --- |
| pnpm install / frozen install | Passed |
| pnpm lint | Passed, warnings retained |
| pnpm typecheck | Passed, all eight packages |
| pnpm test | 123 tests passed across 14 files on GitHub CI; local full run passed 122 before the final regression was added and passed in the 34-test Stellar package suite |
| pnpm build | Passed, all eight workspace packages; web generated 11 static pages |
| Built CLI | Help and manifest-only Doctor JSON smoke checks passed |
| Bundled Action | Manifest-only diagnostic execution exited 0 |
| Markdown links / diff | No missing local Markdown targets; source diff whitespace check passed |

The baseline had 33 tests. The final source contains 123 tests (90 added): stellar 34, core 49, diagnostics 14, CLI 4, MCP 18, Action 4. CI run 37165583027 verifies the combined engineering tree.

Local checks use Windows with Node 24.18.0 and pnpm 8.15.0; CI uses Linux/Node 22. Existing warnings include CLI console output, legacy any types, Next lint deprecation and Stellar SDK native-module bundling. They are not hidden or promoted into an unsupported warning-free claim.

## CI and deployment

Engineering commit `2b4fb2ff482aed1fd3284d2a1d2a94d4d6248bed` passed all four jobs in [CI run 37165583027](https://github.com/StellarDevTools/stellar-devkit/actions/runs/37165583027): lint, typecheck, tests and build. The build job also exercised the CLI executable and bundled Doctor Action. Both Vercel commit statuses report successful deployments for this SHA: deployment IDs 6835016877 (stellar-devkit) and 6835018896 (stellar-devkit-dif2). This report's final documentation-only commit records that verified engineering revision.

The existing homepage https://stellar-devkit-eta.vercel.app and /tools plus all six tool routes returned HTTP 200 with the Stellar DevKit title. This is route availability evidence, not a browser E2E or live-network functional test. Vercel reported successful deployments for both the starting commit and the verified engineering revision above. `apps/web/vercel.json` and docs/DEPLOYMENT.md document monorepo build settings. No new domain or npm/Marketplace release was created.

## Public contributor backlog

There are 14 real open issues, all created after checking for duplicates. Each contains a problem, Stellar relevance, scope, acceptance criteria, testing, exclusions, relevant files and complexity. See [the complete linked index](docs/CONTRIBUTOR_BACKLOG.md).

| Issue | Complexity |
| --- | --- |
| #1 Event Viewer web interface | Medium |
| #2 WASM contract specification extraction | Large |
| #3 Known-key storage/TTL inspection | Large |
| #4 Metadata v4 and fee-bump inner results | Large |
| #5 Operation-level failure explanations | Medium |
| #6 Cargo workspace/inherited dependencies | Large |
| #7 RPC retries/cancellation and transport tests | Medium |
| #8 Horizon account regression coverage | Medium |
| #9 Fee-bump XDR decoding | Medium |
| #10 MCP client/stdio interoperability tests | Medium |
| #11 Isolated CLI tarball installation tests | Medium |
| #12 Read-only VS Code foundation | Large |
| #13 Simulation web workflow | Medium |
| #14 Dependency advisory remediation | Large |

## Remaining weaknesses and deferred work

- `pnpm audit --json` reports 30 advisories: 1 critical, 11 high, 13 moderate, 5 low. The critical finding concerns the Vitest UI server (default tests use vitest run). Other findings include legacy MCP HTTP transport protections (this integration uses stdio), SDK-transitive TOML parsing, HTTP dependencies and development tools. These are findings requiring applicability review, not proof every surface is reachable. They remain unresolved in issue #14; this pass does not claim a clean security audit.
- No full browser E2E suite, measured coverage target, independent security audit, packaged MCP protocol suite or isolated CLI installation suite.
- Account mapping remains under-tested; richer operation explanations, v4 metadata and fee-bump XDR/result handling remain open.
- Contract specs/storage, workspace-aware Doctor, editor integration and event/simulation web workflows remain contributor work.
- Timeout wrappers bound caller waiting but cannot cancel the underlying SDK v13 request. No global retry/rate-limit policy is claimed.
- No verified public package release, Marketplace release, external contributor history or project adoption metrics.

## Strict Drips review

The project is materially stronger and clearly Stellar-specific: implemented read-only tools, deterministic regression tests, shared reusable logic, corrected docs and a real scoped backlog. README capability claims now match the implemented interfaces and explicitly list important limitations. It is more than an empty scaffold, but it is not a production certification.

**Recommendation: delay an unconditional readiness claim/application until dependency-advisory triage and the remaining release/interoperability smoke checks have been reviewed.** A green CI run alone cannot resolve these maturity questions. The listed feature issues are legitimate future contribution opportunities; they are not all prerequisites for applying.

Drips admission is discretionary under the [program terms](https://docs.drips.network/wave/terms-and-rules/). No acceptance, reward, issue approval or funding is promised. A maintainer should decide when the disclosed limitations are acceptable and submit the application themselves; this pass does not submit one.
