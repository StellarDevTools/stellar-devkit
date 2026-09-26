import { describe, it, expect } from 'vitest';
import { version } from '../src/index';

describe('@stellar-devkit/diagnostics', () => {
  it('should export version', () => {
    expect(version).toBe('0.1.0');
  });

  it('should be a valid semver version', () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
