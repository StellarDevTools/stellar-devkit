import {
  createRpcServer,
  withRpcTimeout,
  decodeScVal,
  safeErrorContext,
} from '@stellar-devkit/stellar';
import { isValidContractId } from '../contract/inspector';
import type { EventViewerOptions, EventViewerResult } from './types';

export async function queryEvents(
  options: EventViewerOptions = {}
): Promise<EventViewerResult> {
  const network = options.network || 'testnet';
  try {
    if (
      options.cursor !== undefined &&
      (!options.cursor.trim() || options.cursor.length > 1024)
    )
      throw new Error('Invalid event cursor.');
    if (options.cursor !== undefined && options.startLedger !== undefined)
      throw new Error('Use cursor or startLedger, not both.');
    if (
      options.startLedger !== undefined &&
      (!Number.isSafeInteger(options.startLedger) || options.startLedger < 1)
    )
      throw new Error('startLedger must be a positive integer.');
    const limit = options.limit ?? 10;
    if (!Number.isInteger(limit) || limit < 1 || limit > 10000)
      throw new Error('limit must be an integer between 1 and 10000.');
    if (
      options.contractIds &&
      (options.contractIds.length > 5 ||
        options.contractIds.some((id) => !isValidContractId(id)))
    )
      throw new Error('Provide at most five valid contract IDs.');
    if (
      options.eventType &&
      !['contract', 'system', 'diagnostic'].includes(options.eventType)
    )
      throw new Error('Invalid event type.');
    const server = createRpcServer(network, options.customRpcUrl);
    // A first page needs a ledger boundary. Default to the latest closed ledger.
    const startLedger = options.cursor
      ? undefined
      : (options.startLedger ??
        (await withRpcTimeout(server.getLatestLedger())).sequence);
    const response = await withRpcTimeout(
      server.getEvents({
        filters: [
          {
            type: options.eventType || 'contract',
            contractIds: options.contractIds?.length
              ? options.contractIds
              : undefined,
          },
        ],
        limit,
        startLedger,
        cursor: options.cursor,
      })
    );
    return {
      success: true,
      network,
      latestLedger: response.latestLedger,
      cursor: response.cursor,
      events: response.events.map((event) => ({
        type: event.type,
        ledger: event.ledger,
        contractId: event.contractId?.contractId(),
        id: event.id,
        pagingToken: event.pagingToken,
        topics: event.topic.map((value) => value.toXDR('base64')),
        value: event.value.toXDR('base64'),
        decodedTopics: event.topic.map(decodeScVal),
        decodedValue: decodeScVal(event.value),
      })),
    };
  } catch (error) {
    return {
      success: false,
      network,
      events: [],
      error: safeErrorContext(
        error instanceof Error ? error.message : 'Failed to query events'
      ),
    };
  }
}
