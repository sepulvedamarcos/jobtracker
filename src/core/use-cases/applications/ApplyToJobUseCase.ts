// src/core/use-cases/applications/ApplyToJobUseCase.ts
import { IJobRepository } from '../../ports/IJobRepository.js';
import { Job, AppliedJob, ApplicationStatus } from '../../entities/Job.js';
import { JsonJobRepository } from '../../../infrastructure/storage/JsonJobRepository.js';

export interface ApplyToJobResult {
  success: boolean;
  message: string;
  application?: AppliedJob;
}

export const applyToJobUseCase = async (
  job: Job,
  notes?: string
): Promise<ApplyToJobResult> => {
  try {
    if (!job.link) {
      return { success: false, message: 'El job no tiene enlace.' };
    }

    const repository: IJobRepository = new JsonJobRepository();
    await repository.applyToJob(job, notes ?? '');

    const application: AppliedJob = {
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
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    return { success: false, message: msg };
  }
};