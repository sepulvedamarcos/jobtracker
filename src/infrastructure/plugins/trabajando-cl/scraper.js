// src/infrastructure/plugins/trabajando-cl/scraper.ts
import { chromium } from "playwright";
var BASE_URL = "https://www.trabajando.cl";
var generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
var sourceName = "trabajando.cl";
async function loadAllResults(page, onProgress) {
  let prevCount = 0;
  let iterations = 0;
  const maxIterations = 10;
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1e3);
  while (iterations < maxIterations) {
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const verMas = buttons.find((b) => b.textContent?.includes("Ver m\xE1s"));
      if (verMas) {
        verMas.click();
        return true;
      }
      return false;
    });
    if (clicked) {
      onProgress?.(`Cargando m\xE1s resultados...`);
      await page.waitForTimeout(2e3);
    }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1e3);
    const currentCount = await page.$$eval('a[href*="/trabajo/"]', (links) => links.length);
    if (currentCount === prevCount && !clicked) {
      break;
    }
    onProgress?.(`Resultados: ${currentCount}`);
    prevCount = currentCount;
    iterations++;
  }
  return prevCount;
}
async function scan(input) {
  const { keywords, onProgress } = input;
  const jobs = [];
  const scannedAt = (/* @__PURE__ */ new Date()).toISOString();
  const totalKeywords = keywords.length;
  onProgress?.(`Iniciando con ${totalKeywords} keywords...`, 0);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });
  const page = await context.newPage();
  try {
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      const progress = Math.round(i / totalKeywords * 100);
      onProgress?.(`"${keyword}" (${i + 1}/${totalKeywords})`, progress);
      try {
        const normalizedKeyword = keyword.toLowerCase().trim().replace(/\.js\b/gi, "js").replace(/\.net\b/gi, "net").replace(/\.ts\b/gi, "ts").replace(/\.py\b/gi, "py");
        const searchUrl = `${BASE_URL}/trabajo-empleo/${encodeURIComponent(normalizedKeyword)}`;
        onProgress?.(`Navegando a ${searchUrl}...`, progress);
        await page.goto(searchUrl, { waitUntil: "networkidle", timeout: 6e4 });
        await page.waitForTimeout(3e3);
        const totalLoaded = await loadAllResults(page, (msg) => onProgress?.(msg, progress));
        onProgress?.(`Cargados ${totalLoaded} resultados`, progress);
        const jobLinks = await page.$$('a[href*="/trabajo/"]');
        for (const linkEl of jobLinks) {
          try {
            const href = await linkEl.evaluate((el) => el.href);
            const titleText = await linkEl.evaluate((el) => el.textContent?.trim());
            if (href && titleText && href.includes("/trabajo/") && titleText.length > 3) {
              jobs.push({
                id: generateId(),
                keyword,
                title: titleText,
                company: "Empresa no especificada",
                date: "Hoy",
                link: href,
                source: sourceName,
                scannedAt
              });
            }
          } catch {
          }
        }
        onProgress?.(`"${keyword}" - ${jobs.filter((j) => j.keyword === keyword).length} empleos`, progress);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        onProgress?.(`Error: ${msg}`, progress);
      }
    }
  } finally {
    await context.close().catch(() => {
    });
    await browser.close().catch(() => {
    });
  }
  const uniqueJobs = jobs.filter(
    (job, index, self) => index === self.findIndex((j) => j.link === job.link)
  );
  onProgress?.(`Listo: ${uniqueJobs.length} empleos \xFAnicos`, 100);
  return uniqueJobs;
}
var scraper = {
  sourceName,
  scan
};
var scraper_default = scraper;
export {
  scraper_default as default,
  sourceName
};
