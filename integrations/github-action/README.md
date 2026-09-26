# Stellar DevKit GitHub Action

Run Stellar/Soroban project diagnostics in your CI/CD pipeline.

## Usage

```yaml
name: Stellar DevKit Check

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - name: Install Stellar CLI
        run: cargo install --locked stellar-cli
      
      - name: Run Stellar DevKit Doctor
        uses: stellar-devkit/stellar-devkit/integrations/github-action@main
        with:
          project-path: '.'
          fail-on-error: 'true'
```

## Inputs

- `project-path` (optional): Path to your Stellar/Soroban project. Default: `.`
- `fail-on-error` (optional): Fail the build if errors are found. Default: `true`

## Outputs

- `success`: Whether all diagnostics passed
- `errors`: Number of errors found
- `warnings`: Number of warnings found

## What It Checks

- Rust installation and version
- Cargo installation
- Stellar CLI availability
- Project structure (Cargo.toml, src/)
- Soroban dependencies
- Common configuration issues

## Example with Custom Configuration

```yaml
- name: Check Soroban Contract
  uses: stellar-devkit/stellar-devkit/integrations/github-action@main
  with:
    project-path: './contracts/my-contract'
    fail-on-error: 'false'
  
- name: Check results
  run: |
    echo "Errors: ${{ steps.check.outputs.errors }}"
    echo "Warnings: ${{ steps.check.outputs.warnings }}"
```
