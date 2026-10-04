# Repository audit — 2026-10-03

Repository: https://github.com/StellarDevTools/stellar-devkit
Starting branch: `main`; starting commit: `4e83e9b1b48a3ba7f2e6c61878f24d44fa14ed3c`.
This audit was completed before implementation. Findings describe that commit.

| Area         | Evidence                                                                                                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture | pnpm 8.15.0 / Turbo monorepo: web, core, diagnostics, stellar, cli, ui, MCP and Action. Stellar/UI packages are placeholders.                                                                   |
| Tools        | Eight CLI commands; six web tool pages; eight MCP handlers. Core account/XDR/RPC/contract/transaction/events implementations exist.                                                             |
| Incomplete   | Simulation absent; events UI absent; contract hash incorrectly uses WASM prefix; SDK event objects parsed as raw JSON; transaction result codes discarded.                                      |
| Tests        | Baseline `pnpm test`: 33 tests across six files (core 27, diagnostics 2, CLI 2, stellar 2). Most modules lack behavioral tests. No measured coverage percentage.                                |
| CI           | Run 37113246818 fails MCP build/typecheck: optional unknown arguments used without validation.                                                                                                  |
| Contributors | Four issue templates and PR template exist; guide references nonexistent API types and missing documents.                                                                                       |
| README       | Old owner, phase completion overclaims, inconsistent counts, npm install instructions without release evidence.                                                                                 |
| Links        | API.md, CLI.md, DIAGNOSTICS.md and CODE_OF_CONDUCT.md absent. Discussions disabled.                                                                                                             |
| Deployment   | Homepage https://stellar-devkit-eta.vercel.app returns HTTP 200. Vercel deployments 6825955111 and 6825923048 report success for starting SHA.                                                  |
| Issues       | GitHub API returns zero issues; 27 local proposals are not GitHub issues.                                                                                                                       |
| PRs/releases | GitHub API returns zero PRs and zero releases. No external contribution evidence inferred.                                                                                                      |
| Maturity     | Apache 2.0 LICENSE exists. Action dist absent; CLI bin points to missing file. Package/source versions disagree. Security policy claims rate limiting that is absent and an unverified mailbox. |
| Drips gaps   | No public technical backlog, failing CI, insufficient regression coverage, inaccurate maturity claims.                                                                                          |
| Order        | Documentation accuracy; shared RPC helpers and simulation; Doctor/error/inspection correctness; MCP/Action tests and packaging; real remaining-work issues; full validation and final review.   |

Selection is discretionary; a count of issues is not an admission guarantee.
References: [Stellar Wave](https://www.drips.network/wave/stellar),
[maintainer terms](https://docs.drips.network/wave/terms-and-rules/).

See the final readiness report for changes and validation after this audit.
