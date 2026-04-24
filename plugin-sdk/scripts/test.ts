#!/usr/bin/env tsx
/**
 * plugin-test.ts
 * Prueba un plugin localmente
 * 
 * Uso: npx tsx plugin-sdk/scripts/test.ts --name mi-plugin --keywords "python,react" [--path ./src/infrastructure/plugins]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Job {
  id: string;
  keyword: string;
  title: string;
  company: string;
  date: string;
  link: string;
  source: string;
  scannedAt: string;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const nameIndex = args.indexOf('--name');
  const pathIndex = args.indexOf('--path');
  const keywordsIndex = args.indexOf('--keywords');
  
  if (nameIndex < 0) {
    console.error('❌ Uso: test.ts --name <nombre-plugin> [--path <ruta>] [--keywords "kw1,kw2"]');
    console.error('   Ejemplo: test.ts --name trabajando-cl --keywords "python,react"');
    process.exit(1);
  }
  
  const keywordsStr = keywordsIndex >= 0 ? args[keywordsIndex + 1] : 'python,javascript';
  
  return {
    name: args[nameIndex + 1],
    path: pathIndex >= 0 ? args[pathIndex + 1] : './src/infrastructure/plugins',
    keywords: keywordsStr.split(',').map(k => k.trim())
  };
}

async function testPlugin(name: string, basePath: string, keywords: string[]): Promise<void> {
  const pluginPath = path.join(basePath, name);
  const scraperFile = path.join(pluginPath, 'scraper.ts');
  
  console.log(`\n🧪 Probando plugin: ${name}`);
  console.log(`📁 Ruta: ${pluginPath}`);
  console.log(`🔑 Keywords: ${keywords.join(', ')}`);
  
  // Verificar que existe
  if (!fs.existsSync(pluginPath)) {
    console.error(`❌ No existe el directorio: ${pluginPath}`);
    process.exit(1);
  }
  
  // Verificar que tiene scraper
  if (!fs.existsSync(scraperFile)) {
    console.error(`❌ No existe scraper.ts en: ${scraperFile}`);
    process.exit(1);
  }
  
  // Cargar el scraper dinámicamente
  console.log('\n📝 Cargando scraper...');
  
  let scraperModule: any;
  try {
    // Limpiar cache de módulos
    delete require.cache[require.resolve(scraperFile)];
    scraperModule = await import(scraperFile);
  } catch (err) {
    console.error(`❌ Error al cargar scraper: ${err}`);
    process.exit(1);
  }
  
  const scraper = scraperModule.default || scraperModule;
  
  if (!scraper || !scraper.scan) {
    console.error('❌ El scraper no exporta una función scan');
    process.exit(1);
  }
  
  console.log(`✅ Scraper cargado (source: ${scraper.sourceName})`);
  
  // Ejecutar scan
  console.log('\n🚀 Ejecutando scan...');
  const startTime = Date.now();
  
  try {
    const jobs: Job[] = await scraper.scan({
      keywords,
      onProgress: (msg: string, progress?: number) => {
        const progressStr = progress !== undefined ? ` [${progress}%]` : '';
        console.log(`   ${msg}${progressStr}`);
      }
    });
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\n═══════════════════════════════════════════`);
    console.log(`📊 RESULTADOS`);
    console.log(`═══════════════════════════════════════════`);
    console.log(`Total jobs: ${jobs.length}`);
    console.log(`Tiempo: ${elapsed}s`);
    
    // Resumen por keyword
    console.log('\n📋 Por keyword:');
    for (const kw of keywords) {
      const count = jobs.filter(j => j.keyword === kw).length;
      console.log(`   ${kw}: ${count} jobs`);
    }
    
    // Mostrar sample
    if (jobs.length > 0) {
      console.log('\n📋 Sample (primeros 10):');
      jobs.slice(0, 10).forEach((job, i) => {
        console.log(`   ${i + 1}. ${job.title.substring(0, 60)}`);
        console.log(`      Keyword: ${job.keyword} | Empresa: ${job.company}`);
      });
    }
    
    // Guardar resultado
    const outputPath = path.join(pluginPath, `test-results-${Date.now()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(jobs, null, 2));
    console.log(`\n💾 Guardado en: ${outputPath}`);
    
  } catch (err) {
    console.error(`\n❌ Error durante el scan: ${err}`);
    process.exit(1);
  }
  
  console.log('\n✅ Test completado');
}

// Ejecutar
const options = parseArgs();
testPlugin(options.name, options.path, options.keywords);