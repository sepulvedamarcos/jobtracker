# Plan de Integración de Plugins Scraper (JobTracker Node.js)

## 1) Objetivo
Diseñar e implementar una arquitectura de plugins para scraping de avisos, inspirada en la solución .NET (`PluginManager`, `ScraperOrchestrator`, `ScraperBase`) pero adaptada a Node.js + TypeScript, usando Playwright y ejecución controlada de plugins empaquetados en `.scrapper`.

---

## 2) Referencia .NET (hallazgos clave)
Basado en `/home/marcos/Desarrollo/csharp/TrabajandoScanner/Services/`:

- **PluginManager.cs**
  - Crea directorio de plugins
  - Lee/escribe `PluginsMetadata.json`
  - Instala plugin desde ZIP `.scrapper`
  - Exige `metadata.json` + binario del plugin
  - Desinstala por `pluginId`

- **ScraperOrchestrator.cs**
  - Itera keywords
  - Ejecuta scrapers por keyword
  - Reporta progreso
  - Deduplica por URL normalizada

- **ScraperBase.cs**
  - Usa Playwright
  - Patrón base para scraping por sitio
  - Selectores/URL por implementación concreta

Conclusión: en Node.js necesitamos los mismos 3 pilares:
1. **Gestión de plugins** (instalación/metadata)
2. **Motor de ejecución/orquestación**
3. **Contrato base de scraper**

---

## 3) Estructura de archivos objetivo

### 3.1 Paths de runtime
- Metadata global: `~/.local/share/jobtracker/PluginsMetadata.json`
- Plugins instalados: `~/.local/share/jobtracker/plugins/<pluginId>/`

### 3.2 Estructura dentro de `.scrapper`
Archivo ZIP: `nombre_plugin.scrapper`

Contenido mínimo:
- `metadata.json`
- `scraper.ts` (o `dist/scraper.js` para ejecución segura/estable)

### 3.3 Metadata requerido
Usar este contrato (equivalente al .NET):

```ts
interface PluginMetadata {
  pluginId: string;
  name: string;
  pluginVersion: string;
  author: string;
  capabilities?: PluginCapabilities;
}
```

> `PluginCapabilities` se define en esta fase (ej: `supportsKeywordSearch`, `supportsPagination`, `requiresAuth`, `sources`).

---

## 4) Decisión técnica clave: ejecución de scraper `.ts`

### Opción recomendada (MVP robusto)
**No ejecutar TypeScript sin compilar en producción.**
- Requerir plugin con `dist/scraper.js`
- Cargar dinámicamente JS con `import()`
- Mantener `scraper.ts` opcional como fuente

### Opción desarrollo (opcional)
- Permitir `.ts` en dev con `tsx` runtime
- Activable por flag de entorno (`JOBTRACKER_PLUGIN_DEV_TS=true`)

**Razón:** reduce fragilidad, mejora seguridad y simplifica soporte.

---

## 5) Diseño por capas (Clean Architecture)

### 5.1 Core (contratos)
Crear en `src/core/plugins/`:

- `PluginMetadata.ts`
- `PluginCapabilities.ts`
- `PluginScraper.ts` (interfaz de ejecución)
- `PluginManagerPort.ts`
- `PluginRuntimePort.ts`

Interfaz scraper sugerida:

```ts
interface PluginScraper {
  sourceName: string;
  scan(input: {
    keywords: string[];
    onProgress?: (message: string) => void;
    signal?: AbortSignal;
  }): Promise<Job[]>;
}
```

### 5.2 Infraestructura
Crear en `src/infrastructure/plugins/`:

- `PluginPathResolver.ts`
- `PluginMetadataStore.ts` (CRUD `PluginsMetadata.json`)
- `PluginPackageInstaller.ts` (descomprimir `.scrapper`, validar estructura)
- `PluginLoader.ts` (carga dinámica de scraper)
- `PluginPlaywrightFactory.ts` (contexto Playwright compartido/opcional)
- `PluginManager.ts` (facade)

### 5.3 Use cases
Crear en `src/core/use-cases/plugins/`:

- `InstallPluginUseCase.ts`
- `RemovePluginUseCase.ts`
- `ListPluginsUseCase.ts`
- `RunPluginsScanUseCase.ts` (orquestador estilo .NET)

