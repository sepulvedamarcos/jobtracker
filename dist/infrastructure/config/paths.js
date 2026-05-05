// src/infrastructure/config/paths.ts
import envPaths from 'env-paths';
import path from 'path';
import fs from 'fs';
// Producción: ~/.local/share/jobtracker
// Desarrollo: usa plugins del proyecto, pero datos siempre en prod
const paths = envPaths('jobtracker', { suffix: '' });
// Aseguramos que las carpetas existan al iniciar
export const initializePaths = () => {
    const dataDir = paths.data;
    const configDir = paths.config;
    [dataDir, configDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    // Carpeta específica para plugins ZIP
    const pluginsPath = path.join(dataDir, 'plugins');
    if (!fs.existsSync(pluginsPath))
        fs.mkdirSync(pluginsPath);
    return {
        data: dataDir,
        config: configDir,
        jobs: path.join(dataDir, 'jobs.json'),
        keywords: path.join(dataDir, 'keywords.json'),
        applications: path.join(dataDir, 'applications.json'),
        plugins: pluginsPath
    };
};
export const APP_PATHS = initializePaths();
