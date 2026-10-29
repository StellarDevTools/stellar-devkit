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
  vi.mocked(core.getInput).mockReturnValue('true');
  vi.mocked(diagnoseProject).mockRejectedValue(new Error('read failed'));
  await run();
  expect(core.setFailed).toHaveBeenCalledWith('read failed');
});

const diagnosticResult = {
  success: false,
  projectPath: '.',
  findings: [
    {
      code: 'TEST',
      severity: 'error' as const,
      title: 'Finding',
      message: 'Context',
    },
  ],
  summary: { errors: 1, warnings: 0, info: 0 },
};

function mockInputs(inputs: Record<string, string>): void {
  vi.mocked(core.getInput).mockImplementation((name) => inputs[name] ?? '');
  vi.mocked(diagnoseProject).mockResolvedValue(diagnosticResult);
}

it.each(['true', 'True', 'TRUE'])(
  'accepts fail-on-error=%s and enforces error failure',
  async (value) => {
    mockInputs({ 'fail-on-error': value, 'check-tools': 'true' });
    await run();
    expect(diagnoseProject).toHaveBeenCalledWith('.', { checkTools: true });
    expect(core.setFailed).toHaveBeenCalledWith('Found 1 error(s)');
  }
);

it.each(['false', 'False', 'FALSE'])(
  'accepts fail-on-error=%s and disables error failure',
  async (value) => {
    mockInputs({ 'fail-on-error': value, 'check-tools': 'true' });
    await run();
    expect(diagnoseProject).toHaveBeenCalledTimes(1);
    expect(core.setFailed).not.toHaveBeenCalled();
  }
);

it.each(['false', 'False', 'FALSE'])(
  'accepts check-tools=%s and disables tool probes',
  async (value) => {
    mockInputs({ 'fail-on-error': 'false', 'check-tools': value });
    await run();
    expect(diagnoseProject).toHaveBeenCalledWith('.', { checkTools: false });
    expect(core.setFailed).not.toHaveBeenCalled();
  }
);

it.each(['true', 'True', 'TRUE'])(
  'accepts check-tools=%s and preserves enabled tool probes',
  async (value) => {
    mockInputs({ 'fail-on-error': 'false', 'check-tools': value });
    await run();
    expect(diagnoseProject).toHaveBeenCalledWith('.', { checkTools: true });
  }
);

it('preserves both true defaults when inputs are absent', async () => {
  mockInputs({});
  await run();
  expect(diagnoseProject).toHaveBeenCalledWith('.', { checkTools: true });
  expect(core.setFailed).toHaveBeenCalledWith('Found 1 error(s)');
});

it.each([
  ['fail-on-error', 'tru'],
  ['check-tools', 'fals'],
  ['fail-on-error', 'TrUe'],
  ['check-tools', 'FALSEE'],
])('rejects invalid %s=%s before diagnostics', async (name, value) => {
  mockInputs({ 'fail-on-error': 'true', 'check-tools': 'true', [name]: value });
  await run();
  expect(core.setFailed).toHaveBeenCalledTimes(1);
  expect(core.setFailed).toHaveBeenCalledWith(expect.stringContaining(name));
  expect(diagnoseProject).not.toHaveBeenCalled();
  expect(core.setOutput).not.toHaveBeenCalled();
  expect(core.info).not.toHaveBeenCalled();
});
