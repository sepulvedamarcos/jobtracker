import { getPluginsDir } from './PluginPathResolver.js';
import path from 'path';
import fs from 'fs';
import { logger } from '../logger/Logger.js';
export const loadScraperPlugin = async (pluginId) => {
    const pluginsDir = getPluginsDir();
    const pluginDir = path.join(pluginsDir, pluginId);
    if (!fs.existsSync(pluginDir)) {
        throw new Error(`Plugin directory not found: ${pluginDir}`);
    }
    const isDevMode = process.env.JOBTRACKER_DEV === 'true';
    // En modo dev: buscar primero scraper.ts
    if (isDevMode) {
        const tsPath = path.join(pluginDir, 'scraper.ts');
        if (fs.existsSync(tsPath)) {
            const mod = await import(tsPath);
            return mod.default || mod.scraper;
        }
    }
    // Buscar scraper.js
    const jsPath = path.join(pluginDir, 'scraper.js');
    if (!fs.existsSync(jsPath)) {
        throw new Error(`Scraper not found in plugin: ${pluginDir}`);
    }
    // Crear shim de playwright en el directorio del plugin si no existe
    const playwrightShimPath = path.join(pluginDir, 'playwright.js');
    if (!fs.existsSync(playwrightShimPath) && !isDevMode) {
        // Buscar playwright desde la ubicación del ejecutable
        const exeDir = path.dirname(process.execPath);
        // Buscar en node_modules del binario
        let playwrightPath = '';
        const searchPaths = [
            path.join(exeDir, 'node_modules/playwright'),
            path.join(exeDir, '../lib/node_modules/jobtracker/node_modules/playwright'),
            path.join(exeDir, '../../lib/node_modules/jobtracker/node_modules/playwright'),
        ];
        for (const p of searchPaths) {
            if (fs.existsSync(path.join(p, 'package.json'))) {
                playwrightPath = p;
                break;
            }
        }
        logger.debug('PluginLoader: searching playwright', { searchPaths, found: !!playwrightPath });
        if (playwrightPath) {
            // Crear shim con require relativo
            const shimContent = `// Auto-generated shim - do not edit
const path = require('path');
const basePath = path.dirname(require.main.filename);
const resolved = path.join(basePath, 'node_modules/playwright');
module.exports = require(resolved);
`;
            fs.writeFileSync(playwrightShimPath, shimContent);
            logger.info('PluginLoader: created playwright shim', { pluginId, playwrightPath });
        }
    }
    const mod = await import(jsPath);
    return mod.default || mod.scraper;
};
