/**
 * Account Command - Inspect Stellar Accounts
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { inspectAccount, type NetworkType } from '@stellar-devkit/core';

export function createAccountCommand(): Command {
  const account = new Command('account');

  account
    .description('Inspect Stellar account details')
    .argument('<publicKey>', 'Stellar public key (G...)')
    .option('--network <network>', 'Network to use (testnet, mainnet, futurenet)', 'testnet')
    .option('--json', 'Output as JSON')
    .action(async (publicKey: string, options: { network?: string; json?: boolean }) => {
      try {
        const network = validateNetwork(options.network || 'testnet');

        const result = await inspectAccount(publicKey, { network });

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          displayAccountDetails(result);
        }

        process.exit(result.success ? 0 : 1);
      } catch (error) {
        if (options.json) {
          console.log(JSON.stringify({ success: false, error: String(error) }, null, 2));
        } else {
          console.error(chalk.red('✗ Unexpected error:'), error);
        }
        process.exit(1);
      }
    });

  return account;
}

function validateNetwork(network: string): NetworkType {
  const validNetworks = ['testnet', 'mainnet', 'futurenet'];
  if (!validNetworks.includes(network)) {
    console.error(
      chalk.red('✗ Error:'),
      `Invalid network "${network}". Must be one of: ${validNetworks.join(', ')}`
    );
    process.exit(1);
  }
  return network as NetworkType;
}

function displayAccountDetails(result: Awaited<ReturnType<typeof inspectAccount>>): void {
  console.log(chalk.bold.cyan('\n👤 Account Inspector\n'));

  console.log(chalk.bold('Network:'), result.network);
  console.log(chalk.bold('Account ID:'), result.accountId);
  console.log();

  if (!result.success || !result.details) {
    console.log(chalk.red('✗'), result.error);
    console.log();
    return;
  }

  const details = result.details;

  // Sequence and subentry
  console.log(chalk.bold('Sequence:'), details.sequence);
  console.log(chalk.bold('Subentry Count:'), details.subentryCount);
  console.log();

  // Balances
  console.log(chalk.bold.underline('Balances:\n'));
  details.balances.forEach((bal) => {
    if (bal.asset === 'XLM (native)') {
      console.log(chalk.green('●'), chalk.bold(bal.asset));
      console.log('  Balance:', bal.balance, 'XLM');
    } else {
      console.log(chalk.blue('●'), chalk.bold(bal.asset));
      console.log('  Balance:', bal.balance);
      if (bal.limit) console.log('  Limit:', bal.limit);
      if (bal.issuer) console.log('  Issuer:', bal.issuer.substring(0, 8) + '...');
    }
    console.log();
  });

  // Signers
  if (details.signers.length > 0) {
    console.log(chalk.bold.underline(`Signers (${details.signers.length}):\n`));
    details.signers.forEach((signer, i) => {
      console.log(`${i + 1}. ${signer.key}`);
      console.log(`   Weight: ${signer.weight}, Type: ${signer.type}`);
    });
    console.log();
  }

  // Thresholds
  console.log(chalk.bold.underline('Thresholds:\n'));
  console.log('Low:', details.thresholds.low);
  console.log('Medium:', details.thresholds.medium);
  console.log('High:', details.thresholds.high);
  console.log();

  // Flags
  console.log(chalk.bold.underline('Flags:\n'));
  console.log('Auth Required:', details.flags.authRequired ? chalk.green('Yes') : chalk.gray('No'));
  console.log('Auth Revocable:', details.flags.authRevocable ? chalk.green('Yes') : chalk.gray('No'));
  console.log('Auth Immutable:', details.flags.authImmutable ? chalk.green('Yes') : chalk.gray('No'));
  console.log('Auth Clawback:', details.flags.authClawbackEnabled ? chalk.green('Yes') : chalk.gray('No'));
  console.log();

  // Sponsorship
  if (details.sponsor || details.numSponsoring > 0 || details.numSponsored > 0) {
    console.log(chalk.bold.underline('Sponsorship:\n'));
    if (details.sponsor) console.log('Sponsored by:', details.sponsor);
    console.log('Sponsoring:', details.numSponsoring);
    console.log('Sponsored:', details.numSponsored);
    console.log();
  }

  console.log(chalk.dim('Last Modified Ledger:'), details.lastModifiedLedger);
  console.log();
}
