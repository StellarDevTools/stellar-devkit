import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { parse } from '@iarna/toml';

export interface DiagnosticFinding {
  code: string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  suggestion?: string;
}

export interface DoctorResult {
  success: boolean;
  projectPath: string;
  findings: DiagnosticFinding[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

export interface DoctorOptions {
  checkTools?: boolean;
}

export async function diagnoseProject(
  projectPath: string,
  options: DoctorOptions = {}
): Promise<DoctorResult> {
  const findings: DiagnosticFinding[] = [];
  const project = resolve(projectPath);
  const add = (
    code: string,
    severity: DiagnosticFinding['severity'],
    title: string,
    message: string,
    suggestion: string
  ) => {
    findings.push({ code, severity, title, message, suggestion });
  };
  if (options.checkTools !== false) {
    for (const [command, code, severity] of [
      ['rustc', 'RUST', 'error'],
      ['cargo', 'CARGO', 'error'],
      ['stellar', 'STELLAR_CLI', 'warning'],
    ] as const) {
      try {
        // Fixed executable/arguments, bounded execution; never run project scripts.
        execFileSync(command, ['--version'], {
          timeout: 5000,
          stdio: 'pipe',
          maxBuffer: 65536,
        });
        add(
          `${code}_OK`,
          'info',
          `${command} available`,
          'Executable responds to --version.',
          'Keep the toolchain compatible with your contract SDK.'
        );
      } catch {
        add(
          `${code}_MISSING`,
          severity,
          `${command} unavailable`,
          'Executable is missing, failed or timed out.',
          'Install the tool using the official Stellar/Rust documentation.'
        );
      }
    }
  }
  if (!existsSync(project) || !statSync(project).isDirectory()) {
    add(
      'INVALID_PROJECT_PATH',
      'error',
      'Invalid project directory',
      'The requested directory does not exist.',
      'Pass a local contract directory.'
    );
  } else if (!existsSync(join(project, 'Cargo.toml'))) {
    add(
      'NO_CARGO_TOML',
      'error',
      'Cargo.toml missing',
      'No Cargo manifest was found.',
      'Select the Soroban contract crate directory.'
    );
  } else {
    try {
      const manifestPath = join(project, 'Cargo.toml');
      if (statSync(manifestPath).size > 1024 * 1024)
        throw new Error('oversized manifest');
      const manifest = parse(readFileSync(manifestPath, 'utf8'));
      add(
        'CARGO_TOML_OK',
        'info',
        'Valid Cargo manifest',
        'Cargo.toml parses as TOML.',
        'Review the contract configuration findings below.'
      );
      if (manifest.workspace && !manifest.package) {
        add(
          'WORKSPACE_ROOT',
          'info',
          'Cargo workspace root',
          'This is a virtual workspace, not a contract crate.',
          'Run Doctor against each contract member. Recursive workspace discovery is not implemented.'
        );
      } else {
        const dependencies = manifest.dependencies as
          Record<string, unknown> | undefined;
        const sdk = dependencies?.['soroban-sdk'];
        add(
          sdk ? 'SOROBAN_PROJECT' : 'NOT_SOROBAN',
          sdk ? 'info' : 'warning',
          sdk ? 'Soroban dependency found' : 'Soroban dependency missing',
          sdk
            ? 'soroban-sdk is declared in dependencies.'
            : 'No direct soroban-sdk dependency is declared.',
          'Use a soroban-sdk dependency compatible with your target protocol; workspace-inherited versions are not resolved here.'
        );
        const lib = manifest.lib as Record<string, unknown> | undefined;
        if (
          sdk &&
          (!Array.isArray(lib?.['crate-type']) ||
            !lib['crate-type'].includes('cdylib'))
        ) {
          add(
            'CONTRACT_CRATE_TYPE',
            'error',
            'Contract crate type missing',
            'A Soroban WASM contract must include cdylib in lib.crate-type.',
            'Add [lib] crate-type = ["cdylib", "rlib"].'
          );
        }
        const libPath = typeof lib?.path === 'string' ? lib.path : 'src/lib.rs';
        const relativeLib = relative(project, resolve(project, libPath));
        if (relativeLib.startsWith('..') || isAbsolute(relativeLib)) {
          add(
            'LIB_PATH_OUTSIDE_PROJECT',
            'warning',
            'Library outside project',
            'The configured library path leaves the inspected directory.',
            'Inspect this library separately; Doctor does not read files outside this project.'
          );
        } else if (!existsSync(resolve(project, libPath))) {
          add(
            'CONTRACT_SOURCE_MISSING',
            'error',
            'Library source missing',
            'The configured contract library source does not exist.',
            'Create src/lib.rs or correct lib.path in Cargo.toml.'
          );
        }
        if (
          sdk &&
          !existsSync(join(project, 'tests')) &&
          !existsSync(join(project, 'src/test.rs')) &&
          !existsSync(join(project, 'src/tests.rs'))
        ) {
          add(
            'TEST_LAYOUT_REVIEW',
            'info',
            'Review contract tests',
            'No conventional test directory or test module file found. Inline tests may still exist.',
            'Confirm that contract behavior has tests; this check does not measure test coverage.'
          );
        }
      }
    } catch {
      add(
        'CARGO_TOML_READ_ERROR',
        'error',
        'Cannot parse Cargo.toml',
        'Manifest is unreadable, exceeds 1 MB, or is invalid TOML.',
        'Check file permissions, size and TOML syntax. File contents are not echoed.'
      );
    }
  }
  const summary = {
    errors: findings.filter((f) => f.severity === 'error').length,
    warnings: findings.filter((f) => f.severity === 'warning').length,
    info: findings.filter((f) => f.severity === 'info').length,
  };
  return {
    success: summary.errors === 0,
    projectPath: project,
    findings,
    summary,
  };
}
