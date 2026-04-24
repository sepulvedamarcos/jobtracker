# Architectural Specification: JobTracker

<p align="center">
  <a href="./Spec.md">Español</a> ·
  <a href="./Spec.en.md"><strong>English</strong></a>
</p>

This document describes the technical foundation and direction of the JobTracker project.

## Objective

Build a cross-platform TUI for job search and tracking, with an experience similar to TrabajandoScanner but implemented in **Node.js + TypeScript** and prepared to grow toward other languages or environments.

## Layer Architecture

### `core`

Contains the domain and main contracts:

- `entities/Job.ts`
- `entities/PluginMetadata.ts`
- `ports/IJobRepository.ts`
- `use-cases/JobService.ts`
- `use-cases/ApplicationService.ts`
- `use-cases/plugins/*`

Responsibilities:

- model business data,
- define persistence interfaces,
- centralize application logic.

### `infrastructure`

Contains adapters and technical services:

- `config/paths.ts`
- `storage/JsonJobRepository.ts`
- `adapters/cli/app.tsx`
- `adapters/tui/*`
- `plugins/*`

Responsibilities:

- handle files,
- build the UI,
- connect domain with runtime.

### `services`

Shared utilities and helper functions:

- `keywords.ts` — keyword management
- `list-labels.ts` — list label formatting
- `pagination.ts` — pagination
- `application-matcher.ts` — application matching

## Technology Stack

| Component | Technology |
|-----------|------------|
| Language | TypeScript |
| Runtime | Node.js |
| UI | React + Ink |
| CLI | Commander |
| Path management | env-paths |
| Data format | JSON |
| Compression | JSZip, adm-zip, unzipper |

## Third-party Tools

JobTracker validates required tools for plugins at startup:

| Tool | Usage | Verification |
|------|-------|--------------|
| Playwright | Plugin scraper | Check installation and browsers |
| Node.js | Runtime | Check version >= 18 |

Validation runs on startup and reports warnings if tools are missing.

## Domain Models

### Job

Represents a scanned job listing.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `keyword` | string | Search keyword that found this job |
| `title` | string | Job title |
| `company` | string | Company name |
| `date` | string | Relative date text (e.g., "2 days ago") |
| `link` | string | URL to the job posting |
| `source` | string | Job board source (LinkedIn, Indeed, etc.) |
| `scannedAt` | string | ISO timestamp of scan |

### AppliedJob

Represents a user's application or tracked job.

| Field | Type | Description |
|-------|------|-------------|
| `link` | string | URL to the job posting |
| `title` | string | Job title |
| `company` | string | Company name |
| `keyword` | string | Search keyword that found this job |
| `source` | string | Job board source |
| `sourceDateText` | string | Original date text from source |
| `sourceScannedAt` | string | When originally scanned |
| `status` | ApplicationStatus | Current application status |
| `appliedAt` | string | ISO timestamp of application |
| `notes` | string | User notes |
| `lastUpdate` | string | ISO timestamp of last update |

### ApplicationStatus

Predefined states for an application:

| Value | Status | Description |
|-------|--------|-------------|
| 0 | Interested | User is interested |
| 1 | Applied | Application sent |
| 2 | Interviewing | In interview process |
| 3 | Rejected | Application rejected |

### PluginMetadata

Plugin scraper metadata.

| Field | Type | Description |
|-------|------|-------------|
| `pluginId` | string | Unique plugin identifier |
| `name` | string | Human-readable plugin name |
| `pluginVersion` | string | Plugin version |
| `author` | string | Plugin author |
| `mainFile` | string | Main scraper file |
| `enabled` | boolean | Whether plugin is enabled |

## Persistence

`src/infrastructure/config/paths.ts` creates and normalizes user folders for:

- `jobs.json` — scanned job listings
- `keywords.json` — search keywords
- `applications.json` — tracked applications
- `plugins/` — installed plugins
- `logs/` — log files

Current strategy: store everything locally and keep access isolated behind `IJobRepository`.

## Design Patterns

- **Screaming Architecture**: the folder structure reflects the system's purpose
- **Repository**: data access is behind an interface
- **Separation of Concerns**: UI must not contain persistence logic
- **Single Responsibility**: each module has one specific task
- **Clean Architecture**: domain logic independent of frameworks
- **Hexagonal Architecture**: ports and adapters to isolate the core

## Expected Flow

1. App starts from `adapters/cli/app.tsx`
2. CLI arguments are parsed (Commander)
3. If special flags are present (--addKey, --delKey, --addPlugin), execute and exit
4. If normal mode, render `Splash`
5. `MainLayout` mounts the main interface
6. Layout queries services or repositories based on execution mode
7. User actions are saved to local JSON

## UI Components

### MainLayout

Main container with three panels:

- **JobList** (left): Scanned job listings (orange)
- **ApplicationsPanel** (top-right): Tracked applications (orange)
- **DetailPanel** (bottom-right): Selected job details

### Modals

- **KeywordsModal** (K): Edit search keywords
- **PluginsModal** (P): Manage plugins
- **ConfirmScanModal**: Confirm before scanning
- **ScanProgressModal**: Scan progress
- **ApplicationDetailModal**: View/delete application details

