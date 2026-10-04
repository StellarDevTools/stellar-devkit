import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as core from '@stellar-devkit/core';
import * as diagnostics from '@stellar-devkit/diagnostics';
import { callTool, toolDefinitions } from '../src/tools';
vi.mock('@stellar-devkit/core', () =>
  Object.fromEntries(
    [
      'decodeXDR',
      'checkRPCHealth',
      'inspectAccount',
      'inspectContract',
      'inspectTransaction',
      'queryEvents',
      'simulateTransaction',
    ].map((name) => [name, vi.fn().mockResolvedValue({ success: true })])
  )
);
vi.mock('@stellar-devkit/diagnostics', async () => ({
  ...(await vi.importActual('@stellar-devkit/diagnostics')),
  diagnoseProject: vi.fn().mockResolvedValue({ success: true }),
}));
beforeEach(() => vi.clearAllMocks());
describe('MCP validation and dispatch', () => {
  it.each([
    ['stellar_decode_xdr', { xdr: 'AAAA' }],
    ['stellar_check_rpc', {}],
    ['stellar_get_account', { publicKey: 'G...' }],
    ['stellar_inspect_contract', { contractId: 'C...' }],
    ['stellar_get_transaction', { hash: 'abcd' }],
    ['stellar_query_events', { startLedger: 10 }],
    ['stellar_explain_error', { error: 'txBadAuth' }],
    ['stellar_diagnose_project', { path: '.' }],
    ['stellar_simulate_transaction', { xdr: 'AAAA' }],
  ])('dispatches %s', async (name, args) => {
    expect((await callTool(name, args)).isError).toBe(false);
  });
  it.each([
    undefined,
    {},
    { xdr: 42 },
    { xdr: 'AAAA', network: 'bogus' },
    { xdr: 'AAAA', secret: 'hidden' },
  ])('rejects invalid input without executing a tool (%#)', async (args) => {
    const result = await callTool('stellar_decode_xdr', args);
    expect(result.isError).toBe(true);
    expect(core.decodeXDR).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain('hidden');
  });
  it('marks core failures as MCP tool errors', async () => {
    vi.mocked(core.inspectAccount).mockResolvedValueOnce({
      success: false,
      error: 'Invalid account',
    } as never);
    expect(
      (await callTool('stellar_get_account', { publicKey: 'bad' })).isError
    ).toBe(true);
  });
  it('rejects unknown tools', async () =>
    expect((await callTool('sign_transaction', {})).isError).toBe(true));
  it('runs Doctor without tool execution', async () => {
    await callTool('stellar_diagnose_project', {});
    expect(diagnostics.diagnoseProject).toHaveBeenCalledWith('.', {
      checkTools: false,
    });
  });
  it('lists only documented tools and rejects additional properties', () => {
    expect(toolDefinitions).toHaveLength(9);
    expect(
      toolDefinitions.every(
        (tool) => tool.inputSchema.additionalProperties === false
      )
    ).toBe(true);
  });
});
