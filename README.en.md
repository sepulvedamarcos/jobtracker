# JobTracker 🚀

[Español](./README.md)

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Ink-000000?logo=react&logoColor=61DAFB" alt="Ink" />
  <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="GPLv3" />
</p>

**JobTracker** is a TUI for job search and tracking that centralizes listings, keywords, and applications in one fast terminal interface.

*The tool that helps you stay in control of your job search.*

## Why JobTracker?

Instead of opening multiple tabs and re-filtering the same job boards again and again, JobTracker gives you a single, organized, keyboard-driven view.

- **Fast and lightweight**: built with React + Ink for a fast console experience.
- **Extensible by design**: plugin system to add new job boards.
- **Your data on your machine**: all information stored locally in JSON.
- **Productivity first**: scanning, keywords, applications and plugins as part of one system.

## What makes it different

- **One single place**: all job listings from different portals in one unified list.
- **Automatic keywords**: search with your configured words across all plugins.
- **Application tracking**: mark where you applied and its status.
- **Third-party plugins**: any developer can create new scrapers.

## Architecture

JobTracker follows pragmatic engineering principles:

- **Clean Architecture**: separation between business logic and infrastructure.
- **Screaming Architecture**: the project structure reflects its purpose.
- **Hexagonal Architecture**: ports and adapters to isolate the core.
- **Repository Pattern**: data access behind interfaces.

## Screenshots

### Splash
Startup screen with version and status indicators.

### Main environment
Three-panel view with keyboard navigation.

### Keywords dialog
Modal to manage search keywords.

## Hotkeys

### Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate between records in the active panel |
| `Tab` | Switch between panels (Jobs → Applications → Detail) |
| `PageUp` / `PageDown` | Paginate in the active panel |

### Quick actions

| Key | Panel | Action |
|-----|-------|--------|
| `Enter` | Jobs | Copy job to applications |
| `Enter` | Applications | Open application detail |
| `Enter` | Detail | Open job link in browser |
| `Supr` | Detail Modal | Delete selected application |

### Global functions

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
| `Enter` | Save keyword (in insert mode) |
| `Supr` / `Del` | Delete selected keyword |
| `Esc` | Close modal |

### Plugins Modal (P)

| Key | Action |
|-----|--------|
| `A` | Add plugin (enter .scrapper path) |
| `E` | Delete selected plugin |
| `Enter` | Install plugin (in install mode) |
| `Esc` | Close modal |

## CLI Options

### Global installation

Once published, you can install JobTracker as an npm package:

```bash
npm install -g sepulvedamarcos-jobtracker
jobtracker --help
```

### Global usage

```bash
# View help
jobtracker --help

# Auto-scan on start
jobtracker --find

# Without splash screen
jobtracker --noSplash

# Add keyword
jobtracker --addKey "python"

# Delete keyword
jobtracker --delKey "python"

# Silent mode (scan without TUI)
jobtracker --silent

# Install plugin from .scrapper file
jobtracker --addPlugin "/path/to/plugin.scrapper"
```

### Local installation (development)

```bash
npm install
npm run dev
```

### Local usage

```bash
# Full TUI
npm run dev

# With auto-scan on start
npm run dev:find

# Add keyword without entering TUI
npm run dev:add -- "python"

# Delete keyword without entering TUI
npm run dev:del -- "python"

# Silent mode (without TUI)
npm run dev:silent

# Print stored jobs
npm run print:jobs

# Plugin management (development)
npm run dev:plugin          # Open TUI with dev plugins mode
npm run dev:plugin:find     # Plugin + auto-scan
```

## Plugins

JobTracker is **extensible**. You can add plugins for different job boards.

### Available plugins

- **trabajando.cl** - Chilean job portal with more than 15 sites
- **computrabajo.cl** - Latin American portal (in development)

### Create your own plugin

JobTracker has a **Plugin SDK** that lets you create scrapers for any job board.

See [plugin-sdk/README.md](./plugin-sdk/README.md) for complete documentation.

```bash
# Validate plugin structure
npx tsx plugin-sdk/scripts/validate.ts --name my-plugin

# Compile TypeScript to JavaScript
npx tsx plugin-sdk/scripts/build.ts --name my-plugin

# Test the plugin
npx tsx plugin-sdk/scripts/test.ts --name my-plugin --keywords "python,react"

# Package for distribution
npx tsx plugin-sdk/scripts/pack.ts --name my-plugin
```

## Technical stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **UI**: React + Ink
- **CLI**: Commander
- **Paths**: env-paths
- **Persistence**: local JSON
- **Scraping**: Playwright

For more details on architecture, patterns, and technical specifications, see [SPEC.md](./SPEC.en.md).

## Contributing

Contributions are welcome, whether reporting bugs, proposing improvements, or submitting code.

1. Fork the repository
2. Create a branch (`git checkout -b feature/my-change`)
3. Commit your changes
4. Push your branch
5. Open a Pull Request

## Contact

<p align="center">
  <a href="https://www.linkedin.com/in/sepulvedamarcos">
    <img src="https://img.shields.io/badge/LinkedIn-Marcos%20Sep%C3%BAlveda-blue?logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  <a href="mailto:sepulvedamarcos@gmail.com">
    <img src="https://img.shields.io/badge/Email-sepulvedamarcos%40gmail.com-red?logo=gmail&logoColor=white" alt="Email" />
  </a>
  <a href="https://ko-fi.com/sepulvedamarcos">
    <img src="https://img.shields.io/badge/Ko--fi-Support%20with%20a%20coffee-ff5e5b?logo=kofi&logoColor=white" alt="Ko-fi" />
  </a>
</p>

---

If you like it, consider giving the repository a star.