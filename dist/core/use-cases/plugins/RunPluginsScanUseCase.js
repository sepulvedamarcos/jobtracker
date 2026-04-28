import { readKeywords } from '../../../services/keywords.js';
import { loadScraperPlugin } from '../../../infrastructure/plugins/PluginLoader.js';
export const runPluginsScan = async (plugins, onProgress, signal) => {
    const keywords = await readKeywords();
    if (keywords.length === 0) {
        onProgress?.('No hay keywords configuradas');
        return [];
    }
    onProgress?.(`Keywords: ${keywords.join(', ')}`);
    const allJobs = [];
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
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            onProgress?.(`Error en plugin ${pluginId}: ${msg}`);
        }
    }
    const seen = new Set();
    const uniqueJobs = allJobs.filter((job) => {
        const key = job.link.toLowerCase().replace(/#.*$/, '').replace(/\/$/, '');
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
    onProgress?.(`Total únicos: ${uniqueJobs.length} empleos`);
    return uniqueJobs;
};
