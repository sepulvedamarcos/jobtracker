import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Box, useApp, useInput, useStdin, useStdout } from 'ink';
import { Header } from './MainLayout/Header.js';
import { JobList } from './MainLayout/JobList.js';
import { JobDetail } from './MainLayout/JobDetail.js';
import { Footer } from './MainLayout/Footer.js';
import { JobService } from '../../../core/use-cases/JobService.js';
import { mapDomainJobToViewJob } from './MainLayout/mapper.js';
import { ViewJob } from './MainLayout/view-model.js';
import { paginateWithLabels } from '../../../services/pagination.js';

interface MainLayoutProps {
    autoScan?: boolean;
    jobService: JobService;
}

export const MainLayout = ({ autoScan, jobService }: MainLayoutProps) => {

    const [jobsData, setJobsData] = useState<ViewJob[]>([]);
    const [selectedJob, setSelectedJob] = useState<ViewJob | null>(null);
    const [pageIndex, setPageIndex] = useState(0);

    const { exit } = useApp();
    const { isRawModeSupported, setRawMode } = useStdin();
    const { stdout } = useStdout();
    const [plugins] = useState(['Linkedin', 'Indeed']);
    const [status, setStatus] = useState('Cargando avisos locales...');
    const [keywords] = useState(['desarrollador', 'node']);

    useLayoutEffect(() => {
        if (!isRawModeSupported) {
            return;
        }

        setRawMode(true);

        return () => {
            setRawMode(false);
        };
    }, [isRawModeSupported, setRawMode]);

    const pageSize = Math.max(6, stdout.rows - 9);
    const totalPages = jobsData.length === 0 ? 0 : Math.ceil(jobsData.length / pageSize);
    const safePageIndex = totalPages === 0 ? 0 : Math.min(pageIndex, totalPages - 1);
    const pagination = paginateWithLabels(
        jobsData,
        safePageIndex,
        pageSize,
        (job) => `${job.description} — ${job.company}`,
        62,
    );
    const visibleJobs = pagination.items;

    useInput((input, key) => {
        const normalizedInput = input.toLowerCase();

        if (normalizedInput === 'q' || (key.ctrl && normalizedInput === 'c')) {
            exit();
            return;
        }

        if (key.pageUp && totalPages > 0) {
            setPageIndex((currentPage) => Math.max(0, currentPage - 1));
        }

        if (key.pageDown && totalPages > 0) {
            setPageIndex((currentPage) => Math.min(totalPages - 1, currentPage + 1));
        }
    });

    useEffect(() => {
        let cancelled = false;

        const loadInitialData = async () => {
            try {
                const jobs = await jobService.fetchLastJobs();

                if (cancelled) {
                    return;
                }

                if (jobs.length === 0) {
                    setJobsData([]);
                    setSelectedJob(null);
                    setStatus('Bienvenido! Sin datos previos.');
                    return;
                }

                const mappedJobs = jobs.map(mapDomainJobToViewJob);
                setJobsData(mappedJobs);
                setSelectedJob(mappedJobs[0] ?? null);
                setStatus(`Cargados ${jobs.length} avisos locales.`);
            } catch (error) {
                if (cancelled) {
                    return;
                }

                setJobsData([]);
                setSelectedJob(null);
                setStatus('No se pudieron leer los avisos locales.');
            }
        };

        loadInitialData();

        return () => {
            cancelled = true;
        };
    }, [jobService]);

    useEffect(() => {
        if (safePageIndex !== pageIndex) {
            setPageIndex(safePageIndex);
        }
    }, [pageIndex, safePageIndex]);

    useEffect(() => {
        const currentPageJobs = jobsData.slice(
            safePageIndex * pageSize,
            safePageIndex * pageSize + pageSize,
        );

        setSelectedJob(currentPageJobs[0] ?? null);
    }, [jobsData, pageSize, safePageIndex]);

    return (
        <Box height={stdout.rows} width={stdout.columns} flexDirection="column">
            <Header
                pluginsCount={plugins.length}
                keywordsCount={keywords.length}
                status={status}
            />

            <Box flexDirection="row" flexGrow={1}>
                <JobList
                    items={visibleJobs}
                    onHighlight={setSelectedJob}
                    pageLabel={pagination.pageLabel}
                    flexGrow={1}
                />
                <JobDetail job={selectedJob}  flexBasis="40%"/>
            </Box>

            <Footer />
        </Box>
    );
};
