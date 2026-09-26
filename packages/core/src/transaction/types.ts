/**
 * Types for Transaction Inspector
 */

import type { NetworkType } from '../network/types';

export type { NetworkType };

export interface TransactionInspectOptions {
  network?: NetworkType;
  customRpcUrl?: string;
}

export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'NOT_FOUND' | 'PENDING';

export interface TransactionOperation {
  type: string;
  [key: string]: any;
}

export interface TransactionEvent {
  type: string;
  contractId?: string;
  topics: string[];
  value: string;
}

export interface TransactionInfo {
  hash: string;
  status: TransactionStatus;
  ledger?: number;
  createdAt?: string;
  feeBump?: boolean;
  sourceAccount?: string;
  fee?: string;
  operationCount?: number;
  operations?: TransactionOperation[];
  events?: TransactionEvent[];
  resultXdr?: string;
  envelopeXdr?: string;
  error?: string;
}

export interface TransactionInspectResult {
  success: boolean;
  network: NetworkType;
  hash: string;
  details?: TransactionInfo;
  error?: string;
}
