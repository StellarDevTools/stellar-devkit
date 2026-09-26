/**
 * Types for Contract Event Viewer
 */

import type { NetworkType } from '../network/types';

export type { NetworkType };

export interface EventViewerOptions {
  network?: NetworkType;
  customRpcUrl?: string;
  startLedger?: number;
  contractIds?: string[];
  limit?: number;
}

export interface ContractEvent {
  type: string;
  ledger: number;
  contractId?: string;
  id: string;
  pagingToken: string;
  topics: string[];
  value: string;
}

export interface EventViewerResult {
  success: boolean;
  network: NetworkType;
  events: ContractEvent[];
  latestLedger?: number;
  cursor?: string;
  error?: string;
}
