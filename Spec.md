# Especificación Arquitectónica: JobTracker

Este documento describe la base técnica y la dirección del proyecto JobTracker.

## Objetivo

Construir una TUI multiplataforma para búsqueda y seguimiento de empleo, con una experiencia similar a TrabajandoScanner pero implementada en **Node.js + TypeScript** y preparada para crecer hacia otros lenguajes o entornos.

## Arquitectura de capas

### `core`

Contiene el dominio y los contratos principales:

- `entities/Job.ts`
- `ports/IJobRepository.ts`
- `use-cases/JobService.ts`

Responsabilidad:

- modelar los datos del negocio,
- definir interfaces de persistencia,
- y centralizar la lógica de aplicación.

### `infrastructure`

Contiene adaptadores y servicios técnicos:

- `config/paths.ts`
- `storage/JsonJobRepository.ts`
- `InMemoryJobRepository.ts`
- `adapters/cli/app.tsx`
- `adapters/tui/*`

Responsabilidad:

- manejar archivos,
- construir la UI,
- y conectar el dominio con el runtime.

### `services`

Utilidades compartidas y funciones auxiliares del sistema.

## Stack tecnológico

- **Lenguaje**: TypeScript
- **Runtime**: Node.js
- **UI**: React + Ink
- **CLI**: Commander
- **Persistencia de rutas**: env-paths
- **Formato de datos**: JSON

## Modelos de dominio

### Job

Representa un aviso escaneado.

Campos principales:

- `id`
- `keyword`
- `title`
- `company`
- `date`
- `link`
- `source`
- `scannedAt`

### AppliedJob

Representa una postulación o seguimiento guardado por el usuario.

Campos principales:

- `link`
- `title`
- `company`
- `keyword`
- `source`
- `sourceDateText`
- `sourceScannedAt`
- `status`
- `appliedAt`
- `notes`
- `lastUpdate`

### ApplicationStatus

Estados previstos para una postulación:

- `Interested`
- `Applied`
- `Interviewing`
- `Rejected`

## Persistencia

`src/infrastructure/config/paths.ts` crea y normaliza las carpetas de usuario para:

- `jobs.json`
- `keywords.json`
- `applications.json`
- `plugins/`

La estrategia actual es almacenar todo localmente y mantener el acceso aislado detrás de `IJobRepository`.

## Patrones de diseño

- **Screaming Architecture**: la estructura del árbol refleja el propósito del sistema.
- **Repository**: el acceso a datos queda detrás de una interfaz.
- **Separation of Concerns**: la UI no debe contener lógica de persistencia.
- **Single Responsibility**: cada módulo tiene una tarea específica.

## Flujo esperado

1. La app arranca desde `adapters/cli/app.tsx`.
2. Se renderiza la `Splash`.
3. `MainLayout` monta la interfaz principal.
4. El layout consulta servicios o repositorios según el modo de ejecución.
5. Los datos se presentan en lista y detalle.
6. Las acciones del usuario se guardan en JSON local.

## Estado actual

La base funcional existe, pero todavía hay partes de scaffold:

- `MainLayout` usa datos de ejemplo.
- `JsonJobRepository` solo implementa una parte del contrato.
- `InMemoryJobRepository` está incompleto.
- El flujo real de escaneo todavía no está enlazado al layout.

## Decisiones de diseño

- Mantener la app como TUI antes que como GUI tradicional.
- Usar almacenamiento local por archivo para simplicidad y portabilidad.
- Separar dominio e infraestructura para facilitar futuros cambios de stack.
- Documentar cada cambio importante en esta especificación y en el changelog.
