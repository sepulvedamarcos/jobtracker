import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Box, useApp, useInput, useStdin, useStdout } from 'ink';
import path from 'path';
import fs from 'fs';
import { APP_PATHS } from '../../config/paths.js';
import { Header } from './MainLayout/Header.js';
import { JobList } from './MainLayout/JobList.js';
import { ApplicationsPanel } from './MainLayout/ApplicationsPanel.js';
import { DetailPanel } from './MainLayout/DetailPanel.js';
import { Footer } from './MainLayout/Footer.js';
import { JobService } from '../../../core/use-cases/JobService.js';
import { ApplicationService } from '../../../core/use-cases/ApplicationService.js';
import { mapDomainJobToViewJob, mapBackToJob } from './MainLayout/mapper.js';
    import { mapAppliedJobToViewApplication } from './MainLayout/application-mapper.js';
import { ViewJob } from './MainLayout/view-model.js';
import { ViewApplication } from './MainLayout/application-view-model.js';
import { KeywordsModal } from './MainLayout/KeywordsModal.js';
import { ApplicationDetailModal } from './MainLayout/ApplicationDetailModal.js';
import {
    buildApplicationListItemLabel,
    buildListItemLabel,
} from '../../../services/list-labels.js';
import { paginateWithLabels } from '../../../services/pagination.js';
import {
    addKeyword,
    deleteKeyword,
    fetchKeywords,
    markJobsAsApplied,
    openUrl,
} from '../../../services/index.js';
import { PanelKey } from './MainLayout/panel-frame.js';
import { ConfirmScanModal } from './MainLayout/ConfirmScanModal.js';
import { ScanProgressModal } from './MainLayout/ScanProgressModal.js';
import { PluginsModal } from './MainLayout/PluginsModal.js';
import { runPluginsScanParallel } from '../../../core/use-cases/plugins/RunPluginsScanParallelUseCase.js';
import { JsonJobRepository } from '../../storage/JsonJobRepository.js';
import { getDevPlugins } from '../../plugins/PluginRegistry.js';
import { getPluginsDir } from '../../plugins/PluginPathResolver.js';
import type { PluginMetadata } from '../../../core/plugins/PluginMetadata.js';

interface MainLayoutProps {
    autoScan?: boolean;
    jobService: JobService;
    applicationService: ApplicationService;
}

