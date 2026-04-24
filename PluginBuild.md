# Plugin Build Guide - Compilar Plugins como Paquete `.scrapper`

Este documento describe cómo compilar un plugin de JobTracker como archivo distribución independiente (`.scrapper`).

---

## 1. Estructura de un Plugin

```
trabajando-cl/
├── metadata.json    # Obligatorio
├── scraper.ts       # Fuente (TypeScript)
└── README.md       # Opcional
```

### metadata.json (requerido)

```json
{
  "pluginId": "trabajando-cl",
  "name": "Trabajando.cl",
  "pluginVersion": "1.0.0",
  "author": "JobTracker",
  "enabled": true,
  "capabilities": {
    "supportsKeywordSearch": true
  }
}
```

---

## 2. Compilar el Plugin

### Paso 1: Compilar TypeScript → JavaScript

Desde la raíz del proyecto JobTracker:

```bash
npx tsc src/infrastructure/plugins/trabajando-cl/scraper.ts \
  --outDir dist/plugins/trabajando-cl \
  --module ES2020 \
  --target ES2020 \
  --moduleResolution node \
  --esModuleInterop \
  --declaration false
```

Esto genera `dist/plugins/trabajando-cl/scraper.js`.

### Paso 2: Crear el archivo `.scrapper`

```bash
cd dist/plugins
zip -r trabajando-cl.scrapper trabajando-cl/
```

El archivo `.scrapper` es un ZIP que contiene:
- `metadata.json`
- `scraper.js` (compilado, NO .ts)

---

## 3. Instalación del Plugin

El usuario instala desde la TUI (tecla P) o CLI:

```bash
jobtracker --plugin-install trabajando-cl.scrapper
```

El flujo:
1. Descomprime el `.scrapper` en `~/.local/share/jobtracker/plugins/trabajando-cl/`
2. Valida que existe `metadata.json` y `scraper.js`
3. Registra en `PluginsMetadata.json`

---

## 4. Desarrollo vs Producción

| Modo | Cómo se ejecuta | Carga |
|------|----------------|-------|
| **DEV** |直接从 `src/infrastructure/plugins/` | `JOBTRACKER_PLUGIN_DEV=true` |
| **PROD** |Desde `~/.local/share/jobtracker/plugins/` | Loader dinámico |

###DEV mode activo

```bash
JOBTRACKER_PLUGIN_DEV=true npm run dev -- --find
```

El código detecta y carga directamente:

```ts
// RunPluginsScanUseCase.ts
if (process.env.JOBTRACKER_PLUGIN_DEV === 'true') {
  const scraper = await import('../../../infrastructure/plugins/trabajando-cl/scraper.js');
  // Carga directa del fuente
} else {
  const scraper = await loadScraperPlugin(pluginId);
  // Carga desde ~/.local/share/jobtracker/plugins/
}
```

---

## 5. Contrato del Plugin (para terceros)

Los desarrolladores que creen un plugin deben:

1. **Implementar** `PluginScraper`:

```ts
// Mi plugin debe exportar esto:
export interface PluginScraper {
  sourceName: string;  // Identificador único
  scan(input: {
    keywords: string[];
    onProgress?: (message: string) => void;
    signal?: AbortSignal;
  }): Promise<Job[]>;
}
```

2. **Compilar** a JavaScript (ES2020+)

3. **Empaquetar** como `.scrapper` con:
   - `metadata.json` (obligatorio)
   - `scraper.js` (el código compilado)

---

## 6. Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find module 'playwright'` | No bundler | Embed Playwright O hacer bundle con esbuild |
| `Target page closed` | Browser compartido | Nueva página por búsqueda |
| `scraper.ts not found` | Olvidaste compilar | `tsc --outDir dist/...` |

### Recomendación: Bundling

Para producción, usar esbuild para incluir Playwright:

```bash
npx esbuild src/infrastructure/plugins/trabajando-cl/scraper.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --outfile=dist/plugins/trabajando-cl/scraper.js
```

Esto embebe las dependencias.

---

## 7. API de Contexto (inyección)

El runtime provee utilidades via contexto:

```ts
interface PluginExecutionContext {
  playwright: typeof import('playwright');
  logger: { info(msg: string): void; warn(msg: string): void; error(msg: string): void };
  nowIso: () => string;
}
```

*(Futuro: actualmente el plugin maneja su propia instancia de Playwright)*