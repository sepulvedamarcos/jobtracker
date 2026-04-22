import { Job as DomainJob } from '../../../../core/entities/Job.js';
import { ViewJob } from './view-model.js';

export const mapDomainJobToViewJob = (job: DomainJob): ViewJob => ({
    label: `${job.title} — ${job.company}`,
    value: job.link,
    description: job.title,
    company: job.company,
    date: job.date,
    link: job.link,
    keyword: job.keyword,
    source: job.source,
    scannedAt: job.scannedAt,
    applicationLabel: '',
});
