# Especificación Arquitectónica: JobTracker

<p align="center">
  <a href="./Spec.md">Español</a> ·
  <a href="./Spec.en.md">English</a>
</p>

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

| Componente | Tecnología |
|-----------|------------|
| Lenguaje | TypeScript |
| Runtime | Node.js |
| UI | React + Ink |
| CLI | Commander |
| Gestión de rutas | env-paths |
| Formato de datos | JSON |

## Modelos de dominio

### Job

Representa un aviso escaneado.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único |
| `keyword` | string | Palabra clave que encontró este aviso |
| `title` | string | Título del puesto |
| `company` | string | Nombre de la empresa |
| `date` | string | Fecha relativa (ej., "hace 2 días") |
| `link` | string | URL al aviso |
| `source` | string | Portal origen (LinkedIn, Indeed, etc.) |
| `scannedAt` | string | Timestamp ISO del escaneo |

### AppliedJob

Representa una postulación o seguimiento guardado por el usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `link` | string | URL al aviso |
| `title` | string | Título del puesto |
| `company` | string | Nombre de la empresa |
| `keyword` | string | Palabra clave que encontró este aviso |
| `source` | string | Portal origen |
| `sourceDateText` | string | Fecha original del portal |
| `sourceScannedAt` | string | Cuándo se escaneó originalmente |
| `status` | ApplicationStatus | Estado actual de la postulación |
| `appliedAt` | string | Timestamp ISO de la postulación |
| `notes` | string | Notas del usuario |
| `lastUpdate` | string | Timestamp ISO de última actualización |

### ApplicationStatus

Estados previstos para una postulación:

| Valor | Estado | Descripción |
|-------|--------|-------------|
| 0 | Interested | Usuario está interesado |
| 1 | Applied | Postulación enviada |
| 2 | Interviewing | En proceso de entrevista |
| 3 | Rejected | Postulación rechazada |

## Persistencia

`src/infrastructure/config/paths.ts` crea y normaliza las carpetas de usuario para:

- `jobs.json`
- `keywords.json`
- `applications.json`
- `plugins/`

La estrategia actual es almacenar todo localmente y mantener el acceso aislado detrás de `IJobRepository`.

## Patrones de diseño

- **Screaming Architecture**: la estructura del árbol refleja el propósito del sistema
- **Repository**: el acceso a datos queda detrás de una interfaz
- **Separation of Concerns**: la UI no debe contener lógica de persistencia
- **Single Responsibility**: cada módulo tiene una tarea específica
- **Clean Architecture**: lógica de dominio independiente de frameworks

## Flujo esperado

1. La app arranca desde `adapters/cli/app.tsx`
2. Se renderiza la `Splash`
3. `MainLayout` monta la interfaz principal
4. El layout consulta servicios o repositorios según el modo de ejecución
5. Los datos se presentan en lista y detalle
6. Las acciones del usuario se guardan en JSON local

## Componentes de UI

### MainLayout

Contenedor principal con tres paneles:

- **JobList** (izquierda): Lista de avisos escaneados
- **ApplicationsPanel** (arriba-derecha): Lista de postulaciones
- **DetailPanel** (abajo-derecha): Detalle del aviso seleccionado

### Modales

- **KeywordsModal**: Editar palabras clave (F3 o K)
- **ApplicationDetailModal**: Ver/eliminar detalle de postulación

## Atajos de teclado

| Tecla | Panel | Acción |
|-------|-------|--------|
| Tab | Global | Cambiar entre paneles |
| ↑/↓ | Avisos/Postulaciones | Navegar lista |
| Enter | Avisos | Copiar aviso a postulaciones |
| Enter | Postulaciones | Abrir modal de detalle |
| Enter | Detalle | Abrir enlace en navegador |
| Esc | Modal | Cerrar modal |
| Supr | Detalle Postulación | Eliminar postulación |
| PageUp/PageDown | Listas | Paginar |
| K | Global | Alternar modal de keywords |
| Q | Global | Salir |

## Estado actual

La base funcional existe, con partes todavía en desarrollo:

- [x] Pantalla splash
- [x] MainLayout con tres paneles
- [x] Modal de keywords
- [x] Modal de detalle de postulación con eliminar
- [x] Persistencia JSON a través de repositorios
- [ ] Integración real de escaneo con plugins
- [ ] Edición de estado de postulación

## Decisiones de diseño

- Mantener la app como TUI antes que como GUI tradicional
- Usar almacenamiento local por archivo para simplicidad y portabilidad
- Separar dominio e infraestructura para facilitar futuros cambios de stack
- Documentar cada cambio importante en esta especificación y en el changelog
