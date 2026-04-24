// src/core/use-cases/plugins/RunPluginsScanUseCase.ts
import type { Job } from '../../entities/Job.js';
import type { PluginScraper } from '../../plugins/PluginScraper.js';
import { readKeywords } from '../../../services/keywords.js';
import { loadScraperPlugin } from '../../../infrastructure/plugins/PluginLoader.js';

export interface ScanProgress {
  (message: string): void;
}

export const runPluginsScan = async (
  plugins: string[],
  onProgress?: ScanProgress,
  signal?: AbortSignal,
): Promise<Job[]> => {
  const keywords = await readKeywords();
  
  if (keywords.length === 0) {
    onProgress?.('No hay keywords configuradas');
    return [];
  }

  onProgress?.(`Keywords: ${keywords.join(', ')}`);
  
  const allJobs: Job[] = [];

  for (const pluginId of plugins) {
    if (signal?.aborted) {
      onProgress?.('Escaneo cancelado');
      break;
    }

    onProgress?.(`Ejecutando plugin: ${pluginId}`);

    try {
      const scraper = await loadScraperPlugin(pluginId);

      const jobs = await scraper.scan({
        keywords,
        onProgress,
        signal,
      });

      allJobs.push(...jobs);
      onProgress?.(`Plugin ${pluginId}: ${jobs.length} empleos`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      onProgress?.(`Error en plugin ${pluginId}: ${msg}`);
    }
  }

  const seen = new Set<string>();
  const uniqueJobs = allJobs.filter((job) => {
    const key = job.link.toLowerCase().replace(/#.*$/, '').replace(/\/$/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  onProgress?.(`Total únicos: ${uniqueJobs.length} empleos`);
  return uniqueJobs;
};