# Agent Plugins Builder

> **Build, validate, and use portable Agent Plugins** — one CLI to create, migrate, and package Agent Plugins from existing agent setups, skills, and MCP servers.

[![CI](https://github.com/HiAi-gg/agent-plugins-builder/actions/workflows/ci.yml/badge.svg)](https://github.com/HiAi-gg/agent-plugins-builder/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@hiai-gg/agent-plugins-builder)](https://www.npmjs.com/package/@hiai-gg/agent-plugins-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Runtime-Bun-black)](https://bun.sh/)

## What It Is

Agent Plugins Builder is a CLI for creating, migrating, and packaging portable [Agent Plugins](https://agent-plugins.org/) — the vendor-neutral format that bundles Agent Skills and MCP servers for use across compatible AI coding agents.

Multiple AI coding agents — VS Code, Cursor, GitHub Copilot, ChatGPT/Codex, Claude Code, OpenCode — each have their own configuration formats for skills, instructions, and MCP servers. Builder converts between these formats and the portable Agent Plugins standard, so you can write once and use across compatible clients.

## Why Use It

- **Write once, use everywhere** — one plugin works in VS Code, Cursor, GitHub Copilot, ChatGPT/Codex, Claude Code, OpenCode, and Kiro.
- **Migrate what you have** — convert existing Claude Code, Cursor, Codex, OpenCode, or VS Code/Copilot setups into portable plugins.
- **Declarative and reproducible** — define a plugin in `plugin.yml`; Builder generates the full plugin directory. The 13 plugins in [HiAI's collection](https://github.com/HiAi-gg/agent-plugins) are built this way (see [The Collection](https://github.com/HiAi-gg/agent-plugins-builder#the-collection)).
- **Spec-valid output** — generated plugins validate against the Agent Plugins v1.0.0 specification, and hand off to [Agent Plugin Doctor](https://github.com/HiAi-gg/agent-plugins-doctor) for deep validation and security auditing.

## Install

```bash
# Install once, globally (npm or bun)
npm install -g @hiai-gg/agent-plugins-builder
bun install -g @hiai-gg/agent-plugins-builder

# Or run without installing — pinned to the current release (npx or bunx)
npx @hiai-gg/agent-plugins-builder@0.0.9 init
bunx @hiai-gg/agent-plugins-builder@0.0.9 init
```

Once installed, the same commands run as `agent-plugins` (e.g. `agent-plugins init`).

## Create

```bash
# Interactive wizard — metadata, skills, MCP servers, README/LICENSE
npx @hiai-gg/agent-plugins-builder@0.0.9 init

# From a declarative config file (supports skills, MCP, metadata, README, LICENSE)
npx @hiai-gg/agent-plugins-builder@0.0.9 create --config plugin.yml --output ./my-plugin

# From flags — combine skills and MCP in one plugin
npx @hiai-gg/agent-plugins-builder@0.0.9 create --name project-memory \
  --skill create-plan --skill report-progress \
  --mcp-type stdio --mcp-command "node server.js" --mcp-name my-server \
  --version 0.1.0 --author-name "Jane Doe" --license MIT
```

## Examples

Example `plugin.yml`:

```yaml
name: my-plugin
version: 0.1.0
description: A test plugin
author:
  name: Test Author
license: MIT
skills:
  - name: test-skill
    description: A test skill
    body: |
      # Test Skill
      This is the body.
mcp:
  my-server:
    type: stdio
    command: node
    args: [server.js]
readme: true
license-file: MIT
```

```bash
# Migrate from an existing agent setup
npx @hiai-gg/agent-plugins-builder@0.0.9 migrate ./my-project --from claude

# Non-interactive / CI creation
npx @hiai-gg/agent-plugins-builder@0.0.9 init --yes --name my-plugin
```

## Validate

```bash
# Validate and package as an archive
npx @hiai-gg/agent-plugins-builder@0.0.9 package ./my-plugin

# Hand off to Agent Plugin Doctor for deep validation and security auditing
npx @hiai-gg/agent-plugins-doctor@0.0.6 check ./my-plugin
```

## The Collection

[HiAI's Agent Plugins collection](https://github.com/HiAi-gg/agent-plugins) ships **13 plugins** — github, agent-browser, context7, firecrawl, redis, sentry, supabase, figma, cloudflare, notion, docker, kubernetes, postgresql — all built with this CLI. Each plugin is generated from a declarative `plugin.yml`, and the collection's CI pins the exact Builder release that produced the checked-in artifacts, regenerates all 13 plugins, and fails on any drift — a concrete reproducibility check you can run locally:

```bash
git clone https://github.com/HiAi-gg/agent-plugins.git
cd agent-plugins
./scripts/repro-check.sh   # regenerates all 13 plugins; fails on drift
```

For validation, [Agent Plugin Doctor](https://github.com/HiAi-gg/agent-plugins-doctor) is the canonical validator and security auditor — Builder generates, Doctor checks.

## What It Does

### Interactive wizard

`init` walks you through creating a plugin step by step — metadata, skills (add as
many as you like), MCP servers (stdio, streamable-http, or sse), README/LICENSE,
and output directory — then previews the files before generating:

```bash
agent-plugins init
```

All prompts have sensible defaults you can accept with Enter. The plugin name is
validated against the Agent Plugins name pattern. A skill body file is optional —
press Enter to get a template body.

Non-interactive / CI usage:

```bash
# Use defaults (one example skill, README + LICENSE)
agent-plugins init --yes --name my-plugin

# Same as --yes
agent-plugins init --non-interactive --name my-plugin

# Declarative config — no prompts at all
agent-plugins init --config plugin.yml
```

`--yes` / `--non-interactive` also accept `--description`, `--version`,
`--author-name`, `--author-email`, and `--license` flags. The output directory
defaults to `./<plugin-name>` (or the positional argument).

### Create plugins from scratch

```bash
# Legacy single-purpose forms
agent-plugins create --name project-memory --skills-only
agent-plugins create --name my-mcp-plugin --mcp-only --mcp-type stdio --mcp-command "node server.js"
```

### Migrate from existing agent setups

```bash
# Auto-detect source format
agent-plugins migrate ./my-project

# Specify source format
agent-plugins migrate ./my-project --from claude
agent-plugins migrate ./my-project --from cursor
agent-plugins migrate ./my-project --from codex
agent-plugins migrate ./my-project --from opencode
agent-plugins migrate ./my-project --from vscode
```

Migration reports what is portable, what is client-specific, and what is unsupported:

```text
Portable:
  ✓ 7 skills
  ✓ 2 MCP servers

Client-specific (not migrated):
  ⚠ 3 hooks
  ⚠ 2 custom agents

Unsupported:
  ✗ lifecycle completion gate
```

### Validate and inspect plugins

```bash
agent-plugins package ./my-plugin          # validate and package as <name>.zip
agent-plugins package ./my-plugin --format tar.gz --output ./dist   # gzipped tarball
agent-plugins package ./my-plugin --format dir --output ./dist      # directory copy
agent-plugins inspect ./my-plugin          # show structure
agent-plugins inspect ./my-plugin --json   # machine-readable output
```

## Supported Migration Sources

| Source            | Detection                    | Portable components       | Status    |
| ----------------- | ---------------------------- | ------------------------- | --------- |
| Claude Code       | `CLAUDE.md` or `.claude/`    | Skills, MCP, instructions | Supported |
| Cursor            | `.cursor/`                   | Skills, MCP               | Supported |
| Codex             | `AGENTS.md` or `config.toml` | Instructions, MCP (TOML)  | Supported |
| OpenCode          | `AGENTS.md` or `.opencode/`  | Skills, MCP, instructions | Supported |
| VS Code / Copilot | `.github/` or `.vscode/`     | Skills, MCP, instructions | Supported |

See [Migration Sources](https://github.com/HiAi-gg/agent-plugins-builder/blob/main/docs/MIGRATION_SOURCES.md) for details on what each adapter migrates and what it cannot.

## Standards

This project targets the [Agent Plugins specification v1.0.0](https://agent-plugins.org/).

Agent Plugin Skills follow the [Agent Skills specification](https://agentskills.io/specification).

MCP server configuration follows the [Model Context Protocol](https://modelcontextprotocol.io/) specification.

## Compatible Clients

Agent Plugins v1.0.0 is supported by:

| Client          | Skills | MCP transports              |
| --------------- | ------ | --------------------------- |
| VS Code         | ✅     | stdio, Streamable HTTP, SSE |
| Cursor          | ✅     | stdio, Streamable HTTP, SSE |
| GitHub Copilot  | ✅     | stdio, Streamable HTTP, SSE |
| ChatGPT & Codex | ✅     | stdio, Streamable HTTP      |
| Kiro            | ✅     | stdio, Streamable HTTP, SSE |

See [Compatibility](https://github.com/HiAi-gg/agent-plugins-builder/blob/main/docs/COMPATIBILITY.md) for details and evidence levels.

## How It Works

```
Claude / Cursor / Codex / OpenCode / VS Code
                ↓
      Agent Plugins Builder (source adapter)
                ↓
        PortablePlugin (canonical model)
                ↓
       Agent Plugins format (generator)
                ↓
   plugin.json + skills/ + mcp.json
```

All migration adapters produce a source-agnostic `PortablePlugin` intermediate representation. The generator then emits a valid Agent Plugin directory. This means adding new source formats does not require pairwise conversions.

See [Architecture](https://github.com/HiAi-gg/agent-plugins-builder/blob/main/docs/ARCHITECTURE.md) for details.

## Limitations

- Targets Agent Plugins v1.0.0 only. Future spec versions are not yet supported.
- Client-specific hooks, custom agents, and lifecycle handlers are not migrated — they are reported in the migration summary.
- Extension data is preserved opaquely but not validated.
- No OAuth or credential management (by Agent Plugins spec design).
- MCP-only plugins require at least one server. Empty `mcpServers` is valid per spec but may not be useful.
- OpenCode `config.toml` parsing uses a lightweight TOML parser; complex nested TOML structures may not be fully supported.

## Documentation

- [Architecture](https://github.com/HiAi-gg/agent-plugins-builder/blob/main/docs/ARCHITECTURE.md) — package design, data flow, adapter pattern
- [Migration Sources](https://github.com/HiAi-gg/agent-plugins-builder/blob/main/docs/MIGRATION_SOURCES.md) — what each adapter migrates
- [Spec Support](https://github.com/HiAi-gg/agent-plugins-builder/blob/main/docs/AGENT_PLUGINS_SPEC_SUPPORT.md) — Agent Plugins v1.0.0 coverage
- [Compatibility](https://github.com/HiAi-gg/agent-plugins-builder/blob/main/docs/COMPATIBILITY.md) — client support details
- [References](https://github.com/HiAi-gg/agent-plugins-builder/blob/main/docs/REFERENCES.md) — primary sources
- [Roadmap](https://github.com/HiAi-gg/agent-plugins-builder/blob/main/docs/ROADMAP.md) — planned work

## Development

```bash
bun install
bun run lint
bun run typecheck
bun run test
bun run build
```

## Contributing

See [CONTRIBUTING.md](https://github.com/HiAi-gg/agent-plugins-builder/blob/main/CONTRIBUTING.md).

## Security

See [SECURITY.md](https://github.com/HiAi-gg/agent-plugins-builder/blob/main/SECURITY.md) for vulnerability reporting.

## License

[MIT](https://github.com/HiAi-gg/agent-plugins-builder/blob/main/LICENSE) — Copyright © 2026 HiAI

---

This project is independent and is not affiliated with or endorsed by the Agent Plugins specification maintainers or any supported client vendors.
