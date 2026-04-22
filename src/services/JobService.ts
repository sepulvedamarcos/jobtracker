import { IJobRepository } from '../domain/interfaces/IJobRepository.js';
import { Job } from '../domain/models/Job.js';

export class JobService {
  constructor(private repo: IJobRepository) {}

  async list(): Promise<Job[]> {
    return this.repo.findAll();
  }

  async get(id: string): Promise<Job | null> {
    return this.repo.findById(id);
  }

  async create(job: Job): Promise<void> {
    return this.repo.save(job);
  }

  async remove(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
