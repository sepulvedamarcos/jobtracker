// src/core/use-cases/plugins/InstallPluginUseCase.ts
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import envPaths from 'env-paths';
import type { PluginMetadata, PluginCapabilities } from '../../plugins/PluginMetadata.js';

const execAsync = promisify(exec);

// Log a archivo en .local/share/jobtracker/
const logInstall = (...args: unknown[]) => {
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
  const paths = envPaths('jobtracker', { suffix: '' });
  const logPath = path.join(paths.data, 'install.log');
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}\n`;
  fs.writeFileSync(logPath, line, { flag: 'a' });
};

export interface InstallPluginResult {
  success: boolean;
  message: string;
  plugin?: PluginMetadata;
}

// Contrato mínimo de metadata.json
interface PluginMetadataJson {
  pluginId: string;
  name: string;
  pluginVersion: string;
  author?: string;
  capabilities?: PluginCapabilities;
}

// Validar que el objeto cumpla con el contrato de metadata
const isValidMetadata = (obj: unknown): obj is PluginMetadataJson => {
  if (!obj || typeof obj !== 'object') return false;
  const record = obj as Record<string, unknown>;
  return (
    typeof record.pluginId === 'string' &&
    record.pluginId.length > 0 &&
    typeof record.name === 'string' &&
    record.name.length > 0 &&
    typeof record.pluginVersion === 'string' &&
    record.pluginVersion.length > 0
  );
};

// Validar que el módulo cumple con el contrato de PluginScraper
const isValidScraperModule = (mod: unknown): boolean => {
  if (!mod || typeof mod !== 'object') return false;
  const m = mod as Record<string, unknown>;
  return (
    typeof m.sourceName === 'string' &&
    typeof m.scan === 'function'
  );
};

export const installPlugin = async (
  scrapperPath: string,
  onProgress?: (message: string) => void
): Promise<InstallPluginResult> => {
  const paths = envPaths('jobtracker', { suffix: '' });
  const pluginsDir = path.join(paths.data, 'plugins');
  logInstall('=== NUEVA INSTALACION ===', 'pluginsDir:', pluginsDir);
  
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

  onProgress?.('Iniciando instalación del plugin...');
  logInstall('Iniciando:', scrapperPath);

  // 1. Validar que el archivo existe y es un .scrapper
  if (!scrapperPath.toLowerCase().endsWith('.scrapper')) {
    return { success: false, message: 'El archivo debe tener extensión .scrapper' };
  }

  if (!fs.existsSync(scrapperPath)) {
    return { success: false, message: 'El archivo no existe' };
  }

  onProgress?.('Archivo encontrado, convirtiendo a ZIP...');

  const tempDir = path.join(pluginsDir, '_temp_install');

  try {
    // Asegurar que existe pluginsDir
    if (!fs.existsSync(pluginsDir)) {
      fs.mkdirSync(pluginsDir, { recursive: true });
    }
    
    // Limpiar directorio temporal
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    // 2. Copiar y renombrar a zip
    onProgress?.('Descomprimiendo...');
    
    const zipPath = scrapperPath + '.zip';
    fs.copyFileSync(scrapperPath, zipPath);
    
    // Usar comando unzip del sistema
    await execAsync(`unzip -o "${zipPath}" -d "${tempDir}"`);
    fs.unlinkSync(zipPath);

    // 3. Validar estructura
    const files = fs.readdirSync(tempDir);
    const metadataFile = files.find(f => f === 'metadata.json');
    const jsFile = files.find(f => f.endsWith('.js'));

    if (!metadataFile) {
      return { success: false, message: 'Falta archivo metadata.json' };
    }

    if (!jsFile) {
      return { success: false, message: 'Falta archivo scraper.js' };
    }

    onProgress?.('Validando metadata.json...');

    // 4. Leer y validar metadata.json
    const metadataContent = fs.readFileSync(path.join(tempDir, 'metadata.json'), 'utf-8');
    let pluginData: unknown;
    
    try {
      pluginData = JSON.parse(metadataContent);
    } catch {
      return { success: false, message: 'metadata.json no es JSON válido' };
    }

    if (!isValidMetadata(pluginData)) {
      return { 
        success: false, 
        message: 'metadata.json no cumple con el contrato (falta pluginId, name, pluginVersion)' 
      };
    }

    onProgress?.('Validando scraper.js...');

    // 5. Validar que scraper.js cumple con el contrato
    const scraperPathFull = path.join(tempDir, jsFile);
    const scraperModule = await import(scraperPathFull);

    if (!isValidScraperModule(scraperModule)) {
      return { 
        success: false, 
        message: 'scraper.js no cumple con el contrato (falta sourceName o scan)' 
      };
    }

    // 6. Verificar que no esté ya instalado
    const existingPlugins = loadPluginsMetadata();
    const alreadyExists = existingPlugins.some(p => p.pluginId === pluginData.pluginId);

    if (alreadyExists) {
      onProgress?.(`Plugin ${pluginData.pluginId} ya instalado, actualizando...`);
    }

    // 7. Mover a la carpeta final
    const pluginDir = path.join(pluginsDir, pluginData.pluginId);
    logInstall('Moviendo a:', pluginDir);
    
    if (fs.existsSync(pluginDir)) {
      logInstall('Directorio ya existe, eliminar y reescribir');
      fs.rmSync(pluginDir, { recursive: true });
    }
    
    fs.renameSync(tempDir, pluginDir);
    logInstall('Movido OK:', pluginDir);

    // 8. Registrar en metadata
    const finalMetadata: PluginMetadata = {
      pluginId: pluginData.pluginId,
      name: pluginData.name,
      pluginVersion: pluginData.pluginVersion,
      author: pluginData.author || 'Unknown',
      capabilities: pluginData.capabilities,
      enabled: true,
    };

    if (alreadyExists) {
      const updatedPlugins = existingPlugins.map(p => 
        p.pluginId === pluginData.pluginId ? finalMetadata : p
      );
      savePluginsMetadata(updatedPlugins);
    } else {
      const updatedPlugins = [...existingPlugins, finalMetadata];
      savePluginsMetadata(updatedPlugins);
    }

    onProgress?.(`Plugin ${pluginData.name} instalado correctamente`);
    logInstall('FINALIZADO OK:', pluginData.name);
    
    return { 
      success: true, 
      message: `Plugin ${pluginData.name} instalado correctamente`,
      plugin: finalMetadata,
    };
    logInstall('FINALIZADO OK:', pluginData.name);

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    logInstall('ERROR:', msg);
    return { success: false, message: `Error durante instalación: ${msg}` };
  } finally {
    // Limpiar temporales solo si existen
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true });
      }
      const tempZip = scrapperPath + '.zip';
      if (fs.existsSync(tempZip)) {
        fs.unlinkSync(tempZip);
      }
    } catch {
      // Ignorar errores al limpiar
    }
  }
};