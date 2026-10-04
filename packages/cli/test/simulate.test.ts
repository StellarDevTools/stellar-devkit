import { afterEach, expect, it, vi } from 'vitest';
import { simulateTransaction } from '@stellar-devkit/core';
import { createSimulateCommand } from '../src/commands/simulate';
vi.mock('@stellar-devkit/core', () => ({ simulateTransaction: vi.fn() }));
afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = 0;
});
it('passes endpoint and custom passphrase and emits only JSON in JSON mode', async () => {
  vi.mocked(simulateTransaction).mockResolvedValue({
    success: true,
    network: 'custom',
    auth: [],
    events: [],
  } as never);
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  await createSimulateCommand().parseAsync(
    [
      'AAAA',
      '--network',
      'custom',
      '--rpc-url',
      'http://localhost:8000',
      '--network-passphrase',
      'Local',
      '--json',
    ],
    { from: 'user' }
  );
  expect(simulateTransaction).toHaveBeenCalledWith('AAAA', {
    network: 'custom',
    customRpcUrl: 'http://localhost:8000',
    networkPassphrase: 'Local',
  });
  expect(log).toHaveBeenCalledOnce();
  expect(JSON.parse(log.mock.calls[0]![0])).toMatchObject({ success: true });
  expect(process.exitCode).toBe(0);
});
it('uses a nonzero exit status for simulation failures', async () => {
  vi.mocked(simulateTransaction).mockResolvedValue({
    success: false,
    network: 'testnet',
    error: 'invalid',
    events: [],
  } as never);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  await createSimulateCommand().parseAsync(['bad', '--json'], { from: 'user' });
  expect(process.exitCode).toBe(1);
});
