// PluginScraper for trabajar.cl using Playwright
import type { PluginScraper, PluginScraperInput } from '../../../core/plugins/PluginScraper.js';
import type { Job } from '../../../core/entities/Job.js';
import { chromium } from 'playwright';

const BASE_URL = 'https://www.trabajando.cl';

const generateId = () => 
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const sourceName = 'trabajando.cl';

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
        const keywordEncoded = encodeURIComponent(keyword);
        const searchUrl = `${BASE_URL}/trabajo-empleo/chile?q=${keywordEncoded}`;
        
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Esperar a que Nuxt renderice el contenido dinámico
        await page.waitForTimeout(10000);
        
        // Los empleos tienen links con patrón /trabajo/
        const linkElements = await page.$$('a[href*="/trabajo/"]');
        
        for (const linkEl of linkElements) {
          try {
            const href = await linkEl.evaluate(el => el.href);
            const title = await linkEl.evaluate(el => el.textContent?.trim());
            
            if (href && title && href.includes('/trabajo/')) {
              // Buscar la empresa cercana en el container
              const parent = await linkEl.$('xpath=../..');
              const companyEl = parent ? await parent.$('[class*="empresa"], [class*="company"]') : null;
              const company = companyEl ? await companyEl.evaluate(el => el.textContent?.trim()) : null;
              
              jobs.push({
                id: generateId(),
                keyword,
                title,
                company: company || 'Empresa no especificada',
                date: 'Hoy',
                link: href,
                source: sourceName,
                scannedAt,
              });
            }
          } catch {
            // Skip
          }
        }

        onProgress?.(`"${keyword}" - ${linkElements.length} empleos`, progress);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        onProgress?.(`Error: ${msg}`, progress);
      }
    }
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  onProgress?.(`Listo: ${jobs.length} empleos`, 100);
  return jobs;
}

const scraper: PluginScraper = {
  sourceName,
  scan,
};

export default scraper;