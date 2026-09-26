/**
 * Tests for RPC Health Checker
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRPCHealth, getDefaultEndpoint, isValidEndpoint } from '../../src/network/rpc-health';
import * as StellarSdk from '@stellar/stellar-sdk';

// Mock the Stellar SDK
vi.mock('@stellar/stellar-sdk', async () => {
  const actual = await vi.importActual('@stellar/stellar-sdk');
  return {
    ...actual,
    rpc: {
      Server: vi.fn(),
    },
  };
});

describe('RPC Health Checker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDefaultEndpoint', () => {
    it('should return testnet endpoint', () => {
      const endpoint = getDefaultEndpoint('testnet');
      expect(endpoint).toBe('https://soroban-testnet.stellar.org');
    });

    it('should return futurenet endpoint', () => {
      const endpoint = getDefaultEndpoint('futurenet');
      expect(endpoint).toBe('https://rpc-futurenet.stellar.org');
    });

    it('should return null for mainnet', () => {
      const endpoint = getDefaultEndpoint('mainnet');
      expect(endpoint).toBeNull();
    });

    it('should return null for unknown network', () => {
      const endpoint = getDefaultEndpoint('unknown' as any);
      expect(endpoint).toBeNull();
    });
  });

  describe('isValidEndpoint', () => {
    it('should validate https URLs', () => {
      expect(isValidEndpoint('https://example.com')).toBe(true);
      expect(isValidEndpoint('https://rpc.example.com:8080')).toBe(true);
    });

    it('should validate http URLs', () => {
      expect(isValidEndpoint('http://localhost:8000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidEndpoint('not a url')).toBe(false);
      expect(isValidEndpoint('')).toBe(false);
      expect(isValidEndpoint('ftp://example.com')).toBe(false);
    });
  });

  describe('checkRPCHealth', () => {
    it('should require custom endpoint for mainnet', async () => {
      const result = await checkRPCHealth({ network: 'mainnet' });

      expect(result.success).toBe(false);
      expect(result.network).toBe('mainnet');
      expect(result.status).toBe('unreachable');
      expect(result.error).toContain('custom RPC endpoint');
    });

    it('should handle unknown network', async () => {
      const result = await checkRPCHealth({ network: 'invalid' as any });

      expect(result.success).toBe(false);
      expect(result.status).toBe('unreachable');
      expect(result.error).toContain('Unknown network');
    });

    it('should report healthy RPC with ledger info', async () => {
      // Mock successful RPC response
      const mockServer = {
        getHealth: vi.fn().mockResolvedValue({ status: 'healthy' }),
        getLatestLedger: vi.fn().mockResolvedValue({
          sequence: 12345,
          protocolVersion: 20,
        }),
      };

      (StellarSdk.rpc.Server as any).mockImplementation(() => mockServer);

      const result = await checkRPCHealth({ network: 'testnet' });

      expect(result.success).toBe(true);
      expect(result.status).toBe('healthy');
      expect(result.endpoint).toBe('https://soroban-testnet.stellar.org');
      expect(result.network).toBe('testnet');
      expect(result.ledgerInfo).toEqual({
        sequence: 12345,
        protocolVersion: 20,
      });
      expect(result.latencyMs).toBeGreaterThan(0);
    });

    it('should handle degraded RPC status', async () => {
      const mockServer = {
        getHealth: vi.fn().mockResolvedValue({ status: 'degraded' }),
        getLatestLedger: vi.fn(),
      };

      (StellarSdk.rpc.Server as any).mockImplementation(() => mockServer);

      const result = await checkRPCHealth({ network: 'testnet' });

      expect(result.success).toBe(true);
      expect(result.status).toBe('degraded');
    });

    it('should fallback to getLatestLedger if getHealth fails', async () => {
      const mockServer = {
        getHealth: vi.fn().mockRejectedValue(new Error('Health endpoint not available')),
        getLatestLedger: vi.fn().mockResolvedValue({
          sequence: 12345,
          protocolVersion: 20,
        }),
      };

      (StellarSdk.rpc.Server as any).mockImplementation(() => mockServer);

      const result = await checkRPCHealth({ network: 'testnet' });

      expect(result.success).toBe(true);
      expect(result.status).toBe('healthy');
      expect(result.ledgerInfo).toBeDefined();
    });

    it('should handle unreachable RPC', async () => {
      const mockServer = {
        getHealth: vi.fn().mockRejectedValue(new Error('Network error')),
        getLatestLedger: vi.fn().mockRejectedValue(new Error('Network error')),
      };

      (StellarSdk.rpc.Server as any).mockImplementation(() => mockServer);

      const result = await checkRPCHealth({ network: 'testnet' });

      expect(result.success).toBe(false);
      expect(result.status).toBe('unreachable');
      expect(result.error).toBeDefined();
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should handle timeout', async () => {
      const mockServer = {
        getHealth: vi.fn().mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 5000))
        ),
        getLatestLedger: vi.fn(),
      };

      (StellarSdk.rpc.Server as any).mockImplementation(() => mockServer);

      const result = await checkRPCHealth({ network: 'testnet', timeout: 100 });

      expect(result.success).toBe(false);
      expect(result.status).toBe('unreachable');
      expect(result.error).toContain('timeout');
    });

    it('should use custom endpoint when provided', async () => {
      const mockServer = {
        getHealth: vi.fn().mockResolvedValue({ status: 'healthy' }),
        getLatestLedger: vi.fn().mockResolvedValue({
          sequence: 99999,
          protocolVersion: 20,
        }),
      };

      (StellarSdk.rpc.Server as any).mockImplementation(() => mockServer);

      const customEndpoint = 'https://custom-rpc.example.com';
      const result = await checkRPCHealth({
        network: 'mainnet',
        customEndpoint,
      });

      expect(result.success).toBe(true);
      expect(result.endpoint).toBe(customEndpoint);
      expect(result.network).toBe('mainnet');
    });
  });
});
