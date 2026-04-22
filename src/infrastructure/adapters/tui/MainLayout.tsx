import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Box, useApp, useInput, useStdin, useStdout } from 'ink';
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
    const [plugins] = useState(['Linkedin', 'Indeed']);
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

    useInput((input, key) => {
        const normalizedInput = input.toLowerCase();
        if (normalizedInput === 'q' || (key.ctrl && normalizedInput === 'c')) {
            exit();
            return;
        }

if (isApplicationDetailModalOpen) {
            if (key.escape) {
                closeApplicationDetailModal();
                return;
            }
            if (key.delete) {
                void handleDeleteApplication();
                return;
            }
            return;
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

        if (key.tab || input === '\t') {
            setActivePanel((currentPanel) => {
                if (currentPanel === 'jobs') return 'detail';
                if (currentPanel === 'detail') return 'applications';
                return 'jobs';
            });
            return;
        }

        if (normalizedInput === 'k') {
            openKeywordsModal();
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
                pluginsCount={plugins.length}
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
