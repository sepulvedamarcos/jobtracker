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
import { execSync } from 'child_process';

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
  
  // Compilar usando esbuild via tsx
  console.log('\n📝 Compilando TypeScript...');
  
  try {
    // Crear un script temporal que use esbuild
    const buildScript = `
import * as esbuild from 'esbuild';

const inputFile = '${tsFile.replace(/\\/g, '\\\\')}';
const outputFile = '${jsFile.replace(/\\/g, '\\\\')}';

await esbuild.build({
  entryPoints: [inputFile],
  outfile: outputFile,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  bundle: true,
  external: ['playwright'],
  sourcemap: false,
  minify: false,
});

console.log('✅ Compilación exitosa');
`;
    
    const tmpFile = path.join(pluginPath, '.build-tmp.mjs');
    fs.writeFileSync(tmpFile, buildScript);
    
    execSync(`node "${tmpFile}"`, { 
      stdio: 'inherit' 
    });
    
    // Limpiar archivo temporal
    fs.unlinkSync(tmpFile);
    
    // Verificar que se creó el archivo
    if (fs.existsSync(jsFile)) {
      const stats = fs.statSync(jsFile);
      console.log(`\n✅ Compilación exitosa: ${jsFile}`);
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