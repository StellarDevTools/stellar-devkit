/**
 * RPC Command - Check RPC Health
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { checkRPCHealth, type NetworkType } from '@stellar-devkit/core';

export function createRPCCommand(): Command {
  const rpc = new Command('rpc');

  rpc
    .description('RPC health and network utilities')
    .addCommand(createHealthCommand());

  return rpc;
}

function createHealthCommand(): Command {
  const health = new Command('health');

  health
    .description('Check Stellar RPC endpoint health and connectivity')
    .option('--network <network>', 'Network to check (testnet, mainnet, futurenet)', 'testnet')
    .option('--endpoint <url>', 'Custom RPC endpoint URL')
    .option('--timeout <ms>', 'Request timeout in milliseconds', '10000')
    .option('--json', 'Output as JSON')
    .action(async (options: { network?: string; endpoint?: string; timeout?: string; json?: boolean }) => {
      try {
        const network = validateNetwork(options.network || 'testnet');
        const timeout = parseInt(options.timeout || '10000', 10);

        if (isNaN(timeout) || timeout <= 0) {
          if (options.json) {
            console.log(JSON.stringify({ success: false, error: 'Invalid timeout value' }, null, 2));
          } else {
            console.error(chalk.red('✗ Error:'), 'Timeout must be a positive number');
          }
          process.exit(1);
        }

        // Perform health check
        const result = await checkRPCHealth({
          network,
          customEndpoint: options.endpoint,
          timeout,
        });

        // Output result
        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          displayHealthResult(result);
        }

        // Exit with appropriate code
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

  return health;
}

function validateNetwork(network: string): NetworkType {
  const validNetworks = ['testnet', 'mainnet', 'futurenet', 'custom'];
  if (!validNetworks.includes(network)) {
    console.error(
      chalk.red('✗ Error:'),
      `Invalid network "${network}". Must be one of: ${validNetworks.slice(0, 3).join(', ')}`
    );
    process.exit(1);
  }
  return network as NetworkType;
}

function displayHealthResult(result: Awaited<ReturnType<typeof checkRPCHealth>>): void {
  console.log(chalk.bold.cyan('\n🏥 RPC Health Check\n'));

  console.log(chalk.bold('Network:'), result.network);
  console.log(chalk.bold('Endpoint:'), result.endpoint);

  console.log();

  // Status with color
  const statusColor = result.status === 'healthy' ? 'green' : result.status === 'degraded' ? 'yellow' : 'red';
  const statusIcon = result.status === 'healthy' ? '✓' : result.status === 'degraded' ? '⚠' : '✗';

  console.log(chalk.bold('Status:'), chalk[statusColor](`${statusIcon} ${result.status.toUpperCase()}`));

  // Latency
  if (result.latencyMs !== undefined) {
    const latencyColor = result.latencyMs < 500 ? 'green' : result.latencyMs < 2000 ? 'yellow' : 'red';
    console.log(chalk.bold('Latency:'), chalk[latencyColor](`${result.latencyMs}ms`));
  }

  // Ledger info
  if (result.ledgerInfo) {
    console.log();
    console.log(chalk.bold.underline('Ledger Information:\n'));
    console.log(chalk.bold('Latest Ledger:'), result.ledgerInfo.sequence);
    console.log(chalk.bold('Protocol Version:'), result.ledgerInfo.protocolVersion);
  }

  // Error
  if (result.error) {
    console.log();
    console.log(chalk.bold.red('Error:'), result.error);
  }

  console.log();

  // Summary
  if (result.success) {
    console.log(chalk.green('✓ RPC endpoint is operational'));
  } else {
    console.log(chalk.red('✗ RPC endpoint is not reachable'));
    if (result.network === 'mainnet' && !result.error?.includes('custom')) {
      console.log(chalk.yellow('\nNote: Mainnet requires a custom RPC endpoint'));
      console.log(chalk.dim('  Use: --endpoint <your-mainnet-rpc-url>'));
    }
  }

  console.log();
}
