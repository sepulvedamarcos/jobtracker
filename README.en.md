# JobTracker 🚀

<p align="center">
  <a href="./README.md">Español</a> ·
  <a href="./README.en.md"><strong>English</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js badge" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript badge" />
  <img src="https://img.shields.io/badge/Ink-000000?logo=react&logoColor=61DAFB" alt="Ink badge" />
  <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="GPLv3 badge" />
</p>

**JobTracker** is a job search and tracking TUI designed to centralize listings, keywords, and applications in one fast terminal interface.

This project takes the core idea behind **TrabajandoScanner** and adapts it to a different stack: **Node.js + TypeScript + Ink**. The goal is to keep the same lightweight, keyboard-first experience while making the architecture more portable across languages and platforms.

## Why use JobTracker?

Instead of opening multiple tabs and re-filtering the same job boards again and again, JobTracker aims to provide a single, organized, keyboard-driven view.

- **Modern terminal UI**: built with **React + Ink** for a fast console experience.
- **Ready-to-grow architecture**: clear separation between `core/`, `infrastructure/`, and `adapters/`.
- **Local file persistence**: application paths managed with `env-paths`.
- **Productivity-first workflow**: scanning, keywords, applications, and plugins treated as parts of one system.

## Current state

The project already includes:

- A startup splash screen.
- A main TUI layout.
- CLI navigation and commands powered by `commander`.
- Local persistence through JSON repositories.
- A structure prepared for keywords, applications, and plugins.

## Hotkeys

According to the current TUI footer:

- **F2**: Scan
- **F3**: Keywords
- **F4**: Plugins
- **Space**: Browser
- **Enter**: Apply
- **Del**: Delete
- **Q**: Quit

## Available commands

```bash
npm install
npm run dev
```

CLI options:

- `npm run dev:now` — start with an immediate scan.
- `npm run dev:silent` — run without the TUI.
- `npm run dev:add` — add-keyword mode.
- `npm run print:jobs` — print stored jobs.

## Technical stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **UI**: React + Ink
- **CLI**: Commander
- **System paths**: env-paths
- **Persistence**: local JSON

## Project structure

- `src/core/` — entities, ports, and use cases.
- `src/infrastructure/` — repositories, config, and adapters.
- `src/infrastructure/adapters/cli/` — TUI entry point.
- `src/infrastructure/adapters/tui/` — terminal UI components.
- `src/services/` — shared utilities.

## Project vision

JobTracker is intended to evolve into a cross-platform tool that can:

- capture job listings from multiple sources,
- classify results by keyword,
- track applications,
- and keep a reusable local history.

## Contributing

Contributions are welcome, whether you are reporting bugs, proposing improvements, or submitting code.

1. Fork the repository
2. Create a branch (`git checkout -b feature/my-change`)
3. Commit your changes
4. Push your branch
5. Open a Pull Request

## Contact

<p align="center">
  <a href="https://www.linkedin.com/in/sepulvedamarcos">
    <img src="https://img.shields.io/badge/LinkedIn-Marcos%20Sep%C3%BAlveda-blue?logo=linkedin&logoColor=white" />
  </a>
  <a href="mailto:sepulvedamarcos@gmail.com">
    <img src="https://img.shields.io/badge/Email-sepulvedamarcos%40gmail.com-red?logo=gmail&logoColor=white" />
  </a>
  <a href="https://ko-fi.com/sepulvedamarcos">
    <img src="https://img.shields.io/badge/Ko--fi-Support%20with%20a%20coffee-ff5e5b?logo=kofi&logoColor=white" />
  </a>
</p>

---

Built for people who prefer to automate their job search without giving up control of their data.
