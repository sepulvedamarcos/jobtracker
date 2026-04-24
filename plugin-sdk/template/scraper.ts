// PluginScraper para [NOMBRE DEL PORTAL]
// Este es un template. Modifica según las necesidades del sitio.
import type { PluginScraper, PluginScraperInput } from '../../core/plugins/PluginScraper.js';
import type { Job } from '../../core/entities/Job.js';
import { chromium } from 'playwright';

const BASE_URL = 'https://www.ejemplo.com';

const generateId = () => 
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const sourceName = 'ejemplo.com';

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
        // Ajusta la URL según el patrón del sitio
        // Algunos usan ?q=keyword, otros usan /keyword
        const searchUrl = `${BASE_URL}/jobs?q=${encodeURIComponent(keyword)}`;
        
        await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(3000);
        
        // Ajusta el selector según la estructura del sitio
        const jobLinks = await page.$$('a.job-link, a[href*="/job/"]');
        
        for (const linkEl of jobLinks) {
          const href = await linkEl.evaluate(el => el.href);
          const titleText = await linkEl.evaluate(el => el.textContent?.trim());
          
          if (href && titleText && titleText.length > 3) {
            jobs.push({
              id: generateId(),
              keyword,
              title: titleText,
              company: 'Empresa no especificada', // Ajustar según estructura
              date: 'Hoy', // Ajustar según estructura
              link: href,
              source: sourceName,
              scannedAt,
            });
          }
        }

        onProgress?.(`"${keyword}" - ${jobs.filter(j => j.keyword === keyword).length} empleos`, progress);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        onProgress?.(`Error con "${keyword}": ${msg}`, progress);
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