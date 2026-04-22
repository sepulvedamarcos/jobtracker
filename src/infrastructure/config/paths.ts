// src/infrastructure/config/paths.ts
import envPaths from 'env-paths';
import path from 'path';
import fs from 'fs';

// El nombre 'jobtracker' definirá la carpeta:
// Linux: ~/.local/share/jobtracker
// Windows: %APPDATA%/jobtracker/Data
const paths = envPaths('jobtracker', { suffix: '' });

// Aseguramos que las carpetas existan al iniciar
export const initializePaths = () => {
    [paths.data, paths.config].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    
    // Carpeta específica para plugins ZIP
    const pluginsPath = path.join(paths.data, 'plugins');
    if (!fs.existsSync(pluginsPath)) fs.mkdirSync(pluginsPath);
    
    return {
        jobs: path.join(paths.data, 'jobs.json'),
        keywords: path.join(paths.config, 'keywords.json'),
        applications: path.join(paths.data, 'applications.json'),
        plugins: pluginsPath
    };
};

export const APP_PATHS = initializePaths();
