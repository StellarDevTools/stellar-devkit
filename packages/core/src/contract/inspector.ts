/**
 * Contract Inspector
 *
 * Inspect Soroban contracts using RPC
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import type {
  ContractInspectOptions,
  ContractInspectResult,
  NetworkType,
} from './types';

const DEFAULT_RPC_URLS = {
  testnet: 'https://soroban-testnet.stellar.org',
  futurenet: 'https://rpc-futurenet.stellar.org',
  // Note: No public mainnet RPC from SDF - users must provide custom endpoint
};

/**
 * Inspect a Soroban contract
 */
export async function inspectContract(
  contractId: string,
  options: ContractInspectOptions = {}
): Promise<ContractInspectResult> {
  const network = options.network || 'testnet';
  const trimmedContractId = contractId.trim();

  // Validate contract ID format
  if (!isValidContractId(trimmedContractId)) {
    return {
      success: false,
      network,
      contractId: trimmedContractId,
      error: 'Invalid contract ID format. Expected C... address.',
    };
  }

  // Determine RPC URL
  let rpcUrl: string;
  if (options.customRpcUrl) {
    rpcUrl = options.customRpcUrl;
  } else if (network === 'mainnet') {
    return {
      success: false,
      network: 'mainnet',
      contractId: trimmedContractId,
      error: 'Mainnet requires a custom RPC endpoint. Use --rpc-url <url> or set customRpcUrl option.',
    };
  } else if (network in DEFAULT_RPC_URLS) {
    rpcUrl = DEFAULT_RPC_URLS[network as keyof typeof DEFAULT_RPC_URLS];
  } else {
    return {
      success: false,
      network,
      contractId: trimmedContractId,
      error: `No RPC URL available for network: ${network}`,
    };
  }

  try {
    // Create RPC server instance
    const server = new StellarSdk.rpc.Server(rpcUrl, {
      allowHttp: rpcUrl.startsWith('http://'),
    });

    // Fetch contract WASM bytecode
    const wasmBuffer = await server.getContractWasmByContractId(trimmedContractId);

    return {
      success: true,
      network,
      contractId: trimmedContractId,
      details: {
        contractId: trimmedContractId,
        exists: true,
        wasmInfo: {
          size: wasmBuffer.length,
          hash: wasmBuffer.toString('hex').slice(0, 64),
        },
      },
    };
  } catch (error: any) {
    // Check if contract doesn't exist
    if (error.message && (error.message.includes('not found') || error.message.includes('does not exist'))) {
      return {
        success: false,
        network,
        contractId: trimmedContractId,
        error: 'Contract not found. The contract may not exist or has not been deployed.',
      };
    }

    return {
      success: false,
      network,
      contractId: trimmedContractId,
      error: error.message || 'Failed to inspect contract',
    };
  }
}

/**
 * Validate contract ID format
 */
export function isValidContractId(contractId: string): boolean {
  try {
    StellarSdk.StrKey.decodeContract(contractId);
    return contractId.startsWith('C') && contractId.length === 56;
  } catch {
    return false;
  }
}

/**
 * Get default RPC URL for a network
 */
export function getDefaultRpcUrl(network: NetworkType): string | null {
  if (network in DEFAULT_RPC_URLS) {
    return DEFAULT_RPC_URLS[network as keyof typeof DEFAULT_RPC_URLS];
  }
  return null;
}
