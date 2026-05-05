#!/usr/bin/env tsx
/**
 * generate-manifest.ts
 * Genera el manifest.json escaneando los plugins compilados
 * 
 * Uso: npx tsx plugin-sdk/scripts/generate-manifest.ts [--path ./src/infrastructure/plugins] [--output ./plugins]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface PluginInfo {
  id: string;
  name: string;
  version: string;
  description: string;
}

interface Manifest {
  version: string;
  generated: string;
  plugins: PluginInfo[];
}

function parseArgs() {
  const args = process.argv.slice(2);
  const pathIndex = args.indexOf('--path');
  const outputIndex = args.indexOf('--output');
  
  return {
    path: pathIndex >= 0 ? args[pathIndex + 1] : './src/infrastructure/plugins',
    output: outputIndex >= 0 ? args[outputIndex + 1] : './plugins'
  };
}

function generateManifest(basePath: string, outputPath: string): void {
  const pluginsDir = path.join(__dirname, '..', '..', basePath);
  const outputDir = path.join(__dirname, '..', '..', outputPath);
  
  console.log('\n📋 Generando manifest.json');
  console.log(`📁 Plugins: ${pluginsDir}`);
  console.log(`📁 Output: ${outputDir}`);
  
  const plugins: PluginInfo[] = [];
  
  if (!fs.existsSync(pluginsDir)) {
    console.error('❌ No existe el directorio de plugins');
    process.exit(1);
  }
  
  const entries = fs.readdirSync(pluginsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('_')) continue;
    if (entry.name === 'plugins') continue;
    
    const pluginPath = path.join(pluginsDir, entry.name);
    const metadataPath = path.join(pluginPath, 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      console.log(`   ⚠️  ${entry.name}: Sin metadata.json, saltando`);
      continue;
    }
    
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      
      plugins.push({
        id: metadata.pluginId || entry.name,
        name: metadata.name || entry.name,
        version: metadata.pluginVersion || '1.0.0',
        description: metadata.description || `Plugin ${entry.name}`
      });
      
      console.log(`   ✓ ${metadata.name || entry.name} v${metadata.pluginVersion || '1.0.0'}`);
    } catch (err) {
      console.log(`   ⚠️  ${entry.name}: metadata.json inválido`);
    }
  }
  
  // Ordenar por nombre
  plugins.sort((a, b) => a.name.localeCompare(b.name));
  
  const manifest: Manifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    plugins
  };
  
  // Crear directorio de output si no existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const manifestPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`\n✅ Manifest generado: ${manifestPath}`);
  console.log(`📊 Total plugins: ${plugins.length}`);
}

const options = parseArgs();
generateManifest(options.path, options.output);