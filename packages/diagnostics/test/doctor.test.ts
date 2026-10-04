import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { diagnoseProject } from '../src/doctor';
vi.mock('node:child_process', () => ({ execFileSync: vi.fn() }));
const dirs: string[] = [];
function fixture(manifest?: string, source = true) {
  const path = mkdtempSync(join(tmpdir(), 'stellar-doctor-'));
  dirs.push(path);
  if (manifest !== undefined) writeFileSync(join(path, 'Cargo.toml'), manifest);
  if (source) {
    mkdirSync(join(path, 'src'));
    writeFileSync(join(path, 'src/lib.rs'), '');
  }
  return path;
}
const contract =
  '[package]\nname="hello"\nversion="0.1.0"\n[dependencies]\nsoroban-sdk="22"\n[lib]\ncrate-type=["cdylib", "rlib"]';
afterEach(() => {
  dirs
    .splice(0)
    .forEach((path) => rmSync(path, { recursive: true, force: true }));
  vi.clearAllMocks();
});
describe('Doctor manifest diagnostics', () => {
  it('accepts a valid contract without executing tools when disabled', async () => {
    const result = await diagnoseProject(fixture(contract), {
      checkTools: false,
    });
    expect(result.success).toBe(true);
    expect(result.findings.map((f) => f.code)).toContain('SOROBAN_PROJECT');
    expect(execFileSync).not.toHaveBeenCalled();
  });
  it.each([
    [undefined, true, 'NO_CARGO_TOML'],
    ['[bad', true, 'CARGO_TOML_READ_ERROR'],
    ['[package]\nname="standard"\n# soroban-sdk', true, 'NOT_SOROBAN'],
    [contract.replace('"cdylib", ', ''), true, 'CONTRACT_CRATE_TYPE'],
    [contract, false, 'CONTRACT_SOURCE_MISSING'],
    [contract + '\npath="../outside.rs"', true, 'LIB_PATH_OUTSIDE_PROJECT'],
    ['[workspace]\nmembers=["contracts/*"]', false, 'WORKSPACE_ROOT'],
    [contract, true, 'TEST_LAYOUT_REVIEW'],
  ])('detects %s (%#)', async (manifest, source, code) => {
    const result = await diagnoseProject(fixture(manifest, source), {
      checkTools: false,
    });
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code, suggestion: expect.any(String) }),
      ])
    );
  });
  it('handles a missing directory', async () => {
    expect(
      (await diagnoseProject(join(fixture(), 'missing'), { checkTools: false }))
        .findings[0]?.code
    ).toBe('INVALID_PROJECT_PATH');
  });
  it('uses only fixed, bounded executable probes and distinguishes CLI warnings', async () => {
    vi.mocked(execFileSync).mockImplementation(() => {
      throw new Error('unavailable');
    });
    const result = await diagnoseProject(fixture(contract));
    expect(result.summary.errors).toBe(2);
    expect(result.summary.warnings).toBe(1);
    expect(execFileSync).toHaveBeenCalledWith(
      'rustc',
      ['--version'],
      expect.objectContaining({ timeout: 5000 })
    );
    expect(result.findings.map((f) => f.code)).toEqual(
      expect.arrayContaining([
        'RUST_MISSING',
        'CARGO_MISSING',
        'STELLAR_CLI_MISSING',
      ])
    );
  });
  it('reports installed tools without echoing their output', async () => {
    vi.mocked(execFileSync).mockReturnValue('untrusted tool output' as never);
    const result = await diagnoseProject(fixture(contract));
    expect(result.findings.map((f) => f.code)).toEqual(
      expect.arrayContaining(['RUST_OK', 'CARGO_OK', 'STELLAR_CLI_OK'])
    );
    expect(JSON.stringify(result)).not.toContain('untrusted tool output');
  });
});
