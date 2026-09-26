/**
 * Types for XDR decoding
 */

export type XDRType =
  | 'TransactionEnvelope'
  | 'Transaction'
  | 'Operation'
  | 'AccountID'
  | 'Asset'
  | 'Unknown';

export interface DecodedXDR {
  type: XDRType;
  raw: string;
  decoded: unknown;
  details?: TransactionDetails | OperationDetails;
}

export interface TransactionDetails {
  sourceAccount: string;
  fee: string;
  sequenceNumber: string;
  memo?: {
    type: string;
    value?: string;
  };
  operations: OperationDetails[];
  signatures?: string[];
  networkPassphrase?: string;
}

export interface OperationDetails {
  type: string;
  sourceAccount?: string;
  details: Record<string, unknown>;
}

export interface DecodeOptions {
  network?: 'testnet' | 'mainnet' | 'futurenet';
  format?: 'detailed' | 'simple';
}

export interface DecodeResult {
  success: boolean;
  data?: DecodedXDR;
  error?: string;
}
