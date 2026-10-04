# CLI reference

After `pnpm build`, use `node packages/cli/dist/stellar-dev.mjs`. Substitute `stellar-dev` below with that command. npm publication is not assumed.

| Command                 | Important options                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `doctor [path]`         | `--no-check-tools`, `--json`                                                                                      |
| `xdr decode <xdr>`      | `--network`, `--json`                                                                                             |
| `account <publicKey>`   | `--network`, `--json`                                                                                             |
| `rpc health`            | `--network`, `--endpoint`, `--json`                                                                               |
| `explain <error>`       | `--json`                                                                                                          |
| `contract <contractId>` | `--network`, `--rpc-url`, `--json`                                                                                |
| `transaction <hash>`    | `--network`, `--rpc-url`, `--json`                                                                                |
| `events`                | `--network`, `--rpc-url`, `--start-ledger`, `--cursor`, repeatable `--contract-id`, `--type`, `--limit`, `--json` |
| `simulate <xdr>`        | `--network`, `--rpc-url`, `--network-passphrase`, `--json`                                                        |

Use each command's `--help` for exact syntax. Testnet is the default. Simulation supports custom network passphrases; this is a public network identifier, not a secret key. Mainnet RPC requires an explicit provider endpoint. HTTP is supported for local development.

```bash
stellar-dev doctor ./contracts/hello --no-check-tools --json
stellar-dev explain "Error(Storage, MissingValue)" --json
stellar-dev transaction "$TRANSACTION_HASH" --network testnet --json
stellar-dev events --start-ledger 12345 --contract-id "$CONTRACT_ID" --limit 20 --json
stellar-dev events --cursor "$NEXT_CURSOR" --contract-id "$CONTRACT_ID" --limit 20 --json
stellar-dev simulate "$TRANSACTION_XDR" --network testnet --json
```

Events start at the latest ledger if neither start ledger nor cursor is supplied. These options are mutually exclusive. Preserve filters between pages and use the response cursor, including on empty pages. Values include both decoded representations and base64 XDR.

Simulation accepts a regular envelope with one invokeHostFunction operation. It reports fees/resources, returned authorization entries, diagnostic events, return value and restoration requirements. It never restores entries, signs or sends a transaction. It does not estimate classic multi-operation transactions or fee-bump envelopes.

JSON output is suitable for scripts; tool failure generally exits 1. A successfully fetched FAILED transaction is a successful inspection with `details.status = "FAILED"`; inspect that field. An unknown error explanation is not evidence that an error is harmless. RPC history absence may reflect provider retention.
