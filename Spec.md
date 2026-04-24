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
- `entities/PluginMetadata.ts`
- `ports/IJobRepository.ts`
- `use-cases/JobService.ts`
- `use-cases/ApplicationService.ts`
- `use-cases/plugins/*`

Responsabilidad:

- modelar los datos del negocio,
- definir interfaces de persistencia,
- y centralizar la lógica de aplicación.

### `infrastructure`

Contiene adaptadores y servicios técnicos:

- `config/paths.ts`
- `storage/JsonJobRepository.ts`
- `adapters/cli/app.tsx`
- `adapters/tui/*`
- `plugins/*`

Responsabilidad:

- manejar archivos,
- construir la UI,
- y conectar el dominio con el runtime.

### `services`

Utilidades compartidas y funciones auxiliares del sistema:

- `keywords.ts` — gestión de palabras clave
- `list-labels.ts` — formateo de etiquetas de lista
- `pagination.ts` — paginación
- `application-matcher.ts` — coincidencia de postulaciones

## Stack tecnológico

| Componente | Tecnología |
|-----------|------------|
| Lenguaje | TypeScript |
| Runtime | Node.js |
| UI | React + Ink |
| CLI | Commander |
| Gestión de rutas | env-paths |
| Formato de datos | JSON |
| Compresión | JSZip, adm-zip, unzipper |

## Herramientas de terceros

JobTracker valida al iniciar las herramientas necesarias para los plugins:

| Herramienta | Uso | Verificación |
|-------------|-----|--------------|
| Playwright | Scraper de plugins | Verificar instalación y browsers |
| Node.js | Runtime | Verificar versión >= 18 |

La validación se ejecuta en el inicio y reporta warnings si faltan herramientas.

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

### PluginMetadata

Metadatos de un plugin scraper.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `pluginId` | string | Identificador único del plugin |
| `name` | string | Nombre legible del plugin |
| `pluginVersion` | string | Versión del plugin |
| `author` | string | Autor del plugin |
| `mainFile` | string | Archivo principal del scraper |
| `enabled` | boolean | Si está habilitado |

## Persistencia

`src/infrastructure/config/paths.ts` crea y normaliza las carpetas de usuario para:

- `jobs.json` — avisos escaneados
- `keywords.json` — palabras clave
- `applications.json` — postulaciones
- `plugins/` — plugins instalados
- `logs/` — archivos de log

La estrategia actual es almacenar todo localmente y mantener el acceso aislado detrás de `IJobRepository`.

## Patrones de diseño

- **Screaming Architecture**: la estructura del árbol refleja el propósito del sistema
- **Repository**: el acceso a datos queda detrás de una interfaz
- **Separation of Concerns**: la UI no debe contener lógica de persistencia
- **Single Responsibility**: cada módulo tiene una tarea específica
- **Clean Architecture**: lógica de dominio independiente de frameworks
- **Hexagonal Architecture**: puertos y adaptadores para aislar el core

## Flujo esperado

1. La app arranca desde `adapters/cli/app.tsx`
2. Se parsean los argumentos de CLI (Commander)
3. Si hay flags especiales (--addKey, --delKey, --addPlugin), se ejecutan y sale
4. Si es modo normal, se renderiza la `Splash`
5. `MainLayout` monta la interfaz principal
6. El layout consulta servicios o repositorios según el modo de ejecución
7. Las acciones del usuario se guardan en JSON local

## Componentes de UI

### MainLayout

Contenedor principal con tres paneles:

- **JobList** (izquierda): Lista de avisos escaneados (naranja)
- **ApplicationsPanel** (arriba-derecha): Lista de postulaciones (naranja)
- **DetailPanel** (abajo-derecha): Detalle del aviso seleccionado

### Modales

- **KeywordsModal** (K): Editar palabras clave
- **PluginsModal** (P): Gestionar plugins
- **ConfirmScanModal**: Confirmar antes de escanear
- **ScanProgressModal**: Progreso del escaneo
- **ApplicationDetailModal**: Ver/eliminar detalle de postulación

## Opciones CLI

### Scripts npm

```bash
npm run dev              # TUI completa
npm run dev:find        # TUI con escaneo automático
npm run dev:add -- "kw" # Agregar keyword
npm run dev:del -- "kw" # Eliminar keyword
npm run dev:silent      # Sin TUI
npm run dev:plugin      # Modo desarrollo de plugins
npm run dev:plugin:find # Plugin + escaneo automático
```

### Flags directos

| Flag | Descripción |
|------|-------------|
| `--addKey <kw>` | Agregar keyword y salir |
| `--delKey <kw>` | Eliminar keyword y salir |
| `--addPlugin <path>` | Instalar plugin desde ruta |
| `--delPlugin <id>` | Eliminar plugin |
| `--find` | Escanear al iniciar |
| `--silent` | Sin TUI |
| `--noSplash` | Sin pantalla splash |
| `--help` | Mostrar ayuda |

## Versionado Semántico

JobTracker utiliza **Conventional Commits** + **standard-version** para automatizar el versionado y generación de changelog.

### Conceptos clave

