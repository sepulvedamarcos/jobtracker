import { AppliedJob } from '../core/entities/Job.js';

const normalizeLink = (value: string): string =>
    value.trim().replace(/#.*$/, '').replace(/\/$/, '').toLowerCase();

export const buildAppliedLinkSet = (applications: AppliedJob[]): Set<string> =>
    new Set(applications.map((application) => normalizeLink(application.link)));

// Marcar jobs con "postulación" si ya fueron aplicados
export const markJobsAsApplied = <T extends { link: string }>(
    jobs: T[],
    applications: AppliedJob[],
): Array<T & { applicationLabel: string }> => {
    const appliedLinks = buildAppliedLinkSet(applications);

    return jobs.map((job) => ({
        ...job,
        applicationLabel: appliedLinks.has(normalizeLink(job.link)) ? 'postulación' : '',
    }));
};

// Filtrar jobs que ya fueron aplicados (no mostrar repetidos)
export const filterAppliedJobs = <T extends { link: string }>(
    jobs: T[],
    applications: AppliedJob[],
): T[] => {
    const appliedLinks = buildAppliedLinkSet(applications);
    return jobs.filter((job) => !appliedLinks.has(normalizeLink(job.link)));
};
