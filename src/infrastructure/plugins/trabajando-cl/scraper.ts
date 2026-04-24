// PluginScraper for trabajar.cl using Playwright
import type { PluginScraper, PluginScraperInput } from '../../../core/plugins/PluginScraper.js';
import type { Job } from '../../../core/entities/Job.js';
import { chromium } from 'playwright';

const BASE_URL = 'https://www.trabajando.cl';

const generateId = () => 
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const sourceName = 'trabajando.cl';

/**
 * Carga todos los resultados haciendo scroll y click en "Ver más"
 */
async function loadAllResults(page: any, onProgress?: (msg: string) => void): Promise<number> {
  let prevCount = 0;
  let iterations = 0;
  const maxIterations = 10;
  
  // Scroll inicial
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  
  while (iterations < maxIterations) {
    // Intentar clickear "Ver más" via evaluate
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const verMas = buttons.find(b => b.textContent?.includes('Ver más'));
      if (verMas) {
        verMas.click();
        return true;
      }
      return false;
    });
    
    if (clicked) {
      onProgress?.(`Cargando más resultados...`);
      await page.waitForTimeout(2000);
    }
    
    // Scroll después del click
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const currentCount = await page.$$eval('a[href*="/trabajo/"]', links => links.length);
    
    // Si no cambió, terminamos
    if (currentCount === prevCount && !clicked) {
      break;
    }
    
    onProgress?.(`Resultados: ${currentCount}`);
    prevCount = currentCount;
    iterations++;
  }
  
  return prevCount;
}

async function scan(input: PluginScraperInput): Promise<Job[]> {
  const { keywords, onProgress } = input;
  const jobs: Job[] = [];
  const scannedAt = new Date().toISOString();
  const totalKeywords = keywords.length;

  onProgress?.(`Iniciando con ${totalKeywords} keywords...`, 0);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ 
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  try {
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      const progress = Math.round((i / totalKeywords) * 100);
      
      onProgress?.(`"${keyword}" (${i + 1}/${totalKeywords})`, progress);

      try {
        // Normalizar keyword: lowercase y remover caracteres problemáticos
        // trabajando.cl acepta:
        // - palabras simples: python, javascript, angular
        // - %20 para espacios: sql%20server, .net%20core
        // NO acepta:
        // - puntos solos: node.js (usar nodejs)
        // - guiones solos: full-stack (usar fullstack)
        const normalizedKeyword = keyword
          .toLowerCase()
          .trim()
          // Reemplazar puntos seguidos de texto con texto sin punto
          .replace(/\.js\b/gi, 'js')
          .replace(/\.net\b/gi, 'net')
          .replace(/\.ts\b/gi, 'ts')
          .replace(/\.py\b/gi, 'py')
          // Espacios se mantienen (se convertirán a %20)
        
        // Usar URL con keyword en el PATH (funciona con %20 para espacios)
        const searchUrl = `${BASE_URL}/trabajo-empleo/${encodeURIComponent(normalizedKeyword)}`;
        
        onProgress?.(`Navegando a ${searchUrl}...`, progress);
        
        await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(3000);
        
        // Cargar todos los resultados (scroll + click "Ver más")
        const totalLoaded = await loadAllResults(page, (msg) => onProgress?.(msg, progress));
        onProgress?.(`Cargados ${totalLoaded} resultados`, progress);
        
        // Extraer todos los links
        const jobLinks = await page.$$('a[href*="/trabajo/"]');
        
        for (const linkEl of jobLinks) {
          try {
            const href = await linkEl.evaluate((el: any) => el.href);
            const titleText = await linkEl.evaluate(el => el.textContent?.trim());
            
            if (href && titleText && href.includes('/trabajo/') && titleText.length > 3) {
              jobs.push({
                id: generateId(),
                keyword,
                title: titleText,
                company: 'Empresa no especificada',
                date: 'Hoy',
                link: href,
                source: sourceName,
                scannedAt,
              });
            }
          } catch {
            // Skip jobs con errores de extracción
          }
        }

        onProgress?.(`"${keyword}" - ${jobs.filter(j => j.keyword === keyword).length} empleos`, progress);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        onProgress?.(`Error: ${msg}`, progress);
      }
    }
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  // Eliminar duplicados
  const uniqueJobs = jobs.filter((job, index, self) => 
    index === self.findIndex(j => j.link === job.link)
  );

  onProgress?.(`Listo: ${uniqueJobs.length} empleos únicos`, 100);
  return uniqueJobs;
}

const scraper: PluginScraper = {
  sourceName,
  scan,
};

export default scraper;