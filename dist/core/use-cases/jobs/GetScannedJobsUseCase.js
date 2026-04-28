import { JsonJobRepository } from '../../../infrastructure/storage/JsonJobRepository.js';
export const getScannedJobsUseCase = async () => {
    try {
        const repository = new JsonJobRepository();
        const jobs = await repository.getLastScannedJobs();
        // Sort by scannedAt descending
        const sorted = jobs.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
        return {
            success: true,
            jobs: sorted,
            message: sorted.length > 0
                ? `${sorted.length} avisos cargados.`
                : 'No hay avisos.'
        };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        return { success: false, jobs: [], message: msg };
    }
};
