// src/infrastructure/plugins/PluginLoader.ts
import { PluginScraper } from '../../core/plugins/PluginScraper.js';
import { getPluginsDir } from './PluginPathResolver.js';
import path from 'path';
import fs from 'fs';
import { logger } from '../logger/Logger.js';

export const loadScraperPlugin = async (pluginId: string): Promise<PluginScraper> => {
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
  // Solución: crear node_modules dentro del plugin con enlace simbólico a playwright
  const pluginNodeModules = path.join(pluginDir, 'node_modules');
  const pluginPlaywright = path.join(pluginNodeModules, 'playwright');
  
  if (!fs.existsSync(pluginPlaywright) && !isDevMode) {
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
      // Crear estructura de node_modules en el plugin
      fs.mkdirSync(pluginNodeModules, { recursive: true });
      
      // Crear enlace simbólico al módulo de playwright
      try {
        fs.symlinkSync(playwrightPath, pluginPlaywright, 'dir');
        logger.info('PluginLoader: created playwright symlink', { pluginId, playwrightPath });
      } catch (e) {
        logger.error('PluginLoader: failed to create symlink', { error: e });
      }
    }
  }

  const mod = await import(jsPath);
  return mod.default || mod.scraper;
};