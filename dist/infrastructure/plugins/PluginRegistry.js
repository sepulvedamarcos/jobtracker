import path from 'path';
import fs from 'fs';
import { getPluginsDir } from './PluginPathResolver.js';
export const getPlugins = () => {
    const plugins = [];
    const pluginsDir = getPluginsDir();
    if (fs.existsSync(pluginsDir)) {
        const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isDirectory())
                continue;
            if (entry.name.startsWith('_'))
                continue; // skip temp dirs
            if (entry.name === 'plugins')
                continue; // skip parent plugins dir
            const metadataPath = path.join(pluginsDir, entry.name, 'metadata.json');
            if (fs.existsSync(metadataPath)) {
                try {
                    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
                    plugins.push({
                        ...metadata,
                        enabled: true,
                    });
                }
                catch {
                    // Skip invalid metadata
                }
            }
        }
    }
    return plugins;
};
// Alias para compatibilidad
export const getDevPlugins = () => getPlugins();
