# JobTracker 🚀

**TUI for job search and tracking** — A terminal application to centralize your job search.

## What is JobTracker?

JobTracker is a terminal (TUI) tool that helps you manage your job search:

- 📋 **Centralize listings** from multiple job portals
- 🔍 **Search by keywords** across all portals
- 📊 **Track applications** — record where you applied
- ⌨️ **100% keyboard-driven** — fast and efficient

## Installation

```bash
npm install -g jobtracker
```

## Usage

```bash
jobtracker
```

## Options

| Option | Description |
|--------|-------------|
| `--help` | View help |
| `--nosplash` | Start without splash screen |
| `--silent` | Silent mode (scan only) |
| `--addKey "word"` | Add keyword |
| `--delKey "word"` | Delete keyword |
| `--addPlugin ./path` | Add a plugin |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate |
| `Tab` | Switch between panels |
| `S` | Start scan |
| `K` | Manage keywords |
| `P` | Manage plugins |
| `Q` | Quit |

## Requirements

- **Node.js** 18+

## Optional: Playwright (for scanning)

```bash
npm install -g playwright
npx playwright install
```

Without playwright, you can still use the app to manually manage listings and applications.

## Data

Data is stored at: `~/.jobtracker/`

## License

ISC

## Links

- [GitHub](https://github.com/sepulvedamarcos/jobtracker)
- [Report issues](https://github.com/sepulvedamarcos/jobtracker/issues)

---

<p align="center">
  <a href="https://www.linkedin.com/in/sepulvedamarcos">
    <img src="https://img.shields.io/badge/LinkedIn-Marcos%20Sep%C3%BAlveda-blue?logo=linkedin" alt="LinkedIn" />
  </a>
  <a href="mailto:sepulvedamarcos@gmail.com">
    <img src="https://img.shields.io/badge/Email-sepulvedamarcos%40gmail.com-red?logo=gmail" alt="Email" />
  </a>
</p>