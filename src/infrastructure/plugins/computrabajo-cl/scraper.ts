// PluginScraper para computrabajo.cl usando Playwright
import type { PluginScraper, PluginScraperInput } from '../../../core/plugins/PluginScraper.js';
import type { Job } from '../../../core/entities/Job.js';
import { chromium } from 'playwright';

const BASE_URL = 'https://cl.computrabajo.com';

const generateId = () => 
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const sourceName = 'computrabajo.cl';

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
    
    const currentCount = await page.$$eval('a[href*="/ofertas-de-trabajo/"]', links => links.length);
    
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

  // User agents más realistas
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ];

  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
    ]
  });
  
  // Rotar user agent
  const randomAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  
  const context = await browser.newContext({ 
    userAgent: randomAgent,
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    }
  });
  const page = await context.newPage();

  try {
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      const progress = Math.round((i / totalKeywords) * 100);
      
      onProgress?.(`"${keyword}" (${i + 1}/${totalKeywords})`, progress);

      try {
        // Normalizar keyword para computrabajo
        const normalizedKeyword = keyword
          .toLowerCase()
          .trim()
          .replace(/\.js\b/gi, 'javascript')
          .replace(/\.net\b/gi, 'dotnet')
          .replace(/\.ts\b/gi, 'typescript')
          .replace(/\s+/g, '-');
        
        // Computrabajo usa formato: /trabajo-de-{keyword}
        const searchUrl = `${BASE_URL}/trabajo-de-${encodeURIComponent(normalizedKeyword)}`;
        
        onProgress?.(`Navegando a ${searchUrl}...`, progress);
        
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(5000);
        
        // Verificar si hay protección
        const title = await page.title();
        if (title.includes('403') || title.includes('Forbidden')) {
          onProgress?.(`⚠️ Sitio protegido, intentando con URL alternativa...`, progress);
          
          // Intentar con formato diferente
          const altUrl = `${BASE_URL}/trabajo?q=${encodeURIComponent(normalizedKeyword)}`;
          await page.goto(altUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await page.waitForTimeout(5000);
        }
        
        // Cargar todos los resultados
        const totalLoaded = await loadAllResults(page, (msg) => onProgress?.(msg, progress));
        onProgress?.(`Cargados ${totalLoaded} resultados`, progress);
        
        // Extraer todos los links de ofertas
        const jobLinks = await page.$$('a[href*="/ofertas-de-trabajo/"]');
        
        for (const linkEl of jobLinks) {
          try {
            const href = await linkEl.evaluate((el: any) => el.href);
            const titleText = await linkEl.evaluate(el => el.textContent?.trim());
            
            if (href && titleText && href.includes('/ofertas-de-trabajo/') && titleText.length > 3) {
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