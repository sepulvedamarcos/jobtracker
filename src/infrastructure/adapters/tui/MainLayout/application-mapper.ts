import { AppliedJob } from '../../../../core/entities/Job.js';
import { ViewApplication } from './application-view-model.js';

const formatApplicationStatus = (status: number): string => {
    if (status === 0) return 'Interesada';
    if (status === 1) return 'Postulada';
    if (status === 2) return 'Entrevista';
    if (status === 3) return 'Rechazada';

    return 'Postulada';
};

export const mapAppliedJobToViewApplication = (job: AppliedJob): ViewApplication => ({
    label: `${job.title} — ${job.company}`,
    value: job.link,
    title: job.title,
    company: job.company,
    source: job.source,
    status: formatApplicationStatus(job.status),
    appliedAt: job.appliedAt,
    notes: job.notes,
    link: job.link,
});
