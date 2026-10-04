# Package API

Build workspace dependencies before importing packages. These are source-development APIs; no npm availability is implied.

`@stellar-devkit/core` exports:

- `decodeXDR(xdr, { network })`: synchronous decoded envelope/transaction result.
- `inspectAccount(publicKey, { network, customHorizonUrl })`: Horizon account details.
- `checkRPCHealth({ network, customEndpoint, timeout })`: bounded health check; timeout in milliseconds.
- `inspectContract(contractId, { network, customRpcUrl })`: WASM identity and instance ledger metadata.
- `inspectTransaction(hash, { network, customRpcUrl })`: transaction status, parsed operations/result codes, events and raw XDR.
- `queryEvents({ network, customRpcUrl, startLedger, cursor, contractIds, eventType, limit })`: typed, decoded event page.
- `simulateTransaction(envelopeXdr, { network, customRpcUrl, networkPassphrase })`: read-only invocation simulation.

Results include `success`; failures include `error`. Inspectors use `details`, XDR uses `data`, events use `events`, and simulation returns resource/auth/event fields directly. These shapes are intentionally documented as implemented, not a nonexistent universal ToolResult schema. Exported TypeScript types are authoritative.

`@stellar-devkit/diagnostics/doctor` exports `diagnoseProject(path, { checkTools })`, with findings and error/warning/info counts. `@stellar-devkit/diagnostics/error-registry` exports `explainError(message)` and `ERROR_REGISTRY`; browser code must use this subpath to avoid importing Node filesystem modules.

`@stellar-devkit/stellar` exports endpoint/passphrase helpers, `decodeScVal`, `decodeContractEvent`, JSON-safe serialization, and shared error normalization/redaction. `explainError` returns a normalized code and safe context; unknown errors remain unknown.

No API requests secret keys, signs transactions or submits transactions. Simulation results can change with ledger state. Custom endpoint owners receive the requested public identifiers/XDR. Do not use a public deployment as a store for provider credentials.
