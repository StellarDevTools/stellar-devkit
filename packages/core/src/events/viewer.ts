/**
 * Contract Event Viewer
 *
 * Query contract events using RPC
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import type {
  EventViewerOptions,
  EventViewerResult,
  ContractEvent,
} from './types';

const DEFAULT_RPC_URLS = {
  testnet: 'https://soroban-testnet.stellar.org',
  futurenet: 'https://rpc-futurenet.stellar.org',
};

/**
 * Query contract events
 */
export async function queryEvents(
  options: EventViewerOptions = {}
): Promise<EventViewerResult> {
  const network = options.network || 'testnet';

  // Determine RPC URL
  let rpcUrl: string;
  if (options.customRpcUrl) {
    rpcUrl = options.customRpcUrl;
  } else if (network === 'mainnet') {
    return {
      success: false,
      network: 'mainnet',
      events: [],
      error: 'Mainnet requires a custom RPC endpoint. Use --rpc-url <url> or set customRpcUrl option.',
    };
  } else if (network in DEFAULT_RPC_URLS) {
    rpcUrl = DEFAULT_RPC_URLS[network as keyof typeof DEFAULT_RPC_URLS];
  } else {
    return {
      success: false,
      network,
      events: [],
      error: `No RPC URL available for network: ${network}`,
    };
  }

  try {
    // Create RPC server instance
    const server = new StellarSdk.rpc.Server(rpcUrl, {
      allowHttp: rpcUrl.startsWith('http://'),
    });

    // Build event request
    const request: any = {
      filters: [],
      limit: options.limit || 10,
    };

    if (options.startLedger) {
      request.startLedger = options.startLedger;
    }

    // Add contract ID filters if provided
    if (options.contractIds && options.contractIds.length > 0) {
      request.filters.push({
        type: 'contract',
        contractIds: options.contractIds,
      });
    } else {
      // Query all events if no filters provided
      request.filters.push({
        type: 'contract',
      });
    }

    // Fetch events
    const response = await server.getEvents(request);

    // Parse events
    const events: ContractEvent[] = response.events.map((event: any) => ({
      type: event.type,
      ledger: event.ledger,
      contractId: event.contractId,
      id: event.id,
      pagingToken: event.pagingToken,
      topics: event.topic || [],
      value: event.value?.xdr || '',
    }));

    return {
      success: true,
      network,
      events,
      latestLedger: response.latestLedger,
      cursor: events.length > 0 && events[events.length - 1] ? events[events.length - 1]!.pagingToken : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      network,
      events: [],
      error: error.message || 'Failed to query events',
    };
  }
}
