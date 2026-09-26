/**
 * Types for Account Inspector
 */

import type { NetworkType } from '../network/types';

export type { NetworkType };

export interface AccountInspectOptions {
  network?: NetworkType;
  customHorizonUrl?: string;
}

export interface AccountBalance {
  asset: string;
  balance: string;
  limit?: string;
  issuer?: string;
}

export interface AccountSigner {
  key: string;
  weight: number;
  type: string;
}

export interface AccountThresholds {
  low: number;
  medium: number;
  high: number;
}

export interface AccountFlags {
  authRequired: boolean;
  authRevocable: boolean;
  authImmutable: boolean;
  authClawbackEnabled: boolean;
}

export interface AccountDetails {
  accountId: string;
  sequence: string;
  subentryCount: number;
  balances: AccountBalance[];
  signers: AccountSigner[];
  thresholds: AccountThresholds;
  flags: AccountFlags;
  sponsor?: string;
  numSponsored: number;
  numSponsoring: number;
  lastModifiedLedger: number;
}

export interface AccountInspectResult {
  success: boolean;
  network: NetworkType;
  accountId: string;
  details?: AccountDetails;
  error?: string;
}
