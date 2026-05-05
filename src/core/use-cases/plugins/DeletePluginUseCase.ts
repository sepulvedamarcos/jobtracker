// src/core/use-cases/plugins/DeletePluginUseCase.ts
import fs from 'fs';
import path from 'path';
import envPaths from 'env-paths';
import type { PluginMetadata } from '../../plugins/PluginMetadata.js';

export interface DeletePluginResult {
  success: boolean;
  message: string;
}

export const deletePlugin = async (
  pluginId: string,
  onProgress?: (message: string) => void
): Promise<DeletePluginResult> => {
  // Siempre usar producción para CLI - JOBTRACKER_DEV es solo para scan
  const paths = envPaths('jobtracker', { suffix: '' });
  const pluginsDir = path.join(paths.data, 'plugins');
  
  const getPluginsMetadataPath = () => path.join(pluginsDir, 'PluginsMetadata.json');
  
  const loadPluginsMetadata = (): PluginMetadata[] => {
    const p = getPluginsMetadataPath();
    if (!fs.existsSync(p)) return [];
    try {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch {
      return [];
    }
  };
  
  const savePluginsMetadata = (plugs: PluginMetadata[]): void => {
    const dir = path.dirname(getPluginsMetadataPath());
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(getPluginsMetadataPath(), JSON.stringify(plugs, null, 2));
  };

  onProgress?.('Iniciando eliminación del plugin...');
  
  // 1. Verificar que el plugin está instalado
  const existingPlugins = loadPluginsMetadata();
  const plugin = existingPlugins.find(p => p.pluginId === pluginId);
  
  if (!plugin) {
    return { 
      success: false, 
      message: `Plugin ${pluginId} no está instalado` 
    };
  }
  
  // 2. Eliminar la carpeta del plugin
  const pluginDir = path.join(pluginsDir, pluginId);
  
  if (fs.existsSync(pluginDir)) {
    fs.rmSync(pluginDir, { recursive: true });
    onProgress?.(`Carpeta ${pluginId} eliminada`);
  }
  
  // 3. Eliminar del registro de metadata
  const updatedPlugins = existingPlugins.filter(p => p.pluginId !== pluginId);
  savePluginsMetadata(updatedPlugins);
  
  onProgress?.(`Plugin ${plugin.name} eliminado correctamente`);
  
  return { 
    success: true, 
    message: `Plugin ${plugin.name} eliminado correctamente` 
  };
};