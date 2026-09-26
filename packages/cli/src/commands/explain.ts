/**
 * Explain Command - Soroban Error Explainer
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { findMatchingDiagnostics } from '@stellar-devkit/diagnostics';

export function createExplainCommand(): Command {
  const explain = new Command('explain');

  explain
    .description('Explain Soroban errors and provide diagnostic information')
    .argument('<error>', 'Error message to explain')
    .option('--json', 'Output as JSON')
    .action((errorMessage: string, options: { json?: boolean }) => {
      const diagnostics = findMatchingDiagnostics(errorMessage);

      if (options.json) {
        console.log(JSON.stringify({
          success: diagnostics.length > 0,
          errorMessage,
          diagnostics,
        }, null, 2));
      } else {
        displayDiagnostics(errorMessage, diagnostics);
      }

      process.exit(diagnostics.length > 0 ? 0 : 1);
    });

  return explain;
}

function displayDiagnostics(errorMessage: string, diagnostics: ReturnType<typeof findMatchingDiagnostics>): void {
  console.log(chalk.bold.cyan('\n🔍 Soroban Error Explainer\n'));
  console.log(chalk.bold('Error Message:'), errorMessage);
  console.log();

  if (diagnostics.length === 0) {
    console.log(chalk.yellow('⚠'), 'No diagnostic information found for this error.');
    console.log();
    console.log(chalk.dim('The error may be:'));
    console.log(chalk.dim('  - A new or uncommon error not yet in the registry'));
    console.log(chalk.dim('  - A custom error from your contract'));
    console.log(chalk.dim('  - A typo or malformed error message'));
    console.log();
    return;
  }

  diagnostics.forEach((diag, index) => {
    if (index > 0) console.log(chalk.dim('─'.repeat(60)));
    console.log();

    console.log(chalk.bold.green(`[${diag.code}]`), chalk.bold(diag.title));
    console.log();
    console.log(chalk.bold('Explanation:'));
    console.log(' ', diag.explanation);
    console.log();

    console.log(chalk.bold('Possible Causes:'));
    diag.causes.forEach((cause, i) => {
      console.log(chalk.yellow(` ${i + 1}.`), cause);
    });
    console.log();

    console.log(chalk.bold('Recommendations:'));
    diag.recommendations.forEach((rec, i) => {
      console.log(chalk.green(` ${i + 1}.`), rec);
    });

    if (diag.docsUrl) {
      console.log();
      console.log(chalk.bold('Documentation:'), chalk.blue.underline(diag.docsUrl));
    }

    console.log();
  });
}
