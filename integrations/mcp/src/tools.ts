import {
  decodeXDR,
  checkRPCHealth,
  inspectAccount,
  inspectContract,
  inspectTransaction,
  queryEvents,
  simulateTransaction,
  type NetworkType,
} from '@stellar-devkit/core';
import { explainError, diagnoseProject } from '@stellar-devkit/diagnostics';

type Field = {
  type: string;
  description?: string;
  default?: unknown;
  enum?: string[];
  items?: { type: string };
};
export const toolDefinitions: {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, Field>;
    required?: string[];
    additionalProperties?: boolean;
  };
}[] = [
  {
    name: 'stellar_decode_xdr',
    description: 'Decode Stellar XDR to human-readable format',
    inputSchema: {
      type: 'object',
      properties: {
        xdr: { type: 'string', description: 'Base64 XDR string' },
        network: {
          type: 'string',
          enum: ['testnet', 'mainnet', 'futurenet'],
          default: 'testnet',
        },
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
        network: {
          type: 'string',
          enum: ['testnet', 'mainnet', 'futurenet'],
          default: 'testnet',
        },
        customEndpoint: {
          type: 'string',
          description: 'Custom RPC endpoint URL',
        },
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
        network: {
          type: 'string',
          enum: ['testnet', 'mainnet', 'futurenet'],
          default: 'testnet',
        },
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
        customRpcUrl: {
          type: 'string',
          description: 'Custom RPC endpoint (required for Mainnet)',
        },
        contractId: { type: 'string', description: 'Contract ID (C...)' },
        network: {
          type: 'string',
          enum: ['testnet', 'mainnet', 'futurenet'],
          default: 'testnet',
        },
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
        customRpcUrl: {
          type: 'string',
          description: 'Custom RPC endpoint (required for Mainnet)',
        },
        hash: { type: 'string', description: 'Transaction hash (hex)' },
        network: {
          type: 'string',
          enum: ['testnet', 'mainnet', 'futurenet'],
          default: 'testnet',
        },
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
        network: {
          type: 'string',
          enum: ['testnet', 'mainnet', 'futurenet'],
          default: 'testnet',
        },
        customRpcUrl: { type: 'string', description: 'Custom RPC endpoint' },
        cursor: {
          type: 'string',
          description:
            'Continuation cursor; mutually exclusive with startLedger',
        },
        eventType: {
          type: 'string',
          enum: ['contract', 'system', 'diagnostic'],
        },
        startLedger: { type: 'number', description: 'Start ledger number' },
        contractIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Contract IDs to filter',
        },
        limit: {
          type: 'number',
          default: 10,
          description: 'Max events to return',
        },
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
    description:
      'Inspect local Soroban project files; does not execute project code or probe tool binaries',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', default: '.', description: 'Project path' },
      },
    },
  },
];

toolDefinitions.push({
  name: 'stellar_simulate_transaction',
  description:
    'Read-only Soroban invocation simulation; never signs or submits',
  inputSchema: {
    type: 'object',
    properties: {
      xdr: { type: 'string', description: 'Base64 transaction envelope' },
      network: {
        type: 'string',
        enum: ['testnet', 'futurenet', 'mainnet', 'custom'],
      },
      customRpcUrl: { type: 'string' },
      networkPassphrase: {
        type: 'string',
        description: 'Required for custom network',
      },
    },
    required: ['xdr'],
  },
});
for (const tool of toolDefinitions)
  tool.inputSchema.additionalProperties = false;

export async function callTool(name: string, input: unknown) {
  const reply = (value: unknown, isError = false) => ({
    content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
    isError,
  });
  const definition = toolDefinitions.find((tool) => tool.name === name);
  if (!definition)
    return reply(
      {
        success: false,
        error: { code: 'UNKNOWN_TOOL', message: 'Unknown tool name.' },
      },
      true
    );
  try {
    if (
      input !== undefined &&
      (typeof input !== 'object' || input === null || Array.isArray(input))
    )
      throw new Error('Expected an argument object.');
    const args = (input || {}) as Record<string, unknown>;
    for (const required of definition.inputSchema.required || []) {
      if (args[required] === undefined)
        throw new Error(`Missing required field: ${required}`);
    }
    for (const [key, value] of Object.entries(args)) {
      const field = definition.inputSchema.properties[key];
      if (!field)
        throw new Error('Unknown argument; pass only documented tool fields.');
      if (field.type === 'array') {
        if (
          !Array.isArray(value) ||
          value.some((item) => typeof item !== 'string')
        )
          throw new Error(`Invalid ${key}: expected string array.`);
      } else if (typeof value !== field.type)
        throw new Error(`Invalid ${key}: expected ${field.type}.`);
      if (
        typeof value === 'string' &&
        (!value.trim() || value.length > (key === 'xdr' ? 1_000_000 : 4096))
      )
        throw new Error(`Invalid ${key} length.`);
      if (field.enum && !field.enum.includes(value as string))
        throw new Error(`Invalid ${key} option.`);
      if (
        typeof value === 'number' &&
        (!Number.isSafeInteger(value) || value < 1)
      )
        throw new Error(`Invalid ${key}: expected positive integer.`);
    }
    const network = (args.network || 'testnet') as NetworkType;
    let result: unknown;
    switch (name) {
      case 'stellar_decode_xdr':
        result = decodeXDR(args.xdr as string, {
          network: network as 'testnet' | 'mainnet' | 'futurenet',
        });
        break;
      case 'stellar_check_rpc':
        result = await checkRPCHealth({
          network,
          customEndpoint: args.customEndpoint as string | undefined,
        });
        break;
      case 'stellar_get_account':
        result = await inspectAccount(args.publicKey as string, { network });
        break;
      case 'stellar_inspect_contract':
        result = await inspectContract(args.contractId as string, {
          network,
          customRpcUrl: args.customRpcUrl as string | undefined,
        });
        break;
      case 'stellar_get_transaction':
        result = await inspectTransaction(args.hash as string, {
          network,
          customRpcUrl: args.customRpcUrl as string | undefined,
        });
        break;
      case 'stellar_query_events':
        result = await queryEvents({
          network,
          customRpcUrl: args.customRpcUrl as string | undefined,
          startLedger: args.startLedger as number | undefined,
          cursor: args.cursor as string | undefined,
          eventType: args.eventType as
            'contract' | 'system' | 'diagnostic' | undefined,
          contractIds: args.contractIds as string[] | undefined,
          limit: args.limit as number | undefined,
        });
        break;
      case 'stellar_explain_error':
        result = explainError(args.error as string);
        break;
      case 'stellar_diagnose_project':
        result = await diagnoseProject((args.path as string) || '.', {
          checkTools: false,
        });
        break;
      case 'stellar_simulate_transaction':
        result = await simulateTransaction(args.xdr as string, {
          network,
          customRpcUrl: args.customRpcUrl as string | undefined,
          networkPassphrase: args.networkPassphrase as string | undefined,
        });
        break;
    }
    const failed =
      typeof result === 'object' &&
      result !== null &&
      'success' in result &&
      result.success === false;
    if (failed) {
      const failure = result as { error?: string };
      return reply(
        {
          ...(result as object),
          error: {
            code: 'TOOL_FAILED',
            message: explainError(failure.error || 'Tool reported failure')
              .context,
          },
        },
        true
      );
    }
    return reply(result);
  } catch (error) {
    // Validation errors name fields only. Never echo unknown user-provided values.
    return reply(
      {
        success: false,
        error: {
          code: 'TOOL_ERROR',
          message: explainError(
            error instanceof Error ? error.message : 'Tool failed'
          ).context,
        },
      },
      true
    );
  }
}
