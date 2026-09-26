/**
 * Transaction Command - Transaction Inspector
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { inspectTransaction, type NetworkType } from '@stellar-devkit/core';
import { explainError } from '@stellar-devkit/diagnostics/error-registry';

export function createTransactionCommand(): Command {
  const transaction = new Command('transaction');

  transaction
    .description('Inspect Stellar transactions')
    .argument('<hash>', 'Transaction hash (hex)')
    .option('--network <network>', 'Network to use (testnet, mainnet, futurenet)', 'testnet')
    .option('--rpc-url <url>', 'Custom RPC URL')
    .option('--json', 'Output as JSON')
    .action(async (hash: string, options: { network: string; rpcUrl?: string; json?: boolean }) => {
      const result = await inspectTransaction(hash, {
        network: options.network as NetworkType,
        customRpcUrl: options.rpcUrl,
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
      }

      displayTransactionInfo(result);
      process.exit(result.success ? 0 : 1);
    });

  return transaction;
}

function displayTransactionInfo(result: Awaited<ReturnType<typeof inspectTransaction>>): void {
  console.log(chalk.bold.cyan('\n🔗 Transaction Inspector\n'));
  console.log(chalk.bold('Transaction Hash:'), result.hash);
  console.log(chalk.bold('Network:'), result.network);
  console.log();

  if (!result.success) {
    console.log(chalk.red('✗'), chalk.bold('Error'));
    console.log(' ', result.error);
    console.log();
    return;
  }

  if (!result.details) {
    console.log(chalk.yellow('⚠'), 'No transaction details available');
    console.log();
    return;
  }

  const details = result.details;

  // Status
  const statusColor = details.status === 'SUCCESS' ? chalk.green : details.status === 'FAILED' ? chalk.red : chalk.yellow;
  console.log(statusColor('●'), chalk.bold('Status:'), statusColor(details.status));
  console.log();

  // Basic info
  if (details.ledger) {
    console.log(chalk.bold('Ledger:'), details.ledger);
  }
  if (details.createdAt) {
    console.log(chalk.bold('Created:'), details.createdAt);
  }
  if (details.sourceAccount) {
    console.log(chalk.bold('Source:'), details.sourceAccount);
  }
  if (details.fee) {
    console.log(chalk.bold('Fee:'), details.fee, 'stroops');
  }
  console.log();

  // Operations
  if (details.operationCount !== undefined) {
    console.log(chalk.bold('Operations:'), details.operationCount);
    if (details.operations && details.operations.length > 0) {
      details.operations.forEach((op, idx) => {
        console.log(chalk.dim(`  ${idx + 1}.`), op.type);
      });
    }
    console.log();
  }

  // Events
  if (details.events && details.events.length > 0) {
    console.log(chalk.bold('Contract Events:'), details.events.length);
    details.events.forEach((event, idx) => {
      console.log(chalk.dim(`  ${idx + 1}.`), event.type);
      if (event.contractId) {
        console.log(chalk.dim('     Contract:'), event.contractId);
      }
    });
    console.log();
  }

  // Error details with explainer integration
  if (details.error && details.status === 'FAILED') {
    console.log(chalk.red.bold('Error Details:'));
    console.log(' ', details.error);
    console.log();

    // Try to explain the error
    const explanation = explainError(details.error);
    if (explanation.recognized && explanation.diagnostic) {
      console.log(chalk.yellow('💡 Error Explanation:'));
      console.log(' ', chalk.bold(explanation.diagnostic.title));
      console.log(' ', explanation.diagnostic.explanation);
      console.log();

      if (explanation.diagnostic.recommendations.length > 0) {
        console.log(chalk.green('Recommendations:'));
        explanation.diagnostic.recommendations.forEach((rec, idx) => {
          console.log(chalk.green(`  ${idx + 1}.`), rec);
        });
        console.log();
      }
    }
  }
}
