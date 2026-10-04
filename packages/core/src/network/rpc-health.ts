/**
 * RPC Health Checker
 *
 * Check Stellar RPC endpoint health and connectivity
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { validateEndpoint, safeErrorContext } from '@stellar-devkit/stellar';
import type {
  RPCHealthResult,
  HealthCheckOptions,
  NetworkType,
  HealthStatus,
} from './types';

const DEFAULT_ENDPOINTS = {
  testnet: 'https://soroban-testnet.stellar.org',
  futurenet: 'https://rpc-futurenet.stellar.org',
  // Note: No public mainnet RPC from SDF - users must provide custom endpoint
};

const DEFAULT_TIMEOUT = 10000; // 10 seconds

/**
 * Check RPC endpoint health
 */
export async function checkRPCHealth(
  options: HealthCheckOptions = {}
): Promise<RPCHealthResult> {
  const startTime = Date.now();
  const network = options.network || 'testnet';

  // Determine endpoint
  let endpoint: string;
  if (options.customEndpoint) {
    endpoint = options.customEndpoint;
  } else if (network === 'mainnet') {
    return {
      success: false,
      endpoint: 'N/A',
      network: 'mainnet',
      status: 'unreachable',
      error:
        'Mainnet requires a custom RPC endpoint. Use --endpoint <url> or set customEndpoint option.',
      timestamp: startTime,
    };
  } else if (network in DEFAULT_ENDPOINTS) {
    endpoint = DEFAULT_ENDPOINTS[network as keyof typeof DEFAULT_ENDPOINTS];
  } else {
    return {
      success: false,
      endpoint: 'N/A',
      network,
      status: 'unreachable',
      error: `Unknown network: ${network}`,
      timestamp: startTime,
    };
  }

  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    validateEndpoint(endpoint);
    if (!Number.isFinite(timeout) || timeout <= 0)
      throw new Error('Timeout must be positive.');
    // Create RPC server instance
    const server = new StellarSdk.rpc.Server(endpoint, {
      allowHttp: endpoint.startsWith('http://'),
    });

    // Perform health check with timeout
    const healthCheckPromise = performHealthCheck(server);
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    const result = await Promise.race([healthCheckPromise, timeoutPromise]);

    const latencyMs = Date.now() - startTime;

    return {
      success: true,
      endpoint,
      network,
      status: result.status,
      latencyMs,
      ledgerInfo: result.ledgerInfo,
      timestamp: startTime,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    return {
      success: false,
      endpoint,
      network,
      status: 'unreachable',
      latencyMs,
      error: safeErrorContext(
        error instanceof Error ? error.message : 'Unknown error'
      ),
      timestamp: startTime,
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Perform actual health check against RPC server
 */
async function performHealthCheck(server: StellarSdk.rpc.Server): Promise<{
  status: HealthStatus;
  ledgerInfo?: {
    sequence: number | string;
    protocolVersion: number | string;
    timestamp?: number;
  };
}> {
  try {
    // Try to get health status first
    const health = await server.getHealth();

    if (health.status !== 'healthy') {
      return {
        status: 'degraded',
      };
    }

    // Get latest ledger info to verify RPC is functional
    const latestLedger = await server.getLatestLedger();

    return {
      status: 'healthy',
      ledgerInfo: {
        sequence: latestLedger.sequence,
        protocolVersion: latestLedger.protocolVersion,
      },
    };
  } catch (error) {
    // If health endpoint fails, try just getLatestLedger
    try {
      const latestLedger = await server.getLatestLedger();

      return {
        status: 'healthy',
        ledgerInfo: {
          sequence: latestLedger.sequence,
          protocolVersion: latestLedger.protocolVersion,
        },
      };
    } catch {
      throw error; // Propagate original error
    }
  }
}

/**
 * Get default endpoint for a network
 */
export function getDefaultEndpoint(network: NetworkType): string | null {
  if (network in DEFAULT_ENDPOINTS) {
    return DEFAULT_ENDPOINTS[network as keyof typeof DEFAULT_ENDPOINTS];
  }
  return null;
}

/**
 * Validate RPC endpoint URL format
 */
export function isValidEndpoint(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