---

## 6) Flujo de instalación de plugin

1. Usuario entrega `archivo.scrapper`
2. Validar extensión y ZIP legible
3. Leer `metadata.json`
4. Validar campos obligatorios (`pluginId`, `name`, `pluginVersion`, `author`)
5. Verificar unicidad por `pluginId`
6. Extraer a `~/.local/share/jobtracker/plugins/<pluginId>/`
7. Verificar entrypoint (`dist/scraper.js` o política definida)
8. Registrar/actualizar `PluginsMetadata.json`
9. Reportar resultado a UI/CLI

---

## 7) Flujo de ejecución de búsqueda

1. Cargar keywords desde `keywords.json`
2. Obtener plugins activos desde `PluginsMetadata.json`
3. Por cada keyword:
   - Ejecutar plugins habilitados
   - Reportar progreso
4. Normalizar URL de cada aviso
5. Deduplicar globalmente por URL
6. Persistir en `jobs.json`
7. Actualizar estado en TUI

---

## 8) Playwright en plugins

### Estrategia recomendada
- El runtime principal provee Playwright (no cada plugin)
- El plugin recibe utilidades via contexto:

```ts
interface PluginExecutionContext {
  playwright: typeof import('playwright');
  logger: { info(msg: string): void; warn(msg: string): void; error(msg: string): void };
  nowIso: () => string;
}
```

Ventajas:
- Menos duplicación
- Mejor control de timeout/cancelación
- Menos acoplamiento por versiones

---

## 9) Seguridad y validación mínima

- Validar ZIP (sin path traversal)
- No permitir extracción fuera de carpeta destino
- Validar metadata estrictamente
- Timeout por plugin
- Manejo de errores aislado por plugin (fallo de uno no cae todo)
- Registro de errores por plugin (`logs/plugins/<pluginId>.log`)

---

## 10) Integración CLI/TUI (incremental)

### CLI
Agregar comandos:
- `--plugin-install <path.scrapper>`
- `--plugin-remove <pluginId>`
- `--plugin-list`
- `--scannow` usando plugins instalados

### TUI
- Panel Plugins: listar, instalar, quitar, habilitar/deshabilitar
- Mostrar estado de ejecución por plugin durante escaneo

---

## 11) Plan por fases

### Fase 1 (fundación)
- Contratos core de plugins
- Paths y stores (`PluginsMetadata.json`)
- Installer `.scrapper` con validaciones

### Fase 2 (runtime)
- Loader dinámico de plugins
- Interfaz `PluginScraper`
- Ejecución básica de 1 plugin sobre keywords

### Fase 3 (orquestación)
- `RunPluginsScanUseCase`
- progreso + cancelación
- deduplicación por URL

### Fase 4 (integración UX)
- comandos CLI plugin-* 
- integración con `--scannow`
- panel TUI de plugins

### Fase 5 (hardening)
- timeouts por plugin
- logs
- tests de instalación/carga/errores

---

## 12) Entregables técnicos

1. `plan.md` (este documento)
2. Modelo de datos plugins + metadata
3. Instalador de `.scrapper`
4. Cargador dinámico de scraper
5. Orquestador de scraping con plugins
6. Comandos CLI de administración de plugins
7. Integración TUI de plugins (iterativa)

---

## 13) Riesgos y mitigación

- **Riesgo:** ejecutar `.ts` directamente rompe en runtime
  - **Mitigación:** entrypoint JS compilado obligatorio (MVP)

- **Riesgo:** plugins incompatibles por contrato
  - **Mitigación:** versionado de API de plugin (`capabilities.apiVersion`)

- **Riesgo:** sitios cambian HTML frecuentemente
  - **Mitigación:** aislar scraper por plugin y desplegar actualizaciones independientes

- **Riesgo:** scraping lento por múltiples plugins
  - **Mitigación:** paralelismo limitado + timeout configurable

---

## 14) Próximo paso inmediato sugerido
Crear el esqueleto de infraestructura de plugins (archivos vacíos + interfaces + installer mínimo) para habilitar la primera instalación de `.scrapper` y validación de `metadata.json`.
