import { ApplicationStatus } from '../../entities/Job.js';
import { JsonJobRepository } from '../../../infrastructure/storage/JsonJobRepository.js';
export const applyToJobUseCase = async (job, notes) => {
    try {
        if (!job.link) {
            return { success: false, message: 'El job no tiene enlace.' };
        }
        const repository = new JsonJobRepository();
        await repository.applyToJob(job, notes ?? '');
        const application = {
            link: job.link,
            title: job.title,
            company: job.company,
            keyword: job.keyword,
            source: job.source,
            sourceDateText: job.date,
            sourceScannedAt: job.scannedAt,
            status: ApplicationStatus.Applied,
            appliedAt: new Date().toISOString(),
            notes: notes ?? '',
            lastUpdate: new Date().toISOString(),
        };
        return {
            success: true,
            message: `Postulado a "${job.title}".`,
            application
        };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        return { success: false, message: msg };
    }
};
