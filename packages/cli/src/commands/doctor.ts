/**
 * Doctor Command - Project Diagnostics
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { diagnoseProject } from '@stellar-devkit/diagnostics';
import { resolve } from 'path';

export function createDoctorCommand(): Command {
  const doctor = new Command('doctor');

  doctor
    .description('Diagnose Stellar/Soroban project health')
    .argument('[path]', 'Project path to diagnose', '.')
    .option(
      '--no-check-tools',
      'Only inspect project files; do not probe local tools'
    )
    .option('--json', 'Output as JSON')
    .action(
      async (
        path: string,
        options: { json?: boolean; checkTools: boolean }
      ) => {
        const projectPath = resolve(path);

        try {
          const result = await diagnoseProject(projectPath, {
            checkTools: options.checkTools,
          });

          if (options.json) {
            console.log(JSON.stringify(result, null, 2));
          } else {
            displayDoctorResult(result);
          }

          process.exit(result.success ? 0 : 1);
        } catch (error) {
          if (options.json) {
            console.log(
              JSON.stringify({ success: false, error: String(error) }, null, 2)
            );
          } else {
            console.error(chalk.red('✗ Error:'), error);
          }
          process.exit(1);
        }
      }
    );

  return doctor;
}

function displayDoctorResult(
  result: Awaited<ReturnType<typeof diagnoseProject>>
): void {
  console.log(chalk.bold.cyan('\n🏥 Project Doctor\n'));
  console.log(chalk.bold('Project:'), result.projectPath);
  console.log();

  // Group findings by severity
  const errors = result.findings.filter((f) => f.severity === 'error');
  const warnings = result.findings.filter((f) => f.severity === 'warning');
  const info = result.findings.filter((f) => f.severity === 'info');

  // Display errors
  if (errors.length > 0) {
    console.log(chalk.bold.red(`\n✗ Errors (${errors.length}):\n`));
    errors.forEach((f) => {
      console.log(chalk.red(`[${f.code}]`), chalk.bold(f.title));
      console.log(' ', f.message);
      if (f.suggestion) console.log(chalk.dim(' ', f.suggestion));
      console.log();
    });
  }

  // Display warnings
  if (warnings.length > 0) {
    console.log(chalk.bold.yellow(`⚠ Warnings (${warnings.length}):\n`));
    warnings.forEach((f) => {
      console.log(chalk.yellow(`[${f.code}]`), chalk.bold(f.title));
      console.log(' ', f.message);
      if (f.suggestion) console.log(chalk.dim(' ', f.suggestion));
      console.log();
    });
  }

  // Display info
  if (info.length > 0) {
    console.log(chalk.bold.green(`\n✓ Info (${info.length}):\n`));
    info.forEach((f) => {
      console.log(chalk.green(`[${f.code}]`), f.title);
      if (f.message) console.log(chalk.dim(' ', f.message));
    });
    console.log();
  }

  // Summary
  console.log(chalk.bold('\nSummary:'));
  console.log(chalk.red('Errors:'), result.summary.errors);
  console.log(chalk.yellow('Warnings:'), result.summary.warnings);
  console.log(chalk.green('Info:'), result.summary.info);
  console.log();

  if (result.success) {
    console.log(chalk.green('✓ No critical issues found'));
  } else {
    console.log(chalk.red('✗ Critical issues require attention'));
  }
  console.log();
}
