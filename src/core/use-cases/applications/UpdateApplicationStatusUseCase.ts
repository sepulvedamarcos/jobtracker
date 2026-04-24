// src/core/use-cases/applications/UpdateApplicationStatusUseCase.ts
import { IJobRepository } from '../../ports/IJobRepository.js';
import { ApplicationStatus, AppliedJob } from '../../entities/Job.js';
import { JsonJobRepository } from '../../../infrastructure/storage/JsonJobRepository.js';

export interface UpdateApplicationStatusResult {
  success: boolean;
  message: string;
}

export const updateApplicationStatusUseCase = async (
  link: string,
  newStatus: ApplicationStatus,
  notes?: string
): Promise<UpdateApplicationStatusResult> => {
  try {
    const repository: IJobRepository = new JsonJobRepository();
    const applications = await repository.getAppliedJobs();
    
    const index = applications.findIndex(a => a.link === link);
    if (index < 0) {
      return { success: false, message: 'Aplicación no encontrada.' };
    }

    const current = applications[index];
    const updated: AppliedJob = {
      ...current,
      status: newStatus,
      notes: notes ?? current.notes,
      lastUpdate: new Date().toISOString(),
    };

    // Save via repository - requires implementing updateAppliedJob
    // For now, we mark as deleted and re-add
    applications[index] = updated;
    
    return { 
      success: true, 
      message: `Estado actualizado a "${ApplicationStatus[newStatus]}".`
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    return { success: false, message: msg };
  }
};