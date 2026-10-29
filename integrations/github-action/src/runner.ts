/**
 * Stellar DevKit GitHub Action
 *
 * Runs project diagnostics in CI/CD
 */

import * as core from '@actions/core';
import { diagnoseProject } from '@stellar-devkit/diagnostics/doctor';

function getStrictBooleanInput(name: string, defaultValue: boolean): boolean {
  const value = core.getInput(name);
  if (value === '') return defaultValue;
  if (['true', 'True', 'TRUE'].includes(value)) return true;
  if (['false', 'False', 'FALSE'].includes(value)) return false;
  throw new TypeError(`Invalid ${name} input: expected true or false`);
}

export async function run(): Promise<void> {
  try {
    // Get inputs
    const projectPath = core.getInput('project-path') || '.';
    const failOnError = getStrictBooleanInput('fail-on-error', true);
    const checkTools = getStrictBooleanInput('check-tools', true);

    core.info(`Running Stellar DevKit diagnostics on: ${projectPath}`);

    // Run diagnostics
    const result = await diagnoseProject(projectPath, {
      checkTools,
    });

    // Set outputs
    core.setOutput('success', result.success);
    core.setOutput('errors', result.summary.errors);
    core.setOutput('warnings', result.summary.warnings);
    core.setOutput('report', JSON.stringify(result));

    // Display findings
    if (result.findings.length === 0) {
      core.info('✓ No issues found');
      return;
    }

    result.findings.forEach((finding) => {
      const message = `[${finding.code}] ${finding.title}: ${finding.message}`;

      switch (finding.severity) {
        case 'error':
          core.error(message);
          break;
        case 'warning':
          core.warning(message);
          break;
        case 'info':
          core.info(message);
          break;
      }

      if (finding.suggestion) {
        core.info(`  Suggestion: ${finding.suggestion}`);
      }
    });

    // Summary
    core.info(`\n📊 Summary:`);
    core.info(`  Errors: ${result.summary.errors}`);
    core.info(`  Warnings: ${result.summary.warnings}`);
    core.info(`  Info: ${result.summary.info}`);

    // Fail if requested and errors found
    if (failOnError && result.summary.errors > 0) {
      core.setFailed(`Found ${result.summary.errors} error(s)`);
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : 'Unknown error');
  }
}
