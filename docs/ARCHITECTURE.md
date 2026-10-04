# Architecture

Stellar DevKit remains one monorepo with eight workspace packages and a private root. Turbo orders builds using workspace dependencies.

```text
stellar (SDK/network/value/error helpers)
  -> core (inspection, event queries, simulation)
  -> diagnostics (local Doctor; error-registry compatibility export)
core + diagnostics -> CLI / MCP
core + diagnostics/error-registry -> web
 diagnostics/doctor -> GitHub Action
```

`diagnostics` currently declares a dependency on `core` for compatibility, but core never imports diagnostics. Shared error explanations live in `stellar` to avoid a dependency cycle. Browser consumers must use `diagnostics/error-registry`, not Doctor's Node filesystem entry.

Tool APIs return explicit results. Read-only RPC methods include getTransaction, getEvents, getContractData, getContractWasmByContractId, getHealth, getLatestLedger and simulateTransaction. No adapter signs or submits. HTTP endpoints permit explicitly configured local development; deployments should use HTTPS. Provider query-string credentials must not be placed in public web inputs.

SDK v13 returns parsed XDR objects. Serialization belongs in the shared packages: preserve base64 XDR, decode values where possible, represent large integers as decimal strings, and state unsupported metadata versions. Never interpret a WASM prefix as its hash or a modification ledger as the deployment ledger.

Doctor parses local TOML and optionally invokes fixed --version probes through execFileSync with timeouts. It does not execute Cargo build/test, evaluate project scripts, or follow arbitrary workspace members. MCP disables executable probes.

The UI package is a placeholder. Queuing, global rate limiting, storage enumeration, contract specification extraction and browser E2E infrastructure are not implemented. See the public backlog rather than treating earlier phase plans as an implementation specification.
