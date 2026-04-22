// src/core/use-cases/JobService.ts
import { IJobRepository } from '../ports/IJobRepository.js';
import { Job } from '../entities/Job.js';

export class JobService {
  // Recibe cualquier objeto que cumpla con la interfaz IJobRepository
  constructor(private jobRepository: IJobRepository) {}

  async fetchLastJobs(): Promise<Job[]> {
    // Aquí podrías agregar lógica de negocio (ej. filtrar por fecha)
    const jobs = await this.jobRepository.getLastScannedJobs();
    
    // Ejemplo de lógica DRY: Ordenar siempre por fecha de escaneo
    return jobs.sort((a, b) => 
      new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    );
  }

  async applyToJob(job: Job, notes?: string): Promise<void> {
    await this.jobRepository.applyToJob(job, notes);
  }
}
