import { IJobRepository } from '../core/ports/IJobRepository.js';
import { AppliedJob, Job } from '../core/entities/Job.js';

export class InMemoryJobRepository implements IJobRepository {
  saveScannedJobs(jobs: Job[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getLastScannedJobs(): Promise<Job[]> {
    throw new Error('Method not implemented.');
  }
  applyToJob(job: Job, notes?: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getAppliedJobs(): Promise<AppliedJob[]> {
    throw new Error('Method not implemented.');
  }
  deleteApplication(link: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  private items: Job[] = [];

  async findAll(): Promise<Job[]> {
    return this.items;
  }

  async findById(id: string): Promise<Job | null> {
    return this.items.find((i) => i.id === id) ?? null;
  }

  async save(job: Job): Promise<void> {
    const idx = this.items.findIndex((i) => i.id === job.id);
    if (idx >= 0) this.items[idx] = job;
    else this.items.push(job);
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((i) => i.id !== id);
  }
}
