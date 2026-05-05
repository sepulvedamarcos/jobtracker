import { JsonJobRepository } from '../../../infrastructure/storage/JsonJobRepository.js';
import { filterAppliedJobs } from '../../../services/application-matcher.js';
export const saveScannedJobsUseCase = async (jobs) => {
    try {
        if (jobs.length === 0) {
            return { success: false, message: 'No hay jobs para guardar.', newSavedCount: 0, newFilteredCount: 0, existingRemovedCount: 0 };
        }
        const repository = new JsonJobRepository();
        const applications = await repository.getAppliedJobs();
        const existingJobs = await repository.getLastScannedJobs();
        // 1. Limpiar jobs existentes que ya hayan sido postulados (usando match por ID)
        const cleanedExisting = filterAppliedJobs(existingJobs, applications);
        const existingRemoved = existingJobs.length - cleanedExisting.length;
        // 2. Filtrar nuevos jobs: no deben estar postulados Y no deben existir ya en la lista de escaneados
        const existingLinks = new Set(existingJobs.map(job => job.link.toLowerCase().trim()));
        const jobsNotApplied = filterAppliedJobs(jobs, applications);
        const jobsToSave = jobsNotApplied.filter(job => !existingLinks.has(job.link.toLowerCase().trim()));
        const newFilteredCount = jobs.length - jobsToSave.length;
        const finalJobsToSave = [...cleanedExisting, ...jobsToSave];
        if (finalJobsToSave.length === 0) {
            return {
                success: true,
                message: existingRemoved > 0 || newFilteredCount > 0
                    ? `Todos los avisos ya fueron postulados o existen (${existingRemoved + newFilteredCount} eliminados/filtrados).`
                    : 'No hay jobs nuevos para guardar.',
                newSavedCount: 0,
                newFilteredCount: newFilteredCount,
                existingRemovedCount: existingRemoved
            };
        }
        await repository.saveScannedJobs(finalJobsToSave);
        let msgParts = [];
        if (newFilteredCount > 0)
            msgParts.push(`${newFilteredCount} nuevos filtrados`);
        if (existingRemoved > 0)
            msgParts.push(`${existingRemoved} ya aplicados removidos`);
        return {
            success: true,
            message: msgParts.length > 0
                ? `${jobsToSave.length} nuevos guardados (${msgParts.join(', ')}).`
                : `${jobsToSave.length} nuevos guardados.`,
            newSavedCount: jobsToSave.length,
            newFilteredCount: newFilteredCount,
            existingRemovedCount: existingRemoved
        };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        return { success: false, message: msg, newSavedCount: 0, newFilteredCount: 0, existingRemovedCount: 0 };
    }
};
