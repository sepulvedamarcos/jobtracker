#!/usr/bin/env node
import { jsx as _jsx } from "react/jsx-runtime";
import { Command } from 'commander';
import { useEffect, useState } from 'react';
import { render } from 'ink';
import { Splash } from '../tui/Splash.js';
import { MainLayout } from '../tui/MainLayout.js';
import { getVersion } from '../../../services/version.js';
import { JsonJobRepository } from '../../storage/JsonJobRepository.js';
import { JobService } from '../../../core/use-cases/JobService.js';
import { ApplicationService } from '../../../core/use-cases/ApplicationService.js';
import { addKeyword, readKeywords, removeKeyword } from '../../../services/keywords.js';
import { installPlugin } from '../../../core/use-cases/plugins/InstallPluginUseCase.js';
const program = new Command();
const jobRepository = new JsonJobRepository();
const jobService = new JobService(jobRepository);
const applicationService = new ApplicationService(jobRepository);
// --- El Orquestador ---
const Root = ({ autoScan, skipSplash }) => {
    const [loading, setLoading] = useState(!(skipSplash || autoScan));
    useEffect(() => {
        if (skipSplash) {
            setLoading(false);
        }
    }, [skipSplash]);
    if (loading) {
        return _jsx(Splash, { onFinish: () => setLoading(false) });
    }
    // Pasamos el autoScan al MainLayout para que sepa si empezar a trabajar
    return _jsx(MainLayout, { autoScan: autoScan, jobService: jobService, applicationService: applicationService });
};
// --- Configuración de Commander ---
program
    .name('jobtracker')
    .description('TUI para búsqueda de empleos')
    .version(getVersion())
    .option('-f, --find', 'Escanear de inmediato al iniciar y entrara a la vista principal')
    .option('-s, --silent', 'Ejecutar sin interfaz visual (TUI) y salir al finalizar')
    .option('--noSplash, --nosplash', 'Iniciar directamente en la vista principal sin mostrar el splash')
    .option('-a, --addKey <keyword>, --addkey <keyword>', 'Agregar una keyword y salir')
    .option('-d, --delKey <keyword>, --delkey <keyword>', 'Eliminar una keyword y salir')
    .option('-p, --addPlugin <ruta>, --addplugin <ruta>', 'Instalar un plugin desde ruta .scrapper y salir')
    .option('--delPlugin <pluginId>, --delplugin <pluginId>', 'Eliminar un plugin instalado y salir')
    .action(async (options) => {
    const addKey = options.addKey ?? options.addkey;
    const delKey = options.delKey ?? options.delkey;
    const addPlugin = options.addPlugin ?? options.addplugin;
    const delPlugin = options.delPlugin ?? options.delplugin;
    const noSplash = options.noSplash ?? options.nosplash;
    // Eliminar plugin
    if (delPlugin) {
        console.log(`🗑️ Eliminando plugin: ${delPlugin}`);
        // Acá se implementaría con InstallPluginUseCase o similar
        console.log(`ℹ️ Función no implementada aún`);
        process.exit(0);
    }
    // Instalar plugin
    if (addPlugin) {
        console.log(`📦 Instalando plugin: ${addPlugin}`);
        const result = await installPlugin(addPlugin, (msg) => console.log(`  ${msg}`));
        if (result.success) {
            console.log(`✅ ${result.message}`);
        }
        else {
            console.log(`❌ ${result.message}`);
            process.exit(1);
        }
        process.exit(0);
    }
    if (delKey) {
        const beforeKeywords = await readKeywords();
        const nextKeywords = await removeKeyword(delKey);
        const wasRemoved = nextKeywords.length < beforeKeywords.length;
        if (wasRemoved) {
            console.log(`🗑️ Keyword eliminada: ${delKey.trim()}`);
        }
        else {
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
        }
        else {
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
    render(_jsx(Root, { autoScan: options.find, skipSplash: noSplash }), { exitOnCtrlC: false });
});
program.parse(process.argv);
