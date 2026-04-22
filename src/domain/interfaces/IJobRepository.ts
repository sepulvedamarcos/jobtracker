import { Job } from '../models/Job.js';

export interface IJobRepository {
  findAll(): Promise<Job[]>;
  findById(id: string): Promise<Job | null>;
  save(job: Job): Promise<void>;
  delete(id: string): Promise<void>;
}
