// src/core/use-cases/plugins/DownloadPluginUseCase.ts
/**
 * DownloadPluginUseCase
 * Descarga un plugin específico del repositorio
 */
import fs from 'fs';
import path from 'path';
import { fetchRemoteManifest, getPluginRepoUrls, type RemotePluginInfo } from './FetchRemoteManifestUseCase.js';
import { installPlugin, type InstallPluginResult } from './InstallPluginUseCase.js';

export interface DownloadPluginResult {
  success: boolean;
  message: string;
  pluginName?: string;
}

// Descargar y almacenar un plugin específico
export const downloadPlugin = async (
  pluginId: string,
  onProgress?: (message: string) => void
): Promise<DownloadPluginResult> => {
  
  onProgress?.(`Buscando plugin ${pluginId}...`);
  
  // 1. Obtener manifest
  const manifestResult = await fetchRemoteManifest();
  
  if (!manifestResult.success) {
    return { success: false, message: manifestResult.error || 'Error al obtener manifest' };
  }
  
  // 2. Buscar el plugin en el manifest
  const remotePlugin = manifestResult.availablePlugins.find(p => p.id === pluginId);
  
  if (!remotePlugin) {
    return { success: false, message: `Plugin "${pluginId}" no encontrado en el repositorio` };
  }
  
  // 3. Descargar el plugin
  const { getPluginUrl } = getPluginRepoUrls();
  const url = getPluginUrl(pluginId);
  const tempPath = path.join('/tmp', `${pluginId}.scrapper`);
  
  onProgress?.(`Descargando ${remotePlugin.name} v${remotePlugin.version}...`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return { success: false, message: `Error al descargar: ${response.status}` };
    }
    
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(tempPath, Buffer.from(buffer));
    
    onProgress?.(`Instalando ${remotePlugin.name}...`);
    
    // 4. Instalar el plugin
    const installResult = await installPlugin(tempPath, onProgress);
    
    // Limpiar archivo temporal
    try { fs.unlinkSync(tempPath); } catch {}
    
    if (installResult.success) {
      return {
        success: true,
        message: `Plugin ${remotePlugin.name} v${remotePlugin.version} instalado correctamente`,
        pluginName: remotePlugin.name,
      };
    } else {
      return { success: false, message: installResult.message };
    }
    
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    return { success: false, message: `Error: ${msg}` };
  }
};

// Listar plugins disponibles (sin descargar)
export const listAvailablePlugins = async (
  onProgress?: (message: string) => void
): Promise<RemotePluginInfo[]> => {
  const manifestResult = await fetchRemoteManifest(onProgress);
  return manifestResult.availablePlugins || [];
};