/**
 * Types for Network/RPC Health Checking
 */

export type NetworkType = 'testnet' | 'mainnet' | 'futurenet' | 'custom';

export type HealthStatus = 'healthy' | 'degraded' | 'unreachable';

export interface RPCEndpoint {
  url: string;
  network: NetworkType;
}

export interface RPCHealthResult {
  success: boolean;
  endpoint: string;
  network: NetworkType;
  status: HealthStatus;
  latencyMs?: number;
  ledgerInfo?: {
    sequence: number | string;
    protocolVersion: number | string;
    timestamp?: number;
  };
  error?: string;
  timestamp: number;
}

export interface HealthCheckOptions {
  network?: NetworkType;
  customEndpoint?: string;
  timeout?: number;
}
