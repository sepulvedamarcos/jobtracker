// src/core/use-cases/plugins/FetchRemoteManifestUseCase.ts
/**
 * FetchRemoteManifestUseCase
 * Obtiene el manifest.json desde el repositorio de plugins
 */
import type { PluginMetadata } from '../../plugins/PluginMetadata.js';

// URL del repositorio de plugins
const PLUGIN_REPO_OWNER = 'sepulvedamarcos';
const PLUGIN_REPO_NAME = 'jobtracker-plugins';
const MANIFEST_URL = `https://raw.githubusercontent.com/${PLUGIN_REPO_OWNER}/${PLUGIN_REPO_NAME}/main/manifest.json`;
const PLUGIN_BASE_URL = `https://raw.githubusercontent.com/${PLUGIN_REPO_OWNER}/${PLUGIN_REPO_NAME}/main`;

// Para desarrollo local
const LOCAL_PLUGINS_PATH = '/home/marcos/Desarrollo/Nodejs/jobtracker-plugins';

// Interfaces basadas en la estructura del manifest.json
export interface RemotePluginInfo {
  id: string;
  name: string;
  version: string;
  description?: string;
}

export interface RemoteManifest {
  version: string;
  generated: string;
  plugins: RemotePluginInfo[];
}

// Interfaz extendida de plugin para UI
export interface PluginWithRemote extends PluginMetadata {
  source: 'local' | 'remote';
  latestVersion?: string;
  updateAvailable: boolean;
  downloadUrl?: string;
  lastCheck?: string;
}

export interface FetchManifestResult {
  success: boolean;
  manifest?: RemoteManifest;
  availablePlugins: RemotePluginInfo[];
  error?: string;
}

// URLs del repositorio
export const getPluginRepoUrls = () => ({
  manifestUrl: MANIFEST_URL,
  baseUrl: PLUGIN_BASE_URL,
  getPluginUrl: (pluginId: string) => `${PLUGIN_BASE_URL}/${pluginId}.scrapper`
});

// Fetch del manifest desde GitHub
export const fetchRemoteManifest = async (
  onProgress?: (message: string) => void
): Promise<FetchManifestResult> => {
  onProgress?.('Conectando con repositorio de plugins...');
  
  try {
    const response = await fetch(MANIFEST_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'JobTracker/1.0'
      }
    });
    
    if (!response.ok) {
      return {
        success: false,
        availablePlugins: [],
        error: `Error al obtener manifest: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json() as RemoteManifest;
    
    onProgress?.(`Manifest cargado: ${data.plugins.length} plugins disponibles`);
    
    return {
      success: true,
      manifest: data,
      availablePlugins: data.plugins
    };
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    return {
      success: false,
      availablePlugins: [],
      error: `Error de conexión: ${errorMessage}`
    };
  }
};

// Obtener lista de plugins disponibles (sin metadata local)
// Para uso en modo offline o desarrollo local
export const fetchAvailablePlugins = async (
  onProgress?: (message: string) => void
): Promise<RemotePluginInfo[]> => {
  const result = await fetchRemoteManifest(onProgress);
  return result.availablePlugins;
};