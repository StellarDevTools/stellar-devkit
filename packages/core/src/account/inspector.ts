/**
 * Account Inspector
 *
 * Inspect Stellar account details
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import type {
  AccountInspectOptions,
  AccountInspectResult,
  AccountDetails,
  AccountBalance,
  AccountSigner,
  NetworkType,
} from './types';

const DEFAULT_HORIZON_URLS = {
  testnet: 'https://horizon-testnet.stellar.org',
  futurenet: 'https://horizon-futurenet.stellar.org',
  mainnet: 'https://horizon.stellar.org',
};

/**
 * Inspect a Stellar account
 */
export async function inspectAccount(
  publicKey: string,
  options: AccountInspectOptions = {}
): Promise<AccountInspectResult> {
  const network = options.network || 'testnet';
  const accountId = publicKey.trim();

  // Validate public key format
  if (!isValidPublicKey(accountId)) {
    return {
      success: false,
      network,
      accountId,
      error: 'Invalid Stellar public key format. Expected G... address.',
    };
  }

  // Determine Horizon URL
  let horizonUrl: string;
  if (options.customHorizonUrl) {
    horizonUrl = options.customHorizonUrl;
  } else if (network in DEFAULT_HORIZON_URLS) {
    horizonUrl = DEFAULT_HORIZON_URLS[network as keyof typeof DEFAULT_HORIZON_URLS];
  } else {
    return {
      success: false,
      network,
      accountId,
      error: `No Horizon URL available for network: ${network}`,
    };
  }

  try {
    // Create Horizon server instance
    const server = new StellarSdk.Horizon.Server(horizonUrl, {
      allowHttp: horizonUrl.startsWith('http://'),
    });

    // Load account from Horizon
    const account = await server.accounts().accountId(accountId).call();

    // Parse account details
    const details = parseAccountDetails(account, accountId);

    return {
      success: true,
      network,
      accountId,
      details,
    };
  } catch (error: any) {
    // Handle specific errors
    if (error.response?.status === 404) {
      return {
        success: false,
        network,
        accountId,
        error: 'Account not found. The account may not exist or has not been funded yet.',
      };
    }

    return {
      success: false,
      network,
      accountId,
      error: error.message || 'Failed to fetch account details',
    };
  }
}

/**
 * Parse Horizon account response to AccountDetails
 */
function parseAccountDetails(
  account: StellarSdk.Horizon.ServerApi.AccountRecord,
  accountId: string
): AccountDetails {
  // Parse balances
  const balances: AccountBalance[] = account.balances.map((bal) => {
    if (bal.asset_type === 'native') {
      return {
        asset: 'XLM (native)',
        balance: bal.balance,
      };
    } else if (bal.asset_type === 'liquidity_pool_shares') {
      return {
        asset: 'Liquidity Pool Shares',
        balance: bal.balance,
      };
    } else {
      // credit_alphanum4 or credit_alphanum12
      const assetBal = bal as any;
      return {
        asset: assetBal.asset_code || 'Unknown',
        balance: assetBal.balance,
        limit: assetBal.limit,
        issuer: assetBal.asset_issuer,
      };
    }
  });

  // Parse signers
  const signers: AccountSigner[] = account.signers.map((signer) => ({
    key: signer.key,
    weight: signer.weight,
    type: signer.type,
  }));

  // Parse thresholds
  const thresholds = {
    low: account.thresholds.low_threshold,
    medium: account.thresholds.med_threshold,
    high: account.thresholds.high_threshold,
  };

  // Parse flags
  const flags = {
    authRequired: account.flags.auth_required,
    authRevocable: account.flags.auth_revocable,
    authImmutable: account.flags.auth_immutable,
    authClawbackEnabled: account.flags.auth_clawback_enabled,
  };

  return {
    accountId,
    sequence: account.sequence,
    subentryCount: account.subentry_count,
    balances,
    signers,
    thresholds,
    flags,
    sponsor: account.sponsor,
    numSponsored: account.num_sponsored,
    numSponsoring: account.num_sponsoring,
    lastModifiedLedger: account.last_modified_ledger,
  };
}

/**
 * Validate Stellar public key format
 */
export function isValidPublicKey(publicKey: string): boolean {
  try {
    StellarSdk.StrKey.decodeEd25519PublicKey(publicKey);
    return publicKey.startsWith('G') && publicKey.length === 56;
  } catch {
    return false;
  }
}

/**
 * Get default Horizon URL for a network
 */
export function getDefaultHorizonUrl(network: NetworkType): string | null {
  if (network in DEFAULT_HORIZON_URLS) {
    return DEFAULT_HORIZON_URLS[network as keyof typeof DEFAULT_HORIZON_URLS];
  }
  return null;
}
