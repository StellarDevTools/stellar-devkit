# Stellar DevKit MCP Server

Model Context Protocol (MCP) server for Stellar DevKit. Exposes DevKit tools to AI coding assistants.

## Available Tools

- `stellar_decode_xdr` - Decode Stellar XDR
- `stellar_check_rpc` - Check RPC health
- `stellar_get_account` - Inspect Stellar account
- `stellar_inspect_contract` - Inspect Soroban contract
- `stellar_get_transaction` - Get transaction details
- `stellar_query_events` - Query contract events
- `stellar_explain_error` - Explain Soroban errors
- `stellar_diagnose_project` - Run project diagnostics

## Installation

**Note:** MCP server requires installing dependencies first:

```bash
cd integrations/mcp
pnpm install
pnpm build
npm link
```

Or when published:

```bash
npm install -g @stellar-devkit/mcp-server
```

## Usage

Add to your MCP settings (e.g., Claude Desktop config):

```json
{
  "mcpServers": {
    "stellar-devkit": {
      "command": "stellar-devkit-mcp"
    }
  }
}
```

## Security

- All tools are read-only
- No private key handling
- No transaction signing
- No write operations to blockchain
