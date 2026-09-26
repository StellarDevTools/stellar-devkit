/**
 * Tests for XDR Decoder
 */

import { describe, it, expect } from 'vitest';
import { decodeXDR, isValidXDRFormat } from '../../src/xdr';
import * as StellarSdk from '@stellar/stellar-sdk';

describe('XDR Decoder', () => {
  describe('isValidXDRFormat', () => {
    it('should return true for valid base64 strings', () => {
      expect(isValidXDRFormat('AAAAAAAA')).toBe(true);
      expect(isValidXDRFormat('ABC123+/==')).toBe(true);
    });

    it('should return false for invalid base64 strings', () => {
      expect(isValidXDRFormat('')).toBe(false);
      expect(isValidXDRFormat('   ')).toBe(false);
      expect(isValidXDRFormat('not base64!@#')).toBe(false);
    });

    it('should handle strings with whitespace', () => {
      expect(isValidXDRFormat('  AAAAAAAA  ')).toBe(true);
    });
  });

  describe('decodeXDR', () => {
    it('should return error for empty XDR', () => {
      const result = decodeXDR('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('XDR string is empty');
    });

    it('should return error for invalid XDR', () => {
      const result = decodeXDR('invalid-xdr');
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should decode a valid payment transaction', () => {
      const sourceKeypair = StellarSdk.Keypair.random();
      const destKeypair = StellarSdk.Keypair.random();

      const account = new StellarSdk.Account(sourceKeypair.publicKey(), '100');

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destKeypair.publicKey(),
            asset: StellarSdk.Asset.native(),
            amount: '10',
          })
        )
        .setTimeout(30)
        .build();

      const xdr = transaction.toXDR();

      const result = decodeXDR(xdr, { network: 'testnet' });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.type).toBe('TransactionEnvelope');
      expect(result.data?.details).toBeDefined();

      if (result.data?.details && 'sourceAccount' in result.data.details) {
        expect(result.data.details.sourceAccount).toBe(sourceKeypair.publicKey());
        expect(result.data.details.operations).toHaveLength(1);
        expect(result.data.details.operations[0].type).toBe('payment');
      }
    });

    it('should decode a transaction with multiple operations', () => {
      const sourceKeypair = StellarSdk.Keypair.random();
      const dest1 = StellarSdk.Keypair.random();
      const dest2 = StellarSdk.Keypair.random();

      const account = new StellarSdk.Account(sourceKeypair.publicKey(), '200');

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: dest1.publicKey(),
            asset: StellarSdk.Asset.native(),
            amount: '5',
          })
        )
        .addOperation(
          StellarSdk.Operation.payment({
            destination: dest2.publicKey(),
            asset: StellarSdk.Asset.native(),
            amount: '3',
          })
        )
        .setTimeout(30)
        .build();

      const xdr = transaction.toXDR();

      const result = decodeXDR(xdr, { network: 'testnet' });

      expect(result.success).toBe(true);
      expect(result.data?.details).toBeDefined();

      if (result.data?.details && 'operations' in result.data.details) {
        expect(result.data.details.operations).toHaveLength(2);
        expect(result.data.details.operations[0].type).toBe('payment');
        expect(result.data.details.operations[1].type).toBe('payment');
      }
    });

    it('should decode a transaction with memo', () => {
      const sourceKeypair = StellarSdk.Keypair.random();
      const destKeypair = StellarSdk.Keypair.random();

      const account = new StellarSdk.Account(sourceKeypair.publicKey(), '300');

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destKeypair.publicKey(),
            asset: StellarSdk.Asset.native(),
            amount: '10',
          })
        )
        .addMemo(StellarSdk.Memo.text('Test payment'))
        .setTimeout(30)
        .build();

      const xdr = transaction.toXDR();

      const result = decodeXDR(xdr, { network: 'testnet' });

      expect(result.success).toBe(true);

      if (result.data?.details && 'memo' in result.data.details) {
        expect(result.data.details.memo).toBeDefined();
        expect(result.data.details.memo?.type).toBe('text');
        expect(result.data.details.memo?.value).toBe('Test payment');
      }
    });

    it('should decode createAccount operation', () => {
      const sourceKeypair = StellarSdk.Keypair.random();
      const newAccountKeypair = StellarSdk.Keypair.random();

      const account = new StellarSdk.Account(sourceKeypair.publicKey(), '400');

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.createAccount({
            destination: newAccountKeypair.publicKey(),
            startingBalance: '100',
          })
        )
        .setTimeout(30)
        .build();

      const xdr = transaction.toXDR();

      const result = decodeXDR(xdr, { network: 'testnet' });

      expect(result.success).toBe(true);

      if (result.data?.details && 'operations' in result.data.details) {
        expect(result.data.details.operations[0].type).toBe('createAccount');
        expect(result.data.details.operations[0].details.destination).toBe(
          newAccountKeypair.publicKey()
        );
        expect(result.data.details.operations[0].details.startingBalance).toBe('100.0000000');
      }
    });

    it('should handle different networks', () => {
      const sourceKeypair = StellarSdk.Keypair.random();
      const destKeypair = StellarSdk.Keypair.random();

      const account = new StellarSdk.Account(sourceKeypair.publicKey(), '100');

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destKeypair.publicKey(),
            asset: StellarSdk.Asset.native(),
            amount: '10',
          })
        )
        .setTimeout(30)
        .build();

      const xdr = transaction.toXDR();

      const testnetResult = decodeXDR(xdr, { network: 'testnet' });
      expect(testnetResult.success).toBe(true);

      const mainnetResult = decodeXDR(xdr, { network: 'mainnet' });
      expect(mainnetResult.success).toBe(true);

      const futurenetResult = decodeXDR(xdr, { network: 'futurenet' });
      expect(futurenetResult.success).toBe(true);
    });
  });
});
