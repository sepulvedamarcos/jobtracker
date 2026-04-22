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
  .name('jobtracker') // Así es como aparecerá en la ayuda (--help)
  .description('TUI para búsqueda de empleos')
  .version(getVersion())
  .option('-f, --find', 'Escanear de inmediato al iniciar y entrara a la vista principal')
  .option('-s, --silent', 'Ejecutar sin interfaz visual (TUI) y salir al finalizar')
  .option('--noSplash, --nosplash', 'Iniciar directamente en la vista principal sin mostrar el splash')
  .option('-a, --addKey <keyword>, --addkey <keyword>', 'Agregar una keyword y salir')
  .option('-d, --delKey <keyword>, --delkey <keyword>', 'Eliminar una keyword y salir')
  .action(async (options) => {
    const addKey = options.addKey ?? options.addkey;
    const delKey = options.delKey ?? options.delkey;
    const noSplash = options.noSplash ?? options.nosplash;

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
    
    // CASO 1: Modo Silencioso (Sin TUI)
    if (options.silent) {
      console.log('🚀 Iniciando escaneo silencioso...');
      // await tuFuncionDeScrapingReal();
      console.log('✅ Proceso finalizado.');
      process.exit(0); 
    }

    // CASO 2: Modo Normal (Con TUI)
    // Pasamos el flag 'now' al Root
  render(
      <Root
        autoScan={options.find}
        skipSplash={noSplash}
      />,
      { exitOnCtrlC: false },
    );
  });

program.parse(process.argv);
