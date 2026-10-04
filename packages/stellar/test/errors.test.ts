import { describe, expect, it } from 'vitest';
import { explainError, ERROR_REGISTRY } from '../src/errors';
describe('Stellar error explanations', () => {
  it.each([
    ['Error(Storage, ExceededLimit)', 'STORAGE_LIMIT'],
    ['restorePreamble', 'STORAGE_ARCHIVED'],
    ['Error(Budget, ExceededLimit)', 'BUDGET_RESOURCE_LIMIT'],
    ['Error(Auth, InvalidAction)', 'AUTH_INVALID_ACTION'],
    ['Error(Context, InvalidAction)', 'CONTEXT_INVALID_ACTION'],
    ['Error(Value, UnexpectedType)', 'VALUE_TYPE_MISMATCH'],
    ['Error(Contract, #17)', 'CONTRACT_ERROR'],
    ['txBadAuth', 'TX_BAD_AUTH'],
    ['tx_bad_auth', 'TX_BAD_AUTH'],
    ['txBadSeq', 'TX_BAD_SEQUENCE'],
    ['txInsufficientFee', 'TX_INSUFFICIENT_FEE'],
    ['txFailed', 'TX_FAILED'],
    ['invalid params', 'RPC_INVALID_PARAMS'],
    ['-32602', 'RPC_INVALID_PARAMS'],
    ['HTTP 429', 'RPC_RATE_LIMIT'],
    ['Request timeout', 'RPC_TIMEOUT'],
    ['Error(Storage, MissingValue)', 'STORAGE_MISSING_VALUE'],
    ['Budget exceeded', 'BUDGET_EXCEEDED'],
    ['WasmVm error', 'WASM_VM_ERROR'],
    ['Auth failed', 'AUTH_FAILED'],
    ['Invalid action', 'INVALID_ACTION'],
  ])('explains %s', (message, code) => {
    const result = explainError(message);
    expect(result).toMatchObject({ recognized: true, code, context: message });
    expect(result.diagnostic?.recommendations.length).toBeGreaterThan(0);
    expect(result.diagnostic?.causes.length).toBeGreaterThan(0);
  });
  it('does not invent the meaning of contract-specific numbers', () => {
    expect(explainError('Error(Contract, #1)').message).toContain(
      'contract-specific'
    );
  });
  it('preserves unknown safe context and redacts credentials', () => {
    expect(explainError('unmapped')).toMatchObject({
      recognized: false,
      code: 'UNKNOWN_ERROR',
      context: 'unmapped',
    });
    const context = explainError(
      `token=private https://rpc.example/?key=private S${'A'.repeat(55)}`
    ).context;
    expect(context).not.toContain('private');
    expect(context).not.toContain('S' + 'A'.repeat(55));
  });
  it('has unique diagnostic codes', () =>
    expect(new Set(ERROR_REGISTRY.map((d) => d.code)).size).toBe(
      ERROR_REGISTRY.length
    ));
});