El versionado semántico sigue el formato `MAJOR.MINOR.PATCH`:

| Nivel | Incremento | Ejemplo | Cuándo usar |
|-------|------------|---------|-------------|
| **MAJOR** | X.0.0 | 0.1.0 → 1.0.0 | Cambios que rompen compatibilidad |
| **MINOR** | x.Y.0 | 0.0.2 → 0.1.0 | Nuevas funcionalidades compatibles |
| **PATCH** | x.x.Y | 0.0.2 → 0.0.3 | Correcciones de bugs |

### Conventional Commits

Los mensajes de commit siguen el formato: `<tipo>(<alcance>): <descripción>`

Tipos soportados:

| Tipo | Descripción | Genera versión |
|------|-------------|----------------|
| `feat` | Nueva funcionalidad | MINOR |
| `fix` | Corrección de bug | PATCH |
| `docs` | Documentación | PATCH |
| `chore` | Mantenimiento | No (excepto release) |
| `refactor` | Refactorización | No |
| `test` | Tests | No |
| `perf` | Performance | PATCH |
| `ci` | CI/CD | No |

### Scripts disponibles

```bash
# Versionado automático (analiza commits desde el último tag)
npm run release

# Versionado manual
npm run release:patch  # 0.0.2 → 0.0.3
npm run release:minor  # 0.0.2 → 0.1.0
npm run release:major  # 0.0.2 → 1.0.0
```

### Comandos adicionales

```bash
# Hacer commit con Conventional Commits (interactivo)
npm run commit

# Crear commit manual
git commit -m "feat(cli): agregar comando --addPlugin"
```

### Cómo funciona

```
1. Ejecutas: npm run release:patch
2. standard-version analiza commits desde el último tag (v0.0.1)
3. Genera: v0.0.2 con changelog automático
4. Crea tag: git tag v0.0.2
5. Actualiza CHANGELOG.md
6. Actualiza package.json version
```

### Importante: Commits desde el último tag

**Solo los commits realizados DESPUÉS del último tag se incluyen en el análisis.**

```
v0.0.1 ───► v0.0.2
   ↑           ↑
   │           └─ Solo commits entre tags
   └─ Primer tag (agrupa TODA la historia anterior)
```

En la práctica:
- `v0.0.1` agrupó todos los commits de la creación del proyecto
- `v0.0.2` agrupó todos los commits de features nuevos
- Para `v0.0.3`, solo se considerarán los commits realizados después de `v0.0.2`

### Hooks automáticos

Husky está configurado para validar commits:

- `pre-commit`: Verifica estilo de código
- `commit-msg`: Valida formato Conventional Commits

## Atajos de teclado

### Navegación

| Tecla | Acción |
|-------|--------|
| `↑` / `↓` | Navegar entre registros |
| `Tab` | Cambiar entre paneles (Avisos → Postulaciones → Detalle) |
| `PageUp` / `PageDown` | Paginar |

### Acciones rápidas

| Tecla | Panel | Acción |
|-------|-------|--------|
| `Enter` | Avisos | Copiar aviso a postulaciones |
| `Enter` | Postulaciones | Abrir detalle de postulación |
| `Enter` | Detalle | Abrir enlace en navegador |
| `Supr` | Modal Detalle | Eliminar postulación |

### Funciones globales

| Tecla | Acción |
|-------|--------|
| `S` | Iniciar escaneo con plugins |
| `K` | Abrir modal de keywords |
| `P` | Abrir panel de plugins |
| `Q` | Salir de la aplicación |

### Modal de Keywords (K)

| Tecla | Acción |
|-------|--------|
| `I` | Insertar nueva keyword |
| `Enter` | Guardar (en modo inserción) |
| `Supr` / `Del` | Eliminar keyword seleccionada |
| `Esc` | Cerrar modal |

### Modal de Plugins (P)

| Tecla | Acción |
|-------|--------|
| `A` | Agregar plugin (ingresar ruta) |
| `E` | Eliminar plugin seleccionado |
| `Enter` | Instalar plugin |
| `Esc` | Cerrar modal |

## Estado actual

El proyecto tiene una base funcional completa:

- [x] Pantalla splash
- [x] MainLayout con tres paneles
- [x] Modal de keywords (K)
- [x] Modal de plugins (P)
- [x] Modal de detalle de postulación con eliminar
- [x] Modal de confirmación de escaneo
- [x] Modal de progreso de escaneo
- [x] Persistencia JSON a través de repositorios
- [x] Sistema de plugins funcional
- [x] Ejecución de plugins en paralelo
- [x] CLI completo con todos los flags
- [x] Validación de herramientas de terceros
- [ ] Edición de estado de postulación
- [ ] Historial de postulaciones por estado

## Decisiones de diseño

- Mantener la app como TUI antes que como GUI tradicional
- Usar almacenamiento local por archivo para simplicidad y portabilidad
- Separar dominio e infraestructura para facilitar futuros cambios de stack
- Documentar cada cambio importante en esta especificación y en el changelog
- Sistema de plugins是可扩展的, permite agregar nuevos scrapers sin modificar el core