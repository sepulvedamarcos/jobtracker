# Plugin SDK - JobTracker

Kit de desarrollo para crear plugins scraper para JobTracker.

## ¿Qué es un plugin?

Un plugin es un módulo que permite a JobTracker extraer ofertas de empleo desde diferentes portales web. Cada plugin define cómo buscar y extraer jobs según keywords configuradas.

## Estructura de un plugin

```
mi-plugin/
├── metadata.json    # Información del plugin
├── scraper.ts       # Lógica de scraping (TypeScript)
├── scraper.js       # Lógica compilada (JavaScript)
└── NOTAS.md         # Documentación y limitaciones
```

## Inicio rápido

### 1. Clona el repositorio

```bash
git clone https://github.com/sepulvedamarcos/jobtracker.git
cd jobtracker
npm install
```

### 2. Crea tu plugin

Copia la plantilla o crea un nuevo directorio:

```bash
# Opción A: Copiar plantilla
cp -r plugin-sdk/template src/infrastructure/plugins/mi-plugin

# Opción B: Crear desde cero
mkdir -p src/infrastructure/plugins/mi-plugin
```

### 3. Edita los archivos

#### metadata.json
```json
{
  "pluginId": "mi-plugin",
  "name": "Mi Portal de Empleos",
  "pluginVersion": "1.0.0",
  "author": "Tu Nombre",
  "enabled": true,
  "mainFile": "scraper.js",
  "capabilities": {
    "supportsKeywordSearch": true
  }
}
```

#### scraper.ts
```typescript
// Importar tipos necesarios
import type { PluginScraper, PluginScraperInput } from '../../core/plugins/PluginScraper.js';
import type { Job } from '../../core/entities/Job.js';
import { chromium } from 'playwright';

// URL base del portal
const BASE_URL = 'https://www.miportal.com';

// Función para generar IDs únicos
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Nombre del source (para identificar de dónde viene el job)
export const sourceName = 'miportal.com';

// Función principal de scan
async function scan(input: PluginScraperInput): Promise<Job[]> {
  const { keywords, onProgress } = input;
  const jobs: Job[] = [];
  const scannedAt = new Date().toISOString();

  // Lanzar navegador
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const keyword of keywords) {
    // Navegar a la búsqueda
    const url = `${BASE_URL}/jobs?q=${encodeURIComponent(keyword)}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Extraer jobs
    const links = await page.$$('a.job-link');
    for (const link of links) {
      const href = await link.evaluate(el => el.href);
      const title = await link.evaluate(el => el.textContent?.trim());
      
      if (href && title) {
        jobs.push({
          id: generateId(),
          keyword,
          title,
          company: 'Empresa', // Ajustar según estructura del sitio
          date: 'Hoy',
          link: href,
          source: sourceName,
          scannedAt,
        });
      }
    }
  }

  await browser.close();
  return jobs;
}

// Exportar el scraper
const scraper: PluginScraper = { sourceName, scan };
export default scraper;
```

#### NOTAS.md
Documenta las limitaciones y comportamiento del plugin.

### 4. Compila y valida

```bash
# Validar estructura
npx tsx plugin-sdk/scripts/validate.ts --name mi-plugin --path ./src/infrastructure/plugins

# Compilar TypeScript a JavaScript
npx tsx plugin-sdk/scripts/build.ts --name mi-plugin --path ./src/infrastructure/plugins

# Probar el plugin
npx tsx plugin-sdk/scripts/test.ts --name mi-plugin --keywords "python,javascript" --path ./src/infrastructure/plugins
```

### 5. Empaqueta para distribución

```bash
# Empaquetar como .scrapper
npx tsx plugin-sdk/scripts/pack.ts --name mi-plugin --path ./src/infrastructure/plugins
```

Se generará `plugins/mi-plugin.scrapper` listo para instalar o compartir.

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `validate.ts` | Valida estructura del plugin |
| `build.ts` | Compila TypeScript → JavaScript |
| `test.ts` | Prueba el plugin con keywords |
| `pack.ts` | Genera archivo .scrapper (ZIP) |

## Pruebas desde JobTracker

### Modo desarrollo (con TUI)

```bash
npm run dev:plugin -- --find
```

### Modo silencioso (sin TUI)

```bash
npm run dev:silent
```

## Recomendaciones

### Estructura del scraper

- Usa Playwright para scraping moderno
- Maneja errores con try/catch
- Reporta progreso con `onProgress`
- Elimina duplicados al final

### Consideraciones legales

- Respeta robots.txt del sitio
- No hagas más de 1-2 requests por segundo
- No guardes datos personales
- Consulta los Términos de Servicio del portal

### Ejemplo completo

Ver el plugin `trabajando-cl/` en `src/infrastructure/plugins/` como referencia funcional.

## Solución de problemas

### Error: No se encuentra el módulo

Asegúrate de que el plugin esté en `src/infrastructure/plugins/`.

### Error: TypeScript no compila

Verifica que tienes las dependencias:
```bash
npm install playwright
npx playwright install chromium
```

### El test no devuelve jobs

Revisa:
1. La URL del portal está correcta
2. Los selectores CSS coinciden con la estructura del sitio
3. El sitio requiere JavaScript (usar `networkidle`)

## Contribuir

¿Creaste un plugin funcional? ¡Considera contribuirlo al proyecto!

1. Haz fork del repositorio
2. Agrega tu plugin en `src/infrastructure/plugins/`
3. Documenta en NOTAS.md
4. Crea un Pull Request

## Recursos

- [Documentación de Playwright](https://playwright.dev/docs/intro)
- [Plugin trabajando.cl de ejemplo](../src/infrastructure/plugins/trabajando-cl/NOTAS.md)
- [SPEC.md del proyecto](../SPEC.md)