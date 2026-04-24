#!/usr/bin/env tsx
/**
 * plugin-build.ts
 * Compila un plugin de TypeScript a JavaScript
 * 
 * Uso: npx tsx plugin-sdk/scripts/build.ts --name mi-plugin [--path ./src/infrastructure/plugins]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Options {
  name: string;
  path: string;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const nameIndex = args.indexOf('--name');
  const pathIndex = args.indexOf('--path');
  
  if (nameIndex < 0) {
    console.error('❌ Uso: build.ts --name <nombre-plugin> [--path <ruta>]');
    console.error('   Ejemplo: build.ts --name mi-plugin --path ./src/infrastructure/plugins');
    process.exit(1);
  }
  
  return {
    name: args[nameIndex + 1],
    path: pathIndex >= 0 ? args[pathIndex + 1] : './src/infrastructure/plugins'
  };
}

async function buildPlugin(name: string, basePath: string): Promise<void> {
  const pluginPath = path.join(basePath, name);
  const tsFile = path.join(pluginPath, 'scraper.ts');
  const jsFile = path.join(pluginPath, 'scraper.js');
  
  console.log(`\n🔨 Compilando plugin: ${name}`);
  console.log(`📁 Ruta: ${pluginPath}`);
  
  // Verificar que existe
  if (!fs.existsSync(pluginPath)) {
    console.error(`❌ No existe el directorio: ${pluginPath}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(tsFile)) {
    console.error(`❌ No existe scraper.ts en: ${tsFile}`);
    process.exit(1);
  }
  
  // Verificar metadata.json
  const metadataPath = path.join(pluginPath, 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
    console.error(`❌ No existe metadata.json en: ${metadataPath}`);
    process.exit(1);
  }
  
  // Compilar con tsc
  console.log('\n📝 Compilando TypeScript...');
  
  const tscPath = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'tsc');
  const tsconfigPath = path.join(__dirname, '..', '..', 'tsconfig.json');
  
  // Crear tsconfig temporal para solo el plugin
  const pluginTsconfig = path.join(pluginPath, 'tsconfig.plugin.json');
  const tsconfigContent = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
  tsconfigContent.include = ['scraper.ts'];
  tsconfigContent.outDir = pluginPath;
  fs.writeFileSync(pluginTsconfig, JSON.stringify(tsconfigContent, null, 2));
  
  try {
    const { execSync } = await import('child_process');
    execSync(`npx tsc --project "${pluginTsconfig}"`, { 
      cwd: path.join(__dirname, '..', '..'),
      stdio: 'inherit' 
    });
    
    // Limpiar tsconfig temporal
    fs.unlinkSync(pluginTsconfig);
    
    // Verificar que se creó el archivo
    if (fs.existsSync(jsFile)) {
      console.log(`\n✅ Compilación exitosa: ${jsFile}`);
      
      // Verificar tamaño
      const stats = fs.statSync(jsFile);
      console.log(`📊 Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
      console.error('\n❌ Error: No se generó scraper.js');
      process.exit(1);
    }
    
  } catch (err) {
    console.error('\n❌ Error en compilación:', err);
    process.exit(1);
  }
}

// Ejecutar
const options = parseArgs();
buildPlugin(options.name, options.path);