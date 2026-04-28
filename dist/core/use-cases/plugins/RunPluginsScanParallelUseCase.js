import { readKeywords } from '../../../services/keywords.js';
import { loadScraperPlugin } from '../../../infrastructure/plugins/PluginLoader.js';
import { APP_PATHS } from '../../../infrastructure/config/paths.js';
import fs from 'fs';
import path from 'path';
// Logger simple que escribe a archivo
const logFile = () => path.join(path.dirname(APP_PATHS.jobs), 'scan-debug.log');
const logger = {
    info: (msg) => {
        const line = `[INFO] ${new Date().toISOString()} ${msg}`;
        fs.appendFileSync(logFile(), line + '\n');
    },
    debug: (msg) => {
        const line = `[DEBUG] ${new Date().toISOString()} ${msg}`;
        fs.appendFileSync(logFile(), line + '\n');
    },
    clear: () => {
        try {
            fs.unlinkSync(logFile());
        }
        catch { }
    }
};
// Limpiar log al inicio
logger.clear();
// Limpiar archivos temporales de scans anteriores
const cleanupTempFiles = () => {
    try {
        const tempDir = path.dirname(APP_PATHS.jobs);
        const entries = fs.readdirSync(tempDir);
        for (const entry of entries) {
            if (entry.startsWith('temp_') && entry.endsWith('.json')) {
                fs.unlinkSync(path.join(tempDir, entry));
            }
        }
    }
    catch { }
};
// Guardar jobs de una keyword en temp file
const saveTempJobs = (pluginId, keyword, jobs) => {
    const tempPath = path.join(path.dirname(APP_PATHS.jobs), `temp_${pluginId}_${Buffer.from(keyword).toString('base64').slice(0, 10)}.json`);
    fs.writeFileSync(tempPath, JSON.stringify(jobs, null, 2));
};
// Leer todos los temp files
const loadAllTempJobs = () => {
    const tempDir = path.dirname(APP_PATHS.jobs);
    const entries = fs.readdirSync(tempDir);
    const jobs = [];
    for (const entry of entries) {
        if (entry.startsWith('temp_') && entry.endsWith('.json')) {
            try {
                const data = fs.readFileSync(path.join(tempDir, entry), 'utf-8');
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    jobs.push(...parsed);
                }
            }
            catch { }
        }
    }
    return jobs;
};
// Ejecutar plugins en paralelo
export const runPluginsScanParallel = async (plugins, onProgress, signal) => {
    const keywords = await readKeywords();
    if (keywords.length === 0) {
        return {
            success: false,
            jobs: [],
            message: 'No hay keywords configuradas.',
            pluginResults: []
        };
    }
    // Limpiar temp files de scans anteriores
    cleanupTempFiles();
    const pluginResults = [];
    // Cargar todos los plugins primero
    onProgress?.({ plugin: 'init', message: 'Cargando plugins...', progress: 0 });
    const loadedPlugins = new Map();
    for (const pluginId of plugins) {
        try {
            const scraper = await loadScraperPlugin(pluginId);
            loadedPlugins.set(pluginId, scraper);
            pluginResults.push({ pluginId, count: 0 });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            pluginResults.push({ pluginId, count: 0, error: msg });
        }
    }
    // Ejecutar todos los plugins en paralelo
    const allJobs = [];
    const totalPlugins = loadedPlugins.size;
    const scanPromises = Array.from(loadedPlugins.entries()).map(async ([pluginId, scraper], index) => {
        if (signal?.aborted) {
            return [];
        }
        const baseProgress = Math.round((index / totalPlugins) * 100);
        onProgress?.({
            plugin: pluginId,
            message: `Plugin ${pluginId}`,
            progress: baseProgress
        });
        try {
            const jobs = await scraper.scan({
                keywords,
                onProgress: (msg, progress) => {
                    // Usar progreso del scraper (keywords) o fallback al base
                    onProgress?.({
                        plugin: pluginId,
                        message: msg,
                        progress: progress ?? baseProgress
                    });
                },
                signal,
            });
            // Guardar jobs de este plugin en temp file
            const tempPath = path.join(path.dirname(APP_PATHS.jobs), `temp_${pluginId}.json`);
            fs.writeFileSync(tempPath, JSON.stringify(jobs, null, 2));
            // Actualizar resultado
            const resultIndex = pluginResults.findIndex(r => r.pluginId === pluginId);
            if (resultIndex >= 0) {
                pluginResults[resultIndex].count = jobs.length;
            }
            return jobs;
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            const resultIndex = pluginResults.findIndex(r => r.pluginId === pluginId);
            if (resultIndex >= 0) {
                pluginResults[resultIndex].error = msg;
            }
            return [];
        }
    });
    // Esperar todos los resultados
    const results = await Promise.all(scanPromises);
    for (const jobs of results) {
        allJobs.push(...jobs);
    }
    onProgress?.({ plugin: 'done', message: 'Deduplicando...', progress: 95 });
    // Cargar todos los temp y deduplicar
    const allTempJobs = loadAllTempJobs();
    logger.debug(`Jobs en temp files: ${allTempJobs.length}`);
    if (allTempJobs.length > 0) {
        logger.debug(`Sample links: ${allTempJobs.slice(0, 3).map(j => j.link).join(', ')}`);
    }
    const seen = new Map(); // URL -> Job (primera aparición)
    let dupesFound = 0;
    for (const job of allTempJobs) {
        const normalizedUrl = job.link
            .toLowerCase()
            .replace(/#.*$/, '') // Quitar hash
            .replace(/\/$/, ''); // Quitar trailing slash
        if (seen.has(normalizedUrl)) {
            dupesFound++;
        }
        else {
            seen.set(normalizedUrl, job);
        }
    }
    logger.debug(`Dupes encontrados: ${dupesFound}`);
    logger.debug(`Unique jobs: ${seen.size}`);
    const uniqueJobs = Array.from(seen.values());
    // Limpiar temp files
    // TODO: descomentar después de debug
    // cleanupTempFiles();
    onProgress?.({ plugin: 'done', message: 'Completado', progress: 100 });
    return {
        success: true,
        jobs: uniqueJobs,
        message: `${uniqueJobs.length} avisos únicos encontrados.`,
        pluginResults,
    };
};
