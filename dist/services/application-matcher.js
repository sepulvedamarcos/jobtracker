// Normalizar link para comparación robusta
// -去掉 trailing slash
// -quitar fragments (#)
// -lower case
// -trim espacios
const normalizeLink = (value) => {
    if (!value)
        return '';
    return value
        .trim()
        .toLowerCase()
        .replace(/#.*$/, '') // quitar fragment
        .replace(/\/$/, '') // quitar trailing slash
        .replace(/\s+/g, ' '); // normalizar espacios
};
export const buildAppliedLinkSet = (applications) => new Set(applications.map((application) => normalizeLink(application.link)));
// Marcar jobs con "postulación" si ya fueron aplicados
export const markJobsAsApplied = (jobs, applications) => {
    const appliedLinks = buildAppliedLinkSet(applications);
    return jobs.map((job) => ({
        ...job,
        applicationLabel: appliedLinks.has(normalizeLink(job.link)) ? 'postulación' : '',
    }));
};
// Filtrar jobs que ya fueron aplicados (no mostrar repetidos)
export const filterAppliedJobs = (jobs, applications) => {
    const appliedLinks = buildAppliedLinkSet(applications);
    // Debug: mostrar links que se comparan
    /*
    console.log('[filterAppliedJobs] Links en applications:',
        [...appliedLinks].slice(0, 3).map(l => l.substring(0, 50)));
    console.log('[filterAppliedJobs] Links en jobs:',
        jobs.slice(0, 3).map(j => normalizeLink(j.link).substring(0, 50)));
    */
    return jobs.filter((job) => !appliedLinks.has(normalizeLink(job.link)));
};
