import { AppliedJob } from '../core/entities/Job.js';

const normalizeLink = (value: string): string =>
    value.trim().replace(/#.*$/, '').replace(/\/$/, '').toLowerCase();

export const buildAppliedLinkSet = (applications: AppliedJob[]): Set<string> =>
    new Set(applications.map((application) => normalizeLink(application.link)));

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
