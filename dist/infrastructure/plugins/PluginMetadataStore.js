// src/infrastructure/plugins/PluginMetadataStore.ts
import fs from 'fs';
import { getPluginsMetadataPath } from './PluginPathResolver.js';
export const loadPluginsMetadata = () => {
    const path = getPluginsMetadataPath();
    if (!fs.existsSync(path))
        return [];
    const data = fs.readFileSync(path, 'utf-8');
    return JSON.parse(data);
};
export const savePluginsMetadata = (plugins) => {
    const path = getPluginsMetadataPath();
    fs.writeFileSync(path, JSON.stringify(plugins, null, 2));
};
export const addPluginMetadata = (plugin) => {
    const plugins = loadPluginsMetadata();
    const existingIndex = plugins.findIndex(p => p.pluginId === plugin.pluginId);
    if (existingIndex >= 0) {
        plugins[existingIndex] = plugin;
    }
    else {
        plugins.push(plugin);
    }
    savePluginsMetadata(plugins);
};
export const removePluginMetadata = (pluginId) => {
    const plugins = loadPluginsMetadata().filter(p => p.pluginId !== pluginId);
    savePluginsMetadata(plugins);
};
export const getEnabledPlugins = () => {
    return loadPluginsMetadata().filter(p => p.enabled);
};
