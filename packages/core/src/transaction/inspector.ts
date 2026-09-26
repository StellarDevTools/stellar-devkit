/**
 * Transaction Inspector
 *
 * Inspect Stellar transactions using RPC
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import type {
  TransactionInspectOptions,
  TransactionInspectResult,
  TransactionStatus,
  TransactionOperation,
  TransactionEvent,
} from './types';

const DEFAULT_RPC_URLS = {
  testnet: 'https://soroban-testnet.stellar.org',
  futurenet: 'https://rpc-futurenet.stellar.org',
  // Note: No public mainnet RPC from SDF - users must provide custom endpoint
};

/**
 * Inspect a transaction
 */
export async function inspectTransaction(
  hash: string,
  options: TransactionInspectOptions = {}
): Promise<TransactionInspectResult> {
  const network = options.network || 'testnet';
  const trimmedHash = hash.trim();

  // Validate transaction hash format (64 character hex)
  if (!isValidTransactionHash(trimmedHash)) {
    return {
      success: false,
      network,
      hash: trimmedHash,
      error: 'Invalid transaction hash format. Expected 64-character hex string.',
    };
  }

  // Determine RPC URL
  let rpcUrl: string;
  if (options.customRpcUrl) {
    rpcUrl = options.customRpcUrl;
  } else if (network === 'mainnet') {
    return {
      success: false,
      network: 'mainnet',
      hash: trimmedHash,
      error: 'Mainnet requires a custom RPC endpoint. Use --rpc-url <url> or set customRpcUrl option.',
    };
  } else if (network in DEFAULT_RPC_URLS) {
    rpcUrl = DEFAULT_RPC_URLS[network as keyof typeof DEFAULT_RPC_URLS];
  } else {
    return {
      success: false,
      network,
      hash: trimmedHash,
      error: `No RPC URL available for network: ${network}`,
    };
  }

  try {
    // Create RPC server instance
    const server = new StellarSdk.rpc.Server(rpcUrl, {
      allowHttp: rpcUrl.startsWith('http://'),
    });

    // Fetch transaction
    const txResponse = await server.getTransaction(trimmedHash);

    // Parse transaction status
    let status: TransactionStatus;
    if (txResponse.status === 'SUCCESS') {
      status = 'SUCCESS';
    } else if (txResponse.status === 'FAILED') {
      status = 'FAILED';
    } else if (txResponse.status === 'NOT_FOUND') {
      return {
        success: false,
        network,
        hash: trimmedHash,
        error: 'Transaction not found. It may not exist or has not been confirmed yet.',
      };
    } else {
      status = 'PENDING';
    }

    // Parse transaction envelope
    let sourceAccount: string | undefined;
    let fee: string | undefined;
    let operations: TransactionOperation[] | undefined;
    let operationCount: number | undefined;

    try {
      if (txResponse.envelopeXdr) {
        const envelope = StellarSdk.TransactionBuilder.fromXDR(
          txResponse.envelopeXdr,
          StellarSdk.Networks.TESTNET // Network doesn't matter for parsing
        );

        if (envelope instanceof StellarSdk.Transaction) {
          sourceAccount = envelope.source;
          fee = envelope.fee;
          operationCount = envelope.operations.length;
          operations = envelope.operations.map((op) => parseOperation(op));
        }
      }
    } catch (error) {
      // If parsing fails, continue without operation details
    }

    // Parse events from result meta
    let events: TransactionEvent[] | undefined;
    try {
      if (txResponse.resultMetaXdr) {
        events = parseEvents(txResponse.resultMetaXdr);
      }
    } catch (error) {
      // If parsing fails, continue without events
    }

    // Extract error if failed
    let error: string | undefined;
    if (status === 'FAILED' && txResponse.resultXdr) {
      try {
        // resultXdr is already a string in the response
        error = 'Transaction failed';
      } catch {
        error = 'Transaction failed';
      }
    }

    return {
      success: true,
      network,
      hash: trimmedHash,
      details: {
        hash: trimmedHash,
        status,
        ledger: typeof txResponse.ledger === 'string' ? parseInt(txResponse.ledger, 10) : txResponse.ledger,
        createdAt: txResponse.createdAt ? String(txResponse.createdAt) : undefined,
        sourceAccount,
        fee,
        operationCount,
        operations,
        events,
        resultXdr: typeof txResponse.resultXdr === 'string' ? txResponse.resultXdr : undefined,
        envelopeXdr: typeof txResponse.envelopeXdr === 'string' ? txResponse.envelopeXdr : undefined,
        error,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      network,
      hash: trimmedHash,
      error: error.message || 'Failed to inspect transaction',
    };
  }
}

/**
 * Validate transaction hash format
 */
export function isValidTransactionHash(hash: string): boolean {
  return /^[0-9a-f]{64}$/i.test(hash);
}

/**
 * Parse operation details
 */
function parseOperation(op: StellarSdk.Operation): TransactionOperation {
  const baseOp: TransactionOperation = {
    type: op.type,
  };

  // Add operation-specific details
  switch (op.type) {
    case 'payment':
      return {
        ...baseOp,
        destination: (op as StellarSdk.Operation.Payment).destination,
        asset: (op as StellarSdk.Operation.Payment).asset,
        amount: (op as StellarSdk.Operation.Payment).amount,
      };
    case 'createAccount':
      return {
        ...baseOp,
        destination: (op as StellarSdk.Operation.CreateAccount).destination,
        startingBalance: (op as StellarSdk.Operation.CreateAccount).startingBalance,
      };
    case 'invokeHostFunction':
      return {
        ...baseOp,
        function: 'Soroban Contract Invocation',
      };
    default:
      return baseOp;
  }
}

/**
 * Parse events from result meta XDR
 */
function parseEvents(resultMetaXdr: any): TransactionEvent[] {
  try {
    // resultMetaXdr might already be parsed or a string
    let meta: any;
    if (typeof resultMetaXdr === 'string') {
      meta = StellarSdk.xdr.TransactionMeta.fromXDR(resultMetaXdr, 'base64');
    } else {
      meta = resultMetaXdr;
    }

    const events: TransactionEvent[] = [];

    // Extract events based on meta version
    if (meta.switch && meta.switch() === 3) {
      const v3 = meta.v3();
      if (v3.sorobanMeta && v3.sorobanMeta()) {
        const sorobanMeta = v3.sorobanMeta();
        if (sorobanMeta && sorobanMeta.events && sorobanMeta.events()) {
          const eventList = sorobanMeta.events();
          for (const event of eventList) {
            events.push({
              type: event.type().name,
              contractId: event.contractId && event.contractId() ? StellarSdk.StrKey.encodeContract(event.contractId()!) : undefined,
              topics: event.body().v0().topics().map((t: any) => t.toXDR('base64')),
              value: event.body().v0().data().toXDR('base64'),
            });
          }
        }
      }
    }

    return events;
  } catch (error) {
    return [];
  }
}
