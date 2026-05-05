#!/usr/bin/env node

import { Command } from 'commander';
import React, { useEffect, useState } from 'react';
import { render } from 'ink';
import { Splash } from '../tui/Splash.js';
import { MainLayout } from '../tui/MainLayout.js';
import { getVersion } from '../../../services/version.js';
import { JsonJobRepository } from '../../storage/JsonJobRepository.js';
import { JobService } from '../../../core/use-cases/JobService.js';
import { ApplicationService } from '../../../core/use-cases/ApplicationService.js';
import { addKeyword, readKeywords, removeKeyword } from '../../../services/keywords.js';
import { installPlugin } from '../../../core/use-cases/plugins/InstallPluginUseCase.js';
import { deletePlugin } from '../../../core/use-cases/plugins/DeletePluginUseCase.js';
import { getDevPlugins } from '../../plugins/PluginRegistry.js';
import { fetchRemoteManifest, getPluginRepoUrls } from '../../../core/use-cases/plugins/FetchRemoteManifestUseCase.js';
import { syncPlugins } from '../../../core/use-cases/plugins/SyncPluginsUseCase.js';
import { runScan } from '../../../core/use-cases/plugins/RunScanUseCase.js';
import { saveScannedJobsUseCase } from '../../../core/use-cases/jobs/SaveScannedJobsUseCase.js';

const program = new Command();
const jobRepository = new JsonJobRepository();
const jobService = new JobService(jobRepository);
const applicationService = new ApplicationService(jobRepository);

// --- El Orquestador ---
const Root = ({ autoScan, skipSplash }: { autoScan?: boolean; skipSplash?: boolean }) => {
  const [loading, setLoading] = useState(!(skipSplash || autoScan));

  useEffect(() => {
    if (skipSplash) {
      setLoading(false);
    }
  }, [skipSplash]);

  if (loading) {
    return <Splash onFinish={() => setLoading(false)} />;
  }

  // Pasamos el autoScan al MainLayout para que sepa si empezar a trabajar
  return <MainLayout autoScan={autoScan} jobService={jobService} applicationService={applicationService} />;
};

