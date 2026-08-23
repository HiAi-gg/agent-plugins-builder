import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const projectRoot = path.resolve(__dirname, '../..');
const tmpDir = path.join('/tmp', `doctor-test-${Date.now()}`);
const doctorBin = path.join(
  projectRoot,
  'node_modules',
  '@hiai-gg',
  'agent-plugins-doctor',
  'bin',
  'cli.js',
);

function runDoctor(pluginDir: string): void {
  execFileSync(process.execPath, [doctorBin, 'check', pluginDir], {
    cwd: projectRoot,
    stdio: 'pipe',
  });
}

function generateFromConfig(configContent: string, name: string): string {
  const configPath = path.join(tmpDir, `${name}-config.yml`);
  fs.writeFileSync(configPath, configContent, 'utf-8');
  const pluginDir = path.join(tmpDir, name);
  execFileSync(
    process.execPath,
    [
      'packages/cli/bin/agent-plugins',
      'create',
      '--config',
      configPath,
      '--output',
      pluginDir,
    ],
    { cwd: projectRoot, stdio: 'pipe' },
  );
  return pluginDir;
}

describe('Builder → Doctor contract', () => {
  beforeAll(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('basic plugin passes Doctor', () => {
    // Generate plugin with only name + description flags
    const pluginDir = path.join(tmpDir, 'basic');
    execFileSync(
      process.execPath,
      [
        'packages/cli/bin/agent-plugins',
        'create',
        '--name',
        'basic-plugin',
        '--description',
        'A basic plugin',
        '--output',
        pluginDir,
      ],
      { cwd: projectRoot, stdio: 'pipe' },
    );

    expect(fs.existsSync(path.join(pluginDir, 'plugin.json'))).toBe(true);

    runDoctor(pluginDir);
  });

  test('plugin with skills passes Doctor', () => {
    // Skills cover all optional skill fields: license, compatibility,
    // metadata, allowed-tools.
    const configContent = `
name: skills-plugin
version: 0.1.0
description: Plugin with skills
license: MIT
skills:
  - name: skill-one
    description: First skill
    license: MIT
    compatibility: macos
    body: |
      # Skill One
      Body text for skill one.
  - name: skill-two
    description: Second skill
    metadata:
      key: value
    allowed-tools:
      - bash
      - grep
    body: |
      # Skill Two
      Another body.
`;
    const pluginDir = generateFromConfig(configContent, 'skills-plugin');

    expect(
      fs.existsSync(path.join(pluginDir, 'skills', 'skill-one', 'SKILL.md')),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(pluginDir, 'skills', 'skill-two', 'SKILL.md')),
    ).toBe(true);

    runDoctor(pluginDir);
  });

  test('plugin with MCP servers passes Doctor', () => {
    // All MCP server types: stdio, streamable-http, sse.
    const configContent = `
name: mcp-plugin
version: 0.1.0
description: Plugin with MCP servers
mcp:
  stdio-server:
    type: stdio
    command: node
    args:
      - server.js
  http-server:
    type: streamable-http
    url: https://example.com/mcp
  sse-server:
    type: sse
    url: https://example.com/sse
`;
    const pluginDir = generateFromConfig(configContent, 'mcp-plugin');

    expect(fs.existsSync(path.join(pluginDir, 'mcp.json'))).toBe(true);
    const mcpJson = JSON.parse(
      fs.readFileSync(path.join(pluginDir, 'mcp.json'), 'utf-8'),
    );
    expect(Object.keys(mcpJson.mcpServers)).toEqual([
      'stdio-server',
      'http-server',
      'sse-server',
    ]);

    runDoctor(pluginDir);
  });

  test('plugin with extensions passes Doctor', () => {
    const configContent = `
name: extensions-plugin
version: 0.1.0
description: Plugin with extensions
extensions:
  com.example:
    color: blue
    count: 3
`;
    const pluginDir = generateFromConfig(configContent, 'extensions-plugin');

    expect(
      fs.existsSync(path.join(pluginDir, 'com.example', 'extension.json')),
    ).toBe(true);

    runDoctor(pluginDir);
  });

  test('plugin with README + LICENSE passes Doctor', () => {
    const configContent = `
name: docs-plugin
version: 0.1.0
description: Plugin with README and LICENSE
license: MIT
readme: true
license-file: MIT
`;
    const pluginDir = generateFromConfig(configContent, 'docs-plugin');

    expect(fs.existsSync(path.join(pluginDir, 'README.md'))).toBe(true);
    expect(fs.existsSync(path.join(pluginDir, 'LICENSE'))).toBe(true);

    runDoctor(pluginDir);
  });
});
