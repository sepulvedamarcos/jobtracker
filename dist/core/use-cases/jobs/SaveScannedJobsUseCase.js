import { JsonJobRepository } from '../../../infrastructure/storage/JsonJobRepository.js';
export const saveScannedJobsUseCase = async (jobs) => {
    try {
        if (jobs.length === 0) {
            return { success: false, message: 'No hay jobs para guardar.', savedCount: 0, filteredCount: 0 };
        }
        const repository = new JsonJobRepository();
        // Obtener aplicaciones existentes para filtrar
        const applications = await repository.getAppliedJobs();
        // Obtener jobs existentes para limpiar duplicados
        const existingJobs = await repository.getLastScannedJobs();
        // Crear set de links ya aplicados (para filtrar nuevos)
        const appliedLinks = new Set(applications.map(app => app.link.toLowerCase().trim()));
        // Crear set de links ya guardados (para limpiar jobs.json)
        const existingLinks = new Set(existingJobs.map(job => job.link.toLowerCase().trim()));
        // Combinar: filtrar tanto jobs nuevos como existentes
        const allLinks = new Set([...appliedLinks, ...existingLinks]);
        // 1. Primero: limpiar jobs existentes que ya fueron aplicados
        const cleanedExisting = existingJobs.filter(job => !appliedLinks.has(job.link.toLowerCase().trim()));
        const existingRemoved = existingJobs.length - cleanedExisting.length;
        // 2. Luego: filtrar jobs nuevos que ya están en aplicaciones o en jobs.json
        const jobsToSave = jobs.filter(job => !allLinks.has(job.link.toLowerCase().trim()));
        const filteredCount = jobs.length - jobsToSave.length;
        // Combinar jobs cleaned + nuevos filtrados
        const finalJobsToSave = [...cleanedExisting, ...jobsToSave];
        if (finalJobsToSave.length === 0) {
            return {
                success: true,
                message: existingRemoved > 0 || filteredCount > 0
                    ? `Todos los avisos ya fueron postulados (${existingRemoved + filteredCount} eliminados).`
                    : 'No hay jobs nuevos para guardar.',
                savedCount: 0,
                filteredCount: existingRemoved + filteredCount
            };
        }
        await repository.saveScannedJobs(finalJobsToSave);
        let msgParts = [];
        if (filteredCount > 0)
            msgParts.push(`${filteredCount} nuevos filtrados`);
        if (existingRemoved > 0)
            msgParts.push(`${existingRemoved} ya aplicados removidos`);
        return {
            success: true,
            message: msgParts.length > 0
                ? `${finalJobsToSave.length} avisos guardados (${msgParts.join(', ')}).`
                : `${finalJobsToSave.length} avisos guardados.`,
            savedCount: finalJobsToSave.length,
            filteredCount: existingRemoved + filteredCount
        };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        return { success: false, message: msg, savedCount: 0, filteredCount: 0 };
    }
};
