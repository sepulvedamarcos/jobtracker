// src/core/use-cases/plugins/RunScanUseCase.ts
import type { Job } from '../../entities/Job.js';
import type { PluginScraper } from '../../plugins/PluginScraper.js';
import { readKeywords } from '../../../services/keywords.js';
import { loadScraperPlugin } from '../../../infrastructure/plugins/PluginLoader.js';

export interface ScanProgress {
    keyword: string;
    plugin?: string;
    message: string;
    progress: number; // 0-100
}

export interface ScanResult {
    success: boolean;
    jobs: Job[];
    pluginResults: {
        pluginId: string;
        count: number;
        error?: string;
    }[];
    totalFound: number;
    message: string;
}

export const runScan = async (
    plugins: string[],
    onProgress?: (p: ScanProgress) => void,
    signal?: AbortSignal,
): Promise<ScanResult> => {
    const keywords = await readKeywords();

    if (keywords.length === 0) {
        return {
            success: false,
            jobs: [],
            pluginResults: [],
            totalFound: 0,
            message: 'No hay keywords configuradas.',
        };
    }

    const loadedPlugins: Map<string, PluginScraper> = new Map();
    const pluginStats: Record<string, { count: number; error?: string }> = {};

    // Pre-load plugins
    for (const pluginId of plugins) {
        try {
            const scraper = await loadScraperPlugin(pluginId);
            loadedPlugins.set(pluginId, scraper);
            pluginStats[pluginId] = { count: 0 };
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            pluginStats[pluginId] = { count: 0, error: msg };
        }
    }

    const allJobs: Job[] = [];
    const totalKeywords = keywords.length;
    const activePlugins = Array.from(loadedPlugins.keys());

    for (let i = 0; i < totalKeywords; i++) {
        if (signal?.aborted) break;

        const keyword = keywords[i];
        const keywordProgress = Math.round((i / totalKeywords) * 100);

        // Ejecutar los plugins para esta palabra secuencialmente para evitar solapamiento de mensajes en CLI
        for (const pluginId of activePlugins) {
            if (signal?.aborted) break;

            const scraper = loadedPlugins.get(pluginId)!;
            
            onProgress?.({
                keyword,
                plugin: pluginId,
                message: `Buscando "${keyword}" en ${pluginId}...`,
                progress: keywordProgress,
            });

            try {
                const jobs = await scraper.scan({
                    keywords: [keyword],
                    onProgress: (msg) => {
                        onProgress?.({
                            keyword,
                            plugin: pluginId,
                            message: msg,
                            progress: keywordProgress,
                        });
                    },
                    signal,
                });
                
                allJobs.push(...jobs);
                pluginStats[pluginId].count += jobs.length;
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Unknown error';
                pluginStats[pluginId].error = msg;
            }
        }
    }

    // Deduplicación final
    const seen = new Map<string, Job>();
    for (const job of allJobs) {
        const normalizedUrl = job.link
            .toLowerCase()
            .replace(/#.*$/, '')
            .replace(/\/$/, '');
        
        if (!seen.has(normalizedUrl)) {
            seen.set(normalizedUrl, job);
        }
    }

    const uniqueJobs = Array.from(seen.values());
    const totalFound = allJobs.length;

    const pluginResults = plugins.map(id => ({
        pluginId: id,
        count: pluginStats[id]?.count || 0,
        error: pluginStats[id]?.error,
    }));

    return {
        success: true,
        jobs: uniqueJobs,
        pluginResults,
        totalFound,
        message: `${uniqueJobs.length} avisos únicos encontrados de un total de ${totalFound}.`,
    };
};
