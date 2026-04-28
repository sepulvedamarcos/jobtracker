// src/infrastructure/plugins/PluginPathResolver.ts
import path from 'path';
import { APP_PATHS } from '../config/paths.js';
const isPluginDevMode = process.env.JOBTRACKER_PLUGIN_DEV === 'true';
const projectRoot = process.cwd();
// ÚNICA función que determina la ruta de plugins según el modo
export const getPluginsDir = () => {
    if (isPluginDevMode) {
        return path.join(projectRoot, 'src/infrastructure/plugins');
    }
    return APP_PATHS.plugins;
};
export const getPluginDir = (pluginId) => path.join(getPluginsDir(), pluginId);
export const getPluginsMetadataPath = () => path.join(APP_PATHS.plugins, 'PluginsMetadata.json');
