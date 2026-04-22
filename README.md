# JobTracker 🚀

<p align="center">
  <a href="./README.md"><strong>Español</strong></a> ·
  <a href="./README.en.md">English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js badge" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript badge" />
  <img src="https://img.shields.io/badge/Ink-000000?logo=react&logoColor=61DAFB" alt="Ink badge" />
  <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="GPLv3 badge" />
</p>

**JobTracker** es una TUI de búsqueda y seguimiento de empleo pensada para centralizar avisos, palabras clave y postulaciones en una sola interfaz rápida de terminal.

Este proyecto toma la idea base de **TrabajandoScanner** y la adapta a un stack distinto: **Node.js + TypeScript + Ink**. La meta es conservar la misma experiencia táctil y liviana, pero con una arquitectura más portable entre lenguajes y plataformas.

## ¿Por qué usar JobTracker?

En vez de abrir múltiples pestañas y volver a filtrar los mismos portales una y otra vez, JobTracker busca dar una vista única, ordenada y operable desde teclado.

- **Interfaz de terminal moderna**: construida con **React + Ink** para una experiencia ágil en consola.
- **Arquitectura preparada para crecer**: separación entre `core/`, `infrastructure/` y `adapters/`.
- **Persistencia local por archivo**: rutas de aplicación administradas con `env-paths`.
- **Flujo orientado a productividad**: escaneo, keywords, postulaciones y plugins pensados como partes del mismo sistema.

## Estado actual

La base del proyecto ya incluye:

- Splash screen de arranque.
- Layout principal de la TUI.
- Navegación y comandos CLI con `commander`.
- Persistencia local con repositorios JSON.
- Estructura preparada para keywords, postulaciones y plugins.

## Hotkeys

Según el footer de la TUI actual:

- **F2**: Scan
- **F3**: Keywords
- **F4**: Plugins
- **Space**: Browser
- **Enter**: Postular
- **Del**: Eliminar
- **Q**: Salir

## Comandos disponibles

```bash
npm install
npm run dev
```

Opciones CLI:

- `npm run dev:now` — inicia con escaneo inmediato.
- `npm run dev:silent` — ejecuta sin TUI.
- `npm run dev:add` — modo para agregar keyword.
- `npm run print:jobs` — imprime los jobs guardados.

## Stack técnico

- **Lenguaje**: TypeScript
- **Runtime**: Node.js
- **UI**: React + Ink
- **CLI**: Commander
- **Paths de sistema**: env-paths
- **Persistencia**: JSON local

## Estructura general

- `src/core/` — entidades, puertos y casos de uso.
- `src/infrastructure/` — repositorios, config y adaptadores.
- `src/infrastructure/adapters/cli/` — punto de entrada de la TUI.
- `src/infrastructure/adapters/tui/` — componentes visuales de consola.
- `src/services/` — utilidades compartidas.

## Idea del proyecto

JobTracker está pensado para evolucionar hacia una herramienta multiplataforma que permita:

- capturar ofertas desde distintos orígenes,
- clasificar resultados por palabra clave,
- marcar postulaciones,
- y mantener un historial local reutilizable.

## Contribuir

Las contribuciones son bienvenidas, ya sea reportando bugs, proponiendo mejoras o enviando código.

1. Haz un fork del repositorio
2. Crea una rama (`git checkout -b feature/mi-cambio`)
3. Haz commit de tus cambios
4. Sube tu rama
5. Abre un Pull Request

## Contacto

<p align="center">
  <a href="https://www.linkedin.com/in/sepulvedamarcos">
    <img src="https://img.shields.io/badge/LinkedIn-Marcos%20Sep%C3%BAlveda-blue?logo=linkedin&logoColor=white" />
  </a>
  <a href="mailto:sepulvedamarcos@gmail.com">
    <img src="https://img.shields.io/badge/Email-sepulvedamarcos%40gmail.com-red?logo=gmail&logoColor=white" />
  </a>
  <a href="https://ko-fi.com/sepulvedamarcos">
    <img src="https://img.shields.io/badge/Ko--fi-Apoyar%20con%20un%20caf%C3%A9-ff5e5b?logo=kofi&logoColor=white" />
  </a>
</p>

---

Hecho para quienes prefieren automatizar su búsqueda de empleo sin perder el control de sus datos.
