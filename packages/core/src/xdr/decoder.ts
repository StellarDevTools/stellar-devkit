/**
 * XDR Decoder - Decode Stellar XDR to human-readable format
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import type {
  DecodeResult,
  DecodeOptions,
  DecodedXDR,
  TransactionDetails,
  OperationDetails,
} from './types';

const NETWORK_PASSPHRASES = {
  testnet: StellarSdk.Networks.TESTNET,
  mainnet: StellarSdk.Networks.PUBLIC,
  futurenet: StellarSdk.Networks.FUTURENET,
};

/**
 * Decode XDR string to human-readable format
 */
export function decodeXDR(
  xdr: string,
  options: DecodeOptions = {}
): DecodeResult {
  try {
    const trimmedXDR = xdr.trim();

    if (!trimmedXDR) {
      return {
        success: false,
        error: 'XDR string is empty',
      };
    }

    // Try to detect and decode the XDR type
    const result = detectAndDecode(trimmedXDR, options);

    if (!result) {
      return {
        success: false,
        error: 'Unable to decode XDR. Invalid format or unsupported type.',
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown decoding error',
    };
  }
}

/**
 * Detect XDR type and decode accordingly
 */
function detectAndDecode(
  xdr: string,
  options: DecodeOptions
): DecodedXDR | null {
  // Try TransactionEnvelope first (most common)
  const txEnvelope = tryDecodeTransactionEnvelope(xdr, options);
  if (txEnvelope) return txEnvelope;

  // Try Transaction
  const tx = tryDecodeTransaction(xdr, options);
  if (tx) return tx;

  // Add more type detection as needed
  return null;
}

/**
 * Try to decode as TransactionEnvelope
 */
function tryDecodeTransactionEnvelope(
  xdr: string,
  options: DecodeOptions
): DecodedXDR | null {
  try {
    const envelope = StellarSdk.TransactionBuilder.fromXDR(
      xdr,
      NETWORK_PASSPHRASES[options.network || 'testnet']
    );

    const tx = envelope as StellarSdk.Transaction;

    const details: TransactionDetails = {
      sourceAccount: tx.source,
      fee: tx.fee,
      sequenceNumber: tx.sequence,
      operations: tx.operations.map(parseOperation),
    };

    // Parse memo if present
    if (tx.memo && tx.memo.type !== StellarSdk.MemoNone) {
      details.memo = {
        type: tx.memo.type,
        value: tx.memo.value?.toString(),
      };
    }

    // Parse signatures
    if ('signatures' in tx && Array.isArray(tx.signatures)) {
      details.signatures = tx.signatures.map((sig: { signature: () => Buffer }) =>
        sig.signature().toString('base64')
      );
    }

    details.networkPassphrase = options.network || 'testnet';

    return {
      type: 'TransactionEnvelope',
      raw: xdr,
      decoded: envelope,
      details,
    };
  } catch {
    return null;
  }
}

/**
 * Try to decode as Transaction
 */
function tryDecodeTransaction(
  xdr: string,
  _options: DecodeOptions
): DecodedXDR | null {
  try {
    const txXdr = StellarSdk.xdr.Transaction.fromXDR(xdr, 'base64');

    return {
      type: 'Transaction',
      raw: xdr,
      decoded: txXdr,
      details: undefined, // Could parse further if needed
    };
  } catch {
    return null;
  }
}

/**
 * Parse a Stellar operation to a readable format
 */
function parseOperation(op: StellarSdk.Operation): OperationDetails {
  const details: OperationDetails = {
    type: op.type,
    sourceAccount: op.source,
    details: {},
  };

  // Parse operation-specific fields
  switch (op.type) {
    case 'payment':
      details.details = {
        destination: (op as StellarSdk.Operation.Payment).destination,
        asset: formatAsset((op as StellarSdk.Operation.Payment).asset),
        amount: (op as StellarSdk.Operation.Payment).amount,
      };
      break;

    case 'createAccount':
      details.details = {
        destination: (op as StellarSdk.Operation.CreateAccount).destination,
        startingBalance: (op as StellarSdk.Operation.CreateAccount)
          .startingBalance,
      };
      break;

    case 'pathPaymentStrictReceive':
    case 'pathPaymentStrictSend': {
      const pathOp = op as
        | StellarSdk.Operation.PathPaymentStrictReceive
        | StellarSdk.Operation.PathPaymentStrictSend;
      details.details = {
        sendAsset: formatAsset(pathOp.sendAsset),
        destAsset: formatAsset(pathOp.destAsset),
        destination: pathOp.destination,
      };
      if ('sendAmount' in pathOp) {
        details.details.sendAmount = pathOp.sendAmount;
      }
      if ('destAmount' in pathOp) {
        details.details.destAmount = pathOp.destAmount;
      }
      break;
    }

    case 'changeTrust': {
      const trustOp = op as StellarSdk.Operation.ChangeTrust;
      details.details = {
        asset:
          trustOp.line instanceof StellarSdk.Asset
            ? formatAsset(trustOp.line)
            : 'LiquidityPool',
        limit: trustOp.limit,
      };
      break;
    }

    case 'setOptions': {
      const setOp = op as StellarSdk.Operation.SetOptions;
      details.details = {
        inflationDest: setOp.inflationDest,
        clearFlags: setOp.clearFlags,
        setFlags: setOp.setFlags,
        masterWeight: setOp.masterWeight,
        lowThreshold: setOp.lowThreshold,
        medThreshold: setOp.medThreshold,
        highThreshold: setOp.highThreshold,
        homeDomain: setOp.homeDomain,
        signer: setOp.signer,
      };
      break;
    }

    case 'manageData': {
      const dataOp = op as StellarSdk.Operation.ManageData;
      details.details = {
        name: dataOp.name,
        value: dataOp.value?.toString('base64'),
      };
      break;
    }

    case 'invokeHostFunction': {
      const invokeOp = op as StellarSdk.Operation.InvokeHostFunction;
      details.details = {
        function: invokeOp.func?.switch().name || 'unknown',
        auth: invokeOp.auth ? `${invokeOp.auth.length} auth entries` : 'none',
      };
      break;
    }

    case 'bumpSequence':
      details.details = {
        bumpTo: (op as StellarSdk.Operation.BumpSequence).bumpTo,
      };
      break;

    case 'accountMerge':
      details.details = {
        destination: (op as StellarSdk.Operation.AccountMerge).destination,
      };
      break;

    case 'manageSellOffer': {
      const sellOfferOp = op as StellarSdk.Operation.ManageSellOffer;
      details.details = {
        selling: formatAsset(sellOfferOp.selling),
        buying: formatAsset(sellOfferOp.buying),
        amount: sellOfferOp.amount,
        price: sellOfferOp.price,
        offerId: sellOfferOp.offerId,
      };
      break;
    }

    case 'manageBuyOffer': {
      const buyOfferOp = op as StellarSdk.Operation.ManageBuyOffer;
      details.details = {
        selling: formatAsset(buyOfferOp.selling),
        buying: formatAsset(buyOfferOp.buying),
        buyAmount: buyOfferOp.buyAmount,
        price: buyOfferOp.price,
        offerId: buyOfferOp.offerId,
      };
      break;
    }

    case 'createPassiveSellOffer': {
      const passiveOp = op as StellarSdk.Operation.CreatePassiveSellOffer;
      details.details = {
        selling: formatAsset(passiveOp.selling),
        buying: formatAsset(passiveOp.buying),
        amount: passiveOp.amount,
        price: passiveOp.price,
      };
      break;
    }

    case 'allowTrust': {
      const allowOp = op as StellarSdk.Operation.AllowTrust;
      details.details = {
        trustor: allowOp.trustor,
        assetCode: allowOp.assetCode,
        authorize: allowOp.authorize,
      };
      break;
    }

    case 'clawback': {
      const clawbackOp = op as StellarSdk.Operation.Clawback;
      details.details = {
        asset: formatAsset(clawbackOp.asset),
        from: clawbackOp.from,
        amount: clawbackOp.amount,
      };
      break;
    }

    default:
      details.details = { ...op };
      break;
  }

  return details;
}

/**
 * Format an asset to a readable string
 */
function formatAsset(asset: StellarSdk.Asset): string {
  if (asset.isNative()) {
    return 'XLM (native)';
  }

  const code = asset.getCode();
  const issuer = asset.getIssuer();

  return `${code}:${issuer.substring(0, 8)}...${issuer.substring(issuer.length - 4)}`;
}

/**
 * Validate if a string looks like valid base64 XDR
 */
export function isValidXDRFormat(xdr: string): boolean {
  const trimmed = xdr.trim();

  if (!trimmed) return false;

  // Check if it's valid base64
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(trimmed);
}
