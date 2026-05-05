// src/core/use-cases/plugins/SyncPluginsUseCase.ts
/**
 * SyncPluginsUseCase
 * Sincroniza plugins locales con el repositorio remoto
 * - Descarga nuevos plugins disponibles
 * - Actualiza plugins que tienen nueva versión
 */
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import envPaths from 'env-paths';
import { fetchRemoteManifest, getPluginRepoUrls } from './FetchRemoteManifestUseCase.js';
import { installPlugin, type InstallPluginResult } from './InstallPluginUseCase.js';
import type { PluginMetadata } from '../../plugins/PluginMetadata.js';

const execAsync = promisify(exec);

export interface PluginSyncInfo {
  pluginId: string;
  name: string;
  localVersion?: string;
  remoteVersion: string;
  status: 'new' | 'update' | 'up-to-date';
  action: 'install' | 'update' | 'none';
}

export interface SyncResult {
  success: boolean;
  synced: PluginSyncInfo[];
  errors: string[];
  updated: number;
  installed: number;
}

// Cargar metadata de plugins instalados
const loadInstalledPluginsMetadata = (): PluginMetadata[] => {
  const paths = envPaths('jobtracker', { suffix: '' });
  const metadataPath = path.join(paths.data, 'plugins', 'PluginsMetadata.json');
  
  if (!fs.existsSync(metadataPath)) return [];
  
  try {
    return JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  } catch {
    return [];
  }
};

// Comparar versiones semver
const isNewerVersion = (current: string, latest: string): boolean => {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    const c = currentParts[i] || 0;
    const l = latestParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
};

// Descargar plugin como archivo temporal
const downloadPlugin = async (
  pluginId: string,
  onProgress?: (message: string) => void
): Promise<string | null> => {
  const { getPluginUrl } = getPluginRepoUrls();
  const url = getPluginUrl(pluginId);
  const tempPath = path.join('/tmp', `${pluginId}.scrapper`);
  
  onProgress?.(`Descargando ${pluginId}...`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      onProgress?.(`Error descargando ${pluginId}: ${response.status}`);
      return null;
    }
    
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(tempPath, Buffer.from(buffer));
    
    return tempPath;
    
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    onProgress?.(`Error descargando ${pluginId}: ${msg}`);
    return null;
  }
};

// Sincronizar un plugin específico
const syncSinglePlugin = async (
  pluginId: string,
  remoteVersion: string,
  installedPlugins: PluginMetadata[],
  onProgress?: (message: string) => void
): Promise<{ action: 'install' | 'update' | 'none'; result?: InstallPluginResult }> => {
  
  const installed = installedPlugins.find(p => p.pluginId === pluginId);
  
  if (!installed) {
    // Plugin no instalado, descargar e instalar
    const tempPath = await downloadPlugin(pluginId, onProgress);
    if (!tempPath) {
      return { action: 'none' };
    }
    
    const result = await installPlugin(tempPath, onProgress);
    fs.unlinkSync(tempPath); // Limpiar archivo temporal
    
    return { action: 'install', result };
  }
  
  // Plugin instalado, comparar versiones
  if (isNewerVersion(installed.pluginVersion, remoteVersion)) {
    const tempPath = await downloadPlugin(pluginId, onProgress);
    if (!tempPath) {
      return { action: 'none' };
    }
    
    const result = await installPlugin(tempPath, onProgress);
    fs.unlinkSync(tempPath); // Limpiar archivo temporal
    
    return { action: 'update', result };
  }
  
  return { action: 'none' };
};

// Función principal de sincronización
export const syncPlugins = async (
  onProgress?: (message: string) => void
): Promise<SyncResult> => {
  const result: SyncResult = {
    success: false,
    synced: [],
    errors: [],
    updated: 0,
    installed: 0
  };
  
  onProgress?.('Iniciando sincronización de plugins...');
  
  // 1. Obtener manifest remoto
  const manifestResult = await fetchRemoteManifest(onProgress);
  
  if (!manifestResult.success) {
    result.errors.push(manifestResult.error || 'Error al obtener manifest');
    return result;
  }
  
  const remotePlugins = manifestResult.availablePlugins;
  const installedPlugins = loadInstalledPluginsMetadata();
  
  onProgress?.(`Encontrados ${remotePlugins.length} plugins en repositorio`);
  
  // 2. Procesar cada plugin del repositorio
  for (const remote of remotePlugins) {
    const installed = installedPlugins.find(p => p.pluginId === remote.id);
    
    let status: 'new' | 'update' | 'up-to-date';
    let action: 'install' | 'update' | 'none';
    
    if (!installed) {
      status = 'new';
      action = 'install';
    } else if (isNewerVersion(installed.pluginVersion, remote.version)) {
      status = 'update';
      action = 'update';
    } else {
      status = 'up-to-date';
      action = 'none';
    }
    
    const syncInfo: PluginSyncInfo = {
      pluginId: remote.id,
      name: remote.name,
      localVersion: installed?.pluginVersion,
      remoteVersion: remote.version,
      status,
      action
    };
    
    // Ejecutar acción si es necesario
    if (action !== 'none') {
      const syncResult = await syncSinglePlugin(
        remote.id,
        remote.version,
        installedPlugins,
        onProgress
      );
      
      if (syncResult.result?.success) {
        if (action === 'install') result.installed++;
        if (action === 'update') result.updated++;
      } else {
        result.errors.push(`Error al ${action} ${remote.name}`);
      }
    }
    
    result.synced.push(syncInfo);
  }
  
  result.success = true;
  
  const total = result.installed + result.updated;
  if (total > 0) {
    onProgress?.(`Sincronización completada: ${result.installed} instalados, ${result.updated} actualizados`);
  } else {
    onProgress?.('Todos los plugins están actualizados');
  }
  
  return result;
};

// Sincronizar solo un plugin específico
export const syncPlugin = async (
  pluginId: string,
  onProgress?: (message: string) => void
): Promise<{ success: boolean; message: string }> => {
  // 1. Obtener manifest
  const manifestResult = await fetchRemoteManifest(onProgress);
  
  if (!manifestResult.success) {
    return { success: false, message: manifestResult.error || 'Error al obtener manifest' };
  }
  
  // 2. Buscar el plugin en el manifest
  const remote = manifestResult.availablePlugins.find(p => p.id === pluginId);
  
  if (!remote) {
    return { success: false, message: `Plugin ${pluginId} no encontrado en el repositorio` };
  }
  
  // 3. Obtener plugins instalados
  const installedPlugins = loadInstalledPluginsMetadata();
  const installed = installedPlugins.find(p => p.pluginId === pluginId);
  
  // 4. Ejecutar sincronización
  const { action } = await syncSinglePlugin(
    pluginId,
    remote.version,
    installedPlugins,
    onProgress
  );
  
  if (action === 'none') {
    return { success: true, message: 'Plugin ya está actualizado' };
  }
  
  return { 
    success: true, 
    message: action === 'install' ? 'Plugin instalado correctamente' : 'Plugin actualizado correctamente' 
  };
};