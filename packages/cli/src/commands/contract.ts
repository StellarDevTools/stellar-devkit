/**
 * Contract Command - Soroban Contract Inspector
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { inspectContract, type NetworkType } from '@stellar-devkit/core';

export function createContractCommand(): Command {
  const contract = new Command('contract');

  contract
    .description('Inspect Soroban contracts')
    .argument('<contract-id>', 'Contract ID (C...)')
    .option('--network <network>', 'Network to use (testnet, mainnet, futurenet)', 'testnet')
    .option('--rpc-url <url>', 'Custom RPC URL')
    .option('--json', 'Output as JSON')
    .action(async (contractId: string, options: { network: string; rpcUrl?: string; json?: boolean }) => {
      const result = await inspectContract(contractId, {
        network: options.network as NetworkType,
        customRpcUrl: options.rpcUrl,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
      }

      displayContractInfo(result);
      process.exit(result.success ? 0 : 1);
    });

  return contract;
}

function displayContractInfo(result: Awaited<ReturnType<typeof inspectContract>>): void {
  console.log(chalk.bold.cyan('\n📜 Contract Inspector\n'));
  console.log(chalk.bold('Contract ID:'), result.contractId);
  console.log(chalk.bold('Network:'), result.network);
  console.log();

  if (!result.success) {
    console.log(chalk.red('✗'), chalk.bold('Error'));
    console.log(' ', result.error);
    console.log();
    return;
  }

  if (!result.details) {
    console.log(chalk.yellow('⚠'), 'No contract details available');
    console.log();
    return;
  }

  console.log(chalk.green('✓'), chalk.bold('Contract Found'));
  console.log();

  if (result.details.wasmInfo) {
    console.log(chalk.bold('WASM Information:'));
    console.log('  Size:', chalk.cyan(`${result.details.wasmInfo.size.toLocaleString()} bytes`));
    console.log('  Hash:', chalk.dim(result.details.wasmInfo.hash));
  }

  console.log();
}
