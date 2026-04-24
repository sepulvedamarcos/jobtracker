// src/infrastructure/plugins/PluginMetadataStore.ts
import fs from 'fs';
import { PluginMetadata } from '../../core/plugins/PluginMetadata.js';
import { getPluginsMetadataPath } from './PluginPathResolver.js';

export const loadPluginsMetadata = (): PluginMetadata[] => {
  const path = getPluginsMetadataPath();
  if (!fs.existsSync(path)) return [];
  const data = fs.readFileSync(path, 'utf-8');
  return JSON.parse(data);
};

export const savePluginsMetadata = (plugins: PluginMetadata[]): void => {
  const path = getPluginsMetadataPath();
  fs.writeFileSync(path, JSON.stringify(plugins, null, 2));
};

export const addPluginMetadata = (plugin: PluginMetadata): void => {
  const plugins = loadPluginsMetadata();
  const existingIndex = plugins.findIndex(p => p.pluginId === plugin.pluginId);
  if (existingIndex >= 0) {
    plugins[existingIndex] = plugin;
  } else {
    plugins.push(plugin);
  }
  savePluginsMetadata(plugins);
};

export const removePluginMetadata = (pluginId: string): void => {
  const plugins = loadPluginsMetadata().filter(p => p.pluginId !== pluginId);
  savePluginsMetadata(plugins);
};

export const getEnabledPlugins = (): PluginMetadata[] => {
  return loadPluginsMetadata().filter(p => p.enabled);
};