# Agent Context: JobTracker 🤖

Este documento resume el contexto mínimo que necesita un agente para trabajar en este repositorio sin romper la dirección del proyecto.

## Identidad del proyecto

- **Stack**: Node.js + TypeScript.
- **UI**: TUI con **React + Ink**.
- **CLI**: `commander`.
- **Persistencia**: archivos JSON locales administrados por `env-paths`.
- **Objetivo**: replicar la experiencia de TrabajandoScanner en un ecosistema más portable.

## Arquitectura actual

El repositorio sigue una estructura tipo screaming architecture:

- `src/core/` — dominio, puertos y casos de uso.
- `src/infrastructure/` — adaptadores, config y persistencia.
- `src/infrastructure/adapters/cli/` — arranque de la app.
- `src/infrastructure/adapters/tui/` — componentes de interfaz.
- `src/services/` — utilidades transversales.

### Puntos clave

- `APP_PATHS` se inicializa al importar `src/infrastructure/config/paths.ts`.
- La versión de la app se lee desde `package.json` con `getVersion()`.
- `IJobRepository` define el contrato de persistencia para jobs escaneados y postulados.
- `JsonJobRepository` todavía tiene partes pendientes: solo implementa lectura/escritura de jobs escaneados.
- `MainLayout` hoy funciona como base de UI y usa datos mockeados; no asumir que el scraping real ya está conectado.

## Convenciones

- Usar imports ESM con extensión `.js` en el código TypeScript.
- Mantener componentes y clases pequeñas y con una sola responsabilidad.
- Preferir nombres explícitos antes que comentarios largos.
- No revertir cambios de otros agentes; adaptar la solución al estado real del árbol.

## Cosas a tener presentes

1. La interfaz actual es una base de trabajo, no una implementación final.
2. El sistema de persistencia todavía está incompleto en algunas rutas del repositorio.
3. Si se agrega un nuevo path o archivo de datos, actualizar también esta documentación.
4. Si se implementan scrapers reales, documentar el flujo en `Spec.md` y en el README.

## Tareas comunes

1. Completar el repositorio JSON.
2. Conectar el layout con datos reales.
3. Agregar servicios de scraping.
4. Expandir keywords, plugins y aplicaciones guardadas.
5. Mantener la documentación alineada con el estado real del código.
