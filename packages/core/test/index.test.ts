import { describe, it, expect } from 'vitest';
import { version } from '../src/index';

describe('@stellar-devkit/core', () => {
  it('should export version', () => {
    expect(version).toBe('0.0.1');
  });

  it('should be a valid semver version', () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
