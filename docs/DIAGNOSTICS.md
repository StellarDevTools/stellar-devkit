# Adding Project Doctor diagnostics

Implement rules in `packages/diagnostics/src/doctor.ts` and fixtures in `packages/diagnostics/test/doctor.test.ts`. Each finding requires a stable code, severity, title, explanation (`message`) and recommendation (`suggestion`).

Parse TOML rather than matching comments for dependency names. Respect lib.path and virtual workspace roots. Treat missing conventional test files as informational: inline tests may exist. Do not infer unsupported SDK versions without a maintained compatibility source. Do not run project build scripts, shell commands assembled from inputs, or inspect private keys.

Test a triggering fixture and a valid counterexample, plus unreadable/invalid input where relevant. Mock fixed tool probes and test their timeout/arguments. Keep default tests independent of Rust installations and Stellar endpoints. `checkTools: false` is the MCP mode and an Action/CLI option.

Current limits: no recursive workspace resolution, compatibility matrix, compilation, WASM optimization verification or secret scanning. Those need independently specified, reliable rules.
