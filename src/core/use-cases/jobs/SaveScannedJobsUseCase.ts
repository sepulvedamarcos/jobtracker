// src/core/use-cases/jobs/SaveScannedJobsUseCase.ts
import { IJobRepository } from '../../ports/IJobRepository.js';
import { Job } from '../../entities/Job.js';
import { JsonJobRepository } from '../../../infrastructure/storage/JsonJobRepository.js';

export interface SaveScannedJobsResult {
  success: boolean;
  message: string;
  savedCount: number;
}

export const saveScannedJobsUseCase = async (
  jobs: Job[]
): Promise<SaveScannedJobsResult> => {
  try {
    if (jobs.length === 0) {
      return { success: false, message: 'No hay jobs para guardar.', savedCount: 0 };
    }

    const repository: IJobRepository = new JsonJobRepository();
    await repository.saveScannedJobs(jobs);

    return { 
      success: true, 
      message: `${jobs.length} avisos guardados.`,
      savedCount: jobs.length
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    return { success: false, message: msg, savedCount: 0 };
  }
};