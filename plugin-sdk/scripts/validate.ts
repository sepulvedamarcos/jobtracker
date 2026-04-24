#!/usr/bin/env tsx
/**
 * plugin-validate.ts
 * Valida la estructura de un plugin
 * 
 * Uso: npx tsx plugin-sdk/scripts/validate.ts --name mi-plugin [--path ./src/infrastructure/plugins]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function parseArgs() {
  const args = process.argv.slice(2);
  const nameIndex = args.indexOf('--name');
  const pathIndex = args.indexOf('--path');
  
  if (nameIndex < 0) {
    console.error('❌ Uso: validate.ts --name <nombre-plugin> [--path <ruta>]');
    process.exit(1);
  }
  
  return {
    name: args[nameIndex + 1],
    path: pathIndex >= 0 ? args[pathIndex + 1] : './src/infrastructure/plugins'
  };
}

function validateMetadata(metadataPath: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!fs.existsSync(metadataPath)) {
    errors.push('metadata.json no existe');
    return { errors, warnings };
  }
  
  let metadata: any;
  try {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  } catch {
    errors.push('metadata.json no es JSON válido');
    return { errors, warnings };
  }
  
  // Campos requeridos
  const requiredFields = ['pluginId', 'name', 'pluginVersion', 'author', 'mainFile'];
  for (const field of requiredFields) {
    if (!metadata[field]) {
      errors.push(`Falta campo requerido: ${field}`);
    }
  }
  
  // Validaciones adicionales
  if (metadata.mainFile && !metadata.mainFile.endsWith('.js')) {
    errors.push('mainFile debe terminar en .js');
  }
  
  if (metadata.pluginId && !/^[a-z0-9-]+$/.test(metadata.pluginId)) {
    errors.push('pluginId debe usar solo minúsculas, números y guiones');
  }
  
  // Warnings
  if (!metadata.capabilities) {
    warnings.push('Falta sección capabilities');
  }
  
  return { errors, warnings };
}

function validateScraper(pluginPath: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const tsFile = path.join(pluginPath, 'scraper.ts');
  const jsFile = path.join(pluginPath, 'scraper.js');
  
  if (!fs.existsSync(tsFile) && !fs.existsSync(jsFile)) {
    errors.push('No existe scraper.ts ni scraper.js');
    return { errors, warnings };
  }
  
  // Verificar que tiene export default o export { scan }
  const sourceFile = fs.existsSync(tsFile) ? tsFile : jsFile;
  const content = fs.readFileSync(sourceFile, 'utf-8');
  
  if (!content.includes('sourceName') && !content.includes('source_name')) {
    warnings.push('No se encontró declaración de sourceName');
  }
  
  if (!content.includes('async function scan')) {
    errors.push('No se encontró función scan async');
  }
  
  if (!content.includes('PluginScraper')) {
    warnings.push('No se encontró tipo PluginScraper importado');
  }
  
  return { errors, warnings };
}

function validateNotas(pluginPath: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const notasPath = path.join(pluginPath, 'NOTAS.md');
  
  if (!fs.existsSync(notasPath)) {
    warnings.push('Falta NOTAS.md (recomendado para documentar limitaciones)');
  }
  
  return { errors, warnings };
}

function validatePlugin(name: string, basePath: string): ValidationResult {
  const pluginPath = path.join(basePath, name);
  const result: ValidationResult = { valid: true, errors: [], warnings: [] };
  
  console.log(`\n🔍 Validando plugin: ${name}`);
  console.log(`📁 Ruta: ${pluginPath}`);
  
  if (!fs.existsSync(pluginPath)) {
    result.errors.push(`No existe el directorio: ${pluginPath}`);
    result.valid = false;
    return result;
  }
  
  // Validar metadata.json
  console.log('\n📄 Validando metadata.json...');
  const metadataResult = validateMetadata(path.join(pluginPath, 'metadata.json'));
  result.errors.push(...metadataResult.errors.map(e => `metadata: ${e}`));
  result.warnings.push(...metadataResult.warnings.map(w => `metadata: ${w}`));
  
  // Validar scraper
  console.log('📝 Validando scraper...');
  const scraperResult = validateScraper(pluginPath);
  result.errors.push(...scraperResult.errors.map(e => `scraper: ${e}`));
  result.warnings.push(...scraperResult.warnings.map(w => `scraper: ${w}`));
  
  // Validar NOTAS.md
  console.log('📋 Validando NOTAS.md...');
  const notasResult = validateNotas(pluginPath);
  result.warnings.push(...notasResult.warnings.map(w => `notas: ${w}`));
  
  result.valid = result.errors.length === 0;
  
  return result;
}

function printResult(result: ValidationResult): void {
  console.log('\n═══════════════════════════════════════════');
  
  if (result.valid) {
    console.log('✅ Plugin válido');
  } else {
    console.log('❌ Plugin inválido');
  }
  
  if (result.errors.length > 0) {
    console.log('\n🔴 Errores:');
    result.errors.forEach(e => console.log(`   ${e}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('\n🟡 Advertencias:');
    result.warnings.forEach(w => console.log(`   ${w}`));
  }
  
  console.log('═══════════════════════════════════════════\n');
}

const options = parseArgs();
const result = validatePlugin(options.name, options.path);
printResult(result);

process.exit(result.valid ? 0 : 1);