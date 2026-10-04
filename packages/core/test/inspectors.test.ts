import { beforeEach, expect, it, vi } from 'vitest';
import {
  Account,
  Contract,
  Networks,
  Operation,
  StrKey,
  TransactionBuilder,
  hash,
  nativeToScVal,
  xdr,
} from '@stellar/stellar-sdk';
import { createRpcServer } from '@stellar-devkit/stellar';
import { inspectContract } from '../src/contract';
import { queryEvents } from '../src/events';
import { inspectTransaction } from '../src/transaction';
vi.mock('@stellar-devkit/stellar', async () => ({
  ...(await vi.importActual('@stellar-devkit/stellar')),
  createRpcServer: vi.fn(),
}));
const server = {
  getContractWasmByContractId: vi.fn(),
  getContractData: vi.fn(),
  getEvents: vi.fn(),
  getLatestLedger: vi.fn(),
  getTransaction: vi.fn(),
};
const id = StrKey.encodeContract(Buffer.alloc(32, 2));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createRpcServer).mockReturnValue(server as never);
});
it('computes a SHA-256 WASM hash and reports modification/TTL ledgers', async () => {
  const wasm = Buffer.from('0061736d01000000', 'hex');
  server.getContractWasmByContractId.mockResolvedValue(wasm);
  server.getContractData.mockResolvedValue({
    lastModifiedLedgerSeq: 10,
    liveUntilLedgerSeq: 100,
  });
  expect(await inspectContract(id)).toMatchObject({
    success: true,
    details: {
      wasmInfo: { hash: hash(wasm).toString('hex'), size: 8 },
      lastModifiedLedger: 10,
      liveUntilLedger: 100,
    },
  });
});
it('rejects invalid contract IDs without RPC', async () => {
  expect((await inspectContract('CINVALID')).success).toBe(false);
  expect(createRpcServer).not.toHaveBeenCalled();
});
it('preserves typed SDK events, large integers and the server cursor', async () => {
  server.getEvents.mockResolvedValue({
    latestLedger: 20,
    cursor: 'next',
    events: [
      {
        type: 'contract',
        ledger: 19,
        id: 'one',
        pagingToken: 'item',
        contractId: new Contract(id),
        topic: [nativeToScVal('transfer')],
        value: nativeToScVal(9007199254740993n, { type: 'i128' }),
      },
    ],
  });
  const result = await queryEvents({ startLedger: 15, contractIds: [id] });
  expect(result).toMatchObject({
    success: true,
    cursor: 'next',
    events: [{ contractId: id, decodedValue: { decoded: '9007199254740993' } }],
  });
  expect(result.events[0]?.value).toBe(
    nativeToScVal(9007199254740993n, { type: 'i128' }).toXDR('base64')
  );
  expect(() => JSON.stringify(result)).not.toThrow();
});
it('supports empty continuation pages without losing the cursor', async () => {
  server.getEvents.mockResolvedValue({
    latestLedger: 20,
    cursor: 'after-empty',
    events: [],
  });
  expect(await queryEvents({ cursor: 'before' })).toMatchObject({
    success: true,
    cursor: 'after-empty',
  });
  expect(server.getLatestLedger).not.toHaveBeenCalled();
  expect(server.getEvents).toHaveBeenCalledWith(
    expect.objectContaining({ cursor: 'before', startLedger: undefined })
  );
});
it('defaults a first page to the latest ledger', async () => {
  server.getLatestLedger.mockResolvedValue({ sequence: 42 });
  server.getEvents.mockResolvedValue({
    events: [],
    latestLedger: 42,
    cursor: 'end',
  });
  await queryEvents();
  expect(server.getEvents).toHaveBeenCalledWith(
    expect.objectContaining({ startLedger: 42 })
  );
});
it.each([
  { limit: 0 },
  { limit: NaN },
  { startLedger: -1 },
  { startLedger: 1, cursor: 'c' },
  { contractIds: ['invalid'] },
])('validates event filters before network IO (%#)', async (options) => {
  expect((await queryEvents(options)).success).toBe(false);
  expect(createRpcServer).not.toHaveBeenCalled();
});
it('extracts parsed transaction XDR, sequence, operation codes and failure explanation', async () => {
  const publicKey = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 1));
  const tx = new TransactionBuilder(new Account(publicKey, '10'), {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: publicKey,
        asset: (await import('@stellar/stellar-sdk')).Asset.native(),
        amount: '1',
      })
    )
    .setTimeout(0)
    .build();
  const resultXdr = new xdr.TransactionResult({
    feeCharged: xdr.Int64.fromString('100'),
    result: xdr.TransactionResultResult.txFailed([
      xdr.OperationResult.opInner(
        xdr.OperationResultTr.payment(xdr.PaymentResult.paymentUnderfunded())
      ),
    ]),
    ext: new xdr.TransactionResultExt(0),
  });
  server.getTransaction.mockResolvedValue({
    status: 'FAILED',
    ledger: 42,
    createdAt: 123,
    feeBump: false,
    envelopeXdr: tx.toEnvelope(),
    resultXdr,
    resultMetaXdr: new xdr.TransactionMeta(0, []),
  });
  const result = await inspectTransaction('ab'.repeat(32));
  expect(result).toMatchObject({
    success: true,
    details: {
      status: 'FAILED',
      sequence: '11',
      resultCode: 'txFailed',
      operationResultCodes: ['paymentUnderfunded'],
      diagnostic: { code: 'TX_FAILED' },
      envelopeXdr: tx.toXDR(),
    },
  });
  expect(result.details?.warnings?.[0]).toContain('not supported');
});
it('describes retention limits for missing transactions', async () => {
  server.getTransaction.mockResolvedValue({ status: 'NOT_FOUND' });
  expect((await inspectTransaction('ab'.repeat(32))).error).toContain(
    'retention'
  );
});
