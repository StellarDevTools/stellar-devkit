import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const workspaceRoot = resolve(import.meta.dirname, '../../..');
const serverPath = resolve(workspaceRoot, 'integrations/mcp/dist/index.js');

const parsedText = (result: Awaited<ReturnType<Client['callTool']>>) => {
  const content = result.content[0];
  if (!content || content.type !== 'text')
    throw new Error('Expected one text MCP content item.');
  return JSON.parse(content.text) as Record<string, unknown>;
};

describe('packaged MCP server over stdio', () => {
  const client = new Client({ name: 'stellar-devkit-smoke', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    cwd: workspaceRoot,
    stderr: 'pipe',
  });
  let stderr = '';

  beforeAll(async () => {
    transport.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    await client.connect(transport);
  });

  afterAll(async () => {
    await client.close();
    expect(stderr).toBe('');
  });

  it('initializes and lists the packaged tool catalog', async () => {
    expect(client.getServerVersion()).toMatchObject({
      name: 'stellar-devkit',
      version: '0.1.0',
    });
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(9);
    expect(tools.map((tool) => tool.name)).toContain('stellar_decode_xdr');
    expect(
      tools.every((tool) => tool.inputSchema.additionalProperties === false)
    ).toBe(true);
  });

  it('calls deterministic Doctor and error-explanation tools', async () => {
    const doctor = await client.callTool({
      name: 'stellar_diagnose_project',
      arguments: { path: 'examples/doctor-contract' },
    });
    expect(doctor.isError).not.toBe(true);
    expect(parsedText(doctor)).toMatchObject({ success: true });

    const explanation = await client.callTool({
      name: 'stellar_explain_error',
      arguments: { error: 'txBadAuth' },
    });
    expect(explanation.isError).not.toBe(true);
    expect(parsedText(explanation)).toHaveProperty('context');
  });

  it('returns protocol-compatible errors for bad arguments and failed tools', async () => {
    const malformed = await client.callTool({
      name: 'stellar_decode_xdr',
      arguments: {},
    });
    expect(malformed.isError).toBe(true);
    expect(parsedText(malformed)).toMatchObject({
      success: false,
      error: { code: 'TOOL_ERROR' },
    });

    const failed = await client.callTool({
      name: 'stellar_decode_xdr',
      arguments: { xdr: 'invalid-xdr' },
    });
    expect(failed.isError).toBe(true);
    expect(parsedText(failed)).toMatchObject({
      success: false,
      error: { code: 'TOOL_FAILED' },
    });

    const unknown = await client.callTool({
      name: 'stellar_not_a_tool',
      arguments: {},
    });
    expect(unknown.isError).toBe(true);
    expect(parsedText(unknown)).toMatchObject({
      success: false,
      error: { code: 'UNKNOWN_TOOL' },
    });
  });
});
