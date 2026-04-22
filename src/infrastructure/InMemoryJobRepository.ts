import { IJobRepository } from '../domain/interfaces/IJobRepository.js';
import { Job } from '../domain/models/Job.js';

export class InMemoryJobRepository implements IJobRepository {
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
