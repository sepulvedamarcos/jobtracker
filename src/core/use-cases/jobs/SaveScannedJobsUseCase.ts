// src/core/use-cases/jobs/SaveScannedJobsUseCase.ts
import { IJobRepository } from '../../ports/IJobRepository.js';
import { Job } from '../../entities/Job.js';
import { JsonJobRepository } from '../../../infrastructure/storage/JsonJobRepository.js';
import { filterAppliedJobs } from '../../../services/application-matcher.js';

export interface SaveScannedJobsResult {
  success: boolean;
  message: string;
  savedCount: number;
  filteredCount: number;
}

export const saveScannedJobsUseCase = async (
  jobs: Job[]
): Promise<SaveScannedJobsResult> => {
  try {
    if (jobs.length === 0) {
      return { success: false, message: 'No hay jobs para guardar.', savedCount: 0, filteredCount: 0 };
    }

    const repository: IJobRepository = new JsonJobRepository();
    
    // Obtener aplicaciones existentes para filtrar
    const applications = await repository.getAppliedJobs();
    
    // Filtrar jobs que ya fueron aplicados
    const jobsToSave = filterAppliedJobs(jobs, applications);
    const filteredCount = jobs.length - jobsToSave.length;
    
    if (jobsToSave.length === 0) {
      return { 
        success: true, 
        message: filteredCount > 0 
          ? `Todos los ${jobs.length} avisos ya fueron postulados.` 
          : 'No hay jobs nuevos para guardar.',
        savedCount: 0,
        filteredCount 
      };
    }
    
    await repository.saveScannedJobs(jobsToSave);

    return { 
      success: true, 
      message: filteredCount > 0 
        ? `${jobsToSave.length} avisos guardados (${filteredCount} ya postulados).`
        : `${jobsToSave.length} avisos guardados.`,
      savedCount: jobsToSave.length,
      filteredCount
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    return { success: false, message: msg, savedCount: 0, filteredCount: 0 };
  }
};