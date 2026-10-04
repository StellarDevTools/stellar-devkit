import { Command } from 'commander';
import { simulateTransaction, type NetworkType } from '@stellar-devkit/core';

export function createSimulateCommand(): Command {
  return new Command('simulate')
    .description(
      'Simulate one Soroban invocation without signing or submitting'
    )
    .argument('<xdr>', 'Base64 transaction envelope')
    .option(
      '--network <network>',
      'testnet, futurenet, mainnet or custom',
      'testnet'
    )
    .option('--rpc-url <url>', 'Custom RPC endpoint')
    .option('--network-passphrase <passphrase>', 'Required for custom networks')
    .option('--json', 'Output as JSON')
    .action(
      async (
        xdr: string,
        options: {
          network: NetworkType;
          rpcUrl?: string;
          networkPassphrase?: string;
          json?: boolean;
        }
      ) => {
        const result = await simulateTransaction(xdr, {
          network: options.network,
          customRpcUrl: options.rpcUrl,
          networkPassphrase: options.networkPassphrase,
        });
        if (!options.json)
          console.log(
            result.success
              ? 'Simulation completed (no transaction submitted).'
              : 'Simulation failed.'
          );
        console.log(JSON.stringify(result, null, 2));
        process.exitCode = result.success ? 0 : 1;
      }
    );
}