## CLI Options

### npm Scripts

```bash
npm run dev              # Full TUI
npm run dev:find        # TUI with auto-scan
npm run dev:add -- "kw" # Add keyword
npm run dev:del -- "kw" # Delete keyword
npm run dev:silent      # No TUI
npm run dev:plugin      # Plugin development mode
npm run dev:plugin:find # Plugin + auto-scan
```

### Direct Flags

| Flag | Description |
|------|-------------|
| `--addKey <kw>` | Add keyword and exit |
| `--delKey <kw>` | Delete keyword and exit |
| `--addPlugin <path>` | Install plugin from path |
| `--delPlugin <id>` | Delete plugin |
| `--find` | Scan on start |
| `--silent` | No TUI |
| `--noSplash` | Skip splash screen |
| `--help` | Show help |

## Semantic Versioning

JobTracker uses **Conventional Commits** + **standard-version** to automate versioning and changelog generation.

### Key Concepts

Semantic versioning follows the format `MAJOR.MINOR.PATCH`:

| Level | Increment | Example | When to use |
|-------|-----------|---------|-------------|
| **MAJOR** | X.0.0 | 0.1.0 → 1.0.0 | Breaking changes |
| **MINOR** | x.Y.0 | 0.0.2 → 0.1.0 | Backward-compatible features |
| **PATCH** | x.x.Y | 0.0.2 → 0.0.3 | Bug fixes |

### Conventional Commits

Commit messages follow the format: `<type>(<scope>): <description>`

Supported types:

| Type | Description | Generates version |
|------|-------------|-------------------|
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |
| `docs` | Documentation | PATCH |
| `chore` | Maintenance | No (except release) |
| `refactor` | Refactoring | No |
| `test` | Tests | No |
| `perf` | Performance | PATCH |
| `ci` | CI/CD | No |

### Available Scripts

```bash
# Automatic versioning (analyzes commits since last tag)
npm run release

# Manual versioning
npm run release:patch  # 0.0.2 → 0.0.3
npm run release:minor  # 0.0.2 → 0.1.0
npm run release:major  # 0.0.2 → 1.0.0
```

### Additional Commands

```bash
# Commit with Conventional Commits (interactive)
npm run commit

# Manual commit
git commit -m "feat(cli): add --addPlugin command"
```

### How It Works

```
1. You run: npm run release:patch
2. standard-version analyzes commits since last tag (v0.0.1)
3. Generates: v0.0.2 with automatic changelog
4. Creates tag: git tag v0.0.2
5. Updates CHANGELOG.md
6. Updates package.json version
```

### Important: Commits Since Last Tag

**Only commits made AFTER the last tag are included in the analysis.**

```
v0.0.1 ───► v0.0.2
   ↑           ↑
   │           └─ Only commits between tags
   └─ First tag (groups ALL previous history)
```

In practice:
- `v0.0.1` grouped all commits from project creation
- `v0.0.2` grouped all commits from new features
- For `v0.0.3`, only commits made after `v0.0.2` will be considered

### Automatic Hooks

Husky is configured to validate commits:

- `pre-commit`: Checks code style
- `commit-msg`: Validates Conventional Commits format

## Keyboard Shortcuts

### Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate between records |
| `Tab` | Switch panels (Jobs → Applications → Detail) |
| `PageUp` / `PageDown` | Paginate |

### Quick Actions

| Key | Panel | Action |
|-----|-------|--------|
| `Enter` | Jobs | Copy job to applications |
| `Enter` | Applications | Open application detail |
| `Enter` | Detail | Open link in browser |
| `Supr` | Detail Modal | Delete application |

### Global Functions

| Key | Action |
|-----|--------|
| `S` | Start scan with plugins |
| `K` | Open keywords modal |
| `P` | Open plugins panel |
| `Q` | Exit application |

### Keywords Modal (K)

| Key | Action |
|-----|--------|
| `I` | Insert new keyword |
| `Enter` | Save (in insert mode) |
| `Supr` / `Del` | Delete selected keyword |
| `Esc` | Close modal |

### Plugins Modal (P)

| Key | Action |
|-----|--------|
| `A` | Add plugin (enter path) |
| `E` | Delete selected plugin |
| `Enter` | Install plugin |
| `Esc` | Close modal |

## Current State

The project has a complete functional base:

- [x] Splash screen
- [x] MainLayout with three panels
- [x] Keywords modal (K)
- [x] Plugins modal (P)
- [x] Application detail modal with delete
- [x] Scan confirmation modal
- [x] Scan progress modal
- [x] JSON persistence through repositories
- [x] Plugin system functional
- [x] Parallel plugin execution
- [x] Complete CLI with all flags
- [x] Third-party tool validation
- [ ] Application status editing
- [ ] Application history by status

## Design Decisions

- Keep app as TUI rather than traditional GUI
- Use local file storage for simplicity and portability
- Separate domain and infrastructure for future stack changes
- Document each important change in this specification and changelog
- Plugin system is extensible, allows adding new scrapers without modifying core