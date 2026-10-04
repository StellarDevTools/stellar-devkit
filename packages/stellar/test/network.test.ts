import { expect, it, vi } from 'vitest';
import {
  networkPassphrase,
  resolveRpcUrl,
  validateEndpoint,
  withRpcTimeout,
} from '../src/index';
it.each([
  'file:///etc/passwd',
  'https://user:password@rpc.example',
  'https://rpc.example/#fragment',
  'not a URL',
])('rejects unsafe endpoint %s', (url) =>
  expect(() => validateEndpoint(url)).toThrow()
);
it('requires explicit endpoints for custom and mainnet', () => {
  expect(() => resolveRpcUrl('mainnet')).toThrow();
  expect(() => resolveRpcUrl('custom')).toThrow();
});
it('accepts configured read-only local RPC', () =>
  expect(resolveRpcUrl('custom', 'http://localhost:8000')).toBe(
    'http://localhost:8000'
  ));
it('requires custom network passphrase', () => {
  expect(() => networkPassphrase('custom')).toThrow();
  expect(networkPassphrase('custom', 'Local network')).toBe('Local network');
});
it('bounds RPC waiting and clears timeout timers on success and failure', async () => {
  vi.useFakeTimers();
  try {
    expect(await withRpcTimeout(Promise.resolve(42))).toBe(42);
    expect(vi.getTimerCount()).toBe(0);
    const pending = withRpcTimeout(new Promise<never>(() => {}), 50);
    const assertion = expect(pending).rejects.toThrow('timeout');
    await vi.advanceTimersByTimeAsync(50);
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
