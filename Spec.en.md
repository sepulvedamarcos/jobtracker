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
- `ports/IJobRepository.ts`
- `use-cases/JobService.ts`
- `use-cases/ApplicationService.ts`

Responsibilities:

- model business data,
- define persistence interfaces,
- centralize application logic.

### `infrastructure`

Contains adapters and technical services:

- `config/paths.ts`
- `storage/JsonJobRepository.ts`
- `InMemoryJobRepository.ts`
- `adapters/cli/app.tsx`
- `adapters/tui/*`

Responsibilities:

- handle files,
- build the UI,
- connect domain with runtime.

### `services`

Shared utilities and helper functions:

- `pagination.ts`
- `list-labels.ts`
- `keywords.ts`
- `application-matcher.ts`

## Technology Stack

| Component | Technology |
|-----------|------------|
| Language | TypeScript |
| Runtime | Node.js |
| UI | React + Ink |
| CLI | Commander |
| Path management | env-paths |
| Data format | JSON |

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

## Persistence

`src/infrastructure/config/paths.ts` creates and normalizes user folders for:

- `jobs.json` — scanned job listings
- `keywords.json` — search keywords
- `applications.json` — tracked applications
- `plugins/` — plugin configurations

Current strategy: store everything locally and keep access isolated behind `IJobRepository`.

## Design Patterns

- **Screaming Architecture**: the folder structure reflects the system's purpose
- **Repository**: data access is behind an interface
- **Separation of Concerns**: UI must not contain persistence logic
- **Single Responsibility**: each module has one specific task
- **Clean Architecture**: domain logic independent of frameworks

## Expected Flow

1. App starts from `adapters/cli/app.tsx`
2. `Splash` is rendered
3. `MainLayout` mounts the main interface
4. Layout queries services or repositories based on execution mode
5. Data is presented in list and detail views
6. User actions are saved to local JSON

## UI Components

### MainLayout

Main container with three panels:

- **JobList** (left): Shows scanned job listings
- **ApplicationsPanel** (top-right): Shows tracked applications
- **DetailPanel** (bottom-right): Shows selected job details

### Modals

- **KeywordsModal**: Edit search keywords (F3 or K)
- **ApplicationDetailModal**: View/delete application details

## Keyboard Shortcuts

| Key | Panel | Action |
|-----|-------|--------|
| Tab | Global | Switch between panels |
| ↑/↓ | Jobs/Applications | Navigate list |
| Enter | Jobs | Copy job to applications |
| Enter | Applications | Open detail modal |
| Enter | Detail | Open link in browser |
| Esc | Modal | Close modal |
| Supr | Application Detail | Delete application |
| PageUp/PageDown | Lists | Paginate |
| K | Global | Toggle keywords modal |
| Q | Global | Quit |

## Current State

Functional base exists, with parts still in scaffold:

- [x] Splash screen
- [x] MainLayout with three panels
- [x] Keywords modal
- [x] Application detail modal with delete
- [x] JSON persistence through repositories
- [ ] Real scan integration with plugins
- [ ] Application status editing

## Design Decisions

- Keep app as TUI rather than traditional GUI
- Use local file storage for simplicity and portability
- Separate domain and infrastructure for future stack changes
- Document each important change in this specification and changelog