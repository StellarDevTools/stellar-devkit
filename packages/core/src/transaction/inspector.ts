import * as StellarSdk from '@stellar/stellar-sdk';
import {
  createRpcServer,
  withRpcTimeout,
  decodeContractEvent,
  decodeScVal,
  explainError,
  jsonSafe,
  safeErrorContext,
} from '@stellar-devkit/stellar';
import type {
  TransactionInspectOptions,
  TransactionInspectResult,
  TransactionEvent,
  TransactionOperation,
} from './types';

export async function inspectTransaction(
  hash: string,
  options: TransactionInspectOptions = {}
): Promise<TransactionInspectResult> {
  const network = options.network || 'testnet';
  const trimmedHash = hash.trim();
  if (!isValidTransactionHash(trimmedHash))
    return {
      success: false,
      network,
      hash: trimmedHash,
      error:
        'Invalid transaction hash format. Expected 64-character hex string.',
    };
  try {
    const response = await withRpcTimeout(
      createRpcServer(network, options.customRpcUrl).getTransaction(trimmedHash)
    );
    if (response.status === StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND) {
      return {
        success: false,
        network,
        hash: trimmedHash,
        error:
          'Transaction not found in this endpoint retention window. Verify the network and hash; absence does not prove the transaction never existed.',
      };
    }
    const warnings: string[] = [];
    const envelope = StellarSdk.TransactionBuilder.fromXDR(
      response.envelopeXdr,
      StellarSdk.Networks.TESTNET
    );
    const tx =
      envelope instanceof StellarSdk.FeeBumpTransaction
        ? envelope.innerTransaction
        : envelope;
    const resultCode = response.resultXdr.result().switch().name;
    let operationResultCodes: string[] = [];
    if (['txSuccess', 'txFailed'].includes(resultCode)) {
      operationResultCodes = response.resultXdr
        .result()
        .results()
        .map((result) => {
          if (result.switch().name !== 'opInner') return result.switch().name;
          const inner = result.tr().value() as { switch(): { name: string } };
          return inner.switch().name;
        });
    }
    let events: TransactionEvent[] = [];
    const meta = response.resultMetaXdr;
    if (meta.switch() === 3)
      events = meta.v3().sorobanMeta()?.events().map(decodeContractEvent) || [];
    else
      warnings.push(
        `Transaction metadata v${meta.switch()} event decoding is not supported; raw XDR is preserved.`
      );
    const diagnosticEvents = response.diagnosticEventsXdr?.map((event) => ({
      ...decodeContractEvent(event.event()),
      inSuccessfulContractCall: event.inSuccessfulContractCall(),
    }));
    return {
      success: true,
      network,
      hash: trimmedHash,
      details: {
        hash: trimmedHash,
        status: response.status,
        ledger: response.ledger,
        createdAt: String(response.createdAt),
        feeBump: response.feeBump,
        sourceAccount: tx.source,
        fee: envelope.fee,
        sequence: tx.sequence,
        operationCount: tx.operations.length,
        operations: tx.operations.map(parseOperation),
        resultCode,
        operationResultCodes,
        events,
        diagnosticEvents,
        warnings,
        returnValue:
          response.status === StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS &&
          response.returnValue
            ? decodeScVal(response.returnValue)
            : undefined,
        resultXdr: response.resultXdr.toXDR('base64'),
        envelopeXdr: response.envelopeXdr.toXDR('base64'),
        resultMetaXdr: meta.toXDR('base64'),
        error: response.status === 'FAILED' ? resultCode : undefined,
        diagnostic:
          response.status === 'FAILED' ? explainError(resultCode) : undefined,
      },
    };
  } catch (error) {
    return {
      success: false,
      network,
      hash: trimmedHash,
      error: safeErrorContext(
        error instanceof Error ? error.message : 'Failed to inspect transaction'
      ),
    };
  }
}

export function isValidTransactionHash(hash: string): boolean {
  return /^[0-9a-f]{64}$/i.test(hash);
}

function parseOperation(op: StellarSdk.Operation): TransactionOperation {
  if (op.type === 'invokeHostFunction') {
    const func = op.func;
    const invocation =
      func.switch().name === 'hostFunctionTypeInvokeContract'
        ? func.invokeContract()
        : undefined;
    return {
      type: op.type,
      source: op.source,
      function: func.switch().name,
      contractId: invocation
        ? StellarSdk.Address.fromScAddress(
            invocation.contractAddress()
          ).toString()
        : undefined,
      functionName: invocation?.functionName().toString(),
      args: invocation?.args().map(decodeScVal),
      authCount: op.auth?.length || 0,
    };
  }
  return jsonSafe(op) as TransactionOperation;
}
