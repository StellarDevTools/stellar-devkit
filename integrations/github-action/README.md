# Project Doctor GitHub Action

Run read-only local Soroban project diagnostics. The checked-in ncc bundle is required because GitHub does not build JavaScript actions for consumers.

```yaml
name: Contract diagnostics
on: [push, pull_request]
permissions:
  contents: read
jobs:
  doctor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - uses: StellarDevTools/stellar-devkit/integrations/github-action@main
        id: doctor
        with:
          project-path: ./contracts/hello
          check-tools: 'false'
          fail-on-error: 'true'
```

Set project-path to your actual Cargo crate. Pin the Action reference to a reviewed commit SHA for reproducibility. This example checks manifest/layout only, so installing Rust or Stellar CLI is unnecessary. Enable check-tools after installing your required toolchain to test executable availability as well.

Inputs: project-path (default `.`), fail-on-error (default `true`), check-tools (default `true`). Outputs: success, errors, warnings, report (full JSON diagnostic result). Errors fail only when fail-on-error is true; warnings do not fail by themselves. Unexpected execution errors always fail the action.

To consume outputs, reference `${{ steps.doctor.outputs.errors }}` or parse `report` as JSON. Do not interpolate untrusted report text into a shell command.

Development: build dependencies and run `pnpm --filter @stellar-devkit/github-action build`, test, then commit regenerated dist alongside source changes. CI tests the bundled action against examples/doctor-contract. No Marketplace release is claimed.
