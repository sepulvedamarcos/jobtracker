// src/core/plugins/PluginMetadata.ts
export interface PluginCapabilities {
  supportsKeywordSearch: boolean;
  supportsPagination?: boolean;
  requiresAuth?: boolean;
  sources?: string[];
}

export interface PluginMetadata {
  pluginId: string;
  name: string;
  pluginVersion: string;
  author: string;
  capabilities?: PluginCapabilities;
  enabled: boolean;
  // Campos para integración con repositorio remoto
  source?: 'local' | 'remote';
  latestVersion?: string;
  updateAvailable?: boolean;
  downloadUrl?: string;
  lastCheck?: string;
}

// Plugin info desde el manifest remoto (más liviano)
export interface RemotePluginInfo {
  id: string;
  name: string;
  version: string;
  description?: string;
}