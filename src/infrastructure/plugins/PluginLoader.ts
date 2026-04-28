// src/infrastructure/plugins/PluginLoader.ts
import { PluginScraper } from '../../core/plugins/PluginScraper.js';
import { getPluginDir } from './PluginPathResolver.js';
import path from 'path';
import fs from 'fs';

export const loadScraperPlugin = async (pluginId: string): Promise<PluginScraper> => {
  const pluginDir = getPluginDir(pluginId); // Usa getPluginDir que usa getPluginsDir()
  
  if (!fs.existsSync(pluginDir)) {
    throw new Error(`Plugin directory not found: ${pluginDir}`);
  }

    const isDevMode = process.env.JOBTRACKER_DEV === 'true';
  
  // En modo dev:plugin buscar primero scraper.ts
  if (isDevMode) {
    const tsPath = path.join(pluginDir, 'scraper.ts');
    if (fs.existsSync(tsPath)) {
      const mod = await import(tsPath);
      return mod.default || mod.scraper;
    }
  }

  // Buscar scraper.js (funciona en ambos modos)
  const jsPath = path.join(pluginDir, 'scraper.js');
  if (!fs.existsSync(jsPath)) {
    throw new Error(`Scraper not found in plugin: ${pluginDir}`);
  }

  const mod = await import(jsPath);
  return mod.default || mod.scraper;
};