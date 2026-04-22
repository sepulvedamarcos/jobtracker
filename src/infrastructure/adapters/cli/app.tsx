#!/usr/bin/env node

import { Command } from 'commander';
import React, { useState } from 'react';
import { render } from 'ink';
import { Splash } from '../tui/Splash.js';
import { MainLayout } from '../tui/MainLayout.js';
import { getVersion } from '../../../services/version.js';
import { JsonJobRepository } from '../../storage/JsonJobRepository.js';
import { JobService } from '../../../core/use-cases/JobService.js';

const program = new Command();
const jobService = new JobService(new JsonJobRepository());

// --- El Orquestador ---
const Root = ({ autoScan }: { autoScan?: boolean }) => {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <Splash onFinish={() => setLoading(false)} />;
  }

  // Pasamos el autoScan al MainLayout para que sepa si empezar a trabajar
  return <MainLayout autoScan={autoScan} jobService={jobService} />;
};

// --- Configuración de Commander ---
program
  .name('jobtracker') // Así es como aparecerá en la ayuda (--help)
  .description('TUI para búsqueda de empleos')
  .version(getVersion())
  .option('-n, --now', 'Escanear de inmediato al iniciar')
  .option('-s, --silent', 'Ejecutar sin interfaz visual (TUI)')
  .action(async (options) => {
    
    // CASO 1: Modo Silencioso (Sin TUI)
    if (options.silent) {
      console.log('🚀 Iniciando escaneo silencioso...');
      // await tuFuncionDeScrapingReal();
      console.log('✅ Proceso finalizado.');
      process.exit(0); 
    }

    // CASO 2: Modo Normal (Con TUI)
    // Pasamos el flag 'now' al Root
    render(<Root autoScan={options.now} />, { exitOnCtrlC: false });
  });

program.parse(process.argv);
