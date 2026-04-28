// src/core/use-cases/jobs/SaveScannedJobsUseCase.ts
import { IJobRepository } from '../../ports/IJobRepository.js';
import { Job } from '../../entities/Job.js';
import { JsonJobRepository } from '../../../infrastructure/storage/JsonJobRepository.js';
import { filterAppliedJobs } from '../../../services/application-matcher.js';

export interface SaveScannedJobsResult {
  success: boolean;
  message: string;
  newSavedCount: number;
  newFilteredCount: number;
  existingRemovedCount: number;
}

export const saveScannedJobsUseCase = async (
  jobs: Job[]
): Promise<SaveScannedJobsResult> => {
  try {
    if (jobs.length === 0) {
      return { success: false, message: 'No hay jobs para guardar.', newSavedCount: 0, newFilteredCount: 0, existingRemovedCount: 0 };
    }

    const repository: IJobRepository = new JsonJobRepository();
    
    const applications = await repository.getAppliedJobs();
    const existingJobs = await repository.getLastScannedJobs();
    
    const appliedLinks = new Set(applications.map(app => app.link.toLowerCase().trim()));
    const existingLinks = new Set(existingJobs.map(job => job.link.toLowerCase().trim()));
    const allLinks = new Set([...appliedLinks, ...existingLinks]);
    
    const cleanedExisting = existingJobs.filter(job => !appliedLinks.has(job.link.toLowerCase().trim()));
    const existingRemoved = existingJobs.length - cleanedExisting.length;
    
    const jobsToSave = jobs.filter(job => !allLinks.has(job.link.toLowerCase().trim()));
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
    if (newFilteredCount > 0) msgParts.push(`${newFilteredCount} nuevos filtrados`);
    if (existingRemoved > 0) msgParts.push(`${existingRemoved} ya aplicados removidos`);
    
    return { 
      success: true, 
      message: msgParts.length > 0
        ? `${jobsToSave.length} nuevos guardados (${msgParts.join(', ')}).`
        : `${jobsToSave.length} nuevos guardados.`,
      newSavedCount: jobsToSave.length,
      newFilteredCount: newFilteredCount,
      existingRemovedCount: existingRemoved
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    return { success: false, message: msg, newSavedCount: 0, newFilteredCount: 0, existingRemovedCount: 0 };
  }
};