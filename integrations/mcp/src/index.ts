#!/usr/bin/env node

/**
 * Stellar DevKit MCP Server
 *
 * Exposes DevKit tools via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { decodeXDR } from '@stellar-devkit/core';
import { checkRPCHealth } from '@stellar-devkit/core';
import { inspectAccount } from '@stellar-devkit/core';
import { inspectContract } from '@stellar-devkit/core';
import { inspectTransaction } from '@stellar-devkit/core';
import { queryEvents } from '@stellar-devkit/core';
import { explainError } from '@stellar-devkit/diagnostics/error-registry';
import { diagnoseProject } from '@stellar-devkit/diagnostics';

const server = new Server(
  {
    name: 'stellar-devkit',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'stellar_decode_xdr',
        description: 'Decode Stellar XDR to human-readable format',
        inputSchema: {
          type: 'object',
          properties: {
            xdr: { type: 'string', description: 'Base64 XDR string' },
            network: { type: 'string', enum: ['testnet', 'mainnet', 'futurenet'], default: 'testnet' },
          },
          required: ['xdr'],
        },
      },
      {
        name: 'stellar_check_rpc',
        description: 'Check Stellar RPC endpoint health',
        inputSchema: {
          type: 'object',
          properties: {
            network: { type: 'string', enum: ['testnet', 'mainnet', 'futurenet'], default: 'testnet' },
            customEndpoint: { type: 'string', description: 'Custom RPC endpoint URL' },
          },
        },
      },
      {
        name: 'stellar_get_account',
        description: 'Inspect Stellar account details',
        inputSchema: {
          type: 'object',
          properties: {
            publicKey: { type: 'string', description: 'Account public key (G...)' },
            network: { type: 'string', enum: ['testnet', 'mainnet', 'futurenet'], default: 'testnet' },
          },
          required: ['publicKey'],
        },
      },
      {
        name: 'stellar_inspect_contract',
        description: 'Inspect deployed Soroban contract',
        inputSchema: {
          type: 'object',
          properties: {
            contractId: { type: 'string', description: 'Contract ID (C...)' },
            network: { type: 'string', enum: ['testnet', 'mainnet', 'futurenet'], default: 'testnet' },
          },
          required: ['contractId'],
        },
      },
      {
        name: 'stellar_get_transaction',
        description: 'Get transaction details',
        inputSchema: {
          type: 'object',
          properties: {
            hash: { type: 'string', description: 'Transaction hash (hex)' },
            network: { type: 'string', enum: ['testnet', 'mainnet', 'futurenet'], default: 'testnet' },
          },
          required: ['hash'],
        },
      },
      {
        name: 'stellar_query_events',
        description: 'Query Soroban contract events',
        inputSchema: {
          type: 'object',
          properties: {
            network: { type: 'string', enum: ['testnet', 'mainnet', 'futurenet'], default: 'testnet' },
            startLedger: { type: 'number', description: 'Start ledger number' },
            contractIds: { type: 'array', items: { type: 'string' }, description: 'Contract IDs to filter' },
            limit: { type: 'number', default: 10, description: 'Max events to return' },
          },
        },
      },
      {
        name: 'stellar_explain_error',
        description: 'Explain Soroban error with diagnostics',
        inputSchema: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Error message' },
          },
          required: ['error'],
        },
      },
      {
        name: 'stellar_diagnose_project',
        description: 'Run Stellar/Soroban project diagnostics',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', default: '.', description: 'Project path' },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'stellar_decode_xdr': {
        const result = await decodeXDR(args.xdr, { network: args.network || 'testnet' });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'stellar_check_rpc': {
        const result = await checkRPCHealth({
          network: args.network || 'testnet',
          customEndpoint: args.customEndpoint,
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'stellar_get_account': {
        const result = await inspectAccount(args.publicKey, { network: args.network || 'testnet' });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'stellar_inspect_contract': {
        const result = await inspectContract(args.contractId, { network: args.network || 'testnet' });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'stellar_get_transaction': {
        const result = await inspectTransaction(args.hash, { network: args.network || 'testnet' });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'stellar_query_events': {
        const result = await queryEvents({
          network: args.network || 'testnet',
          startLedger: args.startLedger,
          contractIds: args.contractIds,
          limit: args.limit || 10,
        });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'stellar_explain_error': {
        const result = explainError(args.error);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      case 'stellar_diagnose_project': {
        const result = await diagnoseProject(args.path || '.');
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      }],
      isError: true,
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
