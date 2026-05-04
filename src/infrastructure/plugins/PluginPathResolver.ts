// src/infrastructure/plugins/PluginPathResolver.ts
import path from 'path';
import { APP_PATHS } from '../config/paths.js';

const isDev = process.env.JOBTRACKER_DEV === 'true';
const projectRoot = process.cwd();

// JOBTRACKER_DEV busca plugins en ./src/infrastructure/plugins (del proyecto)
// Producción busca en ~/.local/share/jobtracker/plugins
export const getPluginsDir = () => {
  if (isDev) {
    return path.join(projectRoot, 'src/infrastructure/plugins');
  }
  return APP_PATHS.plugins;
};

export const getPluginDir = (pluginId: string) => 
  path.join(getPluginsDir(), pluginId);

export const getPluginsMetadataPath = () => 
  path.join(APP_PATHS.plugins, 'PluginsMetadata.json');