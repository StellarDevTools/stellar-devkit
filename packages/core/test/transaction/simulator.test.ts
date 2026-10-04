import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Account,
  Address,
  Asset,
  Contract,
  Networks,
  Operation,
  SorobanDataBuilder,
  StrKey,
  TransactionBuilder,
  nativeToScVal,
  xdr,
} from '@stellar/stellar-sdk';
import { simulateTransaction } from '../../src/transaction/simulator';
import { createRpcServer } from '@stellar-devkit/stellar';

vi.mock('@stellar-devkit/stellar', async () => ({
  ...(await vi.importActual('@stellar-devkit/stellar')),
  createRpcServer: vi.fn(),
}));
const simulate = vi.fn();
const send = vi.fn();
const address = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 1));
const contractId = StrKey.encodeContract(Buffer.alloc(32, 2));
const envelope = () =>
  new TransactionBuilder(new Account(address, '1'), {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(new Contract(contractId).call('hello'))
    .setTimeout(0)
    .build()
    .toXDR();
const data = () => new SorobanDataBuilder().setResources(1234, 20, 30);

describe('read-only simulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createRpcServer).mockReturnValue({
      simulateTransaction: simulate,
      sendTransaction: send,
    } as never);
  });
  it('returns JSON-safe values, auth, fees and resource usage without submission', async () => {
    simulate.mockResolvedValue({
      _parsed: true,
      latestLedger: 42,
      events: [],
      transactionData: data(),
      minResourceFee: '200',
      result: { auth: [], retval: nativeToScVal(123n, { type: 'i128' }) },
    });
    const result = await simulateTransaction(envelope());
    expect(result).toMatchObject({
      success: true,
      minResourceFee: '200',
      latestLedger: 42,
      resources: { instructions: 1234, readBytes: 20, writeBytes: 30 },
      returnValue: { decoded: '123' },
      auth: [],
      restoreRequired: false,
    });
    expect(() => JSON.stringify(result)).not.toThrow();
    expect(simulate).toHaveBeenCalledOnce();
    expect(send).not.toHaveBeenCalled();
  });
  it('preserves failure diagnostic events and normalizes the error', async () => {
    const event = new xdr.DiagnosticEvent({
      inSuccessfulContractCall: false,
      event: new xdr.ContractEvent({
        ext: new xdr.ExtensionPoint(0),
        contractId: null,
        type: xdr.ContractEventType.diagnostic(),
        body: new xdr.ContractEventBody(
          0,
          new xdr.ContractEventV0({
            topics: [],
            data: nativeToScVal('failure'),
          })
        ),
      }),
    });
    simulate.mockResolvedValue({
      _parsed: true,
      latestLedger: 42,
      error: 'Error(Auth, InvalidAction)',
      events: [event],
    });
    expect(await simulateTransaction(envelope())).toMatchObject({
      success: false,
      diagnostic: { code: 'AUTH_INVALID_ACTION' },
      events: [
        {
          decodedValue: { decoded: 'failure' },
          inSuccessfulContractCall: false,
        },
      ],
    });
  });
  it('reports restoration as a requirement without performing it', async () => {
    simulate.mockResolvedValue({
      _parsed: true,
      latestLedger: 42,
      events: [],
      transactionData: data(),
      minResourceFee: '200',
      result: { auth: [], retval: nativeToScVal(null) },
      restorePreamble: { minResourceFee: '100', transactionData: data() },
    });
    expect(await simulateTransaction(envelope())).toMatchObject({
      success: true,
      restoreRequired: true,
      restorePreamble: { minResourceFee: '100' },
    });
    expect(send).not.toHaveBeenCalled();
  });
  it('reports source-account authorization requirements without signing them', async () => {
    const entry = new xdr.SorobanAuthorizationEntry({
      credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
      rootInvocation: new xdr.SorobanAuthorizedInvocation({
        function:
          xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
            new xdr.InvokeContractArgs({
              contractAddress: Address.fromString(contractId).toScAddress(),
              functionName: 'hello',
              args: [],
            })
          ),
        subInvocations: [],
      }),
    });
    simulate.mockResolvedValue({
      _parsed: true,
      latestLedger: 42,
      events: [],
      transactionData: data(),
      minResourceFee: '200',
      result: { auth: [entry], retval: nativeToScVal(null) },
    });
    expect(await simulateTransaction(envelope())).toMatchObject({
      success: true,
      auth: [
        {
          credentials: 'sorobanCredentialsSourceAccount',
          xdr: entry.toXDR('base64'),
        },
      ],
    });
    expect(send).not.toHaveBeenCalled();
  });
  it('rejects classic operations before making RPC requests', async () => {
    const payment = new TransactionBuilder(new Account(address, '1'), {
      fee: '100',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: address,
          asset: Asset.native(),
          amount: '1',
        })
      )
      .setTimeout(0)
      .build();
    expect(await simulateTransaction(payment.toXDR())).toMatchObject({
      success: false,
    });
    expect(simulate).not.toHaveBeenCalled();
  });
  it.each(['', 'garbage', 'A'.repeat(1_000_001)])(
    'rejects malformed/oversized input before RPC (%#)',
    async (value) => {
      expect((await simulateTransaction(value)).success).toBe(false);
      expect(simulate).not.toHaveBeenCalled();
    }
  );
  it('rejects a custom network without its passphrase', async () => {
    expect(
      await simulateTransaction(envelope(), {
        network: 'custom',
        customRpcUrl: 'https://example.com',
      })
    ).toMatchObject({ success: false });
    expect(simulate).not.toHaveBeenCalled();
  });
  it('reports a transport failure with safe context', async () => {
    simulate.mockRejectedValue(
      new Error('timeout https://example.com?token=sensitive')
    );
    const result = await simulateTransaction(envelope());
    expect(result).toMatchObject({
      success: false,
      diagnostic: { code: 'RPC_TIMEOUT' },
    });
    expect(JSON.stringify(result)).not.toContain('sensitive');
  });
});
