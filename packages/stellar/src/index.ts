import {
  Networks,
  rpc,
  scValToNative,
  StrKey,
  xdr,
} from '@stellar/stellar-sdk';

export const version = '0.0.1';
export * from './errors';
export type Network = 'testnet' | 'futurenet' | 'mainnet' | 'custom';
export const RPC_ENDPOINTS = {
  testnet: 'https://soroban-testnet.stellar.org',
  futurenet: 'https://rpc-futurenet.stellar.org',
};

export function validateEndpoint(endpoint: string): string {
  const url = new URL(endpoint);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.hash
  ) {
    throw new Error(
      'RPC URL must use HTTP(S), without embedded credentials or a fragment.'
    );
  }
  return endpoint;
}

export function resolveRpcUrl(
  network: Network = 'testnet',
  customRpcUrl?: string
): string {
  if (!['testnet', 'futurenet', 'mainnet', 'custom'].includes(network))
    throw new Error('Unknown network');
  const endpoint =
    customRpcUrl || RPC_ENDPOINTS[network as keyof typeof RPC_ENDPOINTS];
  if (!endpoint)
    throw new Error('This network requires a custom RPC endpoint.');
  return validateEndpoint(endpoint);
}

export function createRpcServer(
  network: Network = 'testnet',
  customRpcUrl?: string
): rpc.Server {
  const endpoint = resolveRpcUrl(network, customRpcUrl);
  return new rpc.Server(endpoint, {
    allowHttp: endpoint.startsWith('http://'),
  });
}

/** Bounds caller waiting; SDK v13 does not expose cancellation for these requests. */
export async function withRpcTimeout<T>(
  request: Promise<T>,
  milliseconds = 10_000
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      request,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error('RPC request timeout')),
          milliseconds
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function networkPassphrase(
  network: Network = 'testnet',
  custom?: string
): string {
  if (network === 'custom') {
    if (!custom?.trim())
      throw new Error('Custom networks require a network passphrase.');
    return custom;
  }
  const passphrase = {
    testnet: Networks.TESTNET,
    mainnet: Networks.PUBLIC,
    futurenet: Networks.FUTURENET,
  }[network];
  if (!passphrase) throw new Error('Unknown network');
  return passphrase;
}

export function jsonSafe(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (_key, item: unknown) =>
      typeof item === 'bigint' ? item.toString() : item
    )
  );
}

export function decodeScVal(value: xdr.ScVal): {
  xdr: string;
  decoded?: unknown;
  warning?: string;
} {
  const encoded = value.toXDR('base64');
  try {
    return { xdr: encoded, decoded: jsonSafe(scValToNative(value)) };
  } catch {
    return {
      xdr: encoded,
      warning: 'This ScVal cannot be decoded; preserved as XDR.',
    };
  }
}

export function decodeContractEvent(event: xdr.ContractEvent) {
  const body = event.body().v0();
  const id = event.contractId();
  return {
    type: event.type().name,
    contractId: id ? StrKey.encodeContract(id) : undefined,
    topics: body.topics().map((value) => value.toXDR('base64')),
    value: body.data().toXDR('base64'),
    decodedTopics: body.topics().map(decodeScVal),
    decodedValue: decodeScVal(body.data()),
  };
}
