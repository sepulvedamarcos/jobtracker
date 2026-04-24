// src/core/use-cases/jobs/GetScannedJobsUseCase.ts
import { IJobRepository } from '../../ports/IJobRepository.js';
import { Job } from '../../entities/Job.js';
import { JsonJobRepository } from '../../../infrastructure/storage/JsonJobRepository.js';

export interface GetScannedJobsResult {
  success: boolean;
  jobs: Job[];
  message: string;
}

export const getScannedJobsUseCase = async (): Promise<GetScannedJobsResult> => {
  try {
    const repository: IJobRepository = new JsonJobRepository();
    const jobs = await repository.getLastScannedJobs();
    
    // Sort by scannedAt descending
    const sorted = jobs.sort((a, b) => 
      new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    );

    return { 
      success: true, 
      jobs: sorted,
      message: sorted.length > 0 
        ? `${sorted.length} avisos cargados.`
        : 'No hay avisos.'
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    return { success: false, jobs: [], message: msg };
  }
};