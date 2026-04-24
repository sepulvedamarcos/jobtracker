// src/infrastructure/plugins/PluginRegistry.ts
import type { PluginMetadata } from '../../core/plugins/PluginMetadata.js';
import path from 'path';
import fs from 'fs';
import { getPluginsDir } from './PluginPathResolver.js';

const DEV_PLUGINS: Record<string, string> = {
  'trabajando-cl': 'trabajando-cl',
};

const isPluginDevMode = process.env.JOBTRACKER_PLUGIN_DEV === 'true';

export const getPlugins = (): PluginMetadata[] => {
  const plugins: PluginMetadata[] = [];
  const pluginsDir = getPluginsDir(); // AQUÍ está la magia - retorna según modo
  
  if (fs.existsSync(pluginsDir)) {
    const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('_')) continue; // skip temp dirs
      
      // En modo dev:plugin, solo incluir los de DEV_PLUGINS
      if (isPluginDevMode && !DEV_PLUGINS[entry.name]) continue;
      
      const metadataPath = path.join(pluginsDir, entry.name, 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          plugins.push({
            ...metadata,
            enabled: true,
          });
        } catch {
          // Skip invalid metadata
        }
      }
    }
  }

  return plugins;
};

// Alias para compatibilidad
export const getDevPlugins = (): PluginMetadata[] => getPlugins();