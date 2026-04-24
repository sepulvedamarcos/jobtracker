#!/usr/bin/env tsx
/**
 * plugin-pack.ts
 * Empaqueta un plugin en un archivo .scrapper (ZIP)
 * 
 * Uso: npx tsx plugin-sdk/scripts/pack.ts --name mi-plugin [--path ./src/infrastructure/plugins]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const args = process.argv.slice(2);
  const nameIndex = args.indexOf('--name');
  const pathIndex = args.indexOf('--path');
  const outputIndex = args.indexOf('--output');
  
  if (nameIndex < 0) {
    console.error('❌ Uso: pack.ts --name <nombre-plugin> [--path <ruta>] [--output <carpeta>]');
    console.error('   Ejemplo: pack.ts --name mi-plugin --path ./src/infrastructure/plugins');
    process.exit(1);
  }
  
  return {
    name: args[nameIndex + 1],
    path: pathIndex >= 0 ? args[pathIndex + 1] : './src/infrastructure/plugins',
    output: outputIndex >= 0 ? args[outputIndex + 1] : './plugins'
  };
}

async function packPlugin(name: string, basePath: string, outputPath: string): Promise<void> {
  const pluginPath = path.join(basePath, name);
  const outputDir = outputPath.startsWith('/') ? outputPath : path.join(__dirname, '..', '..', outputPath);
  
  console.log(`\n📦 Empaquetando plugin: ${name}`);
  console.log(`📁 Plugin: ${pluginPath}`);
  console.log(`📁 Output: ${outputDir}`);
  
  // Verificar que existe
  if (!fs.existsSync(pluginPath)) {
    console.error(`❌ No existe el directorio: ${pluginPath}`);
    process.exit(1);
  }
  
  // Verificar que tiene los archivos necesarios
  const requiredFiles = ['metadata.json', 'scraper.js'];
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(pluginPath, file))) {
      console.error(`❌ Falta archivo requerido: ${file}`);
      process.exit(1);
    }
  }
  
  // Crear directorio de output si no existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Crear ZIP
  const zip = new JSZip();
  
  // Agregar archivos al ZIP
  const files = fs.readdirSync(pluginPath);
  for (const file of files) {
    const filePath = path.join(pluginPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      const content = fs.readFileSync(filePath);
      zip.file(file, content);
      console.log(`   + ${file}`);
    }
  }
  
  // Generar ZIP
  console.log('\n⏳ Generando archivo...');
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  
  // Guardar
  const zipName = `${name}.scrapper`;
  const zipPath = path.join(outputDir, zipName);
  fs.writeFileSync(zipPath, zipBuffer);
  
  console.log(`\n✅ Plugin empaquetado: ${zipPath}`);
  console.log(`📊 Tamaño: ${(zipBuffer.length / 1024).toFixed(2)} KB`);
  
  // Verificar que se puede leer
  try {
    const zipCheck = await JSZip.loadAsync(zipBuffer);
    const fileCount = Object.keys(zipCheck.files).length;
    console.log(`📦 Archivos en el paquete: ${fileCount}`);
  } catch {
    console.error('⚠️  Advertencia: No se pudo verificar el ZIP');
  }
}

// Ejecutar
const options = parseArgs();
packPlugin(options.name, options.path, options.output);