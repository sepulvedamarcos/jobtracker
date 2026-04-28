import { AppliedJob } from '../core/entities/Job.js';

/**
 * Extrae un identificador único del enlace del aviso.
 * Esto evita falsos positivos cuando cambian los dominios o los slugs de las URLs.
 */
const extractJobId = (url: string): string => {
    if (!url) return '';
    const normalized = url.trim().toLowerCase().replace(/#.*$/, '').replace(/\/$/, '');
    
    try {
        // Computrabajo: El ID es el código hexadecimal al final del slug (ej: D67F9FD13D07559B61373E686DCF3405)
        if (normalized.includes('computrabajo')) {
            const parts = normalized.split('/');
            const lastPart = parts[parts.length - 1];
            const idMatch = lastPart.match(/([a-f0-9]{32})$/);
            if (idMatch) return idMatch[1];
        }
        
        // Trabajando: El ID es el número al inicio del segmento final (ej: 6044668-titulo)
        if (normalized.includes('trabajando')) {
            const idMatch = normalized.match(/\/trabajo\/(\d+)/);
            if (idMatch) return idMatch[1];
        }
    } catch (e) {
        // Fallback en caso de error de parsing
    }
    
    // Fallback: devolver la URL normalizada si no se reconoce el patrón
    return normalized;
};

export const buildAppliedLinkSet = (applications: AppliedJob[]): Set<string> =>
    new Set(applications.map((application) => extractJobId(application.link)));

// Marcar jobs con "postulación" si ya fueron aplicados
export const markJobsAsApplied = <T extends { link: string }>(
    jobs: T[],
    applications: AppliedJob[],
): Array<T & { applicationLabel: string }> => {
    const appliedIds = buildAppliedLinkSet(applications);

    return jobs.map((job) => ({
        ...job,
        applicationLabel: appliedIds.has(extractJobId(job.link)) ? 'postulación' : '',
    }));
};

// Filtrar jobs que ya fueron aplicados (no mostrar repetidos)
export const filterAppliedJobs = <T extends { link: string }>(
    jobs: T[],
    applications: AppliedJob[],
): T[] => {
    const appliedIds = buildAppliedLinkSet(applications);
    return jobs.filter((job) => !appliedIds.has(extractJobId(job.link)));
};
