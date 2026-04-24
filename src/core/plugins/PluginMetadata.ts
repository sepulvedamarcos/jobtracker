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
}