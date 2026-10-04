import { Transaction, TransactionBuilder, rpc } from '@stellar/stellar-sdk';
import {
  createRpcServer,
  withRpcTimeout,
  networkPassphrase,
  decodeScVal,
  decodeContractEvent,
  explainError,
  type Network,
} from '@stellar-devkit/stellar';

export interface SimulationOptions {
  network?: Network;
  customRpcUrl?: string;
  networkPassphrase?: string;
}

/** Executes only simulateTransaction. Never prepares, signs or sends a transaction. */
export async function simulateTransaction(
  envelopeXdr: string,
  options: SimulationOptions = {}
) {
  const network = options.network || 'testnet';
  try {
    if (
      typeof envelopeXdr !== 'string' ||
      envelopeXdr.length > 1_000_000 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
        envelopeXdr.trim()
      ) ||
      !envelopeXdr.trim()
    ) {
      throw new Error('Expected a base64 transaction envelope under 1 MB.');
    }
    const transaction = TransactionBuilder.fromXDR(
      envelopeXdr.trim(),
      networkPassphrase(network, options.networkPassphrase)
    );
    if (
      !(transaction instanceof Transaction) ||
      transaction.operations.length !== 1 ||
      transaction.operations[0]?.type !== 'invokeHostFunction'
    ) {
      throw new Error(
        'Simulation requires a regular transaction with exactly one invokeHostFunction operation.'
      );
    }
    const server = createRpcServer(network, options.customRpcUrl);
    const response = await withRpcTimeout(
      server.simulateTransaction(transaction)
    );
    const events = response.events.map((event) => ({
      ...decodeContractEvent(event.event()),
      inSuccessfulContractCall: event.inSuccessfulContractCall(),
    }));
    if (rpc.Api.isSimulationError(response)) {
      const diagnostic = explainError(response.error);
      return {
        success: false as const,
        network,
        latestLedger: response.latestLedger,
        events,
        error: diagnostic.context,
        diagnostic,
      };
    }
    const data = response.transactionData.build();
    const resources = data.resources();
    return {
      success: true as const,
      network,
      latestLedger: response.latestLedger,
      minResourceFee: response.minResourceFee,
      resources: {
        instructions: resources.instructions(),
        readBytes: resources.readBytes(),
        writeBytes: resources.writeBytes(),
        readOnlyEntries: resources.footprint().readOnly().length,
        readWriteEntries: resources.footprint().readWrite().length,
      },
      transactionDataXdr: data.toXDR('base64'),
      auth:
        response.result?.auth.map((entry) => ({
          credentials: entry.credentials().switch().name,
          invocationXdr: entry.rootInvocation().toXDR('base64'),
          xdr: entry.toXDR('base64'),
        })) || [],
      returnValue: response.result
        ? decodeScVal(response.result.retval)
        : undefined,
      events,
      restoreRequired: rpc.Api.isSimulationRestore(response),
      restorePreamble: rpc.Api.isSimulationRestore(response)
        ? {
            minResourceFee: response.restorePreamble.minResourceFee,
            transactionDataXdr: response.restorePreamble.transactionData
              .build()
              .toXDR('base64'),
          }
        : undefined,
    };
  } catch (error) {
    const diagnostic = explainError(
      error instanceof Error ? error.message : 'Simulation failed'
    );
    return {
      success: false as const,
      network,
      error: diagnostic.context,
      diagnostic,
      events: [],
    };
  }
}
