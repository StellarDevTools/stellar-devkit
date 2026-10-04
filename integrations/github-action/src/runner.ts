/**
 * Stellar DevKit GitHub Action
 *
 * Runs project diagnostics in CI/CD
 */

import * as core from '@actions/core';
import { diagnoseProject } from '@stellar-devkit/diagnostics/doctor';

export async function run(): Promise<void> {
  try {
    // Get inputs
    const projectPath = core.getInput('project-path') || '.';
    const failOnError = core.getInput('fail-on-error') === 'true';

    core.info(`Running Stellar DevKit diagnostics on: ${projectPath}`);

    // Run diagnostics
    const result = await diagnoseProject(projectPath, {
      checkTools: core.getInput('check-tools') !== 'false',
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
