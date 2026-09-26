/**
 * XDR Command - Decode Stellar XDR
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { decodeXDR, isValidXDRFormat, type TransactionDetails } from '@stellar-devkit/core';

function isTransactionDetails(details: unknown): details is TransactionDetails {
  return (
    typeof details === 'object' &&
    details !== null &&
    'sourceAccount' in details &&
    'operations' in details
  );
}

export function createXDRCommand(): Command {
  const xdr = new Command('xdr');

  xdr
    .description('XDR decoding utilities')
    .addCommand(createDecodeCommand());

  return xdr;
}

function createDecodeCommand(): Command {
  const decode = new Command('decode');

  decode
    .description('Decode Stellar XDR to human-readable format')
    .argument('<xdr>', 'XDR string to decode (base64)')
    .option('--network <network>', 'Network to use (testnet, mainnet, futurenet)', 'testnet')
    .option('--json', 'Output as JSON')
    .action(async (xdrString: string, options: { network?: string; json?: boolean }) => {
      try {
        // Validate XDR format
        if (!isValidXDRFormat(xdrString)) {
          if (options.json) {
            console.log(JSON.stringify({ success: false, error: 'Invalid XDR format' }, null, 2));
          } else {
            console.error(chalk.red('✗ Error:'), 'Invalid XDR format. Expected base64-encoded string.');
          }
          process.exit(1);
        }

        // Decode XDR
        const network = validateNetwork(options.network || 'testnet');
        const result = decodeXDR(xdrString, { network });

        if (!result.success) {
          if (options.json) {
            console.log(JSON.stringify(result, null, 2));
          } else {
            console.error(chalk.red('✗ Error:'), result.error);
          }
          process.exit(1);
        }

        // Output result
        if (options.json) {
          console.log(JSON.stringify(result.data, null, 2));
        } else {
          displayDecodedXDR(result.data!);
        }
      } catch (error) {
        if (options.json) {
          console.log(JSON.stringify({ success: false, error: String(error) }, null, 2));
        } else {
          console.error(chalk.red('✗ Unexpected error:'), error);
        }
        process.exit(1);
      }
    });

  return decode;
}

function validateNetwork(network: string): 'testnet' | 'mainnet' | 'futurenet' {
  const validNetworks = ['testnet', 'mainnet', 'futurenet'];
  if (!validNetworks.includes(network)) {
    console.error(chalk.red('✗ Error:'), `Invalid network "${network}". Must be one of: ${validNetworks.join(', ')}`);
    process.exit(1);
  }
  return network as 'testnet' | 'mainnet' | 'futurenet';
}

function displayDecodedXDR(data: NonNullable<ReturnType<typeof decodeXDR>['data']>): void {
  console.log(chalk.bold.cyan('\n🔍 XDR Decoded Successfully\n'));

  console.log(chalk.bold('Type:'), chalk.green(data.type));
  console.log();

  if (data.details && isTransactionDetails(data.details)) {
    const txDetails: TransactionDetails = data.details;

    console.log(chalk.bold.underline('Transaction Details:\n'));
    console.log(chalk.bold('Source Account:'), txDetails.sourceAccount);
    console.log(chalk.bold('Fee:'), `${txDetails.fee} stroops`);
    console.log(chalk.bold('Sequence:'), txDetails.sequenceNumber);

    if (txDetails.memo) {
      console.log(chalk.bold('Memo:'), `${txDetails.memo.type}${txDetails.memo.value ? `: ${txDetails.memo.value}` : ''}`);
    }

    if (txDetails.networkPassphrase) {
      console.log(chalk.bold('Network:'), txDetails.networkPassphrase);
    }

    console.log();
    console.log(chalk.bold.underline(`Operations (${txDetails.operations.length}):\n`));

    txDetails.operations.forEach((op, index) => {
      console.log(chalk.bold.yellow(`${index + 1}. ${op.type}`));

      if (op.sourceAccount) {
        console.log(`   ${chalk.dim('Source:')} ${op.sourceAccount}`);
      }

      Object.entries(op.details).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          console.log(`   ${chalk.dim(key + ':')} ${formatValue(value)}`);
        }
      });

      console.log();
    });

    if (txDetails.signatures && txDetails.signatures.length > 0) {
      console.log(chalk.bold.underline(`Signatures (${txDetails.signatures.length}):\n`));
      txDetails.signatures.forEach((sig, index) => {
        console.log(`${index + 1}. ${sig.substring(0, 32)}...`);
      });
      console.log();
    }
  }
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return JSON.stringify(value);
}
