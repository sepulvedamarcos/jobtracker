# JobTracker 🚀

**TUI para búsqueda y seguimiento de empleo** — Una aplicación de terminal para centralizar tu búsqueda de trabajo.

## ¿Qué es JobTracker?

JobTracker es una herramienta de terminal (TUI) que te ayuda a gestionar tu búsqueda de empleo:

- 📋 **Centraliza avisos** de múltiples portales de empleo
- 🔍 **Busca por palabras clave** en todos los portales
- 📊 **Seguimiento de postulaciones** — registra a dónde aplicaste
- ⌨️ **100% por teclado** — rápido y eficiente

## Instalación

```bash
npm install -g jobtracker
```

## Uso

```bash
jobtracker
```

## Opciones

| Opción | Descripción |
|--------|-------------|
| `--help` | Ver ayuda |
| `--find` | Ejecutar escaneo automático al iniciar |
| `--nosplash` | Iniciar sin pantalla de inicio |
| `--silent` | Modo silencioso (solo escaneo) |
| `--addKey "palabra"` | Agregar palabra clave |
| `--delKey "palabra"` | Eliminar palabra clave |
| `--addPlugin ./ruta` | Agregar un plugin |

## Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| `↑` / `↓` | Navegar |
| `Tab` | Cambiar entre paneles |
| `S` | Iniciar escaneo |
| `K` | Gestionar keywords |
| `P` | Gestionar plugins |
| `Q` | Salir |

## Requisitos

- **Node.js** 18+

## Opcional: Playwright (para escaneo)

```bash
npm install -g playwright
npx playwright install
```

Sin playwright, podés usar la app para gestionar avisos y postulaciones manualmente.

## Datos

Los datos se almacenan en: `~/.jobtracker/`

## Licencia

ISC

## Links

- [GitHub](https://github.com/sepulvedamarcos/jobtracker)
- [Reportar problemas](https://github.com/sepulvedamarcos/jobtracker/issues)

---

<p align="center">
  <a href="https://www.linkedin.com/in/sepulvedamarcos">
    <img src="https://img.shields.io/badge/LinkedIn-Marcos%20Sep%C3%BAlveda-blue?logo=linkedin" alt="LinkedIn" />
  </a>
  <a href="mailto:sepulvedamarcos@gmail.com">
    <img src="https://img.shields.io/badge/Email-sepulvedamarcos%40gmail.com-red?logo=gmail" alt="Email" />
  </a>
</p>