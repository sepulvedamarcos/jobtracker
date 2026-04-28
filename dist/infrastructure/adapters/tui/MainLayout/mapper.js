export const mapDomainJobToViewJob = (job) => ({
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
export const mapBackToJob = (viewJob) => ({
    id: viewJob.value,
    keyword: viewJob.keyword,
    title: viewJob.description,
    company: viewJob.company,
    date: viewJob.date,
    link: viewJob.link,
    source: viewJob.source,
    scannedAt: viewJob.scannedAt,
});
