// src/core/use-cases/plugins/ComparePluginsUseCase.ts
/**
 * ComparePluginsUseCase
 * Compara plugins locales con el repositorio remoto
 * Proporciona información para UI y CLI sobre el estado de los plugins
 */
import type { PluginMetadata } from '../../plugins/PluginMetadata.js';
import { fetchRemoteManifest, type RemotePluginInfo } from './FetchRemoteManifestUseCase.js';
import { getPluginsDir } from '../../../infrastructure/plugins/PluginPathResolver.js';
import fs from 'fs';
import path from 'path';

// Información del plugin para mostrar en UI
export interface PluginCompareInfo {
  pluginId: string;
  name: string;
  localVersion?: string;
  remoteVersion?: string;
  status: 'installed-up-to-date' | 'installed-outdated' | 'available-not-installed';
  message: string;
}

// Resultado de la comparación
export interface ComparePluginsResult {
  success: boolean;
  localPlugins: PluginCompareInfo[];
  availablePlugins: PluginCompareInfo[];
  totalInstalled: number;
  totalAvailable: number;
  totalOutdated: number;
  playwrightAvailable: boolean;
  playwrightInstallCommand: string;
  error?: string;
}

// Verificar si playwright está disponible (checkeando node_modules)
const checkPlaywright = (): boolean => {
  // Verificar via filesystem ya que require() no funciona bien en ESM
  const playwrightPath = path.resolve('./node_modules/playwright');
  return fs.existsSync(playwrightPath);
};

// Cargar plugins locales usando getPluginsDir
const loadLocalPlugins = (): PluginMetadata[] => {
  const pluginsDir = getPluginsDir();
  const plugins: PluginMetadata[] = [];
  
  if (!fs.existsSync(pluginsDir)) {
    return [];
  }
  
  try {
    const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('_')) continue;
      if (entry.name === 'plugins') continue;
      
      const metadataPath = path.join(pluginsDir, entry.name, 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        plugins.push({
          ...metadata,
          enabled: true,
        });
      }
    }
  } catch {
    return [];
  }
  
  return plugins;
};

// Comparar versión semver
const compareVersions = (local: string, remote: string): 'newer' | 'older' | 'equal' => {
  const localParts = local.split('.').map(Number);
  const remoteParts = remote.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    const l = localParts[i] || 0;
    const r = remoteParts[i] || 0;
    if (r > l) return 'newer';
    if (r < l) return 'older';
  }
  return 'equal';
};

// Función principal: comparar plugins locales vs remotos
export const comparePlugins = async (
  onProgress?: (message: string) => void
): Promise<ComparePluginsResult> => {
  const playwrightAvailable = checkPlaywright();
  
  const result: ComparePluginsResult = {
    success: false,
    localPlugins: [],
    availablePlugins: [],
    totalInstalled: 0,
    totalAvailable: 0,
    totalOutdated: 0,
    playwrightAvailable,
    playwrightInstallCommand: 'npm install -g playwright && npx playwright install',
  };
  
  onProgress?.('Cargando plugins locales...');
  const localPlugins = loadLocalPlugins();
  
  onProgress?.('Conectando con repositorio...');
  const manifestResult = await fetchRemoteManifest();
  
  if (!manifestResult.success) {
    result.error = manifestResult.error;
    return result;
  }
  
  const remotePlugins = manifestResult.availablePlugins || [];
  
  // Procesar plugins locales
  for (const local of localPlugins) {
    const remote = remotePlugins.find(p => p.id === local.pluginId);
    
    let status: PluginCompareInfo['status'];
    let message: string;
    
    if (remote) {
      const comparison = compareVersions(local.pluginVersion, remote.version);
      
      if (comparison === 'newer') {
        status = 'installed-outdated';
        message = `v${local.pluginVersion} → v${remote.version} (ejecuta --sync-plugins)`;
        result.totalOutdated++;
      } else {
        status = 'installed-up-to-date';
        message = `v${local.pluginVersion} (actualizado)`;
      }
    } else {
      status = 'installed-up-to-date';
      message = `v${local.pluginVersion}`;
    }
    
    result.localPlugins.push({
      pluginId: local.pluginId,
      name: local.name,
      localVersion: local.pluginVersion,
      remoteVersion: remote?.version,
      status,
      message,
    });
  }
  
  // Procesar plugins disponibles remotos que no están instalados
  const localIds = localPlugins.map(p => p.pluginId);
  for (const remote of remotePlugins) {
    if (!localIds.includes(remote.id)) {
      result.availablePlugins.push({
        pluginId: remote.id,
        name: remote.name,
        remoteVersion: remote.version,
        status: 'available-not-installed',
        message: `v${remote.version} (ejecuta --sync-plugins para instalar)`,
      });
    }
  }
  
  result.totalInstalled = result.localPlugins.length;
  result.totalAvailable = result.availablePlugins.length;
  result.success = true;
  
  return result;
};

// Función simple para obtener solo el estado de un plugin específico
export const getPluginStatus = async (
  pluginId: string
): Promise<PluginCompareInfo | null> => {
  const compareResult = await comparePlugins();
  
  // Buscar en locales
  const local = compareResult.localPlugins.find(p => p.pluginId === pluginId);
  if (local) return local;
  
  // Buscar en disponibles
  const remote = compareResult.availablePlugins.find(p => p.pluginId === pluginId);
  if (remote) return remote;
  
  return null;
};