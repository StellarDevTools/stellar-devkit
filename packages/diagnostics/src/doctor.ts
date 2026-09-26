/**
 * Project Doctor - Stellar/Soroban Project Diagnostics
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

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

export async function diagnoseProject(projectPath: string): Promise<DoctorResult> {
  const findings: DiagnosticFinding[] = [];

  // Check Rust
  checkRust(findings);

  // Check Cargo
  checkCargo(findings);

  // Check Stellar CLI
  checkStellarCLI(findings);

  // Check project structure
  checkProjectStructure(projectPath, findings);

  const summary = {
    errors: findings.filter(f => f.severity === 'error').length,
    warnings: findings.filter(f => f.severity === 'warning').length,
    info: findings.filter(f => f.severity === 'info').length,
  };

  return {
    success: summary.errors === 0,
    projectPath,
    findings,
    summary,
  };
}

function checkRust(findings: DiagnosticFinding[]): void {
  try {
    const output = execSync('rustc --version', { encoding: 'utf-8', stdio: 'pipe' });
    findings.push({
      code: 'RUST_OK',
      severity: 'info',
      title: 'Rust Installed',
      message: `Found: ${output.trim()}`,
    });
  } catch {
    findings.push({
      code: 'RUST_MISSING',
      severity: 'error',
      title: 'Rust Not Found',
      message: 'Rust compiler is not installed or not in PATH',
      suggestion: 'Install Rust from https://rustup.rs/',
    });
  }
}

function checkCargo(findings: DiagnosticFinding[]): void {
  try {
    const output = execSync('cargo --version', { encoding: 'utf-8', stdio: 'pipe' });
    findings.push({
      code: 'CARGO_OK',
      severity: 'info',
      title: 'Cargo Installed',
      message: `Found: ${output.trim()}`,
    });
  } catch {
    findings.push({
      code: 'CARGO_MISSING',
      severity: 'error',
      title: 'Cargo Not Found',
      message: 'Cargo is not installed or not in PATH',
      suggestion: 'Cargo is included with Rust installation',
    });
  }
}

function checkStellarCLI(findings: DiagnosticFinding[]): void {
  try {
    const output = execSync('stellar --version 2>&1 || soroban --version 2>&1', {
      encoding: 'utf-8',
      stdio: 'pipe',
      shell: true,
    });
    findings.push({
      code: 'STELLAR_CLI_OK',
      severity: 'info',
      title: 'Stellar CLI Installed',
      message: `Found: ${output.trim().split('\n')[0]}`,
    });
  } catch {
    findings.push({
      code: 'STELLAR_CLI_MISSING',
      severity: 'warning',
      title: 'Stellar CLI Not Found',
      message: 'Stellar/Soroban CLI is not installed or not in PATH',
      suggestion: 'Install: cargo install --locked stellar-cli',
    });
  }
}

function checkProjectStructure(projectPath: string, findings: DiagnosticFinding[]): void {
  // Check Cargo.toml
  const cargoTomlPath = join(projectPath, 'Cargo.toml');
  if (!existsSync(cargoTomlPath)) {
    findings.push({
      code: 'NO_CARGO_TOML',
      severity: 'error',
      title: 'Cargo.toml Not Found',
      message: 'No Cargo.toml file found in project root',
      suggestion: 'This does not appear to be a Rust/Soroban project',
    });
    return;
  }

  findings.push({
    code: 'CARGO_TOML_OK',
    severity: 'info',
    title: 'Project Structure Valid',
    message: 'Found Cargo.toml',
  });

  // Check Cargo.toml content for Soroban dependencies
  try {
    const content = readFileSync(cargoTomlPath, 'utf-8');
    if (content.includes('soroban-sdk')) {
      findings.push({
        code: 'SOROBAN_PROJECT',
        severity: 'info',
        title: 'Soroban Project Detected',
        message: 'Found soroban-sdk dependency',
      });
    } else {
      findings.push({
        code: 'NOT_SOROBAN',
        severity: 'warning',
        title: 'Not a Soroban Project',
        message: 'No soroban-sdk dependency found in Cargo.toml',
        suggestion: 'This appears to be a standard Rust project, not a Soroban smart contract',
      });
    }
  } catch {
    findings.push({
      code: 'CARGO_TOML_READ_ERROR',
      severity: 'warning',
      title: 'Cannot Read Cargo.toml',
      message: 'Failed to read Cargo.toml content',
    });
  }

  // Check for src directory
  const srcPath = join(projectPath, 'src');
  if (!existsSync(srcPath)) {
    findings.push({
      code: 'NO_SRC_DIR',
      severity: 'warning',
      title: 'No src/ Directory',
      message: 'Project does not have a src/ directory',
    });
  }
}