export const MainLayout = ({ autoScan, jobService, applicationService }: MainLayoutProps) => {
    const [jobsData, setJobsData] = useState<ViewJob[]>([]);
    const [applicationsData, setApplicationsData] = useState<ViewApplication[]>([]);
    const [selectedJob, setSelectedJob] = useState<ViewJob | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<ViewApplication | null>(null);
    const [jobPageIndex, setJobPageIndex] = useState(0);
    const [applicationPageIndex, setApplicationPageIndex] = useState(0);
    const [activePanel, setActivePanel] = useState<PanelKey>('jobs');
    const [status, setStatus] = useState('Cargando avisos locales...');
    const [pluginsList, setPluginsList] = useState<PluginMetadata[]>([]);
    const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);
    const [isPluginsModalOpen, setIsPluginsModalOpen] = useState(false);
    const [isPluginInstallMode, setIsPluginInstallMode] = useState(false);
    const [pluginPathDraft, setPluginPathDraft] = useState('');
    const [pluginsRevision, setPluginsRevision] = useState(0);
    const [pluginMessage, setPluginMessage] = useState<string | undefined>();
    const [keywords, setKeywords] = useState<string[]>([]);
    const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
    const [isKeywordsModalOpen, setIsKeywordsModalOpen] = useState(false);
    const [isKeywordInsertMode, setIsKeywordInsertMode] = useState(false);
    const [keywordDraft, setKeywordDraft] = useState('');
    const [keywordsRevision, setKeywordsRevision] = useState(0);
    const [previousPanel, setPreviousPanel] = useState<PanelKey>('jobs');
    const [isAutoScanRunning, setIsAutoScanRunning] = useState(false);
    const [isApplicationDetailModalOpen, setIsApplicationDetailModalOpen] = useState(false);
    const [applicationModalRevision, setApplicationModalRevision] = useState(0);
    const [isConfirmScanOpen, setIsConfirmScanOpen] = useState(false);
    const [isScanProgressOpen, setIsScanProgressOpen] = useState(false);
    const [scanProgress, setScanProgress] = useState<{ plugin: string; message: string; progress: number } | null>(null);
    const [scanPluginResults, setScanPluginResults] = useState<{ pluginId: string; count: number; error?: string }[]>([]);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const { exit } = useApp();
    const { isRawModeSupported, setRawMode } = useStdin();
    const { stdout } = useStdout();

    useLayoutEffect(() => {
        if (!isRawModeSupported) {
            return;
        }

        setRawMode(true);

        return () => {
            setRawMode(false);
        };
    }, [isRawModeSupported, setRawMode]);

    useEffect(() => {
        let cancelled = false;
        let autoScanTimer: ReturnType<typeof setTimeout> | null = null;

        const loadInitialData = async () => {
            try {
                const [jobs, applications, loadedKeywords] = await Promise.all([
                    jobService.fetchLastJobs(),
                    applicationService.fetchAppliedJobs(),
                    fetchKeywords(),
                ]);

                if (cancelled) {
                    return;
                }

                const mappedJobs = jobs.map(mapDomainJobToViewJob);
                const mappedApplications = applications.map(mapAppliedJobToViewApplication);
                const jobsWithApplicationBadge = markJobsAsApplied(mappedJobs, applications);

                setJobsData(jobsWithApplicationBadge);
                setApplicationsData(mappedApplications);
                setKeywords(loadedKeywords);
                setSelectedKeyword(loadedKeywords[0] ?? null);
                setSelectedJob(jobsWithApplicationBadge[0] ?? null);
                setSelectedApplication(mappedApplications[0] ?? null);
                setStatus(
                    mappedJobs.length === 0
                        ? 'Bienvenido! Sin datos previos.'
                        : `Cargados ${mappedJobs.length} avisos y ${mappedApplications.length} postulaciones.`,
                );

                if (autoScan) {
                    setIsAutoScanRunning(true);
                    setStatus('Escaneo automático: ejecutando proceso simulado...');

                    autoScanTimer = setTimeout(() => {
                        if (cancelled) {
                            return;
                        }

                        setIsAutoScanRunning(false);
                        setStatus('Escaneo automático simulado finalizado.');
                    }, 1200);
                }
            } catch (error) {
                if (cancelled) {
                    return;
                }

                setJobsData([]);
                setApplicationsData([]);
                setKeywords([]);
                setSelectedKeyword(null);
                setSelectedJob(null);
                setSelectedApplication(null);
                setStatus('No se pudieron leer los datos locales.');
            }
        };

        loadInitialData();

        return () => {
            cancelled = true;
            if (autoScanTimer) {
                clearTimeout(autoScanTimer);
            }
        };
    }, [jobService, applicationService, autoScan]);

    // Load plugins from registry - siempre recargar cuando se abre el modal
    useEffect(() => {
        const reloadPlugins = () => {
            const loaded = getDevPlugins();
            setPluginsList(loaded);
            if (loaded.length > 0) {
                // Mantener el seleccionado actual o seleccionar el primero
                if (!selectedPluginId || !loaded.find(p => p.pluginId === selectedPluginId)) {
                    setSelectedPluginId(loaded[0].pluginId);
                }
            } else {
                setSelectedPluginId(null);
            }
        };
        
        reloadPlugins();
    }, [selectedPluginId]); // Se ejecuta al iniciar y cuando selectedPluginId cambia

    useEffect(() => {
        if (keywords.length === 0) {
            if (selectedKeyword !== null) {
                setSelectedKeyword(null);
            }
            return;
        }

        const hasSelection = selectedKeyword
            ? keywords.some((keyword) => keyword.toLowerCase() === selectedKeyword.toLowerCase())
            : false;

        if (!hasSelection) {
            setSelectedKeyword(keywords[0]);
        }
    }, [keywords, selectedKeyword]);

    const jobsPageSize = Math.max(4, stdout.rows - 10);
    const applicationsPageSize = Math.max(4, Math.floor((stdout.rows - 11) / 2));
    const detailHeight = Math.max(8, Math.floor((stdout.rows - 3) * 0.35));
    const keywordsModalWidth = Math.max(60, Math.floor(stdout.columns * 0.5));
    const keywordsModalHeight = Math.max(18, Math.floor(stdout.rows * 0.5));
    const keywordsModalListLimit = Math.max(4, keywordsModalHeight - 8);
    const applicationDetailModalWidth = Math.max(60, Math.floor(stdout.columns * 0.5));
    const applicationDetailModalHeight = Math.max(16, Math.floor(stdout.rows * 0.4));
    const panelContentWidth = Math.max(40, Math.floor(stdout.columns / 2) - 6);
    const jobsLabelWidth = Math.max(28, panelContentWidth - Math.max(2, String(jobsData.length).length) - 2);
    const applicationsLabelWidth = Math.max(
        28,
        panelContentWidth - Math.max(2, String(applicationsData.length).length) - 2,
    );

    const jobsTotalPages = jobsData.length === 0 ? 0 : Math.ceil(jobsData.length / jobsPageSize);
    const applicationsTotalPages =
        applicationsData.length === 0 ? 0 : Math.ceil(applicationsData.length / applicationsPageSize);

    const safeJobsPageIndex = jobsTotalPages === 0 ? 0 : Math.min(jobPageIndex, jobsTotalPages - 1);
    const safeApplicationsPageIndex =
        applicationsTotalPages === 0 ? 0 : Math.min(applicationPageIndex, applicationsTotalPages - 1);

    const jobsPagination = useMemo(
            () =>
                paginateWithLabels(
                    jobsData,
                    safeJobsPageIndex,
                    jobsPageSize,
                    (job) =>
                        buildListItemLabel({
                            source: job.source,
                            primaryText: job.description,
                            secondaryText: job.company,
                            availableWidth: jobsLabelWidth,
                        }),
                    jobsLabelWidth,
                    'avisos',
                ),
        [jobsData, safeJobsPageIndex, jobsPageSize, jobsLabelWidth],
    );

    const applicationsPagination = useMemo(
            () =>
                paginateWithLabels(
                    applicationsData,
                    safeApplicationsPageIndex,
                    applicationsPageSize,
                    (application) =>
                        buildApplicationListItemLabel({
                            source: application.source,
                            appliedAt: application.appliedAt,
                            primaryText: application.title,
                            secondaryText: application.company,
                            availableWidth: applicationsLabelWidth,
                        }),
                    applicationsLabelWidth,
                    'postulaciones',
                ),
        [applicationsData, safeApplicationsPageIndex, applicationsPageSize, applicationsLabelWidth],
    );

    const visibleJobs = jobsPagination.items;
    const visibleApplications = applicationsPagination.items;

    const openKeywordsModal = () => {
        setPreviousPanel(activePanel);
        setIsKeywordsModalOpen(true);
        setIsKeywordInsertMode(false);
        setKeywordDraft('');
        setStatus('Editando keywords...');
    };

    const closeKeywordsModal = () => {
        setIsKeywordsModalOpen(false);
        setIsKeywordInsertMode(false);
        setKeywordDraft('');
        setActivePanel(previousPanel);
        setStatus('Keywords cerradas.');
    };

    const beginKeywordInsert = () => {
        setIsKeywordInsertMode(true);
        setKeywordDraft('');
        setStatus('Escribe una keyword nueva y presiona Enter.');
    };

    const cancelKeywordInsert = () => {
        setIsKeywordInsertMode(false);
        setKeywordDraft('');
        setStatus('Inserción cancelada.');
    };

    const persistKeywordList = async (nextKeywords: string[], nextSelection?: string | null) => {
        setKeywords(nextKeywords);
        setSelectedKeyword(nextSelection ?? nextKeywords[0] ?? null);
        setKeywordsRevision((current) => current + 1);
    };

    const handleDeleteKeyword = async () => {
        if (!selectedKeyword) {
            setStatus('No hay keywords para eliminar.');
            return;
        }

        const selectedIndex = keywords.findIndex(
            (keyword) => keyword.toLowerCase() === selectedKeyword.toLowerCase(),
        );

        if (selectedIndex < 0) {
            setStatus('No se pudo ubicar la keyword seleccionada.');
            return;
        }

        try {
            const nextKeywords = await deleteKeyword(selectedIndex);
            const nextSelection = nextKeywords[selectedIndex] ?? nextKeywords[selectedIndex - 1] ?? null;
            await persistKeywordList(nextKeywords, nextSelection);
            setStatus('Keyword eliminada.');
        } catch {
            setStatus('No se pudo eliminar la keyword.');
        }
    };

    const handleInsertKeyword = async () => {
        const nextKeyword = keywordDraft.trim();

        if (!nextKeyword) {
            setStatus('La keyword no puede estar vacía.');
            return;
        }

        try {
            const beforeCount = keywords.length;
            const nextKeywords = await addKeyword(nextKeyword);
            const wasAdded = nextKeywords.length > beforeCount;

            await persistKeywordList(nextKeywords, nextKeywords[nextKeywords.length - 1] ?? null);
            setIsKeywordInsertMode(false);
            setKeywordDraft('');
            setStatus(wasAdded ? `Keyword agregada: ${nextKeyword}` : 'La keyword ya existe.');
        } catch {
            setStatus('No se pudo guardar la keyword.');
        }
    };

    const openPluginsModal = () => {
        setPreviousPanel(activePanel);
        setIsPluginsModalOpen(true);
        setIsPluginInstallMode(false);
        setPluginPathDraft('');
        setPluginMessage(undefined);
        
        // Siempre recargar la lista al abrir el modal
        const loaded = getDevPlugins();
        setPluginsList(loaded);
        if (loaded.length > 0) {
            if (!selectedPluginId || !loaded.find(p => p.pluginId === selectedPluginId)) {
                setSelectedPluginId(loaded[0].pluginId);
            }
        } else {
            setSelectedPluginId(null);
        }
        
        setStatus('Gestionando plugins...');
    };

    const closePluginsModal = () => {
        setIsPluginsModalOpen(false);
        setIsPluginInstallMode(false);
        setPluginPathDraft('');
        setPluginMessage(undefined);
        setActivePanel(previousPanel);
        setStatus('Plugins cerrados.');
    };

    const handleInstallPlugin = async () => {
        const rawPath = pluginPathDraft.trim();
        
        // Log a archivo
        const logFile = (msg: string) => {
          const logPath = path.join(APP_PATHS.plugins, 'install.log');
          const line = `[${new Date().toISOString()}] [MainLayout] ${msg}\n`;
          fs.writeFileSync(logPath, line, { flag: 'a' });
        };
        
        logFile('=== handleInstallPlugin INICIO ===');
        logFile('rawPath escrito por usuario: ' + rawPath);
        
        if (!rawPath) {
            setPluginMessage('La ruta no puede estar vacía.');
            return;
        }
        
        // ===================== INSTALL PLUGIN =====================
        const inputPath = path.resolve(rawPath);
        logFile('inputPath: ' + inputPath);
        
        // Si no existe, error simple
        if (!fs.existsSync(inputPath)) {
            setPluginMessage('La ruta no existe');
            logFile('ERROR: no existe: ' + inputPath);
            return;
        }
        
        // Determinar si es archivo o directorio
        let finalPath = inputPath;
        if (fs.statSync(inputPath).isDirectory()) {
            // Es directorio: buscar archivo .scrapper dentro
            const files = fs.readdirSync(inputPath);
            const scrapper = files.find(f => f.toLowerCase().endsWith('.scrapper'));
            if (scrapper) {
                finalPath = path.join(inputPath, scrapper);
                logFile('Encontrado .scrapper en directorio: ' + finalPath);
            } else {
                setPluginMessage('No hay archivo .scrapper en la carpeta');
                logFile('ERROR: no hay .scrapper en: ' + inputPath);
                return;
            }
        }
        
        // Verificar que es .scrapper
        if (!finalPath.toLowerCase().endsWith('.scrapper')) {
            setPluginMessage('El archivo debe ser .scrapper');
            logFile('ERROR: no es .scrapper: ' + finalPath);
            return;
        }
        
        logFile('finalPath: ' + finalPath);
        
        // Usar el archivo directamente
        const scrapperFile = finalPath;

        try {
            setPluginMessage('Procesando...');
            logFile('Procesando: ' + scrapperFile);
            
            const pluginsDir = getPluginsDir();
            const tempDir = path.join(pluginsDir, '_temp_install');
            logFile('tempDir: ' + tempDir);
            
            // Limpiar temp antes
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
            fs.mkdirSync(tempDir, { recursive: true });

            // Usar JSZip
            const JSZip = (await import('jszip')).default;
            
            const zipData = fs.readFileSync(scrapperFile);
            const zip = await JSZip.loadAsync(zipData);
            
            // Extraer todos los archivos
            const promises: Promise<void>[] = [];
            zip.forEach((relativePath: string, zipEntry: any) => {
                if (!zipEntry.dir) {
                    const dest = path.join(tempDir, relativePath);
                    const dir = path.dirname(dest);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    const p = zipEntry.async('nodebuffer').then((content: Buffer) => {
                        fs.writeFileSync(dest, content);
                    });
                    promises.push(p);
                }
            });
            await Promise.all(promises);
            
            // Buscar estructura - puede haber subcarpeta o archivos sueltos
            const tempFiles = fs.readdirSync(tempDir);
            
            // Buscar subcarpeta (el plugin puede estar dentro de una carpeta)
            const subDirs = tempFiles.filter(f => {
                const stat = fs.statSync(path.join(tempDir, f));
                return stat.isDirectory();
            });
            
            let pluginBaseDir = tempDir;
            
            // Si hay exactamente una subcarpeta, usarla como base del plugin
            if (subDirs.length === 1) {
                pluginBaseDir = path.join(tempDir, subDirs[0]);
            }
            
            const pluginFiles = fs.readdirSync(pluginBaseDir);
            const metadataFileName = pluginFiles.find(f => f.toLowerCase() === 'metadata.json');
            
            if (!metadataFileName) {
                setPluginMessage('Falta metadata.json');
                return;
            }
            
            // 5. Validar metadata
            const metadataContent = fs.readFileSync(path.join(pluginBaseDir, metadataFileName), 'utf-8');
            let pluginData: { pluginId: string; name: string; pluginVersion: string; author?: string; mainFile?: string };
            pluginData = JSON.parse(metadataContent);
            logFile('metadata parseado: ' + JSON.stringify(pluginData));

            if (!pluginData.pluginId || !pluginData.name || !pluginData.pluginVersion) {
                setPluginMessage('metadata.json incompleto');
                logFile('ERROR: metadata.json incompleto');
                return;
            }

            // Buscar archivo scraper - usar mainFile del metadata o buscar cualquier .js/.ts
            let jsFile: string;
            if (pluginData.mainFile) {
                jsFile = pluginFiles.find(f => f.toLowerCase() === pluginData.mainFile!.toLowerCase()) || pluginData.mainFile;
            } else {
                jsFile = pluginFiles.find(f => f.toLowerCase().endsWith('.js') || f.toLowerCase().endsWith('.ts')) || '';
            }

            if (!jsFile || !fs.existsSync(path.join(pluginBaseDir, jsFile))) {
                setPluginMessage('Falta archivo scraper (.js/.ts)');
                return;
            }

            // 6. Mover a carpeta final
            setPluginMessage('Instalando...');
            const pluginDir = path.join(pluginsDir, pluginData.pluginId);

            if (fs.existsSync(pluginDir)) {
                fs.rmSync(pluginDir, { recursive: true, force: true });
            }
            fs.renameSync(pluginBaseDir, pluginDir);

            // 7. Recargar plugins
            const loaded = getDevPlugins();
            setPluginsList(loaded);
            setSelectedPluginId(pluginData.pluginId);
            setPluginsRevision(r => r + 1);
            setIsPluginInstallMode(false);
            setPluginPathDraft('');
            setPluginMessage(`Plugin "${pluginData.name}" instalado.`);
            setStatus(`Plugin "${pluginData.name}" instalado.`);
            logFile('INSTALADO OK: ' + pluginData.name);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error desconocido';
            setPluginMessage(`Error: ${msg}`);
            logFile('ERROR: ' + msg);
        } finally {
            // Limpiar temp
            try {
                const pluginsDir = getPluginsDir();
                const tempDir = path.join(pluginsDir, '_temp_install');
                if (fs.existsSync(tempDir)) {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                }
            } catch {}
        }
    };

    const handleDeletePlugin = async () => {
        if (!selectedPluginId) {
            setPluginMessage('No hay plugin seleccionado.');
            return;
        }

        const pluginId = selectedPluginId;
        setPluginMessage(`Eliminando ${pluginId}...`);

        try {
            const pluginsDir = getPluginsDir();
            const pluginDir = path.join(pluginsDir, pluginId);

            if (!fs.existsSync(pluginDir)) {
                setPluginMessage('El plugin no está instalado.');
                return;
            }

            // Eliminar directorio del plugin
            fs.rmSync(pluginDir, { recursive: true, force: true });

            // Recargar lista usando el registry
            const loaded = getDevPlugins();
            setPluginsList(loaded);
            setSelectedPluginId(loaded.length > 0 ? loaded[0].pluginId : null);
            setPluginsRevision(r => r + 1);
            setPluginMessage(`Plugin "${pluginId}" eliminado.`);
            setStatus(`Plugin "${pluginId}" eliminado.`);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error desconocido';
            setPluginMessage(`Error al eliminar: ${msg}`);
        }
    };

    useEffect(() => {
        if (safeJobsPageIndex !== jobPageIndex) {
            setJobPageIndex(safeJobsPageIndex);
        }
    }, [jobPageIndex, safeJobsPageIndex]);

    useEffect(() => {
        if (safeApplicationsPageIndex !== applicationPageIndex) {
            setApplicationPageIndex(safeApplicationsPageIndex);
        }
    }, [applicationPageIndex, safeApplicationsPageIndex]);

    useEffect(() => {
        setSelectedJob(visibleJobs[0] ?? null);
    }, [visibleJobs, safeJobsPageIndex]);

    useEffect(() => {
        setSelectedApplication(visibleApplications[0] ?? null);
    }, [visibleApplications, safeApplicationsPageIndex]);

    const handleOpenSelectedJob = async () => {
        if (!selectedJob?.link) {
            setStatus('No hay enlace disponible para abrir.');
            return;
        }

        try {
            setStatus('Abriendo navegador...');
            await openUrl(selectedJob.link);
            setStatus(`Abierto: ${selectedJob.description}`);
        } catch {
            setStatus('No se pudo abrir el navegador.');
        }
    };

    const openApplicationDetailModal = () => {
        if (!selectedApplication) {
            setStatus('No hay postulación seleccionada.');
            return;
        }
        setIsApplicationDetailModalOpen(true);
        setStatus('Detalle de postulación...');
    };

    const closeApplicationDetailModal = () => {
        setIsApplicationDetailModalOpen(false);
        setStatus('Postulación cancelada.');
    };

    const handleDeleteApplication = async () => {
        if (!selectedApplication) {
            setStatus('No hay postulación para eliminar.');
            return;
        }

        const linkToDelete = selectedApplication.link;
        const titleToDelete = selectedApplication.title;

        try {
            await applicationService.deleteApplication(linkToDelete);
            const updatedApplications = await applicationService.fetchAppliedJobs();
            const mappedApplications = updatedApplications.map(mapAppliedJobToViewApplication);
            const jobsWithApplicationBadge = markJobsAsApplied(jobsData, updatedApplications);

            setJobsData(jobsWithApplicationBadge);
            setApplicationsData(mappedApplications);
            setIsApplicationDetailModalOpen(false);
            setApplicationModalRevision((current) => current + 1);
            setStatus(`Postulación eliminada: ${titleToDelete}`);
        } catch {
            setStatus('No se pudo eliminar la postulación.');
        }
    };

    const handleApplySelectedJob = async () => {
        if (!selectedJob) {
            setStatus('No hay aviso seleccionado.');
            return;
        }

        try {
            const jobToApply = jobsData.find((job) => job.value === selectedJob.value);
            if (jobToApply) {
                const domainJob = {
                    id: jobToApply.value,
                    keyword: jobToApply.keyword,
                    title: jobToApply.description,
                    company: jobToApply.company,
                    date: jobToApply.date,
                    link: jobToApply.link,
                    source: jobToApply.source,
                    scannedAt: jobToApply.scannedAt,
                };
                await jobService.applyToJob(domainJob);
                const updatedApplications = await applicationService.fetchAppliedJobs();
                const mappedApplications = updatedApplications.map(mapAppliedJobToViewApplication);
                const jobsWithApplicationBadge = markJobsAsApplied(jobsData, updatedApplications);

                setJobsData(jobsWithApplicationBadge);
                setApplicationsData(mappedApplications);
                setStatus(`Postulado: ${jobToApply.description}`);
            }
        } catch {
            setStatus('No se pudo crear la postulación.');
        }
};

    const executeScan = async () => {
        const signal = abortController?.signal ?? undefined;
        
        // Obtener IDs de los plugins activos
        const pluginIds = pluginsList
            .filter(p => p.enabled)
            .map(p => p.pluginId);
        
        if (pluginIds.length === 0) {
            setStatus('No hay plugins habilitados para escanear.');
            return;
        }

        // Limpiar resultados anteriores (UI + archivo)
        setJobsData([]);
        setScanPluginResults([]);
        try {
            fs.unlinkSync(APP_PATHS.jobs);
        } catch {}

        try {
            const result = await runPluginsScanParallel(pluginIds, (progress) => {
                setScanProgress(progress);
            }, signal);

            // Guardar resultados por plugin
            setScanPluginResults(result.pluginResults || []);

            if (result.success && result.jobs.length > 0) {
                await saveScannedJobs(result.jobs);
                const repos = await loadScannedJobs();
                const updatedApplications = await applicationService.fetchAppliedJobs();
                const mapped = repos.map(mapDomainJobToViewJob);
                setJobsData(markJobsAsApplied(mapped, updatedApplications));
                setStatus(result.message);
            } else {
                setStatus(result.message || 'Sin resultados.');
            }
        } catch (err) {
            setStatus('Error en el escaneo.');
        } finally {
            setIsScanProgressOpen(false);
        }
    };

    const saveScannedJobs = async (jobs: any[]) => {
        const repository = new JsonJobRepository();
        await repository.saveScannedJobs(jobs);
    };

    const loadScannedJobs = async () => {
        const repository = new JsonJobRepository();
        return repository.getLastScannedJobs();
    };

    useInput((input, key) => {
        const normalizedInput = input.toLowerCase();
        
        if (normalizedInput === 'q' || (key.ctrl && normalizedInput === 'c')) {
            exit();
            return;
        }

        const anyModalOpen = isApplicationDetailModalOpen || isKeywordsModalOpen || isPluginsModalOpen || isConfirmScanOpen || isScanProgressOpen;

        if (anyModalOpen) {
            if (isApplicationDetailModalOpen) {
                if (key.escape) {
                    closeApplicationDetailModal();
                    return;
                }
                if (key.delete) {
                    void handleDeleteApplication();
                    return;
                }
            }

            if (isKeywordsModalOpen) {
                if (key.escape) {
                    if (isKeywordInsertMode) {
                        cancelKeywordInsert();
                    } else {
                        closeKeywordsModal();
                    }
                    return;
                }

                if (key.return && isKeywordInsertMode) {
                    void handleInsertKeyword();
                    return;
                }

                if (normalizedInput === 'i' && !isKeywordInsertMode) {
                    beginKeywordInsert();
                    return;
                }

                if ((key.delete || key.backspace) && !isKeywordInsertMode) {
                    void handleDeleteKeyword();
                    return;
                }

                if (isKeywordInsertMode) {
                    if (key.backspace) {
                        setKeywordDraft((current) => current.slice(0, -1));
                        return;
                    }

                    if (input && input.length === 1 && !key.ctrl && !key.meta) {
                        setKeywordDraft((current) => `${current}${input}`);
                        return;
                    }
                }

                return;
            }

            if (isConfirmScanOpen) {
                if (key.escape) {
                    setIsConfirmScanOpen(false);
                    return;
                }
                if (key.return) {
                    setIsConfirmScanOpen(false);
                    setIsScanProgressOpen(true);
                    setScanProgress({ plugin: 'init', message: 'Iniciando...', progress: 0 });
                    setScanPluginResults([]);
                    setAbortController(new AbortController());
                    void executeScan();
                    return;
                }
                return;
            }

            if (isScanProgressOpen) {
                if (key.escape) {
                    abortController?.abort();
                    setIsScanProgressOpen(false);
                    setStatus('Escaneo cancelado.');
                    return;
                }
                return;
            }

if (isPluginsModalOpen) {
                if (key.escape) {
                    closePluginsModal();
                    return;
                }

                // Input para install mode - primero agregar caracteres
                if (isPluginInstallMode) {
                    if (key.return) {
                        void handleInstallPlugin();
                        return;
                    }
                    if (key.backspace) {
                        setPluginPathDraft((current) => current.slice(0, -1));
                        return;
                    }
                    if (input && input.length === 1 && !key.ctrl && !key.meta) {
                        setPluginPathDraft((current) => `${current}${input}`);
                        return;
                    }
                    return;
                }

                // A - add plugin (solo cuando NO estamos en install mode)
                if (normalizedInput === 'a') {
                    setIsPluginInstallMode(true);
                    setPluginPathDraft('');
                    setPluginMessage(undefined);
                    return;
                }

                // E - delete plugin
                if (normalizedInput === 'e') {
                    void handleDeletePlugin();
                    return;
                }

                return;
            }

            return;
        }

        // Global actions - blocked when any modal is open (handled above)
        // S - scan
        if (normalizedInput === 's') {
            setIsConfirmScanOpen(true);
            return;
        }

        // K - keywords modal
        if (normalizedInput === 'k') {
            openKeywordsModal();
            return;
        }

        // P - plugins modal
        if (normalizedInput === 'p') {
            openPluginsModal();
            return;
        }

        if (key.return && activePanel === 'detail') {
            void handleOpenSelectedJob();
            return;
        }

        if (key.return && activePanel === 'applications' && !isApplicationDetailModalOpen) {
            void openApplicationDetailModal();
            return;
        }

        if (key.return && activePanel === 'jobs') {
            void handleApplySelectedJob();
            return;
        }

        // Tab para cambiar entre paneles
        if (key.tab) {
            if (activePanel === 'jobs') {
                setActivePanel('applications');
            } else if (activePanel === 'applications') {
                setActivePanel('detail');
            } else if (activePanel === 'detail') {
                setActivePanel('jobs');
            }
            return;
        }

        if (key.pageUp) {
            if (activePanel === 'jobs' && jobsTotalPages > 0) {
                setJobPageIndex((currentPage) => Math.max(0, currentPage - 1));
            }

            if (activePanel === 'applications' && applicationsTotalPages > 0) {
                setApplicationPageIndex((currentPage) => Math.max(0, currentPage - 1));
            }
        }

        if (key.pageDown) {
            if (activePanel === 'jobs' && jobsTotalPages > 0) {
                setJobPageIndex((currentPage) => Math.min(jobsTotalPages - 1, currentPage + 1));
            }

            if (activePanel === 'applications' && applicationsTotalPages > 0) {
                setApplicationPageIndex((currentPage) =>
                    Math.min(applicationsTotalPages - 1, currentPage + 1),
                );
            }
        }
    });

    return (
        <Box height={stdout.rows} width={stdout.columns} flexDirection="column">
            <Header
                pluginsCount={pluginsList.length}
                keywordsCount={keywords.length}
                status={isAutoScanRunning ? 'Escaneo automático en curso...' : status}
            />

            <Box flexDirection="row" flexGrow={1}>
                <JobList
                    items={visibleJobs}
                    onHighlight={setSelectedJob}
                    pageLabel={jobsPagination.pageLabel}
                    isActive={activePanel === 'jobs'}
                    isFocused={activePanel === 'jobs' && !isKeywordsModalOpen}
                    accentColor="#ff9800"
                    availableWidth={jobsLabelWidth}
                    itemLimit={jobsPageSize}
                    flexGrow={1}
                />

                <Box flexDirection="column" flexGrow={1} flexBasis="50%">
                    <ApplicationsPanel
                        items={visibleApplications}
                        onHighlight={setSelectedApplication}
                        pageLabel={applicationsPagination.pageLabel}
                        isActive={activePanel === 'applications'}
                        isFocused={activePanel === 'applications' && !isKeywordsModalOpen}
                        accentColor="#ff9800"
                        availableWidth={applicationsLabelWidth}
                        itemLimit={applicationsPageSize}
                        flexGrow={1}
                    />

                    <DetailPanel
                        job={selectedJob}
                        isActive={activePanel === 'detail'}
                        flexBasis="35%"
                        flexGrow={0}
                        height={detailHeight}
                    />
                </Box>
            </Box>

            {isKeywordsModalOpen ? (
                <KeywordsModal
                    keywords={keywords}
                    selectedKeyword={selectedKeyword}
                    isActive
                    isInsertMode={isKeywordInsertMode}
                    draftKeyword={keywordDraft}
                    listLimit={keywordsModalListLimit}
                    revision={keywordsRevision}
                    width={keywordsModalWidth}
                    height={keywordsModalHeight}
                    onSelectKeyword={setSelectedKeyword}
                />
            ) : null}

            {isConfirmScanOpen ? (
                <ConfirmScanModal
                    isActive
                    keywords={keywords}
                    width={keywordsModalWidth}
                    height={keywordsModalHeight}
                    onConfirm={() => {}}
                    onCancel={() => setIsConfirmScanOpen(false)}
                />
            ) : null}

            {isScanProgressOpen ? (
                <ScanProgressModal
                    isActive
                    keywords={keywords}
                    plugins={pluginsList.map(p => p.pluginId)}
                    currentPlugin={scanProgress?.plugin || ''}
                    message={scanProgress?.message || ''}
                    progress={scanProgress?.progress || 0}
                    width={keywordsModalWidth}
                    height={keywordsModalHeight}
                    pluginResults={scanPluginResults}
                    onCancel={() => {
                        abortController?.abort();
                        setIsScanProgressOpen(false);
                        setStatus('Escaneo cancelado.');
                    }}
                />
            ) : null}

            {isPluginsModalOpen ? (
                <PluginsModal
                    plugins={pluginsList}
                    selectedPlugin={selectedPluginId}
                    isActive
                    isInstallMode={isPluginInstallMode}
                    draftPath={pluginPathDraft}
                    listLimit={keywordsModalListLimit}
                    revision={pluginsRevision}
                    width={keywordsModalWidth}
                    height={keywordsModalHeight}
                    onSelectPlugin={setSelectedPluginId}
                    message={pluginMessage}
                />
            ) : null}

            {isApplicationDetailModalOpen ? (
                <ApplicationDetailModal
                    application={selectedApplication}
                    isActive
                    width={applicationDetailModalWidth}
                    height={applicationDetailModalHeight}
                    onConfirmDelete={handleDeleteApplication}
                    onCancel={closeApplicationDetailModal}
                />
            ) : null}

            <Footer />
        </Box>
    );
};