// --- Configuración de Commander ---
program
  .name('jobtracker')
  .description('TUI para búsqueda de empleos')
  .version(getVersion())
  .option('-s, --silent', 'Ejecutar sin interfaz visual (TUI) y salir al finalizar')
  .option('--noSplash, --nosplash', 'Iniciar directamente en la vista principal sin mostrar el splash')
  .option('-a, --addKey <keyword>, --addkey <keyword>', 'Agregar una keyword y salir')
  .option('--delKey <keyword>, --delkey <keyword>', 'Eliminar una keyword y salir')
  .option('-p, --addPlugin <ruta>, --addplugin <ruta>', 'Instalar un plugin desde ruta .scrapper y salir')
  .option('--delPlugin <pluginId>, --delplugin <pluginId>', 'Eliminar un plugin instalado y salir')
  .option('--listPlugins, --list-plugins', 'Listar plugins instalados')
  .option('--syncPlugins, --sync-plugins', 'Sincronizar plugins con el repositorio')
  .option('--listKeywords, --list-keywords', 'Listar keywords definidas')
  .action(async (options) => {
    const addKey = options.addKey ?? options.addkey;
    const delKey = options.delKey ?? options.delkey;
    const addPlugin = options.addPlugin ?? options.addplugin;
    const delPlugin = options.delPlugin ?? options.delplugin;
    const noSplash = options.noSplash ?? options.nosplash;
    const listPlugins = options.listPlugins ?? options['list-plugins'];
    const syncPluginsFlag = options.syncPlugins ?? options['sync-plugins'];
    const listKeywords = options.listKeywords ?? options['list-keywords'];

    // Eliminar plugin
    if (delPlugin) {
      console.log(`🗑️ Eliminando plugin: ${delPlugin}`);
      const result = await deletePlugin(delPlugin, (msg) => console.log(`  ${msg}`));
      
      if (result.success) {
        console.log(`✅ ${result.message}`);
      } else {
        console.log(`❌ ${result.message}`);
        process.exit(1);
      }
      process.exit(0);
    }

    // Instalar plugin
    if (addPlugin) {
      console.log(`📦 Instalando plugin: ${addPlugin}`);
      const result = await installPlugin(addPlugin, (msg) => console.log(`  ${msg}`));
      
      if (result.success) {
        console.log(`✅ ${result.message}`);
      } else {
        console.log(`❌ ${result.message}`);
        process.exit(1);
      }
      process.exit(0);
    }

    // Listar plugins instalados
    if (listPlugins) {
      console.log('📋 Plugins instalados:\n');
      
      const localPlugins = getDevPlugins();
      
      // Intentar obtener manifest remoto
      const manifestResult = await fetchRemoteManifest((msg) => console.log(`  ${msg}`));
      
      if (localPlugins.length === 0) {
        console.log('  No hay plugins instalados');
      }
      
      for (const plugin of localPlugins) {
        let status = '✓';
        let statusText = 'Actualizado';
        
        // Comparar con remoto si está disponible
        if (manifestResult.success && manifestResult.availablePlugins) {
          const remote = manifestResult.availablePlugins.find(p => p.id === plugin.pluginId);
          if (remote) {
            const localVer = plugin.pluginVersion.split('.').map(Number);
            const remoteVer = remote.version.split('.').map(Number);
            
            // Comparar versiones
            const isNewer = remoteVer[0] > localVer[0] || 
                          (remoteVer[0] === localVer[0] && remoteVer[1] > localVer[1]) ||
                          (remoteVer[0] === localVer[0] && remoteVer[1] === localVer[1] && remoteVer[2] > localVer[2]);
            
            if (isNewer) {
              status = '🔄';
              statusText = `v${plugin.pluginVersion} → v${remote.version} (ejecuta --sync-plugins)`;
            } else {
              statusText = `v${plugin.pluginVersion} (actualizado)`;
            }
          } else {
            statusText = `v${plugin.pluginVersion}`;
          }
        } else {
          statusText = `v${plugin.pluginVersion}`;
        }
        
        console.log(`  ${status} ${plugin.name} - ${statusText}`);
      }
      
      if (manifestResult.success && manifestResult.availablePlugins) {
        const remoteIds = manifestResult.availablePlugins.map(p => p.id);
        const localIds = localPlugins.map(p => p.pluginId);
        const newPlugins = remoteIds.filter(id => !localIds.includes(id));
        
        if (newPlugins.length > 0) {
          console.log('\n📦 Plugins disponibles en repositorio (no instalados):');
          for (const newId of newPlugins) {
            const remote = manifestResult.availablePlugins.find(p => p.id === newId);
            console.log(`  ✨ NEW - ${remote?.name} v${remote?.version} (ejecuta --sync-plugins para instalar)`);
          }
        }
      }
      
      console.log('\nUsa --sync-plugins para sincronizar');
      process.exit(0);
    }

    // Sincronizar plugins
    if (syncPluginsFlag) {
      console.log('🔄 Sincronizando plugins...\n');
      
      const result = await syncPlugins((msg) => console.log(`  ${msg}`));
      
      if (result.success) {
        console.log('\n═══════════════════════════════════════════');
        console.log('📊 RESUMEN DE SINCRONIZACIÓN');
        console.log('═══════════════════════════════════════════');
        
        for (const sync of result.synced) {
          if (sync.status === 'new') {
            console.log(`  ✨ NEW: ${sync.name} v${sync.remoteVersion}`);
          } else if (sync.status === 'update') {
            console.log(`  🔄 UPDATE: ${sync.name} v${sync.localVersion} → v${sync.remoteVersion}`);
          } else {
            console.log(`  ✓ OK: ${sync.name} v${sync.localVersion}`);
          }
        }
        
        if (result.errors.length > 0) {
          console.log('\n⚠️ Errores:');
          for (const err of result.errors) {
            console.log(`  - ${err}`);
          }
        }
        
        console.log(`\n✅ Instalados: ${result.installed}, Actualizados: ${result.updated}`);
      } else {
        console.log(`❌ Error: ${result.errors.join(', ')}`);
        process.exit(1);
      }
      
      process.exit(0);
    }

    // Listar keywords
    if (listKeywords) {
      console.log('🔑 Keywords definidas:\n');
      
      const keywords = await readKeywords();
      
      if (keywords.length === 0) {
        console.log('  No hay keywords definidas');
      } else {
        for (const kw of keywords) {
          console.log(`  - ${kw}`);
        }
      }
      
      console.log(`\nTotal: ${keywords.length} keywords`);
      process.exit(0);
    }

    if (delKey) {
      const beforeKeywords = await readKeywords();
      const nextKeywords = await removeKeyword(delKey);
      const wasRemoved = nextKeywords.length < beforeKeywords.length;

      if (wasRemoved) {
        console.log(`🗑️ Keyword eliminada: ${delKey.trim()}`);
      } else {
        console.log(`ℹ️ Keyword no encontrada: ${delKey.trim()}`);
      }

      process.exit(0);
    }

    if (addKey) {
      const beforeKeywords = await readKeywords();
      const nextKeywords = await addKeyword(addKey);
      const wasAdded = nextKeywords.length > beforeKeywords.length;

      if (wasAdded) {
        console.log(`✅ Keyword guardada: ${addKey.trim()}`);
      } else {
        console.log(`ℹ️ Keyword ya existía: ${addKey.trim()}`);
      }

      process.exit(0);
    }
    
    // CASO 1: Modo Silencioso (Sin TUI) - Ejecuta el scan y sale
    if (options.silent) {
      console.log('🚀 Iniciando escaneo silencioso...');
      
      try {
        // Obtener plugins disponibles
        const plugins = getDevPlugins();
        
        if (plugins.length === 0) {
          console.log('⚠️ No hay plugins instalados');
          process.exit(0);
        }
        
        const pluginIds = plugins.map(p => p.pluginId);
        console.log(`📋 Plugins a ejecutar: ${pluginIds.join(', ')}`);
        
        // Ejecutar el scan unificado
        const result = await runScan(pluginIds, (p) => {
            console.log(`  ℹ️ [${p.keyword}] ${p.plugin ? p.plugin : 'General'}: ${p.message} (${p.progress}%)`);
        });
        
        if (!result.success) {
            console.error(`❌ Error: ${result.message}`);
            process.exit(1);
        }

        console.log('\n═══════════════════════════════════════════');
        console.log('📊 RESULTADOS DEL ESCANEO');
        console.log('═══════════════════════════════════════════');
        
        result.pluginResults.forEach(r => {
            const status = r.error ? `❌ Error: ${r.error}` : `✅ ${r.count} avisos`;
            console.log(`${r.pluginId.padEnd(20)}: ${status}`);
        });

        console.log('-------------------------------------------');
        console.log(`Total bruto encontrado: ${result.totalFound}`);
        console.log(`Total únicos (filtrados): ${result.jobs.length}`);
        console.log('═══════════════════════════════════════════');
        
        // Guardar resultados
        if (result.jobs.length > 0) {
          const saveResult = await saveScannedJobsUseCase(result.jobs);
          console.log(saveResult.success 
            ? `💾 Guardados ${saveResult.newSavedCount} nuevos empleos (Filtrados: ${saveResult.newFilteredCount}, Limpiados: ${saveResult.existingRemovedCount})`
            : '❌ Error al guardar en disco');
        }
        
        console.log('\n✅ Escaneo finalizado.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`❌ Error en escaneo: ${msg}`);
        process.exit(1);
      }
      
      process.exit(0); 
    }

// CASO 2: Modo Normal (Con TUI)
    // Pasamos el flag 'now' al Root
    render(
      <Root
        autoScan={false}
        skipSplash={noSplash}
      />,
      { exitOnCtrlC: false },
    );
  });

program.parse(process.argv);
