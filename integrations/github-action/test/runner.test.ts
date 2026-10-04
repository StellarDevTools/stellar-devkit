import { beforeEach, expect, it, vi } from 'vitest';
import * as core from '@actions/core';
import { diagnoseProject } from '@stellar-devkit/diagnostics/doctor';
import { run } from '../src/runner';
vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  setOutput: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  setFailed: vi.fn(),
}));
vi.mock('@stellar-devkit/diagnostics/doctor', () => ({
  diagnoseProject: vi.fn(),
}));
beforeEach(() => vi.clearAllMocks());
it.each([
  [true, 1, 0, true],
  [false, 1, 0, false],
  [true, 0, 2, false],
])(
  'handles fail-on-error=%s with %s errors and %s warnings',
  async (fail, errors, warnings, expectedFailure) => {
    vi.mocked(core.getInput).mockImplementation(
      (name) =>
        ({
          'project-path': '.',
          'fail-on-error': String(fail),
          'check-tools': 'false',
        })[name] || ''
    );
    const result = {
      success: errors === 0,
      projectPath: '.',
      findings: [],
      summary: { errors, warnings, info: 0 },
    };
    // Real findings accompany summary counts.
    result.findings = Array.from({ length: errors + warnings }, (_, i) => ({
      code: 'TEST',
      severity: i < errors ? 'error' : 'warning',
      title: 'Finding',
      message: 'Context',
    })) as never[];
    vi.mocked(diagnoseProject).mockResolvedValue(result);
    await run();
    expect(core.setFailed).toHaveBeenCalledTimes(expectedFailure ? 1 : 0);
    expect(core.setOutput).toHaveBeenCalledWith(
      'report',
      JSON.stringify(result)
    );
    expect(diagnoseProject).toHaveBeenCalledWith('.', { checkTools: false });
  }
);
it('fails on unexpected diagnostic failures regardless of policy', async () => {
  vi.mocked(diagnoseProject).mockRejectedValue(new Error('read failed'));
  await run();
  expect(core.setFailed).toHaveBeenCalledWith('read failed');
});
