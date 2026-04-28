import { JsonJobRepository } from '../../../infrastructure/storage/JsonJobRepository.js';
export const listApplicationsUseCase = async () => {
    try {
        const repository = new JsonJobRepository();
        const applications = await repository.getAppliedJobs();
        // Sort by appliedAt descending
        const sorted = applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
        return {
            success: true,
            applications: sorted,
            message: sorted.length > 0
                ? `${sorted.length} postulaciones.`
                : 'No hay postulaciones.'
        };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        return { success: false, applications: [], message: msg };
    }
};
