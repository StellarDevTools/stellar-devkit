/**
 * Events Command - Contract Event Viewer
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { queryEvents, type NetworkType } from '@stellar-devkit/core';

export function createEventsCommand(): Command {
  const events = new Command('events');

  events
    .description('Query Soroban contract events')
    .option('--network <network>', 'Network (testnet, mainnet, futurenet)', 'testnet')
    .option('--rpc-url <url>', 'Custom RPC URL')
    .option('--start-ledger <ledger>', 'Start ledger', parseInt)
    .option('--contract-id <id>', 'Filter by contract ID (repeatable)', collect, [])
    .option('--limit <number>', 'Max events to return', parseInt, 10)
    .option('--json', 'Output as JSON')
    .action(async (options: {
      network: string;
      rpcUrl?: string;
      startLedger?: number;
      contractId: string[];
      limit: number;
      json?: boolean;
    }) => {
      const result = await queryEvents({
        network: options.network as NetworkType,
        customRpcUrl: options.rpcUrl,
        startLedger: options.startLedger,
        contractIds: options.contractId.length > 0 ? options.contractId : undefined,
        limit: options.limit,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
      }

      displayEvents(result);
      process.exit(result.success ? 0 : 1);
    });

  return events;
}

function collect(value: string, previous: string[]): string[] {
  return previous.concat([value]);
}

function displayEvents(result: Awaited<ReturnType<typeof queryEvents>>): void {
  console.log(chalk.bold.cyan('\n📊 Contract Events\n'));

  if (!result.success) {
    console.log(chalk.red('✗'), result.error);
    console.log();
    return;
  }

  if (result.events.length === 0) {
    console.log(chalk.yellow('No events found'));
    console.log();
    return;
  }

  console.log(chalk.green(`Found ${result.events.length} events`));
  if (result.latestLedger) {
    console.log(chalk.dim(`Latest ledger: ${result.latestLedger}`));
  }
  console.log();

  result.events.forEach((event, idx) => {
    console.log(chalk.bold(`${idx + 1}. ${event.type}`));
    console.log('  Ledger:', event.ledger);
    if (event.contractId) {
      console.log('  Contract:', chalk.dim(event.contractId));
    }
    console.log('  ID:', chalk.dim(event.id));
    console.log();
  });
}
