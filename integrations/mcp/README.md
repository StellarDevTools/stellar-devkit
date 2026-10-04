# Stellar DevKit MCP server

Nine read-only tools: stellar_decode_xdr, stellar_check_rpc, stellar_get_account, stellar_inspect_contract, stellar_get_transaction, stellar_query_events, stellar_explain_error, stellar_diagnose_project, stellar_simulate_transaction.

Build from the repository root with `pnpm install --frozen-lockfile` and `pnpm build`. Configure your MCP client to run Node with the absolute path to `integrations/mcp/dist/index.js` as its argument. This does not assume an npm release or global link.

```json
{
  "mcpServers": {
    "stellar-devkit": {
      "command": "node",
      "args": ["/absolute/path/stellar-devkit/integrations/mcp/dist/index.js"]
    }
  }
}
```

Use the platform-correct absolute path (escape backslashes in JSON on Windows). Tool schemas describe supported fields. Inputs are validated at runtime; undocumented fields are rejected. Core failures set MCP isError. Responses carry JSON in text content for compatibility with the current SDK.

RPC inspection tools accept customRpcUrl; health uses customEndpoint. Mainnet needs an explicit RPC provider. Event pagination accepts cursor or startLedger, never both. Simulation custom networks require a public network passphrase. No tool signs, submits or accepts secret keys.

Doctor reads local files with checkTools=false; it does not run project code or external tool probes. This is a trusted local stdio service, not a multi-user filesystem sandbox. Tests cover validation and dispatch; complete client/stdio interoperability testing remains contributor work.
