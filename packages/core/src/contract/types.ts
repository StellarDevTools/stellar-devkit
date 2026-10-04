/**
 * Types for Contract Inspector
 */

import type { NetworkType } from '../network/types';

export type { NetworkType };

export interface ContractInspectOptions {
  network?: NetworkType;
  customRpcUrl?: string;
}

export interface ContractWasmInfo {
  size: number;
  hash: string;
}

export interface ContractDetails {
  contractId: string;
  wasmInfo?: ContractWasmInfo;
  exists: boolean;
  lastModifiedLedger?: number;
  liveUntilLedger?: number;
}

export interface ContractInspectResult {
  success: boolean;
  network: NetworkType;
  contractId: string;
  details?: ContractDetails;
  error?: string;
}
